import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectEntity } from './project.entity';
import { S3Service } from '../s3/s3.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly repository: Repository<ProjectEntity>,
    private readonly s3Service: S3Service,
  ) {}

  async create(title: string, hideImgNames: boolean) {
    const [lastProject] = await this.repository.find({
      order: {
        sortOrder: 'DESC',
      },
      take: 1,
    });

    return this.repository.save({
      title,
      hideImgNames,
      imgPaths: [],
      sortOrder: (lastProject?.sortOrder ?? -1) + 1,
    });
  }

  findAll() {
    return this.repository.find({
      order: {
        sortOrder: 'ASC',
        updatedAt: 'DESC',
      },
    });
  }

  async findPublicPage() {
    const projects = await this.repository.find({
      order: {
        sortOrder: 'ASC',
        updatedAt: 'DESC',
      },
    });

    const items = await Promise.all(
      projects.map(async (project) => {
        const firstImage = project.imgPaths?.[0]
          ? await this.s3Service.createDownloadUrl(project.imgPaths[0])
          : null;

        return {
          id: project.id,
          title: project.title,
          createdAt: project.createdAt,
          updatedAt: project.updatedAt,
          firstImage,
        };
      }),
    );

    return {
      items,
    };
  }

  findOne(id: number) {
    return this.repository.findOneBy({ id });
  }

  async getImageUrls(id: number): Promise<string[]> {
    const project = await this.repository.findOneBy({ id });
    if (!project) {
      return [];
    }

    const urls = await Promise.all(
      project.imgPaths.map((key) => this.s3Service.createDownloadUrl(key)),
    );

    return urls.map((result) => result.url);
  }

  update(id: number, title: string, hideImgNames?: boolean) {
    return this.repository.update(id, { title, hideImgNames });
  }

  async addImage(id: number, key: string) {
    const project = await this.repository.findOneBy({ id });
    if (!project) return null;
    const newPaths = [...(project.imgPaths || []), key];
    return this.repository.update(id, { imgPaths: newPaths });
  }

  async removeImage(id: number, key: string) {
    const project = await this.repository.findOneBy({ id });
    if (!project) return null;
    const newPaths = project.imgPaths.filter((p) => p !== key);
    return this.repository.update(id, { imgPaths: newPaths });
  }

  async renameImage(id: number, oldKey: string, newKey: string) {
    const project = await this.repository.findOneBy({ id });
    if (!project) return null;

    const newPaths = project.imgPaths.map((p) => (p === oldKey ? newKey : p));

    await this.s3Service.rename(oldKey, newKey);

    return this.repository.update(id, { imgPaths: newPaths });
  }

  async changeOrder(projectIds: number[]) {
    await this.repository.manager.transaction(async (transactionalManager) => {
      for (const [index, id] of projectIds.entries()) {
        await transactionalManager.update(ProjectEntity, id, {
          sortOrder: index,
        });
      }
    });

    return { message: 'Projects order updated' };
  }

  async changeImagesOrder(id: number, imageKeys: string[]) {
    const project = await this.repository.findOneBy({ id });
    if (!project) return null;

    return this.repository.update(id, { imgPaths: imageKeys });
  }

  remove(id: number) {
    return this.repository.delete(id);
  }
}

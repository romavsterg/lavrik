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

  create(title: string) {
    return this.repository.save({
      title,
      imgPaths: [],
    });
  }

  findAll() {
    return this.repository.find({
      order: {
        updatedAt: 'DESC',
      },
    });
  }

  async findPublicPage(limit = 6, page = 1) {
    const skip = (page - 1) * limit;

    const [projects, total] = await this.repository.findAndCount({
      order: {
        updatedAt: 'DESC',
      },
      skip,
      take: limit,
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
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
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

  update(id: number, title: string) {
    return this.repository.update(id, { title });
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

  remove(id: number) {
    return this.repository.delete(id);
  }
}

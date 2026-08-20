import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ProjectsService } from './projects.service';

type ChangeOrderBody = {
  projectsIds: number[];
};

type ChangeImagesOrderBody = {
  imageKeys: string[];
};

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Body('title') title: string,
    @Body('hideImgNames') hideImgNames: boolean,
  ) {
    return this.projectsService.create(title, hideImgNames);
  }

  @Get()
  findPublic() {
    return this.projectsService.findPublicPage();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(Number(id));
  }

  @Get(':id/images')
  async getImageUrls(@Param('id') id: string) {
    const urls = await this.projectsService.getImageUrls(Number(id));
    return { urls };
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body('title') title: string,
    @Body('hideImgNames') hideImgNames?: boolean,
  ) {
    return this.projectsService.update(Number(id), title, hideImgNames);
  }

  @Post(':id/images')
  @UseGuards(AuthGuard)
  addImage(@Param('id') id: string, @Body('key') key: string) {
    return this.projectsService.addImage(Number(id), key);
  }

  @Post('change-order')
  @UseGuards(AuthGuard)
  changeOrder(@Body() body: ChangeOrderBody) {
    if (!body.projectsIds) {
      throw new BadRequestException('projectsIds is required');
    }

    return this.projectsService.changeOrder(body.projectsIds);
  }

  @Post(':id/images/change-order')
  @UseGuards(AuthGuard)
  changeImagesOrder(
    @Param('id') id: string,
    @Body() body: ChangeImagesOrderBody,
  ) {
    if (!body.imageKeys) {
      throw new BadRequestException('imageKeys is required');
    }

    return this.projectsService.changeImagesOrder(Number(id), body.imageKeys);
  }

  @Delete(':id/images')
  @UseGuards(AuthGuard)
  removeImage(@Param('id') id: string, @Body('key') key: string) {
    return this.projectsService.removeImage(Number(id), key);
  }

  @Put(':id/images')
  @UseGuards(AuthGuard)
  renameImage(
    @Param('id') id: string,
    @Body('oldKey') oldKey: string,
    @Body('newKey') newKey: string,
  ) {
    return this.projectsService.renameImage(Number(id), oldKey, newKey);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.projectsService.remove(Number(id));
  }
}

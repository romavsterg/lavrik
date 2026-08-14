import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body('title') title: string) {
    return this.projectsService.create(title);
  }

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get('public')
  findPublic(@Query('limit') limit?: string, @Query('page') page?: string) {
    const lim = limit ? Number(limit) : 6;
    const p = page ? Number(page) : 1;
    return this.projectsService.findPublicPage(lim, p);
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
  update(@Param('id') id: string, @Body('title') title: string) {
    return this.projectsService.update(Number(id), title);
  }

  @Post(':id/images')
  @UseGuards(AuthGuard)
  addImage(@Param('id') id: string, @Body('key') key: string) {
    return this.projectsService.addImage(Number(id), key);
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

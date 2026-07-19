import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';

import { S3Service } from './s3.service';
import { CreateUploadUrlDto, CreateDownloadUrlDto } from './s3.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('files')
@UseGuards(AuthGuard)
export class S3Controller {
  constructor(private readonly filesService: S3Service) {}

  @Post('upload-url')
  createUploadUrl(@Body() dto: CreateUploadUrlDto) {
    return this.filesService.createUploadUrl(dto.key, dto.contentType);
  }

  @Post('download-url')
  createDownloadUrl(@Body() dto: CreateDownloadUrlDto) {
    return this.filesService.createDownloadUrl(dto.key);
  }

  @Delete()
  delete(@Body('key') key: string) {
    return this.filesService.delete(key);
  }
}

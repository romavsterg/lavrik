import { IsString } from 'class-validator';

export class CreateUploadUrlDto {
  @IsString()
  key: string = '';

  @IsString()
  contentType: string = '';
}

export class CreateDownloadUrlDto {
  @IsString()
  key: string = '';
}

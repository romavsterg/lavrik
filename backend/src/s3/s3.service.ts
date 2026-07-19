import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private readonly bucket: string;

  constructor(
    @Inject('S3_CLIENT')
    private readonly s3: S3Client,

    private readonly config: ConfigService,
  ) {
    this.bucket = this.config.getOrThrow('S3_BUCKET');
  }

  async createUploadUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(this.s3, command, {
      expiresIn: 600,
    });

    return {
      key,
      url,
    };
  }

  async createDownloadUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const url = await getSignedUrl(this.s3, command, {
      expiresIn: 3600,
    });

    return {
      url,
    };
  }

  async delete(key: string) {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  async overwrite(key: string, buffer: Buffer, contentType: string) {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );
  }
}

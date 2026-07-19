import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

export const S3Provider: Provider = {
  provide: 'S3_CLIENT',

  inject: [ConfigService],

  useFactory: (config: ConfigService) =>
    new S3Client({
      endpoint: config.getOrThrow<string>('S3_ENDPOINT'),
      region: config.getOrThrow<string>('S3_REGION'),

      credentials: {
        accessKeyId: config.getOrThrow<string>('S3_ACCESS_KEY'),
        secretAccessKey: config.getOrThrow<string>('S3_SECRET_KEY'),
      },

      forcePathStyle: true,
    }),
};

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { S3Module } from './s3/s3.module';
import { join } from 'node:path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.SQLITE_PATH ?? 'db/database.sqlite',

      synchronize:
        process.env.NODE_ENV !== 'production' &&
        process.env.TYPEORM_SYNCHRONIZE !== 'false',

      migrationsRun: process.env.NODE_ENV === 'production',
      migrations: [join(__dirname, 'migrations/*{.ts,.js}')],

      autoLoadEntities: true,
    }),
    AuthModule,
    ProjectsModule,
    S3Module,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectEntity } from './project.entity';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { AuthModule } from 'src/auth/auth.module';
import { S3Module } from 'src/s3/s3.module';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectEntity]), AuthModule, S3Module],
  providers: [ProjectsService],
  controllers: [ProjectsController],
})
export class ProjectsModule {}

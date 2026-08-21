import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitProjectsTable1755780000000 implements MigrationInterface {
  name = 'InitProjectsTable1755780000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "project_entity" (
        "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
        "title" varchar NOT NULL,
        "hideImgNames" boolean NOT NULL,
        "imgPaths" text NOT NULL,
        "sortOrder" integer NOT NULL DEFAULT (0),
        "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
        "updatedAt" datetime NOT NULL DEFAULT (datetime('now'))
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "project_entity"');
  }
}

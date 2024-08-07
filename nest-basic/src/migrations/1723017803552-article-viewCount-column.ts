import { MigrationInterface, QueryRunner } from 'typeorm';

export class ArticleViewCountColumn1723017803552 implements MigrationInterface {
  name = 'ArticleViewCountColumn1723017803552';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`article\` ADD \`viewCount\` int NOT NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`article\` DROP COLUMN \`viewCount\``,
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class ShortUrl1723105021285 implements MigrationInterface {
  name = 'ShortUrl1723105021285';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`short_long_map\` (\`id\` int NOT NULL AUTO_INCREMENT, \`shortUrl\` varchar(255) NOT NULL, \`longUrl\` varchar(255) NOT NULL, \`createTime\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`short_url_code\` (\`id\` int NOT NULL AUTO_INCREMENT, \`code\` varchar(255) NOT NULL COMMENT '短链压缩码', \`status\` int NOT NULL COMMENT 'status 0:未使用，1:已使用' DEFAULT '0', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`short_url_code\``);
    await queryRunner.query(`DROP TABLE \`short_long_map\``);
  }
}

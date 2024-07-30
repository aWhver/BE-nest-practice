import { MigrationInterface, QueryRunner } from "typeorm";

export class ArticleTagsColumn1722337766177 implements MigrationInterface {
    name = 'ArticleTagsColumn1722337766177'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`article\` ADD \`tags\` varchar(255) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`article\` DROP COLUMN \`tags\``);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class UserAddColumnLogintype1724148048657 implements MigrationInterface {
    name = 'UserAddColumnLogintype1724148048657'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`loginType\` enum ('PASSWORD', 'GITHUB') NOT NULL COMMENT '登录类型 0: 账户密码; 1: github' DEFAULT 'PASSWORD'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`loginType\``);
    }

}

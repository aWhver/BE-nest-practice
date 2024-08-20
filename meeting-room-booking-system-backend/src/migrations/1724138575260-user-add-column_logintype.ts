import { MigrationInterface, QueryRunner } from "typeorm";

export class UserAddColumnLogintype1724138575260 implements MigrationInterface {
    name = 'UserAddColumnLogintype1724138575260'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` ADD \`loginType\` enum ('0', '1') NOT NULL COMMENT '登录类型 0: 账户密码; 1: github' DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user\` DROP COLUMN \`loginType\``);
    }

}

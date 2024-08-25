import { MigrationInterface, QueryRunner } from "typeorm";

export class FollowUser1724568894027 implements MigrationInterface {
    name = 'FollowUser1724568894027'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`article\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(30) NOT NULL, \`content\` text NOT NULL, \`createTime\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updateTime\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`tags\` varchar(255) NOT NULL, \`viewCount\` int NOT NULL DEFAULT '0', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`permission\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`permissionCode\` varchar(255) NOT NULL, \`createDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updateDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`username\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`createDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updateDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`role\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, \`createDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updateDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rabc_user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`username\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`createDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updateDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`follow_user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user-permission-relation\` (\`userId\` int NOT NULL, \`permissionId\` int NOT NULL, INDEX \`IDX_63fc3a810d9ef69f64e0d6a768\` (\`userId\`), INDEX \`IDX_387a9a3585595f97c9b8f52cf9\` (\`permissionId\`), PRIMARY KEY (\`userId\`, \`permissionId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`role-permission-relation\` (\`roleId\` int NOT NULL, \`permissionId\` int NOT NULL, INDEX \`IDX_2a1409f4ac7e9d348ab4a23940\` (\`roleId\`), INDEX \`IDX_cacc24dff9359e115bda962d25\` (\`permissionId\`), PRIMARY KEY (\`roleId\`, \`permissionId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`rabcuser-role-relation\` (\`rabcUserId\` int NOT NULL, \`roleId\` int NOT NULL, INDEX \`IDX_5fd4b3e0a8d507c337a416b86d\` (\`rabcUserId\`), INDEX \`IDX_744732ef991a64e23b8dfecb65\` (\`roleId\`), PRIMARY KEY (\`rabcUserId\`, \`roleId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`follow_user_followers_follow_user\` (\`followUserId_1\` int NOT NULL, \`followUserId_2\` int NOT NULL, INDEX \`IDX_f2e614544a816bf131527824d6\` (\`followUserId_1\`), INDEX \`IDX_386299343187dc5660c006a0e7\` (\`followUserId_2\`), PRIMARY KEY (\`followUserId_1\`, \`followUserId_2\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user-permission-relation\` ADD CONSTRAINT \`FK_63fc3a810d9ef69f64e0d6a7689\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`user-permission-relation\` ADD CONSTRAINT \`FK_387a9a3585595f97c9b8f52cf90\` FOREIGN KEY (\`permissionId\`) REFERENCES \`permission\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`role-permission-relation\` ADD CONSTRAINT \`FK_2a1409f4ac7e9d348ab4a239409\` FOREIGN KEY (\`roleId\`) REFERENCES \`role\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`role-permission-relation\` ADD CONSTRAINT \`FK_cacc24dff9359e115bda962d253\` FOREIGN KEY (\`permissionId\`) REFERENCES \`permission\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`rabcuser-role-relation\` ADD CONSTRAINT \`FK_5fd4b3e0a8d507c337a416b86db\` FOREIGN KEY (\`rabcUserId\`) REFERENCES \`rabc_user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`rabcuser-role-relation\` ADD CONSTRAINT \`FK_744732ef991a64e23b8dfecb653\` FOREIGN KEY (\`roleId\`) REFERENCES \`role\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`follow_user_followers_follow_user\` ADD CONSTRAINT \`FK_f2e614544a816bf131527824d6b\` FOREIGN KEY (\`followUserId_1\`) REFERENCES \`follow_user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`follow_user_followers_follow_user\` ADD CONSTRAINT \`FK_386299343187dc5660c006a0e7f\` FOREIGN KEY (\`followUserId_2\`) REFERENCES \`follow_user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`follow_user_followers_follow_user\` DROP FOREIGN KEY \`FK_386299343187dc5660c006a0e7f\``);
        await queryRunner.query(`ALTER TABLE \`follow_user_followers_follow_user\` DROP FOREIGN KEY \`FK_f2e614544a816bf131527824d6b\``);
        await queryRunner.query(`ALTER TABLE \`rabcuser-role-relation\` DROP FOREIGN KEY \`FK_744732ef991a64e23b8dfecb653\``);
        await queryRunner.query(`ALTER TABLE \`rabcuser-role-relation\` DROP FOREIGN KEY \`FK_5fd4b3e0a8d507c337a416b86db\``);
        await queryRunner.query(`ALTER TABLE \`role-permission-relation\` DROP FOREIGN KEY \`FK_cacc24dff9359e115bda962d253\``);
        await queryRunner.query(`ALTER TABLE \`role-permission-relation\` DROP FOREIGN KEY \`FK_2a1409f4ac7e9d348ab4a239409\``);
        await queryRunner.query(`ALTER TABLE \`user-permission-relation\` DROP FOREIGN KEY \`FK_387a9a3585595f97c9b8f52cf90\``);
        await queryRunner.query(`ALTER TABLE \`user-permission-relation\` DROP FOREIGN KEY \`FK_63fc3a810d9ef69f64e0d6a7689\``);
        await queryRunner.query(`DROP INDEX \`IDX_386299343187dc5660c006a0e7\` ON \`follow_user_followers_follow_user\``);
        await queryRunner.query(`DROP INDEX \`IDX_f2e614544a816bf131527824d6\` ON \`follow_user_followers_follow_user\``);
        await queryRunner.query(`DROP TABLE \`follow_user_followers_follow_user\``);
        await queryRunner.query(`DROP INDEX \`IDX_744732ef991a64e23b8dfecb65\` ON \`rabcuser-role-relation\``);
        await queryRunner.query(`DROP INDEX \`IDX_5fd4b3e0a8d507c337a416b86d\` ON \`rabcuser-role-relation\``);
        await queryRunner.query(`DROP TABLE \`rabcuser-role-relation\``);
        await queryRunner.query(`DROP INDEX \`IDX_cacc24dff9359e115bda962d25\` ON \`role-permission-relation\``);
        await queryRunner.query(`DROP INDEX \`IDX_2a1409f4ac7e9d348ab4a23940\` ON \`role-permission-relation\``);
        await queryRunner.query(`DROP TABLE \`role-permission-relation\``);
        await queryRunner.query(`DROP INDEX \`IDX_387a9a3585595f97c9b8f52cf9\` ON \`user-permission-relation\``);
        await queryRunner.query(`DROP INDEX \`IDX_63fc3a810d9ef69f64e0d6a768\` ON \`user-permission-relation\``);
        await queryRunner.query(`DROP TABLE \`user-permission-relation\``);
        await queryRunner.query(`DROP TABLE \`follow_user\``);
        await queryRunner.query(`DROP TABLE \`rabc_user\``);
        await queryRunner.query(`DROP TABLE \`role\``);
        await queryRunner.query(`DROP TABLE \`user\``);
        await queryRunner.query(`DROP TABLE \`permission\``);
        await queryRunner.query(`DROP TABLE \`article\``);
    }

}

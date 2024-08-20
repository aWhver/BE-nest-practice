import { MigrationInterface, QueryRunner } from 'typeorm';

export class ReInit1724131891410 implements MigrationInterface {
  name = 'ReInit1724131891410';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`permission\` (\`id\` int NOT NULL AUTO_INCREMENT, \`code\` varchar(20) NOT NULL COMMENT '权限代码', \`description\` varchar(100) NOT NULL COMMENT '权限描述', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`role\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`username\` varchar(50) NOT NULL, \`password\` varchar(70) NOT NULL, \`nickName\` varchar(255) NOT NULL DEFAULT '', \`email\` varchar(255) NOT NULL, \`headPic\` varchar(255) NOT NULL DEFAULT '', \`phoneNumber\` varchar(20) NULL, \`isFrozen\` tinyint NOT NULL COMMENT '账户是否被冻结' DEFAULT 0, \`isAdmin\` tinyint NOT NULL COMMENT '是否是管理员' DEFAULT 0, \`createTime\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updateTime\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`meeting_room\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL COMMENT '会议室名字', \`capacity\` int NOT NULL COMMENT '可容纳人数' DEFAULT '6', \`location\` varchar(50) NOT NULL COMMENT '会议室位置', \`equipment\` varchar(50) NOT NULL COMMENT '设备' DEFAULT '', \`description\` varchar(100) NOT NULL COMMENT '描述' DEFAULT '', \`isBooked\` tinyint NOT NULL COMMENT '是否被预订' DEFAULT 0, \`createTime\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`updateTime\` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_dfc2620658cc3beda12ae1068b\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`booking\` (\`id\` int NOT NULL AUTO_INCREMENT, \`startTime\` datetime NOT NULL COMMENT '开始时间', \`endTime\` datetime NOT NULL COMMENT '结束时间', \`status\` enum ('0', '1', '2', '3') NOT NULL COMMENT '状态（申请中、审批通过、审批驳回、取消）' DEFAULT '0', \`note\` varchar(100) NOT NULL COMMENT '备注' DEFAULT '', \`createTime\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updateTime\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NULL, \`meetingRoomId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`role_permissions\` (\`roleId\` int NOT NULL, \`permissionId\` int NOT NULL, INDEX \`IDX_b4599f8b8f548d35850afa2d12\` (\`roleId\`), INDEX \`IDX_06792d0c62ce6b0203c03643cd\` (\`permissionId\`), PRIMARY KEY (\`roleId\`, \`permissionId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user_roles\` (\`userId\` int NOT NULL, \`roleId\` int NOT NULL, INDEX \`IDX_472b25323af01488f1f66a06b6\` (\`userId\`), INDEX \`IDX_86033897c009fcca8b6505d6be\` (\`roleId\`), PRIMARY KEY (\`userId\`, \`roleId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`booking\` ADD CONSTRAINT \`FK_336b3f4a235460dc93645fbf222\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`booking\` ADD CONSTRAINT \`FK_03b2beec0de5cc949438c5424eb\` FOREIGN KEY (\`meetingRoomId\`) REFERENCES \`meeting_room\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_b4599f8b8f548d35850afa2d12c\` FOREIGN KEY (\`roleId\`) REFERENCES \`role\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` ADD CONSTRAINT \`FK_06792d0c62ce6b0203c03643cdd\` FOREIGN KEY (\`permissionId\`) REFERENCES \`permission\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_472b25323af01488f1f66a06b67\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` ADD CONSTRAINT \`FK_86033897c009fcca8b6505d6be2\` FOREIGN KEY (\`roleId\`) REFERENCES \`role\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_86033897c009fcca8b6505d6be2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user_roles\` DROP FOREIGN KEY \`FK_472b25323af01488f1f66a06b67\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_06792d0c62ce6b0203c03643cdd\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`role_permissions\` DROP FOREIGN KEY \`FK_b4599f8b8f548d35850afa2d12c\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`booking\` DROP FOREIGN KEY \`FK_03b2beec0de5cc949438c5424eb\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`booking\` DROP FOREIGN KEY \`FK_336b3f4a235460dc93645fbf222\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_86033897c009fcca8b6505d6be\` ON \`user_roles\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_472b25323af01488f1f66a06b6\` ON \`user_roles\``,
    );
    await queryRunner.query(`DROP TABLE \`user_roles\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_06792d0c62ce6b0203c03643cd\` ON \`role_permissions\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_b4599f8b8f548d35850afa2d12\` ON \`role_permissions\``,
    );
    await queryRunner.query(`DROP TABLE \`role_permissions\``);
    await queryRunner.query(`DROP TABLE \`booking\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_dfc2620658cc3beda12ae1068b\` ON \`meeting_room\``,
    );
    await queryRunner.query(`DROP TABLE \`meeting_room\``);
    await queryRunner.query(`DROP TABLE \`user\``);
    await queryRunner.query(`DROP TABLE \`role\``);
    await queryRunner.query(`DROP TABLE \`permission\``);
  }
}

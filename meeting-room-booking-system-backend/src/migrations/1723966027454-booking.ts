import { MigrationInterface, QueryRunner } from "typeorm";

export class Booking1723966027454 implements MigrationInterface {
    name = 'Booking1723966027454'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`booking\` (\`id\` int NOT NULL AUTO_INCREMENT, \`startTime\` datetime NOT NULL COMMENT '开始时间', \`endTime\` datetime NOT NULL COMMENT '结束时间', \`status\` enum ('0', '1', '2', '3') NOT NULL COMMENT '状态（申请中、审批通过、审批驳回、取消）' DEFAULT '0', \`note\` varchar(100) NOT NULL COMMENT '备注' DEFAULT '', \`createTime\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updateTime\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`userId\` int NULL, \`meetingRoomId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`meeting_room\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL COMMENT '会议室名字', \`capacity\` int NOT NULL COMMENT '可容纳人数' DEFAULT '6', \`location\` varchar(50) NOT NULL COMMENT '会议室位置', \`equipment\` varchar(50) NOT NULL COMMENT '设备' DEFAULT '', \`description\` varchar(100) NOT NULL COMMENT '描述' DEFAULT '', \`isBooked\` tinyint NOT NULL COMMENT '是否被预订' DEFAULT 0, \`createTime\` datetime(6) NOT NULL COMMENT '创建时间' DEFAULT CURRENT_TIMESTAMP(6), \`updateTime\` datetime(6) NOT NULL COMMENT '更新时间' DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_dfc2620658cc3beda12ae1068b\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`booking\` ADD CONSTRAINT \`FK_336b3f4a235460dc93645fbf222\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`booking\` ADD CONSTRAINT \`FK_03b2beec0de5cc949438c5424eb\` FOREIGN KEY (\`meetingRoomId\`) REFERENCES \`meeting_room\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`booking\` DROP FOREIGN KEY \`FK_03b2beec0de5cc949438c5424eb\``);
        await queryRunner.query(`ALTER TABLE \`booking\` DROP FOREIGN KEY \`FK_336b3f4a235460dc93645fbf222\``);
        await queryRunner.query(`DROP INDEX \`IDX_dfc2620658cc3beda12ae1068b\` ON \`meeting_room\``);
        await queryRunner.query(`DROP TABLE \`meeting_room\``);
        await queryRunner.query(`DROP TABLE \`booking\``);
    }

}

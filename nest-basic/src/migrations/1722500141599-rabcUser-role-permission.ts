import { MigrationInterface, QueryRunner } from 'typeorm';

export class RabcUserRolePermission1722500141599 implements MigrationInterface {
  name = 'RabcUserRolePermission1722500141599';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`role\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updateDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`rabc_user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`username\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`createDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updateDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`role-permission-relation\` (\`roleId\` int NOT NULL, \`permissionId\` int NOT NULL, INDEX \`IDX_2a1409f4ac7e9d348ab4a23940\` (\`roleId\`), INDEX \`IDX_cacc24dff9359e115bda962d25\` (\`permissionId\`), PRIMARY KEY (\`roleId\`, \`permissionId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`rabcuser-role-relation\` (\`rabcUserId\` int NOT NULL, \`roleId\` int NOT NULL, INDEX \`IDX_5fd4b3e0a8d507c337a416b86d\` (\`rabcUserId\`), INDEX \`IDX_744732ef991a64e23b8dfecb65\` (\`roleId\`), PRIMARY KEY (\`rabcUserId\`, \`roleId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role-permission-relation\` ADD CONSTRAINT \`FK_2a1409f4ac7e9d348ab4a239409\` FOREIGN KEY (\`roleId\`) REFERENCES \`role\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`role-permission-relation\` ADD CONSTRAINT \`FK_cacc24dff9359e115bda962d253\` FOREIGN KEY (\`permissionId\`) REFERENCES \`permission\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`rabcuser-role-relation\` ADD CONSTRAINT \`FK_5fd4b3e0a8d507c337a416b86db\` FOREIGN KEY (\`rabcUserId\`) REFERENCES \`rabc_user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`rabcuser-role-relation\` ADD CONSTRAINT \`FK_744732ef991a64e23b8dfecb653\` FOREIGN KEY (\`roleId\`) REFERENCES \`role\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`rabcuser-role-relation\` DROP FOREIGN KEY \`FK_744732ef991a64e23b8dfecb653\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`rabcuser-role-relation\` DROP FOREIGN KEY \`FK_5fd4b3e0a8d507c337a416b86db\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`role-permission-relation\` DROP FOREIGN KEY \`FK_cacc24dff9359e115bda962d253\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`role-permission-relation\` DROP FOREIGN KEY \`FK_2a1409f4ac7e9d348ab4a239409\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_744732ef991a64e23b8dfecb65\` ON \`rabcuser-role-relation\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_5fd4b3e0a8d507c337a416b86d\` ON \`rabcuser-role-relation\``,
    );
    await queryRunner.query(`DROP TABLE \`rabcuser-role-relation\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_cacc24dff9359e115bda962d25\` ON \`role-permission-relation\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_2a1409f4ac7e9d348ab4a23940\` ON \`role-permission-relation\``,
    );
    await queryRunner.query(`DROP TABLE \`role-permission-relation\``);
    await queryRunner.query(`DROP TABLE \`rabc_user\``);
    await queryRunner.query(`DROP TABLE \`role\``);
  }
}

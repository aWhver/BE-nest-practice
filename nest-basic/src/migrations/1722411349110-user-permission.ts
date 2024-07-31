import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserPermission1722411349110 implements MigrationInterface {
  name = 'UserPermission1722411349110';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`permission\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updateDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updateDate\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`user-permission-relation\` (\`userId\` int NOT NULL, \`permissionId\` int NOT NULL, INDEX \`IDX_63fc3a810d9ef69f64e0d6a768\` (\`userId\`), INDEX \`IDX_387a9a3585595f97c9b8f52cf9\` (\`permissionId\`), PRIMARY KEY (\`userId\`, \`permissionId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user-permission-relation\` ADD CONSTRAINT \`FK_63fc3a810d9ef69f64e0d6a7689\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`user-permission-relation\` ADD CONSTRAINT \`FK_387a9a3585595f97c9b8f52cf90\` FOREIGN KEY (\`permissionId\`) REFERENCES \`permission\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user-permission-relation\` DROP FOREIGN KEY \`FK_387a9a3585595f97c9b8f52cf90\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`user-permission-relation\` DROP FOREIGN KEY \`FK_63fc3a810d9ef69f64e0d6a7689\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_387a9a3585595f97c9b8f52cf9\` ON \`user-permission-relation\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_63fc3a810d9ef69f64e0d6a768\` ON \`user-permission-relation\``,
    );
    await queryRunner.query(`DROP TABLE \`user-permission-relation\``);
    await queryRunner.query(`DROP TABLE \`user\``);
    await queryRunner.query(`DROP TABLE \`permission\``);
  }
}

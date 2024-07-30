import { MigrationInterface, QueryRunner } from 'typeorm';

export class Data1722337347657 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO \`article\` (\`title\`, \`content\`) VALUES ('hkdgskg', '还款方式觉得好疯狂觉得还是客服还得上课就好'),('很多事打开就是', '能打开手机很多客户是咖啡还是客服回来')`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}

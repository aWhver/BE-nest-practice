import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService, ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { JwtModule } from '@nestjs/jwt';
import { WINSTON_MODULE_NEST_PROVIDER, WinstonLogger } from 'nest-winston';
import { CustomTypeOrmLogger } from '../../providers/typeorm-log.provide';
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        path.join(__dirname, '../../../../', `.env.stage.${process.env.STAGE}`),
      ],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService, WINSTON_MODULE_NEST_PROVIDER],
      imports: [ConfigModule],
      useFactory(configService: ConfigService, logger: WinstonLogger) {
        return {
          type: 'mysql',
          host: configService.get('DB_HOST'),
          port: configService.get('DB_PORT'),
          password: configService.get('DB_PASSWORD'),
          username: configService.get('DB_USERNAME'),
          database: configService.get('DB_DATABASE'),
          // 生成环境不开启这个选项（true），会造成数据丢失，因为改了数据库架构，
          // 表的修改需要手动控制，需要使用 migrations来控制，
          // typeorm 提供了 migration:create,generate,run,revert命令
          synchronize: true, // configService.get('DB_SYNC') === 'true',
          autoLoadEntities: true,
          logging: true,
          logger: new CustomTypeOrmLogger(logger),
          poolSize: 10,
          connectorPackage: 'mysql2',
          extra: {
            authPlugin: 'sha256_password',
          },
          timezone: 'Asia/Shanghai',
        };
      },
    }),
    JwtModule.registerAsync({
      global: true,
      useFactory(configService: ConfigService) {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '30m',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DbModule {}

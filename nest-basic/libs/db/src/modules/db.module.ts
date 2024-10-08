import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { algorithmSvcOpt } from '../config';

@Global()
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: 'tong',
      signOptions: {
        expiresIn: '10h',
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.stage.${process.env.STAGE}`, '.env.stage.default'],
      load: [algorithmSvcOpt],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
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
          synchronize: configService.get('DB_SYNC') === 'true',
          autoLoadEntities: true,
          // logging: true,
          poolSize: 10,
          connectorPackage: 'mysql2',
          extra: {
            authPlugin: 'sha256_password',
          },
        };
      },
    }),
  ],
})
export class DbModule {}

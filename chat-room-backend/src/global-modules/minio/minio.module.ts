import { Global, Module } from '@nestjs/common';
import { MINIO_CLIENT } from 'src/common/const';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { MinioService } from './minio.service';

@Global()
@Module({
  providers: [
    MinioService,
    {
      provide: MINIO_CLIENT,
      useFactory(configService: ConfigService) {
        return new Minio.Client({
          port: +configService.get('MINIO_PORT'),
          endPoint: configService.get('MINIO_ENDPOINT'),
          useSSL: false,
          secretKey: configService.get('MINIO_SECRETKEY'),
          accessKey: configService.get('MINIO_ACCESSKEY'),
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [MinioService],
})
export class MinioModule {}

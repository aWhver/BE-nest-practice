import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  // tranform为 true，参数对象会转换成 dto实例,需要配合 class-transformer、class-validator
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useStaticAssets(path.join(__dirname, '../uploads'), {
    prefix: '/uploads',
  });
  await app.listen(3103);
}
bootstrap();

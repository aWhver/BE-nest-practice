import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // tranform为 true，参数对象会转换成 dto实例,需要配合 class-transformer、class-validator
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(3103);
}
bootstrap();

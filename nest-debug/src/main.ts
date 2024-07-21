import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// 调试 nest 的几种方式，launch.json文件
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3101);
}
bootstrap();

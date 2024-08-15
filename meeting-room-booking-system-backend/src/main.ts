import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import metadata from './metadata';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  const config = new DocumentBuilder()
    .setTitle('会议室预定系统接口文档')
    .setDescription(
      '该系统分为４个模块，用户管理、会议室管理、预定管理、角色权限管理',
    )
    .setVersion('1.0')
    .build();
  await SwaggerModule.loadPluginMetadata(metadata);
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(new ValidationPipe());
  app.useStaticAssets('uploads', {
    prefix: '/uploads',
  });
  await app.listen(3105);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import metadata from './metadata';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  const configService = app.get(ConfigService);
  const config = new DocumentBuilder()
    .setTitle('聊天室接口文档')
    .setDescription('6大模块: 用户、好友、聊天室、聊天、收藏、好友请求')
    .setVersion('1.0.0')
    .build();
  await SwaggerModule.loadPluginMetadata(metadata);
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(+configService.get('SERVER_PORT'));
}
bootstrap();

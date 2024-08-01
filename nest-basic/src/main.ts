import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets('public', {
    prefix: '/static',
  });
  app.useGlobalPipes(new ValidationPipe());
  app.use(
    session({
      secret: 'tong',
      resave: false, // session不变的话不重新生成 cookie
      saveUninitialized: false, // 未登录时不生产一个 session
      cookie: {
        maxAge: 1000000,
      },
    }),
  );
  await app.listen(3102);
}
bootstrap();

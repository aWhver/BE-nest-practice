import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomDecoratorModule } from './custom-decorator/custom-decorator.module';
import { DynamicModuleModule } from './dynamic-module/dynamic-module.module';
import { MiddlewarePracticeModule } from './middleware-practice/middleware-practice.module';
import { InterceptorPracticeModule } from './interceptor-practice/interceptor-practice.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MulterUploadModule } from './multer-upload/multer-upload.module';
import { CityModule } from './city/city.module';
import { DbModule } from 'libs/db/src';
import { ArticleModule } from './article/article.module';
import { UserModule } from './user/user.module';
import { PermissionModule } from './permission/permission.module';
import { RedisModule } from './redis/redis.module';
import { RabcUserModule } from './rabc-user/rabc-user.module';
import { RoleModule } from './role/role.module';
import { ResponseInterceptor } from './common/interceptor';

@Module({
  imports: [
    DbModule,
    CustomDecoratorModule,
    // DynamicModuleModule.register({ name: 'zhao', age: 29, isGlobal: true }),
    DynamicModuleModule.forRoot({ name: 'zhao', age: 29, isGlobal: false }),
    MiddlewarePracticeModule,
    InterceptorPracticeModule,
    MulterUploadModule,
    CityModule,
    ArticleModule,
    UserModule,
    PermissionModule,
    RedisModule,
    RabcUserModule,
    RoleModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}

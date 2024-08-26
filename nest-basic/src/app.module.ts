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
import { DbModule, MicroServicesModule } from 'libs/db/src';
import { ArticleModule } from './article/article.module';
import { UserModule } from './user/user.module';
import { PermissionModule } from './permission/permission.module';
import { RedisModule } from './redis/redis.module';
import { RabcUserModule } from './rabc-user/rabc-user.module';
import { RoleModule } from './role/role.module';
import { ResponseInterceptor } from './common/interceptor';
import { NearbySearchModule } from './nearby-search/nearby-search.module';
import { TaskModule } from './task/task.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ShortUrlCodeModule } from './short-url-code/short-url-code.module';
import { ShortLongMapModule } from './short-long-map/short-long-map.module';
import { QrcodeLoginModule } from './qrcode-login/qrcode-login.module';
import { MocroServicesTestModule } from './mocro-services-test/mocro-services-test.module';
import { EtcdModule } from './etcd/etcd.module';
import { MinioModule } from './minio/minio.module';
import { FollowUserModule } from './follow-user/follow-user.module';
import { RankingModule } from './ranking/ranking.module';
import { WebsocketModule } from './websocket/websocket.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    DbModule,
    CustomDecoratorModule,
    // DynamicModuleModule.register({ name: 'zhao', age: 29, isGlobal: true }),
    DynamicModuleModule.forRoot({ name: 'zhao', age: 29, isGlobal: false }),
    MiddlewarePracticeModule,
    InterceptorPracticeModule,
    MulterUploadModule,
    CityModule,
    ShortUrlCodeModule,
    ShortLongMapModule,
    QrcodeLoginModule,
    MicroServicesModule,
    MocroServicesTestModule,
    EtcdModule,
    MinioModule,
    // 这几个模块需要起 redis服务或者 docker redis容器,练习其他的时候先注释掉
    RedisModule,
    RankingModule,
    WebsocketModule,
    /* FollowUserModule,
    ArticleModule,
    TaskModule,
    NearbySearchModule,
    UserModule,
    PermissionModule,
    RabcUserModule,
    RoleModule, */
    // 该模块需要启动 edct服务
    /* EtcdModule.forRoot({
      hosts: 'http://localhost:2379',
      auth: {
        username: 'root',
        password: '',
      },
    }), */
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

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from 'libs/src';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptor';
import { RedisModule } from './redis/redis.module';
import { EmailService } from './email/email.service';
import { EmailModule } from './email/email.module';

@Module({
  imports: [DbModule, UserModule, RoleModule, PermissionModule, RedisModule, EmailModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    EmailService,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule, LogModule } from './libs/src';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptor';
import { RedisModule } from './redis/redis.module';
import { EmailService } from './email/email.service';
import { EmailModule } from './email/email.module';
import { LoginGuard } from './common/guard/login.guard';
import { MeetingRoomsModule } from './meeting-rooms/meeting-rooms.module';
import { BookingModule } from './booking/booking.module';
import { StatisticModule } from './statistic/statistic.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    DbModule,
    LogModule,
    UserModule,
    RoleModule,
    PermissionModule,
    RedisModule,
    EmailModule,
    MeetingRoomsModule,
    BookingModule,
    StatisticModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: LoginGuard,
    },
    EmailService,
  ],
})
export class AppModule {}

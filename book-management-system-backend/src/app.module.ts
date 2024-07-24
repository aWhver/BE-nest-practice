import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { DbModuleModule } from './db-module/db-module.module';
import { BookModule } from './book/book.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResInterceptor } from './common/interceptor/resInterceptor';

@Module({
  imports: [UserModule, DbModuleModule, BookModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResInterceptor,
    },
  ],
})
export class AppModule {}

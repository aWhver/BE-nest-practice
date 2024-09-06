import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  PrismaModule,
  ConfigModule,
  RedisModule,
  EmailModule,
  MinioModule,
} from './global-modules';
import { UserModule } from './user/user.module';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './common/interceptor/response.interceptor';
import { CustomExceptionFilter } from './common/exception/index';
import { AuthGuard } from './common/guard/index';
import { FriendshipModule } from './friendship/friendship.module';
import { ChatroomModule } from './chatroom/chatroom.module';
import { ChatModule } from './chat/chat.module';
import { ChatHistoryModule } from './chat-history/chat-history.module';
import { FavoriteModule } from './favorite/favorite.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    RedisModule,
    EmailModule,
    MinioModule,
    UserModule,
    FriendshipModule,
    ChatroomModule,
    ChatModule,
    ChatHistoryModule,
    FavoriteModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: CustomExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}

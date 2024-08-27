import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule, ConfigModule, RedisModule } from './global-modules';
import { UserModule } from './user/user.module';

@Module({
  imports: [PrismaModule, ConfigModule, RedisModule, UserModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

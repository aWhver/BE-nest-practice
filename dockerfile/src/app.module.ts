import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { DbModuleModule } from './db-module/db-module.module';
import { createClient } from 'redis';

@Module({
  imports: [UserModule, DbModuleModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'REDIS_CLIENT',
      async useFactory() {
        const redis = createClient({
          socket: {
            port: 6379,
            host: '192.168.124.6',
          },
        });
        await redis.connect();
        return redis;
      },
    },
  ],
})
export class AppModule {}

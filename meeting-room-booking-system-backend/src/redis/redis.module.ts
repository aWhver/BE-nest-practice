import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { REDIS_CLIENT } from 'src/common/const';
import { createClient } from 'redis';

@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: REDIS_CLIENT,
      async useFactory() {
        const redisClient = createClient({
          socket: {
            port: 6379,
            host: 'localhost',
          },
          database: 1, // namaspace
        });
        await redisClient.connect();
        return redisClient;
      },
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}

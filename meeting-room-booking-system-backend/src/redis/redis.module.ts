import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { REDIS_CLIENT } from 'src/common/const';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: REDIS_CLIENT,
      async useFactory(configService: ConfigService) {
        const redisClient = createClient({
          socket: {
            port: configService.get('REDIS_SERVE_POSR'),
            host: configService.get('REDIS_SERVE_HOST'),
          },
          database: 1, // namaspace
        });
        await redisClient.connect();
        return redisClient;
      },
      inject: [ConfigService],
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}

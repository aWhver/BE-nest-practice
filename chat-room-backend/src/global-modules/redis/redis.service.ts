import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT_TOKEN } from '../../common/const';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  @Inject(REDIS_CLIENT_TOKEN)
  private redisClient: RedisClientType;

  async set(key: string, value: string, ttl?: number) {
    await this.redisClient.set(key, value);
    if (ttl) {
      await this.redisClient.expire(key, ttl);
    }
  }

  async get(key: string) {
    return this.redisClient.get(key);
  }

  async del(key: string) {
    await this.redisClient.del(key);
  }
}

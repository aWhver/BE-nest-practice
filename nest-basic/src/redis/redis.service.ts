import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;

  async hset(key: string, field: string, value: any) {
    await this.redisClient.hSet(key, field, value);
  }
  async hget(key: string, field: string) {
    return this.redisClient.hGet(key, field);
  }

  async listSet(key: string, value: string[], ttl?: number) {
    for (let i = 0; i < value.length; i++) {
      await this.redisClient.rPush(key, value[i]);
    }
    if (ttl) {
      await this.redisClient.expire(key, ttl);
    }
  }

  async listGet(key: string) {
    return this.redisClient.lRange(key, 0, -1);
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { REDIS_CLIENT } from 'src/common/const';

@Injectable()
export class RedisService {
  @Inject(REDIS_CLIENT)
  private redisClient: RedisClientType;

  async get(key: string) {
    return await this.redisClient.get(key);
  }

  async set(key: string, value: string | number, ttl?: number) {
    await this.redisClient.set(key, value);

    if (ttl) {
      await this.redisClient.expire(key, ttl);
    }
  }

  async hset(key: string, field: string, value: any, ttl?: number) {
    await this.redisClient.hSet(key, field, value);

    if (ttl) {
      await this.redisClient.expire(key, ttl);
    }
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

  async delete(key: string) {
    await this.redisClient.del(key);
  }
}

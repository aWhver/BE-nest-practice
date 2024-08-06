import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { REDIS_CLIENT } from 'src/common/const';
type GeoUnits = 'm' | 'km' | 'mi' | 'ft';
@Injectable()
export class RedisService {
  @Inject(REDIS_CLIENT)
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

  async geoAdd(
    key: string,
    posName: string,
    lg: number,
    lt: number,
    ttl?: number,
  ) {
    await this.redisClient.geoAdd(key, {
      longitude: lg,
      latitude: lt,
      member: posName,
    });
    if (ttl) {
      this.redisClient.expire(key, ttl);
    }
  }

  async geoPos(key: string, posName: string) {
    const res = await this.redisClient.geoPos(key, posName);

    return {
      longitude: res[0].longitude,
      latitude: res[0].latitude,
      name: posName,
    };
  }

  async geoList(key: string) {
    const positions = await this.redisClient.zRange(key, 0, -1);
    let res = [];
    await Promise.all(
      positions.map((position) => {
        return this.geoPos(key, position);
      }),
    ).then((resp) => {
      res = resp;
    });

    return res;
  }

  async geoSearch(
    key: string,
    coordinates: {
      longitude: number;
      latitude: number;
    },
    radius: number,
    unit: GeoUnits,
  ) {
    const positions = await this.redisClient.geoRadius(
      key,
      coordinates,
      radius,
      unit,
    );
    let res = [];
    await Promise.all(
      positions.map((position) => {
        return this.geoPos(key, position);
      }),
    ).then((resp) => {
      res = resp;
    });

    return res;
  }

  async geoDist(key: string, m1: string, m2: string, unit?: GeoUnits) {
    return this.redisClient.geoDist(key, m1, m2, unit || 'km');
  }
}

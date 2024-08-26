import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';
import { REDIS_CLIENT } from 'src/common/const';
type GeoUnits = 'm' | 'km' | 'mi' | 'ft';
@Injectable()
export class RedisService {
  @Inject(REDIS_CLIENT)
  private redisClient: RedisClientType;

  async keys(pattern) {
    return this.redisClient.keys(pattern);
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

  async sAdd(key: string, value: string[]) {
    value.length && this.redisClient.sAdd(key, value);
  }

  async sInterStore(key1: string, key2: string, key3: string) {
    return this.redisClient.sInterStore(key1, [key2, key3]);
  }

  async sIsMember(key: string, member) {
    this.redisClient.sIsMember(key, member);
  }

  async sMembers(key: string) {
    return this.redisClient.sMembers(key);
  }

  async zRanklist(key: string, start = 0, end = -1) {
    const ranklist = [];
    const members = await this.redisClient.zRange(key, start, end, {
      REV: true,
    });
    await Promise.all(
      members.map(async (member) => {
        ranklist.push({
          name: member,
          score: await this.zScore(key, member),
        });
      }),
    );
    return ranklist;
  }

  async zAdd(key: string, members: Record<string, number>) {
    const mems = [];
    for (const mkey in members) {
      mems.push({
        score: members[mkey],
        value: mkey,
      });
    }
    await this.redisClient.zAdd(key, mems);
  }

  async zScore(key: string, member: string) {
    return this.redisClient.zScore(key, member);
  }

  async zRank(key: string, member: string) {
    const count = await this.redisClient.zCard(key);
    const rank = await this.redisClient.zRank(key, member);
    return count - rank;
  }

  async zIncr(key: string, increment: number, member: string) {
    await this.redisClient.zIncrBy(key, increment, member);
  }

  async zUnion(key: string, keys?: string[]) {
    if (!keys || keys.length === 0) {
      return [];
    }
    if (keys.length === 1) {
      return this.zRanklist(keys[0]);
    }
    await this.redisClient.zUnionStore(key, keys);
    return this.zRanklist(key);
  }

  async isExist(key: string) {
    const ans = await this.redisClient.exists(key);
    return ans > 0;
  }
}

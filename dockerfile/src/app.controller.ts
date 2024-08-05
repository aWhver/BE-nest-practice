import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { RedisClientType } from 'redis';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Inject('REDIS_CLIENT')
  private redisClient: RedisClientType;

  @Get()
  async getHello(): Promise<string> {
    this.redisClient.set('name', 'juntong');
    console.log('keys', await this.redisClient.keys('*'));
    return this.appService.getHello();
  }
}

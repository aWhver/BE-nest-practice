import { Controller, Get, Inject, ParseIntPipe, Query } from '@nestjs/common';
import { formatTime } from 'src/common/utils';
import { RedisService } from 'src/redis/redis.service';

@Controller('ranking')
export class RankingController {
  @Inject(RedisService)
  private redisService: RedisService;

  @Get('join')
  async join(@Query('name') name: string) {
    await this.redisService.zAdd(this.getMonthKey(), {
      [name]: 0,
    });
  }

  @Get('month')
  monthRanking() {
    return this.redisService.zRanklist(this.getMonthKey());
  }

  @Get('year')
  async yearRanking() {
    const keys = await this.redisService.keys(
      `${formatTime(new Date(), 'Y')}-*-month-ranking`,
    );
    const yearKey = this.getYearKey();
    await this.redisService.zUnion(yearKey, keys);
    return this.redisService.zRanklist(yearKey);
  }

  @Get('increment')
  async incrementScore(
    @Query('name') name: string,
    @Query('score', ParseIntPipe) score: number,
  ) {
    this.redisService.zIncr(this.getMonthKey(), score, name);
    return 'increment done';
  }

  @Get()
  rank(@Query('name') name: string) {
    return this.redisService.zRank(this.getMonthKey(), name);
  }

  private getMonthKey() {
    const month = formatTime(new Date(), 'Y-M');
    return `${month}-month-ranking`;
  }

  private getYearKey() {
    const year = formatTime(new Date(), 'Y');
    return `${year}-year-ranking`;
  }
}

import { Controller, Get, Post, Body, Inject, Query } from '@nestjs/common';
import { AddPosDto, SearchDto } from './dto/create-nearby-search.dto';
import { RedisService } from 'src/redis/redis.service';

@Controller('nearbySearch')
export class NearbySearchController {
  @Inject(RedisService)
  private redisService: RedisService;

  @Post('add')
  geoAdd(@Body() addPosDto: AddPosDto) {
    this.redisService.geoAdd(
      'positions',
      addPosDto.posName,
      addPosDto.longitude,
      addPosDto.latitude,
    );
  }

  @Get('allPos')
  geoList() {
    return this.redisService.geoList('positions');
  }

  @Get('pos')
  geoPos(@Query('posName') posName: string) {
    return this.redisService.geoPos('positions', posName);
  }

  @Get('search')
  geoSearch(@Query() searchDto: SearchDto) {
    return this.redisService.geoSearch(
      'positions',
      {
        longitude: searchDto.longitude,
        latitude: searchDto.latitude,
      },
      searchDto.radius,
      searchDto.geoUnits || 'km',
    );
  }

  @Get('dist')
  geoDist(@Query('m1') m1: string, @Query('m2') m2: string) {
    return this.redisService.geoDist('positions', m1, m2);
  }
}

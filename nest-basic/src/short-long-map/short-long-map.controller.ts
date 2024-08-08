import { Controller, Get, Query } from '@nestjs/common';
import { ShortLongMapService } from './short-long-map.service';

@Controller('shortLongMap')
export class ShortLongMapController {
  constructor(private readonly shortLongMapService: ShortLongMapService) {}

  @Get()
  async convertLongUrl(@Query('longUrl') longUrl: string) {
    return this.shortLongMapService.convertLongUrl(longUrl);
  }
}

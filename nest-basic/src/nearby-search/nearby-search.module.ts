import { Module } from '@nestjs/common';
import { NearbySearchController } from './nearby-search.controller';

@Module({
  controllers: [NearbySearchController],
})
export class NearbySearchModule {}

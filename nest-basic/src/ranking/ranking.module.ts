import { Module } from '@nestjs/common';
import { RankingController } from './ranking.controller';

@Module({
  controllers: [RankingController],
})
export class RankingModule {}

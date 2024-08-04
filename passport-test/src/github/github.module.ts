import { Module } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';
import { GithubStrategy } from './github.strategy';

@Module({
  controllers: [GithubController],
  providers: [GithubService, GithubStrategy],
})
export class GithubModule {}

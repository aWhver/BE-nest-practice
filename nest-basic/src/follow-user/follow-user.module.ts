import { Module } from '@nestjs/common';
import { FollowUserService } from './follow-user.service';
import { FollowUserController } from './follow-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowUser } from './entities/follow-user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FollowUser])],
  controllers: [FollowUserController],
  providers: [FollowUserService],
})
export class FollowUserModule {}

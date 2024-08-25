import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Query,
} from '@nestjs/common';
import { FollowUserService } from './follow-user.service';
import { FollowUser } from './entities/follow-user.entity';
import { RedisService } from 'src/redis/redis.service';

function buildUser(name: string) {
  const u = new FollowUser();
  u.name = name;
  return u;
}

@Controller('followUser')
export class FollowUserController {
  constructor(private readonly followUserService: FollowUserService) {}

  @Inject(RedisService)
  private redisService: RedisService;

  @Get('init')
  async initData() {
    const u1 = buildUser('juntong');
    const u2 = buildUser('李特');
    const u3 = buildUser('钱多');
    const u4 = buildUser('孙武');
    const u5 = buildUser('吴用');

    await this.followUserService.save([u4, u5]);

    const u6 = buildUser('周六');
    u6.followers = [u1, u2, u3];
    u6.following = [u1, u4, u5];
    await this.followUserService.save([u6]);
    return 'success';
  }

  @Get('followRelationship')
  async findUserFollowRelationship(@Query('uid') uid: string) {
    const user = await this.followUserService.findUser(+uid);
    if (user.length === 0) {
      throw new BadRequestException('用户不存在');
    }
    console.dir(user, { depth: null });
    const followerKey = `follower: ${uid}`;
    const followingKey = `following: ${uid}`;
    const eachOtherFollowingKey = `each-other-following: ${uid}`;

    const eachOtherFollowing = await this.redisService.sMembers(
      eachOtherFollowingKey,
    );

    const result: Record<string, any> = {
      followers: user[0].followers,
      following: user[0].following,
    };
    console.log('eachOtherFollowing', eachOtherFollowing);
    if (eachOtherFollowing.length) {
      result.eachOtherFollowing = await this.followUserService.findUser(
        eachOtherFollowing.map(Number),
        [],
      );
    } else {
      const followerIds = user[0].followers.map((u) => u.id.toString());
      const followingIds = user[0].following.map((u) => u.id.toString());
      await this.redisService.sAdd(followerKey, followerIds);
      await this.redisService.sAdd(followingKey, followingIds);
      await this.redisService.sInterStore(
        eachOtherFollowingKey,
        followerKey,
        followingKey,
      );
      const eachOtherFollowingIds = await this.redisService.sMembers(
        eachOtherFollowingKey,
      );
      result.eachOtherFollowing = await this.followUserService.findUser(
        eachOtherFollowingIds.map(Number),
        [],
      );
    }

    return result;
  }

  // 关注别人
  @Get('follow')
  async follow(
    @Query('follower') follower: string,
    @Query('following') following: string,
  ) {
    const user = await this.followUserService.findUser(+follower);
    const followingUser = await this.followUserService.findUser(+following);
    const u1 = new FollowUser();
    const u2 = new FollowUser();
    u1.id = followingUser[0].id;
    // u1.id = followingUser[0].id;
    u2.id = user[0].id;
    // console.log('u1', u1);
    // console.log('u2', u2);
    user[0].following.push(u1);
    // followingUser[0].followers.push(u2);
    // return {
    //   user,
    //   followingUser,
    // };
    await this.followUserService.save([user[0]]);
    const followerKey = `follower: ${follower}`;
    const followingKey = `following: ${follower}`;
    const eachOtherFollowingKey = `each-other-following: ${follower}`;

    // const followingIds = user[0].following.map((u) => u.id.toString());
    await this.redisService.sAdd(followingKey, [following]);
    await this.redisService.sInterStore(
      eachOtherFollowingKey,
      followerKey,
      followingKey,
    );

    // 更新被关注者在 redis里的信息
    if (this.redisService.isExist(`each-other-following: ${following}`)) {
      const prev = await this.redisService.sMembers(`follower: ${following}`);
      this.redisService.sAdd(`follower: ${following}`, [...prev, follower]);
      this.redisService.sInterStore(
        `each-other-following: ${following}`,
        `follower: ${following}`,
        `following: ${following}`,
      );
    }

    return 'follow successfully';
  }
}

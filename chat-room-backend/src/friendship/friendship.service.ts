import { Inject, Injectable } from '@nestjs/common';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { PrismaService } from 'src/global-modules/prisma/prisma.service';
import { Prisma, $Enums } from '@prisma/client';

@Injectable()
export class FriendshipService {
  @Inject(PrismaService)
  private prismaServie: PrismaService;

  create(createFriendshipDto: Prisma.friendRequestCreateInput) {
    return this.prismaServie.friendRequest.create({
      data: createFriendshipDto,
    });
  }

  updateStatus(id: number, status: $Enums.FriendRequestStatus) {
    return this.prismaServie.friendRequest.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }

  async createFriendShip(friendId: number, userId: number) {
    const res = await this.prismaServie.friendship.findMany({
      where: {
        userId: userId,
        friendId: friendId,
      },
    });
    console.log('res', res);
    if (res.length === 0) {
      await this.prismaServie.friendship.create({
        data: {
          userId,
          friendId,
        },
      });
    }

    return '添加成功';
  }

  delete(friendId: number, userId: number) {
    console.log('friendId', friendId);
    console.log('userId', userId);
    return this.prismaServie.friendship.deleteMany({
      where: {
        OR: [
          {
            friendId,
            userId,
          },
          {
            friendId: userId,
            userId: friendId,
          },
        ],
      },
    });
  }

  getList(userId: number) {
    return this.prismaServie.friendRequest.findMany({
      where: {
        toUserId: userId,
      },
    });
  }

  async getFriendShip(userId: number, nickName: string) {
    const friendships = await this.prismaServie.friendship.findMany({
      where: {
        OR: [
          {
            userId,
          },
          {
            friendId: userId,
          },
        ],
      },
    });
    const set = new Set<number>();
    friendships.forEach((item) => {
      set.add(item.friendId);
      set.add(item.userId);
    });

    const friendIds = [...set].filter((item) => item !== userId);
    const friends = await this.prismaServie.user.findMany({
      where: {
        id: {
          in: friendIds,
        },
      },
      select: {
        id: true,
        nickName: true,
        email: true,
        headPic: true,
        username: true,
      },
    });
    return friends.filter((friend) => friend.nickName.includes(nickName));
  }
}

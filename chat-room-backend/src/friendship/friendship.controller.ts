import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { ApiTags } from '@nestjs/swagger';
import { UserInfo } from 'src/common/decorator';
import { $Enums } from '@prisma/client';
import { FriendshipRequestVo } from './vo/friendship.vo';

@ApiTags('好友')
@Controller('friendship')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  /** 添加好友 */
  @Post('add')
  async create(
    @Body() createFriendshipDto: CreateFriendshipDto,
    @UserInfo('userId') userId: number,
  ) {
    const { toUsername, reason } = createFriendshipDto;
    const user = await this.friendshipService.findUserUnique(toUsername);
    if (user.id === userId) {
      throw new BadRequestException('不能添加自己为好友');
    }
    const isInverseFriendship =
      await this.friendshipService.getFriendshipEachOhter(user.id, userId);
    if (isInverseFriendship) {
      throw new BadRequestException('你们已经是好友了');
    }
    await this.friendshipService.create({
      fromUserId: userId,
      toUserId: user.id,
      reason,
    });
    return '发送请求成功';
  }

  /** 同意添加好友 */
  @Post('approved/:id')
  async approved(@Param('id') id: string) {
    const friendRequest = await this.friendshipService.updateStatus(
      +id,
      $Enums.FriendRequestStatus.approved,
    );
    // console.log('friendRequest', friendRequest);
    await this.friendshipService.createFriendShip(
      friendRequest.fromUserId,
      friendRequest.toUserId,
    );
    return '添加好友成功';
  }

  /** 拒绝添加好友 */
  @Post('rejected/:id')
  async rejected(@Param('id') id: string) {
    await this.friendshipService.updateStatus(
      +id,
      $Enums.FriendRequestStatus.rejected,
    );
    return '已拒绝对方的添加好友申请';
  }

  /** 删除好友 */
  @Post('delete/:id')
  async delete(
    @Param('id') friendId: string,
    @UserInfo('userId') userId: number,
  ) {
    await this.friendshipService.delete(+friendId, userId);
    return '删除成功';
  }

  /** 个人的收到/发出的请求列表 */
  @Get('request/list')
  async requestList(@UserInfo('userId') userId: number) {
    const list = await this.friendshipService.getList(userId);
    const fromMeIds = [];
    const toMeIds = [];
    const group = list.reduce(
      (accu, cur) => {
        if (cur.fromUserId === userId) {
          // 同一id可能有多个请求，比如第一次拒绝了，再次向其发起好友申请
          if (accu.fromMe[cur.toUserId]) {
            accu.fromMe[cur.toUserId] = [].concat(
              accu.fromMe[cur.toUserId],
              cur,
            );
          } else {
            accu.fromMe[cur.toUserId] = [cur];
          }
          fromMeIds.push(cur.toUserId);
        } else {
          if (accu.toMe[cur.fromUserId]) {
            accu.toMe[cur.fromUserId] = [].concat(
              accu.toMe[cur.fromUserId],
              cur,
            );
          } else {
            accu.toMe[cur.fromUserId] = [cur];
          }
          toMeIds.push(cur.fromUserId);
        }
        return accu;
      },
      {
        toMe: {},
        fromMe: {},
      },
    );
    const fromMeUsers = await this.friendshipService.findUsers([
      ...new Set(fromMeIds),
    ]);
    const toMeUsers = await this.friendshipService.findUsers([
      ...new Set(toMeIds),
    ]);
    const fromMe = [];
    const toMe = [];
    fromMeUsers.forEach((fromMeUser) => {
      group.fromMe[fromMeUser.id].forEach((item) => {
        fromMe.push({
          ...item,
          nickName: fromMeUser.nickName,
          headPic: fromMeUser.headPic,
        });
      });
    });
    toMeUsers.forEach((toMeUser) => {
      group.toMe[toMeUser.id].forEach((item) => {
        toMe.push({
          ...item,
          nickName: toMeUser.nickName,
          headPic: toMeUser.headPic,
        });
      });
    });
    const friendshipRequestVo = new FriendshipRequestVo();
    friendshipRequestVo.toMe = toMe;
    friendshipRequestVo.fromMe = fromMe;

    return friendshipRequestVo;
  }

  /** 获取好友列表 */
  @Get('list')
  friendshipList(
    @UserInfo('userId') userId: number,
    @Query('nickName') nickName?: string,
  ) {
    return this.friendshipService.getFriendShip(userId, nickName || '');
  }
}

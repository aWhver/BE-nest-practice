import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { CreateFriendshipDto } from './dto/create-friendship.dto';
import { ApiTags } from '@nestjs/swagger';
import { UserInfo } from 'src/common/decorator';
import { $Enums } from '@prisma/client';

@ApiTags('好友')
@Controller('friendship')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  /** 添加好友 */
  @Post('add')
  create(@Body() createFriendshipDto: CreateFriendshipDto) {
    return this.friendshipService.create(createFriendshipDto);
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
  @Delete('delete/:id')
  async delete(
    @Param('id') friendId: string,
    @UserInfo('userId') userId: number,
  ) {
    await this.friendshipService.delete(+friendId, userId);
    return '删除成功';
  }

  /** 个人的收到的请求列表 */
  @Get('request/list')
  requestList(@UserInfo('userId') userId: number) {
    return this.friendshipService.getList(userId);
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

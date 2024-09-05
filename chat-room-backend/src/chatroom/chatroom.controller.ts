import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Inject,
} from '@nestjs/common';
import { ChatroomService } from './chatroom.service';
import { UserInfo } from 'src/common/decorator';
import { ApiTags } from '@nestjs/swagger';
import { RedisService } from 'src/global-modules/redis/redis.service';
import { ChatroomType } from '@prisma/client';

class ListDto {
  type?: ChatroomType;
}

@ApiTags('聊天室')
@Controller('chatroom')
export class ChatroomController {
  constructor(private readonly chatroomService: ChatroomService) {}

  @Inject(RedisService)
  private redisService: RedisService;

  /** 创建一对一聊天 */
  @Post('oneToOne/:id')
  async create(
    @Param('id') friendId: string,
    @UserInfo('userId') userId: number,
  ) {
    const chatroom = await this.chatroomService.checkChatroom(
      +friendId,
      userId,
    );
    if (chatroom) {
      return chatroom.id;
    }
    const res = await this.chatroomService.create(+friendId, userId);
    await this.redisService.set(`chatroom_${res.id}`, res.id.toString());
    return res.id;
  }

  /** 创建群聊 */
  @Post('group')
  async createGroup(
    @Body('name') name: string,
    @UserInfo('userId') userId: number,
  ) {
    const res = await this.chatroomService.createGroup(name, userId);
    return res;
  }

  /**
   * 获取当前用户所有的聊天室
   */
  @Get('list')
  getChatRooms(@UserInfo('userId') userId: number, @Query() listDto: ListDto) {
    return this.chatroomService.findAll(userId, listDto.type);
  }

  /** 查找聊天室成员 */
  @Get('members')
  getMembers(@Query('chatroomId') chatroomId: string) {
    return this.chatroomService.findMembers(+chatroomId);
  }

  /** 获取聊天室信息 */
  @Get('info/:chatroomId')
  getChatroomInfo(@Param('chatroomId') chatroomId: string) {
    return this.chatroomService.findChatroomInfo(+chatroomId);
  }

  /** 加入群聊 */
  @Post('join/:chatroomId')
  joinGroup(
    @Param('chatroomId') chatroomId: string,
    @Body('userId') userId: string,
  ) {
    return this.chatroomService.joinGroup(+chatroomId, +userId);
  }

  /** 退出/踢出群聊 */
  @Post('quit/:chatroomId')
  quitGroup(
    @Param('chatroomId') chatroomId: string,
    @Body('userId') userId: string,
  ) {
    return this.chatroomService.quitGroup(+chatroomId, +userId);
  }

  /** 解散群聊 */
  @Post('disband/:chatroomId')
  async disbandGroup(@Param('chatroomId') chatroomId: string) {
    const res = await this.chatroomService.disbandGroup(+chatroomId);
    await this.redisService.del(`chatroom_${res.id}`);
    return '解散群聊成功';
  }
}

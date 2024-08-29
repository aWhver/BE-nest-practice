import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ChatroomService } from './chatroom.service';
import { UserInfo } from 'src/common/decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('聊天室')
@Controller('chatroom')
export class ChatroomController {
  constructor(private readonly chatroomService: ChatroomService) {}

  /** 创建一对一聊天 */
  @Post('oneToOne/:id')
  create(@Param('id') friendId: string, @UserInfo('userId') userId: number) {
    return this.chatroomService.create(+friendId, userId);
  }

  /** 创建群聊 */
  @Post('group')
  createGroup(@Body('name') name: string, @UserInfo('userId') userId: number) {
    return this.chatroomService.createGroup(name, userId);
  }

  /**
   * 获取当前用户所有的聊天室
   */
  @Get('list')
  getChatRooms(@UserInfo('userId') userId: number) {
    return this.chatroomService.findAll(userId);
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
    @Query('userId') userId: string,
  ) {
    return this.chatroomService.joinGroup(+chatroomId, +userId);
  }

  /** 退出群聊 */
  @Post('quit/:chatroomId')
  quitGroup(
    @Param('chatroomId') chatroomId: string,
    @Query('userId') userId: string,
  ) {
    return this.chatroomService.quitGroup(+chatroomId, +userId);
  }

  /** 解散群聊 */
  @Post('disband/:chatroomId')
  disbandGroup(@Param('chatroomId') chatroomId: string) {
    return this.chatroomService.disbandGroup(+chatroomId);
  }
}

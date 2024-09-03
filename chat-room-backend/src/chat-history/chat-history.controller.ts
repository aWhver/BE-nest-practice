import { Controller, Get, Query } from '@nestjs/common';
import { ChatHistoryService } from './chat-history.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('聊天记录')
@Controller('chatHistory')
export class ChatHistoryController {
  constructor(private readonly chatHistoryService: ChatHistoryService) {}

  /** 获取聊天室信息 */
  @Get('list')
  addRecord(@Query('chatroomId') chatroomId: string) {
    return this.chatHistoryService.getList(+chatroomId);
  }
}

import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Socket, Server } from 'socket.io';
import { BadRequestException, Inject } from '@nestjs/common';
import { ChatHistoryService } from 'src/chat-history/chat-history.service';
import { PrismaService } from 'src/global-modules/prisma/prisma.service';
import { RedisService } from 'src/global-modules/redis/redis.service';

interface JoinRoomPayload {
  chatroomId: number;
  userId: number;
  nickName: string;
}

interface SendMessagePayload {
  message: {
    type: 'text' | 'image' | 'file';
    content: string;
  };
  sendUserId: number;
  chatroomId: number;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer() server: Server;

  @Inject(ChatHistoryService)
  private chatHistoryService: ChatHistoryService;

  @Inject(PrismaService)
  private prismaService: PrismaService;

  @Inject(RedisService)
  private redisService: RedisService;

  @SubscribeMessage('joinRoom')
  async joinRoom(client: Socket, joinRoomPayload: JoinRoomPayload) {
    const chatroomId = joinRoomPayload.chatroomId.toString();
    const chatRoom = await this.prismaService.chatroom.findUnique({
      where: {
        id: joinRoomPayload.chatroomId,
      },
    });
    if (!chatRoom) {
      return;
    }
    const id = await this.redisService.get(
      `chatroom_${joinRoomPayload.chatroomId}`,
    );
    if (!id) {
      await this.redisService.set(
        `chatroom_${joinRoomPayload.chatroomId}`,
        joinRoomPayload.chatroomId.toString(),
      );
    }
    client.join(chatroomId);
    const isExist = await this.prismaService.userChatroom.findFirst({
      where: {
        chatroomId: +chatroomId,
        userId: joinRoomPayload.userId,
      },
    });
    if (!isExist) {
      this.server.to(chatroomId).emit('message', {
        type: 'joinRoom',
        userId: joinRoomPayload.userId,
        nickName: joinRoomPayload.nickName,
      });
    }
  }

  @SubscribeMessage('sendMseeage')
  async sendMessage(@MessageBody() sendMessagePayload: SendMessagePayload) {
    const chatroomId = sendMessagePayload.chatroomId.toString();
    const isExist = await this.redisService.get(
      `chatroom_${sendMessagePayload.chatroomId}`,
    );
    if (!isExist) {
      this.server.to(chatroomId).emit('error', '该群聊已解散');
      return;
    }
    await this.chatHistoryService.add({
      chatroomId: sendMessagePayload.chatroomId,
      sendUserId: sendMessagePayload.sendUserId,
      content: sendMessagePayload.message.content,
      type: sendMessagePayload.message.type,
    });
    this.server.to(chatroomId).emit('message', {
      type: 'sendMessage',
      userId: sendMessagePayload.sendUserId,
      message: sendMessagePayload.message,
    });
  }
}

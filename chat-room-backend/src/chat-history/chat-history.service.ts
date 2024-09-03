import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/global-modules/prisma/prisma.service';
import { AddHistoryDto } from './dto/chat-history.dto';

@Injectable()
export class ChatHistoryService {
  @Inject(PrismaService)
  private prismaServie: PrismaService;

  async getList(chatroomId: number) {
    const messages = await this.prismaServie.chatHistory.findMany({
      where: {
        chatroomId,
      },
    });
    const sendUserIds = messages.map((message) => message.sendUserId);
    const sendUsers = await this.prismaServie.user.findMany({
      where: {
        id: { in: sendUserIds },
      },
      select: {
        id: true,
        headPic: true,
        nickName: true,
      },
    });
    const sendUserObj: Record<
      string,
      {
        id: number;
        nickName: string;
        headPic: string;
      }
    > = {};
    sendUsers.forEach((sendUser) => {
      sendUserObj[sendUser.id] = sendUser;
    });

    return {
      messages,
      sendUserObj,
    };
  }

  async add(addHistoryDto: AddHistoryDto) {
    await this.prismaServie.chatHistory.create({
      data: addHistoryDto,
    });
    return 'success';
  }
}

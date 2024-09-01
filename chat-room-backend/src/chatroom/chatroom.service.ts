import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ChatroomType } from '@prisma/client';
import { PrismaService } from 'src/global-modules/prisma/prisma.service';

@Injectable()
export class ChatroomService {
  @Inject(PrismaService)
  private prismaService: PrismaService;

  async create(friendId: number, userId: number) {
    const friend = await this.prismaService.user.findUnique({
      where: {
        id: friendId,
      },
    });
    return this.prismaService.chatroom.create({
      data: {
        name: friend.nickName,
        users: {
          create: [
            {
              user: {
                connect: {
                  id: friendId,
                },
              },
            },
            {
              user: {
                connect: {
                  id: userId,
                },
              },
            },
          ],
        },
      },
    });
  }

  createGroup(name: string, userId: number) {
    return this.prismaService.chatroom.create({
      data: {
        name,
        type: ChatroomType.group,
        users: {
          create: [
            {
              user: {
                connect: {
                  id: userId,
                },
              },
            },
          ],
        },
      },
    });
  }

  // 这里的查询和下面的查看群聊成员是两种方式，分别使用下
  async findAll(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        chatrooms: true,
      },
    });
    const chatroomIds = user.chatrooms.map((item) => item.chatroomId);
    const res = await this.prismaService.chatroom.findMany({
      where: {
        id: {
          in: chatroomIds,
        },
      },
      include: {
        users: true,
      },
    });
    return res.map((item) => {
      const { users, ...rest } = item;
      return {
        ...rest,
        userCount: users.length,
      };
    });
  }

  async findMembers(chatroomId: number) {
    const chatroom = await this.prismaService.chatroom.findUnique({
      where: {
        id: chatroomId,
      },
      include: {
        users: {
          select: {
            user: true,
          },
        },
      },
    });
    if (!chatroom) {
      throw new BadRequestException('该群聊不存在');
    }
    return chatroom.users.map((item) => {
      const { password, ...rest } = item.user;
      return rest;
    });
  }

  async findChatroomInfo(chatroomId: number) {
    const chatroom = await this.prismaService.chatroom.findUnique({
      where: {
        id: chatroomId,
      },
      // include: {
      //   users: {
      //     select: {
      //       user: true,
      //     },
      //   },
      // },
    });

    return { ...chatroom, users: await this.findMembers(chatroomId) };
  }

  async joinGroup(chatroomId: number, userId: number) {
    await this.prismaService.chatroom.update({
      where: {
        id: chatroomId,
      },
      data: {
        users: {
          create: {
            userId,
          },
        },
      },
    });
    return '加入成功';
  }

  async quitGroup(chatroomId: number, userId: number) {
    await this.prismaService.userChatroom.delete({
      where: {
        userId_chatroomId: {
          userId,
          chatroomId,
        },
      },
    });

    return '退出成功';
  }

  async disbandGroup(chatroomId: number) {
    const members = await this.findMembers(chatroomId);
    const userIds = members.map((member) => member.id);
    await this.prismaService.userChatroom.deleteMany({
      where: {
        userId: {
          in: userIds,
        },
        chatroomId,
      },
    });
    await this.prismaService.chatroom.delete({
      where: {
        id: chatroomId,
      },
    });
    return '解散群聊成功';
  }
}
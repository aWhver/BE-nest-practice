import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/global-modules/prisma/prisma.service';
import { AddFavoriteDto } from './dto/favorite.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class FavoriteService {
  @Inject(PrismaService)
  private prismaService: PrismaService;

  findPersonalList(userId: number) {
    return this.prismaService.favorite.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        type: true,
        createTime: true,
        content: true,
        chatHistories: {
          select: {
            chatHistory: true,
          },
        },
      },
      orderBy: {
        createTime: 'desc',
      },
    });
  }

  async addFavorite(addFavoriteDto: AddFavoriteDto, userId: number) {
    const data: Prisma.XOR<
      Prisma.favoriteCreateInput,
      Prisma.favoriteUncheckedCreateInput
    > = { userId, type: addFavoriteDto.type };
    if (addFavoriteDto.content) {
      data.content = addFavoriteDto.content;
    }
    if (addFavoriteDto.chatHistoryIds) {
      data.chatHistories = {
        create: addFavoriteDto.chatHistoryIds.map((chatHistoryId) => ({
          chatHistory: {
            connect: {
              id: chatHistoryId,
            },
          },
        })),
      };
    }
    await this.prismaService.favorite.create({
      data,
    });
    return '收藏成功';
  }
  async delFavorite(id: number) {
    const favorite = await this.prismaService.favorite.findUnique({
      where: { id },
      include: {
        chatHistories: true,
      },
    });
    if (favorite.chatHistories.length) {
      await this.prismaService.favoriteChatHistory.deleteMany({
        where: {
          id: {
            in: favorite.chatHistories.map((chatHistory) => chatHistory.id),
          },
        },
      });
    }
    await this.prismaService.favorite.delete({
      where: {
        id,
      },
    });
    return '删除成功';
  }

  async findFavoriteById(id: number) {
    const favorite = await this.prismaService.favorite.findUnique({
      where: { id },
      select: {
        id: true,
        chatHistories: {
          select: {
            chatHistory: {
              select: {
                sendUserId: true,
                id: true,
                type: true,
                content: true,
                createTime: true,
              },
            },
          },
          orderBy: {
            chatHistoryId: 'asc',
          },
        },
      },
    });
    const userIds = favorite.chatHistories.map(
      (chatHistory) => chatHistory.chatHistory.sendUserId,
    );
    const users = await this.prismaService.user.findMany({
      where: {
        id: { in: userIds },
      },
      select: {
        id: true,
        headPic: true,
        nickName: true,
      },
    });
    const userMap = users.reduce((accr, cur) => {
      accr[cur.id] = cur;
      return accr;
    }, {});
    return favorite.chatHistories.map((chatHistory) => {
      const user = userMap[chatHistory.chatHistory.sendUserId];
      return {
        ...chatHistory.chatHistory,
        headPic: user.headPic,
        nickName: user.nickName,
      };
    });
  }
}

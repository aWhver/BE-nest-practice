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
          orderBy: {
            chatHistoryId: 'asc',
          },
        },
      },
    });
  }

  addFavorite(addFavoriteDto: AddFavoriteDto, userId: number) {
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
    return this.prismaService.favorite.create({
      data,
    });
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
}

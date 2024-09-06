import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { UserInfo } from 'src/common/decorator';
import { AddFavoriteDto } from './dto/favorite.dto';
import { ApiTags } from '@nestjs/swagger';
import { FavoriteItemVo } from './vo/favorite.vo';

type a = number[];

@ApiTags('收藏')
@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  /** 收藏列表 */
  @Get('list')
  async getList(@UserInfo('userId') userId: number) {
    const res = await this.favoriteService.findPersonalList(userId);
    const list: FavoriteItemVo[] = res.map((item) => ({
      ...item,
      chatHistories: item.chatHistories.map((o) => o.chatHistory),
    }));
    return list;
  }

  /** 添加收藏 */
  @Post('add')
  addFavorite(
    @Body() addFavoriteDto: AddFavoriteDto,
    @UserInfo('userId') userId: number,
  ) {
    return this.favoriteService.addFavorite(addFavoriteDto, userId);
  }

  /** 删除收藏 */
  @Post('delete/:id')
  delFavorite(@Param('id') id: string) {
    return this.favoriteService.delFavorite(+id);
  }
}

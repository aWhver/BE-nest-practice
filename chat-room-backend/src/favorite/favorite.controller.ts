import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { UserInfo } from 'src/common/decorator';
import { AddFavoriteDto } from './dto/favorite.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('收藏')
@Controller('favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  /** 收藏列表 */
  @Get('list')
  getList(@UserInfo('userId') userId: number) {
    return this.favoriteService.findPersonalList(userId);
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

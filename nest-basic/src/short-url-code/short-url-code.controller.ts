import { Controller, Get, Param, Post, Redirect } from '@nestjs/common';
import { ShortUrlCodeService } from './short-url-code.service';

@Controller('shortUrlCode')
export class ShortUrlCodeController {
  constructor(private readonly shortUrlCodeService: ShortUrlCodeService) {}

  // 批量初始化生成一批，避免每当一个长链压缩成一个短链时，执行生成一个 code存到数据库
  // 可以用定时任务处理@nestjs/schedule
  @Get('patchInit')
  init() {
    this.shortUrlCodeService.initCodes();
    return '唯一 Code 批量生产成功';
  }

  @Get(':code')
  @Redirect()
  async getLongUrl(@Param('code') code: string) {
    const longUrl = await this.shortUrlCodeService.getLongUrl(code);
    console.log('longUrl', longUrl);
    return {
      url: longUrl,
      statusCode: 302,
    };
  }

  @Post('test')
  test() {
    return 'test';
  }
}

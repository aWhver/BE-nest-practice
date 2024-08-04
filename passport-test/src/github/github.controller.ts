import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { GithubService } from './github.service';
import { Request } from 'express';
import { skipAuth } from 'src/guard/jwt.guard';
import { GithubGuard } from 'src/guard/github.guard';
import { Profile } from 'passport-github2';

// 例子是以 github上建的 auth app为基础进行授权登录的。
// 申请 app路径：登录 github -> settings -> developer setting -> Oauth Apps
// 创建后拿到 clientId和 clientSecret

@skipAuth()
@UseGuards(GithubGuard)
@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('login')
  login() {}

  // 这个路由需要和填写github上应用的回调地址对应上
  @Get('callback')
  async authCallback(@Req() req: Request) {
    // req.user会返回 github账号的信息
    return this.githubService.findUser(req.user as any);
    // return req.user;
  }
}

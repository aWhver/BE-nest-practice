import { Controller, Get, Inject, Post, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Request } from 'express';
import { LocalStrategyGuard } from './guard/local.guard';
import { AuthService } from './auth/auth.service';
import { JwtGuard, skipAuth } from './guard/jwt.guard';

declare module 'express' {
  interface Request {
    user: {
      username: string;
      id: number;
    };
  }
}

/**
 * local通行证策略用来验证用户身份(用户名密码登录)并返回 jwt
 * jwt 通行证策略用来保护需要身份验证(需要登录才能使用)的API路由
 */

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Inject(AuthService)
  private authService: AuthService;

  @Get()
  // @UseGuards(LocalStrategyGuard)
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('login')
  @skipAuth()
  @UseGuards(LocalStrategyGuard)
  async login(@Req() req: Request) {
    const user = req.user;
    // console.log('user', user);
    return this.authService.login(user);
  }

  @Get('profile')
  // @UseGuards(JwtGuard)
  profile(@Req() req: Request) {
    // console.log('res.user', req.user);
    return req.user;
  }
}

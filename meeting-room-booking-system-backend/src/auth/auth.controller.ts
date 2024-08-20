import {
  Controller,
  Get,
  Inject,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { GithubGuard } from 'src/common/guard/github.guard';
import { skipAuth } from 'src/common/decorator';
import { UserService } from 'src/user/user.service';
import { UserVo } from 'src/user/vo/login.vo';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/user/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('第三方授权登录')
@skipAuth()
@Controller('auth')
export class AuthController {
  constructor() {}

  @Inject(UserService)
  private userService: UserService;

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private configService: ConfigService;

  /** github登录 */
  @UseGuards(GithubGuard)
  @Get('github/login')
  authLogin() {}

  /** github授权后回调地址 */
  @Get('github/callback')
  @UseGuards(GithubGuard)
  async authGithub(@Req() req: Request, @Res() res: Response) {
    if (!req.user) {
      throw new UnauthorizedException('授权github 登录失败');
    }
    const [existedUser] = await this.userService.findOne(
      {
        email: req.user.email,
        isAdmin: false,
      },
      ['roles', 'roles.permissions'],
    );
    let userInfo = new UserVo();
    let user: User;
    if (existedUser) {
      userInfo = existedUser;
    } else {
      user = await this.userService.registerByGithub(
        req.user.nickName,
        req.user.email,
        req.user.headPic,
      );
      userInfo.id = user.id;
      userInfo.email = userInfo.email;
      userInfo.headPic = userInfo.headPic;
      userInfo.createTime = userInfo.createTime;
      userInfo.isAdmin = userInfo.isAdmin;
      userInfo.isFrozen = userInfo.isFrozen;
      userInfo.nickName = userInfo.nickName;
      userInfo.phoneNumber = userInfo.phoneNumber;
      userInfo.username = userInfo.username;
      userInfo.roles = [];
      userInfo.permissions = [];
    }

    const [access_token, refresh_token] = this.generateToken(userInfo);
    res.cookie('auth_return', JSON.stringify(userInfo));
    res.cookie('access_token', access_token);
    res.cookie('refresh_token', refresh_token);
    res.redirect('http://localhost:3000/meetingRoomList');
  }

  // 生成 token
  generateToken(user: UserVo) {
    const access_token = this.jwtService.sign(
      {
        username: user.username,
        userId: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      {
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRE_TIME'),
      },
    );

    const refresh_token = this.jwtService.sign(
      {
        userId: user.id,
        email: user.email,
      },
      {
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRE_TIME'),
      },
    );

    return [access_token, refresh_token];
  }
}

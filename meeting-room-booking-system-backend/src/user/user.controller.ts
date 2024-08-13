import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
  Inject,
  Query,
  UnauthorizedException,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { md5 } from 'src/common/utils';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginUserVo, UserVo } from './vo/login.vo';
import { skipAuth } from 'src/common/decorator';
import { RedisService } from 'src/redis/redis.service';
import { getRolePermissionKey } from 'src/common/const';
import { UpdatePasswordDto, UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private configService: ConfigService;

  @Inject(RedisService)
  private redisService: RedisService;

  @Get('initAdmin')
  initAdmin() {
    return this.userService.initAdmin();
  }

  @skipAuth()
  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    console.log('createUserDto', createUserDto);
    return this.userService.create(createUserDto);
  }

  @skipAuth()
  @Post('registerCaptcha')
  sendCaptcha(@Body('email') email: string) {
    return this.userService.sendCaptcha(`${email}_register_captcha`, {
      email,
      subject: '会议室预定系统注册验证码',
      html(captcha) {
        return `<div>
        您好，欢迎使用会议室预定系统！
        <h2>验证码: ${captcha}</h2>
      </div>`;
      },
    });
  }

  @skipAuth()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // console.log('loginDto', loginDto);
    return this.getLoginUser(loginDto, false);
  }

  @skipAuth()
  @Post('admin/login')
  async adminLogin(@Body() loginDto: LoginDto) {
    // console.log('loginDto', loginDto);
    const user = await this.getLoginUser(loginDto, true);

    if (!user.userInfo.isAdmin) {
      throw new BadRequestException(
        '该用户不是管理员账户，请使用用户登录界面进行登录',
      );
    }
    return user;
  }

  @Get('info')
  async getUserInfo(@Request() req) {
    // console.log('req.user', req.user);
    const [user] = await this.userService.findOne({
      id: req.user.userId,
    });
    return user;
  }

  @Post('updatePassword')
  async updatePassword(
    @Request() req,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    console.log('updatePasswordDto', updatePasswordDto);
    const captcha = await this.redisService.get(
      `${updatePasswordDto.email}_update_password_captcha`,
    );
    if (!captcha) {
      throw new UnauthorizedException('验证码已过期');
    }
    if (captcha !== updatePasswordDto.captcha) {
      throw new BadRequestException('验证码不正确');
    }
    const user = await this.userService.findOneBy({
      id: req.user.userId,
    });
    user.password = md5(updatePasswordDto.password);
    await this.userService.updateUser(user);
    return '修改密码成功';
  }

  @Post('updatePasswordCaptcha')
  async sendUpdatePasswordCaptcha(@Body('email') email: string) {
    const user = await this.userService.findOneBy({ email }, true);
    if (!user) {
      throw new BadRequestException('该邮箱不存在对应的账户');
    }
    return this.userService.sendCaptcha(`${email}_update_password_captcha`, {
      email,
      subject: '更新密码验证码',
      html(captcha) {
        return `<div>
          您好，您正在进行更新密码操作，下面是您的验证码
          <h2>验证码: ${captcha}</h2>
        </div>`;
      },
    });
  }

  @Post('update')
  async updateUserInfo(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    console.log('updateUserDto', updateUserDto);
    const captcha = await this.redisService.get(
      `${updateUserDto.email}_update_info_captcha`,
    );
    if (!captcha) {
      throw new UnauthorizedException('验证码已过期');
    }
    if (captcha !== updateUserDto.captcha) {
      throw new BadRequestException('验证码不正确');
    }
    const user = await this.userService.findOneBy({
      id: req.user.userId,
    });
    if (updateUserDto.headPic) {
      user.headPic = updateUserDto.headPic;
    }
    if (updateUserDto.nickName) {
      user.nickName = updateUserDto.nickName;
    }
    await this.userService.updateUser(user);
    return '更新用户信息成功';
  }

  @Post('updateCaptcha')
  async sendUpdateCaptcha(@Body('email') email: string) {
    const user = await this.userService.findOneBy({ email }, true);
    if (!user) {
      throw new BadRequestException('该邮箱不存在对应的账户');
    }
    return this.userService.sendCaptcha(`${email}_update_info_captcha`, {
      email,
      subject: '更新用户信息',
      html(captcha) {
        return `<div>
          您好，您正在进行更新用户信息操作，下面是您的验证码
          <h2>验证码: ${captcha}</h2>
        </div>`;
      },
    });
  }

  @Get('refreshToken')
  async refreshToken(@Query('token') token: string) {
    try {
      const data = this.jwtService.verify(token);
      const [user] = await this.userService.findOne({
        id: data.userId,
      });
      const [access_token, refresh_token] = this.generateToken(user);
      return {
        access_token,
        refresh_token,
      };
    } catch (error) {
      throw new UnauthorizedException('token已过期');
    }
  }

  async getLoginUser(loginDto: LoginDto, isAdmin: boolean) {
    const [user, password] = await this.userService.findOne(
      {
        username: loginDto.username,
        isAdmin: isAdmin,
      },
      ['roles', 'roles.permissions'],
    );
    if (password !== md5(loginDto.password)) {
      throw new BadRequestException('密码不正确');
    }
    const key = getRolePermissionKey(user.username);
    this.redisService.hset(
      key,
      'role_permission',
      JSON.stringify({
        roles: user.roles,
        permissions: user.permissions,
      }),
      24 * 60 * 60,
    );
    const [access_token, refresh_token] = this.generateToken(user);

    const loginUserVo = new LoginUserVo();
    loginUserVo.userInfo = user;
    loginUserVo.access_token = access_token;
    loginUserVo.refresh_token = refresh_token;
    return loginUserVo;
  }
  // 生成 token
  generateToken(user: UserVo) {
    const access_token = this.jwtService.sign(
      {
        username: user.username,
        userId: user.id,
      },
      {
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRE_TIME'),
      },
    );

    const refresh_token = this.jwtService.sign(
      {
        userId: user.id,
      },
      {
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRE_TIME'),
      },
    );

    return [access_token, refresh_token];
  }
}

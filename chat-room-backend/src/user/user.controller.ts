import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  BadRequestException,
  Query,
  Inject,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { md5 } from '../common/utils';
import { RedisService } from 'src/global-modules/redis/redis.service';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { LoginUserVo } from './vo/login-user.vo';
import { SkipAuth } from '../common/decorator/index';

@ApiTags('用户')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(JwtService)
  private jwtService: JwtService;

  /** 用户注册 */
  @SkipAuth()
  @Post('register')
  async create(@Body() createUserDto: CreateUserDto) {
    const { captcha, ...rest } = createUserDto;
    const key = `${createUserDto.email}-register-captcha`;
    await this.verifyCaptcha(key, captcha);
    const user = await this.userService.findUnique({
      username: rest.username,
    });
    if (user) {
      throw new BadRequestException('用户已存在');
    }
    rest.password = md5(rest.password);
    return this.userService.create(rest);
  }

  /** 登录 */
  @SkipAuth()
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.userService.findUnique({
      username: loginUserDto.username,
    });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }
    if (user.password !== md5(loginUserDto.password)) {
      throw new BadRequestException('密码不正确');
    }
    const token = this.generateToken(user);
    delete user.password;
    const loginUserVo = new LoginUserVo();
    loginUserVo.user = user;
    loginUserVo.token = token;
    return loginUserVo;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }

  /** 注册验证码 */
  @SkipAuth()
  @Get('register/captcha')
  registerCaptcha(@Query('email') email: string) {
    return this.userService.sendCaptcha(`${email}-register-captcha`, {
      email,
      subject: '欢迎注册聊天室账号',
      html: (captcha) => {
        return `<div>
             您好，欢迎社交聊天系统！
        <h2>验证码: ${captcha}</h2>
          </div>`;
      },
    });
  }

  async verifyCaptcha(redisKey: string, captcha: string) {
    const cache = await this.redisService.get(redisKey);
    if (!cache) {
      throw new BadRequestException('验证码已过期');
    }
    if (cache !== captcha) {
      throw new BadRequestException('验证码不正确');
    }

    return true;
  }

  generateToken(user: Prisma.userUncheckedCreateInput) {
    const access_token = this.jwtService.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
      },
      {
        expiresIn: '7d',
      },
    );

    return access_token;
  }
}

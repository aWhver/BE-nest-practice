import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
  Query,
  Inject,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto, UpdateUserPasswordDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { md5 } from '../common/utils';
import { RedisService } from 'src/global-modules/redis/redis.service';
import { JwtService } from '@nestjs/jwt';
import { LoginUserVo } from './vo/login-user.vo';
import { SkipAuth, UserInfo } from '../common/decorator/index';
import { MinioService } from 'src/global-modules/minio/minio.service';

@ApiTags('用户')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(MinioService)
  private minioService: MinioService;

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
    const res = await this.userService.create(rest);
    this.redisService.del(key);
    return res;
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

  /** 用户信息 */
  @Get('info')
  async getUserInfo(@UserInfo('userId') uid: number) {
    const u = await this.userService.findUnique(
      { id: uid },
      {
        id: true,
        username: true,
        nickName: true,
        headPic: true,
        email: true,
        createTime: true,
        updateTime: true,
      },
    );
    const loginUserVo = new LoginUserVo();
    loginUserVo.user = u;
    return loginUserVo.user;
  }

  /** 更新用户信息 */
  @Post('update')
  async update(@Body() updateUserDto: UpdateUserDto) {
    const { captcha, ...rest } = updateUserDto;
    await this.verifyCaptcha(`${rest.email}-update-captcha`, captcha);
    await this.userService.updateUser(rest);
    this.redisService.del(`${rest.email}-update-captcha`);
    return '修改成功';
  }

  /** 更新密码 */
  @Post('update/password')
  async updatePassword(@Body() updatePasswordDto: UpdateUserPasswordDto) {
    const { captcha, ...rest } = updatePasswordDto;
    await this.verifyCaptcha(`${rest.email}-update-password-captcha`, captcha);
    await this.userService.updatePwd(rest.username, md5(rest.password));
    this.redisService.del(`${rest.email}-update-password-captcha`);
    return '密码修改成功';
  }

  /** 更新用户信息验证码 */
  @Get('update/captcha')
  updateCaptcha(@Query('email') email: string) {
    return this.userService.sendCaptcha(`${email}-update-captcha`, {
      email,
      subject: '欢迎使用聊天室',
      html: (captcha) => {
        return `<div>
             您好，你正在进行修改个人信息操作
        <h2>验证码: ${captcha}</h2>
          </div>`;
      },
    });
  }

  /** 更新用户密码验证码 */
  @Get('update/password/captcha')
  updatePasswordCaptcha(@Query('email') email: string) {
    return this.userService.sendCaptcha(`${email}-update-password-captcha`, {
      email,
      subject: '欢迎使用聊天室',
      html: (captcha) => {
        return `<div>
             您好，你正在进行修改密码操作
        <h2>验证码: ${captcha}</h2>
          </div>`;
      },
    });
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
             您好，欢迎来到社交聊天系统！
        <h2>验证码: ${captcha}</h2>
          </div>`;
      },
    });
  }

  /** 获取上传的预签名 url */
  @Get('presignedUrl')
  uploadHeadPic(@Query('name') name: string) {
    return this.minioService.presignedObject('chat-room', name);
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

  generateToken(user: any) {
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

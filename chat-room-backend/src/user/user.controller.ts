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
import { ApiTags } from '@nestjs/swagger';
import { md5 } from '../common/utils';
import { RedisService } from 'src/global-modules/redis/redis.service';

@ApiTags('用户')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(RedisService)
  private redisService: RedisService;

  /** 用户注册 */
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

  @Get()
  findAll() {
    return this.userService.findAll();
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
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { RedisService } from 'src/global-modules/redis/redis.service';
import { md5 } from '../common/utils';

@ApiTags('用户')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(RedisService)
  private redisServie: RedisService;

  /** 用户注册 */
  @Post('register')
  async create(@Body() createUserDto: CreateUserDto) {
    const { captcha, ...rest } = createUserDto;
    const key = `register-user-captcha-${rest.username}`;
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

  async verifyCaptcha(redisKey: string, captcha: string) {
    const cache = await this.redisServie.get(redisKey);
    if (!cache) {
      throw new BadRequestException('验证码已过期');
    }
    if (cache !== captcha) {
      throw new BadRequestException('验证码不正确');
    }

    return true;
  }
}

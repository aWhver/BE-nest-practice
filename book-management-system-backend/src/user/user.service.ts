import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { DbModuleService } from 'src/db-module/db-module.service';

@Injectable()
export class UserService {
  @Inject(DbModuleService)
  dbService: DbModuleService;

  async register(registerUserDto: RegisterUserDto) {
    const users = await this.dbService.read();
    const user = users.find((u) => u.username === registerUserDto.username);
    if (user) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
    }
    users.push(registerUserDto);
    await this.dbService.write(users);
    return user;
  }

  async login(loginUserDto: LoginUserDto) {
    const users = await this.dbService.read();
    const user = users.find((u) => u.username === loginUserDto.username);
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    if (user.password !== loginUserDto.password) {
      throw new HttpException('密码不正确', HttpStatus.BAD_REQUEST);
    }
    return user;
  }
}

import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { DbModuleService } from 'src/db-module/db-module.service';
import { User } from './entities/user.entity';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';

const md5 = function(str) {
  const hash = crypto.createHash('md5');
  hash.update(str);
  return hash.digest('hex');
}

@Injectable()
export class UserService {
  @Inject(DbModuleService)
  dbService: DbModuleService;

  @Inject(JwtService)
  jwtService: JwtService;

  async register(registerUserDto: RegisterUserDto) {
    const users = await this.dbService.read();
    const user = users.find((u) => u.username === registerUserDto.username);
    if (user) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
    }
    const newuser = new User();
    newuser.username = registerUserDto.username;
    newuser.password = md5(registerUserDto.password);
    users.push(newuser);
    await this.dbService.write(users);
    return newuser;
  }

  async login(loginUserDto: LoginUserDto) {
    const users: User[] = await this.dbService.read();
    const user = users.find((u) => u.username === loginUserDto.username);
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    if (user.password !== md5(loginUserDto.password)) {
      throw new HttpException('密码不正确', HttpStatus.BAD_REQUEST);
    }
    const sub = { username: user.username };
    const token = await this.jwtService.signAsync(sub);
    return token;
  }
}

import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { Permission } from 'src/permission/entities/permission.entity';
import { PermissionService } from 'src/permission/permission.service';

const md5 = function (str) {
  const hash = crypto.createHash('md5');
  hash.update(str);
  return hash.digest('hex');
};

@Injectable()
export class UserService {
  @InjectRepository(User)
  private userRepository: Repository<User>;

  @Inject(PermissionService)
  private permissionService: PermissionService;

  async register(registerUserDto: RegisterUserDto, codes: string[]) {
    const user = await this.userRepository.findOneBy({
      username: registerUserDto.username,
    });
    if (user) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
    }
    const newuser = new User();
    newuser.username = registerUserDto.username;
    newuser.password = md5(registerUserDto.password);
    const allCodes = await this.permissionService.findAll();
    const permissions = codes.map((code) => {
      const permission = new Permission();
      const c = allCodes.find((p) => p.permissionCode === Number(code));
      if (c) {
        return c;
      }
      permission.permissionCode = Number(code);
      permission.name = `随意的描述${(Math.random() * 100).toFixed()}`;
      return permission;
    });
    newuser.permissions = permissions;
    await this.userRepository.save(newuser);
    return newuser;
  }

  async login(loginUserDto: LoginUserDto) {
    const user: User = await this.userRepository.findOneBy({
      username: loginUserDto.username,
    });
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.BAD_REQUEST);
    }
    if (user.password !== md5(loginUserDto.password)) {
      throw new HttpException('密码不正确', HttpStatus.BAD_REQUEST);
    }
    return user;
  }
}

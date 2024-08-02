import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { Permission } from 'src/permission/entities/permission.entity';
import { PermissionService } from 'src/permission/permission.service';
import { md5 } from 'src/common/utils';

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
    const existedPermissions = await this.permissionService.findByCodes(codes);
    console.log('existedPermissions', existedPermissions);
    const permissions = codes.map((code) => {
      const c = existedPermissions.find((p) => p.permissionCode === code);
      if (c) {
        return c;
      }
      const permission = new Permission();
      permission.permissionCode = code;
      permission.name = `权限名${(Math.random() * 100).toFixed()}`;
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

  async findByUsername(username: string) {
    return this.userRepository.findOne({
      where: {
        username,
      },
      relations: ['permissions'],
    });
  }
}

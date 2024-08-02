import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dto/create-rabc-user.dto';
import { LoginUserDto, AssignRoleDto } from './dto/update-rabc-user.dto';
import { RabcUser } from './entities/rabc-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { md5 } from 'src/common/utils';
import { Role } from 'src/role/entities/role.entity';

@Injectable()
export class RabcUserService {
  @InjectRepository(RabcUser)
  private userRepository: Repository<RabcUser>;

  async register(registerUserDto: RegisterUserDto) {
    const user = await this.userRepository.findOneBy({
      username: registerUserDto.username,
    });
    if (user) {
      throw new HttpException('用户已存在', HttpStatus.BAD_REQUEST);
    }
    const newuser = new RabcUser();
    newuser.username = registerUserDto.username;
    newuser.password = md5(registerUserDto.password);
    await this.userRepository.save(newuser);
    return newuser;
  }

  async login(loginUserDto: LoginUserDto) {
    const user: RabcUser = await this.userRepository.findOneBy({
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

  findAll() {
    return this.userRepository.find();
  }

  async assignRole(assignRoleDto: AssignRoleDto) {
    const user = await this.userRepository.findOneBy({
      id: assignRoleDto.userId,
    });
    const roles = assignRoleDto.roles.map((roleId) => {
      const role = new Role();
      role.id = roleId;
      return role;
    });
    user.roles = roles;
    this.userRepository.save(user);
  }

  findByUsername(username: string) {
    return this.userRepository.findOne({
      where: {
        username,
      },
      relations: {
        roles: true,
      },
    });
  }
}

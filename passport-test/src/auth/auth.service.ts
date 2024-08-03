import { JwtService } from '@nestjs/jwt';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  @Inject(UserService)
  private userService: UserService;

  @Inject(JwtService)
  private jwtService: JwtService;

  validateUser(username: string, password: string) {
    const user = this.userService.findOne(username);
    if (!user) {
      return null;
    }
    if (user.password !== password) {
      throw new BadRequestException('密码不正确');
    }
    const { password: pwd, ...u } = user;
    console.log('password', pwd);
    return u;
  }

  async login(user: any) {
    // console.log('loginuser', user);
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from './auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    // 调用 super传入自己所需的策略选项
    super();
  }

  validate(username: string, password: string) {
    const user = this.authService.validateUser(username, password);
    return user;
  }
}

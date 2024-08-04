import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      clientID: 'Ov23liFpJteHLHj5Ia6y',
      clientSecret: '92b7e7a999a29527721d849c62c83146abbea37d',
      callbackURL: 'http://localhost:3000/github/callback',
      scope: ['public_profile'], // 请求的信息范围
    });
  }

  validate(accessToken: string, refreshToken: string, profile: Profile) {
    console.log('accessToken', accessToken);
    console.log('refreshToken', refreshToken);
    // 这里返回的信息会存储爱 request.user上
    // profile返回的是 github的账号信息
    return profile;
  }
}

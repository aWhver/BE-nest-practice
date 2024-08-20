import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get('GITHUB_CLIENTID'),
      clientSecret: configService.get('GITHUB_CLIENTSECRET'),
      // clientCallback: `http://localhost:${configService.get('SERVER_PORT')}/auth/github/callback`,
      callbackURL: `http://localhost:${configService.get('SERVER_PORT')}/auth/github/callback`,
      scope: ['public_profile', 'user:email'],
    });
  }
  validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    // done: any,
  ) {
    // console.log('accessToken', accessToken);
    // console.log('refreshToken', refreshToken);
    // console.log('info', profile);
    // console.log('done', done);
    return {
      nickName: profile.displayName,
      email: profile.emails[0].value,
      headPic: profile.photos[0].value,
      // accessToken,
    };
  }
}

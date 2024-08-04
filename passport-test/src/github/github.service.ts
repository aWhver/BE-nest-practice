import { Injectable } from '@nestjs/common';
import { Profile } from 'passport-github2';

@Injectable()
export class GithubService {
  private readonly users = [
    {
      githubId: '27797395',
      email: 'ttt@163.com',
      hobbies: ['sleep', 'writting'],
      username: 'tong',
    },
  ];

  findUser(profile: Profile) {
    const user = this.users.find((user) => user.githubId === profile.id);
    if (!user) {
      return '记录返回信息并根据实际业务做一些操作然后注册';
    }
    return user;
  }
}

import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  private readonly users = [
    {
      username: 'juntong',
      password: '123456',
      id: 1,
    },
    {
      username: 'inigo',
      password: '654321',
      id: 2,
    },
  ];

  findOne(username: string) {
    return this.users.find((user) => user.username === username);
  }
}

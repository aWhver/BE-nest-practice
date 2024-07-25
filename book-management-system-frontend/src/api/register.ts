import { POST } from '../common/http';

export const register = (username: string, password: string) =>
  POST<{
    username: string;
  }>('/user/register', {
    username,
    password,
  });

import { POST } from "../common/http";

export const login = (username: string, password: string) => {
  return POST<{
    username: string;
  }>('/user/login', { username, password });
}

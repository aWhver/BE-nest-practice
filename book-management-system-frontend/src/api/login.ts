import { POST } from "../common/http";

export const login = (username: string, password: string) => {
  return POST<string>('/user/login', { username, password });
}

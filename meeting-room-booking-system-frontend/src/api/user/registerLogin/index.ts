import { POST } from "../../../common/http"
import { Register, Login, LoginUser } from "./types";

export const register = function(data: Register) {
  return POST<string>('/user/register', data);
}

export const registerCaptcha = (email: string) => POST<string>('/user/registerCaptcha', { email });

export const login = (data: Login) => POST<LoginUser>('/user/login', data);

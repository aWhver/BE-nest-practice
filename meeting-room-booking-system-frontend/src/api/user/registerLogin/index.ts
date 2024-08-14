import { POST } from "../../../common/http"
import { Register, Login, LoginUser } from "./types";

export const register = function(data: Register) {
  return POST<string>('/user/register', data);
}

export const getCaptcha = (url: string, email: string) => POST<string>(url, { email });

export const login = (data: Login) => POST<LoginUser>('/user/login', data);

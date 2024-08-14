import { POST } from "../../../common/http"
import { Register } from "./types";

export const register = function(data: Register) {
  return POST<string>('/user/register', data);
}

export const registerCaptcha = (email: string) => POST<string>('user/registerCaptcha', { email })
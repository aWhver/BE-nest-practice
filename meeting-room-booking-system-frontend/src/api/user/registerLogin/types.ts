import { UserInfo } from "../userInfo/types";

export interface Register {
  username: string;
  nickName: string;
  password: string;
  email: string;
  captcha: string;
}

export interface Login {
  username: string;
  password: string;
}



export interface LoginUser {
  userInfo: UserInfo;
  access_token: string;
  refresh_token: string;
}

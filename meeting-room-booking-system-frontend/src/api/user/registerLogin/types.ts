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

export interface Permission {
  id: number;
  code: string;
  description: string;
}

export interface LoginUser {
  userInfo: {
    id: number;
    nickName: string;
    username: string;
    headPic: string;
    phoneNumber: string;
    email: string;
    isFrozen: boolean;
    isAdmin: boolean;
    createTime: number;
    roles: string[];
    permissions: Array<Permission>;
  }
  access_token: string;
  refresh_token: string;
}

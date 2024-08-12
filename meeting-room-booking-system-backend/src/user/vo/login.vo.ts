export class UserVo {
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
  permissions: Array<{
    id: number;
    code: string;
    description: string;
  }>;
}

export class LoginUserVo {
  userInfo: UserVo;
  access_token: string;
  refresh_token: string;
}

export class UserVo {
  id: number;
  username: string;
  nickName: string;
  email: string;
  headPic: string;
  createTime: Date;
  updateTime: Date;
}

export class LoginUserVo {
  user: UserVo;
  token: string;
}

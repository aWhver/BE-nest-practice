// 参数类型定义
export interface UpdatePwd {
  email: string;
  password: string;
  captcha: string;
}

export interface UpdateUserinfo {
  id: number;
  email: string;
  nickName: string;
  captcha: string;
  headPic: string;
}

// 返回类型定义

export interface UserInfo {
  id: number;
  nickName: string;
  username: string;
  headPic: string;
  email: string;
  createTime: Date;
}

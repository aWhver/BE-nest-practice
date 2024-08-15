// 参数类型定义
export interface UpdatePwd {
  email: string;
  password: string;
  captcha: string;
}

export interface UpdateUserinfo {
  email: string;
  nickName: string;
  captcha: string;
  headPic: string;
}

export interface UserlistQuery {
  username?: string;
  nickName?: string;
  email?: string;
  pageNo?: number;
  pageSize?: number;
}

// 返回类型定义
export interface Permission {
  id: number;
  code: string;
  description: string;
}

export interface UserInfo {
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

export type UserItem = Omit<UserInfo, 'roles' | 'permissions'>;

export interface Userlist {
  total: number;
  users: UserItem[];
}

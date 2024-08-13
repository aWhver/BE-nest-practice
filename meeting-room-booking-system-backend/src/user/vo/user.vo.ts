import { OmitType } from '@nestjs/swagger';
import { UserVo } from './login.vo';

export class UserItemVo extends OmitType(UserVo, [
  'isAdmin',
  'permissions',
  'roles',
  'createTime',
]) {
  createTime: Date;
}

export class UserListVo {
  users: UserItemVo[];
  total: number;
}

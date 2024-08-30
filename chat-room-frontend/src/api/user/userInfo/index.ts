import { GET, POST } from '@common/http';
import {
  UpdatePwd,
  UpdateUserinfo,
  UserInfo,
} from './types';

export const updatePassword = (data: UpdatePwd) =>
  POST<string>('user/update/password', data);

export const updateUserinfo = (data: UpdateUserinfo) =>
  POST<string>('user/update', data);

export const getUserInfo = () => GET<UserInfo>('user/info');



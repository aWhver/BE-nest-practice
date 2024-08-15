import { GET, POST } from '../../../common/http';
import {
  UpdatePwd,
  UpdateUserinfo,
  UserInfo,
  Userlist,
  UserlistQuery,
} from './types';

export const updatePassword = (data: UpdatePwd) =>
  POST<string>('/user/updatePassword', data);

export const updateUserinfo = (data: UpdateUserinfo) =>
  POST<string>('/user/update', data);

export const getUserInfo = () => GET<UserInfo>('/user/info');

export const getUserlist = (params?: UserlistQuery) =>
  GET<Userlist>('/user/list', params);

export const toggleFreezeUser = (id: number, isFrozen: boolean) =>
  GET<string>('/user/toggleFreeze', { id, isFrozen });

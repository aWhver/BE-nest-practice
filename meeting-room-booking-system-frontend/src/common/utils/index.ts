import { UserInfo } from '../../api/user/userInfo/types';
import { USER_INFO } from '../const';

export const isAdmin = function() {
  const userInfo: UserInfo = JSON.parse(
    localStorage.getItem(USER_INFO) || '{}'
  );
  return userInfo.isAdmin;
};

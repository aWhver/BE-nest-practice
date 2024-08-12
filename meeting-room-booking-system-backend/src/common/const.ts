export const REDIS_CLIENT = 'REDIS_CLIENT';

export const SKIP_AUTH = 'SKIP_AUTH';

export const ROLE_PERMISSION = 'ROLE_PERMISSION';

export const getRolePermissionKey = function (username: string) {
  return `user_${username}_permission`;
};

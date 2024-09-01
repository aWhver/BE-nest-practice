import { GET, POST } from '@/common/http';
import { AddFriendship, Friendship } from './types';

export const getFriendship = (nickName?: string) =>
  GET<Friendship[]>('friendship/list', { nickName });

export const addFriendship = (data: AddFriendship) =>
  POST<string>('friendship/add', data);

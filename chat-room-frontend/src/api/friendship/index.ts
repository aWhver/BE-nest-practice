import { GET, POST } from '@/common/http';
import { AddFriendship, Friendship, FriendshipRequest } from './types';

export const getFriendship = (nickName?: string) =>
  GET<Friendship[]>('friendship/list', { nickName });

export const addFriendship = (data: AddFriendship) =>
  POST<string>('friendship/add', data);

export const getFriendshipRequest = () =>
  GET<FriendshipRequest>('friendship/request/list');

export const approve = (id: number) => POST('friendship/approved/' + id);

export const reject = (id: number) => POST('friendship/rejected/' + id);

export const deleteFriend = (id: number) => POST('friendship/delete/' + id);

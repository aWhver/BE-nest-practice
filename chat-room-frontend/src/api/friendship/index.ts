import { GET } from '@/common/http';
import { Friendship } from './types';

export const getFriendship = (nickName?: string) =>
  GET<Friendship[]>('friendship/list', { nickName });

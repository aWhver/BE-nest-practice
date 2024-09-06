import { GET, POST } from '@/common/http';
import { AddFavorite, FavoriteDetailItem, FavoriteItem } from './types';

export const addFavorite = (data: AddFavorite) =>
  POST<string>('favorite/add', data);

export const getFavorites = () => GET<FavoriteItem[]>('favorite/list');

export const getFavoriteDetail = (id: number) => GET<FavoriteDetailItem[]>('favorite/detail', { id });

export const delFavorite = (id: number) =>
  POST<string>('favorite/delete/' + id);

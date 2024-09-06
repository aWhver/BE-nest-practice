import { ChatHistoryItem, MessageType } from "../chatroom/types";

export enum FavoriteType {
  chatHistory = 'chatHistory',
  text = 'text',
  file = 'file',
  image = 'image',
}

export interface AddFavorite {
  type: FavoriteType | MessageType;
  content?: string;
  chatHistoryIds?: number[];
}

export interface FavoriteItem {
  id: number;
  type: FavoriteType;
  createTime: string;
  content?: string;
  chatHistories?: ChatHistoryItem[]
}

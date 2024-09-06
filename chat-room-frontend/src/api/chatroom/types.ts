import { UserInfo } from '../user/userInfo/types';

export enum ChatroomType {
  single = 'single',
  group = 'group',
}
export interface Chatroom {
  userCount: number;
  id: number;
  name: string;
  creatorId: number;
  type: ChatroomType;
  createTime: string;
  updateTime: string;
}

export enum MessageType {
  file = 'file',
  text = 'text',
  image = 'image'
}
export interface ChatHistoryItem {
  id: number;
  sendUserId?: number;
  content: string;
  type: MessageType;
  createTime?: string;
}

export type SendUserObj = Record<
  string,
  {
    userId: number;
    nickName: string;
    headPic: string;
  }
>;

export interface ChatHistory {
  chatHistories: ChatHistoryItem[];
  sendUserObj: SendUserObj;
}

export interface ChatroomInfo
  extends Omit<Chatroom, 'userCount' | 'id' | 'createTime' | 'updateTime'> {
  users: UserInfo[];
}

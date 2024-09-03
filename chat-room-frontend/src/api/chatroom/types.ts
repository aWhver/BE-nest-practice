export enum ChatroomType {
  single = 'single',
  group = 'group',
}
export interface Chatroom {
  userCount: number;
  id: number;
  name: string;
  type: ChatroomType;
  createTime: string;
  updateTime: string;
}

export interface ChatHistoryItem {
  id?: number;
  sendUserId?: number;
  content: string;
  type: 'file' | 'text' | 'image';
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
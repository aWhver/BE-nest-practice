import { $Enums, FavoriteType } from '@prisma/client';

export class ChatHistoryItemVo {
  id: number;
  sendUserId: number;
  content: string;
  /** "text" | "image" | "file" */
  type: $Enums.ChatHistoryContentType;
  createTime: Date;
}

export class FavoriteItemVo {
  id: number;
  /** "chatHistory" | "text" | "image" | "file" */
  type: FavoriteType;
  createTime: Date;
  content?: string;
  chatHistories?: ChatHistoryItemVo[];
}

export class ChatRecordItemVo extends ChatHistoryItemVo {
  headPic: string;
  nickName: string;
}

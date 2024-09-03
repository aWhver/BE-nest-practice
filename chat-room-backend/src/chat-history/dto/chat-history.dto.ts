import { chatHistory } from '@prisma/client';

export type AddHistoryDto = Pick<
  chatHistory,
  'chatroomId' | 'sendUserId' | 'type' | 'content'
>;

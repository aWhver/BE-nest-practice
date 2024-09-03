import { GET, POST } from '@/common/http';
import { ChatHistory, Chatroom } from './types';

export const getChatroom = () => GET<Chatroom[]>('chatroom/list');

export const createSingleChatroom = (friendId: number) =>
  POST<number>('chatroom/oneToOne/' + friendId);

export const getChatHistory = (chatroomId: number) =>
  GET<ChatHistory>('chatHistory/list', { chatroomId });

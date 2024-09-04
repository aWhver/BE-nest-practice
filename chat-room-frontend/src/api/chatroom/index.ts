import { GET, POST } from '@/common/http';
import { ChatHistory, Chatroom, ChatroomInfo, ChatroomType } from './types';

export const getChatroom = (type?: ChatroomType) =>
  GET<Chatroom[]>('chatroom/list', { type });

export const createSingleChatroom = (friendId: number) =>
  POST<number>('chatroom/oneToOne/' + friendId);

export const getChatHistory = (chatroomId: number) =>
  GET<ChatHistory>('chatHistory/list', { chatroomId });

export const getChatroomInfo = (chatroomId: number) =>
  GET<ChatroomInfo>(`chatroom/info/${chatroomId}`);

export const createGroupChatroom = (name: string) =>
  POST<{ id: number }>('chatroom/group', { name });

export const disbandGroupChatroom = (chatroomId: number) =>
  POST<string>(`chatroom/disband/${chatroomId}`);

export const quitGroupChatroom = (chatroomId: number, userId: number) =>
  POST<string>(`chatroom/quit/${chatroomId}`, { userId });

export const joinGroupChatroom = (chatroomId: number, userId: number) =>
  POST<string>(`chatroom/join/${chatroomId}`, { userId });

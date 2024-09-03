import { getChatHistory } from '@/api/chatroom';
import { ChatHistoryItem, SendUserObj } from '@/api/chatroom/types';
import { create } from 'zustand';

export type Reply =
  | {
      type: 'sendMessage';
      userId: number;
      message: ChatHistoryItem;
    }
  | {
      type: 'joinRoom';
      userId: number;
    };

interface ChatroomMessageState {
  messages: ChatHistoryItem[];
  sendUserObj: SendUserObj;
  setMessages: (messages: ChatHistoryItem[]) => void;
  addMessage: (message: ChatHistoryItem) => void;
  getMessages: (chatroomId: number) => void;
  sendMessage: (value: string, type: 'text') => void;
  registerSendMessageFn: (fn: (value: string, type: 'text') => void) => void;
}

const useChatroomMessageStore = create<ChatroomMessageState>((set) => ({
  messages: [],
  sendUserObj: {},
  sendMessage: () => {},
  addMessage: (message: ChatHistoryItem) => {
    set((state) => ({ messages: [...state.messages, message] }));
  },
  setMessages: (messages: ChatHistoryItem[]) => set(() => ({ messages })),
  getMessages: async (chatroomId: number) => {
    const res = await getChatHistory(chatroomId);
    set({
      messages: res.data.chatHistories,
      sendUserObj: res.data.sendUserObj,
    });
  },
  registerSendMessageFn: (fn: (value: string, type: 'text') => void) => {
    set({ sendMessage: fn });
  },
}));

export default useChatroomMessageStore;
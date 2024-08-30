import { getUserInfo } from '@/api/user/userInfo';
import { UserInfo } from '@/api/user/userInfo/types';
import { create } from 'zustand';

interface UserState {
  userInfo: UserInfo | {};
  setUserInfo: (userInfo: UserInfo) => void;
  getUserInfo: () => void;
}

export const useLoginUserStore = create<UserState>((set) => ({
  userInfo: {},
  setUserInfo: (userInfo) => set(() => ({ userInfo })),
  getUserInfo: async function () {
    const user = await getUserInfo();
    set({ userInfo: user.data });
  }
}));

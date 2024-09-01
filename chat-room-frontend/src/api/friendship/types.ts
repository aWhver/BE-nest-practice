export interface Friendship {
  id: number;
  nickName: string;
  email: string;
  headPic: string;
  username: string;
}

export interface AddFriendship {
  toUsername: string;
  reason?: string;
}

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

// 响应类型定义
export enum FriendRequestStatus {
  appending = 'appending',
  rejected = 'rejected',
  approved = 'approved',
}

export interface FriendshipItem {
  id: number;
  fromUserId: number;
  toUserId: number;
  status: FriendRequestStatus;
  reason: string;
  /** UTC 格式 */
  cerateTime: string;
  nickName: string;
  headPic: string;
}

export interface FriendshipRequest {
  toMe: FriendshipItem[];
  fromMe: FriendshipItem[];
}

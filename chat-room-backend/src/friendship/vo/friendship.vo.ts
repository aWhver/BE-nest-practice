import { FriendRequestStatus } from '@prisma/client';

export class FriendshipRequestItemVo {
  id: number;
  fromUserId: number;
  toUserId: number;
  /** "appending" | "approved" | "rejected" */
  status: FriendRequestStatus;
  reason: string;
  /** UTC 格式 */
  cerateTime: Date;
}

export class ToMeVo extends FriendshipRequestItemVo {
  nickName: string;
  headPic: string;
}

export class FromMeVo extends FriendshipRequestItemVo {
  nickName: string;
  headPic: string;
}

export class FriendshipRequestVo {
  toMe: ToMeVo[];
  fromMe: FromMeVo[];
}

export class CreateFriendshipDto {
  /** 请求方 */
  fromUserId: number;
  /** 待添加方 */
  toUserId: number;
  /** 添加理由 */
  reason?: string;
}

export class MeetingRoomItemVo {
  id: number;
  name: string;
  /** 容纳人数 */
  capacity: number;
  /** 会议室位置 */
  location: string;
  description: string;
  /** 包含的设备 */
  equipment: string;
  isBooked: boolean;
  createTime: Date;
}

export class MeetingRoomListVo {
  meetingRooms: MeetingRoomItemVo[];
  total: number;
}

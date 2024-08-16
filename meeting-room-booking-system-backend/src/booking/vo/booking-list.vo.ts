import { Status } from '../entities/booking.entity';

export class BookingItemVo {
  id: number;
  userId: number;
  /** 0:申请中;1:通过;2:驳回;3取消 */
  status: Status;
  meetingRoomId: number;
  meetingRoomName: string;
  meetingRoomLocation: string;
  bookingNickName: string;
  startTime: Date;
  endTime: Date;
  note: string;
  createTime: Date;
}

export class BookingListVo {
  bookingList: BookingItemVo[];
  total: number;
}

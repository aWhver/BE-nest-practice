export enum Status {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Cancel = 3,
}

export interface createBookingQuery {
  startTime: number;
  endTime: number;
  meetingRoomId: number;
  note?: string;
}

export interface BookingListQuery {
  pageNo?: number;
  pageSize?: number;
  startTime?: number;
  endTime?: number;
  bookingPerson?: string;
  meetingRoomLocation?: string;
  meetingRoomName?: string;
  status?: Status;
}

export interface UrgeQuery {
  id: number;
  meetingRoomName: string;
  bookingTimeRangeTxt: string;
}

// 返回值类型定义
export interface BookingItem {
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
export interface BookingList {
  bookingList: BookingItem[];
  total: number;
}

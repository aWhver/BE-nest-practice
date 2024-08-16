export class BookingListDto {
  pageNo?: number;
  pageSize: number;
  /** 时间戳 */
  startTime?: number;
  endTime?: number;
  nickName?: string;
  meetingRoomLocation?: string;
  meetingRoomName?: string;
}

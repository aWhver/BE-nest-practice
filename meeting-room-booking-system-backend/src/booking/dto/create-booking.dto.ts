export class CreateBookingDto {
  /** 时间戳 */
  startTime: number;
  endTime: number;
  meetingRoomId: number;
  note?: string;
}

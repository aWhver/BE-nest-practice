export class CreateBookingDto {
  /** 时间戳 */
  startTime: number;
  endTime: number;
  meetingRoomId: number;
  note?: string;
}

export class UrgeDto {
  id: number;
  meetingRoomName: string;
  bookingTimeRangeTxt: string;
}

export class ApproveDto extends UrgeDto {
  email: string;
}

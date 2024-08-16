export interface createBookingQuery {
  startTime: number;
  endTime: number;
  meetingRoomId: number;
  note?: string;
}
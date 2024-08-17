import { Status } from '../entities/booking.entity';

export class BookingListDto {
  pageNo?: number;
  pageSize: number;
  /** 时间戳 */
  startTime?: number;
  endTime?: number;
  bookingPerson?: string;
  meetingRoomLocation?: string;
  meetingRoomName?: string;
  status?: Status;
}

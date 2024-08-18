import { GET } from '../../common/http';
import { MeetingRoomUsageCount, UserBookingCount } from './types';

export const getUserBookingCount = (params: {
  startTime?: number;
  endTime?: number;
}) => GET<UserBookingCount[]>('/statistic/userBookingCount', params);

export const getMeetingRoomUsageCount = (params: {
  startTime?: number;
  endTime?: number;
}) => GET<MeetingRoomUsageCount[]>('/statistic/meetingRoomUsageFreq', params);

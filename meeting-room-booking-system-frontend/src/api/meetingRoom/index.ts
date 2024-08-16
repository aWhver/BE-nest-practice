import { DELETE, GET, POST, PUT } from '../../common/http';
import {
  CreateMeetingRoomQuery,
  MeetingRoomItem,
  MeetingRoomList,
  MeetingRoomListQuery,
  UpdateMeetingRoomQuery,
} from './types';

export const createMeetingRoom = (data: CreateMeetingRoomQuery) =>
  POST<string>('/meetingRooms/create', data);

export const updateMeetingRoom = (id: number, data: UpdateMeetingRoomQuery) =>
  PUT<string>('/meetingRooms/create', data, { id });

export const getMeetingRoomList = (data?: MeetingRoomListQuery) =>
  GET<MeetingRoomList>('/meetingRooms/list', data);

export const deleteMeetingRoom = (id: number) =>
  DELETE<string>(`/meetingRooms/${id}`);

export const getMeetingRoomDetail = (id: number) =>
  GET<MeetingRoomItem>(`/meetingRooms/${id}`);

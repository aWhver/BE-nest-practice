export interface CreateMeetingRoomQuery {
  name: string;
  capacity: number;
  location: string;
  equipment: string;
  description: string;
}

export interface UpdateMeetingRoomQuery extends CreateMeetingRoomQuery {}

export interface MeetingRoomListQuery extends Partial<Omit<CreateMeetingRoomQuery, 'description'>> {
  pageNo: number;
  pageSize: number;
}

// 会议室管理返回值类型定义
export interface MeetingRoomItem extends CreateMeetingRoomQuery {
  id: number;
  isBooked: boolean;
  createTime: Date;
}

export interface MeetingRoomList {
  meetingRooms: MeetingRoomItem[];
  total: number;
}

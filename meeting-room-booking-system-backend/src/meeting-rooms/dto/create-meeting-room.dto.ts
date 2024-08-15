import { IsNotEmpty } from 'class-validator';

export class CreateMeetingRoomDto {
  @IsNotEmpty({
    message: '会议室名称不能为空',
  })
  name: string;
  capacity: number;
  equipment: string;
  location: string;
  description: string;
}

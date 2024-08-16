import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import { MeetingRoomsService } from './meeting-rooms.service';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { ApiTags } from '@nestjs/swagger';
import { MeetingRoomListDto } from './dto/meeting-room-list.dto';
import { generateParseIntPipe } from 'src/common/pipe';
import {
  MeetingRoomItemVo,
  MeetingRoomListVo,
} from './vo/meeting-room-list.vo';

@ApiTags('会议室管理')
@Controller('meetingRooms')
export class MeetingRoomsController {
  constructor(private readonly meetingRoomsService: MeetingRoomsService) {}

  /** 会议室创建 */
  @Post('create')
  create(@Body() createMeetingRoomDto: CreateMeetingRoomDto) {
    return this.meetingRoomsService.create(createMeetingRoomDto);
  }

  /** 会议室列表 */
  @Get('list')
  async getList(
    @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo'))
    pageNo: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(10),
      generateParseIntPipe('pageSize'),
    )
    pageSize: number,
    @Query() meetingRoomListDto: MeetingRoomListDto,
  ) {
    const [list, total] = await this.meetingRoomsService.findMeetingRoomsByPage(
      { ...meetingRoomListDto, pageNo, pageSize },
    );
    const meetingRoomListVo = new MeetingRoomListVo();
    meetingRoomListVo.total = total;
    meetingRoomListVo.meetingRooms = list.map((item) => {
      const meetRoomItemVo = new MeetingRoomItemVo();
      meetRoomItemVo.id = item.id;
      meetRoomItemVo.name = item.name;
      meetRoomItemVo.capacity = item.capacity;
      meetRoomItemVo.isBooked = item.isBooked;
      meetRoomItemVo.location = item.location;
      meetRoomItemVo.equipment = item.equipment;
      meetRoomItemVo.createTime = item.createTime;
      meetRoomItemVo.description = item.description;
      return meetRoomItemVo;
    });
    return meetingRoomListVo;
  }

  /** 获取会议室信息 */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.meetingRoomsService.findOne(+id);
  }

  /** 更新会议室信息 */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMeetingRoomDto: UpdateMeetingRoomDto,
  ) {
    return this.meetingRoomsService.update(+id, updateMeetingRoomDto);
  }

  /** 删除会议室 */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.meetingRoomsService.remove(+id);
  }
}

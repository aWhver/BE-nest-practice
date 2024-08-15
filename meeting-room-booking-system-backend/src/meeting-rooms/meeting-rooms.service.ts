import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MeetingRoom } from './entities/meeting-room.entity';
import { FindOptionsSelect, FindOptionsWhere, Like, Repository } from 'typeorm';
import { MeetingRoomListDto } from './dto/meeting-room-list.dto';

@Injectable()
export class MeetingRoomsService {
  @InjectRepository(MeetingRoom)
  private meetingRoomRepository: Repository<MeetingRoom>;

  async create(createMeetingRoomDto: CreateMeetingRoomDto) {
    const meetingRoom = new MeetingRoom();
    meetingRoom.name = createMeetingRoomDto.name;
    meetingRoom.capacity = createMeetingRoomDto.capacity;
    meetingRoom.equipment = createMeetingRoomDto.equipment;
    meetingRoom.location = createMeetingRoomDto.location;
    meetingRoom.description = createMeetingRoomDto.description;
    await this.meetingRoomRepository.insert(meetingRoom);
    return '创建会议室成功';
  }

  findMeetingRoomsByPage(meetingRoomListDto: MeetingRoomListDto) {
    const { pageNo, pageSize, name, location, capacity, equipment } =
      meetingRoomListDto;
    const condition: FindOptionsWhere<MeetingRoom> = {};
    if (name) {
      condition.name = Like(`%${name}%`);
    }
    if (location) {
      condition.location = Like(`%${location}%`);
    }
    if (equipment) {
      condition.equipment = Like(`%${equipment}%`);
    }
    if (capacity) {
      condition.capacity = capacity;
    }
    return this.meetingRoomRepository.findAndCount({
      where: condition,
      skip: (pageNo - 1) * pageSize,
      take: pageSize,
      select: [
        'id',
        'name',
        'capacity',
        'location',
        'equipment',
        'description',
        'isBooked',
        'createTime',
      ],
    });
  }

  findOne(id: number) {
    return this.meetingRoomRepository.findOneBy({ id });
  }

  async update(id: number, updateMeetingRoomDto: UpdateMeetingRoomDto) {
    const meetingRoom = await this.findOne(id);
    if (!meetingRoom) {
      throw new BadRequestException('会议室不存在');
    }
    meetingRoom.name = updateMeetingRoomDto.name;
    meetingRoom.capacity = updateMeetingRoomDto.capacity;
    meetingRoom.equipment = updateMeetingRoomDto.equipment;
    meetingRoom.description = updateMeetingRoomDto.description;
    meetingRoom.location = updateMeetingRoomDto.location;
    await this.meetingRoomRepository.save(meetingRoom);
    return `修改成功`;
  }

  async remove(id: number) {
    await this.meetingRoomRepository.delete(id);
    return `删除成功`;
  }
}

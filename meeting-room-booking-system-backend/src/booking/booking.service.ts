import { Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking, Status } from './entities/booking.entity';
import {
  Between,
  FindOneOptions,
  Like,
  Repository,
  FindOptionsWhere,
  FindManyOptions,
} from 'typeorm';
import { MeetingRoom } from 'src/meeting-rooms/entities/meeting-room.entity';
import { User } from 'src/user/entities/user.entity';
import { BookingListDto } from './dto/booking-list.dto';

@Injectable()
export class BookingService {
  @InjectRepository(Booking)
  private bookingRepository: Repository<Booking>;

  async create(createBookingDto: CreateBookingDto, userId: number) {
    const booking = new Booking();
    booking.startTime = new Date(createBookingDto.startTime);
    booking.endTime = new Date(createBookingDto.endTime);
    const meetingRoom = new MeetingRoom();
    meetingRoom.id = createBookingDto.meetingRoomId;
    booking.meetingRoom = meetingRoom;
    const user = new User();
    user.id = userId;
    booking.user = user;
    booking.note = createBookingDto.note;
    await this.bookingRepository.save(booking);
    return '预定成功';
  }

  getListByPage(bookingListDto: BookingListDto) {
    console.log('bookingListDto', bookingListDto);
    const condition: Record<string, any> = {};
    if (bookingListDto.bookingPerson) {
      condition.user.nickName = Like(`%${bookingListDto.bookingPerson}%`);
    }
    if (bookingListDto.meetingRoomLocation) {
      condition.meetingRoom.location = Like(
        `%${bookingListDto.meetingRoomLocation}%`,
      );
    }
    if (bookingListDto.meetingRoomLocation) {
      condition.meetingRoom.name = Like(`%${bookingListDto.meetingRoomName}%`);
    }
    if (bookingListDto.status) {
      condition.status = bookingListDto.status;
    }
    if (bookingListDto.startTime) {
      condition.startTime = Between(
        new Date(bookingListDto.startTime),
        new Date(bookingListDto.endTime),
      );
      condition.endTime = Between(
        new Date(bookingListDto.startTime),
        new Date(bookingListDto.endTime),
      );
    }
    return this.bookingRepository.findAndCount({
      where: condition,
      relations: ['user', 'meetingRoom'],
      skip: (bookingListDto.pageNo - 1) * bookingListDto.pageSize,
      take: bookingListDto.pageSize,
    });
  }

  findOneById(id: number) {
    return this.bookingRepository.findOne({
      where: {
        id,
      },
    });
  }

  findOneBy(options: FindOneOptions) {
    return this.bookingRepository.findOne(options);
  }

  async updateBookingStatus(id: number, status: Status) {
    const booking = new Booking();
    booking.id = +id;
    booking.status = status;
    await this.bookingRepository.save(booking);
    return '更新状态成功';
  }

  remove(id: number) {
    return `This action removes a #${id} booking`;
  }
}

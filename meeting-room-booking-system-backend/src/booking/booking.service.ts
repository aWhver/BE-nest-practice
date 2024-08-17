import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateBookingDto, UrgeDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Booking, Status } from './entities/booking.entity';
import {
  Between,
  FindOneOptions,
  Like,
  Repository,
  FindOptionsWhere,
  FindManyOptions,
  EntityManager,
} from 'typeorm';
import { MeetingRoom } from 'src/meeting-rooms/entities/meeting-room.entity';
import { User } from 'src/user/entities/user.entity';
import { BookingListDto } from './dto/booking-list.dto';
import { EmailService } from 'src/email/email.service';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class BookingService {
  @InjectRepository(Booking)
  private bookingRepository: Repository<Booking>;

  @InjectEntityManager()
  private entityManager: EntityManager;

  @Inject(EmailService)
  private emailService: EmailService;

  @Inject(RedisService)
  private redisService: RedisService;

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

  getListByPage(bookingListDto: BookingListDto & { userId?: number }) {
    console.log('bookingListDto', bookingListDto);
    const condition: Record<string, any> = {
      user: {},
      meetingRoom: {},
    };
    if (bookingListDto.bookingPerson) {
      condition.user.nickName = Like(`%${bookingListDto.bookingPerson}%`);
    }
    if (bookingListDto.userId) {
      condition.user.id = bookingListDto.userId;
    }
    if (bookingListDto.meetingRoomLocation) {
      condition.meetingRoom.location = Like(
        `%${bookingListDto.meetingRoomLocation}%`,
      );
    }
    if (bookingListDto.meetingRoomName) {
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

  async urge(urgeDto: UrgeDto) {
    const urgeId = await this.redisService.get(`urge_${urgeDto.id}`);
    if (urgeId) {
      throw new BadRequestException('半小时只能催办一次');
    }
    let email = await this.redisService.get('admin_email');
    if (!email) {
      const admin = await this.entityManager.findOne(User, {
        select: ['email'],
        where: {
          isAdmin: true,
        },
      });
      email = admin.email;
      this.redisService.set('admin_email', admin.email);
    }

    await this.emailService.sendMail({
      to: email,
      subject: '预订催办通知',
      html: `会议紧急，麻烦同意一下会议室：${urgeDto.meetingRoomName}在${urgeDto.bookingTimeRangeTxt}期间使用的审批`,
    });
    this.redisService.set(`urge_${urgeDto.id}`, 1, 60 * 30);
  }
}

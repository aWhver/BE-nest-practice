import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Booking } from 'src/booking/entities/booking.entity';
import { MeetingRoom } from 'src/meeting-rooms/entities/meeting-room.entity';
import { User } from 'src/user/entities/user.entity';
import { EntityManager, SelectQueryBuilder } from 'typeorm';

@Injectable()
export class StatisticService {
  constructor(@InjectEntityManager() private entityMannager: EntityManager) {
    this.qb = this.entityMannager.createQueryBuilder(Booking, 'b');
  }

  protected qb: SelectQueryBuilder<Booking>;

  userBookingCount(st: string, et: string) {
    return this.qb
      .select('u.id', 'userId')
      .addSelect('u.nickName', 'nickName')
      .leftJoin(User, 'u', 'b.userId = u.id')
      .addSelect('count(*)', 'bookingCount')
      .where('b.startTime between :st and :et', {
        st: new Date(+st),
        et: new Date(+et),
      })
      .groupBy('b.user')
      .getRawMany();
  }

  meetingRoomUsageFreq(st: string, et: string) {
    return this.qb
      .select('m.id', 'meetingRoomId')
      .addSelect('m.name', 'meetingRoomName')
      .leftJoin(MeetingRoom, 'm', 'b.meetingRoomId = m.id')
      .addSelect('count(*)', 'usageCount')
      .where('b.startTime between :st and :et', {
        st: new Date(+st),
        et: new Date(+et),
      })
      .groupBy('m.id')
      .getRawMany();
  }
}

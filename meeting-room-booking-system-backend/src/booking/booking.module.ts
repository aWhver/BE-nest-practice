import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { MeetingRoomsModule } from 'src/meeting-rooms/meeting-rooms.module';

@Module({
  imports: [TypeOrmModule.forFeature([Booking]), MeetingRoomsModule],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}

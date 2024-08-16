import { Module } from '@nestjs/common';
import { MeetingRoomsService } from './meeting-rooms.service';
import { MeetingRoomsController } from './meeting-rooms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeetingRoom } from './entities/meeting-room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MeetingRoom])],
  controllers: [MeetingRoomsController],
  providers: [MeetingRoomsService],
  exports: [MeetingRoomsService],
})
export class MeetingRoomsModule {}
import { IsNotEmpty } from 'class-validator';
import { Booking } from '../../booking/entities/booking.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class MeetingRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    comment: '会议室名字',
    unique: true,
  })
  @IsNotEmpty({
    message: '会议室名称不能为空',
  })
  name: string;

  @Column({
    comment: '可容纳人数',
    default: 6,
  })
  capacity: number;

  @Column({
    length: 50,
    comment: '会议室位置',
  })
  location: string;

  @Column({
    length: 50,
    comment: '设备',
    default: '',
  })
  equipment: string;

  @Column({
    length: 100,
    comment: '描述',
    default: '',
  })
  description: string;

  @Column({
    comment: '是否被预订',
    default: false,
  })
  isBooked: boolean;

  @CreateDateColumn({
    comment: '创建时间',
  })
  createTime: Date;

  @UpdateDateColumn({
    comment: '更新时间',
  })
  updateTime: Date;

  // @OneToMany(() => Booking, (booking) => booking.meetingRoom)
  // bookings: Booking[];
}

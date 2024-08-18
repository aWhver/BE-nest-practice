import { IsNotEmpty } from 'class-validator';
import { MeetingRoom } from '../../meeting-rooms/entities/meeting-room.entity';
import { User } from '../../user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum Status {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Cancel = 3,
}

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty({
    message: '必须填写预定开始时间',
  })
  @Column({
    comment: '开始时间',
  })
  startTime: Date;

  @IsNotEmpty({
    message: '必须填写预定结束时间',
  })
  @Column({
    comment: '结束时间',
  })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: Status,
    comment: '状态（申请中、审批通过、审批驳回、取消）',
    default: Status.Pending,
  })
  status: Status;

  @Column({
    length: 100,
    comment: '备注',
    default: '',
  })
  note: string;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => MeetingRoom)
  meetingRoom: MeetingRoom;
}

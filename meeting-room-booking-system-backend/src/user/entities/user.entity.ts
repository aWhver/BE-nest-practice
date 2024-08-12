import { Role } from '../../role/entities/role.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 50,
  })
  username: string;

  @Column({
    length: 70,
  })
  password: string;

  @Column({
    default: '',
  })
  nickName: string;

  @Column()
  email: string;

  @Column({
    default: '',
  })
  headPic: string;

  @Column({
    length: 20,
    nullable: true,
  })
  phoneNumber: string;

  @Column({
    comment: '账户是否被冻结',
    default: false,
  })
  isFrozen: boolean;

  @Column({
    comment: '是否是管理员',
    default: false,
  })
  isAdmin: boolean;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @ManyToMany(() => Role, {
    cascade: true,
  })
  @JoinTable({
    name: 'user_roles',
  })
  roles: Role[];
}

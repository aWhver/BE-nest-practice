import { IsNotEmpty, Length } from 'class-validator';
import { Permission } from '../../permission/entities/permission.entity';
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
  id: string;

  @Column()
  @IsNotEmpty()
  @Length(1, 20)
  username: string;

  @Column()
  @IsNotEmpty()
  @Length(6, 60)
  password: string;

  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;

  @ManyToMany(() => Permission, {
    cascade: true,
  })
  @JoinTable({
    name: 'user-permission-relation',
  })
  permissions: Permission[];
}

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
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty({
    message: '角色名不能为空',
  })
  @Length(2, 8)
  name: string;

  @CreateDateColumn()
  createDate: Date;

  @UpdateDateColumn()
  updateDate: Date;

  @ManyToMany(() => Permission, {
    cascade: true,
  })
  @JoinTable({
    name: 'role-permission-relation',
  })
  permissions: Permission[];
}

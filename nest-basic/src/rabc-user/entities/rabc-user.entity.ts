import { IsNotEmpty, Length } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../role/entities/role.entity';

@Entity()
export class RabcUser {
  @PrimaryGeneratedColumn()
  id: number;

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

  @ManyToMany(() => Role, {
    cascade: true,
  })
  @JoinTable({
    name: 'rabcuser-role-relation',
  })
  roles: Role[];
}

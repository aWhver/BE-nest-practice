import { Permission } from '../../permission/entities/permission.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => Permission, {
    cascade: true,
  })
  @JoinTable({
    name: 'role_permissions',
  })
  permissions: Permission[];
}

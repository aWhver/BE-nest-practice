import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ShortLongMap {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  shortUrl: string;

  @Column()
  longUrl: string;

  @CreateDateColumn()
  createTime: Date;
}

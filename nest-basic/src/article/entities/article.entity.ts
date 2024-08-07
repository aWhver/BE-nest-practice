import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 30,
  })
  title: string;

  @Column({
    type: 'text',
  })
  content: string;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  // 这里添加 tags字段，修改下表结构，重新执行 migration
  @Column()
  tags: string;

  @Column({
    default: 0,
  })
  viewCount: number;
}

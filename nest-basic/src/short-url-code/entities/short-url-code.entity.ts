import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ShortUrlCode {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    comment: '短链压缩码',
  })
  code: string;

  @Column({
    comment: 'status 0:未使用，1:已使用',
    default: 0,
  })
  status: number;
}

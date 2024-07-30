import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
  UpdateDateColumn,
} from 'typeorm';
// typeorm中任意层级关系存储
// 一般用closure-table和materialized-path就可以了
// materialized-path会在数据库中添加一个 mpath字段来表示关系
// closure-table 会新建一个表来存储层级关系
@Entity()
@Tree('closure-table')
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    default: 0,
  })
  status: number;

  @CreateDateColumn()
  cDate: Date;

  @UpdateDateColumn()
  uDate: Date;

  @Column()
  name: string;

  // 通过这个装饰器声明数据存到 children属性上
  @TreeChildren()
  children: City[];

  // 通过这个装饰器声明数据存到 parent属性上
  @TreeParent()
  parent: City;
}

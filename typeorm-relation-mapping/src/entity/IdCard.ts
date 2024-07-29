import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm"
import { User } from "./User";

@Entity({
  name: 'id-card'
})
export class IdCard {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({
    length: 50,
    comment: '身份证编号'
  })
  cardNo: string;

  // 建立一对一的关系
  @JoinColumn()
  @OneToOne(() => User, {
    // 不设置默认的级联关系是 noaction
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    // 这里设置为 ture，就只需要保存 idcard,不然 user和 idcard需要同时保存
    // await AppDataSource.manager.save(user)
    // await AppDataSource.manager.save(idCard),设置true,只需要调用这个
    cascade: true,
  })
  user: User;
}

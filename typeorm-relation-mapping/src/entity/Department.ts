import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Employee } from './Employee';

@Entity()
export class Department {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    comment: '部门名称',
  })
  name: string;
  // 一对多的关系只需要在一方设置级联即可，否则陷入循环了
  @OneToMany(
    () => Employee,
    (employee) => employee.department,
    {
      cascade: true,
    }
  )
  employees: Employee[];
}

import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { Department } from "./Department";

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    comment: '员工名称',
  })
  name: string;

  @ManyToOne(() => Department, {
    // cascade: true
  })
  department: Department;
}

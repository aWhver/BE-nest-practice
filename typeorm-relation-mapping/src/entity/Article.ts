import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm"
import { Tag } from "./Tag";

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 40,
    type: 'varchar'
  })
  title: string;

  @Column({
    type: 'text'
  })
  content: string;

  @JoinTable()
  @ManyToMany(() => Tag, tag => tag.articles)
  tags: Tag[];
}

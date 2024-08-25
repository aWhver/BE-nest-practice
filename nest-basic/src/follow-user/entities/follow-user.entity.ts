import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class FollowUser {
  constructor(partail?: Partial<FollowUser>) {
    partail && Object.assign(this, partail);
  }
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(() => FollowUser, (followUser) => followUser.following, {
    cascade: true,
  })
  @JoinTable()
  followers: FollowUser[];

  @ManyToMany(() => FollowUser, (followUser) => followUser.followers)
  following: FollowUser[];
}

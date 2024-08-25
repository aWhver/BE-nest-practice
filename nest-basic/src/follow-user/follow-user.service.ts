import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FollowUser } from './entities/follow-user.entity';
import { In, Repository } from 'typeorm';

@Injectable()
export class FollowUserService {
  @InjectRepository(FollowUser)
  private followUserRepository: Repository<FollowUser>;

  findUser(id: number | number[], relations?: string[]) {
    return this.followUserRepository.find({
      where: {
        id: Array.isArray(id) ? In(id) : id,
      },
      relations: relations || ['followers', 'following'],
    });
  }

  save(data: FollowUser[]) {
    return this.followUserRepository.save(data);
  }
}

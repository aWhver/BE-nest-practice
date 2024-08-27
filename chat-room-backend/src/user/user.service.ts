import { Inject, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/global-modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  @Inject(PrismaService)
  private prismaService: PrismaService;

  create(createUserDto: Prisma.userCreateInput) {
    if (!createUserDto.nickName) {
      createUserDto.nickName = Math.random().toString(36).slice(2);
    }
    return this.prismaService.user.create({
      data: createUserDto,
      select: {
        id: true,
      },
    });
    // return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findUnique(where: Prisma.userWhereUniqueInput) {
    return this.prismaService.user.findUnique({
      where,
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}

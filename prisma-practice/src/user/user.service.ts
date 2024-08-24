import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor() {}

  @Inject(PrismaService)
  private prismaServie: PrismaService;

  create(data: Prisma.UserCreateInput) {
    return this.prismaServie.user.create({
      data,
    });
  }

  findUser(query: Prisma.UserFindManyArgs) {
    return this.prismaServie.user.findMany(query);
  }

  updateUser(data: Prisma.UserUpdateArgs) {
    return this.prismaServie.user.update(data);
  }
}

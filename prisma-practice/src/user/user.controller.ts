import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  create(@Query('email') email: string, @Query('name') name: string) {
    return this.userService.create({
      email,
      name,
    });
  }

  @Get('list')
  getList() {
    return this.userService.findUser({
      include: {
        Post: true,
      },
    });
  }

  @Get('update')
  updateUser(
    @Query('id', ParseIntPipe) id: number,
    @Query('email') email: string,
  ) {
    return this.userService.updateUser({
      where: {
        id,
      },
      data: {
        email,
      },
      include: {
        Post: {
          select: {
            title: true,
            content: true,
          },
        },
      },
    });
  }
}

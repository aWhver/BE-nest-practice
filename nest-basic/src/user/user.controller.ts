import { Controller, Post, Body, Session, Query, Inject } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  register(
    @Query('permissionCode') permissionCode: string,
    @Body() registerUserDto: RegisterUserDto,
  ) {
    const codes = permissionCode.split(',');
    console.log('codes', codes);
    // return 'd';
    return this.userService.register(registerUserDto, codes);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto, @Session() session) {
    const user = await this.userService.login(loginUserDto);

    if (!session.user) {
      session.user = {};
    }
    session.user.username = user.username;
    return session;
  }
}

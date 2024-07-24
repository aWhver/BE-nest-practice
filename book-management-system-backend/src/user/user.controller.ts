import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  create(@Body() registerUserDto: RegisterUserDto) {
    console.log('registerUserDto', registerUserDto);
    return this.userService.register(registerUserDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    console.log('loginUserDto', loginUserDto);
    return this.userService.login(loginUserDto);
  }
}

import { Controller, Post, Body, Get, Inject } from '@nestjs/common';
import { RabcUserService } from './rabc-user.service';
import { RegisterUserDto } from './dto/create-rabc-user.dto';
import { AssignRoleDto, LoginUserDto } from './dto/update-rabc-user.dto';
import { JwtService } from '@nestjs/jwt';

@Controller('rabcUser')
export class RabcUserController {
  constructor(private readonly rabcUserService: RabcUserService) {}

  @Inject(JwtService)
  private jwtService: JwtService;

  @Post('register')
  register(@Body() registerUserDto: RegisterUserDto) {
    // return 'd';
    return this.rabcUserService.register(registerUserDto);
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const user = await this.rabcUserService.login(loginUserDto);

    const token = this.jwtService.signAsync({
      username: user.username,
      id: user.id,
    });

    return token;
  }

  @Get()
  findAll() {
    return this.rabcUserService.findAll();
  }

  @Post('assignRole')
  assignRole(@Body() assignRoleDto: AssignRoleDto) {
    this.rabcUserService.assignRole(assignRoleDto);
    return '分配角色成功';
  }
}

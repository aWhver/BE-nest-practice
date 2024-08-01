import {
  Controller,
  Post,
  Body,
  Session,
  Query,
  Get,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard, PermissionGuard } from 'src/common/guard';
import { API_PERMISSION } from 'src/common/const';

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

  // 需要授权和权限的接口
  @Get('permissionOne')
  @SetMetadata(API_PERMISSION, ['6', '5', '19'])
  @UseGuards(AuthGuard, PermissionGuard)
  permission1() {
    return '权限4,5,19可以访问';
  }

  @Get('permissionTwo')
  @SetMetadata(API_PERMISSION, ['1', '2', '18'])
  @UseGuards(AuthGuard, PermissionGuard)
  permission2() {
    return '权限1,2,18可以访问';
  }
}

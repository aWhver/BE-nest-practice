import {
  Controller,
  Post,
  Body,
  Get,
  Inject,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { RabcUserService } from './rabc-user.service';
import { RegisterUserDto } from './dto/create-rabc-user.dto';
import { AssignRoleDto, LoginUserDto } from './dto/update-rabc-user.dto';
import { JwtService } from '@nestjs/jwt';
import { RabcUser } from './entities/rabc-user.entity';

async function generateToken(jwtService: JwtService, user: RabcUser) {
  const token = await jwtService.signAsync(
    {
      username: user.username,
      id: user.id,
    },
    { expiresIn: '1m' },
  );

  const refresh_token = await jwtService.signAsync(
    {
      userId: user.id,
    },
    { expiresIn: '7d' },
  );

  return { access_token: token, refresh_token };
}

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

    return generateToken(this.jwtService, user);
  }

  @Get('/refreshToken')
  async refreshToken(@Query('refresh_token') refreshToken: string) {
    try {
      const { userId } = await this.jwtService.verifyAsync(refreshToken, {
        secret: 'tong',
      });
      const user = await this.rabcUserService.findById(userId);
      return generateToken(this.jwtService, user);
    } catch (error) {
      throw new UnauthorizedException('token 过期，请重新登录');
    }
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

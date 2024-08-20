import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
  Inject,
  Query,
  UnauthorizedException,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { md5 } from 'src/common/utils';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginUserVo, UserVo } from './vo/login.vo';
import { skipAuth } from 'src/common/decorator';
import { RedisService } from 'src/redis/redis.service';
import { getRolePermissionKey } from 'src/common/const';
import { UpdatePasswordDto, UpdateUserDto } from './dto/update-user.dto';
import { generateParseIntPipe } from 'src/common/pipe';
import { FindOptionsWhere, Like } from 'typeorm';
import { LoginType, User } from './entities/user.entity';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UserListVo } from './vo/user.vo';
import { RefreshTokenVo } from './vo/token.vo';
import { UserListDto } from './dto/user-list.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { storage, fileFilter } from 'src/common/utils/multer';

@ApiTags('用户模块管理')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private configService: ConfigService;

  @Inject(RedisService)
  private redisService: RedisService;

  /** 管理员账户初始化 */
  @skipAuth()
  @Get('initAdmin')
  initAdmin() {
    return this.userService.initAdmin();
  }

  /** 用户注册 */
  @skipAuth()
  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  /** 用户注册验证码 */
  @skipAuth()
  @Post('registerCaptcha')
  sendCaptcha(@Body('email') email: string) {
    return this.userService.sendCaptcha(`${email}_register_captcha`, {
      email,
      subject: '会议室预定系统注册验证码',
      html(captcha) {
        return `<div>
        您好，欢迎使用会议室预定系统！
        <h2>验证码: ${captcha}</h2>
      </div>`;
      },
    });
  }

  /** 用户登录 */
  @skipAuth()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // console.log('loginDto', loginDto);
    return this.getLoginUser(loginDto, false);
  }

  /** 管理员登录 */
  @skipAuth()
  @Post('admin/login')
  async adminLogin(@Body() loginDto: LoginDto) {
    // console.log('loginDto', loginDto);
    const user = await this.getLoginUser(loginDto, true);

    if (!user.userInfo.isAdmin) {
      throw new BadRequestException(
        '该用户不是管理员账户，请使用用户登录界面进行登录',
      );
    }
    return user;
  }

  /**
   * 获取用户信息
   */
  @Get('info')
  async getUserInfo(@Request() req) {
    // console.log('req.user', req.user);
    const [user] = await this.userService.findOne({
      id: req.user.userId,
    });
    return user;
  }

  /** 用户头像上传 */
  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: 'form-data',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'file',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      fileFilter,
      limits: {
        fileSize: 3 << 20,
      },
    }),
  )
  avatarUpload(@UploadedFile() file: Express.Multer.File) {
    // console.log('file', file);
    return file.path;
  }

  /** 冻结/解冻用户 */
  @Get('toggleFreeze')
  async freezeUser(
    @Query('id', ParseIntPipe) id: number,
    @Query('isFrozen') isFrozen: string,
  ) {
    const user = await this.userService.findOneBy({ id });
    user.isFrozen = isFrozen === 'true';
    await this.userService.updateUser(user);
    return `${isFrozen === 'true' ? '冻结' : '解冻'}用户${user.nickName}成功`;
  }

  /** 用户列表 */
  @Get('list')
  async getList(
    @Query('pageNo', new DefaultValuePipe(1), generateParseIntPipe('pageNo'))
    pageNo: number,
    @Query(
      'pageSize',
      new DefaultValuePipe(10),
      generateParseIntPipe('pageSize'),
    )
    pageSize: number,
    @Query() userListDto: UserListDto,
  ) {
    const { nickName, email, username } = userListDto;
    const condition: FindOptionsWhere<User> = {};
    if (nickName) {
      condition.nickName = Like(`%${nickName}%`);
    }
    if (email) {
      condition.email = Like(`%${email}%`);
    }
    if (username) {
      condition.username = Like(`%${username}%`);
    }
    const [users, total] = await this.userService.findUsersByPage(
      pageNo,
      pageSize,
      condition,
    );
    const list = new UserListVo();
    list.users = users;
    list.total = total;
    return list;
  }

  /** 更新密码 */
  @skipAuth()
  @Post('updatePassword')
  async updatePassword(@Body() updatePasswordDto: UpdatePasswordDto) {
    const key = `${updatePasswordDto.email}_update_password_captcha`;
    const captcha = await this.redisService.get(key);
    if (!captcha) {
      throw new UnauthorizedException('验证码已过期');
    }
    if (captcha !== updatePasswordDto.captcha) {
      throw new BadRequestException('验证码不正确');
    }
    const user = await this.userService.findOneBy({
      email: updatePasswordDto.email,
    });
    user.password = md5(updatePasswordDto.password);
    await this.userService.updateUser(user);
    await this.redisService.delete(key);
    return '修改密码成功';
  }

  /** 更新密码验证码 */
  @skipAuth()
  @Post('updatePasswordCaptcha')
  async sendUpdatePasswordCaptcha(@Body('email') email: string) {
    const user = await this.userService.findOneBy({ email }, true);
    if (!user) {
      throw new BadRequestException('该邮箱不存在对应的账户');
    }
    return this.userService.sendCaptcha(`${email}_update_password_captcha`, {
      email,
      subject: '更新密码验证码',
      html(captcha) {
        return `<div>
          您好，您正在进行更新密码操作，下面是您的验证码
          <h2>验证码: ${captcha}</h2>
        </div>`;
      },
    });
  }

  /** 更新用户信息 */
  @Post('update')
  async updateUserInfo(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const key = `${req.user.email}_update_info_captcha`;
    const captcha = await this.redisService.get(key);
    if (!captcha) {
      throw new UnauthorizedException('验证码已过期');
    }
    if (captcha !== updateUserDto.captcha) {
      throw new BadRequestException('验证码不正确');
    }
    const user = await this.userService.findOneBy({
      id: req.user.userId,
    });
    if (updateUserDto.headPic) {
      user.headPic = updateUserDto.headPic;
    }
    if (updateUserDto.nickName) {
      user.nickName = updateUserDto.nickName;
    }
    if (updateUserDto.email) {
      user.email = updateUserDto.email;
    }
    await this.userService.updateUser(user);
    await this.redisService.delete(key);
    return '更新用户信息成功';
  }

  /** 更新用户信息验证码 */
  @Post('updateCaptcha')
  async sendUpdateCaptcha(@Request() req) {
    const email: string = req.user.email;
    const user = await this.userService.findOneBy({ email }, true);
    if (!user) {
      throw new BadRequestException('该邮箱不存在对应的账户');
    }
    return this.userService.sendCaptcha(`${email}_update_info_captcha`, {
      email,
      subject: '更新用户信息',
      html(captcha) {
        return `<div>
          您好，您正在进行更新用户信息操作，下面是您的验证码
          <h2>验证码: ${captcha}</h2>
        </div>`;
      },
    });
  }

  /** token续期 */
  @skipAuth()
  @Get('refreshToken')
  async refreshToken(@Query('token') token: string) {
    try {
      const data = this.jwtService.verify(token);
      const [user] = await this.userService.findOne({
        id: data.userId,
      });
      const [access_token, refresh_token] = this.generateToken(user);
      const refreshToken = new RefreshTokenVo();
      refreshToken.access_token = access_token;
      refreshToken.refresh_token = refresh_token;
      return refreshToken;
    } catch (error) {
      throw new UnauthorizedException('token已过期');
    }
  }

  async getLoginUser(loginDto: LoginDto, isAdmin: boolean) {
    const [user, password] = await this.userService.findOne(
      {
        username: loginDto.username,
        loginType: LoginType.PASSWORD,
        // isAdmin: isAdmin,
      },
      ['roles', 'roles.permissions'],
    );
    if (password !== md5(loginDto.password)) {
      throw new BadRequestException('密码不正确');
    }
    if (user.isFrozen) {
      throw new BadRequestException('该用户已被冻结，请联系管理员解冻');
    }
    const key = getRolePermissionKey(user.username);
    this.redisService.hset(
      key,
      'role_permission',
      JSON.stringify({
        roles: user.roles,
        permissions: user.permissions,
      }),
      24 * 60 * 60,
    );
    const [access_token, refresh_token] = this.generateToken(user);

    const loginUserVo = new LoginUserVo();
    loginUserVo.userInfo = user;
    loginUserVo.access_token = access_token;
    loginUserVo.refresh_token = refresh_token;
    return loginUserVo;
  }
  // 生成 token
  generateToken(user: UserVo) {
    const access_token = this.jwtService.sign(
      {
        username: user.username,
        userId: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      {
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRE_TIME'),
      },
    );

    const refresh_token = this.jwtService.sign(
      {
        userId: user.id,
        email: user.email,
      },
      {
        expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRE_TIME'),
      },
    );

    return [access_token, refresh_token];
  }
}

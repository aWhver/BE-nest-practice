import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto, SendCaptchaDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from 'src/role/entities/role.entity';
import { Permission } from 'src/permission/entities/permission.entity';
import { RedisService } from 'src/redis/redis.service';
import { EmailService } from 'src/email/email.service';
import { md5, generateCaptcha } from 'src/common/utils';

const commonPermissions = [
  { code: 'room1', description: '万宁' },
  { code: 'room2', description: '博鳌' },
  { code: 'room3', description: '三亚' },
  { code: 'room4', description: '文昌' },
];

const permissionGroups = [
  [{ code: 'frontend', description: '前端专属会议室' }, ...commonPermissions],
  [{ code: 'tester', description: '测试专属会议室' }, ...commonPermissions],
  [{ code: 'backend', description: '后端专属会议室' }, ...commonPermissions],
  [
    { code: ' production', description: '产品专属会议室' },
    ...commonPermissions,
  ],
];

@Injectable()
export class UserService {
  @InjectRepository(User)
  private userRepository: Repository<User>;

  @Inject(RedisService)
  private redisService: RedisService;

  @Inject(EmailService)
  private emailService: EmailService;

  async create(createUserDto: CreateUserDto) {
    const key = `${createUserDto.email}_register_captcha`;
    const captcha = await this.redisService.get(key);
    if (!captcha) {
      throw new BadRequestException('验证码已过期');
    }
    if (captcha !== createUserDto.captcha) {
      throw new BadRequestException('验证码不正确');
    }
    const user = await this.findOne({ username: createUserDto.username });
    // if (user.password !== md5(user.password)) {
    //   throw new BadRequestException('密码不正确')
    // }
    if (user) {
      throw new BadRequestException('用户已存在');
    }
    const u = new User();
    u.username = createUserDto.username;
    u.password = md5(createUserDto.password);
    u.email = createUserDto.email;
    u.nickName = createUserDto.nickName;
    u.roles = ['前端', '测试', '后端', '产品'].map((text, index) => {
      const role = new Role();
      role.name = text;
      role.permissions = permissionGroups[index].map((item) => {
        const permission = new Permission();
        permission.code = item.code;
        permission.description = item.description;
        return permission;
      });
      return role;
    });
    await this.userRepository.insert(u);
    return '注册成功';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(options: FindOptionsWhere<User>) {
    const user = this.userRepository.findOne({
      where: options,
    });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async sendMail(sendCaptchaDto: SendCaptchaDto) {
    const key = `${sendCaptchaDto.email}_register_captcha`;
    const captchaInRedis = await this.redisService.get(key);
    if (captchaInRedis) {
      return '验证码5分钟内有效';
    }
    const captcha = generateCaptcha();
    this.redisService.set(key, captcha, 5 * 60);
    this.emailService.sendMail({
      to: sendCaptchaDto.email,
      subject: sendCaptchaDto.subject,
      html: `<h2>验证码: ${captcha}</h2>`,
    });
    return '发送成功';
  }
}

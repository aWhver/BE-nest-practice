import { Inject, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/global-modules/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { EmailService } from 'src/global-modules/email/email.service';
import { RedisService } from 'src/global-modules/redis/redis.service';
import { SendCaptchaDto } from './dto/create-user.dto';
import { generateCaptcha } from 'src/common/utils';

@Injectable()
export class UserService {
  @Inject(PrismaService)
  private prismaService: PrismaService;

  @Inject(EmailService)
  private emailService: EmailService;

  @Inject(RedisService)
  private redisService: RedisService;

  async create(createUserDto: Prisma.userCreateInput) {
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

  async sendCaptcha(key: string, sendCaptchaDto: SendCaptchaDto, ttl = 5 * 60) {
    const captchaInRedis = await this.redisService.get(key);
    if (captchaInRedis) {
      return `验证码${Math.ceil(ttl / 60)}分钟内有效`;
    }
    const captcha = generateCaptcha();
    this.redisService.set(key, captcha, ttl);
    this.emailService.sendEmail({
      to: sendCaptchaDto.email,
      subject: sendCaptchaDto.subject,
      html: sendCaptchaDto.html(captcha),
    });

    return '发送成功';
  }
}

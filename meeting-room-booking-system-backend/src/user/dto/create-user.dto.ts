import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import Mail from 'nodemailer/lib/mailer';
import { Readable } from 'stream';

export class CreateUserDto {
  @IsNotEmpty({
    message: '用户名不能为空',
  })
  username: string;
  @IsNotEmpty({
    message: '密码不能为空',
  })
  @MinLength(6, {
    message: '密码长度至少６位',
  })
  password: string;

  /**
   *
   * 用来显示的
   */
  @IsNotEmpty({
    message: '昵称不能为空',
  })
  nickName: string;

  @IsNotEmpty({
    message: '邮箱不能为空',
  })
  @IsEmail(
    {},
    {
      message: '不是合法的邮箱',
    },
  )
  email: string;

  @IsNotEmpty({
    message: '验证码不能为空',
  })
  captcha: string;
}

export class SendCaptchaDto {
  email: string;
  subject: string;
  html: (captcha: string) => string | Buffer | Readable | Mail.AttachmentLike;
}

import { IsNotEmpty, IsEmail, MinLength } from 'class-validator';

export class UpdateUserDto {
  headPic?: string;
  id: number;
  @IsNotEmpty({
    message: '邮箱不能为空',
  })
  @IsEmail(
    {},
    {
      message: '不是合法的邮箱格式',
    },
  )
  email: string;

  /** 验证码 */
  @IsNotEmpty({
    message: '验证码不能为空',
  })
  captcha: string;

  nickName?: string;
}

export class UpdateUserPasswordDto {
  @IsNotEmpty({
    message: '密码不能为空',
  })
  @MinLength(6, {
    message: '密码不能少于 6 位',
  })
  password: string;

  @IsNotEmpty({
    message: '邮箱不能为空',
  })
  @IsEmail(
    {},
    {
      message: '不是合法的邮箱格式',
    },
  )
  email: string;

  @IsNotEmpty({
    message: '验证码不能为空',
  })
  captcha: string;

  id: number;
}

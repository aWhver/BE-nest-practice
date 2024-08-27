import { IsNotEmpty, MinLength, IsEmail } from 'class-validator';
export class CreateUserDto {
  @IsNotEmpty({
    message: '用户名不能为空',
  })
  username: string;

  @IsNotEmpty({
    message: '密码不能为空',
  })
  @MinLength(6, {
    message: '密码至少６位数',
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

  /** 验证码 */
  @IsNotEmpty({
    message: '验证码不能为空',
  })
  captcha: string;

  /** 昵称 */
  nickName?: string;
}

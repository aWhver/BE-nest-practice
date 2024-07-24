import { IsNotEmpty } from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty({ message: '书名不能为空' })
  name: string;

  @IsNotEmpty({ message: '作者不能为空' })
  author: string;

  @IsNotEmpty({ message: '关于书的描述不能为空' })
  description: string;

  @IsNotEmpty({ message: '请上传封面' })
  cover: string;
}

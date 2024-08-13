import { BadRequestException, ParseIntPipe } from '@nestjs/common';

export const generateParseIntPipe = function (name: string) {
  return new ParseIntPipe({
    exceptionFactory() {
      throw new BadRequestException(
        `${name} 必须是数字或者可以转换成数字的字符`,
      );
    },
  });
};

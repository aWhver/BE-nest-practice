import { Controller } from '@nestjs/common';
import { AppService } from './app.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 提供给 nest-basic用
  @MessagePattern('uniqueNum')
  uniqueNum(nums: number[]): number {
    let ans = 0;
    nums.forEach((num) => {
      ans ^= num;
    });
    return ans;
  }
}

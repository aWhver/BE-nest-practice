import { Module } from '@nestjs/common';
import { InterceptorPracticeService } from './interceptor-practice.service';
import { InterceptorPracticeController } from './interceptor-practice.controller';

@Module({
  controllers: [InterceptorPracticeController],
  providers: [InterceptorPracticeService],
})
export class InterceptorPracticeModule {}

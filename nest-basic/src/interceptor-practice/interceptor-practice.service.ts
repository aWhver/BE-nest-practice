import { Injectable } from '@nestjs/common';
import { CreateInterceptorPracticeDto } from './dto/create-interceptor-practice.dto';
import { UpdateInterceptorPracticeDto } from './dto/update-interceptor-practice.dto';

@Injectable()
export class InterceptorPracticeService {
  create(createInterceptorPracticeDto: CreateInterceptorPracticeDto) {
    return 'This action adds a new interceptorPractice';
  }

  findAll() {
    return `This action returns all interceptorPractice`;
  }

  findOne(id: number) {
    return `This action returns a #${id} interceptorPractice`;
  }

  update(id: number, updateInterceptorPracticeDto: UpdateInterceptorPracticeDto) {
    return `This action updates a #${id} interceptorPractice`;
  }

  remove(id: number) {
    return `This action removes a #${id} interceptorPractice`;
  }
}

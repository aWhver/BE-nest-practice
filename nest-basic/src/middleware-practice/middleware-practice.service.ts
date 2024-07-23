import { Injectable } from '@nestjs/common';
import { CreateMiddlewarePracticeDto } from './dto/create-middleware-practice.dto';
import { UpdateMiddlewarePracticeDto } from './dto/update-middleware-practice.dto';

@Injectable()
export class MiddlewarePracticeService {
  create(createMiddlewarePracticeDto: CreateMiddlewarePracticeDto) {
    return 'This action adds a new middlewarePractice';
  }

  findAll() {
    return `This action returns all middlewarePractice`;
  }

  findOne(id: number) {
    return `This action returns a #${id} middlewarePractice`;
  }

  update(id: number, updateMiddlewarePracticeDto: UpdateMiddlewarePracticeDto) {
    return `This action updates a #${id} middlewarePractice`;
  }

  remove(id: number) {
    return `This action removes a #${id} middlewarePractice`;
  }
}

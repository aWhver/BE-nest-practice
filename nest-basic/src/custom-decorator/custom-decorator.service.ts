import { Injectable } from '@nestjs/common';
import { CreateCustomDecoratorDto } from './dto/create-custom-decorator.dto';
import { UpdateCustomDecoratorDto } from './dto/update-custom-decorator.dto';

@Injectable()
export class CustomDecoratorService {
  create(createCustomDecoratorDto: CreateCustomDecoratorDto) {
    return 'This action adds a new customDecorator';
  }

  findAll() {
    return `This action returns all customDecorator`;
  }

  findOne(id: number) {
    return `This action returns a #${id} customDecorator`;
  }

  update(id: number, updateCustomDecoratorDto: UpdateCustomDecoratorDto) {
    return `This action updates a #${id} customDecorator`;
  }

  remove(id: number) {
    return `This action removes a #${id} customDecorator`;
  }
}

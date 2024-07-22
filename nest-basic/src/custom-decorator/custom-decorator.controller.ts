import {
  Controller,
  Get,
  Post,
  Body,
  SetMetadata,
  UseGuards,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { CustomDecoratorService } from './custom-decorator.service';
import { CreateCustomDecoratorDto } from './dto/create-custom-decorator.dto';
import { CustomDecoratorGuard } from './custom-decorator.guard';
import {
  CustomDecorator,
  CombineDecorator,
  MyQuery,
  MyParam,
} from './custom-decorator.decorator';

@Controller('custom-decorator')
@SetMetadata('role', 'superadmin')
export class CustomDecoratorController {
  constructor(
    private readonly customDecoratorService: CustomDecoratorService,
  ) {}

  @Post('create')
  @CustomDecorator('employee')
  @UseGuards(CustomDecoratorGuard)
  create(@Body() createCustomDecoratorDto: CreateCustomDecoratorDto) {
    return this.customDecoratorService.create(createCustomDecoratorDto);
  }

  @Get('findAll')
  @SetMetadata('role', 'admin')
  @UseGuards(CustomDecoratorGuard)
  findAll() {
    return this.customDecoratorService.findAll();
  }
  // 封装 SetMetadata
  @Get('finduser/:id')
  @CustomDecorator('employee')
  @UseGuards(CustomDecoratorGuard)
  findOne(@Param('id') id: string) {
    return id;
  }
  // 将多个装饰器组合成一个
  @CombineDecorator('find', 'combineemployee')
  getCombineDecorator() {
    return `组合装饰器`;
  }

  // 使用 createParamDecorator创建装饰器
  @Get('parseQuery')
  getQuery(
    @Query('age', ParseIntPipe) age: number,
    @MyQuery('sex') myquery: string,
  ) {
    console.log('queryage', age, myquery);
    return `query: ${age} \n myquery: ${myquery}`;
  }
  @Get('parseParam/:id')
  getParam(@Param('id') id: string, @MyParam('id') myid: string) {
    // console.log('queryage', age, myquery);
    return `id: ${id} \n myid: ${myid}`;
  }
}

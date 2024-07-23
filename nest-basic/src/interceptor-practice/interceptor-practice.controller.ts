import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { InterceptorPracticeService } from './interceptor-practice.service';
import { CreateInterceptorPracticeDto } from './dto/create-interceptor-practice.dto';
import { UpdateInterceptorPracticeDto } from './dto/update-interceptor-practice.dto';
import { TestInterceptor } from './interceptor';

@Controller('interceptor-practice')
export class InterceptorPracticeController {
  constructor(
    private readonly interceptorPracticeService: InterceptorPracticeService,
  ) {}

  @Post()
  create(@Body() createInterceptorPracticeDto: CreateInterceptorPracticeDto) {
    return this.interceptorPracticeService.create(createInterceptorPracticeDto);
  }

  @Get()
  @UseInterceptors(TestInterceptor)
  findAll() {
    return this.interceptorPracticeService.findAll();
  }

  @Get('/delay')
  async delay() {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve('delay');
      }, 3000);
    });
    return 'delay 3000ms';
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.interceptorPracticeService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateInterceptorPracticeDto: UpdateInterceptorPracticeDto,
  ) {
    return this.interceptorPracticeService.update(
      +id,
      updateInterceptorPracticeDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.interceptorPracticeService.remove(+id);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, Next } from '@nestjs/common';
import { MiddlewarePracticeService } from './middleware-practice.service';
import { CreateMiddlewarePracticeDto } from './dto/create-middleware-practice.dto';
import { UpdateMiddlewarePracticeDto } from './dto/update-middleware-practice.dto';

@Controller('middleware-practice')
export class MiddlewarePracticeController {
  constructor(private readonly middlewarePracticeService: MiddlewarePracticeService) {}

  @Post()
  create(@Body() createMiddlewarePracticeDto: CreateMiddlewarePracticeDto) {
    return this.middlewarePracticeService.create(createMiddlewarePracticeDto);
  }

  @Get()
  findAll(@Next() next) {
    next(); // 执行下一个 handler
    return this.middlewarePracticeService.findAll();
  }

  @Get()
  nextHandler() {
    return `53545443`;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.middlewarePracticeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMiddlewarePracticeDto: UpdateMiddlewarePracticeDto) {
    return this.middlewarePracticeService.update(+id, updateMiddlewarePracticeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.middlewarePracticeService.remove(+id);
  }
}

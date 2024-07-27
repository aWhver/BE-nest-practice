import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // 该方式在多个地方使用会多次实例化，可以通过动态模块来处理，用注入的方式共享一个实例
  private logger = new Logger();

  @Get()
  getHello(): string {
    this.logger.log('helloe logger', AppController.name);
    throw new Error('kkkk');
    return this.appService.getHello();
  }
}

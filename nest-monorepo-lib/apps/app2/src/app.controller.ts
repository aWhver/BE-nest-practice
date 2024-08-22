import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { Lib1Service } from '@app/lib1';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Inject(Lib1Service)
  private lib1Servie: Lib1Service;

  @Get()
  getHello(): string {
    return this.appService.getHello() + this.lib1Servie.getLibName();
  }
}

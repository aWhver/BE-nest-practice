import { Controller, Get, Param, Query, Sse } from '@nestjs/common';
import { AppService } from './app.service';
import { Observable } from 'rxjs';
import { exec } from 'child_process';
import * as os from 'os';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('sayhi')
  getHello(): string {
    return this.appService.getHello();
  }

  @Sse('stream/:user')
  stream(@Param('user') user: string, @Query('msgType') msgType: string) {
    console.log('user, msgType', user, msgType);
    const childProcess = exec('tail -f ./src/sse.txt');

    return new Observable((observe) => {
      observe.next('立即推送的消息');
      childProcess.stdout.on('data', (msg) => {
        console.log('msg', msg);
        observe.next(msg);
      });
      // setTimeout(() => {
      //   observe.next('延时3s的消息');
      // }, 3000);
    });
  }

  @Get('cpus')
  getCpus() {
    return os.cpus();
  }
}

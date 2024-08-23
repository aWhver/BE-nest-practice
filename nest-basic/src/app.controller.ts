import { Controller, Get, Inject, Param, Query, Sse } from '@nestjs/common';
import { AppService } from './app.service';
import { Observable } from 'rxjs';
import { exec } from 'child_process';
import * as os from 'os';
import { EtcdService } from './etcd/etcd.service';

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

  /* @Inject(EtcdService)
  edctService: EtcdService;

  @Get('put')
  async put(@Query('num') num: string) {
    this.edctService.watchSerice('4', (data) => {
      console.log('data', data);
    });
    await this.edctService.put('services/4', num);
    return 'success';
  }

  @Get('get')
  get() {
    return this.edctService.get('services/4');
  }

  @Get('delete')
  async delete() {
    await this.edctService.delete('services/4');
    return 'deleted';
  } */
}

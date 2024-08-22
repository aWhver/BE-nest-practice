import { Controller, Get, Inject, Query } from '@nestjs/common';
import { MocroServicesTestService } from './mocro-services-test.service';
import { Client, ClientProxy } from '@nestjs/microservices';

// 连接的时该仓库下的 micro-services服务

@Controller('mocroServicesTest')
export class MocroServicesTestController {
  constructor(
    private readonly mocroServicesTestService: MocroServicesTestService,
  ) {}

  @Inject('ALGORITHM_SERVICE')
  private algorithmClient: ClientProxy;

  // 使用 Client 不会立即连接(nest应用启动时),而是在微服务被调用之前连接
  // 而且更难被测试，和共享客户端实例，更推荐使用提供器的方式，
  // 将微服务的配置写到配置文件中，用 configService获取，这样更安全
  // @Client({ options: { port: 8888 } })
  // algorithmClient: ClientProxy;

  @Get('uniqueNum')
  getUniqueNum(@Query('nums') nums: string) {
    return this.algorithmClient.send('uniqueNum', nums.split(','));
  }
}

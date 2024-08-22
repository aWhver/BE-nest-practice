import { Global, Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { algorithmSvcOpt } from '../config';

const algorithmSvcConfig = algorithmSvcOpt();

@Global()
@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ALGORITHM_SERVICE',
        transport: algorithmSvcConfig.transport,
        options: {
          port: algorithmSvcConfig.options.port,
        },
      },
    ]),
  ],
})
export class MicroServicesModule {}

import { Module } from '@nestjs/common';
import { MocroServicesTestService } from './mocro-services-test.service';
import { MocroServicesTestController } from './mocro-services-test.controller';
import { ClientProxyFactory } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
@Module({
  controllers: [MocroServicesTestController],
  providers: [
    MocroServicesTestService,
    {
      provide: 'ALGORITHM_SERVICE',
      useFactory: (configService: ConfigService) => {
        const { transport, options } = configService.get('algorithmSvcOpt');
        return ClientProxyFactory.create({
          transport,
          options: options,
        });
      },
      inject: [ConfigService],
    },
  ],
})
export class MocroServicesTestModule {}

import { DynamicModule, Module } from '@nestjs/common';
import { EtcdService } from './etcd.service';
import { Etcd3, IOptions } from 'etcd3';

export const ETCD_CLIENT_TOKEN = 'ETCD_CLIENT_TOKEN';
export const ETCD_OPTION_TOKEN = 'ETCD_OPTION_TOKEN';

interface IOptionsAsync {
  useFactory: (...args: any[]) => Promise<IOptions> | IOptions;
  inject: any[];
}

@Module({})
export class EtcdModule {
  static forRoot(option: IOptions): DynamicModule {
    return {
      module: EtcdModule,
      providers: [
        EtcdService,
        {
          provide: ETCD_CLIENT_TOKEN,
          useFactory(option: IOptions) {
            return new Etcd3(option);
          },
          inject: [ETCD_OPTION_TOKEN],
        },
        {
          provide: ETCD_OPTION_TOKEN,
          useValue: option,
        },
      ],
      exports: [EtcdService],
    };
  }

  static forRootAsync(option: IOptionsAsync): DynamicModule {
    return {
      module: EtcdModule,
      providers: [
        EtcdService,
        {
          provide: ETCD_CLIENT_TOKEN,
          useFactory(option: IOptions) {
            return new Etcd3(option);
          },
          inject: [ETCD_OPTION_TOKEN],
        },
        {
          provide: ETCD_OPTION_TOKEN,
          useFactory: option.useFactory,
          inject: option.inject || [],
        },
      ],
      exports: [EtcdService],
    };
  }
}

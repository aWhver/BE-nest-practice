import { DynamicModule, Module } from '@nestjs/common';
import { DbModuleService } from './db-module.service';
import { IOptions } from 'src/types';
import { OPTIONS } from 'src/constants';

@Module({})
export class DbModuleModule {
  static register(options: IOptions): DynamicModule {
    return {
      module: DbModuleModule,
      providers: [
        DbModuleService,
        {
          provide: OPTIONS,
          useValue: options,
        },
      ],
      exports: [DbModuleService],
    };
  }
}

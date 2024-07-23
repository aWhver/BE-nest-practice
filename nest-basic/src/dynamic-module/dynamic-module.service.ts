import { Inject, Injectable } from '@nestjs/common';
import { CreateDynamicModuleDto } from './dto/create-dynamic-module.dto';
import { UpdateDynamicModuleDto } from './dto/update-dynamic-module.dto';
import {
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
} from './dynamic.module-definition';

@Injectable()
export class DynamicModuleService {
  // constructor(@Inject('CONFIG_OPTION') private config: Record<string, any>) {}
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private config: typeof OPTIONS_TYPE,
  ) {}
  create(createDynamicModuleDto: CreateDynamicModuleDto) {
    return 'This action adds a new dynamicModule';
  }

  findAll() {
    console.log('this.config', this.config);
    return `config: ${JSON.stringify(this.config)}`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dynamicModule`;
  }

  update(id: number, updateDynamicModuleDto: UpdateDynamicModuleDto) {
    return `This action updates a #${id} dynamicModule`;
  }

  remove(id: number) {
    return `This action removes a #${id} dynamicModule`;
  }
}

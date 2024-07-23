/* import { Module, DynamicModule } from '@nestjs/common';
import { DynamicModuleService } from './dynamic-module.service';
import { DynamicModuleController } from './dynamic-module.controller';

// 第一种动态模块
// 动态模块相当于将 Module的配置迁移至 register方法的返回值里，
// imports的时候也需要改变下方式
@Module({})
export class DynamicModuleModule {
  static register(option: Record<string, any>): DynamicModule {
    return {
      // 可以根据 option参数动态引入模块,controllers、providers、exports
      module: DynamicModuleModule, // 这个 module可以是从其他地方引进来的
      controllers: [DynamicModuleController],
      providers: [
        {
          provide: 'CONFIG_OPTION',
          useValue: option,
        },
        DynamicModuleService,
      ],
      exports: [],
    };
  }
} */
// 第二种动态模块
import { Module } from '@nestjs/common';
import { DynamicModuleService } from './dynamic-module.service';
import { DynamicModuleController } from './dynamic-module.controller';
import { ConfigurableModuleClass } from './dynamic.module-definition';

@Module({
  controllers: [DynamicModuleController],
  providers: [DynamicModuleService],
})
export class DynamicModuleModule extends ConfigurableModuleClass {}

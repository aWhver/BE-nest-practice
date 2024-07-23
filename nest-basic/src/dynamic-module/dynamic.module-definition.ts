import { ConfigurableModuleBuilder } from '@nestjs/common';
interface IOption {
  name: string;
  age: number;
}

// export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
//   new ConfigurableModuleBuilder<IOption>().build();

// 这个setExtras设置的是属性的默认值，实际使用的值是通过 register/forRoot传入的选项决定，但是却不包含在OPTIONS_TYPE里，
// 通过配置注册的额外属性其实是做了限定的，就是DynamicModule的定义，不在这些定义里，传递了也没意义
// 下面的 global通过isGlobal传递给了模块配置，但是属性本身不在OPTIONS_TYPE，在代码里是获取不到的
export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<IOption>()
    .setClassMethodName('forRoot')
    .setExtras(
      {
        isGlobal: true,
      },
      (definition, extras) => {
        console.log('definition', definition, extras.isGlobal);
        return {
          ...definition,
          global: extras.isGlobal,
        };
      },
    )
    .build();

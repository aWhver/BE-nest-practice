import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MiddlewarePracticeService } from './middleware-practice.service';
import { MiddlewarePracticeController } from './middleware-practice.controller';
import { TestMiddleware, createFnMiddleware } from './middleware';

// middleware可以用 class的形式，也可以用函数形式
// 函数形式的话不具备依赖注入，和 express的中间件（use(middleware)）没区别
@Module({
  controllers: [MiddlewarePracticeController],
  providers: [MiddlewarePracticeService],
})
export class MiddlewarePracticeModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TestMiddleware, createFnMiddleware('a')).forRoutes('*');
  }
}

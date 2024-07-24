import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomDecoratorModule } from './custom-decorator/custom-decorator.module';
import { DynamicModuleModule } from './dynamic-module/dynamic-module.module';
import { MiddlewarePracticeModule } from './middleware-practice/middleware-practice.module';
import { InterceptorPracticeModule } from './interceptor-practice/interceptor-practice.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalInterceptor } from './interceptor-practice/interceptor';
import { MulterUploadModule } from './multer-upload/multer-upload.module';

@Module({
  imports: [
    CustomDecoratorModule,
    // DynamicModuleModule.register({ name: 'zhao', age: 29, isGlobal: true }),
    DynamicModuleModule.forRoot({ name: 'zhao', age: 29, isGlobal: false }),
    MiddlewarePracticeModule,
    InterceptorPracticeModule,
    MulterUploadModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: GlobalInterceptor,
    },
  ],
})
export class AppModule {}

import {
  Injectable,
  CallHandler,
  NestInterceptor,
  ExecutionContext,
  Logger,
  Inject,
} from '@nestjs/common';
import { Observable, tap, map, timeout, catchError, throwError } from 'rxjs';
import { AppService } from 'src/app.service';

@Injectable()
export class TestInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const time = Date.now();
    return next.handle().pipe(
      tap(() => {
        console.log('time', Date.now() - time);
      }),
      map((data: string) => ({
        data,
        code: 200,
        message: '请求成功',
      })),
    );
  }
}

// 如果用 app.useGlobalInterceptor是无法进行依赖注入
// 用全局的 APP_INTERCEPTOR是可以的
// 路由级别的拦截器优先级高于全局
@Injectable()
export class GlobalInterceptor implements NestInterceptor {
  @Inject(AppService)
  private readonly appService: AppService;

  private readonly logger = new Logger(GlobalInterceptor.name);
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    return next.handle().pipe(
      timeout(3000),
      tap((data) => {
        console.log('app', this.appService.getHello());
        this.logger.log(`logger: ${data}`);
      }),
      map((data) => data),
      catchError((err) => {
        this.logger.error(err.message, err.stack);
        return throwError(() => err);
      }),
    );
  }
}

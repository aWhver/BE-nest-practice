import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, map, of } from 'rxjs';
// import { Response } from 'express';

export class ResInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    // const http = context.switchToHttp();
    // const res = http.getResponse<Response>();
    // console.log('res', res.);

    return next.handle().pipe(
      map((data) => {
        return {
          data,
          code: HttpStatus.OK,
          message: '请求成功',
        };
      }),
      catchError((err) => {
        console.log('err', err);
        return of({
          data: '',
          code: 400,
          message: err?.response?.message || '出错',
        });
      }),
    );
  }
}

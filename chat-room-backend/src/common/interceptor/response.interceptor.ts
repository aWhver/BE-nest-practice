import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, map, tap, throwError, timeout } from 'rxjs';
import { Response } from 'express';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  logger = new Logger();
  intercept(context: ExecutionContext, next: CallHandler<any>) {
    const http = context.switchToHttp();
    const res = http.getResponse<Response>();
    this.logger.debug(
      `Request: [Class] ${context.getClass().name} [Handler] ${context.getHandler().name} invoked...`,
    );
    return next.handle().pipe(
      timeout(10000),
      map((resp) => {
        if (res.statusCode === HttpStatus.CREATED) {
          res.status(HttpStatus.OK);
        }
        if (resp?.statusCode === HttpStatus.FOUND) {
          res.redirect(resp.url);
        }
        let code = 200;
        let data = resp;
        let message = '请求成功';
        if (Object.prototype.toString.call(resp) === '[object Object]') {
          code = resp.code || 200;
          data = resp.data || resp;
          message = resp.message || '请求成功';
        }
        return {
          code,
          data,
          message,
        };
      }),
      tap((data) => {
        this.logger.log(`Response: ${JSON.stringify(data.data, null, 2)}`);
      }),
      catchError((err) => {
        console.log('err', err);
        return throwError(() => err);
      }),
    );
  }
}

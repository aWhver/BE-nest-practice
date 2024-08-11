import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Observable, catchError, map, of, tap } from 'rxjs';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseInterceptor.name);
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const http = context.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<Request>();
    const { method, path, ip } = request;
    // console.log('realIp', requestIp.getClientIp(ip));
    const ua = request.headers['user-agent'];
    this.logger.debug(
      `Request: ${method} ${ip}${path} ${ua} Class:${
        context.getClass().name
      } Handler:${context.getHandler().name} invoked`,
    );
    const now = Date.now();
    return next.handle().pipe(
      map((data: any) => {
        if (data.statusCode === HttpStatus.FOUND) {
          // 这个不生效，不知道什么原因
          // response.setHeader('location', data.url);
          response.redirect(data.url);
          return;
        }
        if (response.statusCode === HttpStatus.CREATED) {
          response.status(200);
        }
        return {
          code: 200,
          data,
          message: '请求成功',
        };
      }),
      tap((data) => {
        this.logger.debug(
          `${method} ${ip}${path} ${ua} status:${response.statusCode} ${Date.now() - now}ms`,
        );
        this.logger.log(`Response: ${JSON.stringify(data.data)}`);
      }),
      catchError((error) => {
        this.logger.error(error);
        response.status(error.status);
        return of({
          code: 500,
          data: error,
          message: '请求出错了',
        });
      }),
    );
  }
}

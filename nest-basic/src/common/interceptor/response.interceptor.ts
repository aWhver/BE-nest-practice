import {
  CallHandler,
  ExecutionContext,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, catchError, map, of, tap } from 'rxjs';

export class ResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseInterceptor.name);
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      tap((data) => {
        this.logger.log(`logger: ${data}`);
      }),
      catchError((error) => {
        this.logger.error(error);
        return of(new Error(error));
      }),
      map((data: any) => {
        if (response.statusCode === 201) {
          response.status(200);
        }

        return {
          code: 200,
          data,
          message: '请求成功',
        };
      }),
    );
  }
}

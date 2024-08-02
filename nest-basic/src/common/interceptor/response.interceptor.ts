import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, catchError, map, of, tap } from 'rxjs';

@Injectable()
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

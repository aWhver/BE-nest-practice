import { Response } from 'express';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

interface ExceptionRes extends Record<string, any> {
  statusCode: HttpStatus;
  message: string;
}

interface ExceptionOptions {
  response: string | ExceptionRes;
  status: HttpStatus;
  code?: number;
}

export class CustomException extends HttpException {
  constructor(options: ExceptionOptions) {
    super(options.response, options.status);
    // this.message =
    //   Object.prototype.toString.call(options.response) === '[object Object]'
    //     ? (options.response as ExceptionRes).message
    //     : (options.response as string) || '请求出错了';
    this.code = options.code || 500;
  }

  message: string;

  code: number;
}

@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const status = exception.getStatus();
    let message = exception.message;
    const responseMsg = (exception.getResponse() as any).message;
    if (responseMsg) {
      if (Array.isArray(responseMsg)) {
        message = responseMsg.join(';');
      } else {
        message = responseMsg;
      }
    }
    res
      .status(status)
      .json({
        code: status,
        data: message,
        message: '请求出错了',
      })
      .end();
  }
}

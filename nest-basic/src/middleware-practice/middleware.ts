import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';
import { MiddlewarePracticeService } from './middleware-practice.service';

@Injectable()
export class TestMiddleware implements NestMiddleware {
  constructor(
    private readonly middlewarePracticeService: MiddlewarePracticeService,
  ) {}
  use(req: Request, res: Response, next: () => void) {
    // console.log('error', req);
    console.log('before', this.middlewarePracticeService.findAll());
    next(); // 接着执行下一个中间件
    console.log('after');
  }
}

// 函数式中间件
export function createFnMiddleware(args) {
  return (req: Request, res: Response, next: () => void) => {
    console.log('args', args);
    next();
  };
}

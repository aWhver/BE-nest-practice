import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

// express-session的类型下是没有 user的，这里不声明 request取不到 user
declare module 'express-session' {
  interface Session {
    user: {
      username: string;
    };
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    // console.log('req', req.session);
    if (!req.session?.user?.username) {
      throw new UnauthorizedException('用户未登录');
    }
    return true;
  }
}

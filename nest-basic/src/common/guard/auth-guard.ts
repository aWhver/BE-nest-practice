import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';

declare module 'express-session' {
  interface Session {
    user: {
      username: string;
    };
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    console.log('req', req.session);
    if (!req.session?.user?.username) {
      throw new UnauthorizedException('用户未登录');
    }
    return true;
  }
}

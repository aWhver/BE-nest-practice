import {
  ExecutionContext,
  Inject,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { Observable } from 'rxjs';

const SKIP_AUTH = 'SKIP_AUTH';
export const skipAuth = () => SetMetadata(SKIP_AUTH, true);

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  @Inject(Reflector)
  reflector: Reflector;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    console.log('req.user', req.user);
    const skipAuth = this.reflector.getAllAndOverride(SKIP_AUTH, [
      context.getClass(),
      context.getHandler(),
    ]);
    if (skipAuth) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    console.log('err', err);
    console.log('user', user);
    console.log('info', info);
    console.log('status', status);
    if (err || !user) {
      throw new UnauthorizedException(err || '未登录');
    }
    return user;
  }
}

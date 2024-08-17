import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { SKIP_AUTH } from '../const';

interface JwtUser {
  username: string;
  userId: number;
  email: string;
  isAdmin: boolean;
}

declare module 'express' {
  interface Request {
    user: JwtUser;
  }
}

@Injectable()
export class LoginGuard implements CanActivate {
  @Inject(Reflector)
  reflector: Reflector;

  @Inject(JwtService)
  private readonly jwtService: JwtService;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const skipAuth = this.reflector.getAllAndOverride(SKIP_AUTH, [
      context.getClass(),
      context.getHandler(),
    ]);

    if (skipAuth) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const auth = (request.headers['authorization'] || '').split(' ')[1];
    if (!auth) {
      throw new UnauthorizedException('未登录，请先登录再使用');
    }
    try {
      const data = this.jwtService.verify<JwtUser>(auth);
      request.user = {
        username: data.username,
        userId: data.userId,
        email: data.email,
        isAdmin: data.isAdmin,
      };
    } catch (error) {
      throw new UnauthorizedException('token过期，请重新登录');
    }
    return true;
  }
}

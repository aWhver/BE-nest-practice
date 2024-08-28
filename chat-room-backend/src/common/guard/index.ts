import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SKIP_AUTH } from '../const';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';

interface JwtUser {
  userId: number;
  username: string;
  email: string;
}

declare module 'express' {
  interface Request {
    user: JwtUser;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  @Inject(Reflector)
  reflector: Reflector;

  @Inject(JwtService)
  jwtService: JwtService;

  canActivate(context: ExecutionContext): boolean {
    const skipAuth = this.reflector.getAllAndOverride(SKIP_AUTH, [
      context.getClass(),
      context.getHandler(),
    ]);
    if (skipAuth) {
      return true;
    }
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const token = this.getToken(req);
    if (!token) {
      throw new UnauthorizedException('用户未登录');
    }
    try {
      const data = this.jwtService.verify<JwtUser & { exp: number }>(token);
      req.user = {
        userId: data.userId,
        username: data.username,
        email: data.email,
      };
      const days = (data.exp * 1000 - Date.now()) / 1000 / 3600 / 24;
      if (days >= 0 && days <= 1) {
        const token = this.jwtService.sign(
          {
            userId: data.userId,
            username: data.username,
            email: data.email,
          },
          { expiresIn: '7d' },
        );
        res.header('token', token);
      }
      return true;
    } catch (error) {
      throw new UnauthorizedException('token 已过期，请重新登录');
    }
  }

  getToken(req: Request) {
    const [type, token] = (req.headers.authorization || '').split(' ');
    return type === 'Bearer' ? token : '';
  }
}

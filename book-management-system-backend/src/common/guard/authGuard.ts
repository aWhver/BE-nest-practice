import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { SECRET, SKIP_AUTH } from 'src/constants';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuthGuard implements CanActivate {
  @Inject(JwtService)
  JwtService: JwtService;

  @Inject(Reflector)
  reflector: Reflector;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isSkipAuth = this.reflector.getAllAndOverride(SKIP_AUTH, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isSkipAuth) {
      return true;
    }
    const req = context.switchToHttp().getRequest<Request>();
    const token = this.getToken(req);
    if (!token) {
      new UnauthorizedException('请先登录');
    }
    try {
      await this.JwtService.verifyAsync(token, {
        secret: SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException('登录失效，请重新登录');
    }

    return true;
  }

  private getToken(req: Request): string {
    const [type, token] = req.headers.authorization?.split(' ') || [];
    return type === 'Bearer' ? token : undefined;
  }
}

export const skipAuth = () => SetMetadata(SKIP_AUTH, true);

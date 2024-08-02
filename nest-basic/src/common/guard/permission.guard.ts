import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';
import { API_PERMISSION } from '../const';
import { RedisService } from 'src/redis/redis.service';

// express-session的类型下是没有 user的，这里不声明 request取不到 user
declare module 'express-session' {
  interface Session {
    user: {
      username: string;
    };
  }
}

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject(UserService)
  private userService: UserService;

  @Inject(RedisService)
  private readonly redisService: RedisService;

  @Inject(Reflector)
  private reflector: Reflector;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    console.log('req', req.session);
    const username = req.session?.user?.username;
    if (!username) {
      throw new UnauthorizedException('用户未登录');
    }
    // console.log('permissionService', this.redisService);
    const key = `${username}-${API_PERMISSION}`;
    let userPermissionCodes = await this.redisService.listGet(key);
    // console.log('userPermissions', userPermissionCodes);
    if (userPermissionCodes.length === 0) {
      const user = await this.userService.findByUsername(username);
      userPermissionCodes = user.permissions.map((p) => p.permissionCode);
      this.redisService.listSet(key, userPermissionCodes, 3600);
    }

    const handlerPermissions = this.reflector.get(
      API_PERMISSION,
      context.getHandler(),
    );
    // 没有设置值就不限制
    if (!handlerPermissions) {
      return true;
    }
    const hasPermission = userPermissionCodes.some((permissionCode) =>
      handlerPermissions.includes(permissionCode),
    );
    // console.log('handlerPermissions', handlerPermissions);
    // console.log('permissions', permissions);
    if (!hasPermission) {
      throw new UnauthorizedException('无该接口权限');
    }

    return true;
  }
}

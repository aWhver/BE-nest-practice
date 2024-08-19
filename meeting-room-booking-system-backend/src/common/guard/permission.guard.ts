import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from 'src/redis/redis.service';
import { ROLE_PERMISSION, getRolePermissionKey } from '../const';
import { Request } from 'express';

@Injectable()
export class PermissionGuard implements CanActivate {
  @Inject(Reflector)
  private reflector: Reflector;

  @Inject(RedisService)
  private readonly redisService: RedisService;

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    console.log('request.user', request.user);
    if (!request.user) {
      return true;
    }
    const data = this.reflector.getAllAndOverride<string[]>(ROLE_PERMISSION, [
      context.getClass(),
      context.getHandler(),
    ]);
    console.log('data', data);
    if (!data) {
      return true;
    }
    // console.log('request.user', data);
    const rolePermission = await this.redisService.hget(
      getRolePermissionKey(request.user.username),
      // getRolePermissionKey('juntong'),
      'role_permission',
    );
    const oRolePermission = JSON.parse(rolePermission);
    const hasPermission = oRolePermission.permissions.some((p) =>
      data.includes(p.code),
    );
    console.log('hasPermission', hasPermission);
    if (!hasPermission) {
      // throw new BadRequestException('您没有该接口权限');
      throw new BadRequestException(
        `您的角色权限为 production，没有该接口权限`,
      );
    }
    // console.log('rolePermission', JSON.parse(rolePermission));
    return true;
  }
}

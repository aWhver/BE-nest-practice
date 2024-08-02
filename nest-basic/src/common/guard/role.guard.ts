import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { ROLE_PERMISSION } from '../const';
import { RabcUserService } from 'src/rabc-user/rabc-user.service';
import { RoleService } from 'src/role/role.service';
import { RedisService } from 'src/redis/redis.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RoleGuard implements CanActivate {
  @Inject(RabcUserService)
  private rabcUserService: RabcUserService;

  @Inject(RoleService)
  private roleService: RoleService;

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(Reflector)
  private reflector: Reflector;

  @Inject(RedisService)
  private readonly redisService: RedisService;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request = context.switchToHttp().getRequest();
    const token = this.getToken(req);
    if (!token) {
      throw new UnauthorizedException('用户未登录');
    }
    const rolePermissions = this.reflector.get(
      ROLE_PERMISSION,
      context.getHandler(),
    );
    if (!rolePermissions) {
      return true;
    }
    try {
      const { username } = await this.jwtService.verifyAsync(token, {
        secret: 'tong',
      });
      console.log('username', username);
      const key = `${username}-${ROLE_PERMISSION}`;
      let rolePermissionCodes = await this.redisService.listGet(key);
      if (rolePermissionCodes.length === 0) {
        const user = await this.rabcUserService.findByUsername(username);
        // console.log('roles', user);
        const roleIds = user.roles.map((role) => role.id);
        const roles = await this.roleService.findByRoleIds(roleIds);
        // console.log('roles', roles);
        rolePermissionCodes = roles
          .map((role) => role.permissions)
          .flat()
          .map((permission) => permission.permissionCode);
        this.redisService.listSet(key, rolePermissionCodes, 3600);
      }

      const hasPermission = rolePermissionCodes.some((roleId) =>
        rolePermissions.includes(roleId),
      );
      console.log('hasPermission', hasPermission);
      if (!hasPermission) {
        throw new ForbiddenException('该用户角色没有该接口的权限');
      }
      return true;
    } catch (error) {
      if (error.response.statusCode === 403) {
        throw new ForbiddenException(error.response.message);
      }
      if (!token) {
        throw new UnauthorizedException('登录已过期，请重新登录');
      }
    }
  }

  private getToken(req: Request) {
    const authorization = req.headers.authorization || '';
    const [type, token] = authorization.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}

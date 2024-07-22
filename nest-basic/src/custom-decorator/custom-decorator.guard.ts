import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class CustomDecoratorGuard implements CanActivate {
  @Inject(Reflector)
  reflector: Reflector;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // 如果想要拿到 class上的元数据，第二个参数传入 context.getClass()
    console.log('role', this.reflector.get('role', context.getHandler()));
    // getAllAndOverride返回第一个非空的 metadata
    const roleshandler = this.reflector.getAllAndOverride('role', [
      context.getHandler(),
      context.getClass(),
    ]);
    const rolesclass = this.reflector.getAllAndOverride('role', [
      context.getClass(),
      context.getHandler(),
    ]);
    console.log('roleshandler', roleshandler);
    console.log('rolesclass', rolesclass);
    console.log(
      'getAll',
      this.reflector.getAll('role', [context.getHandler(), context.getClass()]),
    );
    return true;
  }
}

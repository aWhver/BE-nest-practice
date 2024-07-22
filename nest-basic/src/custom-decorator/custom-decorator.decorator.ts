import {
  ExecutionContext,
  Get,
  SetMetadata,
  UseGuards,
  applyDecorators,
  createParamDecorator,
} from '@nestjs/common';
import { CustomDecoratorGuard } from './custom-decorator.guard';

export const CustomDecorator = (...args: string[]) => SetMetadata('role', args);

export const CombineDecorator = (path: string, role) =>
  applyDecorators(
    Get(path),
    CustomDecorator(role),
    UseGuards(CustomDecoratorGuard),
  );

export const CreateDecorator = (type) =>
  createParamDecorator((key: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return key ? req[type][key] : req[type];
  });

export const MyQuery = CreateDecorator('query');
export const MyParam = CreateDecorator('params');

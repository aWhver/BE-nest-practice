import {
  ExecutionContext,
  SetMetadata,
  createParamDecorator,
} from '@nestjs/common';
import { SKIP_AUTH } from '../const';
import { Request } from 'express';

export const SkipAuth = () => SetMetadata(SKIP_AUTH, true);

export const UserInfo = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest<Request>();
    if (!req.user) {
      return null;
    }
    return data ? req.user[data] : req.user;
  },
);

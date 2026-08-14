import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '@bookstore/shared';

export interface AuthUser {
  username?: string;
  accountId?: number;
  clientId?: string;
  scopes: string[];
  authorities: string[];
  payload: JwtPayload;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

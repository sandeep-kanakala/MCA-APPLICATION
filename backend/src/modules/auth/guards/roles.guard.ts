import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IUserToken } from '~/interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const { user }: { user: IUserToken } = context.switchToHttp().getRequest();
    const roles =
      user?.roles?.length > 0
        ? user.roles.map((i: { name: string }) => i?.name)
        : [];

    if (!Array.isArray(requiredRoles) || !Array.isArray(roles)) {
      throw new ForbiddenException('Access denied: insufficient permissions');
    }

    if (!requiredRoles.some((role: string) => roles.includes(role))) {
      throw new ForbiddenException('Access denied: insufficient permissions');
    }

    return true;
  }
}

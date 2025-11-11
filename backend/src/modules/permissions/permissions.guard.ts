import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { IUserToken } from '~/interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no specific permissions are required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const { user }: { user: IUserToken } = context.switchToHttp().getRequest();

    if (!user) throw new ForbiddenException('User not found');

    // Collect all permissions across all roles
    const userPermissions: string[] = [];

    if (user.roles && Array.isArray(user.roles)) {
      for (const role of user.roles) {
        if (role.permissions && Array.isArray(role.permissions)) {
          for (const perm of role.permissions) {
            userPermissions.push(perm.name);
          }
        }
      }
    }

    // Check if the user has all required permissions
    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission)
      throw new ForbiddenException(`Missing required permissions`);

    return true;
  }
}

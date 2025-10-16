import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AbilityBuilder, PureAbility } from '@casl/ability';
import { User } from '@prisma/client';

export type Actions = 'create' | 'read' | 'update' | 'delete';
export type Subjects = 'all' | 'User' | 'Role' | 'Permission';
export type AppAbility = PureAbility<[string, string]>;

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: { ability: AppAbility; user: User } = context
      .switchToHttp()
      .getRequest();
    const userId = req.user.id;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return false;

    req.ability = await this.createForUser(user);
    return true;
  }

  async createForUser(user: User) {
    const { can, build } = new AbilityBuilder<AppAbility>(PureAbility);

    if (user.role === 'SUPER_ADMIN') {
      can('manage', 'all');
      return build();
    }

    const permissions = await this.prisma.permission.findMany({
      where: { role: user.role, active: true },
      select: { subject: true, action: true },
    });

    if (permissions?.length > 0) {
      permissions.forEach((p) =>
        can(p.action as Actions, p.subject as Subjects),
      );
    }

    return build();
  }
}

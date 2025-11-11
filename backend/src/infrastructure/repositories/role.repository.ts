import { Injectable } from '@nestjs/common';
import { Role, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByRoleName(name: string, tenantId?: string): Promise<Role | null> {
    return this.prisma.role.findFirst({
      where: { tenantId, name },
    });
  }

  async AssignPermissionsToRole(data: Prisma.RoleCreateInput): Promise<Role> {
    return this.prisma.role.create({
      data,
    });
  }
}

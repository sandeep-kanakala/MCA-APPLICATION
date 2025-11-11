import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PermissionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createPermissions(
    data: Prisma.PermissionCreateManyInput[],
    skipDuplicates?: boolean,
  ): Promise<{ count: number }> {
    return this.prisma.permission.createMany({
      data,
      skipDuplicates,
    });
  }
}

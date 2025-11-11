import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TenantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByTenantId(tenantId: string) {
    return this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
  }

  async createtenant(tenantData: Prisma.TenantCreateInput) {
    return this.prisma.tenant.create({
      data: tenantData,
    });
  }
}

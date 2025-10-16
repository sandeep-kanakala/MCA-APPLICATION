// src/common/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class TenantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByTenantId(tenantId: string) {
    return this.prisma.tenant.findUnique({
      where: { id: tenantId }
    });
  }


  async createtenant(tenantData){
    return this.prisma.tenant.create({
      data:tenantData
    })
  }
}

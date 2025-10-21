import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByName(name: string, tenantId: string) {
    return this.prisma.account.findFirst({
      where: { name, tenantId, isArchived: false },
    });
  }

  async findById(id: string) {
    return this.prisma.account.findFirst({
      where: { id, isArchived: false },
    });
  }

  async createAccount(data: Prisma.AccountCreateInput) {
    return this.prisma.account.create({
      data,
    });
  }

  async updateAccount(id: string, data: Prisma.AccountUpdateInput) {
    return this.prisma.account.update({
      where: { id },
      data,
    });
  }

  async archiveAccount(id: string, updatedById: string) {
    return this.prisma.account.update({
      where: { id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
        updatedById,
      },
    });
  }

  async countAll() {
    return this.prisma.account.count({
      where: { isArchived: false },
    });
  }

  async getPaginated(skip: number, take: number) {
    return this.prisma.account.findMany({
      where: { isArchived: false },
      select: {
        id: true,
        name: true,
        type: true,
        industry: true,
        website: true,
        phone: true,
        billingStreet: true,
        billingCity: true,
        billingState: true,
        billingPostal: true,
        billingCountry: true,
        shippingStreet: true,
        shippingCity: true,
        shippingState: true,
        shippingPostal: true,
        shippingCountry: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }
}

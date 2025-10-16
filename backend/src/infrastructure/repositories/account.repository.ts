import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class AccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByName(name: string, tenantId: string) {
    return this.prisma.account.findFirst({
      where: { name, tenantId, isArchived: false },
    });
  }

  findById(id: string) {
    return this.prisma.account.findFirst({
      where: { id, isArchived: false },
    });
  }

  createAccount(data: any) {
    return this.prisma.account.create({
      data,
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
    });
  }

  updateAccount(id: string, data: any) {
    return this.prisma.account.update({
      where: { id },
      data,
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
    });
  }

  archiveAccount(id: string, updatedById: string) {
    return this.prisma.account.update({
      where: { id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
        updatedById,
      },
    });
  }

  countAll() {
    return this.prisma.account.count({
      where: { isArchived: false },
    });
  }

  getPaginated(skip: number, take: number) {
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

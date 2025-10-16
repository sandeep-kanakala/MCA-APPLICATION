import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ContactRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createContact(
    data: Prisma.ContactCreateInput,
    select?: Prisma.ContactSelect,
  ) {
    return this.prisma.contact.create({
      data,
      select,
    });
  }

  async findContactsByAccountId(
    accountId: string,
    skip = 0,
    take = 10,
    select?: Prisma.ContactSelect,
  ) {
    return this.prisma.contact.findMany({
      where: { accountId, archivedAt: null },
      select,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async countContactsByAccountId(accountId: string) {
    return this.prisma.contact.count({
      where: { accountId, archivedAt: null },
    });
  }

  async findByIdAndAccountId(
    id: string,
    accountId: string,
    select?: Prisma.ContactSelect,
  ) {
    return this.prisma.contact.findFirst({
      where: { id, accountId, archivedAt: null },
      select,
    });
  }

  async findById(id: string) {
    return this.prisma.contact.findFirst({
      where: { id, archivedAt: null },
    });
  }

  async updateContact(
    id: string,
    data: Prisma.ContactUpdateInput,
    select?: Prisma.ContactSelect,
  ) {
    return this.prisma.contact.update({
      where: { id },
      data,
      select,
    });
  }

  async softDeleteContact(id: string, data: Prisma.ContactUpdateInput) {
    return this.prisma.contact.update({
      where: { id },
      data,
    });
  }
}

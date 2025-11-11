import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { PriceBook, PriceBookEntry, Prisma } from '@prisma/client';

@Injectable()
export class PriceBookRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByNameAndTenantId(
    name: string,
    tenantId: string,
  ): Promise<PriceBook | null> {
    return this.prisma.priceBook.findFirst({
      where: { name, tenantId, isArchived: false },
    });
  }

  async findByIdandTenantId(
    id: string,
    tenantId: string,
  ): Promise<PriceBook | null> {
    return this.prisma.priceBook.findFirst({
      where: { id, tenantId, isArchived: false },
    });
  }

  async findPriceBookByIdandTenantId(
    id: string,
    tenantId: string,
  ): Promise<PriceBook | null> {
    return this.prisma.priceBook.findFirst({
      where: { id, tenantId, isArchived: false },
      include: {
        entries: {
          where: { isArchived: false },
        },
      },
    });
  }

  async findPriceBookEntryByPriceBookIdAndProductId(
    priceBookId: string,
    productId: string,
  ): Promise<PriceBookEntry | null> {
    return this.prisma.priceBookEntry.findFirst({
      where: { priceBookId, productId, isArchived: false },
    });
  }

  async findById(id: string): Promise<PriceBook | PriceBookEntry | null> {
    const priceBook = await this.prisma.priceBook.findFirst({
      where: { id },
    });

    if (priceBook) {
      return priceBook;
    }

    return this.prisma.priceBookEntry.findFirst({
      where: { id },
    });
  }

  async createPriceBook(data: Prisma.PriceBookCreateInput): Promise<PriceBook> {
    return this.prisma.priceBook.create({
      data,
    });
  }

  async createPriceBookEntry(
    data: Prisma.PriceBookEntryCreateInput,
  ): Promise<PriceBookEntry> {
    return this.prisma.priceBookEntry.create({
      data,
    });
  }

  async updatePriceBook(
    id: string,
    data: Prisma.PriceBookUpdateInput,
  ): Promise<PriceBook | null> {
    return this.prisma.priceBook.update({
      where: { id },
      data,
    });
  }

  async countPriceBooks(where?: Prisma.PriceBookWhereInput): Promise<number> {
    return this.prisma.priceBook.count({
      where,
    });
  }

  async getPaginatedPriceBooks(
    skip: number,
    take: number,
    sortField: string,
    order: string,
    where?: Prisma.PriceBookWhereInput,
  ): Promise<PriceBook[]> {
    return this.prisma.priceBook.findMany({
      where,
      include: {
        entries: {
          where: { isArchived: false },
        },
      },
      skip,
      take,
      orderBy: { [sortField]: order },
    });
  }
  async archivepriceBook(id: string): Promise<PriceBook | null> {
    return this.prisma.priceBook.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async findPriceBookEntryByIdAndTenantId(
    id: string,
    tenantId: string,
  ): Promise<PriceBookEntry | null> {
    return this.prisma.priceBookEntry.findFirst({
      where: { id, tenantId, isArchived: false },
    });
  }

  async findPriceBookEntryById(
    id: string,
    include?: Prisma.PriceBookEntryInclude,
  ): Promise<PriceBookEntry | null> {
    return this.prisma.priceBookEntry.findFirst({
      where: { id },
      include,
    });
  }
  async updatePriceBookEntry(
    id: string,
    data: Prisma.PriceBookEntryUpdateInput,
  ): Promise<PriceBookEntry | null> {
    return this.prisma.priceBookEntry.update({
      where: { id },
      data,
    });
  }
  async archivepriceBookEntry(id: string): Promise<PriceBookEntry | null> {
    return this.prisma.priceBookEntry.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async countPriceBookEntriesByPriceBookId(
    priceBookId: string,
    tenantId: string,
  ): Promise<number> {
    return this.prisma.priceBookEntry.count({
      where: {
        priceBookId,
        tenantId,
        isArchived: false,
      },
    });
  }
  async findPriceBookEntriesByIds(ids: string[]): Promise<PriceBookEntry[]> {
    return this.prisma.priceBookEntry.findMany({
      where: {
        id: {
          in: ids,
        },
        isArchived: false,
      },
    });
  }
}

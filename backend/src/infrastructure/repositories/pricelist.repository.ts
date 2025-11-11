import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { PriceList, PriceListEntry, Prisma } from '@prisma/client';

@Injectable()
export class PriceListRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findPriceListEntryByNameAndPriceListId(
    name: string,
    priceListId: string,
    tenantId: string,
  ): Promise<PriceListEntry | null> {
    return this.prisma.priceListEntry.findFirst({
      where: {
        name,
        priceListId,
        tenantId,
        isArchived: false,
      },
    });
  }

  async findPriceListEntryByPriceListIdAndProductId(
    priceListId: string,
    productId: string,
  ): Promise<PriceListEntry | null> {
    return this.prisma.priceListEntry.findFirst({
      where: { priceListId, productId: productId, isArchived: false },
    });
  }

  async createpriceList(data: Prisma.PriceListCreateInput): Promise<PriceList> {
    return this.prisma.priceList.create({
      data,
    });
  }

  async createpriceListEntry(
    data: Prisma.PriceListEntryCreateInput,
  ): Promise<PriceListEntry> {
    return this.prisma.priceListEntry.create({
      data,
    });
  }

  async updatepriceList(
    id: string,
    data: Prisma.PriceListUpdateInput,
  ): Promise<PriceList | null> {
    return this.prisma.priceList.update({
      where: { id },
      data,
    });
  }

  async countpriceLists(where?: Prisma.PriceListWhereInput): Promise<number> {
    return this.prisma.priceList.count({
      where,
    });
  }

  async getPaginatedpriceLists(
    skip: number,
    take: number,
    where: Prisma.PriceListWhereInput,
    sortField: string,
    order: string,
  ): Promise<PriceList[]> {
    return this.prisma.priceList.findMany({
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

  async archivepriceList(id: string): Promise<PriceList | null> {
    return this.prisma.priceList.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async findById(id: string): Promise<PriceList | null> {
    return this.prisma.priceList.findFirst({
      where: { id },
    });
  }

  async findpriceListEntryByIdAndTenantId(
    id: string,
    tenantId: string,
  ): Promise<PriceListEntry | null> {
    return this.prisma.priceListEntry.findFirst({
      where: { id, tenantId, isArchived: false },
    });
  }

  async updatepriceListEntry(
    id: string,
    data: Prisma.PriceListEntryUpdateInput,
  ): Promise<PriceListEntry | null> {
    return this.prisma.priceListEntry.update({
      where: { id },
      data,
    });
  }
  async archivepriceListEntry(id: string): Promise<PriceListEntry | null> {
    return this.prisma.priceListEntry.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  async countPriceListEntriesByPriceListId(
    priceListId: string,
    tenantId: string,
  ): Promise<number> {
    return this.prisma.priceListEntry.count({
      where: {
        priceListId,
        tenantId,
        isArchived: false,
      },
    });
  }

  async findPriceList({
    id,
    name,
    code,
    tenantId,
    includeEntries = false,
    includeArchived = false,
  }: {
    id?: string;
    name?: string;
    code?: string;
    tenantId?: string;
    includeEntries?: boolean;
    includeArchived?: boolean;
  }): Promise<PriceList | null> {
    const where: Prisma.PriceListWhereInput = {};

    if (!includeArchived) {
      where.isArchived = false;
    }

    if (id) where.id = id;
    if (name) where.name = name;
    if (code) where.code = code;
    if (tenantId) where.tenantId = tenantId;

    return this.prisma.priceList.findFirst({
      where,
      ...(includeEntries && {
        include: {
          entries: {
            where: { isArchived: false },
          },
        },
      }),
    });
  }
}

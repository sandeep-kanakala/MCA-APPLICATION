import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Prisma, Asset } from '@prisma/client';

@Injectable()
export class AssetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createAsset(data: Prisma.AssetCreateInput): Promise<Asset> {
    return this.prisma.asset.create({ data });
  }

  async findAll(
    skip: number = 0,
    take: number = 10,
    where: Prisma.AssetWhereInput,
    orderBy?: Prisma.AssetOrderByWithRelationInput,
  ): Promise<Asset[]> {
    return this.prisma.asset.findMany({
      skip,
      take,
      where,
      orderBy,
    });
  }
  async findById(id: string): Promise<Asset | null> {
    return this.prisma.asset.findFirst({
      where: { id, isArchived: false },
    });
  }

  async countAll(where: Prisma.AssetWhereInput): Promise<number> {
    return this.prisma.asset.count({
      where,
    });
  }

  async updateAsset(id: string, data: Prisma.AssetUpdateInput): Promise<Asset> {
    return this.prisma.asset.update({
      where: { id },
      data,
    });
  }
}

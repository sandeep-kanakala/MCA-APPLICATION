import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, ProductBundleItem } from '@prisma/client';

@Injectable()
export class BundleItemRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBundleByIdandTenantId(id: string, tenantId: string) {
    return this.prisma.productBundle.findFirst({
      where: { id, tenantId },
    });
  }

  async findProductById(productId: string, tenantId: string) {
    return this.prisma.product.findFirst({
      where: { id: productId, tenantId },
    });
  }

  async findBundleItemByBundleAndProduct(bundleId: string, productId: string) {
    return this.prisma.productBundleItem.findFirst({
      where: { bundleId, productId },
    });
  }

  async findBundleItemByIdAndTenantId(id: string, tenantId: string) {
    return this.prisma.productBundleItem.findFirst({
      where: { id, tenantId },
    });
  }

  async createBundleItem(data: Prisma.ProductBundleItemCreateInput) {
    return this.prisma.productBundleItem.create({
      data,
    });
  }

  async updateBundleItem(
    id: string,
    data: Prisma.ProductBundleItemUpdateInput,
  ) {
    return this.prisma.productBundleItem.update({
      where: { id },
      data,
    });
  }

  async findById(id: string): Promise<ProductBundleItem | null> {
    return this.prisma.productBundleItem.findFirst({ where: { id } });
  }
}

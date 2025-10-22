import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class productRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByNameAndTenantId(name: string, tenantId: string) {
    return this.prisma.product.findFirst({
      where: { name, tenantId, isArchived: false },
    });
  }

  async findBySkuAndTenantId(sku: string, tenantId: string) {
    return this.prisma.product.findFirst({
      where: { sku, tenantId, isArchived: false },
    });
  }

  async findByIdandTenantId(id: string, tenantId: string) {
    return this.prisma.product.findFirst({
      where: { id, tenantId, isArchived: false },
      include: {
        bundlesAsParent: {
          include: {
            items: {
              where: { isArchived: false },
            },
          },
        },
      },
    });
  }

  async createProduct(data: Prisma.ProductCreateInput) {
    return this.prisma.product.create({
      data,
    });
  }

  async createProductBundle(data: Prisma.ProductBundleCreateInput) {
    return this.prisma.productBundle.create({ data });
  }

  async updateProduct(id: string, data: Prisma.ProductUpdateInput) {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async countProducts() {
    return this.prisma.product.count({
      where: { isArchived: false },
    });
  }

  async getPaginatedProducts(skip: number, take: number) {
    return this.prisma.product.findMany({
      where: { isArchived: false },
      include: {
        bundlesAsParent: {
          where: { isArchived: false },
          include: {
            items: {
              where: { isArchived: false },
            },
          },
        },
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async countBundles() {
    return this.prisma.productBundle.count({
      where: { isArchived: false },
    });
  }

  async getPaginatedBundles(skip: number, take: number) {
    return this.prisma.productBundle.findMany({
      where: { isArchived: false },
      include: {
        items: {
          where: { isArchived: false },
        },
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findBundleByIdandTenantId(id: string, tenantId: string) {
    const bundle = await this.prisma.productBundle.findFirst({
      where: {
        id,
        tenantId,
        isArchived: false,
      },
      include: {
        items: {
          where: { isArchived: false },
        },
      },
    });
    if (!bundle) return null;
    const { items, ...bundleData } = bundle;
    return { ...bundleData, bundleItems: items };
  }

  async archiveProductBundlesByProductId(
    productId: string,
    dto: Prisma.ProductBundleUpdateInput,
    operation: string,
  ) {
    const activeBundleItems = await this.prisma.productBundle.findMany({
      where: {
        parentProductId: productId,
        isArchived: false,
        items: {
          some: {
            isArchived: false,
          },
        },
      },
    });
    if (activeBundleItems.length > 0) {
      if (operation === 'update') {
        throw new BadRequestException(
          'Cannot update product from bundle to non-bundle while it still has active bundle items.',
        );
      } else if (operation === 'delete') {
        throw new BadRequestException(
          'Cannot delete product with active bundle items..',
        );
      }
    }

    return this.prisma.productBundle.updateMany({
      where: { parentProductId: productId },
      data: {
        isArchived: true,
        archivedAt: new Date(),
      },
    });
  }

  async archiveProduct(id: string) {
    return this.prisma.product.update({
      where: { id },
      data: {
        isArchived: true,
        archivedAt: new Date(),
      },
    });
  }
}

import { PrismaService } from '@/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';

@Injectable()
export class ProductRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByNameAndTenantId(name: string, tenantId: string) {
    const product = await this.prisma.product.findFirst({
      where: { name, tenantId, isArchived: false },
    });

    if (product) {
      return product;
    }

    return this.prisma.productBundle.findFirst({
      where: { name, tenantId, isArchived: false },
    });
  }

  async findByProductCodeAndTenantId(productCode: string, tenantId: string) {
    return this.prisma.product.findFirst({
      where: { productCode, tenantId, isArchived: false },
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

  async createProduct(
    data: Prisma.ProductCreateInput,
    include?: Prisma.ProductInclude,
  ) {
    return this.prisma.product.create({
      data,
      include,
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

  async countProducts(where: Prisma.ProductWhereInput) {
    return this.prisma.product.count({
      where,
    });
  }

  async getPaginatedProducts(
    skip: number,
    take: number,
    where: Prisma.ProductWhereInput,
    sortField: string,
    order: string,
  ) {
    return this.prisma.product.findMany({
      where,
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
      orderBy: { [sortField]: order },
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

  async findManyProductBundles(where: Prisma.ProductBundleWhereInput) {
    return this.prisma.productBundle.findMany({
      where,
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

  async deleteProductBundlesByProductId(productId: string) {
    return this.prisma.productBundle.deleteMany({
      where: { parentProductId: productId },
    });
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

  async findById(id: string): Promise<Product | null> {
    return this.prisma.product.findFirst({
      where: {
        id,
      },
    });
  }
}

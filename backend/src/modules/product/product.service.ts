import {
  ConflictException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ProductRepository } from '@/infrastructure/repositories/product.repository';
import { ResponseBuilder } from '@/utils/response.builder';
import { AuthenticatedRequest } from '~/interface';
import type { Response } from '@/utils/response.builder';
import { createProductBundleDto } from './dto/productBundle.dto';
import * as winston from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Prisma, ProductType, Product, ProductBundle } from '@prisma/client';
import { AllowedProductSortFields } from '@/config/constants/product.constants';
import { ASC, CREATED_AT, DESC } from '@/config/constants';
import { handleError } from '@/utils';
import { AuditLogService } from '@/audit/audit-log.service';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: winston.Logger,
    private readonly auditLogService: AuditLogService,
    private readonly prisma: PrismaService,
  ) {}

  async createProduct(
    dto: CreateProductDto,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    try {
      const existingByName = await this.productRepository.findByNameAndTenantId(
        dto.name,
        user.tenantId,
      );

      if (existingByName) {
        this.logger.error(
          `Product creation failed: Name conflict for ${user.email} with name ${dto.name}`,
        );
        throw new ConflictException('Product name already exists');
      }

      if (dto.productCode) {
        const existingByProductCode =
          await this.productRepository.findByProductCodeAndTenantId(
            dto.productCode,
            user.tenantId,
          );
        if (existingByProductCode) {
          this.logger.error(
            `Product creation failed: ProductCode conflict for ${user.email} with ProductCode ${dto.productCode}`,
          );
          throw new ConflictException('Product Code already exists');
        }
      }
      const product = await this.productRepository.createProduct(
        {
          ...dto,
          tenant: {
            connect: {
              id: user.tenantId,
            },
          },
          ...(dto.isBundle
            ? {
                bundlesAsParent: {
                  create: {
                    tenant: {
                      connect: { id: user.tenantId },
                    },
                    name: dto.name,
                    description: dto.description,
                  },
                },
              }
            : {}),
        },
        {
          bundlesAsParent: {
            where: { isArchived: false },
            include: {
              items: { where: { isArchived: false } },
            },
          },
        },
      );
      this.logger.info(
        `Product created successfully: ${product.id} by ${user.email}`,
      );

      return new ResponseBuilder()
        .withStatusCode(201)
        .withMessage('Product created successfully')
        .withData(product)
        .build();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Product creation failed for ${user.email}: ${message}`,
      );
      handleError(error, 'Failed to create product');
    }
  }

  async makeBundle(
    id: string,
    dto: createProductBundleDto,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    try {
      const existingProduct = await this.productRepository.findByIdandTenantId(
        id,
        user.tenantId,
      );
      if (!existingProduct) {
        this.logger.error(
          `makeBundle failed: Product not found with id ${id} for user ${user.email}`,
        );
        throw new NotFoundException('Product not found');
      }

      if (existingProduct.isBundle) {
        this.logger.error(
          `makeBundle failed: Product is already a bundle with id ${id} for user ${user.email}`,
        );
        throw new ConflictException('Product is already a bundle');
      }

      const bundleProduct = await this.productRepository.updateProduct(id, {
        isBundle: true,
      });
      this.logger.info(`Product marked as bundle: ${id} by ${user.email}`);

      const productBundle = await this.productRepository.createProductBundle({
        tenant: {
          connect: {
            id: user.tenantId,
          },
        },
        parent: {
          connect: {
            id: id,
          },
        },
        name: dto.name,
        description: dto.description,
      });
      this.logger.info(
        `Product bundle created successfully for product: ${id} by ${user.email}`,
      );

      return new ResponseBuilder()
        .withStatusCode(200)
        .withMessage('Product converted to bundle successfully')
        .withData({ product: bundleProduct, bundle: productBundle })
        .build();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`makeBundle error for user ${user.email}: ${message}`);
      handleError(error, 'Failed to convert product to bundle');
    }
  }

  async getList(
    page?: number,
    limit?: number,
    sortByField?: string,
    search?: string,
    isArchived: boolean = false,
    type?: string,
    fromDate?: Date,
    toDate?: Date,
    sortOrder?: string,
  ): Promise<Response> {
    try {
      const pageNumber = Math.max(Number(page) || 1, 1);
      const pageSize = Math.max(Number(limit) || 10, 1);
      const skip = (pageNumber - 1) * pageSize;
      const cleanSearch = typeof search === 'string' ? search.trim() : search;
      const cleanType = typeof type === 'string' ? type.trim() : type;
      const cleanSortByField =
        typeof sortByField === 'string' ? sortByField.trim() : sortByField;
      const cleanSortOrder =
        typeof sortOrder === 'string' ? sortOrder.trim() : sortOrder;

      const sortField =
        AllowedProductSortFields.find(
          (f) => f.toLowerCase() === cleanSortByField?.toLowerCase(),
        ) || CREATED_AT;
      const order = cleanSortOrder?.toLowerCase() === ASC ? ASC : DESC;
      const whereCondition = this.buildWhereAndFilterClauses(
        cleanSearch,
        cleanType,
        fromDate,
        toDate,
      );
      const where = {
        isArchived,
        ...whereCondition,
      };
      const [totalCount, products] = await Promise.all([
        this.productRepository.countProducts(where),
        this.productRepository.getPaginatedProducts(
          skip,
          pageSize,
          where,
          sortField,
          order,
        ),
      ]);
      this.logger.info(
        `Products list retrieved: page ${pageNumber}, limit ${pageSize}`,
      );

      return new ResponseBuilder()
        .withMessage('Products retrieved successfully')
        .withData({
          total: totalCount,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
          data: products,
        })
        .build();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`getList error: ${message}`);
      handleError(error, 'Failed to retrieve products');
    }
  }

  async getProductById(
    id: string,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    try {
      const product = await this.productRepository.findByIdandTenantId(
        id,
        user.tenantId,
      );
      if (!product) {
        this.logger.error(
          `getProductById failed: Product not found with id ${id} for user ${user.email}`,
        );
        throw new NotFoundException('Product not found');
      }
      this.logger.info(
        `Product retrieved successfully: ${id} by ${user.email}`,
      );

      return new ResponseBuilder()
        .withMessage('Product retrieved successfully')
        .withData(product)
        .build();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `getProductById error for user ${user.email}: ${message}`,
      );
      handleError(error, 'Failed to retrieve product');
    }
  }

  async deleteProduct(
    id: string,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    try {
      const product = await this.productRepository.findByIdandTenantId(
        id,
        user.tenantId,
      );
      if (!product) {
        this.logger.error(
          `deleteProduct failed: Product not found with id ${id} for user ${user.email}`,
        );
        throw new NotFoundException('Product not found');
      }

      if (product.isBundle) {
        const bundlesToArchive =
          await this.productRepository.findManyProductBundles({
            parent: { id: id },
            isArchived: false,
          });
        for (const bundle of bundlesToArchive) {
          await this.auditLogService.log({
            entity: 'ProductBundle',
            entityId: bundle.id,
            action: 'DELETED',
            before: bundle,
            after: null,
            req: request,
          });
        }
        await this.productRepository.archiveProductBundlesByProductId(
          id,
          { isArchived: true },
          'delete',
        );
        this.logger.info(
          `Archived bundles for product id: ${id} by ${user.email}`,
        );
      }

      await this.productRepository.archiveProduct(id);
      this.logger.info(`Product deleted successfully: ${id} by ${user.email}`);

      return new ResponseBuilder()
        .withStatusCode(204)
        .withMessage('Product deleted successfully')
        .build();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `deleteProduct error for user ${user.email}: ${message}`,
      );
      handleError(error, 'Failed to delete product');
    }
  }

  async updateProduct(
    id: string,
    dto: UpdateProductDto,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    try {
      const product = await this.productRepository.findByIdandTenantId(
        id,
        user.tenantId,
      );
      if (!product) {
        this.logger.error(
          `updateProduct failed: Product not found with id ${id} for user ${user.email}`,
        );
        throw new NotFoundException('Product not found');
      }

      if (dto.name && dto.name !== product.name) {
        const nameConflict = await this.productRepository.findByNameAndTenantId(
          dto.name,
          user.tenantId,
        );
        if (nameConflict && nameConflict.id !== id) {
          this.logger.error(
            `updateProduct failed: Name conflict for product id ${id} with name ${dto.name} by user ${user.email}`,
          );
          throw new ConflictException('Product name already exists');
        }
      }

      if (dto.productCode && dto.productCode !== product.productCode) {
        const ProductCodeConflict =
          await this.productRepository.findByProductCodeAndTenantId(
            dto.productCode,
            user.tenantId,
          );
        if (ProductCodeConflict && ProductCodeConflict.id !== id) {
          this.logger.error(
            `updateProduct failed: ProductCode conflict for product id ${id} with ProductCode ${dto.productCode} by user ${user.email}`,
          );
          throw new ConflictException('Product code already exists');
        }
      }

      const isCurrentlyBundle = product.isBundle;
      const isUpdatedToBundle = dto.isBundle ?? product.isBundle;

      if (isCurrentlyBundle && !isUpdatedToBundle) {
        const bundlesToArchive =
          await this.productRepository.findManyProductBundles({
            parent: { id: id },
            isArchived: false,
          });
        await this.productRepository.archiveProductBundlesByProductId(
          id,
          { isArchived: true },
          'update',
        );
        this.logger.info(
          `Archived bundles for product id: ${id} during update by ${user.email}`,
        );
        for (const bundle of bundlesToArchive) {
          await this.auditLogService.log({
            entity: 'ProductBundle',
            entityId: bundle.id,
            action: 'DELETED',
            before: bundle,
            after: null,
            req: request,
          });
        }
      }

      if (!isCurrentlyBundle && isUpdatedToBundle) {
        const productBundle = await this.productRepository.createProductBundle({
          tenant: {
            connect: {
              id: user.tenantId,
            },
          },
          parent: {
            connect: {
              id: id,
            },
          },
          name: dto.name || product.name,
          description: dto.description,
        });
        this.logger.info(
          `Created bundle for product id: ${id} during update by ${user.email}`,
        );
        await this.auditLogService.log({
          entity: 'ProductBundle',
          entityId: productBundle.id,
          action: 'CREATED',
          after: productBundle,
          req: request,
        });
      }

      const updatedProduct = await this.productRepository.updateProduct(
        id,
        dto,
      );
      this.logger.info(`Product updated successfully: ${id} by ${user.email}`);

      return new ResponseBuilder()
        .withMessage('Product updated successfully')
        .withData(updatedProduct)
        .build();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.error(
        `updateProduct error for user ${user.email}: ${message}`,
      );
      handleError(error, 'Failed to update product');
    }
  }

  async getBundles(page?: number, limit?: number): Promise<Response> {
    try {
      const pageNumber = Math.max(Number(page) || 1, 1);
      const pageSize = Math.max(Number(limit) || 10, 1);
      const skip = (pageNumber - 1) * pageSize;

      const [totalCount, bundles] = await Promise.all([
        this.productRepository.countBundles(),
        this.productRepository.getPaginatedBundles(skip, pageSize),
      ]);
      this.logger.info(
        `Bundles list retrieved: page ${pageNumber}, limit ${pageSize}`,
      );

      return new ResponseBuilder()
        .withMessage('Bundles retrieved successfully')
        .withData({
          total: totalCount,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
          data: bundles,
        })
        .build();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.error(`getBundles error: ${message}`);
      handleError(error, 'Failed to retrieve bundles');
    }
  }

  async getBundleById(
    id: string,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    try {
      const bundle = await this.productRepository.findBundleByIdandTenantId(
        id,
        user.tenantId,
      );
      if (!bundle) {
        this.logger.error(
          `getBundleById failed: Bundle not found with id ${id} for user ${user.email}`,
        );
        throw new NotFoundException('Bundle not found');
      }
      this.logger.info(`Bundle retrieved successfully: ${id} by ${user.email}`);

      return new ResponseBuilder()
        .withMessage('Bundle retrieved successfully')
        .withData(bundle)
        .build();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `getBundleById error for user ${user.email}: ${message}`,
      );
      handleError(error, 'Failed to retrieve bundle');
    }
  }
  private buildWhereAndFilterClauses(
    cleanSearch?: string,
    cleanType?: string,
    cleanFromDate?: Date,
    cleanToDate?: Date,
  ): Prisma.ProductWhereInput {
    const isNumericSearch = !Number.isNaN(Number(cleanSearch));
    const searchCondition: Prisma.ProductWhereInput = cleanSearch
      ? {
          OR: [
            {
              name: {
                contains: cleanSearch,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              productCode: {
                contains: cleanSearch,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              description: {
                contains: cleanSearch,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              family: {
                contains: cleanSearch,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              currencyCode: {
                contains: cleanSearch,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            // ...(isNumericSearch
            //   ? [{ unitPrice: { equals: new Prisma.Decimal(cleanSearch) } }]
            //   : []),
          ],
        }
      : {};
    const typeValues = cleanType
      ? cleanType
          .split(',')
          .map((v) => v.trim().toLowerCase())
          .filter((v) => v.length > 0)
      : [];
    const matchedTypes = Object.values(ProductType).filter((type) =>
      typeValues.includes(type.toLowerCase()),
    );
    const typeFilter =
      matchedTypes.length > 0 ? { in: matchedTypes } : undefined;

    const filters: Prisma.ProductWhereInput = {
      ...(typeFilter && { type: typeFilter }),
      ...(cleanFromDate && {
        createdAt: { gte: new Date(cleanFromDate) },
      }),
      ...(cleanToDate && {
        createdAt: {
          ...(cleanFromDate ? { gte: cleanFromDate } : {}),
          lte: new Date(
            cleanToDate.setDate(new Date(cleanToDate).getDate() + 1),
          ),
        },
      }),
    };

    return {
      AND: [searchCondition, filters],
    };
  }

  async findOne(id: string): Promise<Product | ProductBundle | null> {
    return await this.productRepository.findById(id);
  }
}

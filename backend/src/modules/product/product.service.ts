import { PrismaService } from '@/prisma/prisma.service';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { productRepository } from '@/infrastructure/repositories/product.repository';
import { ResponseBuilder } from '@/utils/response.builder';
import { RequestWithUser, IUserTokenPayload } from '~/interface';
import type { Response } from '@/utils/response.builder';
import { createProductBundleDto } from './dto/productBundle.dto';
import * as winston from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtservice: JwtService,
    private readonly productRepository: productRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: winston.Logger,
  ) {}

  async createProduct(
    dto: CreateProductDto,
    request: RequestWithUser,
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

      if (dto.sku) {
        const existingBySku = await this.productRepository.findBySkuAndTenantId(
          dto.sku,
          user.tenantId,
        );
        if (existingBySku) {
          this.logger.error(
            `Product creation failed: SKU conflict for ${user.email} with SKU ${dto.sku}`,
          );
          throw new ConflictException('Product Code already exists');
        }
      }

      const product = await this.productRepository.createProduct({
        ...dto,
        tenantId: user.tenantId,
      });
      this.logger.info(
        `Product created successfully: ${product.id} by ${user.email}`,
      );

      let bundleData = {};
      if (dto.isBundle) {
        const bundle = await this.productRepository.createProductBundle({
          tenantId: user.tenantId,
          parentProductId: product.id,
          name: dto.name,
          description: dto.description,
        });
        bundleData = bundle;
        this.logger.info(
          `Product bundle created successfully for product: ${product.id} by ${user.email}`,
        );
      }

      return new ResponseBuilder()
        .withStatusCode(201)
        .withMessage('Product created successfully')
        .withData({ product, ...(bundleData ? { bundle: bundleData } : {}) })
        .build();
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(
        `Product creation failed for ${user.email}: ${error.message}`,
      );
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  async makeBundle(
    id: string,
    dto: createProductBundleDto,
    request: RequestWithUser,
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
        tenantId: user.tenantId,
        parentProductId: id,
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
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error(
        `makeBundle error for user ${user.email}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Failed to convert product to bundle',
      );
    }
  }

  async getList(page?: number, limit?: number): Promise<Response> {
    try {
      const pageNumber = Math.max(Number(page) || 1, 1);
      const pageSize = Math.max(Number(limit) || 10, 1);
      const skip = (pageNumber - 1) * pageSize;

      const [totalCount, products] = await Promise.all([
        this.productRepository.countProducts(),
        this.productRepository.getPaginatedProducts(skip, pageSize),
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
    } catch (error) {
      this.logger.error(`getList error: ${error.message}`);
      throw new InternalServerErrorException('Failed to retrieve products');
    }
  }

  async getProductById(
    id: string,
    request: RequestWithUser,
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `getProductById error for user ${user.email}: ${error.message}`,
      );
      throw new InternalServerErrorException('Failed to retrieve product');
    }
  }

  async deleteProduct(id: string, request: RequestWithUser): Promise<Response> {
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
        .withMessage('Product deleted successfully')
        .build();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `deleteProduct error for user ${user.email}: ${error.message}`,
      );
      throw new InternalServerErrorException('Failed to delete product');
    }
  }

  async updateProduct(
    id: string,
    dto: UpdateProductDto,
    request: RequestWithUser,
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

      if (dto.sku && dto.sku !== product.sku) {
        const skuConflict = await this.productRepository.findBySkuAndTenantId(
          dto.sku,
          user.tenantId,
        );
        if (skuConflict && skuConflict.id !== id) {
          this.logger.error(
            `updateProduct failed: SKU conflict for product id ${id} with SKU ${dto.sku} by user ${user.email}`,
          );
          throw new ConflictException('Product code already exists');
        }
      }

      const isCurrentlyBundle = product.isBundle;
      const isUpdatedToBundle = dto.isBundle ?? product.isBundle;

      if (isCurrentlyBundle && !isUpdatedToBundle) {
        await this.productRepository.archiveProductBundlesByProductId(
          id,
          { isArchived: true },
          'update',
        );
        this.logger.info(
          `Archived bundles for product id: ${id} during update by ${user.email}`,
        );
      }

      if (!isCurrentlyBundle && isUpdatedToBundle) {
        await this.productRepository.createProductBundle({
          tenantId: user.tenantId,
          parentProductId: id,
          name: dto.name,
          description: dto.description,
        });
        this.logger.info(
          `Created bundle for product id: ${id} during update by ${user.email}`,
        );
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
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error(
        `updateProduct error for user ${user.email}: ${error.message}`,
      );
      throw new InternalServerErrorException('Failed to update product');
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
    } catch (error) {
      this.logger.error(`getBundles error: ${error.message}`);
      throw new InternalServerErrorException('Failed to retrieve bundles');
    }
  }

  async getBundleById(id: string, request: RequestWithUser): Promise<Response> {
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `getBundleById error for user ${user.email}: ${error.message}`,
      );
      throw new InternalServerErrorException('Failed to retrieve bundle');
    }
  }
}

import { BundleItemRepository } from '@/infrastructure/repositories/bundle-items.repository';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import {
  CreateBundleItemDto,
  UpdateBundleItemDto,
} from './dto/bundle-items.dto';
import { RequestWithUser, IUserTokenPayload } from '~/interface';
import { ResponseBuilder } from '@/utils/response.builder';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as winston from 'winston';

@Injectable()
export class BundleItemsService {
  constructor(
    private readonly bundleItemRepository: BundleItemRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: winston.Logger,
  ) {}

  async createBundleItem(
    bundleId: string,
    dto: CreateBundleItemDto,
    request: RequestWithUser,
  ) {
    const { user } = request;
    try {
      const bundle = await this.bundleItemRepository.findBundleByIdandTenantId(
        bundleId,
        user.tenantId,
      );
      if (!bundle) {
        this.logger.warn(
          `Bundle not found for ID: ${bundleId}, Tenant: ${user.tenantId}`,
        );
        throw new NotFoundException('Bundle Not Found');
      }

      const product = await this.bundleItemRepository.findProductById(
        dto.productId,
        user.tenantId,
      );
      if (!product) {
        this.logger.warn(
          `Product not found for ID: ${dto.productId}, Tenant: ${user.tenantId}`,
        );
        throw new NotFoundException('Product Not Found');
      }

      if (product.isBundle) {
        this.logger.warn(
          `Cannot add a bundle as a bundle item. Product ID: ${dto.productId}`,
        );
        throw new ConflictException('Cannot add a bundle as a bundle item');
      }

      const existingBundleItem =
        await this.bundleItemRepository.findBundleItemByBundleAndProduct(
          bundleId,
          dto.productId,
        );
      if (existingBundleItem) {
        this.logger.warn(
          `Duplicate bundle item: Bundle ${bundleId}, Product ${dto.productId}`,
        );
        throw new ConflictException('Product already exists in the bundle');
      }

      const bundleItem = await this.bundleItemRepository.createBundleItem({
        ...dto,
        bundleId,
        tenantId: user.tenantId,
      });

      this.logger.info(
        `Bundle item created successfully by ${user.email} in bundle ${bundleId}`,
      );
      return new ResponseBuilder()
        .withStatusCode(201)
        .withMessage('Bundle Item created successfully')
        .withData(bundleItem)
        .build();
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      this.logger.error(
        `Unexpected error while creating bundle item by ${user.email}: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'Unexpected error occurred while creating bundle item',
      );
    }
  }

  async updateBundleItem(
    id: string,
    dto: UpdateBundleItemDto,
    request: RequestWithUser,
  ) {
    const { user } = request;
    try {
      const bundleItem =
        await this.bundleItemRepository.findBundleItemByIdAndTenantId(
          id,
          user.tenantId,
        );
      if (!bundleItem) {
        this.logger.warn(
          `Bundle item not found for ID: ${id}, Tenant: ${user.tenantId}`,
        );
        throw new NotFoundException('Bundle Item Not Found');
      }

      const updatedBundleItem =
        await this.bundleItemRepository.updateBundleItem(id, dto);
      this.logger.info(
        `Bundle item updated successfully by ${user.email}, ID: ${id}`,
      );

      return new ResponseBuilder()
        .withMessage('Bundle Item updated successfully')
        .withData(updatedBundleItem)
        .build();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to update bundle item ID ${id} by ${user.email}: ${error.message}`,
      );
      throw new InternalServerErrorException('Failed to update bundle item');
    }
  }

  async DeleteBundleItem(
    id: string,
    dto: UpdateBundleItemDto,
    request: RequestWithUser,
  ) {
    const { user } = request;

    try {
      const bundleItem =
        await this.bundleItemRepository.findBundleItemByIdAndTenantId(
          id,
          user.tenantId,
        );
      if (!bundleItem) {
        this.logger.warn(
          `Bundle item not found for deletion. ID: ${id}, Tenant: ${user.tenantId}`,
        );
        throw new NotFoundException('Bundle Item Not Found');
      }

      const deletedBundleItem =
        await this.bundleItemRepository.updateBundleItem(id, {
          isArchived: true,
        });

      this.logger.info(`Bundle item soft-deleted by ${user.email}, ID: ${id}`);

      return new ResponseBuilder()
        .withMessage('Bundle Item deleted successfully')
        .withData(deletedBundleItem)
        .build();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Failed to delete bundle item ID ${id} by ${user.email}: ${error.message}`,
      );
      throw new InternalServerErrorException('Failed to delete bundle item');
    }
  }
}

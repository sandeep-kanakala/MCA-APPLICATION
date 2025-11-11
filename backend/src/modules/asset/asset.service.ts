import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { AssetRepository } from '@/infrastructure/repositories/asset.repository';
import { CreateAssetDto, UpdateAssetDto } from './dto';
import {
  ResponseBuilder,
  Response,
  cleanPatchData,
  handleError,
} from '@/utils';
import type { AuthenticatedRequest } from '~/interface';
import { Prisma, Asset, AssetStatus, User } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as winston from 'winston';

import { ALLOWED_SORT_FIELDS, ASC, CREATED_AT, DESC } from '@/config/constants';

@Injectable()
export class AssetService {
  constructor(
    private readonly assetRepository: AssetRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: winston.Logger,
  ) {}

  async createAsset(
    dto: CreateAssetDto,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user }: { user: User } = request;
    this.logger.info(
      `Creating asset for tenant ${user.tenantId} by user ${user.email}`,
    );

    const { accountId, productId, subscriptionId, ...rest } = dto;
    try {
      const assetData: Prisma.AssetCreateInput = {
        ...rest,
        tenant: { connect: { id: user.tenantId } },
        account: { connect: { id: accountId } },
        product: { connect: { id: productId } },
        subscription: subscriptionId
          ? { connect: { id: subscriptionId } }
          : undefined,
        createdBy: { connect: { id: user.id } },
      };

      const createdAsset = await this.assetRepository.createAsset(assetData);
      this.logger.info(
        `Asset created successfully: ${createdAsset.id} by ${user.email}`,
      );

      return new ResponseBuilder()
        .withStatusCode(201)
        .withMessage('Asset created successfully.')
        .withData(createdAsset)
        .build();
    } catch (error: unknown) {
      this.logger.error('Error creating asset', { error });
      handleError(error, 'Error creating asset.');
    }
  }

  async getAssets(
    request: AuthenticatedRequest,
    page?: number,
    limit?: number,
    accountId?: string,
    isArchived?: string,
    status?: string,
    fromDate?: Date,
    toDate?: Date,
    sortByField?: string,
    sortOrder?: string,
  ): Promise<Response> {
    const { user } = request;
    this.logger.info(
      `Fetching assets for tenant ${user.tenantId} with filters/sorting`,
    );
    try {
      const pageNumber = Math.max(Number(page) || 1, 1);
      const pageSize = Math.max(Number(limit) || 10, 1);
      const skip = (pageNumber - 1) * pageSize;
      const cleanAccountId =
        typeof accountId === 'string' ? accountId.trim() : accountId;
      const cleanStatus = typeof status === 'string' ? status.trim() : status;
      const cleanSortByField =
        typeof sortByField === 'string' ? sortByField.trim() : sortByField;
      const cleanSortOrder =
        typeof sortOrder === 'string' ? sortOrder.trim() : sortOrder;
      const sortField =
        ALLOWED_SORT_FIELDS.find(
          (f) => f.toLowerCase() === cleanSortByField?.toLowerCase(),
        ) || CREATED_AT;
      const order = cleanSortOrder?.toLowerCase() === ASC ? ASC : DESC;
      const isArchivedValues = isArchived
        ? isArchived.split(',').map((v) => v.trim().toLowerCase())
        : [];
      let archivedFilter = {};
      if (
        isArchivedValues.includes('true') &&
        isArchivedValues.includes('false')
      ) {
        archivedFilter = {};
      } else if (isArchivedValues.includes('true')) {
        archivedFilter = true;
      } else if (isArchivedValues.includes('false')) {
        archivedFilter = false;
      } else {
        archivedFilter = false;
      }
      const whereCondition = this.buildWhereAndFilterClauses(
        cleanStatus,
        fromDate,
        toDate,
      );
      const where = {
        isArchived: archivedFilter,
        ...(cleanAccountId && { accountId: cleanAccountId }),
        ...whereCondition,
      };
      const orderByClause: Prisma.AssetOrderByWithRelationInput = {
        [sortField]: order,
      };

      const [totalCount, assets] = await Promise.all([
        this.assetRepository.countAll(where),
        this.assetRepository.findAll(skip, pageSize, where, orderByClause),
      ]);

      return new ResponseBuilder()
        .withMessage('Assets fetched successfully.')
        .withData({
          total: totalCount,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
          data: assets,
        })
        .build();
    } catch (error: unknown) {
      this.logger.error(`Error fetching assets.`, { error });
      handleError(error, `Error fetching assets.`);
    }
  }

  async getAssetById(
    id: string,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;

    if (!id || id.trim().length === 0) {
      throw new BadRequestException('Asset ID must not be empty.');
    }
    this.logger.info(`Fetching asset ID: ${id} for tenant: ${user.tenantId}`);
    try {
      const asset = await this.assetRepository.findById(id);

      if (!asset || asset.tenantId !== user.tenantId) {
        throw new NotFoundException('Asset not found.');
      }

      return new ResponseBuilder()
        .withMessage('Asset fetched successfully.')
        .withData(asset)
        .build();
    } catch (error: unknown) {
      this.logger.error(`Error fetching asset ID: ${id}`, { error });
      handleError(error, 'Error fetching asset by ID.');
    }
  }

  async updateAsset(
    id: string,
    dto: UpdateAssetDto,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user }: { user: User } = request;
    this.logger.info(`Updating asset ID: ${id} by user: ${user.email}`);
    try {
      const existingAsset = await this.assetRepository.findById(id);

      if (!existingAsset || existingAsset.tenantId !== user.tenantId) {
        throw new NotFoundException('Asset not found.');
      }

      const changes = cleanPatchData<Asset>(dto, existingAsset);

      if (!changes.isChanged) {
        return new ResponseBuilder()
          .withStatusCode(204)
          .withMessage('No changes detected.')
          .build();
      }

      const updateData: Prisma.AssetUpdateInput = {
        ...changes.cleaned,
        updatedBy: { connect: { id: user.id } },
      };

      if (changes.cleaned.accountId)
        updateData.account = { connect: { id: changes.cleaned.accountId } };

      if (changes.cleaned.productId)
        updateData.product = { connect: { id: changes.cleaned.productId } };

      if (changes.cleaned.subscriptionId) {
        updateData.subscription = {
          connect: { id: changes.cleaned.subscriptionId },
        };
      } else if (
        Object.prototype.hasOwnProperty.call(dto, 'subscriptionId') &&
        dto.subscriptionId === null
      ) {
        updateData.subscription = { disconnect: true };
      }

      const updatedAsset = await this.assetRepository.updateAsset(
        id,
        updateData,
      );

      return new ResponseBuilder()
        .withMessage('Asset updated successfully.')
        .withData(updatedAsset)
        .build();
    } catch (error: unknown) {
      this.logger.error(`Error updating asset ID: ${id}`, { error });
      handleError(error, 'Error updating asset.');
    }
  }

  async deleteAsset(
    id: string,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user }: { user: User } = request;
    this.logger.info(
      `Delete request for asset ID: ${id} by user: ${user.email}`,
    );
    try {
      const asset = await this.assetRepository.findById(id);

      if (!asset || asset.tenantId !== user.tenantId) {
        throw new NotFoundException('Asset not found.');
      }

      // await this.assetRepository.archiveAsset(id, user.id);
      await this.assetRepository.updateAsset(id, {
        isArchived: true,
        archivedAt: new Date(),
        updatedBy: { connect: { id: user.id } },
        updatedAt: new Date(),
      });

      return new ResponseBuilder()
        .withStatusCode(204)
        .withMessage('Asset deleted successfully.')
        .build();
    } catch (error: unknown) {
      this.logger.error(`Error deleting asset ID: ${id}`, { error });
      handleError(error, 'Error deleting asset.');
    }
  }

  async findOne(id: string): Promise<Asset | null> {
    return this.assetRepository.findById(id);
  }

  private buildWhereAndFilterClauses(
    cleanStatus?: string,
    cleanFromDate?: Date,
    cleanToDate?: Date,
  ): Prisma.AssetWhereInput {
    const statusValues = cleanStatus
      ? cleanStatus
          .split(',')
          .map((v) => v.trim().toLowerCase())
          .filter((v) => v.length > 0)
      : [];
    const matchedStatues = Object.values(AssetStatus).filter((type) =>
      statusValues.includes(type.toLowerCase()),
    );
    const statusFilter =
      matchedStatues.length > 0 ? { in: matchedStatues } : undefined;
    const filters: Prisma.AssetWhereInput = {
      ...(statusFilter && { status: statusFilter }),
      ...(cleanFromDate && {
        createdAt: { gte: cleanFromDate },
      }),
      ...(cleanToDate && {
        createdAt: {
          ...(cleanFromDate ? { gte: new Date(cleanFromDate) } : {}),
          lte: new Date(
            cleanToDate.setDate(new Date(cleanToDate).getDate() + 1),
          ),
        },
      }),
    };

    return filters;
  }
}

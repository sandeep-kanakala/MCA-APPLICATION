import { handleError, ResponseBuilder } from '@/utils';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthenticatedRequest } from '~/interface';
import {
  CreatePriceListDto,
  CreatePriceListEntryDto,
  UpdatePriceListDto,
  UpdatePriceListEntryDto,
} from './dto/pricelist.dto';
import { PriceListRepository } from '@/infrastructure/repositories/pricelist.repository';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import winston from 'winston';
import type { Response } from '@/utils/response.builder';
import { ProductRepository } from '@/infrastructure/repositories/product.repository';
import { PriceBookRepository } from '@/infrastructure/repositories/pricebook.repository';
import { Prisma } from '@prisma/client';
import { AllowedPriceListSortFields } from '@/config/constants/pricelist.constants';
import { ASC, CREATED_AT, DESC } from '@/config/constants';

@Injectable()
export class PricelistService {
  constructor(
    private readonly PriceListRepository: PriceListRepository,
    private readonly productRepository: ProductRepository,
    private readonly pricebookRepository: PriceBookRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: winston.Logger,
  ) {}

  async createPriceList(
    dto: CreatePriceListDto,
    request: AuthenticatedRequest,
  ) {
    const { user } = request;
    try {
      // const existingByName =
      //   await this.PriceListRepository.findByNameAndTenantId(
      //     dto.name,
      //     user.tenantId,
      //   );

      const existingByName = await this.PriceListRepository.findPriceList({
        name: dto.name,
        tenantId: user.tenantId,
      });

      if (existingByName) {
        this.logger.error(
          `PriceList creation failed: Name conflict for ${user.email} with name ${dto.name}`,
        );
        throw new ConflictException('PriceList name already exists');
      }
      // const existingByCode =
      //   await this.PriceListRepository.findByCodeAndTenantId(
      //     dto.code,
      //     user.tenantId,
      //   );

      const existingByCode = await this.PriceListRepository.findPriceList({
        code: dto.code,
        tenantId: user.tenantId,
      });

      if (existingByCode) {
        this.logger.error(
          `PriceList creation failed: Code conflict for ${user.email} with name ${dto.name}`,
        );
        throw new ConflictException('PriceList Code already exists');
      }

      const { accountId, priceBookId, ...rest } = dto;

      const createData: Prisma.PriceListCreateInput = {
        ...rest,
        tenant: {
          connect: { id: user.tenantId },
        },
        priceBook: { connect: { id: priceBookId } },
        account: { connect: { id: accountId } },
      };

      const PriceList =
        await this.PriceListRepository.createpriceList(createData);
      return new ResponseBuilder()
        .withStatusCode(201)
        .withMessage('PriceList Created Successfuly')
        .withData(PriceList)
        .build();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `PriceList creation failed for ${user.email}: ${message}`,
      );
      handleError(error);
    }
  }

  async getList(
    page?: number,
    limit?: number,
    search?: string,
    isArchived: boolean = false,
    fromDate?: Date,
    toDate?: Date,
    sortByField?: string,
    sortOrder?: string,
  ): Promise<Response> {
    try {
      const pageNumber = Math.max(Number(page) || 1, 1);
      const pageSize = Math.max(Number(limit) || 10, 1);
      const skip = (pageNumber - 1) * pageSize;
      const cleanSearch = typeof search === 'string' ? search.trim() : search;
      const cleanSortByField =
        typeof sortByField === 'string' ? sortByField.trim() : sortByField;
      const cleanSortOrder =
        typeof sortOrder === 'string' ? sortOrder.trim() : sortOrder;
      const sortField =
        AllowedPriceListSortFields.find(
          (f) => f.toLowerCase() === cleanSortByField?.toLowerCase(),
        ) || CREATED_AT;
      const order = cleanSortOrder?.toLowerCase() === ASC ? ASC : DESC;
      const whereCondition = this.buildWhereAndFilterClauses(
        cleanSearch,
        fromDate,
        toDate,
      );
      const where = {
        isArchived,
        ...whereCondition,
      };
      const [totalCount, PriceLists] = await Promise.all([
        this.PriceListRepository.countpriceLists(where),
        this.PriceListRepository.getPaginatedpriceLists(
          skip,
          pageSize,
          where,
          sortField,
          order,
        ),
      ]);
      this.logger.info(
        `PriceList list retrieved: page ${pageNumber}, limit ${pageSize}`,
      );

      return new ResponseBuilder()
        .withMessage('PriceLists retrieved successfully')
        .withData({
          total: totalCount,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
          data: PriceLists,
        })
        .build();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`getList error: ${message}`);
      handleError(error, 'Failed to retrieve PriceLists');
    }
  }
  private buildWhereAndFilterClauses(
    cleanSearch?: string,
    cleanFromDate?: Date,
    cleanToDate?: Date,
  ): Prisma.PriceListWhereInput {
    const isNumericSearch = !Number.isNaN(Number(cleanSearch));
    const searchCondition: Prisma.PriceListWhereInput = cleanSearch
      ? {
          OR: [
            {
              name: {
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
              code: {
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
            {
              accountType: {
                contains: cleanSearch,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              country: {
                contains: cleanSearch,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            // ...(isNumericSearch
            //   ? [{ noofEntries: { equals: Number(cleanSearch) } }]
            //   : []),
          ],
        }
      : {};
    const filters: Prisma.PriceListWhereInput = {
      ...(cleanFromDate && {
        createdAt: { gte: new Date(cleanFromDate) },
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
    return {
      AND: [searchCondition, filters],
    };
  }

  async getPriceListById(
    id: string,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    try {
      // const PriceList =
      //   await this.PriceListRepository.findPriceListByIdandTenantId(
      //     id,
      //     user.tenantId,
      //   );

      const priceList = await this.PriceListRepository.findPriceList({
        id,
        tenantId: user.tenantId,
        includeEntries: true,
      });

      if (!priceList) {
        this.logger.error(
          `getPriceListById failed: PriceList not found with id ${id} for user ${user.email}`,
        );
        throw new NotFoundException('PriceList not found');
      }
      this.logger.info(
        `PriceList retrieved successfully: ${id} by ${user.email}`,
      );

      return new ResponseBuilder()
        .withMessage('PriceList retrieved successfully')
        .withData(priceList)
        .build();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `getPriceListById error for user ${user.email}: ${message}`,
      );
      handleError(error, 'Failed to retrieve PriceList');
    }
  }

  async updatePriceList(
    id: string,
    dto: UpdatePriceListDto,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    try {
      // const PriceList = await this.PriceListRepository.findByIdandTenantId(
      //   id,
      //   user.tenantId,
      // );

      const priceList = await this.PriceListRepository.findPriceList({
        id,
        tenantId: user.tenantId,
      });

      if (!priceList) {
        this.logger.error(
          `updatePriceList failed: PriceList not found with id ${id} for user ${user.email}`,
        );
        throw new NotFoundException('PriceList not found');
      }

      if (dto.name && dto.name !== priceList.name) {
        // const existingByName =
        //   await this.PriceListRepository.findByNameAndTenantId(
        //     dto.name,
        //     user.tenantId,
        //   );

        const existingByName = await this.PriceListRepository.findPriceList({
          name: dto.name,
          tenantId: user.tenantId,
        });

        if (existingByName && existingByName.id !== id) {
          this.logger.error(
            `PriceList update failed: Name conflict for ${user.email} with name ${dto.name}`,
          );
          throw new ConflictException('PriceList name already exists');
        }
      }

      if (dto.code && dto.code !== priceList.code) {
        // const existingByCode =
        //   await this.PriceListRepository.findByCodeAndTenantId(
        //     dto.code,
        //     user.tenantId,
        //   );

        const existingByCode = await this.PriceListRepository.findPriceList({
          code: dto.code,
          tenantId: user.tenantId,
        });

        if (existingByCode && existingByCode.id !== id) {
          this.logger.error(
            `PriceList update failed: Code conflict for ${user.email} with code ${dto.code}`,
          );
          throw new ConflictException('PriceList code already exists');
        }
      }

      const updateData: Prisma.PriceListUpdateInput = { ...dto };
      const updatedPriceList = await this.PriceListRepository.updatepriceList(
        id,
        updateData,
      );
      this.logger.info(
        `PriceList updated successfully: ${id} by ${user.email}`,
      );
      return new ResponseBuilder()
        .withMessage('PriceList updated successfully')
        .withData(updatedPriceList)
        .build();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `updatePriceList error for user ${user.email}: ${message}`,
      );
      handleError(error, 'Failed to update PriceList');
    }
  }

  async deletePriceList(
    id: string,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    try {
      // const PriceList = await this.PriceListRepository.findByIdandTenantId(
      //   id,
      //   user.tenantId,
      // );

      const priceList = await this.PriceListRepository.findPriceList({
        id,
        tenantId: user.tenantId,
      });

      if (!priceList) {
        this.logger.error(
          `deletePriceList failed: PriceList not found with id ${id} for user ${user.email}`,
        );
        throw new NotFoundException('PriceList not found');
      }

      // Check if there are existing entries
      const entryCount =
        await this.PriceListRepository.countPriceListEntriesByPriceListId(
          id,
          user.tenantId,
        );

      if (entryCount > 0) {
        this.logger.error(
          `deletePriceList failed: PriceList has ${entryCount} entries and cannot be deleted for user ${user.email}`,
        );
        throw new ConflictException(
          `Cannot delete PriceList. It has ${entryCount} entries. Please delete all entries first.`,
        );
      }

      await this.PriceListRepository.archivepriceList(id);
      this.logger.info(
        `PriceList deleted successfully: ${id} by ${user.email}`,
      );

      return new ResponseBuilder()
        .withStatusCode(204)
        .withMessage('PriceList deleted successfully')
        .build();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.error(
        `deletePriceList error for user ${user.email}: ${message}`,
      );
      handleError(error, 'Failed to delete PriceList');
    }
  }

  async createPriceListEntry(
    PriceListId: string,
    dto: CreatePriceListEntryDto,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    try {
      // const PriceList = await this.PriceListRepository.findByIdandTenantId(
      //   PriceListId,
      //   user.tenantId,
      // );
      const priceList = await this.PriceListRepository.findPriceList({
        id: PriceListId,
        tenantId: user.tenantId,
      });
      if (!priceList) {
        this.logger.error(
          `createPriceListEntry failed: PriceList not found with id ${PriceListId} for user ${user.email}`,
        );
        throw new NotFoundException('PriceList not found');
      }

      const product = await this.productRepository.findByIdandTenantId(
        dto.productId,
        user.tenantId,
      );
      if (!product) {
        this.logger.error(
          `createPriceListEntry failed: Product not found with id ${dto.productId} for user ${user.email}`,
        );
        throw new NotFoundException('Product not found');
      }

      if (dto.priceBookEntryId) {
        const priceBookEntry =
          await this.pricebookRepository.findPriceBookEntryByIdAndTenantId(
            dto.priceBookEntryId,
            user.tenantId,
          );
        if (!priceBookEntry) {
          this.logger.error(
            `createPriceListEntry failed: PriceBook Entry not found with id ${dto.priceBookEntryId} for user ${user.email}`,
          );
          throw new NotFoundException('PriceBook Entry not found');
        }
      }

      const existingEntry =
        await this.PriceListRepository.findPriceListEntryByPriceListIdAndProductId(
          PriceListId,
          dto.productId,
        );
      if (existingEntry) {
        this.logger.error(
          `createPriceListEntry failed: Entry already exists for PriceList ${PriceListId} and Product ${dto.productId} for user ${user.email}`,
        );
        throw new ConflictException('Product already exisits in the PriceList');
      }

      const existingByName =
        await this.PriceListRepository.findPriceListEntryByNameAndPriceListId(
          dto.name,
          PriceListId,
          user.tenantId,
        );
      if (existingByName) {
        this.logger.error(
          `createPriceListEntry failed: Name conflict for ${user.email} with name ${dto.name} in PriceList ${PriceListId}`,
        );
        throw new ConflictException(
          'PriceList Entry name already exists in this PriceList',
        );
      }

      const { productId, priceBookEntryId, ...rest } = dto;
      const PriceListEntry =
        await this.PriceListRepository.createpriceListEntry({
          ...rest,
          product: { connect: { id: productId } },
          tenant: { connect: { id: user.tenantId } },
          priceList: { connect: { id: priceList.id } },
          priceBookEntry: { connect: { id: priceBookEntryId } },
        });
      return new ResponseBuilder()
        .withStatusCode(201)
        .withMessage('PriceList Entry Created Successfuly')
        .withData(PriceListEntry)
        .build();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `createPriceListEntry failed for ${user.email}: ${message}`,
      );
      handleError(error, 'Failed to create PriceList Entry');
    }
  }

  async getPriceListEntryById(
    id: string,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    try {
      const PriceListEntry =
        await this.PriceListRepository.findpriceListEntryByIdAndTenantId(
          id,
          user.tenantId,
        );
      if (!PriceListEntry) {
        this.logger.error(
          `GetPriceListEntry failed: PriceList Entry not found with id ${id} for user ${user.email}`,
        );
        throw new NotFoundException('PriceList Entry not found');
      }

      this.logger.info(
        `PriceListEntry retrieved successfully: ${id} by ${user.email}`,
      );

      return new ResponseBuilder()
        .withMessage('PriceListEntry retrieved successfully')
        .withData(PriceListEntry)
        .build();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `GetpriceListEntry error for user ${user.email}: ${message}`,
      );
      handleError(error, 'Failed to Get PriceList Entry');
    }
  }

  async updatePriceListEntry(
    id: string,
    dto: UpdatePriceListEntryDto,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    try {
      const PriceListEntry =
        await this.PriceListRepository.findpriceListEntryByIdAndTenantId(
          id,
          user.tenantId,
        );
      if (!PriceListEntry) {
        this.logger.error(
          `updatePriceListEntry failed: PriceList Entry not found with id ${id} for user ${user.email}`,
        );
        throw new NotFoundException('PriceList Entry not found');
      }

      if (dto.name && dto.name !== PriceListEntry.name) {
        const existingByName =
          await this.PriceListRepository.findPriceListEntryByNameAndPriceListId(
            dto.name,
            PriceListEntry.priceListId,
            user.tenantId,
          );

        if (existingByName && existingByName.id !== id) {
          this.logger.error(
            `updatePriceListEntry failed: Name conflict for ${user.email} with name ${dto.name} in PriceList ${PriceListEntry.priceListId}`,
          );
          throw new ConflictException(
            'PriceList Entry name already exists in this PriceList',
          );
        }
      }

      const updatedEntry = await this.PriceListRepository.updatepriceListEntry(
        id,
        dto,
      );
      this.logger.info(
        `PriceList Entry updated successfully: ${id} by ${user.email}`,
      );
      return new ResponseBuilder()
        .withMessage('PriceList Entry updated successfully')
        .withData(updatedEntry)
        .build();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `updatePriceListEntry error for user ${user.email}: ${message}`,
      );
      handleError(error, 'Failed to update PriceList Entry');
    }
  }

  async deletePriceListEntry(
    id: string,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    try {
      const PriceListEntry =
        await this.PriceListRepository.findpriceListEntryByIdAndTenantId(
          id,
          user.tenantId,
        );
      if (!PriceListEntry) {
        this.logger.error(
          `deletePriceListEntry failed: PriceList Entry not found with id ${id} for user ${user.email}`,
        );
        throw new NotFoundException('PriceList Entry not found');
      }
      await this.PriceListRepository.archivepriceListEntry(id);
      this.logger.info(
        `PriceList Entry deleted successfully: ${id} by ${user.email}`,
      );
      return new ResponseBuilder()
        .withStatusCode(204)
        .withMessage('PriceList Entry deleted successfully')
        .build();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `deletePriceListEntry error for user ${user.email}: ${message}`,
      );
      handleError(error, 'Failed to update PriceList Entry');
    }
  }

  async findOne(id: string) {
    return await this.PriceListRepository.findById(id);
  }
}

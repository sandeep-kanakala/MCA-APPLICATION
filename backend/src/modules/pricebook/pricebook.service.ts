import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreatePriceBookDto,
  CreatePriceBookEntryDto,
  UpdatePriceBookDto,
  UpdatePriceBookEntryDto,
} from './dto/pricebook.dto';
import type { AuthenticatedRequest } from '~/interface';
import { PriceBookRepository } from '@/infrastructure/repositories/pricebook.repository';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as winston from 'winston';
import { ResponseBuilder } from '@/utils/response.builder';
import type { Response } from '@/utils/response.builder';
import { ProductRepository } from '@/infrastructure/repositories/product.repository';
import { AllowedPriceBookSortFields } from '@/config/constants/pricebook.constants';
import { ASC, CREATED_AT, DESC } from '@/config/constants';
import { PriceBookType, Prisma } from '@prisma/client';
import { handleError } from '@/utils';

@Injectable()
export class PricebookService {
  constructor(
    private readonly pricebookRepository: PriceBookRepository,
    private readonly productRepository: ProductRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: winston.Logger,
  ) {}

  async createPriceBook(
    dto: CreatePriceBookDto,
    request: AuthenticatedRequest,
  ) {
    const { user } = request;
    try {
      const existingByName =
        await this.pricebookRepository.findByNameAndTenantId(
          dto.name,
          user.tenantId,
        );

      if (existingByName) {
        this.logger.error(
          `PriceBook creation failed: Name conflict for ${user.email} with name ${dto.name}`,
        );
        throw new ConflictException('PriceBook name already exists');
      }

      const pricebook = await this.pricebookRepository.createPriceBook({
        ...dto,
        tenant: {
          connect: { id: user.tenantId },
        },
      });
      return new ResponseBuilder()
        .withStatusCode(201)
        .withMessage('PriceBoook Created Successfuly')
        .withData(pricebook)
        .build();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `PriceBook creation failed for ${user.email}: ${message}`,
      );
      handleError(error, 'Failed to create PriceBook');
    }
  }

  async getList(
    page?: number,
    limit?: number,
    search?: string,
    isArchived: boolean = false,
    type?: string,
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
      const cleanType = typeof type === 'string' ? type.trim() : type;
      const cleanSortByField =
        typeof sortByField === 'string' ? sortByField.trim() : sortByField;
      const cleanSortOrder =
        typeof sortOrder === 'string' ? sortOrder.trim() : sortOrder;
      const sortField =
        AllowedPriceBookSortFields.find(
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
      const [totalCount, priceBooks] = await Promise.all([
        this.pricebookRepository.countPriceBooks(where),
        this.pricebookRepository.getPaginatedPriceBooks(
          skip,
          pageSize,
          sortField,
          order,
          where,
        ),
      ]);
      this.logger.info(
        `PriceBook list retrieved: page ${pageNumber}, limit ${pageSize}`,
      );

      return new ResponseBuilder()
        .withMessage('PriceBooks retrieved successfully')
        .withData({
          total: totalCount,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
          data: priceBooks,
        })
        .build();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`getList error: ${message}`);
      handleError(error, 'Failed to retrieve PriceBooks');
    }
  }
  private buildWhereAndFilterClauses(
    cleanSearch?: string,
    cleanType?: string,
    cleanFromDate?: Date,
    cleanToDate?: Date,
  ): Prisma.PriceBookWhereInput {
    const searchCondition: Prisma.PriceBookWhereInput = cleanSearch
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
          ],
        }
      : {};
    const typeValues = cleanType
      ? cleanType
          .split(',')
          .map((v) => v.trim().toLowerCase())
          .filter((v) => v.length > 0)
      : [];
    const matchedTypes = Object.values(PriceBookType).filter((type) =>
      typeValues.includes(type.toLowerCase()),
    );
    const typeFilter =
      matchedTypes.length > 0 ? { in: matchedTypes } : undefined;
    const filters: Prisma.PriceBookWhereInput = {
      ...(typeFilter && { type: typeFilter }),
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

  async getPriceBookById(
    id: string,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    try {
      const priceBook =
        await this.pricebookRepository.findPriceBookByIdandTenantId(
          id,
          user.tenantId,
        );
      if (!priceBook) {
        this.logger.error(
          `getPriceBookById failed: PriceBook not found with id ${id} for user ${user.email}`,
        );
        throw new NotFoundException('PriceBook not found');
      }
      this.logger.info(
        `PriceBook retrieved successfully: ${id} by ${user.email}`,
      );

      return new ResponseBuilder()
        .withMessage('PriceBook retrieved successfully')
        .withData(priceBook)
        .build();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `getpriceBookById error for user ${user.email}: ${message}`,
      );
      handleError(error, 'Failed to retrieve PriceBooks');
    }
  }

  async updatePriceBook(
    id: string,
    dto: UpdatePriceBookDto,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    try {
      const priceBook = await this.pricebookRepository.findByIdandTenantId(
        id,
        user.tenantId,
      );
      if (!priceBook) {
        this.logger.error(
          `updatePriceBook failed: PriceBook not found with id ${id} for user ${user.email}`,
        );
        throw new NotFoundException('PriceBook not found');
      }
      const updatedPriceBook = await this.pricebookRepository.updatePriceBook(
        id,
        dto,
      );
      this.logger.info(
        `PriceBook updated successfully: ${id} by ${user.email}`,
      );
      return new ResponseBuilder()
        .withMessage('PriceBook updated successfully')
        .withData(updatedPriceBook)
        .build();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `updatePriceBook error for user ${user.email}: ${message}`,
      );
      handleError(error, 'Failed to update PriceBook');
    }
  }

  async deletePriceBook(
    id: string,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    try {
      const priceBook = await this.pricebookRepository.findByIdandTenantId(
        id,
        user.tenantId,
      );
      if (!priceBook) {
        this.logger.error(
          `deletePriceBook failed: PriceBook not found with id ${id} for user ${user.email}`,
        );
        throw new NotFoundException('PriceBook not found');
      }

      const entryCount =
        await this.pricebookRepository.countPriceBookEntriesByPriceBookId(
          id,
          user.tenantId,
        );

      if (entryCount > 0) {
        this.logger.error(
          `deletePriceBook failed: PriceBook has ${entryCount} entries and cannot be deleted for user ${user.email}`,
        );
        throw new ConflictException(
          `Cannot delete PriceBook. It has ${entryCount} entries. Please delete all entries first.`,
        );
      }

      await this.pricebookRepository.archivepriceBook(id);
      this.logger.info(
        `PriceBook deleted successfully: ${id} by ${user.email}`,
      );

      return new ResponseBuilder()
        .withStatusCode(204)
        .withMessage('PriceBook deleted successfully')
        .build();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `deletePriceBook error for user ${user.email}: ${message}`,
      );
      handleError(error, 'Failed to delete PriceBook');
    }
  }

  async createPriceBookEntry(
    priceBookId: string,
    dto: CreatePriceBookEntryDto,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    try {
      const priceBook = await this.pricebookRepository.findByIdandTenantId(
        priceBookId,
        user.tenantId,
      );
      if (!priceBook) {
        this.logger.error(
          `createPriceBookEntry failed: PriceBook not found with id ${priceBookId} for user ${user.email}`,
        );
        throw new NotFoundException('PriceBook not found');
      }

      const product = await this.productRepository.findByIdandTenantId(
        dto.productId,
        user.tenantId,
      );
      if (!product) {
        this.logger.error(
          `createPriceBookEntry failed: Product not found with id ${dto.productId} for user ${user.email}`,
        );
        throw new NotFoundException('Product not found');
      }

      const existingEntry =
        await this.pricebookRepository.findPriceBookEntryByPriceBookIdAndProductId(
          priceBook.id,
          dto.productId,
        );
      if (existingEntry) {
        this.logger.error(
          `createPriceBookEntry failed: Entry already exists for PriceBook ${priceBookId} and Product ${dto.productId} for user ${user.email}`,
        );
        throw new ConflictException('Product already exisits in the PriceBook');
      }

      const { productId, ...rest } = dto;
      const priceBookEntry =
        await this.pricebookRepository.createPriceBookEntry({
          ...rest,
          product: { connect: { id: productId } },
          tenant: { connect: { id: user.tenantId } },
          priceBook: { connect: { id: priceBook.id } },
        });
      return new ResponseBuilder()
        .withStatusCode(201)
        .withMessage('PriceBoook Entry Created Successfuly')
        .withData(priceBookEntry)
        .build();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `createPriceBookEntry failed for ${user.email}: ${message}`,
      );
      handleError(error, 'Failed to create PriceBook Entry');
    }
  }

  async getPriceBookEntryById(
    id: string,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    try {
      const priceBookEntry =
        await this.pricebookRepository.findPriceBookEntryByIdAndTenantId(
          id,
          user.tenantId,
        );
      if (!priceBookEntry) {
        this.logger.error(
          `GetPriceBookEntry failed: PriceBook Entry not found with id ${id} for user ${user.email}`,
        );
        throw new NotFoundException('PriceBook Entry not found');
      }
      this.logger.info(
        `PriceBookEntry retrieved successfully: ${id} by ${user.email}`,
      );

      return new ResponseBuilder()
        .withMessage('PriceBookEntry retrieved successfully')
        .withData(priceBookEntry)
        .build();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `GetpriceBookEntry error for user ${user.email}: ${message}`,
      );
      handleError(error, 'Failed to Get PriceBook Entry');
    }
  }

  async updatePriceBookEntry(
    id: string,
    dto: UpdatePriceBookEntryDto,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    try {
      const priceBookEntry =
        await this.pricebookRepository.findPriceBookEntryByIdAndTenantId(
          id,
          user.tenantId,
        );
      if (!priceBookEntry) {
        this.logger.error(
          `updatePriceBookEntry failed: PriceBook Entry not found with id ${id} for user ${user.email}`,
        );
        throw new NotFoundException('PriceBook Entry not found');
      }
      const updatedEntry = await this.pricebookRepository.updatePriceBookEntry(
        id,
        dto,
      );
      this.logger.info(
        `PriceBook Entry updated successfully: ${id} by ${user.email}`,
      );
      return new ResponseBuilder()
        .withMessage('PriceBook Entry updated successfully')
        .withData(updatedEntry)
        .build();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `updatePriceBookEntry error for user ${user.email}: ${message}`,
      );
      handleError(error);
    }
  }

  async deletePriceBookEntry(
    id: string,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    try {
      const priceBookEntry =
        await this.pricebookRepository.findPriceBookEntryByIdAndTenantId(
          id,
          user.tenantId,
        );
      if (!priceBookEntry) {
        this.logger.error(
          `deletePriceBookEntry failed: PriceBook Entry not found with id ${id} for user ${user.email}`,
        );
        throw new NotFoundException('PriceBook Entry not found');
      }
      await this.pricebookRepository.archivepriceBookEntry(id);
      this.logger.info(
        `PriceBook Entry deleted successfully: ${id} by ${user.email}`,
      );
      return new ResponseBuilder()
        .withStatusCode(204)
        .withMessage('PriceBook Entry deleted successfully')
        .build();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `deletePriceBookEntry error for user ${user.email}: ${message}`,
      );
      handleError(error);
    }
  }
  async findOne(id: string) {
    return await this.pricebookRepository.findById(id);
  }
}

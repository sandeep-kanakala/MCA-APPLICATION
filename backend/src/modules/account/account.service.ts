import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { AccountRepository } from '@/infrastructure/repositories/account.repository';
import {
  CreateAccountDetailsDto,
  CreateAccountDto,
  UpdateAccountDto,
} from './dto';
import { ResponseBuilder } from '@/utils/response.builder';
import type { Response } from '@/utils/response.builder';
import { AuthenticatedRequest } from '~/interface';
import { Account, AccountType, Prisma } from '@prisma/client';
import { cleanPatchData, handleError } from '@/utils';
import { ASC, CREATED_AT, DESC } from '@/config/constants';
import { AllowedAccountSortFields } from '@/config/constants/account.constants';
import { PrismaService } from '@/prisma/prisma.service';
@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createAccountDetails(
    data: CreateAccountDetailsDto,
    request: AuthenticatedRequest,
  ) {
    try {
      const { user } = request;

      if (!data?.name?.trim()) {
        throw new BadRequestException('Account name is required');
      }

      const existingAccount = await this.accountRepository.findByName(
        data.name,
        user.tenantId,
      );

      if (existingAccount) {
        throw new ConflictException('Account with this name already exists');
      }

      const result = await this.accountRepository.createAccountDetails(
        user,
        data,
      );

      return new ResponseBuilder()
        .withStatusCode(201)
        .withMessage('Account created successfully')
        .withData(result)
        .build();
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        handleError(error, 'creating account (Prisma error)');
      } else if (error instanceof Error) {
        handleError(error, 'creating account');
      } else {
        handleError(new Error('Unknown error occurred'), 'creating account');
      }
    }
  }

  async createAccount(
    dto: CreateAccountDto,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    try {
      const { user } = request;

      if (!dto?.name?.trim()) {
        throw new BadRequestException('Account name is required');
      }

      const existingAccount = await this.accountRepository.findByName(
        dto.name,
        user.tenantId,
      );

      if (existingAccount) {
        throw new ConflictException('Account with this name already exists');
      }

      const accountObj =
        await this.accountRepository.generateNextAccountIdentifiers(
          this.prisma,
          dto.countryCode,
          dto,
        );
      const createInput: Prisma.AccountCreateInput = {
        ...accountObj,
        tenant: { connect: { id: user.tenantId } },
        createdBy: { connect: { id: user.id } },
      };

      const account = await this.accountRepository.createAccount(createInput);

      return new ResponseBuilder()
        .withStatusCode(201)
        .withMessage('Account created successfully')
        .withData(account)
        .build();
    } catch (error: unknown) {
      handleError(error, 'creating account');
    }
  }

  async getAll(
    page: number,
    limit: number,
    isArchived: boolean = false,
    sortByField: string = 'createdAt',
    search?: string,
    type?: string,
    fromDate?: Date,
    toDate?: Date,
    sortOrder?: string,
  ): Promise<Response> {
    try {
      const pageNumber = Math.max(Number(page) || 1, 1);
      const pageSize = Math.max(Number(limit) || 10, 1);
      const skip = (pageNumber - 1) * pageSize;
      const cleanType = typeof type === 'string' ? type.trim() : type;
      const cleanSearch = typeof search === 'string' ? search.trim() : search;
      const cleanSortOrder =
        typeof sortOrder === 'string' ? sortOrder.trim() : sortOrder;
      const cleanSortByField =
        typeof sortByField === 'string' ? sortByField.trim() : sortByField;

      const whereCondition = this.buildWhereAndFilterClauses(
        cleanSearch,
        cleanType,
        fromDate,
        toDate,
      );
      const sortField =
        AllowedAccountSortFields.find(
          (f) => f.toLowerCase() === cleanSortByField?.toLowerCase(),
        ) || CREATED_AT;
      const order = cleanSortOrder?.toLowerCase() === ASC ? ASC : DESC;
      const where: Prisma.AccountWhereInput = {
        ...whereCondition,
        isArchived,
      };
      const [totalCount, accounts] = await Promise.all([
        this.accountRepository.countAll(where),
        this.accountRepository.getPaginated(
          skip,
          pageSize,
          where,
          sortField,
          order,
        ),
      ]);
      return new ResponseBuilder()
        .withMessage('Accounts retrieved successfully')
        .withData({
          total: totalCount,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
          data: accounts,
        })
        .build();
    } catch (error: unknown) {
      handleError(error, 'retrieving accounts');
    }
  }

  async getAccountById(id: string): Promise<Response> {
    try {
      if (!id) {
        throw new BadRequestException('Account ID is required');
      }

      const account = await this.accountRepository.findById(id);
      if (!account) throw new NotFoundException('Account not found');

      return new ResponseBuilder()
        .withData(account)
        .withMessage('Account retrieved successfully')
        .build();
    } catch (error: unknown) {
      handleError(error, 'fetching account by ID');
    }
  }

  async updateAccount(
    id: string,
    dto: UpdateAccountDto,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    try {
      const { user } = request;

      if (!id) {
        throw new BadRequestException('Account ID is required');
      }

      const existingAccount = await this.accountRepository.findById(id);
      if (!existingAccount) {
        throw new NotFoundException('Account not found');
      }
      if (dto.name && dto.name !== existingAccount.name) {
        const nameConflict = await this.accountRepository.findByName(
          dto.name,
          user.tenantId,
        );

        if (nameConflict && nameConflict.id !== id) {
          throw new ConflictException('Account with this name already exists');
        }
      }
      const changes = cleanPatchData<Account>(dto, existingAccount);
      if (!changes.isChanged) {
        return new ResponseBuilder()
          .withStatusCode(204)
          .withMessage('no changes found')
          .withData(dto)
          .build();
      }

      const updatedAccount = await this.accountRepository.updateAccount(id, {
        ...changes.cleaned,
        updatedBy: { connect: { id: user.id } },
        updatedAt: new Date(),
      });

      return new ResponseBuilder()
        .withData(updatedAccount)
        .withMessage('Account updated successfully')
        .build();
    } catch (error: unknown) {
      handleError(error, 'updating account');
    }
  }

  async deleteAccount(
    id: string,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    try {
      const { user } = request;

      if (!id) {
        throw new BadRequestException('Account ID is required');
      }

      const existingAccount = await this.accountRepository.findById(id);
      if (!existingAccount) {
        throw new NotFoundException('Account not found');
      }
      await this.accountRepository.archiveAccount(id, user.id);

      return new ResponseBuilder()
        .withStatusCode(204)
        .withMessage('Account deleted successfully')
        .build();
    } catch (error: unknown) {
      handleError(error, 'deleting account');
    }
  }

  async findOne(id: string) {
    return await this.accountRepository.findById(id);
  }
  private buildWhereAndFilterClauses(
    cleanSearch?: string,
    cleanType?: string,
    cleanFromDate?: Date,
    cleanToDate?: Date,
  ): Prisma.AccountWhereInput {
    const searchCondition: Prisma.AccountWhereInput = cleanSearch
      ? {
          OR: [
            {
              name: {
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

    const matchedTypes = Object.values(AccountType).filter((type) =>
      typeValues.includes(type.toLowerCase()),
    );
    const typeFilter =
      matchedTypes.length > 0 ? { in: matchedTypes } : undefined;
    const filters: Prisma.AccountWhereInput = {
      ...(typeFilter && { type: typeFilter }),
      ...(cleanFromDate && {
        createdAt: {
          gte: cleanFromDate,
        },
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
}

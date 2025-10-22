import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { AccountRepository } from '@/infrastructure/repositories/account.repository';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import { ResponseBuilder } from '@/utils/response.builder';
import type { Response } from '@/utils/response.builder';
import { JwtService } from '@nestjs/jwt';
import { AuditRequest } from '~/interface';
import {
  toAccountResponseDto,
  toPrismaCreateAccountData,
  toPrismaUpdateAccountData,
} from '@/utils/mapper/account.mapper';

@Injectable()
export class AccountService {
  private readonly logger = new Logger(AccountService.name);

  constructor(private readonly accountRepository: AccountRepository) {}

  async createAccount(
    dto: CreateAccountDto,
    request: AuditRequest,
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

      const account = await this.accountRepository.createAccount(
        toPrismaCreateAccountData(dto, user),
      );

      return new ResponseBuilder()
        .withStatusCode(201)
        .withMessage('Account created successfully')
        .withData(toAccountResponseDto(account))
        .build();
    } catch (error: unknown) {
      this.handleError(error, 'creating account');
    }
  }

  async getAll(page?: number, limit?: number): Promise<Response> {
    try {
      const pageNumber = Math.max(Number(page) || 1, 1);
      const pageSize = Math.max(Number(limit) || 10, 1);
      const skip = (pageNumber - 1) * pageSize;

      const [totalCount, accounts] = await Promise.all([
        this.accountRepository.countAll(),
        this.accountRepository.getPaginated(skip, pageSize),
      ]);

      return new ResponseBuilder()
        .withMessage('Accounts retrieved successfully')
        .withData({
          total: totalCount,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
          data: accounts.map(toAccountResponseDto),
        })
        .build();
    } catch (error: unknown) {
      this.handleError(error, 'retrieving accounts');
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
        .withData(toAccountResponseDto(account))
        .withMessage('Account retrieved successfully')
        .build();
    } catch (error: unknown) {
      this.handleError(error, 'fetching account by ID');
    }
  }

  async updateAccount(
    id: string,
    dto: UpdateAccountDto,
    request: AuditRequest,
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

      request.beforeUpdate = existingAccount;

      if (dto.name && dto.name !== existingAccount.name) {
        const nameConflict = await this.accountRepository.findByName(
          dto.name,
          user.tenantId,
        );

        if (nameConflict && nameConflict.id !== id) {
          throw new ConflictException('Account with this name already exists');
        }
      }

      const updatedAccount = await this.accountRepository.updateAccount(
        id,
        toPrismaUpdateAccountData(dto, user.id),
      );

      return new ResponseBuilder()
        .withData(toAccountResponseDto(updatedAccount))
        .withMessage('Account updated successfully')
        .build();
    } catch (error: unknown) {
      this.handleError(error, 'updating account');
    }
  }

  async deleteAccount(id: string, request: AuditRequest): Promise<Response> {
    try {
      const { user } = request;

      if (!id) {
        throw new BadRequestException('Account ID is required');
      }

      const existingAccount = await this.accountRepository.findById(id);
      if (!existingAccount) {
        throw new NotFoundException('Account not found');
      }

      request.beforeDelete = existingAccount;
      await this.accountRepository.archiveAccount(id, user.id);

      return new ResponseBuilder()
        .withMessage('Account deleted successfully')
        .build();
    } catch (error: unknown) {
      this.handleError(error, 'deleting account');
    }
  }

  async getAccountByContactId(contactId: string): Promise<Response> {
    try {
      if (!contactId) {
        throw new BadRequestException('Contact ID is required');
      }

      const account =
        await this.accountRepository.getAccountBycontact(contactId);

      if (!account) {
        throw new NotFoundException(
          'No account found for the given contact ID',
        );
      }

      return new ResponseBuilder()
        .withData(account)
        .withMessage('Account retrieved successfully')
        .build();
    } catch (error: unknown) {
      this.handleError(error, 'fetching account by contact ID');
    }
  }

  private handleError(error: unknown, context: string): never {
    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException ||
      error instanceof ConflictException
    ) {
      throw error;
    }

    if (error instanceof Error) {
      this.logger.error(`Error ${context}: ${error.message}`, error.stack);
    } else {
      this.logger.error(`Unknown error ${context}: ${JSON.stringify(error)}`);
    }

    throw new InternalServerErrorException(
      `An unexpected error occurred while ${context}`,
    );
  }
}

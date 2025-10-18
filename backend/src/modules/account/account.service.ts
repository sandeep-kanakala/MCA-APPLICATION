import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { AccountRepository } from '@/infrastructure/repositories/account.repository';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import { ResponseBuilder } from '@/utils/response.builder';
import type { Response } from '@/utils/response.builder';
import { JwtService } from '@nestjs/jwt';
import { AuditRequest, IUserTokenPayload } from '~/interface';

@Injectable()
export class AccountService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly jwtService: JwtService,
  ) {}

  async createAccount(
    dto: CreateAccountDto,
    user: IUserTokenPayload,
  ): Promise<Response> {
    const existingAccount = await this.accountRepository.findByName(
      dto.name,
      user.tenantId,
    );

    if (existingAccount) {
      throw new ConflictException('Account with this name already exists');
    }

    const account = await this.accountRepository.createAccount({
      ...dto,
      tenantId: user.tenantId,
      ownerId: user.userId,
      createdById: user.userId,
      updatedById: user.userId,
    });

    // request.afterUpdate = account;

    return new ResponseBuilder()
      .withStatusCode(201)
      .withMessage('Account created successfully')
      .withData(account)
      .build();
  }

  async getAll(page?: number, limit?: number): Promise<Response> {
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
        data: accounts,
      })
      .build();
  }

  async getAccountById(id: string): Promise<Response> {
    const account = await this.accountRepository.findById(id);
    if (!account) throw new NotFoundException('Account not found');

    return new ResponseBuilder()
      .withData(account)
      .withMessage('Account retrieved successfully')
      .build();
  }

  async updateAccount(
    id: string,
    dto: UpdateAccountDto,
    user: IUserTokenPayload,
  ): Promise<Response> {
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

    const updatedAccount = await this.accountRepository.updateAccount(id, {
      ...dto,
      ownerId: user.userId,
      updatedById: user.userId,
    });

    return new ResponseBuilder()
      .withData(updatedAccount)
      .withMessage('Account updated successfully')
      .build();
  }

  async deleteAccount(id: string, user: IUserTokenPayload): Promise<Response> {
    const existingAccount = await this.accountRepository.findById(id);
    if (!existingAccount) {
      throw new NotFoundException('Account not found');
    }
    await this.accountRepository.archiveAccount(id, user.userId);

    return new ResponseBuilder()
      .withMessage('Account deleted successfully')
      .build();
  }
}

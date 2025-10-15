import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import { ResponseBuilder } from '@/utils/response.builder';
import type { Response } from '@/utils/response.builder';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async createAccount(dto: CreateAccountDto, token: string): Promise<Response> {
    const decoded = this.jwtService.decode(token);
    const tenantId = decoded.tenantId;
    const userId = decoded.userId;
    try {
      // Check if account with same name already exists in tenant
      const existingAccount = await this.prisma.account.findFirst({
        where: {
          tenantId,
          name: dto.name,
          isArchived: false,
        },
      });

      if (existingAccount) {
        throw new ConflictException('Account with this name already exists');
      }

      const account = await this.prisma.account.create({
        data: {
          tenantId,
          name: dto.name,
          type: dto.type ?? null,
          industry: dto.industry ?? null,
          website: dto.website ?? null,
          phone: dto.phone ?? null,
          billingStreet: dto.billingStreet ?? null,
          billingCity: dto.billingCity ?? null,
          billingState: dto.billingState ?? null,
          billingPostal: dto.billingPostal ?? null,
          billingCountry: dto.billingCountry ?? null,
          shippingStreet: dto.shippingStreet ?? null,
          shippingCity: dto.shippingCity ?? null,
          shippingState: dto.shippingState ?? null,
          shippingPostal: dto.shippingPostal ?? null,
          shippingCountry: dto.shippingCountry ?? null,
          ownerId: userId,
          createdById: userId,
          updatedById: userId,
        },
        select: {
          id: true,
          name: true,
          type: true,
          industry: true,
          website: true,
          phone: true,
          billingStreet: true,
          billingCity: true,
          billingState: true,
          billingPostal: true,
          billingCountry: true,
          shippingStreet: true,
          shippingCity: true,
          shippingState: true,
          shippingPostal: true,
          shippingCountry: true,
          ownerId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return new ResponseBuilder()
        .withStatusCode(201)
        .withMessage('Account created successfully')
        .withData(account)
        .build();
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new ConflictException('Failed to create account');
    }
  }

  async getAll(): Promise<Response> {
    const items = await this.prisma.account.findMany({
      where: { isArchived: false },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        type: true,
        industry: true,
        website: true,
        phone: true,
        billingStreet: true,
        billingCity: true,
        billingState: true,
        billingPostal: true,
        billingCountry: true,
        shippingStreet: true,
        shippingCity: true,
        shippingState: true,
        shippingPostal: true,
        shippingCountry: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return new ResponseBuilder()
      .withData(items)
      .withMessage('Accounts retrieved successfully')
      .build();
  }

  async getAccountById(id: string): Promise<Response> {
    const account = await this.prisma.account.findFirst({
      where: { id, isArchived: false },
      select: {
        id: true,
        name: true,
        type: true,
        industry: true,
        website: true,
        phone: true,
        billingStreet: true,
        billingCity: true,
        billingState: true,
        billingPostal: true,
        billingCountry: true,
        shippingStreet: true,
        shippingCity: true,
        shippingState: true,
        shippingPostal: true,
        shippingCountry: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!account) throw new NotFoundException('Account not found');

    return new ResponseBuilder()
      .withData(account)
      .withMessage('Account retrieved successfully')
      .build();
  }

  async updateAccount(
    id: string,
    dto: UpdateAccountDto,
    token: string,
  ): Promise<Response> {
    const decoded = this.jwtService.decode(token);
    const tenantId = decoded.tenantId;
    const userId = decoded.userId;
    try {
      const existingAccount = await this.prisma.account.findFirst({
        where: { id, isArchived: false },
      });

      if (!existingAccount) {
        throw new NotFoundException('Account not found');
      }

      if (dto.name && dto.name !== existingAccount.name) {
        const nameConflict = await this.prisma.account.findFirst({
          where: {
            tenantId,
            name: dto.name,
            isArchived: false,
            id: { not: id },
          },
        });

        if (nameConflict) {
          throw new ConflictException('Account with this name already exists');
        }
      }

      const updatedAccount = await this.prisma.account.update({
        where: { id },
        data: {
          name: dto.name,
          type: dto.type ?? null,
          industry: dto.industry ?? null,
          website: dto.website ?? null,
          phone: dto.phone ?? null,
          billingStreet: dto.billingStreet ?? null,
          billingCity: dto.billingCity ?? null,
          billingState: dto.billingState ?? null,
          billingPostal: dto.billingPostal ?? null,
          billingCountry: dto.billingCountry ?? null,
          shippingStreet: dto.shippingStreet ?? null,
          shippingCity: dto.shippingCity ?? null,
          shippingState: dto.shippingState ?? null,
          shippingPostal: dto.shippingPostal ?? null,
          shippingCountry: dto.shippingCountry ?? null,
          ownerId: userId ?? null,
          updatedById: userId,
        },
        select: {
          id: true,
          name: true,
          type: true,
          industry: true,
          website: true,
          phone: true,
          billingStreet: true,
          billingCity: true,
          billingState: true,
          billingPostal: true,
          billingCountry: true,
          shippingStreet: true,
          shippingCity: true,
          shippingState: true,
          shippingPostal: true,
          shippingCountry: true,
          ownerId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return new ResponseBuilder()
        .withData(updatedAccount)
        .withMessage('Account updated successfully')
        .build();
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new ConflictException('Failed to update account');
    }
  }

  async deleteAccount(id: string, token: string): Promise<Response> {
    const decoded = this.jwtService.decode(token);
    const userId = decoded.userId;
    try {
      const existingAccount = await this.prisma.account.findFirst({
        where: { id },
      });

      if (!existingAccount) {
        throw new NotFoundException('Account not found');
      }

      await this.prisma.account.update({
        where: { id },
        data: {
          isArchived: true,
          archivedAt: new Date(),
          updatedById: userId,
        },
      });

      return new ResponseBuilder()
        .withMessage('Account deleted successfully')
        .build();
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new ConflictException('Failed to delete account');
    }
  }
}

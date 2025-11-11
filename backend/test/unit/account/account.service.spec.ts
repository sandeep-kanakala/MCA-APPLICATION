import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from '@/modules/account/account.service';
import { AccountRepository } from '@/infrastructure/repositories/account.repository';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  mockAccount,
  mockAccountWithContacts,
  mockUpdatedAccount,
  mockAudit,
  mockRequest,
} from './account.mock';
import type { AuditRequest } from '~/interface';
import { AccountType } from '@prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
// Mock ResponseBuilder
const mockResponseBuilder = {
  withMessage: jest.fn().mockReturnThis(),
  withData: jest.fn().mockReturnThis(),
  withStatusCode: jest.fn().mockReturnThis(),
  build: jest.fn().mockReturnValue({ success: true }),
};

jest.mock('@/utils/response.builder', () => ({
  ResponseBuilder: jest.fn().mockImplementation(() => mockResponseBuilder),
}));

describe('AccountService', () => {
  let service: AccountService;
  let repo: jest.Mocked<AccountRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: AccountRepository,
          useValue: {
            findByName: jest.fn(),
            createAccount: jest.fn(),
            countAll: jest.fn(),
            getPaginated: jest.fn(),
            findById: jest.fn(),
            updateAccount: jest.fn(),
            archiveAccount: jest.fn(),
            getAccountBycontact: jest.fn(),
            generateNextAccountIdentifiers: jest.fn().mockResolvedValue({
              autoNumber: '0000000001',
              accountNumber: 'ACC0000000001',
            }),
          },
        },
        { provide: JwtService, useValue: { signAsync: jest.fn() } },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    repo = module.get(AccountRepository);
  });

  afterEach(() => jest.clearAllMocks());

  describe('createAccount', () => {
    it('should throw ConflictException if account exists', async () => {
      repo.findByName.mockResolvedValueOnce(mockAccount);

      await expect(
        service.createAccount(
          {
            name: mockAccount.name,
            type: AccountType.CUSTOMER,
            currencyCode: '288',
            status: 'ACTIVE',
            countryCode: 'US',
            sameAsBilling: 'false',
          },
          mockRequest,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should create account successfully', async () => {
      repo.findByName.mockResolvedValueOnce(null);
      repo.createAccount.mockResolvedValueOnce(mockAccount);

      const result = await service.createAccount(
        {
          name: mockAccount.name,
          type: AccountType.CUSTOMER,
          currencyCode: '288',
          status: 'ACTIVE',
          countryCode: 'US',
          sameAsBilling: 'false',
        },
        mockRequest,
      );

      expect(mockResponseBuilder.withMessage).toHaveBeenCalledWith(
        'Account created successfully',
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('getAll', () => {
    it('should return paginated accounts', async () => {
      repo.countAll.mockResolvedValueOnce(1);
      repo.getPaginated.mockResolvedValueOnce([mockAccount]);

      const result = await service.getAll(1, 10);

      expect(mockResponseBuilder.withMessage).toHaveBeenCalledWith(
        'Accounts retrieved successfully',
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('getAccountById', () => {
    it('should throw NotFoundException if not found', async () => {
      repo.findById.mockResolvedValueOnce(null);

      await expect(service.getAccountById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return account if found', async () => {
      repo.findById.mockResolvedValueOnce(mockAccount);

      const result = await service.getAccountById(mockAccount.id);

      expect(result).toEqual({ success: true });
    });
  });

  describe('updateAccount', () => {
    it('should throw NotFoundException if account missing', async () => {
      repo.findById.mockResolvedValueOnce(null);

      await expect(
        service.updateAccount(
          'missing',
          { name: 'Updated', type: AccountType.CUSTOMER },
          mockRequest,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update successfully', async () => {
      repo.findById.mockResolvedValueOnce(mockAccount);
      repo.findByName.mockResolvedValueOnce(null);
      repo.updateAccount.mockResolvedValueOnce(mockUpdatedAccount);

      const result = await service.updateAccount(
        mockAccount.id,
        { name: 'Updated', type: AccountType.CUSTOMER },
        mockRequest,
      );

      expect(result).toEqual({ success: true });
    });
  });

  describe('deleteAccount', () => {
    it('should throw NotFoundException if account missing', async () => {
      repo.findById.mockResolvedValueOnce(null);

      await expect(
        service.deleteAccount('missing', mockRequest),
      ).rejects.toThrow(NotFoundException);
    });

    it('should delete successfully', async () => {
      repo.findById.mockResolvedValueOnce(mockAccount);
      repo.archiveAccount.mockResolvedValueOnce(mockAccount);

      const result = await service.deleteAccount(mockAccount.id, mockRequest);

      expect(result).toEqual({ success: true });
    });
  });
});

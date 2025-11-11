import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from '@/modules/account/account.service';
import { AccountRepository } from '@/infrastructure/repositories/account.repository';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import type { Account } from '@prisma/client';
import type { IUserTokenPayload } from '~/interface';
import type {
  CreateAccountDto,
  UpdateAccountDto,
} from '@/modules/account/dto/account.dto';

describe('AccountService', () => {
  let service: AccountService;
  let repository: AccountRepository;

  const mockAccount: Account = {
    id: '1',
    name: 'Test Account',
    tenantId: 'tenant1',
    type: 'Customer',
    industry: 'IT',
    website: 'https://example.com',
    phone: '1234567890',
    billingStreet: null,
    billingCity: null,
    billingState: null,
    billingPostal: null,
    billingCountry: null,
    shippingStreet: null,
    shippingCity: null,
    shippingState: null,
    shippingPostal: null,
    shippingCountry: null,
    ownerId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    createdById: 'user1',
    updatedById: 'user1',
    archivedAt: null,
    isArchived: false,
  };

  const mockUserToken: IUserTokenPayload = {
    id: 'user1', // updated field
    tenantId: 'tenant1',
    email: 'test@example.com',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };

  const mockCreateDto: CreateAccountDto = {
    name: 'Test Account',
    type: 'Customer',
    industry: 'IT',
    website: 'https://example.com',
    phone: '1234567890',
    billingStreet: null,
    billingCity: null,
    billingState: null,
    billingPostal: null,
    billingCountry: null,
  };

  const mockUpdateDto: UpdateAccountDto = {
    billingCity: 'New City',
    website: 'https://newsite.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        {
          provide: AccountRepository,
          useValue: {
            findByName: jest.fn().mockResolvedValue(null),
            findById: jest.fn().mockResolvedValue(mockAccount),
            createAccount: jest.fn().mockResolvedValue(mockAccount),
            updateAccount: jest
              .fn()
              .mockResolvedValue({ ...mockAccount, ...mockUpdateDto }),
            archiveAccount: jest.fn().mockResolvedValue(mockAccount),
            countAll: jest.fn().mockResolvedValue(1),
            getPaginated: jest.fn().mockResolvedValue([mockAccount]),
          },
        },
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mock-token'),
            verifyAsync: jest.fn().mockResolvedValue(mockUserToken),
          },
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    repository = module.get<AccountRepository>(AccountRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    it('should create and return account', async () => {
      const result = await service.createAccount(mockCreateDto, mockUserToken);
      expect(result.data).toMatchObject({
        name: mockAccount.name,
        id: mockAccount.id,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.createAccount).toHaveBeenCalled();
    });
  });

  describe('getAccountById', () => {
    it('should return account by id', async () => {
      const result = await service.getAccountById('1');
      expect(result.data).toMatchObject({
        name: mockAccount.name,
        id: mockAccount.id,
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('getAll', () => {
    it('should return paginated accounts', async () => {
      const result = await service.getAll(1, 10);
      const data = result.data as {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        data: Account[];
      };

      expect(data.total).toBe(1);
      expect(data.page).toBe(1);
      expect(data.limit).toBe(10);
      expect(data.totalPages).toBe(1);
      expect(data.data).toHaveLength(1);
      expect(data.data[0]).toMatchObject({
        id: mockAccount.id,
        name: mockAccount.name,
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.countAll).toHaveBeenCalled();
      expect(repository.getPaginated).toHaveBeenCalledWith(0, 10);
    });

    it('should handle default page and limit', async () => {
      const result = await service.getAll();
      const data = result.data as {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        data: Account[];
      };

      expect(data.page).toBe(1);
      expect(data.limit).toBe(10);
      expect(data.data[0]).toMatchObject({
        id: mockAccount.id,
        name: mockAccount.name,
      });
    });
  });

  describe('updateAccount', () => {
    it('should update and return account', async () => {
      const result = await service.updateAccount(
        '1',
        mockUpdateDto,
        mockUserToken,
      );
      expect(result.data).toMatchObject({
        id: mockAccount.id,
        website: mockUpdateDto.website,
        billingAddress: {
          city: mockUpdateDto.billingCity,
        },
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.updateAccount).toHaveBeenCalled();
    });
  });

  describe('deleteAccount', () => {
    it('should archive account', async () => {
      const result = await service.deleteAccount('1', mockUserToken);
      expect(result.message).toBe('Account deleted successfully');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(repository.archiveAccount).toHaveBeenCalledWith(
        '1',
        mockUserToken.id,
      );
    });
  });
});

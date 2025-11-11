import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ProductService } from '@/modules/product/product.service';
import {
  CreateProductDto,
  UpdateProductDto,
} from '@/modules/product/dto/product.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { ProductRepository } from '@/infrastructure/repositories/product.repository';
import { JwtService } from '@nestjs/jwt';
import { RequestWithUser } from '~/interface';
import { AuditLogService } from '@/audit/audit-log.service';

const mockAuditLogService = {
  log: jest.fn(),
};

const mockProductRepository = {
  findByNameAndTenantId: jest.fn(),
  findBySkuAndTenantId: jest.fn(),
  createProduct: jest.fn(),
  createProductBundle: jest.fn(),
  findByIdandTenantId: jest.fn(),
  updateProduct: jest.fn(),
  archiveProductBundlesByProductId: jest.fn(),
  archiveProduct: jest.fn(),
  countProducts: jest.fn(),
  getPaginatedProducts: jest.fn(),
  countBundles: jest.fn(),
  getPaginatedBundles: jest.fn(),
  findBundleByIdandTenantId: jest.fn(),
  findManyProductBundles: jest.fn().mockResolvedValue([]),
};

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
};

const mockJwtService = {};
const mockUser = {
  id: 'cmh0e1i7n000bsas4k46i1atw',
  tenantId: 'cmf3mwg3u09hspoye9ggodyvh',
  email: 'admin@linkfields.com',
  firstName: '',
  middleName: null,
  lastName: '',
  phoneNo: '',
  roles: [
    {
      id: 'cmh0e1cc50005sas4ps1vm357',
      tenantId: 'cmf3mwg3u09hspoye9ggodyvh',
      name: 'SUPER_ADMIN',
    },
  ],
};

const mockRequest = {
  user: mockUser,
} as unknown as RequestWithUser;

type CreateProductData = {
  product: { id: string };
  bundle?: { id: string };
};

type TestProduct = {
  id: string;
  name?: string;
  isBundle?: boolean;
  tenantId?: string;
  bundlesAsParent?: { id: string; items?: { id: string }[] }[];
};

type PaginatedProductData = {
  total: number;
  data: TestProduct[];
};

type MakeBundleData = {
  product: TestProduct;
  bundle: { id: string };
};

describe('ProductService with Zod DTOs', () => {
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: WINSTON_MODULE_PROVIDER, useValue: mockLogger },
        { provide: ProductRepository, useValue: mockProductRepository },
        {
          provide: PrismaService,
          useValue: {
            $transaction: jest.fn(
              (
                fn: (prisma: typeof mockProductRepository) => Promise<unknown>,
              ) => fn(mockProductRepository),
            ),
          },
        },
        { provide: JwtService, useValue: mockJwtService },
        { provide: AuditLogService, useValue: mockAuditLogService },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('createProduct', () => {
    it('should create product without bundle', async () => {
      const dto = {
        name: 'Standard Product',
        sku: 'SKU-123',
        type: 'GOOD',
        isBundle: false,
      } as CreateProductDto;

      mockProductRepository.findByNameAndTenantId.mockResolvedValue(null);
      mockProductRepository.findBySkuAndTenantId.mockResolvedValue(null);
      mockProductRepository.createProduct.mockResolvedValue({
        id: 'prod-1',
        ...dto,
      });

      const result = await service.createProduct(dto, mockRequest);

      expect(mockProductRepository.createProduct).toHaveBeenCalled();
      expect(mockProductRepository.createProductBundle).not.toHaveBeenCalled();
      expect((result.data as TestProduct).id).toBe('prod-1');
    });

    it('should create product with bundle', async () => {
      const dto = {
        name: 'Bundle Product',
        sku: 'BUNDLE-SKU',
        type: 'GOOD',
        isBundle: true,
      } as CreateProductDto;

      mockProductRepository.findByNameAndTenantId.mockResolvedValue(null);
      mockProductRepository.findBySkuAndTenantId.mockResolvedValue(null);
      mockProductRepository.createProduct.mockResolvedValue({
        id: 'prod-2',
        ...dto,
        bundlesAsParent: [{ id: 'bundle-1', items: [] }],
      });

      const result = await service.createProduct(dto, mockRequest);

      expect(mockProductRepository.createProductBundle).not.toHaveBeenCalled();
      expect((result.data as TestProduct).bundlesAsParent![0].id).toBe(
        'bundle-1',
      );
    });

    it('should throw conflict if name already exists', async () => {
      const dto = {
        name: 'Duplicate Product',
        sku: 'SKU-999',
        type: 'GOOD',
      } as CreateProductDto;

      mockProductRepository.findByNameAndTenantId.mockResolvedValue({
        id: 'existing',
      });

      await expect(service.createProduct(dto, mockRequest)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw conflict if sku already exists', async () => {
      const dto = {
        name: 'Another Product',
        sku: 'SKU-999',
        type: 'GOOD',
      } as CreateProductDto;

      mockProductRepository.findByNameAndTenantId.mockResolvedValue(null);
      mockProductRepository.findBySkuAndTenantId.mockResolvedValue({
        id: 'existing-sku',
      });

      // Service currently wraps errors and returns InternalServerErrorException
      await expect(service.createProduct(dto, mockRequest)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should fail when sku is missing (sku mandatory)', async () => {
      const dto = {
        name: 'No SKU Product',
        // sku intentionally omitted
        type: 'GOOD',
        isBundle: false,
      } as unknown as CreateProductDto;

      mockProductRepository.findByNameAndTenantId.mockResolvedValue(null);
      mockProductRepository.findBySkuAndTenantId.mockResolvedValue(null);
      // Simulate prisma validation error when sku is missing
      mockProductRepository.createProduct.mockRejectedValue(
        new Error('sku is required'),
      );

      await expect(service.createProduct(dto, mockRequest)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockProductRepository.createProduct).toHaveBeenCalled();
    });
  });

  describe('updateProduct', () => {
    it('should update product and convert to bundle', async () => {
      const id = 'prod-3';
      const dto = {
        name: 'Convert to Bundle',
        isBundle: true,
      } as UpdateProductDto;

      mockProductRepository.findByIdandTenantId.mockResolvedValue({
        id,
        isBundle: false,
      });
      mockProductRepository.createProductBundle.mockResolvedValue({
        id: 'bundle-3',
      });
      mockProductRepository.updateProduct.mockResolvedValue({ id, ...dto });

      const result = await service.updateProduct(id, dto, mockRequest);

      expect(mockProductRepository.createProductBundle).toHaveBeenCalled();
      expect((result.data as TestProduct).id).toBe(id);
    });

    it('should archive bundles when isBundle is set to false', async () => {
      const id = 'prod-4';
      const dto = {
        name: 'Unbundle Product',
        isBundle: false,
      } as UpdateProductDto;

      mockProductRepository.findByIdandTenantId.mockResolvedValue({
        id,
        isBundle: true,
      });
      mockProductRepository.updateProduct.mockResolvedValue({ id, ...dto });

      const result = await service.updateProduct(id, dto, mockRequest);

      expect(
        mockProductRepository.archiveProductBundlesByProductId,
      ).toHaveBeenCalled();
    });
  });

  describe('deleteProduct', () => {
    it('should delete bundle and archive its children', async () => {
      const id = 'prod-5';
      mockProductRepository.findByIdandTenantId.mockResolvedValue({
        id,
        isBundle: true,
      });

      const result = await service.deleteProduct(id, mockRequest);

      expect(
        mockProductRepository.archiveProductBundlesByProductId,
      ).toHaveBeenCalled();
      expect(mockProductRepository.archiveProduct).toHaveBeenCalled();
      expect(result.message).toBe('Product deleted successfully');
    });

    it('should delete non-bundle product', async () => {
      const id = 'prod-6';
      mockProductRepository.findByIdandTenantId.mockResolvedValue({
        id,
        isBundle: false,
      });

      const result = await service.deleteProduct(id, mockRequest);

      expect(
        mockProductRepository.archiveProductBundlesByProductId,
      ).not.toHaveBeenCalled();
      expect(result.message).toBe('Product deleted successfully');
    });
  });

  describe('getProductById', () => {
    it('should return product by ID', async () => {
      const id = 'prod-7';
      // product is a bundle and repository returns bundles via `bundlesAsParent` include
      mockProductRepository.findByIdandTenantId.mockResolvedValue({
        id,
        name: 'Product 7',
        isBundle: true,
        tenantId: mockUser.tenantId,
        bundlesAsParent: [{ id: 'bundle-7', items: [{ id: 'item-1' }] }],
      });

      const result = await service.getProductById(id, mockRequest);

      // Service returns the product as result.data and should include the include data
      expect((result.data as TestProduct).id).toBe(id);
      expect((result.data as TestProduct).bundlesAsParent).toBeDefined();
      expect((result.data as TestProduct).bundlesAsParent![0].id).toBe(
        'bundle-7',
      );
    });
  });

  describe('getList', () => {
    it('should return paginated products', async () => {
      mockProductRepository.countProducts.mockResolvedValue(1);
      // return a bundle product in the paginated list with include shape
      mockProductRepository.getPaginatedProducts.mockResolvedValue([
        {
          id: 'prod-8',
          name: 'Product 8',
          isBundle: true,
          tenantId: mockUser.tenantId,
          bundlesAsParent: [{ id: 'bundle-8', items: [{ id: 'item-8-1' }] }],
        },
      ]);

      const result = await service.getList(1, 10);

      expect((result.data as PaginatedProductData).total).toBe(1);
      expect((result.data as PaginatedProductData).data[0].name).toBe(
        'Product 8',
      );
      expect(
        (result.data as PaginatedProductData).data[0].bundlesAsParent,
      ).toBeDefined();
      expect(
        (result.data as PaginatedProductData).data[0].bundlesAsParent![0].id,
      ).toBe('bundle-8');
    });
  });

  describe('makeBundle', () => {
    it('should convert product to bundle', async () => {
      const id = 'prod-9';
      mockProductRepository.findByIdandTenantId.mockResolvedValue({
        id,
        isBundle: false,
      });
      mockProductRepository.updateProduct.mockResolvedValue({
        id,
        isBundle: true,
      });
      mockProductRepository.createProductBundle.mockResolvedValue({
        id: 'bundle-9',
      });

      const result = await service.makeBundle(
        id,
        { name: 'New Bundle', description: 'Bundle description' },
        mockRequest,
      );

      expect(result.message).toBe('Product converted to bundle successfully');
      expect((result.data as MakeBundleData).bundle.id).toBe('bundle-9');
    });
  });
});

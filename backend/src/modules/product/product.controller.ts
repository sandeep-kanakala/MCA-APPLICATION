import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Body,
  UseGuards,
  Request,
  Patch,
  Param,
  Query,
  Get,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import type { AuthenticatedRequest } from '~/interface';
import type { Response } from '@/utils/response.builder';
import { createProductBundleDto } from './dto/productBundle.dto';
import { LoadEntityInterceptor } from '@/audit/interceptor/load-entity.interceptor';
import {
  ApiMethodDescription,
  DeleteProductApiResponses,
  GetProductApiResponses,
  GetProductByIdApiResponses,
  PatchProductApiBody,
  PatchProductApiResponses,
  PostProductApiBody,
  PostProductApiResponses,
  PostProductBundleApiBody,
  ProductApiQueries,
  ProductBundleApiQueries,
} from '@/common/responses';
import { AuditEntity } from '@/audit/decorators/audit-log.decorator';
import { BundlesQueryDto, ProductsQueryDto } from '@/common';
import { toBoolean } from '@/utils';

@Controller('/products')
@ApiBearerAuth('access-token')
@UseInterceptors(LoadEntityInterceptor)
@ApiTags('Products')
@UseGuards(AuthGuard('jwt'))
@AuditEntity('Product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiMethodDescription('create new product')
  @PostProductApiResponses()
  @PostProductApiBody()
  async createProduct(
    @Body() dto: CreateProductDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.productService.createProduct(dto, request);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  @GetProductApiResponses()
  @ApiMethodDescription('Get All Products')
  @ProductApiQueries()
  async getList(@Query() query: ProductsQueryDto): Promise<Response> {
    return this.productService.getList(
      query.page,
      query.limit,
      query.sortByField,
      query.search,
      toBoolean(query.isArchived),
      query.type,
      query.fromDate,
      query.toDate,
      query.sortOrder,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('/get-bundles')
  @ApiMethodDescription('Get All Bundles for Products')
  @ProductBundleApiQueries()
  async getBundles(@Query() query: BundlesQueryDto): Promise<Response> {
    return this.productService.getBundles(query.page, query.limit);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/:productId')
  @ApiMethodDescription('Get product by ID')
  @GetProductByIdApiResponses()
  async getProductById(
    @Param('productId') productId: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.productService.getProductById(productId, request);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('/:productId')
  @ApiMethodDescription('Update Product by ID')
  @PatchProductApiResponses()
  @PatchProductApiBody()
  async updateProduct(
    @Param('productId') productId: string,
    @Body() dto: UpdateProductDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.productService.updateProduct(productId, dto, request);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/:productId')
  @ApiMethodDescription('Delete Product by ID')
  @DeleteProductApiResponses()
  async deleteProduct(
    @Param('productId') productId: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.productService.deleteProduct(productId, request);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('/:productId/make-bundle')
  @PatchProductApiResponses()
  @ApiMethodDescription('Create Bundle for the Product')
  @PostProductBundleApiBody()
  @AuditEntity('ProductBundle')
  async makeBundle(
    @Param('productId') productId: string,
    @Body() dto: createProductBundleDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.productService.makeBundle(productId, dto, request);
  }

  @HttpCode(HttpStatus.OK)
  @Get('bundle/:bundleId')
  @ApiMethodDescription('Get Bundle by ID')
  @GetProductApiResponses()
  async getBundleById(
    @Param('bundleId') bundleId: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.productService.getBundleById(bundleId, request);
  }
}

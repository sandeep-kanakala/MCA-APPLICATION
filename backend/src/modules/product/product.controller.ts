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
import { AccessToken } from '@/utils/helper';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuditEntity } from '@/audit/decorators/audit-log.decorator';
import { AuthGuard } from '@nestjs/passport';
import type { RequestWithUser } from '~/interface';
import type { Response } from '@/utils/response.builder';
import { createProductBundleDto } from './dto/productBundle.dto';
import { LoadEntityInterceptor } from '@/audit/interceptor/load-entity.interceptor';

@Controller('product')
@ApiBearerAuth('access-token')
@UseInterceptors(LoadEntityInterceptor)
@ApiTags('Products')
@AuditEntity('Product')
@UseGuards(AuthGuard('jwt'))
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/create')
  async createProduct(
    @Body() dto: CreateProductDto,
    @Request() request: RequestWithUser,
  ): Promise<Response> {
    return this.productService.createProduct(dto, request);
  }

  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @HttpCode(HttpStatus.OK)
  @Get('/list')
  public async getList(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<Response> {
    return this.productService.getList(page, limit);
  }

  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @HttpCode(HttpStatus.OK)
  @Get('/get-bundles')
  public async getBundles(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<Response> {
    return this.productService.getBundles(page, limit);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  async getProductById(
    @Param('id') id: string,
    @Request() request: RequestWithUser,
  ): Promise<Response> {
    return this.productService.getProductById(id, request);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('/update/:id')
  public async updateProduct(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Request() request: RequestWithUser,
  ): Promise<Response> {
    return this.productService.updateProduct(id, dto, request);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/delete/:id')
  public async deleteProduct(
    @Param('id') id: string,
    @Body() dto: CreateProductDto,
    @Request() request: RequestWithUser,
  ): Promise<Response> {
    return this.productService.deleteProduct(id, request);
  }

  @HttpCode(HttpStatus.OK)
  @Patch(':id/make-bundle')
  async makeBundle(
    @Param('id') id: string,
    @Body() dto: createProductBundleDto,
    @Request() request: RequestWithUser,
  ): Promise<Response> {
    return this.productService.makeBundle(id, dto, request);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOperation({ description: 'Get Bundle by Id including Bundle Items' })
  @Get('/bundle/:id')
  async getBundleById(
    @Param('id') id: string,
    @Request() request: RequestWithUser,
  ): Promise<Response> {
    return this.productService.getBundleById(id, request);
  }
}

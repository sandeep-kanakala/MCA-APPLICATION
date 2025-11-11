import { AuditEntity } from '@/audit/decorators/audit-log.decorator';
import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest } from '~/interface';
import { Body, Request, UseInterceptors } from '@nestjs/common/decorators';
import type { Response } from '@/utils/response.builder';
import { PricelistService } from './pricelist.service';
import {
  CreatePriceListDto,
  CreatePriceListEntryDto,
  UpdatePriceListDto,
  UpdatePriceListEntryDto,
} from './dto/pricelist.dto';
import { LoadEntityInterceptor } from '@/audit/interceptor/load-entity.interceptor';
import {
  ApiMethodDescription,
  CreatePriceListApiBody,
  CreatePriceListApiResponses,
  CreatePriceListEntryApiBody,
  CreatePriceListEntryApiResponses,
  DeletePriceListApiResponses,
  DeletePriceListEntryApiResponses,
  GetPriceListByIdApiResponses,
  GetPriceListEntryByIdApiResponses,
  GetPriceListsApiResponses,
  PriceListApiQueries,
  UpdatePriceListApiBody,
  UpdatePriceListApiResponses,
  UpdatePriceListEntryApiBody,
  UpdatePriceListEntryApiResponses,
} from '@/common/responses';
import { PriceListsQueryDto } from '@/common';
import { toBoolean } from '@/utils';

@Controller('/pricelist')
@ApiBearerAuth('access-token')
@ApiTags('Price List')
@AuditEntity('PriceList')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LoadEntityInterceptor)
export class PricelistController {
  constructor(private readonly pricelistservice: PricelistService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiMethodDescription('create new price-list')
  @CreatePriceListApiResponses()
  @CreatePriceListApiBody()
  public async createPriceList(
    @Body() dto: CreatePriceListDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.pricelistservice.createPriceList(dto, request);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiMethodDescription('Get list Price-lists based on tenant')
  @GetPriceListsApiResponses()
  @PriceListApiQueries()
  public async getList(@Query() query: PriceListsQueryDto): Promise<Response> {
    return this.pricelistservice.getList(
      query.page,
      query.limit,
      query.search,
      toBoolean(query.isArchived),
      query.fromDate,
      query.toDate,
      query.sortByField,
      query.sortOrder,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('/:priceListId')
  @ApiMethodDescription('Get price-list by ID')
  @GetPriceListByIdApiResponses()
  async getPriceListById(
    @Param('priceListId') priceListId: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.pricelistservice.getPriceListById(priceListId, request);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('/:priceListId')
  @ApiMethodDescription('update price-list by ID')
  @UpdatePriceListApiBody()
  @UpdatePriceListApiResponses()
  public async updatePriceList(
    @Param('priceListId') priceListId: string,
    @Body() dto: UpdatePriceListDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.pricelistservice.updatePriceList(priceListId, dto, request);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/:priceListId')
  @ApiMethodDescription('Delete price-list by ID')
  @DeletePriceListApiResponses()
  public async deletePriceList(
    @Param('priceListId') priceListId: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.pricelistservice.deletePriceList(priceListId, request);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('/:priceListId')
  @ApiMethodDescription('Create a entry into price-list')
  @CreatePriceListEntryApiBody()
  @CreatePriceListEntryApiResponses()
  @AuditEntity('price-list-entry')
  public async createPriceListEntry(
    @Param('priceListId') PriceListId: string,
    @Body() dto: CreatePriceListEntryDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.pricelistservice.createPriceListEntry(
      PriceListId,
      dto,
      request,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('/entry/:priceListEntryId')
  @ApiMethodDescription('Get price-list-entry by ID')
  @GetPriceListEntryByIdApiResponses()
  public async getPriceListEntryById(
    @Param('priceListEntryId') priceListEntryId: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.pricelistservice.getPriceListEntryById(
      priceListEntryId,
      request,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Patch('/entry/:priceListEntryId')
  @ApiMethodDescription('update price-list-entry by ID')
  @UpdatePriceListEntryApiBody()
  @UpdatePriceListEntryApiResponses()
  @AuditEntity('price-list-entry')
  public async updatePriceListEntry(
    @Param('priceListEntryId') priceListEntryId: string,
    @Body() dto: UpdatePriceListEntryDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.pricelistservice.updatePriceListEntry(
      priceListEntryId,
      dto,
      request,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/entry/:priceListEntryId')
  @ApiMethodDescription('Delete price-list-entry by ID')
  @DeletePriceListEntryApiResponses()
  @AuditEntity('price-list-entry')
  public async deletePriceListEntry(
    @Param('priceListEntryId') priceListEntryId: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.pricelistservice.deletePriceListEntry(
      priceListEntryId,
      request,
    );
  }
}

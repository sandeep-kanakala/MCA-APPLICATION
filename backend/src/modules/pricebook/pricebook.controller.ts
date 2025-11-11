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
import { PricebookService } from './pricebook.service';
import type { AuthenticatedRequest } from '~/interface';
import {
  CreatePriceBookDto,
  CreatePriceBookEntryDto,
  UpdatePriceBookDto,
  UpdatePriceBookEntryDto,
} from './dto/pricebook.dto';
import { Body, Request, UseInterceptors } from '@nestjs/common/decorators';
import type { Response } from '@/utils/response.builder';
import { LoadEntityInterceptor } from '@/audit/interceptor/load-entity.interceptor';
import {
  ApiMethodDescription,
  CreatePriceBookApiBody,
  CreatePriceBookApiResponses,
  CreatePriceBookEntryApiBody,
  CreatePriceBookEntryApiResponses,
  DeletePriceBookApiResponses,
  DeletePriceBookEntryApiResponses,
  GetPriceBookByIdApiResponses,
  GetPriceBookEntryByIdApiResponses,
  GetPriceBooksApiResponses,
  PriceBookApiQueries,
  UpdatePriceBookApiBody,
  UpdatePriceBookApiResponses,
  UpdatePriceBookEntryApiBody,
  UpdatePriceBookEntryApiResponses,
} from '@/common/responses';
import { PriceBooksQueryDto } from '@/common';
import { toBoolean } from '@/utils';

@Controller('/pricebook')
@ApiBearerAuth('access-token')
@ApiTags('Price Book')
@AuditEntity('PriceBook')
@UseGuards(AuthGuard('jwt'))
@UseInterceptors(LoadEntityInterceptor)
export class PricebookController {
  constructor(private readonly pricebookservice: PricebookService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiMethodDescription('Create new Pricebook')
  @CreatePriceBookApiBody()
  @CreatePriceBookApiResponses()
  public async createPriceBook(
    @Body() dto: CreatePriceBookDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.pricebookservice.createPriceBook(dto, request);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiMethodDescription('fetches all pricebooks')
  @GetPriceBooksApiResponses()
  @PriceBookApiQueries()
  public async getList(@Query() query: PriceBooksQueryDto): Promise<Response> {
    return this.pricebookservice.getList(
      query.page,
      query.limit,
      query.search,
      toBoolean(query.isArchived),
      query.type,
      query.fromDate,
      query.toDate,
      query.sortByField,
      query.sortOrder,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('/:priceBookId')
  @ApiMethodDescription('Get product by ID')
  @GetPriceBookByIdApiResponses()
  async getPriceBookById(
    @Param('priceBookId') priceBookId: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.pricebookservice.getPriceBookById(priceBookId, request);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('/:priceBookId')
  @ApiMethodDescription('Update PriceBook by ID')
  @UpdatePriceBookApiBody()
  @UpdatePriceBookApiResponses()
  public async updatePriceBook(
    @Param('priceBookId') priceBookId: string,
    @Body() dto: UpdatePriceBookDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.pricebookservice.updatePriceBook(priceBookId, dto, request);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/:priceBookId')
  @ApiMethodDescription('Delete PriceBook by ID')
  @DeletePriceBookApiResponses()
  public async deletePriceBook(
    @Param('priceBookId') priceBookId: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.pricebookservice.deletePriceBook(priceBookId, request);
  }
  //implememt pricebook entry create,update,delete here

  @HttpCode(HttpStatus.CREATED)
  @Post('/:priceBookId')
  @ApiMethodDescription('create a new price-book entry')
  @CreatePriceBookEntryApiResponses()
  @CreatePriceBookEntryApiBody()
  @AuditEntity('PriceBookEntry')
  public async createPriceBookEntry(
    @Param('priceBookId') priceBookId: string,
    @Body() dto: CreatePriceBookEntryDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.pricebookservice.createPriceBookEntry(
      priceBookId,
      dto,
      request,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Patch('/entry/:priceBookEntryId')
  @ApiMethodDescription('Update PriceBook Entry by ID')
  @UpdatePriceBookEntryApiResponses()
  @UpdatePriceBookEntryApiBody()
  @AuditEntity('PriceBookEntry')
  public async updatePriceBookEntry(
    @Param('priceBookEntryId') priceBookEntryId: string,
    @Body() dto: UpdatePriceBookEntryDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.pricebookservice.updatePriceBookEntry(
      priceBookEntryId,
      dto,
      request,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('/entry/:priceBookEntryId')
  @ApiMethodDescription('Get priceBookEntry by ID')
  @GetPriceBookEntryByIdApiResponses()
  async getPriceBookEntryById(
    @Param('priceBookEntryId') priceBookEntryId: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.pricebookservice.getPriceBookEntryById(
      priceBookEntryId,
      request,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/entry/:priceBookEntryId')
  @ApiMethodDescription('Delete PriceBookEntry by ID')
  @DeletePriceBookEntryApiResponses()
  @AuditEntity('PriceBookEntry')
  public async deletePriceBookEntry(
    @Param('priceBookEntryId') priceBookEntryId: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.pricebookservice.deletePriceBookEntry(
      priceBookEntryId,
      request,
    );
  }
}

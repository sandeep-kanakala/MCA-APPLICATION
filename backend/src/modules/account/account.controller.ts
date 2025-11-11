import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Patch,
  Request,
  UseGuards,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccountService } from './account.service';
import {
  CreateAccountDetailsDto,
  CreateAccountDto,
  UpdateAccountDto,
} from './dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from '@/utils/response.builder';
import type { AuthenticatedRequest } from '~/interface';
import { LoadEntityInterceptor } from '@/audit/interceptor/load-entity.interceptor';
import {
  AccountApiQueries,
  ApiMethodDescription,
  CreateAccountApiBody,
  CreateAccountApiResponses,
  CreateAccountDetailsApiBody,
  DeleteAccountApiResponses,
  GetAccountByIdApiResponses,
  GetAccountsApiResponses,
  UpdateAccountApiBody,
  UpdateAccountApiResponses,
} from '@/common/responses';
import { AuditEntity } from '@/audit/decorators/audit-log.decorator';
import { AccountsQueryDto } from '@/common';
import { toBoolean } from '@/utils';

@Controller('/accounts')
@UseInterceptors(LoadEntityInterceptor)
@ApiBearerAuth('access-token')
@ApiTags('Accounts')
@UseGuards(AuthGuard('jwt'))
@AuditEntity('Account')
export class AccountController {
  constructor(private readonly accounts: AccountService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/details')
  @ApiMethodDescription('Create new Account with contact and address')
  @CreateAccountApiResponses()
  @CreateAccountDetailsApiBody()
  async createAccount(
    @Body() body: CreateAccountDetailsDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.accounts.createAccountDetails(body, request);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @ApiMethodDescription('Create new Account')
  @CreateAccountApiResponses()
  @CreateAccountApiBody()
  async create(
    @Body() dto: CreateAccountDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.accounts.createAccount(dto, request);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiMethodDescription('Get All Accounts', 'Fetches all account by tenantID')
  @GetAccountsApiResponses()
  @AccountApiQueries()
  async getList(@Query() query: AccountsQueryDto): Promise<Response> {
    return this.accounts.getAll(
      query.page,
      query.limit,
      toBoolean(query.isArchived),
      query.sortByField,
      query.search,
      query.type,
      query.fromDate,
      query.toDate,
      query.sortOrder,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('/:accountId')
  @ApiMethodDescription('Get Account by ID')
  @GetAccountByIdApiResponses()
  async getAccount(@Param('accountId') accountId: string): Promise<Response> {
    return this.accounts.getAccountById(accountId);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('/:accountId')
  @ApiMethodDescription('Update Account by ID')
  @UpdateAccountApiResponses()
  @UpdateAccountApiBody()
  async update(
    @Param('accountId') accountId: string,
    @Body() dto: UpdateAccountDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.accounts.updateAccount(accountId, dto, request);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/:accountId')
  @ApiMethodDescription('Delete Account by ID')
  @DeleteAccountApiResponses()
  async delete(
    @Param('accountId') accountId: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.accounts.deleteAccount(accountId, request);
  }
}

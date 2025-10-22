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
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import {
  ApiBearerAuth,
  ApiQuery,
  ApiTags,
  ApiOperation,
  ApiBody,
} from '@nestjs/swagger';
import type { Response } from '@/utils/response.builder';
import type { AuditRequest } from '~/interface';
import { AuditEntity } from '@/audit/decorators/audit-log.decorator';
import { ApiCommonResponses } from '@/common';
import { LoadEntityInterceptor } from '@/audit/interceptor/load-entity.interceptor';

@Controller('/accounts')
@UseInterceptors(LoadEntityInterceptor)
@ApiBearerAuth('access-token')
@ApiTags('Accounts')
@AuditEntity('Account')
@UseGuards(AuthGuard('jwt'))
@ApiCommonResponses()
export class AccountController {
  constructor(private readonly accounts: AccountService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/create')
  @ApiOperation({
    summary: 'Create Account',
    description: 'Create a new account',
  })
  @ApiBody({ type: CreateAccountDto })
  public async create(
    @Body() dto: CreateAccountDto,
    @Request() request: AuditRequest,
  ): Promise<Response> {
    return this.accounts.createAccount(dto, request);
  }

  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @Get('/list')
  @ApiOperation({
    summary: 'Get All Accounts',
    description: 'Retrieve a list of all accounts',
  })
  public async getList(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<Response> {
    return this.accounts.getAll(page, limit);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  @ApiOperation({
    summary: 'Get Account by ID',
    description: 'Retrieve account details by ID',
  })
  public async getAccount(@Param('id') id: string): Promise<Response> {
    return this.accounts.getAccountById(id);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('/update/:id')
  @ApiOperation({
    summary: 'Update Account',
    description: 'Update account details by ID',
  })
  @ApiBody({ type: UpdateAccountDto })
  public async update(
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
    @Request() request: AuditRequest,
  ): Promise<Response> {
    return this.accounts.updateAccount(id, dto, request);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/delete/:id')
  @ApiOperation({
    summary: 'Delete Account',
    description: 'Delete account by ID',
  })
  public async delete(
    @Param('id') id: string,
    @Request() request: AuditRequest,
  ): Promise<Response> {
    return this.accounts.deleteAccount(id, request);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/contact/:id')
  async getAccountDetailsByContactId(
    @Param('id') id: string,
  ): Promise<Response> {
    return this.accounts.getAccountByContactId(id);
  }
}

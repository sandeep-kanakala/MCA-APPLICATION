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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccountService } from './account.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import {
  ApiBearerAuth,
  ApiQuery,
  ApiTags,
  ApiResponse,
  ApiOperation,
  ApiBody,
} from '@nestjs/swagger';
import type { Response } from '@/utils/response.builder';
import type { RequestWithUser } from '~/interface';
import { AuditEntity } from '@/audit/decorators/audit-log.decorator';

@Controller('accounts')
@ApiBearerAuth('access-token')
@ApiTags('Accounts')
@AuditEntity('Account')
@UseGuards(AuthGuard('jwt'))
@ApiResponse({
  status: 400,
  description: 'The request is malformed or invalid.',
})
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiResponse({
  status: 403,
  description:
    'The user does not have the necessary privileges to perform the operation.',
})
@ApiResponse({ status: 500, description: 'An internal server error occurred.' })
@ApiResponse({ status: 503, description: 'A service is unreachable.' })
@ApiResponse({ status: 504, description: 'Gateway Timeout Error.' })
@ApiResponse({ status: 200, description: 'OK' })
@ApiResponse({ status: 202, description: 'Accepted' })
export class AccountController {
  constructor(private readonly accounts: AccountService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/create')
  @ApiOperation({
    summary: 'Create Account',
    description: 'Create a new account',
  })
  @ApiResponse({ status: 201, description: 'Account created successfully.' })
  @ApiBody({ type: CreateAccountDto })
  public async create(
    @Body() dto: CreateAccountDto,
    @Request() request: RequestWithUser,
  ): Promise<Response> {
    return this.accounts.createAccount(dto, request.user);
  }

  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @HttpCode(HttpStatus.OK)
  @Get('/list')
  @ApiOperation({
    summary: 'Get All Accounts',
    description: 'Retrieve a list of all accounts',
  })
  @ApiResponse({ status: 200, description: 'Accounts retrieved successfully.' })
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
  @ApiResponse({ status: 200, description: 'Account retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Account not found.' })
  public async getAccount(@Param('id') id: string): Promise<Response> {
    return this.accounts.getAccountById(id);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('/update/:id')
  @ApiOperation({
    summary: 'Update Account',
    description: 'Update account details by ID',
  })
  @ApiResponse({ status: 200, description: 'Account updated successfully.' })
  @ApiResponse({ status: 404, description: 'Account not found.' })
  @ApiBody({ type: UpdateAccountDto })
  public async update(
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
    @Request() request: RequestWithUser,
  ): Promise<Response> {
    return this.accounts.updateAccount(id, dto, request.user);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/delete/:id')
  @ApiOperation({
    summary: 'Delete Account',
    description: 'Delete account by ID',
  })
  @ApiResponse({ status: 200, description: 'Account deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Account not found.' })
  public async delete(
    @Param('id') id: string,
    @Request() request: RequestWithUser,
  ): Promise<Response> {
    return this.accounts.deleteAccount(id, request.user);
  }
}

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
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Response } from '@/utils/response.builder';
import type { RequestWithUser } from '~/interface';
import { AuditEntity } from '@/audit/decorators/audit-log.decorator';
@Controller('accounts')
@ApiBearerAuth('access-token')
@ApiTags('Accounts')
@AuditEntity('Account')
@UseGuards(AuthGuard('jwt'))
export class AccountController {
  constructor(private readonly accounts: AccountService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/create')
  public async create(
    @Body() dto: CreateAccountDto,
    @Request() request: RequestWithUser,
  ): Promise<Response> {
    return this.accounts.createAccount(dto, request.user, request);
  }

  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @HttpCode(HttpStatus.OK)
  @Get('/list')
  public async getList(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<Response> {
    return this.accounts.getAll(page, limit);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  public async getAccount(@Param('id') id: string): Promise<Response> {
    return this.accounts.getAccountById(id);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('/update/:id')
  public async update(
    @Param('id') id: string,
    @Body() dto: UpdateAccountDto,
    @Request() request: RequestWithUser,
  ): Promise<Response> {
    return this.accounts.updateAccount(id, dto, request.user, request);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/delete/:id')
  public async delete(
    @Param('id') id: string,
    @Request() request: RequestWithUser,
  ): Promise<Response> {
    return this.accounts.deleteAccount(id, request.user, request);
  }
}

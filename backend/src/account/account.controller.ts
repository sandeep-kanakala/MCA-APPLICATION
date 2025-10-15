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
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AccountService } from './account.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Response } from '@/utils/response.builder';
import { AccessToken } from '@/utils/AuthTokenUtils';

@Controller('accounts')
@ApiBearerAuth('access-token')
@ApiTags('Accounts')
@UseGuards(AuthGuard('jwt'))
export class AccountController {
  constructor(private readonly accounts: AccountService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/create')
  public async create(
    @Body() dto: CreateAccountDto,
    @AccessToken() token: string,
  ): Promise<Response> {
    return this.accounts.createAccount(dto, token);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/list')
  public async getList(): Promise<Response> {
    return this.accounts.getAll();
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
    @AccessToken() token: string,
  ): Promise<Response> {
    return this.accounts.updateAccount(id, dto, token);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/delete/:id')
  public async delete(
    @Param('id') id: string,
    @AccessToken() token: string,
  ): Promise<Response> {
    return this.accounts.deleteAccount(id, token);
  }
}

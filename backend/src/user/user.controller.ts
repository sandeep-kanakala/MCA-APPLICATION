import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRegisterRequest } from './dto/user.dto';
import type { Response } from '@/utils/response.builder';
import { UserService } from './user.service';
import { UserUpdateRequest } from './dto/user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AccessToken } from '@/utils/AuthTokenUtils';

@Controller('user')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('register')
  public async register(
    @Body() userRegisterRequest: UserRegisterRequest,
    @AccessToken() token: string,
  ): Promise<Response> {
    return this.userService.create(userRegisterRequest, token);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  public async getList(): Promise<Response> {
    return this.userService.getAll();
  }

  @HttpCode(HttpStatus.OK)
  @Get('id')
  public async getUser(@Query('id') id: string): Promise<Response> {
    return this.userService.getUserById(id);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('update')
  public async update(
    @Query('id') id: string,
    @Body() userUpdateRequest: UserUpdateRequest,
    @AccessToken() token: string,
  ): Promise<Response> {
    return this.userService.update(id, userUpdateRequest, token);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('delete')
  public async delete(
    @Query('id') id: string,
    @AccessToken() token: string,
  ): Promise<Response> {
    return this.userService.delete(id, token);
  }
}

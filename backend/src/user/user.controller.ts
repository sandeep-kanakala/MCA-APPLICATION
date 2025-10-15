import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Param,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { UserRegisterRequestDto, UserUpdateRequestDto } from './dto/user.dto';
import type { Response } from '@/utils/response.builder';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AccessToken } from '@/utils/AuthTokenUtils';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { AuditEntity } from '@/audit/decorators/audit-log.decorator';
import type { AuditRequest } from '@/common/types/express';

@Controller('user')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@AuditEntity('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Post('/create')
  @ApiOperation({
    summary: 'User Registration',
    description: 'Register a new user',
  })
  @ApiBody({
    type: UserRegisterRequestDto,
    examples: {
      example: {
        summary: 'User-I',
        value: {
          firstName: 'John',
          middleName: 'A',
          lastName: 'Doe',
          phoneNo: '1234567890',
          email: 'john@gmail.com',
          password: 'john@1234',
          role: 'USER',
        },
      },
    },
  })
  public async register(
    @Body() userRegisterRequest: UserRegisterRequestDto,
    @AccessToken() token: string,
    @Request() req: AuditRequest,
  ): Promise<Response> {
    return this.userService.create(userRegisterRequest, token, req);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/list')
  @ApiOperation({
    summary: 'Get All Users',
    description: 'Retrieve a list of all users',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async getList(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ): Promise<Response> {
    return this.userService.getAll(page, limit);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get('/:userId')
  @ApiOperation({
    summary: 'Get User by ID',
    description: 'Retrieve user details by user ID',
  })
  public async getUser(@Param('userId') userId: string): Promise<Response> {
    return this.userService.getUserById(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('/update/:id')
  @ApiOperation({
    summary: 'Update User',
    description: 'Update user details by user ID',
  })
  @ApiBody({
    type: UserUpdateRequestDto,
    examples: {
      example: {
        summary: 'User-I',
        value: {
          firstName: 'John',
          middleName: 'Addam',
          lastName: 'Doe',
          phoneNo: '1234567890',
        },
      },
    },
  })
  public async update(
    @Param('id') id: string,
    @Body() userUpdateRequest: UserUpdateRequestDto,
    @AccessToken() token: string,
    @Request() req: AuditRequest,
  ): Promise<Response> {
    return this.userService.update(id, userUpdateRequest, token, req);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/delete/:id')
  @ApiOperation({
    summary: 'Delete User',
    description: 'Delete user by user ID',
  })
  public async delete(
    @Param('id') id: string,
    @AccessToken() token: string,
    @Request() req: AuditRequest,
  ): Promise<Response> {
    return this.userService.delete(id, token, req);
  }
}

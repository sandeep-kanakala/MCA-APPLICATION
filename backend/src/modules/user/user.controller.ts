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
  ForbiddenException,
} from '@nestjs/common';
import { UserRegisterRequestDto, UserUpdateRequestDto } from './dto';
import { ResponseBuilder, type Response } from '@/utils/response.builder';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiQuery,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { Role } from '@prisma/client';
import { AuditEntity } from '@/audit/decorators/audit-log.decorator';
import type { AuthenticatedRequest, RequestWithUser } from '~/interface';
import {
  AppAbility,
  PermissionsGuard,
} from '@/modules/permissions/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('User')
@Controller('user')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
@AuditEntity('User')
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
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @Get('/role')
  @ApiOperation({ summary: 'Get User Role', description: 'Retrieve user role' })
  @ApiResponse({
    status: 200,
    description: 'User role retrieved successfully.',
  })
  getRole(@Request() req: AuthenticatedRequest): Response {
    return new ResponseBuilder().withData(req.user).build();
  }

  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  @Post('/create')
  @ApiOperation({
    summary: 'User Registration',
    description: 'Register a new user',
  })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiBody({ type: UserRegisterRequestDto })
  async register(
    @Body() userRegisterRequest: UserRegisterRequestDto,
    @Request() request: RequestWithUser,
  ): Promise<Response> {
    return this.userService.create(userRegisterRequest, request);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/list')
  @ApiOperation({
    summary: 'Get All Users',
    description: 'Retrieve a list of all users',
  })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully.' })
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
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  @Get('/:userId')
  @ApiOperation({
    summary: 'Get User by ID',
    description: 'Retrieve user details by user ID',
  })
  @ApiResponse({ status: 200, description: 'User retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getUser(@Param('userId') userId: string): Promise<Response> {
    return this.userService.getUserById(userId);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @Patch('/update/:id')
  @ApiOperation({
    summary: 'Update User',
    description: 'Update user details by user ID',
  })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  @ApiBody({ type: UserUpdateRequestDto })
  async update(
    @Param('id') id: string,
    @Body() userUpdateRequest: UserUpdateRequestDto,
    @Request() request: RequestWithUser & { ability: AppAbility },
  ): Promise<Response> {
    const ability = request?.ability;

    if (ability.cannot('update', 'User')) {
      throw new ForbiddenException(
        'You do not have permission to update users',
      );
    }
    return this.userService.update(id, userUpdateRequest, request);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/delete/:id')
  @ApiOperation({
    summary: 'Delete User',
    description: 'Delete user by user ID',
  })
  @ApiResponse({ status: 200, description: 'User deleted successfully.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async delete(
    @Param('id') id: string,
    @Request() request: RequestWithUser,
  ): Promise<Response> {
    return this.userService.delete(id, request);
  }
}

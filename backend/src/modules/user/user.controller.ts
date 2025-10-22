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
  UseInterceptors,
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
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuditEntity } from '@/audit/decorators/audit-log.decorator';
import type { AuthenticatedRequest, RequestWithUser } from '~/interface';
import { Permissions } from '@/modules/permissions/permissions.decorator';
import { PermissionsGuard } from '@/modules/permissions/permissions.guard';
import { LoadEntityInterceptor } from '@/audit/interceptor/load-entity.interceptor';
import { ApiCommonResponses } from '@/common/api.responses';

@ApiTags('User')
@UseInterceptors(LoadEntityInterceptor)
@Controller('/users')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@AuditEntity('User')
@ApiCommonResponses()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @Get('/role')
  @ApiOperation({
    summary: 'Get User ',
    description: 'Retrieve logged in user ',
  })
  getRole(@Request() req: AuthenticatedRequest): Response {
    if (!req.user) {
      return new ResponseBuilder()
        .withMessage('User not authenticated')
        .build();
    }
    return new ResponseBuilder()
      .withMessage('Success')
      .withData(req.user)
      .build();
  }
  @HttpCode(HttpStatus.CREATED)
  @Post('/create')
  @Permissions('can_create_user')
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
          middleName: 'AAA',
          lastName: 'Doe',
          phoneNo: '1234567890',
          email: 'john@gmail.com',
          password: 'John@1234',
          role: 'USER',
        },
      },
    },
  })
  async register(
    @Body() userRegisterRequest: UserRegisterRequestDto,
    @Request() request: RequestWithUser,
  ): Promise<Response> {
    return this.userService.create(userRegisterRequest, request);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/list')
  @Permissions('can_read_user')
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
  @Get('/:userId')
  @Permissions('can_read_user')
  @ApiOperation({
    summary: 'Get User by ID',
    description: 'Retrieve user details by user ID',
  })
  async getUser(@Param('userId') userId: string): Promise<Response> {
    return this.userService.getUserById(userId);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(PermissionsGuard)
  @Patch('/update/:id')
  @Permissions('can_update_user')
  @ApiOperation({
    summary: 'Update User',
    description: 'Update user details by user ID',
  })
  @ApiBody({ type: UserUpdateRequestDto })
  async update(
    @Param('id') id: string,
    @Body() userUpdateRequest: UserUpdateRequestDto,
    @Request() request: RequestWithUser,
  ): Promise<Response> {
    return this.userService.update(id, userUpdateRequest, request);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/delete/:id')
  @Permissions('can_delete_user')
  @ApiOperation({
    summary: 'Delete User',
    description: 'Delete user by user ID',
  })
  async delete(
    @Param('id') id: string,
    @Request() request: RequestWithUser,
  ): Promise<Response> {
    return this.userService.delete(id, request);
  }
}

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
import { UserService } from './user.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuditEntity } from '@/audit/decorators/audit-log.decorator';
import type { AuthenticatedRequest } from '~/interface';
import { Permissions } from '@/modules/permissions/permissions.decorator';
import { PermissionsGuard } from '@/modules/permissions/permissions.guard';
import { LoadEntityInterceptor } from '@/audit/interceptor/load-entity.interceptor';
import {
  DeleteUserApiResponses,
  GetUserApiResponses,
  GetUserByIdApiResponses,
  PatchUserApiBody,
  PatchUserApiResponses,
  PostUserApiBody,
  PostUserApiResponses,
  UserApiQueries,
} from '@/common/responses';
import { ApiMethodDescription } from '@/common/responses';
import { Response, toBoolean } from '@/utils';
import { UsersQueryDto } from '@/common';

@ApiTags('User')
@UseInterceptors(LoadEntityInterceptor)
@Controller('/users')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
@AuditEntity('User')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @Get('/profile')
  @GetUserByIdApiResponses()
  @ApiMethodDescription('Get user profile ', 'Fetches profile of user ')
  async getUserProfile(
    @Request() req: AuthenticatedRequest,
  ): Promise<Response> {
    return await this.userService.getUserById(req.user.id);
  }
  @HttpCode(HttpStatus.CREATED)
  @Post()
  @PostUserApiResponses()
  @ApiMethodDescription('Onboard new user')
  @PostUserApiBody()
  @Permissions('can_create_user')
  async register(
    @Body() userRegisterRequest: UserRegisterRequestDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.userService.create(userRegisterRequest, request);
  }

  @HttpCode(HttpStatus.OK)
  @Get()
  @ApiMethodDescription('Get All Users', 'Fetches Users using selected filters')
  @GetUserApiResponses()
  @UserApiQueries()
  @Permissions('can_read_user')
  async getList(@Query() query: UsersQueryDto): Promise<Response> {
    return this.userService.getAll(
      query.page,
      query.limit,
      query.search,
      query.fromDate,
      query.toDate,
      query.role,
      query.sortByField,
      query.sortOrder,
      toBoolean(query.isArchived),
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('/:userId')
  @ApiMethodDescription('Get User by ID')
  @GetUserByIdApiResponses()
  @Permissions('can_read_user')
  async getUser(@Param('userId') userId: string): Promise<Response> {
    return this.userService.getUserById(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('/:userId')
  @ApiMethodDescription('Update User by ID')
  @PatchUserApiResponses()
  @PatchUserApiBody()
  @Permissions('can_update_user')
  async update(
    @Param('userId') userId: string,
    @Body() userUpdateRequest: UserUpdateRequestDto,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.userService.update(userId, userUpdateRequest, request);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/:userId')
  @ApiMethodDescription('Delete user by ID')
  @DeleteUserApiResponses()
  @Permissions('can_delete_user')
  async delete(
    @Param('userId') userId: string,
    @Request() request: AuthenticatedRequest,
  ): Promise<Response> {
    return this.userService.delete(userId, request);
  }
}

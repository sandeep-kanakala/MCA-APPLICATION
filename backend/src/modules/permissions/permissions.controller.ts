import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ResponseBuilder, type Response } from '@/utils/response.builder';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Subject } from '@prisma/client';

@ApiTags('Permissions')
@Controller('permissions')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
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
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch('/assign/:roleName')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Assign Permissions to Role',
    description: 'Assign one or more permissions to a given role',
  })
  @ApiResponse({
    status: 200,
    description: 'Permissions updated successfully.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        permissions: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'can_create_user',
            'can_read_user',
            'can_update_user',
            'can_delete_user',
          ],
        },
      },
    },
  })
  async assignPermissionsToRole(
    @Param('roleName') roleName: string,
    @Body()
    body: {
      permissions: string[];
    },
  ): Promise<Response> {
    const tenantId = process.env.TENANT_ID!;
    const result = await this.permissionsService.assignPermissionsToRole(
      tenantId,
      roleName,
      body.permissions,
    );

    return new ResponseBuilder()
      .withMessage('Permissions assigned successfully')
      .withData(result)
      .build();
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get('/role/:roleName')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get Permissions by Role',
    description: 'Retrieve all permissions assigned to a specific role',
  })
  async getPermissionsByRole(
    @Param('roleName') roleName: string,
  ): Promise<Response> {
    const result = await this.permissionsService.getPermissionsByRole(roleName);
    return new ResponseBuilder()
      .withMessage('Permissions retrieved successfully')
      .withData(result)
      .build();
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post('/create-role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create Roles',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: { type: 'string', example: 'ADMIN' },
      },
    },
    examples: {
      example1: {
        summary: 'Create Roles',
        description: 'Create default roles for the tenant',
        value: { role: 'ADMIN' },
      },
    },
  })
  async createRole(@Body() body: { role: string }): Promise<Response> {
    const result = await this.permissionsService.createRoles(body?.role);
    return new ResponseBuilder()
      .withMessage('role created successfully')
      .withData(result)
      .build();
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post('/create-permissions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Create Permissions',
    description: 'Create permissions for a tenant',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        permissions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'can_create_user' },
              subject: { type: 'string', example: 'User' },
            },
          },
          example: [{ name: 'can_read_user', subject: 'User' }],
        },
      },
    },
  })
  async createPermissions(
    @Body() body: { permissions: { name: string; subject: Subject }[] },
  ): Promise<Response> {
    const result = await this.permissionsService.createPermissions(
      body?.permissions,
    );
    return new ResponseBuilder()
      .withMessage('Permissions created successfully')
      .withData(result)
      .build();
  }
}

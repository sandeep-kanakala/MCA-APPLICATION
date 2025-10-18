import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiTags,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import type { Response } from '@/utils/response.builder';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';

@ApiTags('Permissions')
@Controller('permissions')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
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

  @Get(':role/permissions')
  @ApiOperation({
    summary: 'Get Permissions by Role',
    description: 'Retrieve permissions for a specific role',
  })
  @ApiResponse({
    status: 200,
    description: 'Permissions retrieved successfully.',
  })
  public async getPermissions(@Param('role') role: Role): Promise<Response> {
    return this.permissionsService.getPermissions(role);
  }

  @Patch(':role/permissions')
  @ApiOperation({
    summary: 'Update Permissions for a Role',
    description: 'Update permissions associated with a specific role',
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
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              active: { type: 'boolean' },
            },
          },
        },
      },
      required: ['permissions'],
    },
  })
  async updatePermissions(
    @Param('role') role: string,
    @Body() data: { permissions: { id: string; active: boolean }[] },
  ): Promise<Response> {
    return this.permissionsService.updatePermissions(role, data);
  }
}

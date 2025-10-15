import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Role } from '@prisma/client';
import type { Response } from '@/utils/response.builder';
import { Roles } from '@/auth/decorators/roles.decorator';

@Controller('permissions')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get(':role/permissions')
  public async getPermissions(@Param('role') role: Role): Promise<Response> {
    return this.permissionsService.getPermissions(role);
  }

  @Patch(':role/permissions')
  @ApiOperation({
    summary: 'Update Permissions for a Role',
    description: 'Update permissions associated with a specific role',
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
              id: { type: 'string', example: 'permission-id-123' },
              active: { type: 'boolean', example: true },
            },
          },
          example: [
            { id: 'permission-id-123', active: true },
            { id: 'permission-id-456', active: false },
          ],
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

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
  UseInterceptors,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ResponseBuilder, type Response } from '@/utils';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Subject } from '@prisma/client';
import { ADMIN, SUPER_ADMIN } from '@/config/constants';
import { LoadEntityInterceptor } from '@/audit/interceptor/load-entity.interceptor';
import {
  ApiMethodDescription,
  AssignPermissionsToRoleApiBody,
  AssignPermissionsToRoleApiResponses,
  CreatePermissionsApiBody,
  CreateRoleApiBody,
} from '@/common/responses';
import { AuditEntity } from '@/audit/decorators/audit-log.decorator';

@ApiTags('Permissions')
@Controller('/permissions')
@UseInterceptors(LoadEntityInterceptor)
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(SUPER_ADMIN, ADMIN)
@AuditEntity('Permission')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @HttpCode(HttpStatus.OK)
  @Patch('/assign/:roleName')
  @ApiMethodDescription('Assign Permissions to Role')
  @AssignPermissionsToRoleApiBody()
  @AssignPermissionsToRoleApiResponses()
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

  @HttpCode(HttpStatus.OK)
  @Get('/:roleName')
  @ApiMethodDescription(
    'Get Permissions by Role',
    'Retrieve all permissions assigned to a specific role',
  )
  async getPermissionsByRole(
    @Param('roleName') roleName: string,
  ): Promise<Response> {
    const result = await this.permissionsService.getPermissionsByRole(roleName);
    return new ResponseBuilder()
      .withMessage('Permissions retrieved successfully')
      .withData(result)
      .build();
  }

  @HttpCode(HttpStatus.OK)
  @Post('/create-role')
  @ApiMethodDescription('Create Roles')
  @CreateRoleApiBody()
  async createRole(@Body() body: { role: string }): Promise<Response> {
    const result = await this.permissionsService.createRoles(body?.role);
    return new ResponseBuilder()
      .withMessage('role created successfully')
      .withData(result)
      .build();
  }

  @HttpCode(HttpStatus.OK)
  @Post('/create-permissions')
  @ApiMethodDescription('Create Permissions', 'Create permissions for a tenant')
  @CreatePermissionsApiBody()
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

import { Controller, Get, Param, Query, UseGuards, Req } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import {
  ApiBearerAuth,
  ApiQuery,
  ApiTags,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/modules/auth/guards/roles.guard';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import type { AuthenticatedRequest } from '~/interface';
import type { Response } from '@/utils/response.builder';

@ApiTags('Audit Log')
@Controller('audit-logs')
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
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({
    summary: 'Get all audit logs',
    description: 'Retrieve a list of all audit logs',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async getAllLogs(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<any> {
    return this.auditLogService.getAllLogs(page, limit);
  }

  @Get('/:entity')
  @ApiOperation({
    summary: 'Get all audit/activity logs as per entity and entityId',
    description:
      'Retrieve a list of all audit/activity logs as per entity and entityId for Logged in User',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit/Activity logs retrieved successfully for the entity.',
  })
  @ApiQuery({ name: 'entityId', required: false, type: String })
  @ApiQuery({
    name: 'all',
    required: false,
    type: String,
    description: 'Admin: set true to see all logs of others',
    example: 'false',
  })
  async getEntityLogs(
    @Param('entity') entity: string,
    @Req() req: AuthenticatedRequest,
    @Query('entityId') entityId?: string,
    @Query('all') all?: string,
  ): Promise<Response> {
    return this.auditLogService.getLogsByEntity(entity, req, entityId, all);
  }
}

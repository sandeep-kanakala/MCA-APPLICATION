import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('audit-logs')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard('jwt'))
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  async getAllLogs(): Promise<any> {
    return this.auditLogService.getAllLogs();
  }
}

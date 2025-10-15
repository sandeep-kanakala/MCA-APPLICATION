import { Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditInterceptor } from './interceptor/audit-log.interceptor';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuditLogController } from './audit-log.controller';

@Module({
  controllers: [AuditLogController],
  providers: [AuditLogService, AuditInterceptor, PrismaService],
  exports: [AuditLogService, AuditInterceptor],
})
export class AuditModule {}

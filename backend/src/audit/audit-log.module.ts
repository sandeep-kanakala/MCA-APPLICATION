import { Module } from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditInterceptor } from './interceptor/audit-log.interceptor';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuditLogController } from './audit-log.controller';
import { LoadEntityInterceptor } from './interceptor/load-entity.interceptor';

@Module({
  controllers: [AuditLogController],
  providers: [
    AuditLogService,
    AuditInterceptor,
    PrismaService,
    LoadEntityInterceptor,
  ],
  exports: [AuditLogService, AuditInterceptor, LoadEntityInterceptor],
})
export class AuditModule {}

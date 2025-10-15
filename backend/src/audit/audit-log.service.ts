import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async log({
    entity,
    entityId,
    action,
    before,
    after,
    req,
    response,
  }: {
    entity: string;
    entityId?: string;
    action: 'CREATE' | 'UPDATE' | 'DELETE';
    before?: any;
    after?: any;
    req?: any;
    response?: any;
  }) {
    const performedBy = {
      userId: req?.user?.userId || 'system',
      tenantId: req?.user?.tenantId || 'default',
    };

    const meta = {
      ipAddress: req?.ip,
      userAgent: req?.headers?.['user-agent'],
    };

    await this.prisma.auditLog.create({
      data: {
        entity,
        entityId: entityId || after?.id || before?.id || 'unknown',
        action,
        details: JSON.stringify({
          before: before || null,
          after: after || null,
          body: req?.body || null,
          query: req?.query || null,
          params: req?.params || null,
          response: response || null,
        }),
        userId: performedBy.userId,
        tenantId: performedBy.tenantId,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      },
    });
  }

  async getAllLogs() {
    const logs = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return logs.map((log) => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
    }));
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AuditRequest,
  AuthenticatedRequest,
  AuditLogFilter,
} from '~/interface';
import { ResponseBuilder } from '@/utils/response.builder';
import type { Response } from '@/utils/response.builder';
import { isIUserTokenPayload } from '@/utils/helper';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  private checkUserType(req?: AuditRequest) {
    const user = req?.user;

    if (user) {
      if (isIUserTokenPayload(user)) {
        return {
          userId: user.id || 'system',
          tenantId: user.tenantId || 'default',
          email: user.email || 'unknown',
        };
      } else {
        return {
          userId: user.id || 'system',
          tenantId: user.tenantId || 'default',
          email: user.email || 'unknown',
        };
      }
    }

    return {
      userId: 'system',
      tenantId: 'default',
      email: 'unknown',
    };
  }

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
    req?: AuditRequest;
    response?: any;
  }) {
    const performedBy = this.checkUserType(req);
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
          user: performedBy,
        }),
        userId: performedBy.userId,
        tenantId: performedBy.tenantId,
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      },
    });
  }

  async getAllLogs(page?: number, limit?: number): Promise<Response> {
    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = Math.max(Number(limit) || 10, 1);
    const skip = (pageNumber - 1) * pageSize;

    const [totalCount, logs] = await Promise.all([
      this.prisma.auditLog.count(),
      this.prisma.auditLog.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const parsedLogs = logs.map((log) => ({
      ...log,
      details: log.details ? JSON.parse(log.details) : null,
    }));

    return new ResponseBuilder()
      .withMessage('Audit logs fetched successfully.')
      .withData({
        total: totalCount,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
        data: parsedLogs,
      })
      .build();
  }

  async getLogsByEntity(
    entity: string,
    req: AuthenticatedRequest,
    entityId?: string,
    all?: string,
  ): Promise<Response> {
    const filterCriteria: AuditLogFilter = { entity };

    if (entityId) filterCriteria.entityId = entityId;

    const roleNames = req.user.roles.map((role) => role.name);

    filterCriteria.userId = req.user.id;

    if (roleNames.includes('ADMIN')) {
      if (all === 'true') {
        delete filterCriteria.userId;
      }
    }

    const logs = await this.prisma.auditLog.findMany({
      where: filterCriteria,
      orderBy: { createdAt: 'desc' },
    });

    const parsedLogs = logs.map((log) => ({
      id: log.id,
      action: log.action,
      performedBy: log.details
        ? JSON.parse(log.details).user?.email
        : log.userId,
      timestamp: log.createdAt,
      changes: {
        before: JSON.parse(log.details)?.before || null,
        after: JSON.parse(log.details)?.after || null,
      },
    }));

    return new ResponseBuilder()
      .withMessage('Entity timeline fetched successfully.')
      .withData(parsedLogs)
      .build();
  }
}

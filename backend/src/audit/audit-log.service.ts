import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AuditRequest,
  AuthenticatedRequest,
  AuditLogFilter,
  AuditLogDetails,
} from '~/interface';
import { ResponseBuilder } from '@/utils/response.builder';
import type { Response } from '@/utils/response.builder';
import { isIUserTokenPayload, safeJsonParse } from '@/utils/helper';

function sanitizeBody(body?: Record<string, unknown> | null) {
  if (!body) return null;
  const { password, confirmPassword, oldPassword, ...rest } = body;
  return rest;
}

@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

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
    action: 'CREATED' | 'UPDATED' | 'DELETED';
    before?: unknown;
    after?: unknown;
    req?: AuditRequest;
    response?: unknown;
  }) {
    const performedBy = this.checkUserType(req);
    const meta = {
      ipAddress: req?.ip,
      userAgent: req?.headers?.['user-agent'],
    };

    const beforeId =
      typeof before === 'object' && before !== null && 'id' in before
        ? (before as { id: string }).id
        : undefined;

    const afterId =
      typeof after === 'object' && after !== null && 'id' in after
        ? (after as { id: string }).id
        : undefined;

    await this.prisma.auditLog.create({
      data: {
        entity,
        entityId: entityId || afterId || beforeId || 'unknown',
        action,
        details: JSON.stringify({
          before: before || null,
          after: after || null,
          body: sanitizeBody(req?.body as Record<string, unknown>),
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
      details: log.details
        ? (JSON.parse(log.details) as Record<string, unknown>)
        : null,
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
  ): Promise<Response> {
    const filterCriteria: AuditLogFilter = { entity };

    if (entityId) filterCriteria.entityId = entityId;

    const logs = await this.prisma.auditLog.findMany({
      where: filterCriteria,
      orderBy: { createdAt: 'desc' },
    });

    const parsedLogs = logs.map((log) => {
      const parsed = safeJsonParse<AuditLogDetails>(log.details);

      return {
        id: log.id,
        action: log.action,
        performedBy: parsed?.user?.email ?? log.userId,
        timestamp: log.createdAt,
        changes: {
          before: parsed?.before ?? null,
          after: parsed?.after ?? null,
        },
      };
    });

    return new ResponseBuilder()
      .withMessage('Entity timeline fetched successfully.')
      .withData(parsedLogs)
      .build();
  }
}

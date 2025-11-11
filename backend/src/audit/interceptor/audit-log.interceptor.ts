import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, from, map, concatMap } from 'rxjs';
import { AuditLogService } from '../audit-log.service';
import type { AuditRequest } from '~/interface';
import { SKIP_AUDIT_KEY } from '../decorators/skip-audit-log.decorator';
import { AUDIT_ENTITY_KEY } from '../decorators/audit-log.decorator';

type ResultWithData<T> = { data?: T };

function hasData<T>(value: unknown): value is ResultWithData<T> {
  return typeof value === 'object' && value !== null && 'data' in value;
}

function extractId(value: unknown): string | undefined {
  if (typeof value === 'object' && value !== null && 'id' in value) {
    return (value as { id?: string }).id;
  }

  return typeof value === 'object' && value != null
    ? (value as { product?: { id?: string } })?.product?.id
    : undefined;
}

@Injectable()
export class AuditInterceptor<T> implements NestInterceptor {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<T> {
    const req: AuditRequest = context.switchToHttp().getRequest<AuditRequest>();

    const skip =
      this.reflector.get<boolean>(SKIP_AUDIT_KEY, context.getHandler()) ??
      this.reflector.get<boolean>(SKIP_AUDIT_KEY, context.getClass());

    if (skip) return next.handle() as Observable<T>;

    const methodsToAudit = ['POST', 'PATCH', 'PUT', 'DELETE'];
    if (!methodsToAudit.includes(req.method)) {
      return next.handle() as Observable<T>;
    }

    const entity =
      this.reflector.get<string>(AUDIT_ENTITY_KEY, context.getHandler()) ||
      this.reflector.get<string>(AUDIT_ENTITY_KEY, context.getClass()) ||
      'unknown';
    return next.handle().pipe(
      concatMap((result: T | ResultWithData<T>) => {
        return from(this.logAfterCompletion(req, result as T, entity)).pipe(
          map(() => result as T),
        );
      }),
    );
  }

  private async logAfterCompletion(
    req: AuditRequest,
    result: T,
    entity: string,
  ) {
    let before: T | undefined = undefined;
    let after: T | undefined = undefined;
    let action: 'CREATED' | 'UPDATED' | 'DELETED' = 'UPDATED';

    const responseData: unknown = hasData<T>(result) ? result.data : result;

    switch (req.method) {
      case 'POST':
        action = 'CREATED';
        after = responseData as T;
        break;
      case 'PATCH':
      case 'PUT':
        action = 'UPDATED';
        before = req.beforeUpdate as T | undefined;
        after = responseData as T;
        break;
      case 'DELETE':
        action = 'DELETED';
        before = req.beforeDelete as T | undefined;
        after = undefined;
        break;
    }

    try {
      const resolvedEntityId =
        extractId(responseData) ||
        extractId(after) ||
        extractId(before) ||
        extractId(req.params) ||
        req.params?.id;
      await this.auditLogService.log({
        entity,
        entityId: resolvedEntityId,
        action,
        before,
        after,
        response: result,
        req,
      });
    } catch (err) {
      console.error('Failed to write audit log:', err);
    }
  }
}

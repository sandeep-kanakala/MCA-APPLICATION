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

@Injectable()
export class AuditInterceptor<T> implements NestInterceptor {
  constructor(
    private auditLogService: AuditLogService,
    private reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: AuditRequest = context.switchToHttp().getRequest<AuditRequest>();

    const skip = this.reflector.get<boolean>(
      SKIP_AUDIT_KEY,
      context.getHandler(),
    );
    if (skip) return next.handle();

    const methodsToAudit = ['POST', 'PATCH', 'PUT', 'DELETE'];
    if (!methodsToAudit.includes(req.method)) {
      return next.handle();
    }

    const pathSegments = req.path.split('/').filter(Boolean);
    const entity = pathSegments[0] || 'unknown';

    return next.handle().pipe(
      concatMap((result) => {
        return from(this.logAfterCompletion(req, result, entity)).pipe(
          map(() => result),
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
    let action: 'CREATE' | 'UPDATE' | 'DELETE' = 'UPDATE';

    const responseData = (result as any)?.data ?? result;

    switch (req.method) {
      case 'POST':
        action = 'CREATE';
        after = responseData;
        console.log(responseData);
        break;
      case 'PATCH':
      case 'PUT':
        action = 'UPDATE';
        before = req.beforeUpdate as T | undefined;
        after = responseData;
        break;
      case 'DELETE':
        action = 'DELETE';
        before = req.beforeDelete as T | undefined;
        after = undefined;
        break;
    }

    try {
      await this.auditLogService.log({
        entity,
        entityId:
          (responseData as any)?.id || (before as any)?.id || req.params.id,
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

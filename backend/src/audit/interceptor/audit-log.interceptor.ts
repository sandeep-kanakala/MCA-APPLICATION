import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AuditLogService } from '../audit-log.service';
import { AuditRequest } from '../../common/types/express';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { AUDIT_ENTITY_KEY } from '../decorators/audit-log.decorator';
import { SKIP_AUDIT_KEY } from '../decorators/skip-audit-log.decorator';

interface JwtUser {
  id?: string;
  tenantId?: string;
  [key: string]: any;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private auditLogService: AuditLogService,
    private config: ConfigService,
    private reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: AuditRequest = context.switchToHttp().getRequest<AuditRequest>();

    const skip = this.reflector.get<boolean>(
      SKIP_AUDIT_KEY,
      context.getHandler(),
    );
    if (skip) return next.handle();

    if (!['POST', 'PATCH', 'DELETE'].includes(req.method)) return next.handle();

    const authHeader = req.headers['authorization'] || '';
    const token = authHeader.replace('Bearer ', '');
    if (token) {
      const secret = this.config.get<string>('JWT_SECRET');
      if (!secret) throw new Error('JWT_SECRET is not defined');
      try {
        const decoded = jwt.verify(token, secret);
        req.user =
          typeof decoded === 'string' ? { id: decoded } : (decoded as JwtUser);
      } catch (err) {
        throw new UnauthorizedException('Invalid token for audit logging');
      }
    }

    const controller = context.getClass();
    const entity =
      this.reflector.get<string>(AUDIT_ENTITY_KEY, controller) || 'unknown';

    return next.handle().pipe(
      tap(async (result) => {
        let before, after;
        if (req.method === 'POST') after = result.data;
        if (req.method === 'PATCH') {
          before = req.beforeUpdate;
          after = req.afterUpdate;
        }
        if (req.method === 'DELETE') before = req.beforeDelete;

        await this.auditLogService.log({
          entity,
          entityId: after?.id || before?.id || req.params.id,
          action:
            req.method === 'POST'
              ? 'CREATE'
              : req.method === 'PATCH'
                ? 'UPDATE'
                : 'DELETE',
          before,
          after,
          response: result,
          req,
        });
      }),
    );
  }
}

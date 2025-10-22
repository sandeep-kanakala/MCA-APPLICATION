import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Type,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AuditRequest, FindOneCapable } from '~/interface';
import { UserService } from '@/modules/user/user.service';
import { ContactService } from '@/modules/contact/contact.service';
import { AccountService } from '@/modules/account/account.service';

const serviceMap: Record<string, Type<FindOneCapable>> = {
  users: UserService,
  contacts: ContactService,
  accounts: AccountService,
};

@Injectable()
export class LoadEntityInterceptor implements NestInterceptor {
  constructor(private moduleRef: ModuleRef) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req: AuditRequest = context.switchToHttp().getRequest<AuditRequest>();
    const id = req.params.id;
    const method = req.method;

    const needsBeforeData =
      id && (method === 'PATCH' || method === 'PUT' || method === 'DELETE');

    if (!needsBeforeData) {
      return next.handle();
    }

    const pathSegments = req.path.split('/').filter(Boolean);
    const entityName = pathSegments[0];

    const ServiceClass = serviceMap[entityName];

    if (ServiceClass) {
      try {
        const service = await this.moduleRef.resolve(ServiceClass, undefined, {
          strict: false,
        });
        const entity = await service.findOne(id);

        if (method === 'DELETE') {
          req.beforeDelete = entity;
        } else {
          req.beforeUpdate = entity;
        }
      } catch (error) {
        console.error(
          `Failed to load entity '${entityName}' (${id}) for audit log:`,
          error.message,
        );
      }
    }

    return next.handle();
  }
}

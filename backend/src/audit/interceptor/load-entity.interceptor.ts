import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Type,
  Inject,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Observable } from 'rxjs';
import { AuditRequest, FindOneCapable } from '~/interface';
import { UserService } from '@/modules/user/user.service';
import { ContactService } from '@/modules/contact/contact.service';
import { AccountService } from '@/modules/account/account.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import winston from 'winston';
import { OrderService } from '@/modules/order/order.service';
import { PricebookService } from '@/modules/pricebook/pricebook.service';
import { PricelistService } from '@/modules/pricelist/pricelist.service';
import { AssetService } from '@/modules/asset/asset.service';
import { ProductService } from '@/modules/product/product.service';
import { BundleItemsService } from '@/modules/bundle-items/bundle-items.service';
import { AddressService } from '@/modules/address/address.service';

const serviceMap: Record<string, Type<FindOneCapable>> = {
  users: UserService,
  contacts: ContactService,
  accounts: AccountService,
  address: AddressService,
  orders: OrderService,
  PriceBook: PricebookService,
  pricelist: PricelistService,
  assets: AssetService,
  products: ProductService,
  bundleItems: BundleItemsService,
};

@Injectable()
export class LoadEntityInterceptor implements NestInterceptor {
  constructor(
    private readonly moduleRef: ModuleRef,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: winston.Logger,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const req: AuditRequest = context.switchToHttp().getRequest<AuditRequest>();
    const [id] = Object.values(req.params);
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
        const err: Error =
          error instanceof Error ? error : new Error(String(error));
        this.handleAuditError(entityName, id, err);
      }
    }
    return next.handle();
  }

  private handleAuditError(entityName: string, id: string, error: Error) {
    const errorMessage = `Failed to load entity '${entityName}' (${id}) for audit log: ${error.message}`;
    this.logger.error(errorMessage, error);
    throw new Error(errorMessage);
  }
}

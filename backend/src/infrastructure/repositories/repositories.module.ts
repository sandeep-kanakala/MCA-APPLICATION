import { forwardRef, Global, Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { TenantRepository } from './tenant.repository';
import { AccountRepository } from './account.repository';
import { ContactRepository } from './contact.repository';
import { ProductRepository } from './product.repository';
import { BundleItemRepository } from './bundle-items.repository';
import { OrderRespository } from './order.repository';
import { PrismaModule } from '@/prisma/prisma.module';
import { PriceBookRepository } from './pricebook.repository';
import { PriceListRepository } from './pricelist.repository';
import { AssetRepository } from './asset.repository';
import { RoleRepository } from './role.repository';
import { PermissionsRepository } from './permissions.repository';
import { AddressRepository } from './address.repository';

@Global()
@Module({
  imports: [forwardRef(() => PrismaModule)],
  providers: [
    UserRepository,
    TenantRepository,
    AccountRepository,
    ContactRepository,
    ProductRepository,
    BundleItemRepository,
    OrderRespository,
    PriceBookRepository,
    PriceListRepository,
    AssetRepository,
    RoleRepository,
    PermissionsRepository,
    AddressRepository,
  ],
  exports: [
    UserRepository,
    TenantRepository,
    AccountRepository,
    ContactRepository,
    ProductRepository,
    BundleItemRepository,
    OrderRespository,
    PriceBookRepository,
    PriceListRepository,
    AssetRepository,
    RoleRepository,
    PermissionsRepository,
    AddressRepository,
  ],
})
export class RepositoriesModule {}

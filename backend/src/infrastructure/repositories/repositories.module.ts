import { Global, Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRepository } from './user.repository';
import { TenantRepository } from './tenant.repository';
import { AccountRepository } from './account.repository';
import { ContactRepository } from './contact.repository';
import { productRepository } from './product.repository';
import { BundleItemRepository } from './bundle-items.repository';

@Global()
@Module({
  providers: [
    PrismaService,
    UserRepository,
    TenantRepository,
    AccountRepository,
    ContactRepository,
    productRepository,
    BundleItemRepository,
  ],
  exports: [
    UserRepository,
    TenantRepository,
    AccountRepository,
    ContactRepository,
    productRepository,
    BundleItemRepository,
  ],
})
export class RepositoriesModule {}

import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { AccountModule } from '@/modules/account/account.module';
import { AuditModule } from '@/audit/audit-log.module';
import { WinstonModule } from 'nest-winston';
import { winstonLoggerOptions } from '@/common/logger.service';
import { PermissionsModule } from '@/modules/permissions/permissions.module';
import { RepositoriesModule } from '@/infrastructure/repositories/repositories.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { ContactModule } from '@/modules/contact/contact.module';
import { ProductModule } from '@/modules/product/product.module';
import { BundleItemsModule } from '@/modules/bundle-items/bundle-items.module';
import { OrderModule } from '@/modules/order/order.module';
import { PricebookModule } from './modules/pricebook/pricebook.module';
import { PricelistModule } from './modules/pricelist/pricelist.module';
import { AssetModule } from './modules/asset/asset.module';
import { AddressModule } from './modules/address/address.module';
import { ExportModule } from '@/modules/export/export.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WinstonModule.forRoot(winstonLoggerOptions),
    AuthModule,
    PrismaModule,
    AccountModule,
    UserModule,
    AuditModule,
    PermissionsModule,
    RepositoriesModule,
    ContactModule,
    ProductModule,
    BundleItemsModule,
    OrderModule,
    PricebookModule,
    PricelistModule,
    AssetModule,
    AddressModule,
    ExportModule,
  ],
})
export class AppModule {}

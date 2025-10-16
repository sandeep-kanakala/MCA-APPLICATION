import { Global, Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRepository } from './user.repository';
import { TenantRepository } from './tenant.repository';
import { AccountRepository } from './account.repository';
import { ContactRepository } from './contact.repository';

@Global()
@Module({
  providers: [
    PrismaService,
    UserRepository,
    TenantRepository,
    AccountRepository,
    ContactRepository,
  ],
  exports: [
    UserRepository,
    TenantRepository,
    AccountRepository,
    ContactRepository,
  ],
})
export class RepositoriesModule {}

import { Global, Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserRepository } from './user.repository';
import { TenantRepository } from './tenant.repository';

@Global()
@Module({
  providers: [PrismaService, UserRepository, TenantRepository],
  exports: [UserRepository,
            TenantRepository
  ],
})
export class RepositoriesModule {}
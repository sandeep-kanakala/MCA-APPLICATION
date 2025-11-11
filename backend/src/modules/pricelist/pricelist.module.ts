import { Module } from '@nestjs/common';
import { PricelistService } from './pricelist.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuditModule } from '@/audit/audit-log.module';
import { RepositoriesModule } from '@/infrastructure/repositories/repositories.module';
import { PricelistController } from './pricelist.controller';

@Module({
  imports: [AuthModule, PrismaModule, AuditModule, RepositoriesModule],
  controllers: [PricelistController],
  providers: [PricelistService],
})
export class PricelistModule {}

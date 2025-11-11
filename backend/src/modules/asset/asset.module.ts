import { AuditModule } from '@/audit/audit-log.module';
import { RepositoriesModule } from '@/infrastructure/repositories/repositories.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';

@Module({
  imports: [AuthModule, PrismaModule, AuditModule, RepositoriesModule],
  controllers: [AssetController],
  providers: [AssetService],
})
export class AssetModule {}

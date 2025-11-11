import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuditModule } from '@/audit/audit-log.module';
import { RepositoriesModule } from '@/infrastructure/repositories/repositories.module';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
@Module({
  imports: [AuthModule, PrismaModule, AuditModule, RepositoriesModule],
  controllers: [AddressController],
  providers: [AddressService],
})
export class AddressModule {}

import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuditModule } from '@/audit/audit-log.module';
import { RepositoriesModule } from '@/infrastructure/repositories/repositories.module';

@Module({
  imports: [AuthModule, PrismaModule, AuditModule, RepositoriesModule],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}

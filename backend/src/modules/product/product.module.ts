import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuditModule } from '@/audit/audit-log.module';
import { RepositoriesModule } from '@/infrastructure/repositories/repositories.module';

@Module({
  imports: [AuthModule, PrismaModule, AuditModule, RepositoriesModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}

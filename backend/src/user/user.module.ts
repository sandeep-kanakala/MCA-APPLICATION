import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuthModule } from '@/auth/auth.module';
import { AuditModule } from '@/audit/audit-log.module';

@Module({
  imports: [PrismaModule, AuthModule, AuditModule],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}

import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { DashboardModule } from './dashboard/dashboard.module';
import { AccountModule } from './account/account.module';
import { UserModule } from './user/user.module';
import { AuditModule } from './audit/audit-log.module';
import { WinstonModule } from 'nest-winston';
import { winstonLoggerOptions } from './common/logger.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WinstonModule.forRoot(winstonLoggerOptions),
    AuthModule,
    PrismaModule,
    DashboardModule,
    AccountModule,
    UserModule,
    AuditModule,
  ],
})
export class AppModule {}

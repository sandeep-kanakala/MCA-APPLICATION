import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { RepositoriesModule } from '@/infrastructure/repositories/repositories.module';

@Module({
  imports: [PrismaModule, AuthModule, RepositoriesModule],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule {}

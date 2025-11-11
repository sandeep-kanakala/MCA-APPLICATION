import { forwardRef, Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ApplicationDataIntializer } from './ApplicationDataIntializer';
import { RepositoriesModule } from '@/infrastructure/repositories/repositories.module';

@Global()
@Module({
  providers: [PrismaService, ApplicationDataIntializer],
  exports: [PrismaService],
  imports: [forwardRef(() => RepositoriesModule)],
})
export class PrismaModule {}

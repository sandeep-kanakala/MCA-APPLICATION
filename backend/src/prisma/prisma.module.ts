import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ApplicationDataIntializer } from './ApplicationDataIntializer';

@Global()
@Module({
  providers: [PrismaService,ApplicationDataIntializer],
  exports:[PrismaService]
})
export class PrismaModule {}

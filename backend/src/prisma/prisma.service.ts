import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as winston from 'winston';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: winston.Logger,
  ) {
    super();
  }
  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.info('Connected to database');
      return;
    } catch (error) {
      throw error;
    }
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}

import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Inject,
  InternalServerErrorException,
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.logger.error(`Database connection failed: ${error.message}`);
      } else {
        this.logger.error('Unknown error while connecting to database');
      }
      throw new InternalServerErrorException('Failed to connect to database');
    }
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}

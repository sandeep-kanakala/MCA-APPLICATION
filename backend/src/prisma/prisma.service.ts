import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly MAX_RETRIES = 5;
  private readonly RETRY_DELAY_MS = 60000;

  async onModuleInit() {
    let retries = 0;

    while (retries < this.MAX_RETRIES) {
      try {
        await this.$connect();
        console.log('Connected to database');
        return;
      } 
      catch (error) {
        retries++;
        console.error(`Failed to connect (Attempt ${retries}/${this.MAX_RETRIES})`, error);
        if (retries >= this.MAX_RETRIES) {
          console.error('Max retries reached. Exiting.');
          throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, this.RETRY_DELAY_MS));
      }
    }
  }


  async onModuleDestroy() {
    await this.$disconnect();
  }
}

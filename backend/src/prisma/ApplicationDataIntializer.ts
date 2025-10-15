import { passwordEncoder } from '@/user/util/password.encoder';
import { PrismaService } from './prisma.service';
import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as winston from 'winston';

@Injectable()
export class ApplicationDataIntializer implements OnModuleInit {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: winston.Logger,
  ) {}
  async onModuleInit() {
    const tenantId = process.env.TENANT_ID;
    if (!tenantId) {
      this.logger.error('TENANT_ID not found in config');
      throw new Error('TENANT_ID not found in config');
    }

    let tenant = await this.prismaService.tenant.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) {
      tenant = await this.prismaService.tenant.create({
        data: {
          id: tenantId,
          name: 'Multichoice',
        },
      });
    }

    const superUserEmail = process.env.SUPER_ADMIN_MAIL ?? '';
    const existingSuperUser = await this.prismaService.user.findFirst({
      where: {
        email: superUserEmail,
        tenantId,
      },
    });

    if (!existingSuperUser) {
      const hashedPassword = await passwordEncoder.hashPassword(
        process.env.DEFAULT_PASSWORD ?? '',
      );
      await this.prismaService.user.create({
        data: {
          email: superUserEmail,
          password: hashedPassword,
          firstName: '',
          lastName: '',
          phoneNo: '',
          createdBy: '',
          tenantId,
          role: 'SUPER_ADMIN',
        },
      });
    }
  }
}

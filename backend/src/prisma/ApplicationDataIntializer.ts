
import { passwordEncoder } from '@/utils/helper';
import { PrismaService } from './prisma.service';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { UserRepository } from '@/infrastructure/repositories/user.repository';
import { TenantRepository } from '@/infrastructure/repositories/tenant.repository';
import { APP_NAME, SUPER_ADMIN } from '@/config/constants';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as winston from 'winston';
import { Role } from '@prisma/client';

@Injectable()
export class ApplicationDataIntializer implements OnModuleInit {
  constructor(private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: winston.Logger,
    private users: UserRepository,
    private tenant: TenantRepository
  ) {}
  async onModuleInit() {
    const tenantId = process.env.TENANT_ID;
    if (!tenantId) {
      this.logger.error('TENANT_ID not found in config');
      throw new Error('TENANT_ID not found in config');
    }

    let tenant = await this.tenant.findByTenantId(tenantId);

    if (!tenant) {
      const data ={
         id: tenantId,
         name: APP_NAME,
      }
      tenant = await this.tenant.createtenant(data);
    }

    const superUserEmail = process.env.SUPER_ADMIN_MAIL ?? '';
    const existingSuperUser = await this.users.findFirst(superUserEmail, tenantId);
    
    if (!existingSuperUser) {
      const hashedPassword = await passwordEncoder.hashPassword(
        process.env.DEFAULT_PASSWORD ?? '',
      );
      const userData = {
          email: superUserEmail,
          password: hashedPassword,
          firstName: '',
          lastName: '',
          phoneNo: '',
          createdBy: '',
          tenantId,
          role: SUPER_ADMIN,
        }
         await this.users.createUser(userData);
    }

    //add permissions
    const subjects = [
      'Tenant',
      'Team',
      'User',
      'Permission',
      'UserTeam',
      'Account',
      'Contact',
      'Lead',
      'Opportunity',
      'OpportunityContactRole',
      'Product',
      'PriceBook',
      'PriceBookEntry',
      'ProductBundle',
      'ProductBundleItem',
      'PriceList',
      'PriceListEntry',
      'Quote',
      'QuoteLineItem',
      'Order',
      'OrderAmendment',
      'OrderItem',
      'Campaign',
      'CampaignContactMember',
      'CampaignLeadMember',
      'Subscription',
      'SubscriptionItem',
      'Asset',
      'Task',
      'Event',
      'EventParticipant',
      'Note',
      'Attachment',
    ];
    const actions = ['create', 'read', 'update', 'delete'];

    const data: {
      tenantId: string;
      subject: string;
      action: string;
      role: Role;
      active: boolean;
    }[] = [];

    for (const subject of subjects) {
      for (const action of actions) {
        for (const role of Object.values(Role)) {
          data.push({
            tenantId,
            subject,
            action,
            role,
            active: role === Role.SUPER_ADMIN, // only super admin active
          });
        }
      }
    }

    try {
      await this.prismaService.permission.createMany({
        data,
        skipDuplicates: true,
      });
      console.log('Permissions seeded');
    } catch (error) {
      console.log('Error seeding permissions', error);
    }
  }
}

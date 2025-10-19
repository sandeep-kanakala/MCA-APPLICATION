import { passwordEncoder } from '@/utils/helper';
import { PrismaService } from './prisma.service';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { UserRepository } from '@/infrastructure/repositories/user.repository';
import { TenantRepository } from '@/infrastructure/repositories/tenant.repository';
import { APP_NAME } from '@/config/constants';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as winston from 'winston';
import { Subject } from '@prisma/client';

@Injectable()
export class ApplicationDataIntializer implements OnModuleInit {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: winston.Logger,
    private users: UserRepository,
    private tenant: TenantRepository,
  ) {}
  async onModuleInit() {
    const tenantId = process.env.TENANT_ID;
    if (!tenantId) {
      this.logger.error('TENANT_ID not found in config');
      throw new Error('TENANT_ID not found in config');
    }

    let tenant = await this.tenant.findByTenantId(tenantId);

    if (!tenant) {
      const data = {
        id: tenantId,
        name: APP_NAME,
      };
      tenant = await this.tenant.createtenant(data);
    }

    //add Permissions
    const userPermissions = [
      {
        tenantId,
        name: 'can_create_user',
        description: 'Can create users',
        subject: Subject.User,
      },
      {
        tenantId,
        name: 'can_read_user',
        description: 'Can read users',
        subject: Subject.User,
      },
      {
        tenantId,
        name: 'can_update_user',
        description: 'Can update users',
        subject: Subject.User,
      },
      {
        tenantId,
        name: 'can_delete_user',
        description: 'Can delete users',
        subject: Subject.User,
      },
    ];

    await this.prismaService.permission.createMany({
      data: userPermissions,
      skipDuplicates: true,
    });

    //add Roles and assign permissions
    const roles = ['SUPER_ADMIN', 'ADMIN', 'USER'];
    for (const roleName of roles) {
      const existingRole = await this.prismaService.role.findFirst({
        where: { tenantId, name: roleName },
      });

      const payload = {
        data: {
          name: roleName,
          tenantId,
          permissions: {
            connect: ['SUPER_ADMIN', 'ADMIN'].includes(roleName)
              ? userPermissions.map((p) => ({
                  tenantId_name: { tenantId, name: p.name },
                }))
              : [],
          },
        },
      };

      if (!existingRole) {
        await this.prismaService.role.create(payload);
      }
    }

    // add Super User
    const superUserEmail = process.env.SUPER_ADMIN_MAIL ?? '';
    const existingSuperUser = await this.prismaService.user.findFirst({
      where: { email: superUserEmail, tenantId },
      include: { roles: true },
    });

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
        roles: {
          connect: [
            {
              tenantId_name: {
                name: 'SUPER_ADMIN',
                tenantId,
              },
            },
          ],
        },
      };
      await this.users.createUser(userData);
    }
  }
}

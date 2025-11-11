import { hash, passwordEncoder } from '@/utils/helper';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  UserRepository,
  RoleRepository,
  TenantRepository,
  PermissionsRepository,
} from '@/infrastructure/repositories';
import { APP_NAME } from '@/config/constants';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as winston from 'winston';
import { Prisma, Subject } from '@prisma/client';

@Injectable()
export class ApplicationDataIntializer implements OnModuleInit {
  constructor(
    // private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: winston.Logger,
    private readonly userRepository: UserRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly permissionRepository: PermissionsRepository,
    private readonly roleRepository: RoleRepository,
  ) {}
  async onModuleInit() {
    const tenantId = process.env.TENANT_ID;
    if (!tenantId) {
      this.logger.error('TENANT_ID not found in config');
      throw new Error('TENANT_ID not found in config');
    }

    let tenant = await this.tenantRepository.findByTenantId(tenantId);

    if (!tenant) {
      const data = {
        id: tenantId,
        name: APP_NAME,
      };
      tenant = await this.tenantRepository.createtenant(data);
    }

    //add Permissions
    const userPermissions: Prisma.PermissionCreateManyInput[] = [
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

    const isCreated = await this.permissionRepository.createPermissions(
      userPermissions,
      true,
    );

    if (!isCreated) {
      throw new Error('unable to setup permissions');
    }
    //add Roles and assign permissions
    const roles = ['SUPER_ADMIN', 'ADMIN', 'USER'];
    for (const roleName of roles) {
      const existingRole = await this.roleRepository.findByRoleName(
        roleName,
        tenantId,
      );

      const payload: Prisma.RoleCreateInput = {
        name: roleName,
        tenant: { connect: { id: tenantId } },
        permissions: {
          connect: ['SUPER_ADMIN', 'ADMIN'].includes(roleName)
            ? userPermissions.map((p) => ({
                tenantId_name: { tenantId, name: p.name },
              }))
            : [],
        },
      };

      if (!existingRole) {
        await this.roleRepository.AssignPermissionsToRole(payload);
      }
    }

    // add Super User
    const email = process.env.SUPER_ADMIN_MAIL;
    const superUserPassword = process.env.DEFAULT_PASSWORD;
    const missing: string[] = [];
    if (!email) missing.push('SUPER_ADMIN_MAIL');
    if (!superUserPassword) missing.push('DEFAULT_PASSWORD');

    if (missing.length || !email) {
      throw new Error(`Missing env variable(s): ${missing.join(', ')}`);
    }

    const existingSuperUser = await this.userRepository.findUser({
      email,
      tenantId,
    });
    if (!existingSuperUser) {
      const hashedPassword = await passwordEncoder.hashPassword(
        superUserPassword!,
      );
      const primary = hash(email);
      const userData: Prisma.UserCreateInput = {
        id: primary,
        email,
        password: hashedPassword,
        firstName: 'Super',
        lastName: 'Admin',
        tenant: {
          connect: { id: tenantId },
        },
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
      await this.userRepository.createUser(userData);
    }
  }
}

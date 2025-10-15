/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaService } from '@/prisma/prisma.service';
import { ResponseBuilder } from '@/utils/response.builder';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import type { Response } from '@/utils/response.builder';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async getPermissions(role: Role): Promise<Response> {
    try {
      if (!role) {
        throw new BadRequestException('Role is required');
      }
      const permissions = await this.prismaService.permission.findMany({
        where: { role, tenantId: process.env.TENANT_ID },
        select: { id: true, action: true, subject: true, active: true },
      });

      const grouped = permissions.reduce(
        (acc, perm) => {
          if (!acc[perm.subject]) acc[perm.subject] = [];
          acc[perm.subject].push({
            id: perm.id,
            action: perm.action,
            active: perm.active,
          });
          return acc;
        },
        {} as Record<string, { id: string; action: string; active: boolean }[]>,
      );

      return new ResponseBuilder()
        .withMessage('Permissions fetched successfully')
        .withData(grouped)
        .build();
    } catch (error) {
      this.handleError(error, 'Error fetching user by ID');
    }
  }

  async updatePermissions(
    role: string,
    data: { permissions: { id: string; active: boolean }[] },
  ) {
    try {
      if (!role) {
        throw new BadRequestException('Role is required');
      }

      const updates = data.permissions.map((perm) =>
        this.prismaService.permission.update({
          where: { id: perm.id, tenantId: process.env.TENANT_ID },
          data: { active: perm.active },
        }),
      );

      await Promise.all(updates);

      return new ResponseBuilder()
        .withMessage('Permissions updated successfully')
        .withData(null)
        .build();
    } catch (error) {
      this.handleError(error, 'Error updating permissions');
    }
  }

  private handleError(error: unknown, message: string): never {
    if (error instanceof BadRequestException) throw error;
    if (error instanceof ConflictException) throw error;
    if (error instanceof NotFoundException) throw error;

    throw new InternalServerErrorException('Internal server error.');
  }
}

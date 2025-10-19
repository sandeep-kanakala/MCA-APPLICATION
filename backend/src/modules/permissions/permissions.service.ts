/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PrismaService } from '@/prisma/prisma.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async assignPermissionsToRole(
    tenantId: string,
    roleName: string,
    permissionNames: string[],
  ) {
    try {
      const role = await this.prismaService.role.findUnique({
        where: {
          tenantId_name: {
            tenantId,
            name: roleName,
          },
        },
      });

      if (!role) {
        throw new NotFoundException(`Role '${roleName}' not found`);
      }

      const permissions = await this.prismaService.permission.findMany({
        where: {
          tenantId,
          name: { in: permissionNames },
        },
      });

      if (permissions.length === 0) {
        throw new NotFoundException(`No matching permissions found`);
      }

      const updatedRole = await this.prismaService.role.update({
        where: { id: role.id },
        data: {
          permissions: {
            connect: permissions.map((p) => ({
              tenantId_name: { tenantId, name: p.name },
            })),
          },
        },
        include: {
          permissions: true,
        },
      });

      return updatedRole;
    } catch (error) {
      this.handleError(error, 'Failed to assign permissions to role');
    }
  }

  getPermissionsByRole(roleName: string) {
    try {
      return this.prismaService.role.findMany({
        where: {
          name: roleName,
        },
        include: {
          permissions: true,
        },
      });
    } catch (error) {
      this.handleError(error, 'Failed to retrieve permissions by role');
    }
  }

  private handleError(error: unknown, message: string): never {
    if (error instanceof BadRequestException) throw error;
    if (error instanceof ConflictException) throw error;
    if (error instanceof NotFoundException) throw error;

    throw new InternalServerErrorException('Internal server error.');
  }
}

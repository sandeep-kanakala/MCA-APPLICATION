// src/common/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserStatus } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActiveUserByEmail(email: string, tenantId: string) {
    return this.prisma.user.findFirst({
      where: { email, tenantId, status: UserStatus.ACTIVE },
    });
  }

  async findActiveUserById(id: string) {
    return this.prisma.user.findFirst({
      where: { id, status: UserStatus.ACTIVE },
    });
  }

  async findFirst(email: string, tenantId: string) {
    return this.prisma.user.findFirst({
      where: { email, tenantId },
    });
  }

  async createUser(userData) {
    return this.prisma.user.create({
      data: userData,
    });
  }
}

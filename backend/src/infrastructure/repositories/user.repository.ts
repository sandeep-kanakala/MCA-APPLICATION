import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { UserWithRole, UserWithRoles } from '~/interface';
import { SUPER_ADMIN } from '@/config/constants';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUser(
    where: Prisma.UserWhereInput,
    include?: Prisma.UserInclude,
  ): Promise<UserWithRoles | UserWithRole | User | null> {
    return this.prisma.user.findFirst({
      where,
      include,
    });
  }

  async createUser(
    userData: Prisma.UserCreateInput,
    include?: Prisma.UserInclude,
  ): Promise<User> {
    return this.prisma.user.create({
      data: userData,
      include,
    });
  }

  async updateUserById(
    id: string,
    data: Prisma.UserUpdateInput,
    include?: Prisma.UserInclude,
  ): Promise<User | null> {
    return this.prisma.user.update({
      where: { id },
      data,
      include,
    });
  }

  async count(where: Prisma.UserWhereInput): Promise<number> {
    return this.prisma.user.count({
      where,
    });
  }

  async getAllUsers(
    where: Prisma.UserWhereInput,
    include?: Prisma.UserInclude,
    skip?: number,
    take?: number,
    orderBy?: Prisma.UserOrderByWithRelationInput,
  ): Promise<User[]> {
    return this.prisma.user.findMany({
      where,
      include,
      skip,
      take,
      orderBy,
    });
  }

  async archiveUser(
    where: Prisma.UserWhereUniqueInput,
    data: Prisma.UserUpdateInput,
  ): Promise<User | null> {
    return this.prisma.user.update({
      where,
      data,
    });
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Address, Prisma } from '@prisma/client';

@Injectable()
export class AddressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Address | null> {
    return this.prisma.address.findFirst({
      where: { id },
    });
  }

  async createAddress(data: Prisma.AddressCreateInput) {
    return this.prisma.address.create({
      data,
      include: {
        createdBy: { select: { id: true, email: true } },
      },
    });
  }
  async updateAddress(
    id: string,
    data: Prisma.AddressUpdateInput,
  ): Promise<Address> {
    return this.prisma.address.update({
      where: { id },
      data,
    });
  }
}

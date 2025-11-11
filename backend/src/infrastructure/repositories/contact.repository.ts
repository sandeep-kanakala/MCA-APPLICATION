import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { Contact, Prisma } from '@prisma/client';
import { AuthenticatedRequest } from '~/interface';
import { ContactCreateRequestDto } from '@/modules/contact/dto';

@Injectable()
export class ContactRepository {
  constructor(private readonly prisma: PrismaService) {}
  generateContactIdentifiers(countryCode: string) {
    const randomAutoNumber = String(
      Math.floor(Math.random() * 1_000_000_0000),
    ).padStart(10, '0');

    const contactNumber = `${countryCode}${randomAutoNumber}`;

    return {
      autoNumber: randomAutoNumber,
      contactNumber,
    };
  }
  async createContact(
    request: AuthenticatedRequest,
    contactCreateRequestDto: ContactCreateRequestDto,
  ): Promise<Contact> {
    const { user } = request;
    const { accountId, ...data } = contactCreateRequestDto;
    const { autoNumber, contactNumber } = this.generateContactIdentifiers(
      data.countryCode,
    );

    const contactData: Prisma.ContactCreateInput = {
      ...data,
      autoNumber,
      contactNumber,
      createdBy: { connect: { id: user.id } },
      tenant: { connect: { id: user.tenantId } },
      account: { connect: { id: accountId } },
    };

    return this.prisma.contact.create({
      data: contactData,
    });
  }

  async findContacts(
    sortField: string,
    order: string,
    skip = 0,
    take = 10,
    where?: Prisma.ContactWhereInput,
    include?: Prisma.ContactInclude,
  ): Promise<Contact[]> {
    return this.prisma.contact.findMany({
      where,
      include,
      skip,
      take,
      orderBy: { [sortField]: order },
    });
  }

  async countContacts(where?: Prisma.ContactWhereInput): Promise<number> {
    return this.prisma.contact.count({
      where,
    });
  }

  async findByIdAndAccountId(
    id: string,
    accountId: string,
    select?: Prisma.ContactSelect,
  ): Promise<Contact | null> {
    return this.prisma.contact.findFirst({
      where: { id, accountId, isArchived: false },
      select,
    });
  }

  async findById(
    id: string,
    include?: Prisma.ContactInclude,
  ): Promise<Contact | null> {
    return this.prisma.contact.findFirst({
      where: { id, isArchived: false },
      include,
    });
  }

  async updateContact(
    id: string,
    data: Prisma.ContactUpdateInput,
    select?: Prisma.ContactSelect,
  ): Promise<Contact> {
    return this.prisma.contact.update({
      where: { id },
      data,
      select,
    });
  }

  async archieveContact(
    id: string,
    data: Prisma.ContactUpdateInput,
  ): Promise<Contact> {
    return this.prisma.contact.update({
      where: { id },
      data,
    });
  }
}

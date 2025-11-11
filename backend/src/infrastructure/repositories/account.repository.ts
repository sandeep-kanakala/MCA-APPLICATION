import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { AccountType, AddressType, Prisma, User } from '@prisma/client';
import { CreateAccountDetailsDto } from '@/modules/account/dto';
import { IAccount, ICreateContact } from '~/interface';
import { toBoolean } from '@/utils';

@Injectable()
export class AccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByName(name: string, tenantId: string) {
    return this.prisma.account.findFirst({
      where: { name, tenantId, isArchived: false },
    });
  }

  async findById(id: string, type?: AccountType) {
    return this.prisma.account.findFirst({
      where: { id, type, isArchived: false },
      include: {
        address: true,
        contacts: true,
      },
    });
  }

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
  async generateNextAccountIdentifiers(
    tx: Prisma.TransactionClient,
    countryCode: string,
    accountData: IAccount,
  ) {
    const lastAccount = await tx.account.findFirst({
      orderBy: { autoNumber: 'desc' },
      select: { autoNumber: true },
    });

    let newAutoNumber: string;

    if (lastAccount?.autoNumber) {
      const numericPart = Number.parseInt(
        lastAccount.autoNumber.toString(),
        10,
      );
      newAutoNumber = String(numericPart + 1).padStart(10, '0');
    } else {
      newAutoNumber = '0000000001';
    }

    const euid = `${countryCode}${newAutoNumber}`;

    return {
      ...accountData,
      autoNumber: newAutoNumber,
      euid,
      sameAsBilling: toBoolean(accountData.sameAsBilling),
    };
  }

  async createAccountDetails(user: User, data: CreateAccountDetailsDto) {
    const { contacts, address, ...accountData } = data;
    return this.prisma.$transaction(async (tx) => {
      const accountObj = await this.generateNextAccountIdentifiers(
        tx,
        accountData.countryCode,
        accountData,
      );
      let contactsWithIdentifiers: ICreateContact[] = [];
      if (contacts && contacts.length > 0) {
        contactsWithIdentifiers = contacts.map((contact) => {
          const { autoNumber, contactNumber } = this.generateContactIdentifiers(
            contact.countryCode,
          );

          return {
            ...contact,
            autoNumber,
            contactNumber,
            createdBy: { connect: { id: user.id } },
            tenant: { connect: { id: user.tenantId } },
          };
        });
      }

      let finalAddresses: typeof address = [];
      const sameAsBilling = toBoolean(accountData.sameAsBilling);
      if (sameAsBilling) {
        const billing = (address ?? []).find(
          (a) => a.addressType === AddressType.BILLING,
        );

        if (!billing) {
          throw new Error(
            'Billing address is required when sameAsBilling is true',
          );
        }

        const shipping = {
          ...billing,
          addressType: AddressType.SHIPPING,
        };

        finalAddresses = [billing, shipping];
      } else {
        finalAddresses = address ?? [];
      }

      const account = await tx.account.create({
        data: {
          ...accountObj,
          sameAsBilling,
          createdBy: { connect: { id: user.id } },
          tenant: { connect: { id: user.tenantId } },
          ...(contactsWithIdentifiers && contactsWithIdentifiers.length > 0
            ? {
                contacts: {
                  create: contactsWithIdentifiers.map((contact) => ({
                    ...contact,
                    createdBy: { connect: { id: user.id } },
                    tenant: { connect: { id: user.tenantId } },
                  })),
                },
              }
            : {}),
          ...(finalAddresses && finalAddresses.length > 0
            ? {
                address: {
                  create: finalAddresses.map((addr) => ({
                    ...addr,
                    createdById: user.id,
                  })),
                },
              }
            : {}),
        },
        include: { contacts: true, address: true },
      });

      return account;
    });
  }
  async createAccount(data: Prisma.AccountCreateInput) {
    return this.prisma.account.create({
      data,
    });
  }

  async updateAccount(id: string, data: Prisma.AccountUpdateInput) {
    return this.prisma.account.update({
      where: { id },
      data,
    });
  }

  async archiveAccount(id: string, updatedById: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.account.update({
        where: { id },
        data: {
          isArchived: true,
          archivedAt: new Date(),
          updatedById,
        },
      });

      const updatedContacts = await tx.contact.updateMany({
        where: { accountId: id },
        data: {
          isArchived: true,
          archivedAt: new Date(),
          updatedById,
        },
      });
    });
  }

  async countAll(where: Prisma.AccountWhereInput) {
    return this.prisma.account.count({
      where,
    });
  }

  async getPaginated(
    skip: number,
    take: number,
    where: Prisma.AccountWhereInput,
    sortField,
    order: string,
  ) {
    return this.prisma.account.findMany({
      where,
      skip,
      take,
      orderBy: { [sortField]: order },
    });
  }

  async getAccountBycontact(contactId: string) {
    return this.prisma.account.findFirst({
      where: {
        contacts: {
          some: { id: contactId },
        },
        isArchived: false,
      },
      include: {
        contacts: true,
      },
    });
  }
}

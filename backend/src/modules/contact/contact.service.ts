import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as winston from 'winston';
import { Contact, Prisma } from '@prisma/client';

import { ContactCreateRequestDto, ContactUpdateRequestDto } from './dto';
import {
  Response,
  ResponseBuilder,
  cleanPatchData,
  handleError,
} from '@/utils';
import { AuthenticatedRequest, RequestWithUser } from '~/interface';
import {
  ContactRepository,
  AccountRepository,
} from '@/infrastructure/repositories';
import { ASC, CREATED_AT, DESC } from '@/config/constants';
import { AllowedContactSortFields } from '@/config/constants/contact.constants';
@Injectable()
export class ContactService {
  constructor(
    private readonly contactRepository: ContactRepository,
    private readonly accountRepository: AccountRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: winston.Logger,
  ) {}

  async createContact(
    contactCreateRequestDto: ContactCreateRequestDto,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    this.logger.info(`Creating contact for user: ${user.email}`);
    try {
      const { accountId } = contactCreateRequestDto;
      const account = await this.accountRepository.findById(accountId);
      if (!account) {
        throw new BadRequestException(
          'Invalid foreign key reference (AccountId or UserId)',
        );
      }

      const createdContact = await this.contactRepository.createContact(
        request,
        contactCreateRequestDto,
      );

      return new ResponseBuilder()
        .withMessage('Contact created successfully.')
        .withStatusCode(201)
        .withData(createdContact)
        .build();
    } catch (error: unknown) {
      this.logger.error('Error creating contact', { error });
      handleError(error, 'Error creating contact.');
    }
  }

  async getAllContactsByAccountId(
    request: AuthenticatedRequest,
    page?: number,
    limit?: number,
    accountId?: string,
    isArchived: boolean = false,
    sortByField?: string,
    search?: string,
    fromDate?: Date,
    toDate?: Date,
    sortOrder?: string,
  ): Promise<Response> {
    const { user } = request;
    this.logger.info(`Fetching all contacts for tenant: ${user.tenantId}`);

    try {
      const pageNumber = Math.max(Number(page) || 1, 1);
      const pageSize = Math.max(Number(limit) || 10, 1);
      const skip = (pageNumber - 1) * pageSize;
      const tenantId = user.tenantId;
      const cleanAccountId =
        typeof accountId === 'string' ? accountId.trim() : accountId;
      const cleanSearch = typeof search === 'string' ? search.trim() : search;
      const cleanSortByField =
        typeof sortByField === 'string' ? sortByField.trim() : sortByField;
      const cleanSortOrder =
        typeof sortOrder === 'string' ? sortOrder.trim() : sortOrder;
      const sortField =
        AllowedContactSortFields.find(
          (f) => f.toLowerCase() === cleanSortByField?.toLowerCase(),
        ) || CREATED_AT;
      const order = cleanSortOrder?.toLowerCase() === ASC ? ASC : DESC;
      const whereCondition = this.buildWhereAndFilterClauses(
        cleanSearch,
        fromDate,
        toDate,
      );
      const where = {
        tenantId,
        isArchived,
        ...(cleanAccountId && { accountId: cleanAccountId }),
        ...whereCondition,
      };
      const include: Prisma.ContactInclude = {
        account: {
          select: {
            name: true,
          },
        },
      };
      const [totalCount, contactsData] = await Promise.all([
        this.contactRepository.countContacts(where),
        this.contactRepository.findContacts(
          sortField,
          order,
          skip,
          pageSize,
          where,
          include,
        ),
      ]);

      return new ResponseBuilder()
        .withMessage('Contacts fetched successfully.')
        .withData({
          total: totalCount,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
          data: contactsData,
        })
        .build();
    } catch (error: unknown) {
      this.logger.error('Error fetching contacts list', { error });
      handleError(error, 'Error fetching contacts list.');
    }
  }
  private buildWhereAndFilterClauses(
    cleanSearch?: string,
    cleanFromDate?: Date,
    cleanToDate?: Date,
  ): Prisma.ContactWhereInput {
    const searchCondition: Prisma.ContactWhereInput = cleanSearch
      ? {
          OR: [
            {
              email: {
                contains: cleanSearch,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              phone: {
                contains: cleanSearch,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              firstName: {
                contains: cleanSearch,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              middleName: {
                contains: cleanSearch,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              lastName: {
                contains: cleanSearch,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : {};
    const filters: Prisma.ContactWhereInput = {
      ...(cleanFromDate && {
        createdAt: {
          gte: cleanFromDate,
        },
      }),
      ...(cleanToDate && {
        createdAt: {
          ...(cleanFromDate ? { gte: new Date(cleanFromDate) } : {}),
          lte: new Date(
            cleanToDate.setDate(new Date(cleanToDate).getDate() + 1),
          ),
        },
      }),
    };
    return {
      AND: [searchCondition, filters],
    };
  }

  async getContactById(id: string): Promise<Response> {
    this.logger.info(`Fetching contact ID: ${id}`);
    try {
      if (!id || typeof id !== 'string')
        throw new BadRequestException('Invalid contact ID.');

      const include = {
        account: {
          select: {
            name: true,
            type: true,
          },
        },
        createdBy: {
          select: {
            firstName: true,
            middleName: true,
            lastName: true,
          },
        },
      };
      const contact = await this.contactRepository.findById(id, include);

      if (!contact) {
        this.logger.warn(`Contact not found: ${id}`);
        throw new NotFoundException('Contact not found.');
      }

      return new ResponseBuilder()
        .withMessage('Contact fetched successfully.')
        .withData(contact)
        .build();
    } catch (error: unknown) {
      this.logger.error(`Error fetching contact ID: ${id}`, { error });
      handleError(error, 'Error fetching contact by ID.');
    }
  }

  async updateContact(
    id: string,
    contactUpdateDto: ContactUpdateRequestDto,
    request: AuthenticatedRequest,
  ): Promise<Response> {
    const { user } = request;
    this.logger.info(`Updating contact ID: ${id} by user: ${user.email}`);
    try {
      if (!id || typeof id !== 'string' || id.trim() === '')
        throw new BadRequestException('Invalid contact ID.');

      const existingContact = await this.contactRepository.findById(id);
      if (!existingContact) {
        this.logger.warn(`Contact not found or already deleted: ${id}`);
        throw new NotFoundException('Contact not found.');
      }
      const changes = cleanPatchData<Contact>(
        contactUpdateDto,
        existingContact,
      );
      if (!changes.isChanged) {
        return new ResponseBuilder()
          .withStatusCode(200)
          .withMessage('no changes found')
          .withData(contactUpdateDto)
          .build();
      }
      const updatedContact = await this.contactRepository.updateContact(id, {
        ...changes.cleaned,
        updatedBy: { connect: { id: user.id } },
      });

      return new ResponseBuilder()
        .withMessage('Contact updated successfully.')
        .withData(updatedContact)
        .build();
    } catch (error: unknown) {
      this.logger.error(`Error updating contact ID: ${id}`, { error });
      handleError(error, 'Error updating contact.');
    }
  }

  async deleteContact(id: string, request: RequestWithUser): Promise<Response> {
    const { user } = request;
    this.logger.info(
      `Delete request for contact ID: ${id} by user: ${user.email}`,
    );
    try {
      const contact = await this.contactRepository.findById(id);

      if (!contact || contact.tenantId !== user.tenantId) {
        this.logger.warn(`Attempt to delete non-existent contact: ${id}`);
        throw new NotFoundException('Contact not found.');
      }

      await this.contactRepository.archieveContact(id, {
        archivedAt: new Date().toISOString(),
        isArchived: true,
        updatedBy: { connect: { id: user.id } },
      });
      return new ResponseBuilder()
        .withStatusCode(204)
        .withMessage('Contact deleted successfully.')
        .build();
    } catch (error: unknown) {
      this.logger.error(`Error deleting contact ID: ${id}`, { error });
      handleError(error, 'Error deleting contact.');
    }
  }

  async findOne(id: string) {
    return await this.contactRepository.findById(id);
  }
}

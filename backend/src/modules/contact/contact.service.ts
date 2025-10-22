import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import * as winston from 'winston';
import { Contact, Prisma } from '@prisma/client';

import { ContactCreateRequestDto, ContactUpdateRequestDto } from './dto';
import { Response, ResponseBuilder, cleanPatchData } from '@/utils';
import { AuthenticatedRequest, RequestWithUser } from '~/interface';
import { ContactRepository } from '@/infrastructure/repositories/contact.repository';
import { AccountRepository } from '@/infrastructure/repositories/account.repository';
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
      const { accountId, ...data } = contactCreateRequestDto;
      const account = await this.accountRepository.findById(accountId);
      if (!account) {
        throw new BadRequestException(
          'Invalid foreign key reference (AccountId or UserId)',
        );
      }
      const contactData: Prisma.ContactCreateInput = {
        ...data,
        createdBy: { connect: { id: user.id } },
        updatedBy: { connect: { id: user.id } },
        tenant: { connect: { id: user.tenantId } },
        owner: { connect: { id: user.id } },
        account: { connect: { id: accountId } },
      };

      const createdContact = await this.contactRepository.createContact(
        contactData,
        {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      );

      return new ResponseBuilder()
        .withMessage('Contact created successfully.')
        .withStatusCode(201)
        .withData(createdContact)
        .build();
    } catch (error: unknown) {
      this.logger.error('Error creating contact', { error });
      this.handleError(error, 'Error creating contact.');
    }
  }

  async getAllContactsByTenantId(
    request: RequestWithUser,
    page?: number,
    limit?: number,
  ): Promise<Response> {
    const { user } = request;
    this.logger.info(`Fetching All contacts for tenant ${user.tenantId}`);

    try {
      const pageNumber = Math.max(Number(page) || 1, 1);
      const pageSize = Math.max(Number(limit) || 10, 1);
      const skip = (pageNumber - 1) * pageSize;

      const [totalCount, contactsData] = await Promise.all([
        this.contactRepository.countContactsByTenantId(user.tenantId),
        this.contactRepository.findContactsByTenantId(
          user.tenantId,
          skip,
          pageSize,
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
      this.logger.error('Error fetching contact list', { error });
      this.handleError(error, 'Error fetching contact list.');
    }
  }

  async getContactsByAccountId(
    accountId: string,
    page?: number,
    limit?: number,
  ): Promise<Response> {
    this.logger.info(`Fetching contacts for account: ${accountId}`);

    try {
      const pageNumber = Math.max(Number(page) || 1, 1);
      const pageSize = Math.max(Number(limit) || 10, 1);
      const skip = (pageNumber - 1) * pageSize;

      const [totalCount, contactsData] = await Promise.all([
        this.contactRepository.countContactsByAccountId(accountId),
        this.contactRepository.findContactsByAccountId(
          accountId,
          skip,
          pageSize,
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
      this.logger.error('Error fetching contact list', { error });
      this.handleError(error, 'Error fetching contact list.');
    }
  }

  async getContactById(id: string, accountId: string): Promise<Response> {
    this.logger.info(`Fetching contact ID: ${id} for account: ${accountId}`);
    try {
      if (!id || typeof id !== 'string') {
        throw new BadRequestException('Invalid contact ID.');
      }

      const contact = await this.contactRepository.findByIdAndAccountId(
        id,
        accountId,
      );

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
      this.handleError(error, 'Error fetching contact by ID.');
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
      if (!id || typeof id !== 'string' || id.trim() === '') {
        throw new BadRequestException('Invalid contact ID.');
      }

      const existingContact = await this.contactRepository.findById(id);
      if (!existingContact) {
        this.logger.warn(`Contact not found or already deleted: ${id}`);
        throw new NotFoundException('Contact not found.');
      }
      const changes = cleanPatchData<Contact>(
        contactUpdateDto,
        existingContact,
      );
      if (!changes) {
        return new ResponseBuilder()
          .withStatusCode(204)
          .withMessage('no changes found')
          .withData(contactUpdateDto)
          .build();
      }
      const updatedContact = await this.contactRepository.updateContact(id, {
        ...changes,
        updatedBy: { connect: { id: user.id } },
      });

      return new ResponseBuilder()
        .withMessage('Contact updated successfully.')
        .withData(updatedContact)
        .build();
    } catch (error: unknown) {
      this.logger.error(`Error updating contact ID: ${id}`, { error });
      this.handleError(error, 'Error updating contact.');
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

      await this.contactRepository.softDeleteContact(id, {
        archivedAt: new Date().toISOString(),
        isArchived: true,
        updatedBy: { connect: { id: user.id } },
      });

      return new ResponseBuilder()
        .withMessage('Contact deleted successfully.')
        .build();
    } catch (error: unknown) {
      this.logger.error(`Error deleting contact ID: ${id}`, { error });
      this.handleError(error, 'Error deleting contact.');
    }
  }

  async findOne(id: string) {
    return await this.contactRepository.findById(id);
  }

  private handleError(error: unknown, message: string): never {
    if (error instanceof BadRequestException) throw error;
    if (error instanceof ConflictException) throw error;
    if (error instanceof NotFoundException) throw error;

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Invalid foreign key reference (AccountId or UserId)',
        );
      }

      if (error.code === 'P2002') {
        throw new ConflictException(
          'A contact with this email already exists in the tenant.',
        );
      }
    }

    throw new InternalServerErrorException(message || 'Internal server error.');
  }
}

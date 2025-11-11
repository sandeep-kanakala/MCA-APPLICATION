import { Test, TestingModule } from '@nestjs/testing';
import { ContactService } from '@/modules/contact/contact.service';
import { ContactRepository } from '@/infrastructure/repositories/contact.repository';
import { AccountRepository } from '@/infrastructure/repositories/account.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import {
  mockAuthenticatedRequest,
  mockRequestWithUser,
  mockCreateContactDto,
  mockUpdateContactDto,
  mockContact,
} from './contact.mock';
import { Account } from '@prisma/client';

describe('ContactService (Unit)', () => {
  let service: ContactService;
  let contactRepo: jest.Mocked<ContactRepository>;
  let accountRepo: jest.Mocked<AccountRepository>;
  let loggerMock: { info: jest.Mock; warn: jest.Mock; error: jest.Mock };

  beforeEach(async () => {
    loggerMock = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        {
          provide: ContactRepository,
          useValue: {
            createContact: jest.fn(),
            findById: jest.fn(),
            findByIdAndAccountId: jest.fn(),
            updateContact: jest.fn(),
            archieveContact: jest.fn(),
            countContacts: jest.fn(),
            findContacts: jest.fn(),
          },
        },
        {
          provide: AccountRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: 'winston',
          useValue: loggerMock,
        },
      ],
    }).compile();

    service = module.get<ContactService>(ContactService);
    contactRepo = module.get(ContactRepository);
    accountRepo = module.get(AccountRepository);
  });

  describe('createContact', () => {
    it('throws BadRequestException if account not found', async () => {
      accountRepo.findById.mockResolvedValue(null);

      await expect(
        service.createContact(mockCreateContactDto, mockAuthenticatedRequest),
      ).rejects.toThrow(BadRequestException);
      expect(loggerMock.info).toHaveBeenCalled();
    });

    it('creates contact successfully', async () => {
      accountRepo.findById.mockResolvedValue({
        id: 'acc-1',
      } as Partial<Account> as Account);
      contactRepo.createContact.mockResolvedValue(mockContact);

      const result = await service.createContact(
        mockCreateContactDto,
        mockAuthenticatedRequest,
      );

      expect(result.data).toEqual(mockContact);
      expect(loggerMock.info).toHaveBeenCalled();
    });
  });

  describe('getContactsByAccountId', () => {
    it('returns paginated contacts', async () => {
      contactRepo.countContacts.mockResolvedValue(2);
      contactRepo.findContacts.mockResolvedValue([
        mockContact,
        { ...mockContact, id: 'contact-2' },
      ]);

      const result: {
        data: {
          total: number;
          data: (typeof mockContact)[];
        };
      } = await service.getAllContactsByAccountId(
        mockAuthenticatedRequest,
        1,
        10,
        'cmh20f5ip0004eb50vrwzjk4v-1',
      );

      expect(result.data.total).toBe(2);
      expect(result.data.data.length).toBe(2);
      expect(loggerMock.info).toHaveBeenCalled();
    });
  });

  describe('getContactById', () => {
    it('throws NotFoundException if contact not found', async () => {
      contactRepo.findByIdAndAccountId.mockResolvedValue(null);

      await expect(service.getContactById('id-1')).rejects.toThrow(
        NotFoundException,
      );
      expect(loggerMock.info).toHaveBeenCalled();
    });

    it('returns contact successfully', async () => {
      contactRepo.findById.mockResolvedValue(mockContact);

      const result = await service.getContactById('contact-1');

      expect(result.data).toEqual(mockContact);
      expect(loggerMock.info).toHaveBeenCalled();
    });
  });

  describe('updateContact', () => {
    it('throws NotFoundException if contact not found', async () => {
      contactRepo.findById.mockResolvedValue(null);

      await expect(
        service.updateContact(
          'id-1',
          mockUpdateContactDto,
          mockAuthenticatedRequest,
        ),
      ).rejects.toThrow(NotFoundException);
      expect(loggerMock.info).toHaveBeenCalled();
    });

    it('updates contact successfully', async () => {
      contactRepo.findById.mockResolvedValue(mockContact);
      const updatedContact = { ...mockContact, firstName: 'Test' };
      contactRepo.updateContact.mockResolvedValue(updatedContact);

      const result = await service.updateContact(
        'id-1',
        mockUpdateContactDto,
        mockAuthenticatedRequest,
      );

      expect(result.data).toEqual(updatedContact);
      expect(loggerMock.info).toHaveBeenCalled();
    });
  });

  describe('deleteContact', () => {
    it('throws NotFoundException if contact not found', async () => {
      contactRepo.findById.mockResolvedValue(null);

      await expect(
        service.deleteContact('id-1', mockRequestWithUser),
      ).rejects.toThrow(NotFoundException);
      expect(loggerMock.info).toHaveBeenCalled();
    });

    it('deletes contact successfully', async () => {
      contactRepo.findById.mockResolvedValue(mockContact);
      contactRepo.archieveContact.mockResolvedValue({
        ...mockContact,
        isArchived: true,
        archivedAt: new Date(),
      });

      const result = await service.deleteContact('id-1', mockRequestWithUser);

      expect(result.message).toBe('Contact deleted successfully.');
      expect(loggerMock.info).toHaveBeenCalled();
    });
  });
});

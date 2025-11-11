import { ContactCreateRequestDto } from '@/modules/contact/dto/contact.create.dto';
import { ContactUpdateRequestDto } from '@/modules/contact/dto/contact.update.dto';
import { Account, AccountType } from '@prisma/client';
import type { AuthenticatedRequest, RequestWithUser } from '~/interface';
import { IUserTokenPayload, AuditRequest } from '~/interface';

// Mock user payload
export const mockUser: IUserTokenPayload = {
  id: 'user-123',
  email: 'user@example.com',
  tenantId: 'tenant-123',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
};

// Mock AuthenticatedRequest (for createContact)
export const mockAuthenticatedRequest: AuthenticatedRequest = {
  user: mockUser,
} as unknown as AuthenticatedRequest;

// Mock RequestWithUser (for update/delete)
export const mockRequestWithUser: RequestWithUser = {
  user: mockUser,
} as unknown as RequestWithUser;

// Mock AuditRequest
export const mockAudit: AuditRequest = {
  beforeUpdate: undefined,
  afterUpdate: undefined,
  beforeDelete: undefined,
} as unknown as AuditRequest;

// Mock Create DTO
export const mockCreateContactDto: ContactCreateRequestDto & { id: string } = {
  id: 'contact-1',
  accountId: 'acc-1',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'Test',
  phone: '+911234567890',
  title: 'Mr.',
};

// Mock Update DTO
export const mockUpdateContactDto: ContactUpdateRequestDto = {
  email: 'updated@example.com',
  firstName: 'Test',
  lastName: 'Test',
  phone: '+911234567891',
  title: 'Ms.',
};

// Mock contact entity
export const mockContact = {
  id: 'contact-1',
  tenantId: 'tenant-123',
  accountId: 'acc-1',
  email: 'test@example.com',
  phone: '+911234567890',
  firstName: 'Test',
  middleName: null,
  lastName: 'test',
  title: 'Mr.',
  ownerId: 'user-123',
  createdById: 'user-123',
  updatedById: 'user-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  isArchived: false,
  archivedAt: null as Date | null,
};

export const mockAccount: Account = {
  id: 'cmh20f5ip0004eb50vrwzjk4v-1',
  tenantId: 'tenant-1',
  name: 'Sample Account',
  type: AccountType.CUSTOMER,
  industry: 'tech',
  website: 'http://example.com',
  phone: '123-456-7890',
  billingStreet: '123 Example St',
  billingCity: 'Example City',
  archivedAt: null,
  billingState: null,
  billingPostal: null,
  billingCountry: null,
  shippingStreet: null,
  shippingCity: null,
  shippingState: null,
  shippingPostal: null,
  shippingCountry: null,
  createdById: null,
  updatedById: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  isArchived: false,
};

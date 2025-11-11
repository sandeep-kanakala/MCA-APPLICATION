import {
  AccountStatus,
  AccountType,
  ContactStatus,
  Gender,
} from '@prisma/client';
import { AuthenticatedRequest } from '~/interface';

export const mockUser = {
  id: crypto.randomUUID(),
  tenantId: crypto.randomUUID(),
};

export const mockAudit = {
  user: mockUser,
};

export const mockRequest = {
  user: mockUser,
} as unknown as AuthenticatedRequest;

export const mockContact = {
  id: crypto.randomUUID(),
  tenantId: mockUser.tenantId,
  accountId: crypto.randomUUID(),
  email: 'contact@example.com',
  phone: '9876543210',
  salutation: 'Mr.',
  firstName: 'Test',
  middleName: null,
  lastName: 'User',
  birthDate: new Date('1995-06-15'),
  currency: 'INR',
  age: 30,
  status: 'ACTIVE' as ContactStatus,
  autoNumber: '0000000001',
  contactNumber: 'IND0000000001', // countryCode + autoNumber
  idType: 'Passport Number',
  passportExpirationDate: new Date('2030-12-31'),
  passportNumber: 'A1234567',
  idNumber: 'ID998877',
  countryCode: 'IND',
  icxContactNumber: 'ICX998877',
  partnerCustomerNumber: null,
  language: 'en',
  signupOrigin: 'WEB',
  communicationPreference: 'EMAIL',
  segment: 'TECH',
  gender: 'MALE' as Gender,

  createdById: mockUser.id,
  updatedById: mockUser.id,
  createdAt: new Date(),
  updatedAt: new Date(),
  isArchived: false,
  archivedAt: null,
};

export const mockAccount = {
  id: crypto.randomUUID(),
  tenantId: mockUser.tenantId,
  name: 'Linkfields Test',
  type: 'CUSTOMER' as AccountType,
  autoNumber: '0000000001',
  euid: 'IND0000000001',
  currencyCode: 'INR',
  preferredLanguage: 'en',
  status: 'ACTIVE' as AccountStatus,
  countryCode: 'IND',
  icxAccountNumber: 'ICX12345',
  signupOrigin: 'WEB',
  viewingPlatform: 'DESKTOP',
  type_c: null,
  segment: 'TECH',
  partnerCustomerNumber: null,
  recordTypeDevName: 'Customer_Record',
  sameAsBilling: false,

  createdById: mockUser.id,
  updatedById: mockUser.id,
  createdAt: new Date(),
  updatedAt: new Date(),
  isArchived: false,
  archivedAt: null,

  // Relations
  contacts: [],
  address: [],
};

export const mockAccountWithContacts = {
  ...mockAccount,
  contacts: [mockContact],
};

export const mockUpdatedAccount = {
  ...mockAccount,
  name: 'Linkfields Test Updated',
};

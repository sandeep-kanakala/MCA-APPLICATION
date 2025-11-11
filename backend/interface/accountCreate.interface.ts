import {
  AccountStatus,
  AccountType,
  ContactStatus,
  Gender,
} from '@prisma/client';

export interface IAccount {
  name: string;
  type: AccountType;
  currencyCode: string;
  preferredLanguage?: string;
  status: AccountStatus;
  countryCode: string;
  signupOrigin?: string;
  viewingPlatform?: string;
  segment?: string;
  partnerCustomerNumber?: string;
  recordTypeDevName?: string;
  sameAsBilling: string;
}

export interface ICreateContact {
  email: string;
  phone: string;
  salutation: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  birthDate?: Date;
  currency?: string;
  age?: number;
  status: ContactStatus;
  autoNumber: string;
  contactNumber: string;
  idType?: string;
  passportExpirationDate?: Date;
  passportNumber?: string;
  idNumber?: string;
  countryCode: string;
  partnerCustomerNumber?: string;
  language?: string;
  signupOrigin?: string;
  communicationPreference?: string;
  segment: string;
  gender: Gender;
}

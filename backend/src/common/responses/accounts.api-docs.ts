import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { commonErrorResponses } from './common.api-docs';
import {
  CreateAccountDetailsDto,
  CreateAccountDto,
  UpdateAccountDto,
} from '@/modules/account/dto';

export function CreateAccountApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 201,
      description: 'Created – Account created successfully',
    }),
    ApiResponse({
      status: 400,
      description:
        'Bad Request – Invalid data provided for creating an account',
    }),
  );
}

export function GetAccountsApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Retrieved list of accounts successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – No accounts found',
    }),
  );
}

export function GetAccountByIdApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Retrieved account by ID successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Account not found by ID',
    }),
  );
}

export function UpdateAccountApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Account updated successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Account not found by ID',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request – Invalid data provided for updating account',
    }),
  );
}

export function DeleteAccountApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 204,
      description: 'No Content – Account deleted successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Account not found by ID',
    }),
  );
}

export function CreateAccountDetailsApiBody() {
  return ApiBody({
    type: CreateAccountDetailsDto,
    examples: {
      customer: {
        summary: 'Customer Account with Complete Contact & Address Details',
        value: {
          name: 'Demo Account',
          type: 'CUSTOMER',
          currencyCode: 'INR',
          preferredLanguage: 'English',
          status: 'ACTIVE',
          countryCode: '288',
          signupOrigin: 'Website',
          viewingPlatform: 'WebApp',
          segment: 'Retail',
          partnerCustomerNumber: 'PCN001',
          recordTypeDevName: 'CustomerRecord',
          sameAsBilling: 'false',

          contacts: [
            {
              email: 'john@example.com',
              phone: '+919876543210',
              salutation: 'Mr.',
              firstName: 'John',
              middleName: 'Michael',
              lastName: 'Doe',
              birthDate: '1990-01-15T00:00:00.000Z',
              currency: 'INR',
              age: 35,
              status: 'ACTIVE',
              idType: 'Passport',
              passportExpirationDate: '2030-12-31T00:00:00.000Z',
              passportNumber: 'M1234567',
              idNumber: 'ID987654',
              countryCode: 'INR',
              partnerCustomerNumber: 'PCN001',
              language: 'English',
              signupOrigin: 'Website',
              communicationPreference: 'Email',
              segment: 'Retail',
              gender: 'MALE',
            },
          ],

          address: [
            {
              name: 'Head Office',
              province: 'Maharashtra',
              city: 'Mumbai',
              street: 'Bandra West',
              country: 'India',
              postalCode: '400050',
              addressType: 'BILLING',
              icxAddressNumber: 'ADDR001',
              isDefault: false,
              isPrimary: false,
            },
            {
              name: 'Branch Office',
              province: 'Maharashtra',
              city: 'Pune',
              street: 'Koregaon Park',
              country: 'India',
              postalCode: '411001',
              addressType: 'SHIPPING',
              icxAddressNumber: 'ADDR002',
              isDefault: false,
              isPrimary: false,
            },
          ],
        },
      },
    },
  });
}

export function CreateAccountApiBody() {
  return ApiBody({
    type: CreateAccountDto,
    examples: {
      customer: {
        summary: 'Customer Account',
        value: {
          name: 'Acme Corporation',
          type: 'CUSTOMER',
          currencyCode: 'USD',
          preferredLanguage: 'en',
          status: 'ACTIVE',
          countryCode: 'USA',
          signupOrigin: 'WEB',
          viewingPlatform: 'DESKTOP',
          segment: 'Enterprise',
          partnerCustomerNumber: 'CUST-1001',
          recordTypeDevName: 'Customer_Record',
        },
      },
      partner: {
        summary: 'Partner Account',
        value: {
          name: 'MTN',
          type: 'PARTNER',
          currencyCode: 'GBP',
          preferredLanguage: 'en',
          status: 'ACTIVE',
          countryCode: 'GBR',
          signupOrigin: 'API',
          viewingPlatform: 'MOBILE',
          segment: 'Telecom',
          partnerCustomerNumber: 'PART-5001',
          recordTypeDevName: 'Partner_Record',
        },
      },
    },
  });
}

export function UpdateAccountApiBody() {
  return ApiBody({
    type: UpdateAccountDto,
    examples: {
      customer: {
        summary: 'Customer Account Update',
        value: {
          name: 'Acme Corporation Ltd',
          type: 'CUSTOMER',
          status: 'ACTIVE',
          currencyCode: 'USD',
          countryCode: 'USA',
          preferredLanguage: 'en',
          viewingPlatform: 'WEB',
          segment: 'Enterprise',
          partnerCustomerNumber: 'CUST-9001',
          recordTypeDevName: 'Customer_Record',
        },
      },
      partner: {
        summary: 'Partner Account Update',
        value: {
          name: 'MTN Group',
          type: 'PARTNER',
          status: 'ACTIVE',
          currencyCode: 'ZAR',
          countryCode: 'ZAF',
          website: 'https://www.mtn.co.za',
          viewingPlatform: 'DESKTOP',
          segment: 'Telecom',
          partnerCustomerNumber: 'PART-1200',
          recordTypeDevName: 'Partner_Record',
          preferredLanguage: 'en',
        },
      },
    },
  });
}

export function AccountApiQueries() {
  return applyDecorators(
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({ name: 'type', required: false, type: String }),
    ApiQuery({ name: 'search', required: false, type: String }),
    ApiQuery({
      name: 'fromDate',
      required: false,
      type: String,
      example: '2025-01-01',
    }),
    ApiQuery({
      name: 'toDate',
      required: false,
      type: String,
      example: '2025-12-31',
    }),
    ApiQuery({
      name: 'sortByField',
      required: false,
      type: String,
      example: 'createdAt',
    }),
    ApiQuery({
      name: 'sortOrder',
      required: false,
      type: String,
      example: 'desc',
    }),
    ApiQuery({
      name: 'isArchived',
      required: false,
      type: Boolean,
      example: false,
    }),
  );
}

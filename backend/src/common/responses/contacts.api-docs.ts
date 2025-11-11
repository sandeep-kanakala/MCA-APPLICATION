import { applyDecorators } from '@nestjs/common';
import { ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
import {
  ContactCreateRequestDto,
  ContactUpdateRequestDto,
} from '@/modules/contact/dto';
import { commonErrorResponses } from './common.api-docs';

export function PostContactApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 201,
      description: 'Created – Contact created successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request – Invalid data provided for creating contact',
    }),
    ApiResponse({
      status: 403,
      description:
        'Forbidden – User does not have permission to create contact',
    }),
  );
}

export function GetContactApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Retrieved list of contacts successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – No contacts found for the given criteria',
    }),
  );
}

export function PatchContactApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Contact updated successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Contact not found by ID',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request – Invalid data provided for updating contact',
    }),
  );
}

export function DeleteContactApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Contact deleted successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Contact not found by ID',
    }),
  );
}
export function ContactApiQueries() {
  return applyDecorators(
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({ name: 'accountId', required: false, type: String }),
    ApiQuery({ name: 'search', required: false, type: String }),
    ApiQuery({
      name: 'isArchived',
      required: false,
      type: Boolean,
      example: false,
    }),
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
  );
}

export function PostContactApiBody() {
  return applyDecorators(
    ApiBody({
      type: ContactCreateRequestDto,
      examples: {
        example: {
          summary: 'Create Contact Example',
          value: {
            email: 'jane.smith@example.com',
            phone: '+19876543210',
            salutation: 'Ms.',
            firstName: 'Jane',
            middleName: 'Marie',
            lastName: 'Smith',
            birthDate: '1995-05-10',
            currency: 'USD',
            age: 29,
            status: 'ACTIVE',
            idType: 'Passport',
            passportExpirationDate: '2030-08-15',
            passportNumber: 'P1234567',
            countryCode: 'USA',
            icxContactNumber: 'ICX-908765',
            partnerCustomerNumber: 'PCN-12345',
            language: 'en',
            signupOrigin: 'Website',
            communicationPreference: 'Email',
            segment: 'Retail',
            gender: 'FEMALE',
            accountId: 'cuid_abcdef1234567890abcdef12',
          },
        },
      },
    }),
  );
}

export function PatchContactApiBody() {
  return applyDecorators(
    ApiBody({
      type: ContactUpdateRequestDto,
      examples: {
        minimalUpdate: {
          summary: 'Minimal Contact Update',
          value: {
            email: 'jane.doe@example.com',
            firstName: 'Jane',
            lastName: 'Doe',
          },
        },
        fullUpdate: {
          summary: 'Full Contact Update Example',
          value: {
            email: 'john.doe@example.com',
            phone: '+14155552671',
            salutation: 'Mr.',
            firstName: 'John',
            middleName: 'Alexander',
            lastName: 'Doe',
            birthDate: '1990-05-12',
            currency: 'USD',
            age: 35,
            status: 'ACTIVE',
            idType: 'Passport Number',
            passportNumber: 'P1234567',
            passportExpirationDate: '2030-01-01',
            icxContactNumber: 'ICX-5678',
            partnerCustomerNumber: 'PART-2001',
            language: 'en',
            signupOrigin: 'WEB',
            communicationPreference: 'EMAIL',
            segment: 'Retail',
            gender: 'MALE',
          },
        },
      },
    }),
  );
}

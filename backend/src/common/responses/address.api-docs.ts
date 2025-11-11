import { AddressUpdateRequestDto } from '@/modules/address/dto';
import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { commonErrorResponses } from './common.api-docs';
import { AddressCreateRequestDto } from '@/modules/address/dto/address.create.dto';

export function GetAddressApiResponse() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Retrieved address successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – No address found for the given criteria',
    }),
  );
}
export function PatchAddressApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Address updated successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Address not found by ID',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request – Invalid data provided for updating address',
    }),
  );
}
export function PostAddressApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Address updated successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Address not found by ID',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request – Invalid data provided for updating address',
    }),
  );
}
export function PostAddressApiBody() {
  return applyDecorators(
    ApiBody({
      type: AddressCreateRequestDto,
      description: 'Create a address',
      examples: {
        billing: {
          summary: 'Create BILLING Address',
          value: {
            name: 'Head Office',
            province: 'Telangana',
            city: 'Hyderabad',
            street: 'Hitech City, Madhapur',
            postalCode: '500081',
            country: 'India',
            addressType: 'BILLING',
            icxAddressNumber: 'ADDR-001',
            isDefault: true,
            isPrimary: true,
            accountId: 'cuid1234567890abcdef12345678',
          },
        },
        shipping: {
          summary: 'Create SHIPPING Address',
          value: {
            name: 'Warehouse',
            province: 'Telangana',
            city: 'Hyderabad',
            street: 'Kukatpally Industrial Area',
            postalCode: '500072',
            country: 'India',
            addressType: 'SHIPPING',
            icxAddressNumber: 'ADDR-002',
            isDefault: false,
            isPrimary: false,
            accountId: 'cuid1234567890abcdef12345678',
          },
        },
      },
    }),
  );
}

export function PatchAddressApiBody() {
  return applyDecorators(
    ApiBody({
      type: AddressUpdateRequestDto,
      examples: {
        example: {
          summary: 'Update Address Example',
          value: {
            name: 'Headquarters - Updated',
            city: 'Vancouver',
            street: '456 King Street West',
            province: 'India',
            postalCode: 'V6B 1E1',
            isDefault: false,
            isPrimary: true,
            addressType: 'BILLING',
          },
        },
      },
    }),
  );
}

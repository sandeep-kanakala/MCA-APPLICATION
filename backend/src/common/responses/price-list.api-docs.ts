import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { commonErrorResponses } from './common.api-docs';
import {
  CreatePriceListDto,
  CreatePriceListEntryDto,
  UpdatePriceListDto,
  UpdatePriceListEntryDto,
} from '@/modules/pricelist/dto';

export function CreatePriceListApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 201,
      description: 'Created – PriceList created successfully',
    }),
    ApiResponse({
      status: 400,
      description:
        'Bad Request – Invalid data provided for creating a priceList',
    }),
  );
}

export function GetPriceListsApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Retrieved list of priceLists successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – No priceLists found',
    }),
  );
}

export function GetPriceListByIdApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Retrieved priceList by ID successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – PriceList not found by ID',
    }),
  );
}

export function UpdatePriceListApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – PriceList updated successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – PriceList not found by ID',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request – Invalid data provided for updating priceList',
    }),
  );
}

export function DeletePriceListApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 204,
      description: 'No Content – PriceList deleted successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – PriceList not found by ID',
    }),
  );
}

export function CreatePriceListEntryApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 201,
      description: 'Created – PriceList entry created successfully',
    }),
    ApiResponse({
      status: 400,
      description:
        'Bad Request – Invalid data provided for creating a priceList entry',
    }),
  );
}

export function UpdatePriceListEntryApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – PriceList entry updated successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – PriceList entry not found by ID',
    }),
    ApiResponse({
      status: 400,
      description:
        'Bad Request – Invalid data provided for updating priceList entry',
    }),
  );
}

export function GetPriceListEntryByIdApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Retrieved priceList entry by ID successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – PriceList entry not found by ID',
    }),
  );
}

export function DeletePriceListEntryApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 204,
      description: 'No Content – PriceList entry deleted successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – PriceList entry not found by ID',
    }),
  );
}

export function CreatePriceListApiBody() {
  return ApiBody({
    type: CreatePriceListDto,
    examples: {
      example: {
        value: {
          name: 'Corporate Account',
          description: 'Primary account for corporate clients',
          code: 'CORP-001',
          currencyCode: 'USD',
          country: 'USA',
          accountType: 'Premium',
          accountId: 'acc_123456789',
          noofEntries: 5,
          effectiveFrom: '2025-11-02T00:00:00.000Z',
          effectiveTo: '2030-11-02T23:59:59.000Z',
          isTaxable: true,
        },
      },
    },
  });
}

export function UpdatePriceListApiBody() {
  return ApiBody({
    type: UpdatePriceListDto,
    examples: {
      example: {
        value: {
          name: 'Updated PriceList',
          description: 'Updated description for price list',
        },
      },
    },
  });
}

export function CreatePriceListEntryApiBody() {
  return ApiBody({
    type: CreatePriceListEntryDto,
    examples: {
      example: {
        value: {
          name: 'Premium Subscription',
          description: 'Monthly premium plan for enterprise users',
          productId: 'prod_987654321',
          amount: 10,
          unitPrice: 100,
          discountPct: 10,
          billingFrequency: 'MONTHLY',
          currency: 'USD',
          effectiveFrom: '2025-11-02T00:00:00.000Z',
          effectiveTo: '2026-11-01T23:59:59.000Z',
          priceBookEntryId: 'pbe_123456789',
        },
      },
    },
  });
}

// Update PriceList Entry Body
export function UpdatePriceListEntryApiBody() {
  return ApiBody({
    type: UpdatePriceListEntryDto,
    examples: {
      example: {
        value: {
          price: 220,
          discount: 10,
        },
      },
    },
  });
}

// Query Parameters for PriceLists
export function PriceListApiQueries() {
  return applyDecorators(
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
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

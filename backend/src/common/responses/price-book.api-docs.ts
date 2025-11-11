import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { commonErrorResponses } from './common.api-docs';
import {
  CreatePriceBookDto,
  CreatePriceBookEntryDto,
  UpdatePriceBookDto,
  UpdatePriceBookEntryDto,
} from '@/modules/pricebook/dto';

export function CreatePriceBookApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 201,
      description: 'Created – Pricebook created successfully',
    }),
    ApiResponse({
      status: 400,
      description:
        'Bad Request – Invalid data provided for creating a pricebook',
    }),
  );
}

export function GetPriceBooksApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Retrieved list of pricebooks successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – No pricebooks found',
    }),
  );
}

export function GetPriceBookByIdApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Retrieved pricebook by ID successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Pricebook not found by ID',
    }),
  );
}

export function UpdatePriceBookApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Pricebook updated successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Pricebook not found by ID',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request – Invalid data provided for updating pricebook',
    }),
  );
}

export function DeletePriceBookApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 204,
      description: 'No Content – Pricebook deleted successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Pricebook not found by ID',
    }),
  );
}

export function CreatePriceBookEntryApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 201,
      description: 'Created – Pricebook entry created successfully',
    }),
    ApiResponse({
      status: 400,
      description:
        'Bad Request – Invalid data provided for creating a pricebook entry',
    }),
  );
}

export function UpdatePriceBookEntryApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Pricebook entry updated successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Pricebook entry not found by ID',
    }),
    ApiResponse({
      status: 400,
      description:
        'Bad Request – Invalid data provided for updating pricebook entry',
    }),
  );
}

export function GetPriceBookEntryByIdApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Retrieved pricebook entry by ID successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Pricebook entry not found by ID',
    }),
  );
}

export function DeletePriceBookEntryApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 204,
      description: 'No Content – Pricebook entry deleted successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Pricebook entry not found by ID',
    }),
  );
}

export function CreatePriceBookApiBody() {
  return ApiBody({
    type: CreatePriceBookDto,
    examples: {
      example: {
        value: {
          name: 'New PriceBook',
          description: 'A special pricebook for discounts',
        },
      },
    },
  });
}

export function UpdatePriceBookApiBody() {
  return ApiBody({
    type: UpdatePriceBookDto,
    examples: {
      example: {
        value: {
          name: 'Updated PriceBook',
          description: 'Updated description for pricebook',
        },
      },
    },
  });
}

export function CreatePriceBookEntryApiBody() {
  return ApiBody({
    type: CreatePriceBookEntryDto,
    examples: {
      example: {
        value: {
          productId: 'prod_123456789',
          unitPrice: 49.99,
          currencyCode: 'USD',
        },
      },
    },
  });
}

export function UpdatePriceBookEntryApiBody() {
  return ApiBody({
    type: UpdatePriceBookEntryDto,
    examples: {
      example: {
        value: {
          price: 120,
          discount: 15,
        },
      },
    },
  });
}

export function PriceBookApiQueries() {
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
      name: 'type',
      required: false,
      type: String,
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

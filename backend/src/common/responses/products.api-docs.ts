import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { commonErrorResponses } from './common.api-docs';
import {
  createProductBundleDto,
  CreateProductDto,
  UpdateProductDto,
} from '@/modules/product/dto';

export function GetProductApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Retrieved Product(s) successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request – Invalid filter Data',
    }),
  );
}

export function GetProductByIdApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Retrieved product by ID successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request – Invalid product ID format',
    }),
    ApiResponse({
      status: 403,
      description:
        'Forbidden – You do not have permission to view this product',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Product not found by ID',
    }),
  );
}

export function PostProductApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 201,
      description: 'Created – Product created successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request – Invalid data provided for creating a product',
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden – You do not have permission to create a product',
    }),
  );
}

export function PatchProductApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Product updated successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request – Invalid data provided for updating product',
    }),
    ApiResponse({
      status: 403,
      description:
        'Forbidden – You do not have permission to update this product',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Product not found',
    }),
  );
}

export function DeleteProductApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Product deleted successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request – Invalid product ID or data',
    }),
    ApiResponse({
      status: 403,
      description:
        'Forbidden – You do not have permission to delete this product',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Product not found',
    }),
  );
}

export function ProductApiQueries() {
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
    ApiQuery({ name: 'type', required: false, type: String }),
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

export function ProductBundleApiQueries() {
  return applyDecorators(
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
  );
}

export function PostProductApiBody() {
  return applyDecorators(
    ApiBody({
      type: CreateProductDto,
      examples: {
        example: {
          value: {
            name: 'DSTV LIVE TV',
            productCode: 'MCDSe45',
            description: 'Full HD Live Channel',
            family: 'Streaming',
            type: 'GOOD',
            unitPrice: 1200,
            currencyCode: 'USD',
            isTaxable: true,
            isBundle: false,
            defaultBillingPeriod: 'MONTH',
            defaultTermMonths: 12,
          },
        },
      },
    }),
  );
}

export function PatchProductApiBody() {
  return applyDecorators(
    ApiBody({
      type: UpdateProductDto,
      examples: {
        example: {
          value: {
            name: 'DSTV LIVE TV - Updated',
            sku: 'MCDSe45',
            description: 'Updated Full HD Live Channel Description',
            family: 'Streaming',
            type: 'GOOD',
            unitPrice: 1100,
            currencyCode: 'USD',
            isTaxable: false,
            isBundle: false,
            defaultBillingPeriod: 'MONTH',
            defaultTermMonths: 12,
          },
        },
      },
    }),
  );
}

export function PostProductBundleApiBody() {
  return ApiBody({
    type: createProductBundleDto,
    examples: {
      example: {
        value: {
          name: 'Premium Bundle',
          description: 'A bundle of our top-tier products',
        },
      },
    },
  });
}

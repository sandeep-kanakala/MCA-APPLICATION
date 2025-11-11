import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { commonErrorResponses } from './common.api-docs';
import { CreateAssetDto, UpdateAssetDto } from '@/modules/asset/dto';

export function PostAssetApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 201,
      description: 'Created – Asset created successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Invalid asset request for creation',
    }),
    ApiResponse({
      status: 403,
      description: 'User lacks permission to create asset.',
    }),
  );
}

export function GetAssetApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Retrieved list of assets successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – No assets found',
    }),
  );
}

export function GetAssetByIdApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Retrieved asset by ID successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Asset not found by ID',
    }),
  );
}

export function PatchAssetApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Asset updated successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request – Invalid data provided for updating asset',
    }),
  );
}

export function DeleteAssetApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Asset deleted successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Asset not found by ID',
    }),
  );
}

export function AssetApiQueries() {
  return applyDecorators(
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({ name: 'isArchived', required: false, type: String }),
    ApiQuery({
      name: 'status',
      required: false,
      description: 'Filter by asset status',
    }),
    ApiQuery({
      name: 'accountId',
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
      description: 'Field to sort by',
    }),
    ApiQuery({
      name: 'sortOrder',
      required: false,
      type: String,
      example: 'desc',
      description: 'Sort order',
    }),
  );
}

export function PostAssetApiBody() {
  return applyDecorators(
    ApiBody({
      type: CreateAssetDto,
      examples: {
        example: {
          value: {
            accountId: 'cuid1234567890abcdef12345678',
            productId: 'cuidabcdef1234567890abcdef12',
            subscriptionId: 'cuidxyz9876543210abcdef65432',
            status: 'PROVISIONING',
            activatedAt: '2025-01-01T00:00:00.000Z',
            expiresAt: '2026-01-01T00:00:00.000Z',
          },
        },
      },
    }),
  );
}

export function PatchAssetApiBody() {
  return applyDecorators(
    ApiBody({
      type: UpdateAssetDto,
      examples: {
        example: {
          value: {
            subscriptionId: 'cuidxyz9876543210abcdef65432',
            status: 'ACTIVE',
            activatedAt: '2025-02-01T00:00:00.000Z',
            expiresAt: '2027-01-01T00:00:00.000Z',
          },
        },
      },
    }),
  );
}

import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { commonErrorResponses } from './common.api-docs';
import { UpdateBundleItemDto } from '@/modules/bundle-items/dto/bundle-items.dto';
import { CreateBundleItemDto } from '@/modules/bundle-items/dto';

export function PostBundleItemApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 201,
      description: 'Created – Bundle item created successfully',
    }),
    ApiResponse({
      status: 400,
      description:
        'Bad Request – Invalid data provided for creating bundle item',
    }),
    ApiResponse({
      status: 403,
      description:
        'Forbidden – User does not have permission to create bundle item',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Bundle not found',
    }),
  );
}

export function GetBundleItemApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Retrieved bundle item successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Bundle item not found',
    }),
  );
}

export function PatchBundleItemApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Bundle item updated successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Bundle item not found',
    }),
    ApiResponse({
      status: 400,
      description:
        'Bad Request – Invalid data provided for updating bundle item',
    }),
  );
}

export function DeleteBundleItemApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Bundle item deleted successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Bundle item not found',
    }),
  );
}

export function PostBundleItemApiBody() {
  return ApiBody({
    type: CreateBundleItemDto,
    examples: {
      example: {
        value: {
          name: 'bundle-item-name',
          productId: '123456',
          parentProductId: 'ccnugjuejnksmerent',
          quantity: 2,
          price: 100,
          minquantity: 1,
          maxquantity: 2,
          currency: 'USD',
          sequence: 1,
        },
      },
    },
  });
}

export function PatchBundleItemApiBody() {
  return ApiBody({
    type: UpdateBundleItemDto,
    examples: {
      example: {
        value: {
          productId: '123456',
          quantity: 3,
          price: 90,
        },
      },
    },
  });
}

export function BundleItemApiQueries() {
  return applyDecorators(
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
  );
}

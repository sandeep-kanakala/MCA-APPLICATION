import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { commonErrorResponses } from './common.api-docs';
import {
  OrderCreateRequestDto,
  OrderItemCreateRequestDto,
  OrderItemReplaceRequestDto,
  OrderUpdateRequestDto,
} from '@/modules/order/dto';

export function CreateOrderApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 201,
      description: 'Created – Order created successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request – Invalid data provided for creating an order',
    }),
  );
}

export function GetOrdersListApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Retrieved list of orders successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Orders not found',
    }),
  );
}

export function GetOrderByIdApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Retrieved order by ID successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Order not found by ID',
    }),
  );
}

export function UpdateOrderApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Order updated successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Order not found by ID',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request – Invalid data provided for updating order',
    }),
  );
}

export function CancelOrderApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'No Content – Order archived successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Order not found by ID',
    }),
  );
}

export function AddOrderItemsApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Order items added successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request – Invalid data provided for adding order items',
    }),
  );
}

export function GetOrderItemApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Retrieved order item by ID successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Order item not found by ID',
    }),
  );
}

export function UpdateOrderItemApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Order item updated successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Order item not found by ID',
    }),
    ApiResponse({
      status: 400,
      description:
        'Bad Request – Invalid data provided for updating order item',
    }),
  );
}

export function RemoveOrderItemApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'No Content – Order item removed successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Order item not found by ID',
    }),
  );
}

export function ReplaceOrderItemApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Order item replaced successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Order item not found by ID',
    }),
    ApiResponse({
      status: 400,
      description:
        'Bad Request – Invalid data provided for replacing order item',
    }),
  );
}

export function SubmitOrderApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Order submitted successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Order not found by ID',
    }),
  );
}

export function CreateOrderApiBody() {
  return ApiBody({
    type: OrderCreateRequestDto,
    examples: {
      example: {
        value: {
          customerId: '123456',
          billingAccountId: '987654',
          opportunityId: 'opportunityId123',
          quoteId: 'quoteId456',
          status: 'DRAFT',
          currencyCode: 'USD',
          originalOrderId: 'originalOrderId789',
        },
      },
    },
  });
}

export function UpdateOrderApiBody() {
  return ApiBody({
    type: OrderUpdateRequestDto,
    examples: {
      example: {
        value: {
          opportunityId: 'opportunityId123',
          quoteId: 'quoteId456',
          status: 'SHIPPED',
          totalAmount: 150.75,
          currencyCode: 'USD',
          originalOrderId: 'originalOrderId789',
        },
      },
    },
  });
}

export function AddOrderItemsApiBody() {
  return ApiBody({
    type: [OrderItemCreateRequestDto],
    examples: {
      example: {
        value: [
          {
            orderId: 'ckzhd2l8x0006abc123defgh9',
            priceBookEntryId: 'ckzhd2l8x0007abc123defgh9',
            quantity: 2,
            discount: 10.5,
            serviceStartAt: '2025-11-05T00:00:00.000Z',
            serviceEndAt: '2026-11-05T00:00:00.000Z',
            billingPeriod: 'MONTHLY',
            termMonths: 12,
            subscriptionId: 'ckzhd2l8x0008abc123defgh9',
            assetId: 'ckzhd2l8x0009abc123defgh9',
          },
          {
            orderId: 'ckzhd2l8x0010abc123defgh9',
            priceBookEntryId: 'ckzhd2l8x0011abc123defgh9',
            quantity: 1,
            discount: 0,
            billingPeriod: 'YEARLY',
            termMonths: 24,
          },
        ],
      },
    },
  });
}

export function ReplaceOrderItemApiBody() {
  return ApiBody({
    type: OrderItemReplaceRequestDto,
    examples: {
      example: {
        value: {
          orderItemId: '1',
          productId: 'P125',
          quantity: 3,
          price: 150,
        },
      },
    },
  });
}

export function OrderApiQueries() {
  return applyDecorators(
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 10 }),
    ApiQuery({ name: 'accountId', required: false, type: String }),
    ApiQuery({ name: 'status', required: false, type: String }),
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

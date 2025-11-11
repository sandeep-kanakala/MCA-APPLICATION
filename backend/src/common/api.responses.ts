import { applyDecorators } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

export function ApiCommonResponses() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'OK',
      schema: {
        example: {
          statusCode: 200,
          message: 'Success',
          data: {},
        },
      },
    }),
    ApiResponse({
      status: 201,
      description: 'Created',
      schema: {
        example: {
          statusCode: 201,
          message: 'Created',
          data: {},
        },
      },
    }),
    ApiResponse({
      status: 204,
      description: 'Request valid but no changes made.',
      schema: {
        example: {
          statusCode: 204,
          message: 'Success',
          data: {},
        },
      },
    }),
    ApiResponse({
      status: 202,
      description: 'Accepted for processing',
      schema: {
        example: {
          statusCode: 202,
          message: 'Accepted',
          data: {},
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request',
      schema: {
        example: {
          statusCode: 400,
          message: 'Bad Request',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
      schema: {
        example: {
          statusCode: 401,
          message: 'Unauthorized',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden',
      schema: {
        example: {
          statusCode: 403,
          message: 'Forbidden',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found',
      schema: {
        example: {
          statusCode: 404,
          message: 'Not Found',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: 409,
      description: 'Conflict',
      schema: {
        example: {
          statusCode: 409,
          message: 'Conflict',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error',
      schema: {
        example: {
          statusCode: 500,
          message: 'Internal Server Error',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: 503,
      description: 'Service Unavailable',
      schema: {
        example: {
          statusCode: 503,
          message: 'Service Unavailable',
          data: null,
        },
      },
    }),
    ApiResponse({
      status: 504,
      description: 'Gateway Timeout',
      schema: {
        example: {
          statusCode: 504,
          message: 'Gateway Timeout',
          data: null,
        },
      },
    }),
  );
}

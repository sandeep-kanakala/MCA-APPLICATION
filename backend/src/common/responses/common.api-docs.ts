import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

export const commonErrorResponses = [
  ApiResponse({
    status: 400,
    description: 'Bad Request - Validation failed or malformed request',
  }),
  ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication failed or missing',
  }),
  ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions',
  }),
  ApiResponse({
    status: 404,
    description: 'Not Found - Resource does not exist',
  }),
  ApiResponse({
    status: 409,
    description: 'Conflict - Resource already exists or version mismatch',
  }),
  ApiResponse({
    status: 429,
    description: 'Too Many Requests - Rate limit exceeded',
  }),
  ApiResponse({
    status: 500,
    description: 'Internal Server Error - Unexpected server failure',
  }),
  ApiResponse({
    status: 502,
    description: 'Bad Gateway - Invalid response from upstream',
  }),
  ApiResponse({
    status: 503,
    description: 'Service Unavailable - Server temporarily unavailable',
  }),
  ApiResponse({
    status: 504,
    description: 'Gateway Timeout - Upstream server did not respond in time',
  }),
];

// custome decorator for api response
export function ApiMethodDescription(summary: string, description?: string) {
  return applyDecorators(ApiOperation({ summary, description }));
}

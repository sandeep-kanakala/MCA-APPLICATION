import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiResponse,
  ApiOperation,
  ApiTags,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { commonErrorResponses } from './common.api-docs';

export function AssignPermissionsToRoleApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'Permissions assigned successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request – Invalid role or permissions data',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Role not found',
    }),
  );
}

export function GetPermissionsByRoleApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'Permissions retrieved successfully',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – Role not found',
    }),
  );
}

export function CreateRoleApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 201,
      description: 'Role created successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request – Invalid role data',
    }),
  );
}

export function CreatePermissionsApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 201,
      description: 'Permissions created successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request – Invalid permissions data',
    }),
  );
}

// Define request body decorators for the respective actions
export function AssignPermissionsToRoleApiBody() {
  return ApiBody({
    schema: {
      type: 'object',
      properties: {
        permissions: {
          type: 'array',
          items: { type: 'string' },
          example: [
            'can_create_user',
            'can_read_user',
            'can_update_user',
            'can_delete_user',
          ],
        },
      },
    },
  });
}

export function CreateRoleApiBody() {
  return ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: { type: 'string', example: 'ADMIN' },
      },
    },
    examples: {
      example1: {
        summary: 'Create Roles',
        description: 'Create default roles for the tenant',
        value: { role: 'ADMIN' },
      },
    },
  });
}

export function CreatePermissionsApiBody() {
  return ApiBody({
    schema: {
      type: 'object',
      properties: {
        permissions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'can_create_user' },
              subject: { type: 'string', example: 'User' },
            },
          },
          example: [{ name: 'can_read_user', subject: 'User' }],
        },
      },
    },
  });
}

// Define query parameters for GetPermissionsByRole
export function GetPermissionsByRoleApiQuery() {
  return applyDecorators(
    ApiQuery({
      name: 'roleName',
      required: true,
      type: String,
      example: 'ADMIN',
    }),
  );
}

// Apply the decorators in the PermissionsController
export function PermissionsApiDocs() {
  return applyDecorators(
    ApiTags('Permissions'),
    ApiBearerAuth('access-token'),
    ApiOperation({
      summary: 'Permissions Management',
      description: 'Manage roles and permissions within the application.',
    }),
  );
}

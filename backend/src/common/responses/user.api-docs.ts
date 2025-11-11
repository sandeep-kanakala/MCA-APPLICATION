import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { commonErrorResponses } from './common.api-docs';
import {
  UserRegisterRequestDto,
  UserUpdateRequestDto,
} from '@/modules/user/dto';

export function GetUserApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK > Retrieved user successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request – Invalid query parameters or filters',
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden – You do not have permission to view this user',
    }),
  );
}

export function PostUserApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 201,
      description: 'Created – User created successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request – Invalid data provided for user creation',
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden – You do not have permission to create a user',
    }),
  );
}

export function PatchUserApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – User updated successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request – Invalid data provided for updating user',
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden – You do not have permission to update this user',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – User not found',
    }),
  );
}

export function DeleteUserApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – User deleted successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request – Invalid user ID or data',
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden – You do not have permission to delete this user',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – User not found',
    }),
  );
}

export function GetUserByIdApiResponses() {
  return applyDecorators(
    ...commonErrorResponses,
    ApiResponse({
      status: 200,
      description: 'OK – Retrieved user by ID successfully',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request – Invalid user ID format',
    }),
    ApiResponse({
      status: 403,
      description: 'Forbidden – You do not have permission to view this user',
    }),
    ApiResponse({
      status: 404,
      description: 'Not Found – User not found by ID',
    }),
  );
}

export function UserApiQueries() {
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
      name: 'role',
      required: false,
      type: String,
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

export function PostUserApiBody() {
  return applyDecorators(
    ApiBody({
      type: UserRegisterRequestDto,
      examples: {
        example: {
          value: {
            firstName: 'John',
            lastName: 'Doe',
            middleName: 'Michael',
            phoneNo: '+911234567890',
            email: 'john.doe@example.com',
            password: 'StrongPassword@123',
            role: 'USER',
          },
        },
      },
    }),
  );
}

export function PatchUserApiBody() {
  return applyDecorators(
    ApiBody({
      type: UserUpdateRequestDto,
      examples: {
        example: {
          value: {
            firstName: 'John',
            lastName: 'Doe',
            middleName: 'Michael',
            phoneNo: '+911234567890',
          },
        },
      },
    }),
  );
}

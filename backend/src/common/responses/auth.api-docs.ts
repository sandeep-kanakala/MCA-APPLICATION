import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { commonErrorResponses } from './common.api-docs';
import {
  ChangePasswordDto,
  ChangePasswordLoggedInDto,
  ForgotPasswordDto,
  LoginDto,
  ValidateOtpDto,
} from '@/modules/auth/dto';

export function PostSigninResponses() {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description: 'Created – User signed in successfully and token returned',
    }),
    ...commonErrorResponses,
  );
}

export function PostForgotPasswordResponses() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'OK – OTP sent to user email successfully',
    }),
    ...commonErrorResponses,
  );
}

export function PostValidateOtpResponses() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'OK – OTP validated successfully and reset token returned',
    }),
    ...commonErrorResponses,
  );
}

export function PostChangePasswordResponses() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'OK – Password changed successfully',
    }),
    ...commonErrorResponses,
  );
}

export function PostChangePasswordLoggedInResponses(): MethodDecorator &
  ClassDecorator {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: 'OK – Password changed successfully for a logged-in user',
    }),
    ...commonErrorResponses,
  );
}

export function GetMicrosoftLoginResponses(): MethodDecorator & ClassDecorator {
  return applyDecorators(
    ApiResponse({
      status: 302,
      description: 'Redirect to Microsoft login page',
    }),
    ...commonErrorResponses,
  );
}

export function GetMicrosoftRedirectResponses() {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description:
        'OK – Microsoft OAuth callback, returns authenticated user info',
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized – User cancelled consent or access denied',
    }),
    ...commonErrorResponses,
  );
}

export function SigninApiBody() {
  return ApiBody({
    type: LoginDto,
    examples: {
      example: {
        value: {
          email: 'admin@linkfields.com',
          password: 'Passw0rd!',
        },
      },
    },
  });
}

export function forgotPasswordApiBody() {
  return ApiBody({
    type: ForgotPasswordDto,
  });
}

export function validateOtpApiBody() {
  return ApiBody({
    type: ValidateOtpDto,
    examples: {
      example: {
        summary: 'sample',
        value: {
          email: 'user@example.com',
          otp: '123456',
        },
      },
    },
  });
}

export function changePasswordApiBody() {
  return ApiBody({
    type: ChangePasswordDto,
    examples: {
      example: {
        summary: 'sample',
        value: {
          email: 'user@example.com',
          password: 'Passw0rd@',
        },
      },
    },
  });
}

export function changePasswordLoggedInApiBody() {
  return ApiBody({
    type: ChangePasswordLoggedInDto,
    examples: {
      example: {
        summary: 'sample',
        value: {
          email: 'user@example.com',
          oldPassword: 'Passw0rd!',
          newPassword: 'Passw0rd@',
        },
      },
    },
  });
}

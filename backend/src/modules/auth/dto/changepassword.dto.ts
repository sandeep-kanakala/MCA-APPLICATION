import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export class ForgotPasswordDto extends createZodDto(ForgotPasswordSchema) {}

export const ValidateOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export class ValidateOtpDto extends createZodDto(ValidateOtpSchema) {}

export const ChangePasswordSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
      'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.',
    ),
});

export class ChangePasswordDto extends createZodDto(ChangePasswordSchema) {}

export const ChangePasswordLoggedInSchema = z.object({
  email: z.string().email(),
  oldPassword: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
      'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.',
    ),
  newPassword: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
      'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.',
    ),
});

export class ChangePasswordLoggedInDto extends createZodDto(
  ChangePasswordLoggedInSchema,
) {}

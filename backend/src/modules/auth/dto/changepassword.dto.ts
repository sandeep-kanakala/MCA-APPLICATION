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
  password: z.string().min(6),
});

export class ChangePasswordDto extends createZodDto(ChangePasswordSchema) {}

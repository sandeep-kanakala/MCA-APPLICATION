import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const SignUpSchema = z.object({
  email: z.string().email('Invalid Email Format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid Email Format'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export class SignupDto extends createZodDto(SignUpSchema) {}
export class LoginDto extends createZodDto(LoginSchema) {}

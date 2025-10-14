import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid Email Format'),
  password: z.string().min(8, 'Strong Password must be at least 8 characters long'),
});

export class LoginDto extends createZodDto(LoginSchema) {}

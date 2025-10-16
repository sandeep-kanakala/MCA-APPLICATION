import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid Email Format'),
  password: z.string(),
});

export class LoginDto extends createZodDto(LoginSchema) {}

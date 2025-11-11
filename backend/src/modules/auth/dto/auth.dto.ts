import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().trim().email('Invalid Email Format'),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
      'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.',
    ),
});

export class LoginDto extends createZodDto(LoginSchema) {}

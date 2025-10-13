import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

const UserRegisterRequestSchema = z.object({
  firstName: z.string().min(3, 'First name is required').max(20).optional(),
  middleName: z.string().optional(),
  lastName: z.string().min(3, 'Last name is required').max(20).optional(),
  phoneNo: z.string().optional(),
  role: z.enum(["USER", "SUPER_ADMIN", "ADMIN"]),
});

export class UserUpdateRequest extends createZodDto(
  UserRegisterRequestSchema,
) {}
export type UserUpdateRequestDto = z.infer<typeof UserRegisterRequestSchema>;
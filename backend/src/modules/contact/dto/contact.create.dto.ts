import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';

const ContactCreateRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?\d{1,4}[1-9]\d{9,14}$/, 'Invalid phone number'),
  firstName: z
    .string()
    .regex(/^[A-Za-z]+$/, 'First Name should only contain alphabets')
    .min(3, 'First Name should have at least 3 characters')
    .max(20, 'First Name should be no more than 20 characters'),
  lastName: z
    .string()
    .regex(/^[A-Za-z]+$/, 'Last Name should only contain alphabets')
    .min(3, 'Last Name should have at least 3 characters')
    .max(20, 'Last Name should be no more than 20 characters'),
  middleName: z
    .string()
    .regex(/^[A-Za-z]+$/, 'Middle Name should only contain alphabets')
    .min(3, 'Middle Name should have at least 3 characters')
    .max(20, 'Middle Name should be no more than 20 characters')
    .optional(),
  accountId: z.string().optional(),
  title: z.string().optional(),
});

export class ContactCreateRequestDto extends createZodDto(
  ContactCreateRequestSchema,
) {}

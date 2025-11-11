import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { EAddressType } from '@/utils/enum';

export const AddressCreateRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .regex(/^[A-Za-z\s]+$/, 'Name should only contain alphabets and spaces')
    .min(2, 'Name must have at least 2 characters')
    .max(50, 'Name must not exceed 50 characters'),

  province: z
    .string()
    .trim()
    .regex(/^[A-Za-z\s]+$/, 'Province should only contain letters and spaces')
    .min(2, 'Province must be at least 2 characters')
    .max(50, 'Province must be no more than 50 characters'),

  city: z
    .string()
    .trim()
    .regex(/^[A-Za-z\s]+$/, 'City should only contain letters and spaces')
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City must be no more than 50 characters'),

  street: z
    .string()
    .trim()
    .min(3, 'Street must be at least 3 characters')
    .max(100, 'Street must be no more than 100 characters'),

  postalCode: z
    .string()
    .trim()
    .regex(/^[0-9A-Za-z\s-]{4,10}$/, 'Invalid postal code format'),

  country: z
    .string()
    .trim()
    .regex(/^[A-Za-z\s]+$/, 'Country should only contain letters and spaces')
    .min(2, 'Country must be at least 2 characters')
    .max(50, 'Country must be no more than 50 characters'),

  addressType: z.enum(EAddressType), // 'BILLING' | 'SHIPPING'

  icxAddressNumber: z.string().trim().min(1, 'ICX Address Number is required'),

  isDefault: z.boolean().optional(),
  isPrimary: z.boolean().optional(),
  accountId: z.string().cuid('Invalid account ID'),
});

export class AddressCreateRequestDto extends createZodDto(
  AddressCreateRequestSchema,
) {}

import { z } from 'zod';
import { createZodDto } from '@anatine/zod-nestjs';
import { EAddressType } from '@/utils/enum';

export const AddressUpdateRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Address name must have at least 3 characters')
    .max(100, 'Address name must not exceed 100 characters')
    .optional(),
  province: z.string().min(2).trim().max(100).optional(),
  city: z.string().trim().min(2).max(100).optional(),
  street: z.string().min(2).trim().max(200).optional(),
  postalCode: z.string().trim().min(3).max(20).optional(),
  country: z.string().min(2).trim().max(100).optional(),
  isDefault: z.boolean().optional(),
  isPrimary: z.boolean().optional(),
  addressType: z.enum(EAddressType).optional(),
  icxAddressNumber: z
    .string()
    .trim()
    .min(1, 'ICX Address Number is required')
    .optional(),
});

export class AddressUpdateRequestDto extends createZodDto(
  AddressUpdateRequestSchema,
) {}

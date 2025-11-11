import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const CreatePriceBookSchema = z.object({
  name: z.string().trim().min(3, 'Price Book name is required'),
  description: z.string().trim().optional(),
  type: z.enum(['STANDARD', 'CUSTOM']).default('CUSTOM'),
});

export const UpdatePriceBookSchema = z.object({
  name: z.string().trim().min(3, 'Price Book name is required').optional(),
  description: z.string().trim().optional(),
  type: z.enum(['STANDARD', 'CUSTOM']).default('CUSTOM').optional(),
});

export const CreatePriceBookEntrySchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  unitPrice: z
    .number()
    .min(0, 'Unit price must be at least 0')
    .max(
      Number.MAX_SAFE_INTEGER,
      `Unit price exceeds maximum allowed value: ${Number.MAX_SAFE_INTEGER}`,
    ),
  currencyCode: z
    .string()
    .trim()
    .regex(/^[A-Z]{3}$/, 'currencyCode must be a 3-letter ISO code')
    .min(1, 'Currency code is required')
    .max(3),
});

export const UpdatePriceBookEntrySchema = z.object({
  productId: z.string().min(1, 'Product ID is required').optional(),
  unitPrice: z
    .number()
    .min(0, 'Unit price must be at least 0')
    .max(
      Number.MAX_SAFE_INTEGER,
      `Unit price exceeds maximum allowed value: ${Number.MAX_SAFE_INTEGER}`,
    )
    .optional(),
  currencyCode: z
    .string()
    .trim()
    .regex(/^[A-Z]{3}$/, 'currencyCode must be a 3-letter ISO code')
    .min(1, 'Currency code is required')
    .max(3)
    .optional(),
});

export class CreatePriceBookDto extends createZodDto(CreatePriceBookSchema) {}
export class UpdatePriceBookDto extends createZodDto(UpdatePriceBookSchema) {}

export class CreatePriceBookEntryDto extends createZodDto(
  CreatePriceBookEntrySchema,
) {}
export class UpdatePriceBookEntryDto extends createZodDto(
  UpdatePriceBookEntrySchema,
) {}

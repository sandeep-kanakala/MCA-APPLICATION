import { createZodDto } from '@anatine/zod-nestjs';
import { isReadable } from 'stream';
import z from 'zod';

export const CreateBundleItemSchema = z.object({
  productId: z.string().cuid('Invalid Product ID'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  pricingMode: z.enum(['INHERIT', 'OVERRIDE', 'INCLUDED']).default('INHERIT'),
  overridePrice: z.number().optional(),
  isRequired: z.boolean().default(true),
});

export class CreateBundleItemDto extends createZodDto(CreateBundleItemSchema) {}
export class UpdateBundleItemDto extends createZodDto(
  CreateBundleItemSchema.partial(),
) {}

import { createZodDto } from '@anatine/zod-nestjs';
import { PricingMode } from '@prisma/client';
import z from 'zod';

export const CreateBundleItemSchema = z.object({
  productId: z.string().trim().cuid('Invalid Product ID'),
  parentProductId: z.string().trim().cuid('Invalid Parent Product ID'),
  name: z.string().trim().min(3, 'Name must have at least 2 characters'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
  minquantity: z.number().int().min(0, 'Minimum quantity must be >= 0'),
  maxquantity: z.number().int().min(1, 'Maximum quantity must be >= 1'),
  currency: z
    .string()
    .trim()
    .min(1, 'Currency is required')
    .max(3, 'Currency code must be max 3 characters'),
  sequence: z.number().int().min(0, 'Sequence must be >= 0'),
  createdById: z.string().trim().cuid('Invalid Created By ID').optional(),
  updatedById: z.string().trim().cuid('Invalid Updated By ID').optional(),
});

export class CreateBundleItemDto extends createZodDto(CreateBundleItemSchema) {}
export class UpdateBundleItemDto extends createZodDto(
  CreateBundleItemSchema.partial(),
) {}

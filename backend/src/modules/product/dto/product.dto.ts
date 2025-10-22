import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1).optional(),
  description: z.string().optional(),
  family: z.string().optional(),
  type: z.enum(['GOOD', 'SERVICE', 'SUBSCRIPTION']),
  unitPrice: z.number().min(0).optional(),
  currencyCode: z.string().length(3).optional(),
  isTaxable: z.boolean().optional(),
  isBundle: z.boolean().default(false).optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();

export class CreateProductDto extends createZodDto(CreateProductSchema) {}
export class UpdateProductDto extends createZodDto(UpdateProductSchema) {}

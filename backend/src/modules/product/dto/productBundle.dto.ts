import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

export const CreateProductBundleSchema = z.object({
  name: z.string().trim().min(1, 'Product Bundle name is required'),
  description: z.string().trim().optional(),
});

export class createProductBundleDto extends createZodDto(
  CreateProductBundleSchema,
) {}

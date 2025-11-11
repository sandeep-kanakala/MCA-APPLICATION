import { EBillingModel, EProductStatus } from '@/utils/enum';
import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

// export const ProductStatusEnum = z.enum(EProductStatus);
// export const BillingModelEnum = z.enum(EBillingModel).optional();
export const CreateProductSchema = z
  .object({
    name: z.string().trim().min(3, 'Product name is required'),
    commercialName: z.string().trim().optional(),
    productCode: z.string().trim().min(3, 'Product code is required'),
    description: z.string().trim().optional(),
    family: z.string().trim().optional(),
    subFamily: z.string().trim().optional(),
    category: z.string().trim().optional(),
    isActive: z.boolean().optional().default(true),
    status: z.enum(EProductStatus).default('ACTIVE'),
    isOrderable: z.boolean().optional().default(true),
    sellingStartDate: z.string().datetime().optional(),
    sellingEndDate: z.string().datetime().optional(),
    fulfilmentStartDate: z.string().datetime().optional(),
    endOfLifeDate: z.string().datetime().optional(),
    // unitPrice: z.number().min(0).optional(), // commented out in Prisma
    currencyCode: z
      .string()
      .trim()
      .regex(/^[A-Z]{3}$/, 'Currency code must be a 3-letter ISO code')
      .optional(),
    billingModel: z.enum(EBillingModel).optional(),
    commitmentDuration: z.number().int().min(0).optional(),
    billingFrequency: z.number().int().min(0).optional(),
    commitmentDurationUoM: z.string().trim().optional(),
    currency: z.string().trim().max(3).optional(),
    specificationType: z.string().trim().optional(),
    isBundle: z.boolean().optional().default(false),
    productSpecName: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      // If commitmentDuration is provided, commitmentDurationUoM should be required
      if (
        data.commitmentDuration !== undefined &&
        !data.commitmentDurationUoM
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        'commitmentDurationUoM is required when commitmentDuration is provided',
      path: ['commitmentDurationUoM'],
    },
  );
export const UpdateProductSchema = z
  .object({
    tenantId: z.string().trim().cuid('Invalid Tenant ID').optional(),
    name: z.string().trim().min(1, 'Product name is required').optional(),
    commercialName: z.string().trim().optional(),
    productCode: z
      .string()
      .trim()
      .min(1, 'Product code is required')
      .optional(),
    description: z.string().trim().optional(),
    family: z.string().trim().optional(),
    subFamily: z.string().trim().optional(),
    category: z.string().trim().optional(),
    isActive: z.boolean().optional(),
    status: z.enum(EProductStatus).optional(),
    isOrderable: z.boolean().optional(),
    sellingStartDate: z.string().datetime().optional(),
    sellingEndDate: z.string().datetime().optional(),
    fulfilmentStartDate: z.string().datetime().optional(),
    endOfLifeDate: z.string().datetime().optional(),
    // unitPrice: z.number().min(0).optional(), // not in model
    currencyCode: z
      .string()
      .trim()
      .regex(/^[A-Z]{3}$/, 'Currency code must be a 3-letter ISO code')
      .optional(),
    billingModel: z.enum(EBillingModel).optional(),
    commitmentDuration: z.number().int().min(0).optional(),
    billingFrequency: z.number().int().min(0).optional(),
    commitmentDurationUoM: z.string().trim().optional(),
    currency: z.string().trim().max(3).optional(),
    specificationType: z.string().trim().optional(),
    isBundle: z.boolean().optional(),
    productSpecName: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      if (
        data.commitmentDuration !== undefined &&
        !data.commitmentDurationUoM
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        'commitmentDurationUoM is required when commitmentDuration is provided',
      path: ['commitmentDurationUoM'],
    },
  );

export class CreateProductDto extends createZodDto(CreateProductSchema) {}
export class UpdateProductDto extends createZodDto(UpdateProductSchema) {}

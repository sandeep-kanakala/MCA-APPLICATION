import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';
import { AssetStatus } from '@prisma/client';

const BaseAssetSchema = z.object({
  accountId: z.string().trim().cuid('Invalid Account ID'),
  productId: z.string().trim().cuid('Invalid Product ID'),
  subscriptionId: z
    .string()
    .trim()
    .cuid('Invalid Subscription ID')
    .optional()
    .nullable(),
  status: z.nativeEnum(AssetStatus).default(AssetStatus.PROVISIONING),
  activatedAt: z.coerce.date().optional().nullable(),
  expiresAt: z.coerce.date().optional().nullable(),
});

export const CreateAssetSchema = BaseAssetSchema.required({
  accountId: true,
  productId: true,
  status: true,
});

export const UpdateAssetSchema = BaseAssetSchema.partial();

export class CreateAssetDto extends createZodDto(CreateAssetSchema) {}
export class UpdateAssetDto extends createZodDto(UpdateAssetSchema) {}

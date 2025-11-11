import { z } from 'zod';
import { Prisma, BillingPeriod } from '@prisma/client';
import { createZodDto } from '@anatine/zod-nestjs';

export const CreateOrderItemSchema = z.object({
  orderId: z.string().trim().cuid(),
  priceBookEntryId: z.string().trim().cuid(),
  quantity: z.coerce.number().int().positive().default(1),
  discount: z.coerce
    .number()
    .nonnegative()
    .default(0)
    .transform((val) => new Prisma.Decimal(val)),
  serviceStartAt: z.coerce.date().optional(),
  serviceEndAt: z.coerce.date().optional(),
  billingPeriod: z.nativeEnum(BillingPeriod).optional(),
  termMonths: z.coerce.number().int().positive().optional(),
  subscriptionId: z.string().trim().cuid().optional(),
  assetId: z.string().trim().cuid().optional(),
});

export class OrderItemCreateRequestDto extends createZodDto(
  CreateOrderItemSchema,
) {}

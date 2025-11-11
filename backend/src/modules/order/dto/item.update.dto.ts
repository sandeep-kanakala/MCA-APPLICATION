import { z } from 'zod';
import { Prisma, BillingPeriod, OrderItemAction } from '@prisma/client';
import { createZodDto } from '@anatine/zod-nestjs';

export const UpdateOrderItemSchema = z.object({
  quantity: z.coerce.number().int().positive().default(1).optional(),
  discount: z.coerce
    .number()
    .nonnegative()
    .default(0)
    .transform((val) => new Prisma.Decimal(val))
    .optional(),
  serviceStartAt: z.coerce.date().optional(),
  serviceEndAt: z.coerce.date().optional(),
  billingPeriod: z.nativeEnum(BillingPeriod).optional(),
  termMonths: z.coerce.number().int().positive().optional(),
  action: z.nativeEnum(OrderItemAction).optional(),
});

export class OrderItemUpdateRequestDto extends createZodDto(
  UpdateOrderItemSchema,
) {}

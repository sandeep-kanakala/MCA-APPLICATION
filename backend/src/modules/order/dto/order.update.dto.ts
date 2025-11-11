import { z } from 'zod';
import { OrderStatus, Prisma } from '@prisma/client';
import { createZodDto } from '@anatine/zod-nestjs';

export const UpdateOrderSchema = z.object({
  opportunityId: z.string().trim().cuid().optional(),
  quoteId: z.string().trim().cuid().optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  totalAmount: z.coerce
    .number()
    .nonnegative()
    .transform((val) => new Prisma.Decimal(val))
    .optional(),
  currencyCode: z
    .string()
    .trim()
    .regex(/^[A-Z]{3}$/, 'currencyCode must be a 3-letter ISO code')
    .optional(),
  originalOrderId: z.string().cuid().optional(),
});

export class OrderUpdateRequestDto extends createZodDto(UpdateOrderSchema) {}

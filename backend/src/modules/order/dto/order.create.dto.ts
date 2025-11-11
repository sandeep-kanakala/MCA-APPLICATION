import { z } from 'zod';
import { OrderStatus } from '@prisma/client';
import { createZodDto } from '@anatine/zod-nestjs';

export const CreateOrderSchema = z.object({
  customerId: z.string().trim().cuid('invalid customer ID'),
  billingAccountId: z
    .string()
    .trim()
    .cuid('invalid Partner/billing account ID'),
  opportunityId: z.string().trim().cuid('invalid Oppurtunity ID').optional(),
  quoteId: z.string().trim().cuid('invalid Quote ID').optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  currencyCode: z
    .string()
    .trim()
    .regex(/^[A-Z]{3}$/, 'currencyCode must be a 3-letter ISO code'),
  originalOrderId: z.string().cuid('invalid original order ID').optional(),
});

export class OrderCreateRequestDto extends createZodDto(CreateOrderSchema) {}

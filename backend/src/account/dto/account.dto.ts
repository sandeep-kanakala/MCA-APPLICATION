import { createZodDto } from '@anatine/zod-nestjs';
import { z } from 'zod';

// Common base fields for Account create/update
const BaseAccountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.string().max(64).nullish(),
  industry: z.string().max(64).nullish(),
  website: z.string().url().max(256).nullish(),
  phone: z.string().max(32).nullish(),

  billingStreet: z.string().max(256).nullish(),
  billingCity: z.string().max(128).nullish(),
  billingState: z.string().max(128).nullish(),
  billingPostal: z.string().max(32).nullish(),
  billingCountry: z.string().max(128).nullish(),

  shippingStreet: z.string().max(256).nullish(),
  shippingCity: z.string().max(128).nullish(),
  shippingState: z.string().max(128).nullish(),
  shippingPostal: z.string().max(32).nullish(),
  shippingCountry: z.string().max(128).nullish(),
});

export const CreateAccountSchema = BaseAccountSchema;
export const UpdateAccountSchema = BaseAccountSchema.partial();

export class CreateAccountDto extends createZodDto(CreateAccountSchema) {}
export class UpdateAccountDto extends createZodDto(UpdateAccountSchema) {}



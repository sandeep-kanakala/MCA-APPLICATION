import { z } from 'zod';

const optionalString = (minLength: number, message: string) => 
    z.string() 
      .trim() 
      .superRefine((val, ctx) => {
          if (val && val.length > 0 && val.length < minLength) {
              ctx.addIssue({ 
                  code: z.ZodIssueCode.too_small,
                  minimum: minLength,
                  type: 'string',
                  inclusive: true,
                  origin: 'string',
                  message: message,
              });
          }
      })
      .transform(e => e === "" ? undefined : e)
      .nullish(); 
export const accountSchema = z.object({
    name: z.string().min(2, { message: 'Account name must be at least 2 characters' }), 

    
   type: z.string({
    
    error: 'Account type is required', 
  }).min(2, { 
   
    message: 'Account type is required', 
  }),
    industry: optionalString(2, 'Industry must be at least 2 characters'),
    
    
    website: z.string().url('Invalid website URL').trim().transform(e => e === "" ? undefined : e).nullish(),
    phone: optionalString(10, 'Phone number must be at least 10 digits'),
  billingStreet: optionalString(2, 'Billing street must be at least 2 characters'),
  billingCity: optionalString(2, 'Billing city must be at least 2 characters'),
  billingState: optionalString(2, 'Billing state must be at least 2 characters'),
  billingPostal: optionalString(2, 'Billing postal code must be at least 2 characters'),
  billingCountry: optionalString(2, 'Billing country must be at least 2 characters'),
  shippingStreet: optionalString(2, 'Shipping street must be at least 2 characters'),
  shippingCity: optionalString(2, 'Shipping city must be at least 2 characters'),
  shippingState: optionalString(2, 'Shipping state must be at least 2 characters'),
  shippingPostal: optionalString(2, 'Shipping postal code must be at least 2 characters'),
  shippingCountry: optionalString(2, 'Shipping country must be at least 2 characters'),
});
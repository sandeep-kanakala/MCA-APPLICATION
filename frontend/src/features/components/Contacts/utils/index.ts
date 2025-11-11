import { z } from 'zod';
import type { FieldConfig } from '../../EntityFormComponent';

export const contactSchema = z.object({
  accountId: z
    .string()
    .optional()
    .refine((val) => !!val, { message: 'Account ID is required' }),
  email: z.email({ message: 'Invalid email address e.g., example@gmail.com' }),
  phone: z.string().regex(/^\+?\d{10,15}$/, {
    message: 'Mobile number must be 10 to 15 digits and start with a prefix, e.g., +27 ',
  }),
  firstName: z
    .string()
    .min(3, { message: 'First name must be at least 3 characters' })
    .max(49, { message: 'First name cannot exceed 49 characters' }),
  lastName: z
    .string()
    .min(3, { message: 'Last name must be at least 3 characters' })
    .max(49, { message: 'Last name cannot exceed 49 characters' }),
  title: z.string().nullable().optional(),
  description: z.string().optional(),
  account: z
    .object({
      name: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
});
export const titleOptions = [
  { label: 'Mr', value: 'Mr' },
  { label: 'Ms', value: 'Ms' },
  { label: 'Mrs', value: 'Mrs' },
  { label: 'Dr', value: 'Dr' },
  { label: 'Prof', value: 'Prof' },
];
export const CONTACT_FIELDS: FieldConfig[] = [
  {
    name: 'accountId',
    label: 'Account',
    type: 'select',
    required: true,
    disabled: (mode) => mode === 'edit',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'Enter email',
    required: true,
  },
  {
    name: 'phone',
    label: 'Phone',
    type: 'tel',
    placeholder: 'Enter phone number',
    required: true,
  },
  {
    name: 'firstName',
    label: 'First Name',
    type: 'text',
    placeholder: 'Enter first name',
    required: true,
  },
  {
    name: 'lastName',
    label: 'Last Name',
    type: 'text',
    placeholder: 'Enter last name',
    required: true,
  },
  {
    name: 'title',
    label: 'Title',
    type: 'select',
    options: titleOptions,
  },
];

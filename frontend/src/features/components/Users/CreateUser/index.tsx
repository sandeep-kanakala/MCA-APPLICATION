import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Save } from 'lucide-react';
import userService from '@/utils/services/user';
import { userCreateSchema } from '@/features/components/Users/utils';
import { userConstraints } from '@/utils/constraints';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import FormPageLayout from '@/features/components/form-layout';

type FormValues = z.infer<typeof userCreateSchema>;
const formatFieldName = (fieldName: string) => {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const getPlaceholder = (fieldName: keyof FormValues) => {
  let base = `Enter ${formatFieldName(fieldName).toLowerCase()}`;
  if (fieldName === 'phoneNo') return 'e.g., +911234567890';
  if (fieldName === 'email') return 'e.g., lead@example.com';
  if (fieldName === 'password') return 'Enter strong password';
  return base;
};

const getLabel = (fieldName: keyof FormValues) => {
  const label = formatFieldName(fieldName);
  const requiredFields = ['firstName', 'lastName', 'email', 'password', 'roles'];
  return requiredFields.includes(fieldName) ? `${label} *` : label;
};

const formFieldConfig: {
  name: keyof FormValues;
  type: 'text' | 'email' | 'password' | 'select' | 'tel';
  gridSpan?: 1 | 2;
}[] = Object.keys(userCreateSchema.shape).map((key) => {
  const name = key as keyof FormValues;
  let type: 'text' | 'email' | 'password' | 'select' | 'tel' = 'text';
  if (name === 'email') type = 'email';
  else if (name === 'password') type = 'password';
  else if (name === 'phoneNo') type = 'tel';
  else if (name === 'roles') type = 'select';
  return { name, type };
});

export default function CreateUserPage() {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(userCreateSchema),
  });

  const {
    formState: { isSubmitting },
    reset,
    control,
    watch,
    handleSubmit,
  } = form;

  const filledCount = Object.keys(userCreateSchema.shape).filter((key) => {
    const value = watch(key as keyof FormValues);
    return (
      value !== '' &&
      value !== null &&
      value !== undefined &&
      (Array.isArray(value) ? value.length > 0 : true)
    );
  }).length;
  const totalCount = Object.keys(userCreateSchema.shape).length;

  const apiSubmit = (formData: FormValues) => {
    setError(null);

    const payload: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      role: formData.roles[0] || 'USER',
      password: formData.password,
      ...(formData.middleName && { middleName: formData.middleName }),
      ...(formData.phoneNo && { phoneNo: formData.phoneNo }),
    };

    const apiPromise = userService
      .create(payload)
      .then((res: any) => {
        if (res && (res.id || res.email)) {
          reset();
          navigate('/setting/users');
          return { message: res.message || 'User created successfully' };
        } else {
          throw new Error(res.message || 'User creation failed');
        }
      })
      .catch((error: any) => {
        const message =
          error.response?.data?.message ||
          error.message ||
          'Failed to create user. Please try again.';
        setError(message);
        throw new Error(message);
      });

    toast.promise(apiPromise, {
      loading: 'Creating user...',
      success: (data) => data.message,
      error: (err) => err.message,
    });
  };

  const ActionArea = (
    <Button className="cursor-pointer" type="submit" disabled={isSubmitting}>
      <Save className="h-4 w-4 mr-2" />
      {isSubmitting ? 'Creating User...' : 'Save User'}
    </Button>
  );

  return (
    <Form {...form}>
      <FormPageLayout
        title="Add New User"
        cardTitle="Basic User Details"
        backPath="/setting/users"
        filledCount={filledCount}
        totalCount={totalCount}
        error={error}
        onSubmit={handleSubmit(apiSubmit)}
        actionArea={ActionArea}
      >
        {formFieldConfig.map((field) => (
          <FormField
            key={field.name}
            control={control}
            name={field.name}
            render={({ field: formField }) => {
              const isInput = field.type !== 'select';
              const value = isInput
                ? (formField.value ?? '')
                : Array.isArray(formField.value) && formField.value.length > 0
                  ? formField.value[0]
                  : '';

              if (field.type === 'select') {
                return (
                  <FormItem className={`space-y-2 ${field.gridSpan === 2 ? 'md:col-span-2' : ''}`}>
                    <Label htmlFor={field.name}>{getLabel(field.name)}</Label>
                    <FormControl>
                      <Select
                        onValueChange={(value) => formField.onChange([value])}
                        value={value as string}
                      >
                        <SelectTrigger className="w-full cursor-pointer">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          {userConstraints.selectOptions.roles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role.charAt(0) + role.slice(1).toLowerCase().replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }

              return (
                <FormItem className={`space-y-2 ${field.gridSpan === 2 ? 'md:col-span-2' : ''}`}>
                  <Label htmlFor={field.name}>{getLabel(field.name)}</Label>
                  <FormControl>
                    <div className="flex items-center w-full">
                      <Input
                        id={field.name}
                        type={field.type}
                        placeholder={getPlaceholder(field.name)}
                        {...formField}
                        value={value as string}
                        className={`focus-visible:ring-0 w-full`}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        ))}
      </FormPageLayout>
    </Form>
  );
}

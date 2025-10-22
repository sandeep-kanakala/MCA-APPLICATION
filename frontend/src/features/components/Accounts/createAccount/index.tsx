import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import DrawerDirections from '@/features/components/drawer-layout';
import { Plus } from 'lucide-react';
import { accountSchema } from '@/features/components/Accounts/utils/index';
import accountService from '@/utils/services/accounts';
import { toast } from '@/components/ui/sonner';

type FormValues = z.infer<typeof accountSchema>;

const schemaKeys = Object.keys(accountSchema.shape) as (keyof FormValues)[];

const selectOptions: Partial<Record<keyof FormValues, string[]>> = {
  industry: [
    'Information Technology',
    'Finance',
    'Healthcare',
    'Manufacturing',
    'Retail',
    'Education',
    'Real Estate',
    'Agriculture',
    'Software Development',
  ],
  type: [
    'Private Limited',
    'LLP',
    'Public Limited',
    'Partnership',
    'Customer',
    'Partner',
    'Vendor',
    'Distributor',
    'Supplier',
  ],
};

const getInputType = (key: string) => {
  if (key === 'phone') return 'tel';
  if (key.toLowerCase().includes('postal')) return 'text';
  if (key.toLowerCase().includes('website')) return 'url';
  return 'text';
};

interface AccountCreateProps {
  onAccountCreated: () => void;
}

const AccountCreate: React.FC<AccountCreateProps> = ({ onAccountCreated }) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      type: undefined,
      industry: undefined,
      website: undefined,
      phone: undefined,
      billingStreet: undefined,
      billingCity: undefined,
      billingState: undefined,
      billingPostal: undefined,
      billingCountry: undefined,
      shippingStreet: undefined,
      shippingCity: undefined,
      shippingState: undefined,
      shippingPostal: undefined,
      shippingCountry: undefined,
    },
  });

  const onSubmit = (formData: FormValues, onClose: () => void) => {
    setIsSubmitting(true);

    const filteredData = Object.fromEntries(
      Object.entries(formData).filter(
        ([_, value]) => value !== undefined && value !== '' && value !== 'none',
      ),
    );

    const apiPromise = accountService.create(filteredData).then((res: any) => {
      if (res.statusCode === 201) {
        reset();
        onClose();
        onAccountCreated();
        return res;
      } else {
        throw new Error(res.message || 'Account creation failed');
      }
    });

    apiPromise.finally(() => {
      setIsSubmitting(false);
    });

    toast.promise(apiPromise, {
      loading: 'Creating account...',
      success: (res: any) => res.message || '',
      error: (err) => err.message || 'Failed to create account',
    });
  };

  const handleDrawerSave = (onClose: () => void) => {
    handleSubmit((formData) => onSubmit(formData, onClose))();
  };

  return (
    <DrawerDirections
      title="Add New Account"
      description="Please fill in the details below. Only Account Name and Type are required."
      onActionClick={handleDrawerSave}
      isSubmitting={isSubmitting}
      actionButtonLabel={isSubmitting ? 'Saving...' : 'Save Account'}
      trigger={
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 bg-primary hover:bg-primary/90 text-white hover:text-white cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden lg:inline">Add Account</span>
        </Button>
      }
    >
      <form className="contents">
        {schemaKeys.map((key) => {
          const errorMsg = errors[key]?.message as string | undefined;
          const isSelect = !!selectOptions[key];
          const isRequired = key === 'name' || key === 'type' || key === 'website';

          return (
            <div key={key} className="flex flex-col space-y-2">
              <Label htmlFor={key}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </Label>

              {isSelect ? (
                <Select
                  onValueChange={(value) => {
                    if (key === 'type') {
                      setValue(key, value);
                    } else {
                      setValue(key, value === 'none' ? undefined : value);
                    }
                  }}
                  defaultValue={undefined}
                >
                  <SelectTrigger
                    id={key}
                    className={`w-full ${errorMsg ? 'border-red-500' : 'border-input'} focus-visible:ring-0`}
                  >
                    <SelectValue placeholder={`Select ${key}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {key !== 'type' && <SelectItem value="none">None</SelectItem>}
                    {selectOptions[key]?.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={key}
                  type={getInputType(key)}
                  placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}${isRequired ? '' : ' (optional)'}`}
                  {...register(key)}
                  className={`focus-visible:ring-0 ${errorMsg ? 'border-red-500' : 'border-input'}`}
                />
              )}

              {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
            </div>
          );
        })}
      </form>
    </DrawerDirections>
  );
};

export default AccountCreate;

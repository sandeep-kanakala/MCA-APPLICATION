// @/features/components/Users/CreateUser/index.tsx

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
import DrawerDirections from '@/features/components/drawer-layout';
import userService from '@/utils/services/user';
import { Plus } from 'lucide-react';
import { userCreateSchema, userRoles } from '@/features/components/Users/utils';
import { toast } from '@/components/ui/sonner';

type FormValues = z.infer<typeof userCreateSchema>;

interface RegisterUserProps {
  onUserAdded?: () => void;
}

export default function RegisterUser({ onUserAdded }: RegisterUserProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      email: '',
      phoneNo: '',
      password: '',
      role: 'USER',
    },
  });

  React.useEffect(() => {
    if (Object.keys(errors).length > 0) {
    }
  }, [errors]);

  const onSubmit = (formData: FormValues, onClose: () => void) => {
    setIsSubmitting(true);
    setError(null);
    
    const payload: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      role: formData.role,
      password: formData.password,
      ...(formData.middleName && { middleName: formData.middleName }),
      ...(formData.phoneNo && { phoneNo: formData.phoneNo }),
    };
    const apiPromise = userService.create(payload)
        .then((res: any) => {
           
            if (res.statusCode === 201) { 
               
                reset();
                onClose(); 
                if (onUserAdded) onUserAdded();
                
                
                return { message: res.message || '' };
            } else {
                
                throw new Error(res.message || 'User creation failed');
            }
        })
        .catch((error: any) => {
            throw new Error(error.response?.data?.message || 'Failed to create user. Please try again.');
        });
    
    
    apiPromise.finally(() => {
        setIsSubmitting(false);
    });

   
    toast.promise(apiPromise, {
        loading: 'Creating user...',
       
        success: (data: { message: string }) => data.message, 
        error: (err) => err.message,
    });
  };
  
 
  const handleDrawerSave = (onClose: () => void) => {
    handleSubmit((formData) => onSubmit(formData, onClose))();
  };

  
  const fields = Object.keys(userCreateSchema.shape).map((fieldName) => {
    const fieldSchema = userCreateSchema.shape[fieldName as keyof FormValues];
    const isRequired = fieldSchema 
      && 'isOptional' in fieldSchema 
      && typeof fieldSchema.isOptional === 'function' 
      ? !fieldSchema.isOptional() : false;
      
    return {
      name: fieldName as keyof FormValues,
      label: fieldName
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim() + (isRequired ? ' *' : ''),
      type:
        fieldName === 'email'
          ? 'email'
          : fieldName === 'password'
          ? 'password'
          : fieldName === 'role'
          ? 'select'
          : 'text',
      placeholder: `Enter ${fieldName
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .trim()}${fieldName === 'phoneNo' ? ' (e.g., 123-456-7890)' : ''}`,
    };
  });

  return (
    <DrawerDirections
      title="Add New User"
      description="Please fill in the details below."
     
      onActionClick={handleDrawerSave}
      isSubmitting={isSubmitting}
      actionButtonLabel={isSubmitting ? 'Creating...' : 'Save & Continue'}
      trigger={
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 bg-primary hover:bg-primary/90 text-white hover:text-white cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden lg:inline">Add User</span>
        </Button>
      }
    >
      <form className="contents"> 
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            {field.type === 'select' ? (
              <Select
                onValueChange={(value) =>
                  setValue(field.name, value as 'USER' | 'ADMIN' | 'SUPER_ADMIN')
                }
                defaultValue="USER"
              >
                 <SelectTrigger
                  id={field.name}
                  className={`w-full ${
                    errors[field.name] ? 'border-red-500' : 'border-input'
                  } focus-visible:ring-0`}
                >
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {userRoles.options.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0) + role.slice(1).toLowerCase().replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id={field.name}
                type={field.type}
                placeholder={field.placeholder}
                {...register(field.name)}
                className={`${
                  errors[field.name] ? 'border-red-500' : 'border-input'
                } focus-visible:ring-0`}
              />
            )}
            {errors[field.name] && (
              <p className="text-red-500 text-sm">{errors[field.name]?.message}</p>
            )}
          </div>
        ))}
      </form>
    </DrawerDirections>
  );
}
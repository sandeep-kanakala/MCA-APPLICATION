'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import DrawerDirections from '@/features/components/drawer-layout';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const formSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.email({ message: 'Invalid email format' }),
  role: z.string().min(1, { message: 'Role is required' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function DrawerDemo() {
  const [submittedData, setSubmittedData] = useState<FormValues | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: '',
    },
  });
  const onSubmit = (data: FormValues) => {
    setSubmittedData(data);
    alert('Form submitted successfully!'); //For testing Purpose.
    reset();
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-6">Right Drawer Example</h1>
        <p className="mb-4 text-gray-600">Click the button below to open the right drawer.</p>

        <DrawerDirections
          title="User Information"
          description="Please fill in the details below."
          onSave={handleSubmit(onSubmit)}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="contents">
            {/* First Name */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="Enter first name"
                {...register('firstName')}
                className={`${
                  errors.firstName ? 'border-red-500' : 'border-black'
                } focus-visible:ring-0`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm">{errors.firstName.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Enter last name"
                {...register('lastName')}
                className={`${
                  errors.lastName ? 'border-red-500' : 'border-black'
                } focus-visible:ring-0`}
              />
              {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
            </div>

            {/* Email */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email"
                {...register('email')}
                className={`${
                  errors.email ? 'border-red-500' : 'border-black'
                } focus-visible:ring-0`}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            {/* Role */}
            <div className="flex flex-col space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                placeholder="Enter role"
                {...register('role')}
                className={`${
                  errors.role ? 'border-red-500' : 'border-black'
                } focus-visible:ring-0`}
              />
              {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
            </div>
          </form>
        </DrawerDirections>
        {isSubmitSuccessful && (
          <p className="text-green-600 mt-4 font-medium">Form submitted successfully!</p>
        )}

        {submittedData && (
          <div className="mt-6 border rounded p-4 max-w-md mx-auto">
            <h2 className="text-lg font-bold mb-2">Submitted Data</h2>
            <p>
              <strong>First Name:</strong> {submittedData.firstName}
            </p>
            <p>
              <strong>Last Name:</strong> {submittedData.lastName}
            </p>
            <p>
              <strong>Email:</strong> {submittedData.email}
            </p>
            <p>
              <strong>Role:</strong> {submittedData.role}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

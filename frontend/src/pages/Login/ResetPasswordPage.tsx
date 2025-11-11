import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/components/ui/sonner';
import { changePassword } from '@/utils/services/login';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { getResetToken, clearResetToken } from '@/utils';

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(1, { message: 'New Password is required' })
      .min(8, { message: 'Password must be at least 8 characters' })
      .refine((v) => /[A-Z]/.test(v), { message: 'Must have uppercase letter' })
      .refine((v) => /[a-z]/.test(v), { message: 'Must have lowercase letter' })
      .refine((v) => /\d/.test(v), { message: 'Must have a number' })
      .refine((v) => /[!@#$%^&*(),.?":{}|<>]/.test(v), { message: 'Must have special char' }),
    confirmPassword: z.string().min(1, { message: 'Confirm Password is required' }),
  })
  .superRefine((data, ctx) => {
    if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      });
    }
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const resetToken = getResetToken();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, touchedFields },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onSubmit',
  });

  const passwordValue = watch('password');

  if (!email || !resetToken) {
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm md:max-w-md text-center">
          <h1 className="text-2xl font-bold">Invalid Request</h1>
          <p className="text-muted-foreground">
            Missing email or reset token. Please go back to the forgot password page and try again.
          </p>
          <Button onClick={() => navigate('/forgot-password')} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: PasswordForm) => {
    try {
      const response = await changePassword(email, data.password, resetToken);
      toast.success(response.message);
      clearResetToken();
      navigate('/');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const passwordRules = {
    length: passwordValue.length >= 8,
    uppercase: /[A-Z]/.test(passwordValue),
    lowercase: /[a-z]/.test(passwordValue),
    number: /\d/.test(passwordValue),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue),
  };

  const renderPasswordRules = () => {
    const rules = [
      { label: '8+ characters', valid: passwordRules.length },
      { label: 'At least 1 uppercase letter', valid: passwordRules.uppercase },
      { label: 'At least 1 lowercase letter', valid: passwordRules.lowercase },
      { label: 'At least 1 number', valid: passwordRules.number },
      { label: 'At least 1 special character', valid: passwordRules.special },
    ];

    return (
      <ul className="mt-2 text-sm ml-1 space-y-1">
        {rules.map((rule, idx) => {
          let icon, color;
          if (passwordValue.length === 0) {
            icon = '•';
            color = 'text-gray-500';
          } else if (rule.valid) {
            icon = '✔';
            color = 'text-green-500 font-medium';
          } else {
            icon = '✖';
            color = 'text-red-500 font-medium';
          }
          return (
            <li key={idx} className={`flex items-center gap-1 ${color}`}>
              <span>{icon}</span> {rule.label}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-md relative">
        <Card className="overflow-hidden p-0">
          <CardContent className="p-6 md:p-8 relative">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="absolute left-4 top-4 text-gray-600 hover:text-gray-900 transition"
              aria-label="Go back to Forgot Password"
            >
              <ArrowLeft className="w-5 h-5 cursor-pointer" />
            </button>

            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center mb-6 mt-2">
                <h1 className="text-2xl font-bold">Reset Password</h1>
                <p className="text-muted-foreground">Enter your new password for {email}</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                {/* New Password Field */}
                <Field className="mb-4">
                  <FieldLabel htmlFor="password">New Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your new password"
                      {...register('password')}
                      className={`h-12 text-base px-4 pr-10 ${
                        touchedFields.password && errors.password ? 'border-red-500' : ''
                      }`}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </span>
                  </div>
                  {renderPasswordRules()}
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                  )}
                </Field>

                {/* Confirm Password Field */}
                <Field className="mb-4">
                  <FieldLabel htmlFor="confirmPassword">Confirm New Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your new password"
                      {...register('confirmPassword')}
                      className={`h-12 text-base px-4 pr-10 ${
                        touchedFields.confirmPassword && errors.confirmPassword
                          ? 'border-red-500'
                          : ''
                      }`}
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </span>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                  )}
                </Field>

                {/* Submit Button */}
                <Field>
                  <Button type="submit" className="h-12 mt-2 w-full cursor-pointer">
                    Reset Password
                  </Button>
                </Field>
              </form>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

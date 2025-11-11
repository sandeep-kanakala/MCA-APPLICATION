'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/components/ui/sonner';
import { useCustomNavigate } from '@/app/hooks';
import { forgotPassword, validateOtp } from '@/utils/services/login';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { REGEXP_ONLY_DIGITS_AND_CHARS } from 'input-otp';
import { getResetToken } from '@/utils';
import { ArrowLeft } from 'lucide-react';

const emailSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Invalid email format' }),
});

type EmailForm = z.infer<typeof emailSchema>;

export default function ForgetPasswordPage() {
  const { navigate } = useCustomNavigate();
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const handleSendOtp = async (data: EmailForm) => {
    const normalizedEmail = data.email.toLowerCase().trim();
    try {
      const response = await forgotPassword(normalizedEmail);
      toast.success(response.message);
      setEmail(normalizedEmail);
      setOtpSent(true);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleValidateOtp = async () => {
    if (!otp || otp.length < 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }
    try {
      const response = await validateOtp(email, otp);
      toast.success(response.message);
      if (getResetToken()) {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-md">
        <Card className="overflow-hidden p-0 relative">
          <button
            onClick={() => navigate('/')}
            className="absolute top-4 left-4 flex items-center gap-1 text-gray-600 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5 cursor-pointer" />
          </button>

          <CardContent className="p-6 md:p-8 mt-8">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center mb-4">
                <h1 className="text-2xl font-bold">Forgot Password</h1>
                <p className="text-muted-foreground">Enter your email to receive an OTP</p>
              </div>

              {/* Email Form */}
              <form onSubmit={handleSubmit(handleSendOtp)}>
                <Field className="mb-4">
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...register('email')}
                    className={`h-12 text-base px-4 ${otpSent ? 'cursor-not-allowed hover:bg-gray-100' : ''}`}
                    readOnly={otpSent}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                  )}
                </Field>

                {!otpSent && (
                  <Field>
                    <Button type="submit" className="h-12 mt-2 w-full cursor-pointer">
                      Send OTP
                    </Button>
                  </Field>
                )}
              </form>

              {/* OTP Section */}
              {otpSent && (
                <>
                  <Field className="mb-4">
                    <FieldLabel htmlFor="otp">OTP</FieldLabel>
                    <p className="text-center text-sm text-muted-foreground mb-3">
                      Please enter the OTP sent to <span className="font-medium">{email}</span>
                    </p>

                    <div className="w-full">
                      <InputOTP
                        id="otp"
                        maxLength={6}
                        pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                        onChange={(val: string) => setOtp(val)}
                        className="w-full"
                      >
                        <InputOTPGroup className="grid grid-cols-6 gap-3 w-full">
                          <InputOTPSlot index={0} className="h-12 text-lg rounded-md" />
                          <InputOTPSlot index={1} className="h-12 text-lg rounded-md" />
                          <InputOTPSlot index={2} className="h-12 text-lg rounded-md" />
                          <InputOTPSlot index={3} className="h-12 text-lg rounded-md" />
                          <InputOTPSlot index={4} className="h-12 text-lg rounded-md" />
                          <InputOTPSlot index={5} className="h-12 text-lg rounded-md" />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </Field>

                  <Field>
                    <Button
                      type="button"
                      className="h-12 mt-4 w-full cursor-pointer"
                      onClick={handleValidateOtp}
                    >
                      Verify OTP
                    </Button>
                  </Field>
                </>
              )}
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import Logo from '@/assets/MultiChoice_logo.svg';
import { useCustomNavigate } from '@/app/hooks';
import { loginUser, loginWithMicrosoft } from '@/utils/services/login';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/components/ui/sonner';
import RouteLink from '@/features/components/RouteLink';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email is required' })
    .email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { navigate } = useCustomNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginForm) => {
    const normalizedEmail = data.email.toLowerCase().trim();
    const loginPromise = loginUser(normalizedEmail, data.password).then((res) => {
      if (res.statusCode === 200) {
        navigate('/apps');
      }
      return res;
    });

    toast.promise(loginPromise, {
      loading: 'Logging in...',
      success: (res) => res.message ?? 'Welcome back!',
      error: (err) => err.message ?? 'Login failed',
    });
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden p-0">
            <CardContent className="grid p-0 md:grid-cols-2 items-stretch">
              <form
                className="p-6 md:p-8 h-full flex flex-col justify-center"
                onSubmit={handleSubmit(onSubmit)}
              >
                {/* REMOVE FIELDGROUP DEFAULT SPACING — USE CUSTOM GAP */}
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col items-center gap-2 text-center mb-2">
                    <h1 className="text-2xl font-bold">Welcome back</h1>
                    <p className="text-muted-foreground">Login to your account</p>
                  </div>

                  {/* EMAIL FIELD */}
                  <Field className="m-0">
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter Your Email"
                      {...register('email')}
                      className="h-12 text-base px-4 pr-10"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </Field>

                  {/* PASSWORD FIELD */}
                  <Field className="m-0">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter Your Password"
                        {...register('password')}
                        className="h-12 text-base px-4 pr-10"
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </span>
                    </div>

                    <p className="text-center text-sm mt-1 text-muted-foreground">
                      Don't remember your password?{' '}
                      <RouteLink
                        href="/forgot-password"
                        className="text-primary font-medium hover:underline"
                      >
                        Forgot Password?
                      </RouteLink>
                    </p>
                  </Field>

                  {/* LOGIN BUTTON — REDUCE SPACE */}
                  <Button type="submit" className="cursor-pointer h-12 w-full mt-1">
                    Login
                  </Button>

                  {/* OR SEPARATOR — ZERO EXTRA SPACE */}
                  <div className="flex items-center gap-2 -mt-1">
                    <div className="flex-1 border-t" />
                    <span className="text-xs text-muted-foreground">OR</span>
                    <div className="flex-1 border-t" />
                  </div>

                  {/* MICROSOFT BUTTON — NO EXTRA MARGINS */}
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer h-12 w-full flex items-center justify-center gap-2"
                    onClick={loginWithMicrosoft}
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg"
                      alt="Microsoft Logo"
                      className="h-5"
                    />
                    Login with Microsoft
                  </Button>
                </div>
              </form>

              <div className="bg-muted relative hidden md:flex items-center justify-center h-full">
                <img
                  src={Logo}
                  alt="Company Logo"
                  className="max-w-[80%] max-h-[60%] object-contain"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

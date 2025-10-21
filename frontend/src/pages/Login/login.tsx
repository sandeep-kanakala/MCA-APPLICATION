import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff } from 'lucide-react';
import Logo from '@/assets/MultiChoice_logo.svg';
import { useCustomNavigate } from '@/app/hooks';
import { loginUser } from '@/utils/services/login';
import '@/index.css';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from '@/components/ui/sonner';

const loginSchema = z.object({
  email: z.email({ message: 'Invalid email format' }),
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
    toast.promise(
      loginUser(data.email, data.password).then((res) => {
        if (res.statusCode === 200) {
          navigate('/apps');
        } else {
          throw new Error(res.message || res.response.message);
        }
        return res;
      }),
      {
        loading: 'Logging in...',
        success: (res) => res.message,
        error: 'Login failed',
      },
    );
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
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center mb-4">
                    <h1 className="text-2xl font-bold">Welcome back</h1>
                    <p className="text-muted-foreground">Login to your account</p>
                  </div>

                  {/* EMAIL FIELD */}
                  <Field>
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
                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                    </div>
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </span>
                    </div>
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                    )}
                  </Field>

                  {/* LOGIN BUTTON */}
                  <Field>
                    <Button type="submit" className="cursor-pointer h-12 mt-2">
                      Login
                    </Button>
                  </Field>
                </FieldGroup>
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

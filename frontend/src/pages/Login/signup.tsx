import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Logo from "@/assets/MultiChoice_logo.svg"
import { Link } from "react-router"
import { AppleIcon, GoogleIcon, MetaIcon } from "@/assets/CustomIcons"

export default function SignupPage() {
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-4 md:p-10">
            <div className="w-full max-w-sm md:max-w-4xl">
                <div className={cn("flex flex-col gap-6")}>
                    <Card className="overflow-hidden p-0">
                        <CardContent className="grid p-0 md:grid-cols-2">
                            <form className="p-6 md:p-8">
                                <FieldGroup>
                                    <div className="flex flex-col items-center gap-2 text-center">
                                        <h1 className="text-2xl font-bold">Create your account</h1>
                                        <p className="text-muted-foreground text-sm text-balance">
                                            Enter your details below to create your account
                                        </p>
                                    </div>

                                    <Field>
                                        <FieldLabel htmlFor="email">Email</FieldLabel>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter Your Email"
                                            required
                                        />
                                        <FieldDescription>
                                            We'll use this to contact you. We will not share your email with anyone else.
                                        </FieldDescription>
                                    </Field>

                                    <Field className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <FieldLabel htmlFor="password">Password</FieldLabel>
                                            <Input id="password" type="password" placeholder="Enter Your Password" required />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                                            <Input id="confirmPassword" type="password" placeholder="Re-enter Password" required />
                                        </Field>
                                    </Field>
                                    <FieldDescription>
                                        Must be at least 8 characters long.
                                    </FieldDescription>

                                    <Field>
                                        <Button type="submit">Create Account</Button>
                                    </Field>

                                    <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                                        Or continue with
                                    </FieldSeparator>

                                    <Field className="grid grid-cols-3 gap-4">
                                        <Button variant="outline" type="button">
                                            <AppleIcon />
                                            <span className="sr-only">Login with Apple</span>
                                        </Button>

                                        <Button variant="outline" type="button">
                                            <GoogleIcon />
                                            <span className="sr-only">Login with Google</span>
                                        </Button>

                                        <Button variant="outline" type="button">
                                            <MetaIcon />
                                            <span className="sr-only">Login with Meta</span>
                                        </Button>
                                    </Field>
                                    <FieldDescription className="text-center">
                                        Already have an account?<Link to="/" className="underline underline-offset-4">Login</Link>
                                    </FieldDescription>
                                </FieldGroup>
                            </form>

                            <div className="bg-muted relative hidden md:flex items-center justify-center">
                                <img
                                    src={Logo}
                                    alt="Company Logo"
                                    className="max-w-[80%] max-h-[60%] object-contain"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <FieldDescription className="px-6 text-center">
                        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
                        and <a href="#">Privacy Policy</a>.
                    </FieldDescription>
                </div>
            </div>
        </div>
    );
}

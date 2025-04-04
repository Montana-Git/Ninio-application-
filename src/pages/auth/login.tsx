import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn } from "lucide-react";
import ErrorMessage from "@/components/ui/error-message";
import SuccessMessage from "@/components/ui/success-message";
import LoadingSpinner from "@/components/ui/loading-spinner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().optional().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate("/dashboard/admin");
      } else {
        navigate("/dashboard/parent");
      }
    }

    // Check if user just verified their email
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('verified') === 'true') {
      setVerificationSuccess(true);
    }
  }, [user, navigate]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setLoginError("");

    try {
      const { error } = await signIn(data.email, data.password);

      if (error) {
        // Handle different error types with more specific messages
        if (error.message?.includes("Email not confirmed")) {
          setLoginError("Please verify your email address before logging in. Check your inbox for a verification link.");
        } else if (error.message?.includes("Invalid login") || error.message?.includes("Invalid email") || error.message?.includes("Invalid password")) {
          setLoginError("Invalid email or password. Please try again.");
        } else if (error.message?.includes("rate limit") || error.message?.includes("too many requests")) {
          setLoginError("Too many login attempts. Please try again later.");
        } else if (error.message?.includes("network") || error.message?.includes("connection")) {
          setLoginError("Network error. Please check your internet connection and try again.");
        } else {
          setLoginError(error.message || "An error occurred during sign in. Please try again.");
        }
        console.error("Login error:", error);
        return; // Don't throw, we've handled the error
      }

      // Navigation will happen in the useEffect when user state updates
    } catch (error: any) {
      console.error("Unexpected login error:", error);
      setLoginError(error.message || "An unexpected error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">
            Ninio Kindergarten
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Please sign in to continue.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {verificationSuccess && (
              <SuccessMessage
                className="mb-6"
                title="Email Verified Successfully!"
                message="Your email has been verified. You can now sign in to your account."
              />
            )}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your.email@example.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            {...field}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-9 w-9"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center justify-between">
                  <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal cursor-pointer">
                          Remember me
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  <Link
                    to="/auth/forgot-password"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                {loginError && (
                  <ErrorMessage message={loginError} className="mb-4" />
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <LoadingSpinner size="sm" text="Signing in..." />
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" /> Sign In
                    </span>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/auth/register"
                className="font-medium text-primary hover:underline"
              >
                Register
              </Link>
            </p>
          </CardFooter>
        </Card>

        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-gray-600 hover:underline">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

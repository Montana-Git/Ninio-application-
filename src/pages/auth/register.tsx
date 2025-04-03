import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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

const registerSchema = z
  .object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: z.enum(["parent", "admin"]),
    childrenCount: z.number().min(0).max(10).optional(),
    childrenNames: z.array(z.string()).optional(),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) => {
      if (
        data.role === "parent" &&
        data.childrenCount &&
        data.childrenCount > 0
      ) {
        return (
          data.childrenNames &&
          data.childrenNames.length === data.childrenCount &&
          data.childrenNames.every((name) => name.trim().length > 0)
        );
      }
      return true;
    },
    {
      message: "Please provide all children names",
      path: ["childrenNames"],
    },
  );

type RegisterFormValues = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [childrenCount, setChildrenCount] = useState(0);
  const [childrenNames, setChildrenNames] = useState<string[]>([]);
  const [registerError, setRegisterError] = useState("");

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "parent",
      childrenCount: 0,
      childrenNames: [],
      termsAccepted: false,
    },
  });

  const { signUp } = useAuth();

  // Update children names array when count changes
  useEffect(() => {
    const newCount = form.getValues("childrenCount") || 0;
    const currentNames = form.getValues("childrenNames") || [];

    // Adjust the array size based on the new count
    if (newCount > currentNames.length) {
      // Add empty strings for new children
      const newNames = [
        ...currentNames,
        ...Array(newCount - currentNames.length).fill(""),
      ];
      form.setValue("childrenNames", newNames);
      setChildrenNames(newNames);
    } else if (newCount < currentNames.length) {
      // Remove extra names
      const newNames = currentNames.slice(0, newCount);
      form.setValue("childrenNames", newNames);
      setChildrenNames(newNames);
    }
  }, [childrenCount, form]);

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    setRegisterError("");
    try {
      // Only include children data if role is parent
      const childrenCount =
        data.role === "parent" ? data.childrenCount || 0 : 0;
      const childrenNames =
        data.role === "parent" ? data.childrenNames || [] : [];

      const { error } = await signUp(
        data.email,
        data.password,
        data.firstName,
        data.lastName,
        data.role,
        childrenCount,
        childrenNames,
      );

      if (error) {
        console.error("Registration error:", error);
        if (error.message) {
          setRegisterError(error.message);
        } else {
          setRegisterError("Registration failed. Please try again.");
        }
        return;
      }

      // Redirect to login page after successful registration
      // Add a small delay to allow the user to see the success message
      setTimeout(() => {
        window.location.href = "/auth/login";
      }, 1500);
    } catch (error: any) {
      console.error("Registration error:", error);
      setRegisterError(error?.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </div>

        <Card className="w-full">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {t("auth.register.title")}
            </CardTitle>
            <CardDescription className="text-center">
              {t("auth.register.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("auth.register.firstName")}</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("auth.register.lastName")}</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("auth.register.email")}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john.doe@example.com"
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
                      <FormLabel>{t("auth.register.password")}</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("auth.register.confirmPassword")}
                      </FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormLabel>{t("auth.register.role")}</FormLabel>
                  <div className="flex flex-col space-y-2">
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <input
                              type="radio"
                              checked={field.value === "parent"}
                              onChange={() => field.onChange("parent")}
                              className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {t("auth.register.roleParent")}
                          </FormLabel>
                        </div>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <div className="flex items-center space-x-2">
                          <FormControl>
                            <input
                              type="radio"
                              checked={field.value === "admin"}
                              onChange={() => field.onChange("admin")}
                              className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                            />
                          </FormControl>
                          <FormLabel className="font-normal cursor-pointer">
                            {t("auth.register.roleAdmin")}
                          </FormLabel>
                        </div>
                      )}
                    />
                  </div>
                </div>

                {form.watch("role") === "parent" && (
                  <FormField
                    control={form.control}
                    name="childrenCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("auth.register.childrenCount")}</FormLabel>
                        <FormControl>
                          <select
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            value={field.value}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              field.onChange(value);
                              setChildrenCount(value);
                            }}
                          >
                            <option value="0">No children</option>
                            <option value="1">1 child</option>
                            <option value="2">2 children</option>
                            <option value="3">3 children</option>
                            <option value="4">4 children</option>
                            <option value="5">5 children</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {form.watch("role") === "parent" &&
                  form.watch("childrenCount") > 0 &&
                  childrenNames.map((_, index) => (
                    <FormField
                      key={index}
                      control={form.control}
                      name={`childrenNames.${index}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("auth.register.childName")} {index + 1}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={`Child ${index + 1} name`}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}

                <FormField
                  control={form.control}
                  name="termsAccepted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          {t("auth.register.termsAndConditions")}
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {registerError && (
                  <div className="text-red-500 text-sm">{registerError}</div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t("auth.register.submitting")}
                    </div>
                  ) : (
                    t("auth.register.submit")
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <div className="text-sm text-gray-600">
              {t("auth.register.alreadyHaveAccount")}{" "}
              <Link to="/auth/login" className="text-primary hover:underline">
                {t("auth.register.login")}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;

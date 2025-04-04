import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { usePayments } from "@/hooks/usePayments";
import { PaymentMethod, PaymentRequest } from "@/services/payment-gateway-service";

// Define payment form types
interface CreditCardPayment {
  paymentMethod: "credit_card";
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardholderName?: string;
}

interface BankTransferPayment {
  paymentMethod: "bank_transfer";
  accountName?: string;
  routingNumber?: string;
  accountNumber?: string;
}

interface PayPalPayment {
  paymentMethod: "paypal";
  email?: string;
}

interface CashPayment {
  paymentMethod: "cash";
  notes?: string;
}

type PaymentFormData = CreditCardPayment | BankTransferPayment | PayPalPayment | CashPayment;

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, CreditCard, Building, Wallet, AlertCircle, DollarSign } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PaymentFormProps {
  amount: number;
  description: string;
  childId?: string;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

/**
 * Reusable payment form component
 *
 * Provides a form for processing payments with different payment methods
 */
// Define validation schemas for different payment methods
const creditCardSchema = z.object({
  paymentMethod: z.literal("credit_card"),
  cardholderName: z.string().min(3, "Cardholder name is required"),
  cardNumber: z.string()
    .min(16, "Card number must be at least 16 digits")
    .max(19, "Card number must be at most 19 digits")
    .regex(/^[0-9\s]+$/, "Card number must contain only digits"),
  cardExpiry: z.string()
    .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Expiry date must be in MM/YY format")
    .refine((val) => {
      const [month, year] = val.split("/");
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      return expiry > new Date();
    }, "Card has expired"),
  cardCvv: z.string()
    .min(3, "CVV must be at least 3 digits")
    .max(4, "CVV must be at most 4 digits")
    .regex(/^[0-9]+$/, "CVV must contain only digits"),
});

const bankTransferSchema = z.object({
  paymentMethod: z.literal("bank_transfer"),
  accountName: z.string().min(3, "Account holder name is required"),
  routingNumber: z.string()
    .length(9, "Routing number must be 9 digits")
    .regex(/^[0-9]+$/, "Routing number must contain only digits"),
  accountNumber: z.string()
    .min(5, "Account number must be at least 5 digits")
    .max(17, "Account number must be at most 17 digits")
    .regex(/^[0-9]+$/, "Account number must contain only digits"),
});

const paypalSchema = z.object({
  paymentMethod: z.literal("paypal"),
});

const cashSchema = z.object({
  paymentMethod: z.literal("cash"),
  notes: z.string().optional(),
});

const paymentFormSchema = z.discriminatedUnion("paymentMethod", [
  creditCardSchema,
  bankTransferSchema,
  paypalSchema,
  cashSchema,
]);

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export function PaymentForm({
  amount,
  description,
  childId,
  onSuccess,
  onError,
  onCancel,
}: PaymentFormProps) {
  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit_card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Use the payments hook
  const { processPayment, isLoading, error } = usePayments();

  // Create form with validation
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(
      paymentMethod === "credit_card" ? creditCardSchema :
      paymentMethod === "bank_transfer" ? bankTransferSchema :
      paymentMethod === "cash" ? cashSchema :
      paypalSchema
    ),
    defaultValues: {
      paymentMethod: "credit_card",
      cardholderName: "",
      cardNumber: "",
      cardExpiry: "",
      cardCvv: "",
    } as PaymentFormValues,
    mode: "onChange",
  });

  // Update form validation schema when payment method changes
  useEffect(() => {
    form.setValue("paymentMethod", paymentMethod);
  }, [paymentMethod, form]);

  /**
   * Handle payment submission
   */
  const onSubmit = async (values: PaymentFormValues) => {
    setFormError(null);
    setIsProcessing(true);

    try {
      // Create payment request based on selected method
      const paymentRequest: Omit<PaymentRequest, "parentId"> = {
        amount,
        description,
        paymentMethod,
        childId,
        currency: "USD",
      };

      // Add method-specific fields
      if (paymentMethod === "credit_card" && "cardNumber" in values) {
        Object.assign(paymentRequest, {
          cardNumber: values.cardNumber.replace(/\s/g, ""),
          cardExpiry: values.cardExpiry,
          cardCvv: values.cardCvv,
          cardholderName: values.cardholderName,
        });
      } else if (paymentMethod === "bank_transfer" && "accountNumber" in values) {
        Object.assign(paymentRequest, {
          accountNumber: values.accountNumber,
          routingNumber: values.routingNumber,
          accountName: values.accountName,
        });
      } else if (paymentMethod === "cash" && "notes" in values) {
        Object.assign(paymentRequest, {
          notes: values.notes,
          metadata: {
            paymentType: "cash",
            requiresConfirmation: true
          }
        });
      }

      // Process the payment
      const { data, error } = await processPayment(paymentRequest);

      if (error) {
        setFormError(error);
        onError?.(error);
        return;
      }

      // Call success callback with transaction ID
      if (data?.transactionId) {
        onSuccess?.(data.transactionId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Payment processing failed";
      setFormError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Format credit card number with spaces
   */
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  /**
   * Format expiry date with slash
   */
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");

    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }

    return value;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
        <CardDescription>
          Complete your payment of ${amount.toFixed(2)} for {description}
        </CardDescription>
      </CardHeader>

      {formError && (
        <Alert variant="destructive" className="mx-6 mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CardContent className="space-y-4">
            {/* Payment Method Selection */}
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Select
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
              >
                <SelectTrigger id="payment-method">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">
                    <div className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Credit Card</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bank_transfer">
                    <div className="flex items-center">
                      <Building className="mr-2 h-4 w-4" />
                      <span>Bank Transfer</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="paypal">
                    <div className="flex items-center">
                      <Wallet className="mr-2 h-4 w-4" />
                      <span>PayPal</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="cash">
                    <div className="flex items-center">
                      <DollarSign className="mr-2 h-4 w-4" />
                      <span>Cash</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Credit Card Fields */}
            {paymentMethod === "credit_card" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="cardholderName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cardholder Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Smith"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="1234 5678 9012 3456"
                          {...field}
                          value={formatCardNumber(field.value)}
                          maxLength={19}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="cardExpiry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="MM/YY"
                            {...field}
                            value={formatExpiryDate(field.value)}
                            maxLength={5}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cardCvv"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVV</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123"
                            {...field}
                            value={field.value.replace(/\D/g, "")}
                            maxLength={4}
                            type="password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">Secure Payment</span>
                  </div>
                  <p className="mt-1 text-xs">Your card information is encrypted and securely processed.</p>
                </div>
              </div>
            )}

            {/* Bank Transfer Fields */}
            {paymentMethod === "bank_transfer" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="accountName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Holder Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Smith"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="routingNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Routing Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="123456789"
                          {...field}
                          value={field.value.replace(/\D/g, "")}
                          maxLength={9}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="1234567890"
                          {...field}
                          value={field.value.replace(/\D/g, "")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* PayPal Fields */}
            {paymentMethod === "paypal" && (
              <div className="p-4 text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  You will be redirected to PayPal to complete your payment.
                </p>
                <Wallet className="h-12 w-12 mx-auto text-blue-500" />
              </div>
            )}

            {/* Cash Payment Fields */}
            {paymentMethod === "cash" && (
              <div className="space-y-4">
                <div className="rounded-md bg-amber-50 p-4 text-amber-800">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-5 w-5 text-amber-600" />
                    <span className="font-medium">Cash Payment Instructions</span>
                  </div>
                  <p className="text-sm mb-2">
                    Your payment will be recorded as pending. Please bring the exact amount in cash to:
                  </p>
                  <ul className="text-sm list-disc pl-5 space-y-1">
                    <li>The school's front desk during office hours (8 AM - 5 PM)</li>
                    <li>Your child's teacher in a sealed envelope with your child's name</li>
                  </ul>
                  <p className="text-sm mt-2">You will receive a receipt once the payment is confirmed.</p>
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Any special instructions or notes"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isProcessing}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isProcessing || form.formState.isSubmitting}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay $${amount.toFixed(2)}`
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

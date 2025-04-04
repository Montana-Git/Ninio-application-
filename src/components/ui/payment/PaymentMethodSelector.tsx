import { PaymentMethod } from "@/services/payment-gateway-service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Building, Wallet } from "lucide-react";

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
  disabled?: boolean;
}

/**
 * Payment method selector component
 * 
 * Provides a dropdown for selecting payment methods
 */
export function PaymentMethodSelector({
  value,
  onChange,
  disabled = false,
}: PaymentMethodSelectorProps) {
  return (
    <Select
      value={value}
      onValueChange={(value) => onChange(value as PaymentMethod)}
      disabled={disabled}
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
      </SelectContent>
    </Select>
  );
}

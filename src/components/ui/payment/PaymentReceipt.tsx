import { useEffect, useState } from "react";
import { usePayments } from "@/hooks/usePayments";
import { ReceiptData } from "@/services/payment-gateway-service";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Loader2 
} from "lucide-react";

interface PaymentReceiptProps {
  transactionId: string;
  onClose?: () => void;
}

/**
 * Payment receipt component
 * 
 * Displays a receipt for a completed payment
 */
export function PaymentReceipt({ transactionId, onClose }: PaymentReceiptProps) {
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { getReceipt } = usePayments();
  
  // Fetch receipt data on component mount
  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const { data, error } = await getReceipt(transactionId);
        
        if (error) {
          setError(error);
        } else {
          setReceipt(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load receipt");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReceipt();
  }, [transactionId, getReceipt]);
  
  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
  /**
   * Get status icon based on payment status
   */
  const getStatusIcon = () => {
    if (!receipt) return null;
    
    switch (receipt.status) {
      case "paid":
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case "pending":
        return <Clock className="h-6 w-6 text-amber-500" />;
      case "failed":
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return null;
    }
  };
  
  /**
   * Get status text color based on payment status
   */
  const getStatusColor = () => {
    if (!receipt) return "";
    
    switch (receipt.status) {
      case "paid":
        return "text-green-600";
      case "pending":
        return "text-amber-600";
      case "failed":
        return "text-red-600";
      default:
        return "";
    }
  };
  
  /**
   * Handle print receipt
   */
  const handlePrint = () => {
    window.print();
  };
  
  /**
   * Handle download receipt as PDF
   * In a real implementation, this would generate a PDF file
   */
  const handleDownload = () => {
    // This is a placeholder for actual PDF generation
    alert("PDF download functionality would be implemented here");
  };
  
  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6 flex justify-center items-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-red-600">Error Loading Receipt</CardTitle>
          <CardDescription>
            We couldn't load the receipt for this transaction
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
        <CardFooter>
          <Button onClick={onClose}>Close</Button>
        </CardFooter>
      </Card>
    );
  }
  
  if (!receipt) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Receipt Not Found</CardTitle>
          <CardDescription>
            We couldn't find a receipt for this transaction
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={onClose}>Close</Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md mx-auto" id="payment-receipt">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Payment Receipt</CardTitle>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`font-medium ${getStatusColor()}`}>
              {receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}
            </span>
          </div>
        </div>
        <CardDescription>
          Transaction #{receipt.transactionId.substring(0, 8)}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex justify-between py-2">
          <span className="text-sm font-medium">Date</span>
          <span className="text-sm">{formatDate(receipt.date)}</span>
        </div>
        
        <Separator />
        
        <div className="flex justify-between py-2">
          <span className="text-sm font-medium">Amount</span>
          <span className="text-sm font-semibold">
            ${receipt.amount.toFixed(2)} {receipt.currency}
          </span>
        </div>
        
        <div className="flex justify-between py-2">
          <span className="text-sm font-medium">Description</span>
          <span className="text-sm">{receipt.description}</span>
        </div>
        
        <div className="flex justify-between py-2">
          <span className="text-sm font-medium">Payment Method</span>
          <span className="text-sm">{receipt.paymentMethod}</span>
        </div>
        
        <Separator />
        
        <div className="flex justify-between py-2">
          <span className="text-sm font-medium">Parent</span>
          <span className="text-sm">{receipt.parentName}</span>
        </div>
        
        {receipt.childName && (
          <div className="flex justify-between py-2">
            <span className="text-sm font-medium">Child</span>
            <span className="text-sm">{receipt.childName}</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
        
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </CardFooter>
    </Card>
  );
}

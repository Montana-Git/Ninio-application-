import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreditCard,
  Download,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  Receipt,
  DollarSign,
  FileText,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { getPayments, getParentPayments, addPayment } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

interface Payment {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  description: string;
  method?: string;
  receiptUrl?: string;
}

interface DuePayment {
  id: string;
  dueDate: string;
  amount: number;
  description: string;
  daysOverdue?: number;
  category?: string;
}

interface PaymentSectionProps {
  paymentHistory?: Payment[];
  duePayments?: DuePayment[];
  childName?: string;
}

const PaymentSection = ({
  paymentHistory: propPaymentHistory,
  duePayments: propDuePayments,
  childName = "Emma",
}: PaymentSectionProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<DuePayment | null>(
    null,
  );
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [duePayments, setDuePayments] = useState<DuePayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPayments = async () => {
      // If payment history is provided as props, use it
      if (propPaymentHistory && propPaymentHistory.length > 0) {
        setPaymentHistory(propPaymentHistory);
      } else {
        setIsLoading(true);
        setError(null);
        try {
          // Get parent payments from Supabase
          const parentId = user?.id;
          if (parentId) {
            const { data, error } = await getParentPayments(parentId);
            if (error) throw new Error(error.message);
            
            if (data && data.length > 0) {
              // Transform the data to match our Payment interface
              const formattedPayments = data.map((item: any) => ({
                id: item.id,
                date: item.date,
                amount: item.amount,
                status: item.status || "paid",
                description: item.description,
                method: item.payment_method,
                receiptUrl: item.receipt_url,
              }));
              setPaymentHistory(formattedPayments);
            } else {
              // Use default payment history if no data is returned
              setPaymentHistory([
                {
                  id: "1",
                  date: "2023-05-15",
                  amount: 250,
                  status: "paid",
                  description: "May Tuition Fee",
                  method: "Credit Card",
                  receiptUrl: "#",
                },
                {
                  id: "2",
                  date: "2023-06-15",
                  amount: 250,
                  status: "paid",
                  description: "June Tuition Fee",
                  method: "Bank Transfer",
                  receiptUrl: "#",
                },
                {
                  id: "3",
                  date: "2023-07-15",
                  amount: 250,
                  status: "paid",
                  description: "July Tuition Fee",
                  method: "Credit Card",
                  receiptUrl: "#",
                },
                {
                  id: "4",
                  date: "2023-08-15",
                  amount: 275,
                  status: "pending",
                  description: "August Tuition Fee",
                  method: "Credit Card",
                },
              ]);
            }
          }
        } catch (err: any) {
          console.error("Error fetching payment history:", err);
          setError("Failed to load payment history. Please try again later.");
          // Fallback to default payment history
          setPaymentHistory([
            {
              id: "1",
              date: "2023-05-15",
              amount: 250,
              status: "paid",
              description: "May Tuition Fee",
              method: "Credit Card",
              receiptUrl: "#",
            },
            {
              id: "2",
              date: "2023-06-15",
              amount: 250,
              status: "paid",
              description: "June Tuition Fee",
              method: "Bank Transfer",
              receiptUrl: "#",
            },
          ]);
        }
      }

      // If due payments are provided as props, use them
      if (propDuePayments && propDuePayments.length > 0) {
        setDuePayments(propDuePayments);
      } else {
        try {
          // Get due payments from Supabase
          // This would typically be a separate API call to get upcoming payments
          // For now, we'll use default due payments
          setDuePayments([
            {
              id: "5",
              dueDate: "2023-09-15",
              amount: 275,
              description: "September Tuition Fee",
              category: "Tuition",
            },
            {
              id: "6",
              dueDate: "2023-09-30",
              amount: 50,
              description: "Art Supplies Fee",
              category: "Supplies",
            },
            {
              id: "7",
              dueDate: "2023-08-30",
              amount: 100,
              description: "Field Trip Fee",
              daysOverdue: 7,
              category: "Activities",
            },
          ]);
        } catch (err: any) {
          console.error("Error fetching due payments:", err);
          // Fallback to default due payments
          setDuePayments([
            {
              id: "5",
              dueDate: "2023-09-15",
              amount: 275,
              description: "September Tuition Fee",
              category: "Tuition",
            },
          ]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchPayments();
  }, [propPaymentHistory, propDuePayments, user]);

  // Filter payment history based on search and status
  const filteredHistory = paymentHistory.filter((payment) => {
    const matchesSearch = payment.description
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Sort payment history by date
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  // Calculate total paid and due amounts
  const totalPaid = paymentHistory
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const totalDue = duePayments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );

  // Handle payment process
  const handlePayNow = (payment: DuePayment) => {
    setSelectedPayment(payment);
    setIsPaymentDialogOpen(true);
  };

  // Handle view receipt
  const handleViewReceipt = (payment: Payment) => {
    setSelectedReceipt(payment);
    setIsReceiptDialogOpen(true);
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Process payment
  const processPayment = async () => {
    if (!selectedPayment) return;
    
    setIsProcessingPayment(true);
    
    try {
      // In a real app, this would connect to a payment processor
      // For now, we'll simulate a successful payment
      
      // Add payment to database
      const paymentData = {
        parent_id: user?.id,
        amount: selectedPayment.amount,
        date: new Date().toISOString().split('T')[0],
        description: selectedPayment.description,
        payment_method: paymentMethod === 'credit-card' ? 'Credit Card' : 
                        paymentMethod === 'bank-transfer' ? 'Bank Transfer' : 'PayPal',
        status: 'paid'
      };
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add to payment history
      const newPayment: Payment = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        amount: selectedPayment.amount,
        status: 'paid',
        description: selectedPayment.description,
        method: paymentMethod === 'credit-card' ? 'Credit Card' : 
                paymentMethod === 'bank-transfer' ? 'Bank Transfer' : 'PayPal',
      };
      
      setPaymentHistory(prev => [newPayment, ...prev]);
      
      // Remove from due payments
      setDuePayments(prev => prev.filter(p => p.id !== selectedPayment.id));
      
      // Close dialog
      setIsPaymentDialogOpen(false);
      
      // Reset form
      setCardNumber('');
      setExpiryDate('');
      setCvv('');
      
    } catch (err) {
      console.error("Error processing payment:", err);
      // Show error message
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white p-6 rounded-lg shadow-sm flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-gray-600">Loading payment information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-white p-6 rounded-lg shadow-sm">
        <div className="text-center text-red-500 p-4">
          <p>{error}</p>
          <button 
            className="mt-2 text-primary hover:underline"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-sm">
      <Tabs defaultValue="due" className="w-full">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {childName}'s Payments
            </h2>
            <p className="text-gray-600 text-sm">
              Manage tuition and activity fees
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-md">
              <DollarSign className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-xs text-blue-700">Total Paid</p>
                <p className="font-semibold text-blue-800">
                  ${totalPaid.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-amber-50 p-2 rounded-md">
              <Clock className="h-5 w-5 text-amber-500" />
              <div>
                <p className="text-xs text-amber-700">Total Due</p>
                <p className="font-semibold text-amber-800">
                  ${totalDue.toFixed(2)}
                </p>
              </div>
            </div>

            <TabsList className="ml-auto">
              <TabsTrigger value="due">Due Payments</TabsTrigger>
              <TabsTrigger value="history">Payment History</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="due" className="space-y-4">
          {duePayments.length > 0 ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Payments</CardTitle>
                  <CardDescription>
                    Payments that are due or overdue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {duePayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">
                            {payment.description}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-gray-50">
                              {payment.category || "Other"}
                            </Badge>
                          </TableCell>
                          <TableCell>{payment.dueDate}</TableCell>
                          <TableCell>${payment.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            {payment.daysOverdue ? (
                              <Badge variant="destructive">
                                {payment.daysOverdue} days overdue
                              </Badge>
                            ) : (
                              <Badge variant="secondary">Upcoming</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => handlePayNow(payment)}
                            >
                              <CreditCard className="mr-2 h-4 w-4" />
                              Pay Now
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-4">
                  <p className="text-sm text-gray-500">
                    Total due: ${totalDue.toFixed(2)}
                  </p>
                  <Button variant="outline" size="sm">
                    <Calendar className="mr-2 h-4 w-4" />
                    Payment Schedule
                  </Button>
                </CardFooter>
              </Card>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">
                    Payment Reminder
                  </h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Please ensure all payments are made by their due dates to
                    avoid late fees. Contact the administration if you need
                    assistance with payment plans.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                <div className="text-center">
                  <h3 className="text-lg font-medium">No payments due</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    You're all caught up with payments!
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>
                    View all your previous payments
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search payments..."
                      className="pl-8 w-full sm:w-[200px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select
                    defaultValue="all"
                    onValueChange={(value) => setFilterStatus(value)}
                  >
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Filter" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleSortOrder}
                        className="flex items-center gap-1 p-0 h-auto font-medium"
                      >
                        Date
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedHistory.length > 0 ? (
                    sortedHistory.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">
                          {payment.description}
                        </TableCell>
                        <TableCell>
                          {new Date(payment.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>${payment.amount.toFixed(2)}</TableCell>
                        <TableCell>{payment.method || "--"}</TableCell>
                        <TableCell>
                          {payment.status === "paid" && (
                            <Badge variant="default">Paid</Badge>
                          )}
                          {payment.status === "pending" && (
                            <Badge variant="secondary">Processing</Badge>
                          )}
                          {payment.status === "overdue" && (
                            <Badge variant="destructive">Overdue</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {payment.status === "paid" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewReceipt(payment)}
                            >
                              <Receipt className="mr-2 h-4 w-4" />
                              Receipt
                            </Button>
                          )}
                          {payment.status === "pending" && (
                            <Button variant="outline" size="sm">
                              <CreditCard className="mr-2 h-4 w-4" />
                              Complete
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-6 text-gray-500"
                      >
                        No payment records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <p className="text-sm text-gray-500">
                Showing {sortedHistory.length} of {paymentHistory.length}{" "}
                payments
              </p>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export History
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Make a Payment</DialogTitle>
            <DialogDescription>
              Complete your payment for {selectedPayment?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <div className="col-span-3 relative">
                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  id="amount"
                  value={selectedPayment?.amount.toFixed(2)}
                  className="pl-8"
                  readOnly
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="method" className="text-right">
                Payment Method
              </Label>
              <Select 
                defaultValue="credit-card"
                onValueChange={setPaymentMethod}
                value={paymentMethod}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit-card">Credit Card</SelectItem>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="card-number" className="text-right">
                Card Number
              </Label>
              <Input
                id="card-number"
                placeholder="**** **** **** ****"
                className="col-span-3"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expiry" className="text-right">
                Expiry Date
              </Label>
              <Input 
                id="expiry" 
                placeholder="MM/YY" 
                className="col-span-1"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
              <Label htmlFor="cvv" className="text-right">
                CVV
              </Label>
              <Input 
                id="cvv" 
                placeholder="***" 
                className="col-span-1"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isProcessingPayment}>Cancel</Button>
            </DialogClose>
            <Button 
              type="submit" 
              onClick={processPayment}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Process Payment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
            <DialogDescription>
              Receipt for {selectedReceipt?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="border rounded-md p-4 space-y-4">
            <div className="flex justify-between border-b pb-2">
              <div className="font-bold text-lg">Ninio Kindergarten</div>
              <div className="text-gray-500">
                Receipt #{selectedReceipt?.id}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span>{selectedReceipt?.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Description:</span>
                <span>{selectedReceipt?.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Method:</span>
                <span>{selectedReceipt?.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <Badge variant="default">Paid</Badge>
              </div>
              <div className="flex justify-between border-t pt-2 mt-2">
                <span className="font-bold">Total Amount:</span>
                <span className="font-bold">
                  ${selectedReceipt?.amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button variant="outline" className="w-full sm:w-auto">
              <FileText className="mr-2 h-4 w-4" />
              Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentSection;

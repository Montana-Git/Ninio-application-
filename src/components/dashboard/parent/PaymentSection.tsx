import { useState, useEffect } from "react";
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
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  SlidersHorizontal,
} from "lucide-react";
import { getPayments, getParentPayments, processPayment, generateReceipt } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { usePayments } from "@/hooks/usePayments";
import { PaymentForm, PaymentReceipt } from "@/components/ui/payment";
import { PaymentMethod, PaymentStatus } from "@/services/payment-gateway-service";
import { useAnalytics } from "@/contexts/AnalyticsContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [filterCategory, setFilterCategory] = useState("all");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<DuePayment | null>(null);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);
  const [sortField, setSortField] = useState<"date" | "amount" | "description">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [duePayments, setDuePayments] = useState<DuePayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [receiptTransactionId, setReceiptTransactionId] = useState<string | null>(null);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Date filter state
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Use our custom hooks
  const { processPayment: handleProcessPayment, getReceipt, isLoading: isPaymentLoading, error: paymentError } = usePayments();
  const { trackPayment, trackPaymentSuccess, trackPaymentFailed } = useAnalytics();
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
                id: item.payment_id,
                date: item.date,
                amount: item.amount,
                status: item.status || "paid",
                description: item.payment_type,
                method: item.payment_method,
                receiptUrl: item.payment_id, // Use payment ID as receipt reference
              }));
              setPaymentHistory(formattedPayments);
            } else {
              // If no payment history found, use empty array
              setPaymentHistory([]);
            }
          }
        } catch (err: any) {
          console.error("Error fetching payment history:", err);
          setError("Failed to load payment history. Please try again later.");
          // Fallback to empty array
          setPaymentHistory([]);
        }
      }

      // If due payments are provided as props, use them
      if (propDuePayments && propDuePayments.length > 0) {
        setDuePayments(propDuePayments);
        setIsLoading(false);
      } else {
        try {
          // Get due payments from Supabase
          const parentId = user?.id;
          if (parentId) {
            // Get payments with status 'pending' or 'overdue'
            const { data: pendingData, error: pendingError } = await getPayments(
              parentId,
              'pending'
            );

            const { data: overdueData, error: overdueError } = await getPayments(
              parentId,
              'overdue'
            );

            if (pendingError) throw new Error(pendingError.message);
            if (overdueError) throw new Error(overdueError.message);

            const duePaymentsData: DuePayment[] = [];

            // Process pending payments
            if (pendingData && pendingData.length > 0) {
              pendingData.forEach(payment => {
                duePaymentsData.push({
                  id: payment.id,
                  dueDate: payment.due_date || payment.date,
                  amount: payment.amount,
                  description: payment.payment_type,
                  category: payment.category || 'Other',
                });
              });
            }

            // Process overdue payments
            if (overdueData && overdueData.length > 0) {
              overdueData.forEach(payment => {
                const dueDate = new Date(payment.due_date || payment.date);
                const today = new Date();
                const diffTime = Math.abs(today.getTime() - dueDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                duePaymentsData.push({
                  id: payment.id,
                  dueDate: payment.due_date || payment.date,
                  amount: payment.amount,
                  description: payment.payment_type,
                  category: payment.category || 'Other',
                  daysOverdue: diffDays,
                });
              });
            }

            if (duePaymentsData.length > 0) {
              setDuePayments(duePaymentsData);
            } else {
              // If no due payments found, use empty array
              setDuePayments([]);
            }
          }
        } catch (err: any) {
          console.error("Error fetching due payments:", err);
          setError("Failed to load due payments. Please try again later.");
          // Fallback to empty array
          setDuePayments([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchPayments();
  }, [propPaymentHistory, propDuePayments, user]);

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Change sort field
  const changeSortField = (field: "date" | "amount" | "description") => {
    if (sortField === field) {
      toggleSortOrder();
    } else {
      setSortField(field);
      setSortOrder("desc"); // Default to descending when changing fields
    }
  };

  // Filter payment history based on search, status, category, and date range
  const filteredHistory = paymentHistory.filter((payment) => {
    // Apply search filter
    const matchesSearch =
      payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.method?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply status filter
    const matchesStatus =
      filterStatus === "all" || payment.status === filterStatus;

    // Apply category filter
    const matchesCategory =
      filterCategory === "all" ||
      ((payment as any).category?.toLowerCase() === filterCategory.toLowerCase());

    // Apply date filters
    const paymentDate = new Date(payment.date);
    const matchesStartDate = !startDate || paymentDate >= startDate;
    const matchesEndDate = !endDate || paymentDate <= endDate;

    return matchesSearch && matchesStatus && matchesCategory && matchesStartDate && matchesEndDate;
  });

  // Sort payment history by selected field
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (sortField === "date") {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    } else if (sortField === "amount") {
      return sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount;
    } else {
      // Sort by description
      return sortOrder === "asc"
        ? a.description.localeCompare(b.description)
        : b.description.localeCompare(a.description);
    }
  });

  // Paginate the filtered payments
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedPayments = sortedHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterCategory, startDate, endDate]);

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

  // This function is already defined above
  // Removing duplicate declaration

  // Handle payment success
  const handlePaymentSuccess = (transactionId: string) => {
    if (!selectedPayment) return;

    // Track successful payment
    trackPaymentSuccess(
      selectedPayment.amount,
      'credit_card', // This would be dynamic in a real implementation
      transactionId,
      selectedPayment.description,
      { category: selectedPayment.category }
    );

    // Add to payment history (in a real app, we would fetch the updated list)
    const newPayment: Payment = {
      id: transactionId,
      date: new Date().toISOString().split('T')[0],
      amount: selectedPayment.amount,
      status: 'paid',
      description: selectedPayment.description,
      method: 'Credit Card',
      receiptUrl: transactionId,
    };

    setPaymentHistory(prev => [newPayment, ...prev]);

    // Remove from due payments
    setDuePayments(prev => prev.filter(p => p.id !== selectedPayment.id));

    // Close payment dialog
    setIsPaymentDialogOpen(false);

    // Show receipt
    setReceiptTransactionId(transactionId);
    setIsReceiptDialogOpen(true);
  };

  // Handle payment error
  const handlePaymentError = (error: string) => {
    console.error("Payment error:", error);

    if (selectedPayment) {
      // Track failed payment
      trackPaymentFailed(
        selectedPayment.amount,
        'credit_card', // This would be dynamic in a real implementation
        error,
        { description: selectedPayment.description }
      );
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
                  <div className="flex gap-2">
                    <Select
                      value={filterStatus}
                      onValueChange={(value) => setFilterStatus(value)}
                    >
                      <SelectTrigger className="w-full sm:w-[130px]">
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4" />
                          <SelectValue placeholder="Status" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
                      className={isAdvancedFilterOpen ? "bg-blue-50" : ""}
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isAdvancedFilterOpen && (
                <div className="mb-6 p-4 border rounded-md bg-slate-50">
                  <h3 className="font-medium mb-3">Advanced Filters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select
                        value={filterCategory}
                        onValueChange={setFilterCategory}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="tuition">Tuition</SelectItem>
                          <SelectItem value="supplies">Supplies</SelectItem>
                          <SelectItem value="activities">Activities</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Items per page</Label>
                      <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => setItemsPerPage(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Items per page" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 items</SelectItem>
                          <SelectItem value="10">10 items</SelectItem>
                          <SelectItem value="20">20 items</SelectItem>
                          <SelectItem value="50">50 items</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !startDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {startDate ? format(startDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={startDate}
                            onSelect={setStartDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !endDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {endDate ? format(endDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={endDate}
                            onSelect={setEndDate}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFilterCategory("all");
                        setStartDate(undefined);
                        setEndDate(undefined);
                        setItemsPerPage(5);
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : error ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : (
                <>
                  <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => changeSortField("description")}
                        className="flex items-center gap-1 p-0 h-auto font-medium"
                      >
                        Description
                        {sortField === "description" && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => changeSortField("date")}
                        className="flex items-center gap-1 p-0 h-auto font-medium"
                      >
                        Date
                        {sortField === "date" && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => changeSortField("amount")}
                        className="flex items-center gap-1 p-0 h-auto font-medium"
                      >
                        Amount
                        {sortField === "amount" && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredHistory.length > 0 ? (
                    paginatedPayments.map((payment) => (
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

              {/* Pagination Controls */}
              {filteredHistory.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredHistory.length)} of {filteredHistory.length} entries
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="text-sm">
                      Page {currentPage} of {totalPages || 1}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
                </>
              )}
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <p className="text-sm text-gray-500">
                Total payments: {paymentHistory.length}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Generate CSV content
                  const headers = ["Date", "Description", "Amount", "Method", "Status"];
                  const rows = filteredHistory.map(p => [
                    new Date(p.date).toLocaleDateString(),
                    p.description,
                    p.amount.toFixed(2),
                    p.method || "",
                    p.status
                  ]);

                  const csvContent = [
                    headers.join(","),
                    ...rows.map(row => row.join(","))
                  ].join("\n");

                  // Create a blob and download link
                  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.setAttribute("href", url);
                  link.setAttribute("download", `payment_history_${new Date().toISOString().split("T")[0]}.csv`);
                  link.style.visibility = "hidden";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedPayment && (
            <PaymentForm
              amount={selectedPayment.amount}
              description={selectedPayment.description}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={() => setIsPaymentDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {receiptTransactionId ? (
            <PaymentReceipt
              transactionId={receiptTransactionId}
              onClose={() => setIsReceiptDialogOpen(false)}
            />
          ) : selectedReceipt ? (
            <PaymentReceipt
              transactionId={selectedReceipt.id}
              onClose={() => setIsReceiptDialogOpen(false)}
            />
          ) : (
            <div className="p-4 text-center">
              <p>Receipt not found</p>
              <Button
                onClick={() => setIsReceiptDialogOpen(false)}
                className="mt-4"
              >
                Close
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentSection;

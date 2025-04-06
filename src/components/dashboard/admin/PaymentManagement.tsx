import { useState, useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableFooter,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  Send,
  Download,
  Filter,
  Eye,
  FileText,
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  ArrowUpDown,
  Printer,
  Mail,
  Clock,
  RotateCcw,
  Users,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { getPayments, getUsers, getChildren, updatePaymentStatus, processRefund, addPayment } from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";
import { PaymentReceipt } from "@/components/ui/payment";
import { PaymentStatus } from "@/services/payment-gateway-service";
import paymentAnalyticsService from "@/services/payment-analytics-service";
import { useAnalytics } from "@/contexts/AnalyticsContext";

interface Payment {
  id: string;
  parentName: string;
  childName: string;
  amount: number;
  date: string;
  dueDate?: string;
  status: "paid" | "pending" | "overdue";
  paymentType?: string;
  paymentMethod?: string;
  notes?: string;
  category?: string;
}

interface PaymentManagementProps {
  payments?: Payment[];
}

const PaymentManagement = ({ payments = [] }: PaymentManagementProps) => {
  const [isNewPaymentDialogOpen, setIsNewPaymentDialogOpen] = useState(false);
  const [isViewPaymentDialogOpen, setIsViewPaymentDialogOpen] = useState(false);
  const [isReminderDialogOpen, setIsReminderDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [sortField, setSortField] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // State for real data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);
  const [parents, setParents] = useState<{id: string; name: string}[]>([]);
  const [children, setChildren] = useState<{id: string; name: string; parentId: string}[]>([]);
  const [isRefunding, setIsRefunding] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkAction, setBulkAction] = useState<"mark_paid" | "mark_pending" | "send_reminder" | null>(null);
  const [receiptTransactionId, setReceiptTransactionId] = useState<string | null>(null);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  // Use analytics
  const { trackPaymentRefund } = useAnalytics();

  // Fetch data on component mount
  useEffect(() => {
    fetchPayments();
    fetchParentsAndChildren();
    fetchAnalyticsData();
  }, []);

  // Fetch payments from API
  const fetchPayments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await getPayments();

      if (error) throw new Error(error.message);

      if (data && data.length > 0) {
        // Transform data to match our Payment interface
        const formattedPayments = await Promise.all(data.map(async (payment) => {
          // Get parent name
          const parentName = parents.find(p => p.id === payment.parent_id)?.name || 'Unknown';

          // Get child name
          let childName = 'N/A';
          if (payment.child_id) {
            childName = children.find(c => c.id === payment.child_id)?.name || 'Unknown';
          }

          return {
            id: payment.id,
            parentName,
            childName,
            amount: payment.amount,
            date: payment.date,
            dueDate: payment.due_date,
            status: payment.status as "paid" | "pending" | "overdue",
            paymentType: payment.payment_type,
            paymentMethod: payment.payment_method,
            notes: payment.notes,
            category: payment.category,
          };
        }));

        setAllPayments(formattedPayments);
      } else {
        setAllPayments([]);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError('Failed to load payments. Please try again.');
      // Fallback to empty array
      setAllPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch parents and children
  const fetchParentsAndChildren = async () => {
    try {
      // Get parents
      const { data: parentsData, error: parentsError } = await getUsers('parent');

      if (parentsError) throw new Error(parentsError.message);

      if (parentsData) {
        const formattedParents = parentsData.map(parent => ({
          id: parent.id,
          name: `${parent.first_name} ${parent.last_name}`,
        }));
        setParents(formattedParents);
      }

      // Get children
      const { data: childrenData, error: childrenError } = await getChildren();

      if (childrenError) throw new Error(childrenError.message);

      if (childrenData) {
        const formattedChildren = childrenData.map(child => ({
          id: child.id,
          name: `${child.first_name} ${child.last_name}`,
          parentId: child.parent_id,
        }));
        setChildren(formattedChildren);
      }
    } catch (err) {
      console.error('Error fetching parents and children:', err);
    }
  };

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    setIsLoadingAnalytics(true);

    try {
      const [summary, methodDistribution, categoryDistribution, monthlyRevenue, statusDistribution, revenueForecast, trendAnalysis] =
        await Promise.all([
          paymentAnalyticsService.getPaymentAnalyticsSummary(),
          paymentAnalyticsService.getPaymentMethodDistribution(),
          paymentAnalyticsService.getPaymentCategoryDistribution(),
          paymentAnalyticsService.getMonthlyRevenueData(),
          paymentAnalyticsService.getPaymentStatusDistribution(),
          paymentAnalyticsService.getRevenueForecast(),
          paymentAnalyticsService.getPaymentTrendAnalysis(),
        ]);

      setAnalyticsData({
        summary,
        methodDistribution,
        categoryDistribution,
        monthlyRevenue,
        statusDistribution,
        revenueForecast,
        trendAnalysis,
      });
    } catch (err) {
      console.error('Error fetching analytics data:', err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  // Handle payment status update
  const handleUpdateStatus = async (paymentId: string, newStatus: PaymentStatus) => {
    setIsUpdatingStatus(true);

    try {
      const { data, error } = await updatePaymentStatus(paymentId, newStatus);

      if (error) throw new Error(error.message);

      // Update local state
      setAllPayments(prev =>
        prev.map(payment =>
          payment.id === paymentId
            ? { ...payment, status: newStatus as "paid" | "pending" | "overdue" }
            : payment
        )
      );

      // Refresh analytics
      fetchAnalyticsData();

    } catch (err) {
      console.error('Error updating payment status:', err);
      alert('Failed to update payment status. Please try again.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Handle payment refund
  const handleRefund = async (paymentId: string, amount: number) => {
    if (!confirm(`Are you sure you want to refund $${amount.toFixed(2)}?`)) return;

    setIsRefunding(true);

    try {
      const { data, error } = await processRefund(paymentId, amount);

      if (error) throw new Error(error.message);

      // Update local state
      setAllPayments(prev =>
        prev.map(payment =>
          payment.id === paymentId
            ? { ...payment, status: "refunded" as "paid" | "pending" | "overdue" }
            : payment
        )
      );

      // Track refund in analytics
      trackPaymentRefund(amount, paymentId, 'Admin initiated refund');

      // Refresh analytics
      fetchAnalyticsData();

      alert('Refund processed successfully.');

    } catch (err) {
      console.error('Error processing refund:', err);
      alert('Failed to process refund. Please try again.');
    } finally {
      setIsRefunding(false);
    }
  };

  // Handle bulk payment operations
  const handleBulkAction = async () => {
    if (!bulkAction || selectedPayments.length === 0) return;

    if (!confirm(`Are you sure you want to ${bulkAction.replace('_', ' ')} ${selectedPayments.length} payments?`)) return;

    setIsBulkProcessing(true);

    try {
      // Process based on action type
      if (bulkAction === 'mark_paid' || bulkAction === 'mark_pending') {
        // Determine the new status
        const newStatus: PaymentStatus = bulkAction === 'mark_paid' ? 'paid' : 'pending';

        // Update each payment status
        const updatePromises = selectedPayments.map(paymentId => {
          return updatePaymentStatus(paymentId, newStatus);
        });

        // Wait for all updates to complete
        await Promise.all(updatePromises);

        // Update local state
        setAllPayments(prev =>
          prev.map(payment =>
            selectedPayments.includes(payment.id)
              ? { ...payment, status: newStatus as "paid" | "pending" | "overdue" }
              : payment
          )
        );

        alert(`Successfully updated ${selectedPayments.length} payments to ${newStatus}.`);
      }
      else if (bulkAction === 'send_reminder') {
        // Get the selected payments
        const paymentsToRemind = allPayments.filter(p => selectedPayments.includes(p.id));

        // Group by parent for efficient notification
        const parentGroups: Record<string, {parentName: string, payments: Payment[]}> = {};

        paymentsToRemind.forEach(payment => {
          if (!parentGroups[payment.parentName]) {
            parentGroups[payment.parentName] = {
              parentName: payment.parentName,
              payments: []
            };
          }
          parentGroups[payment.parentName].payments.push(payment);
        });

        // Send reminders to each parent
        for (const parentName in parentGroups) {
          const group = parentGroups[parentName];
          const totalAmount = group.payments.reduce((sum, p) => sum + p.amount, 0);

          // In a real app, this would send an email or notification
          console.log(`Sending reminder to ${parentName} for ${group.payments.length} payments totaling $${totalAmount.toFixed(2)}`);
        }

        alert(`Payment reminders sent to ${Object.keys(parentGroups).length} parents for ${selectedPayments.length} payments.`);
      }

      // Clear selection after processing
      setSelectedPayments([]);

      // Refresh analytics
      fetchAnalyticsData();

    } catch (err) {
      console.error(`Error processing bulk action ${bulkAction}:`, err);
      alert(`Failed to process bulk action. Please try again.`);
    } finally {
      setIsBulkProcessing(false);
      setBulkAction(null);
    }
  };

  // Handle view receipt
  const handleViewReceipt = (paymentId: string) => {
    setReceiptTransactionId(paymentId);
    setIsReceiptDialogOpen(true);
  };

  // Handle adding a new payment
  const handleAddPayment = async (formData: FormData) => {
    try {
      // Get form values
      const parentId = formData.get('parent') as string;
      const childId = formData.get('child') as string;
      const paymentType = formData.get('payment-type') as string;
      const category = formData.get('category') as string;
      const amount = parseFloat(formData.get('amount') as string);
      const status = formData.get('status') as 'paid' | 'pending' | 'overdue';
      const date = formData.get('date') as string;
      const dueDate = formData.get('due-date') as string;
      const paymentMethod = formData.get('payment-method') as string;
      const notes = formData.get('notes') as string;
      const sendNotification = formData.get('send-notification') === 'on';

      // Validate required fields
      if (!parentId || !amount || isNaN(amount) || amount <= 0) {
        alert('Please fill in all required fields with valid values');
        return;
      }

      // Create payment data object
      const paymentData = {
        parent_id: parentId === 'no_parent' ? null : parentId,
        child_id: childId === 'no_child' ? null : childId,
        amount,
        date,
        due_date: dueDate,
        status,
        payment_type: paymentType,
        payment_method: paymentMethod,
        category,
        notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Validate parent ID
      if (!paymentData.parent_id) {
        alert('Please select a valid parent');
        return;
      }

      // Add payment to database
      console.log('Adding payment with data:', paymentData);
      console.log('Parent ID:', paymentData.parent_id);

      // Verify the parent exists
      const { data: parentData, error: parentError } = await supabase
        .from('users')
        .select('id, first_name, last_name')
        .eq('id', paymentData.parent_id)
        .single();

      if (parentError) {
        console.error('Error verifying parent:', parentError);
        alert(`Error verifying parent: ${parentError.message}`);
        return;
      }

      console.log('Parent verified:', parentData);

      // Add the payment
      const { data, error } = await addPayment(paymentData);

      if (error) {
        console.error('Error from addPayment:', error);
        throw new Error(error.message || 'Failed to add payment');
      }

      console.log('Payment added successfully:', data);

      // If successful, update local state
      if (data) {
        // Find parent and child names
        const parent = parents.find(p => p.id === parentId);
        const child = children.find(c => c.id === childId);

        // Create formatted payment object
        const newPayment: Payment = {
          id: data.id,
          parentName: parent ? parent.name : 'Unknown',
          childName: child ? child.name : 'N/A',
          amount,
          date,
          dueDate,
          status,
          paymentType,
          paymentMethod,
          category,
          notes
        };

        // Add to payments list
        setAllPayments(prev => [newPayment, ...prev]);

        // Send notification if requested
        if (sendNotification) {
          // In a real app, this would call an API to send an email
          console.log('Sending payment notification to parent:', parentId);
        }

        // Close dialog
        setIsNewPaymentDialogOpen(false);

        // Refresh analytics
        fetchAnalyticsData();

        // Show success message
        alert('Payment added successfully');
      }
    } catch (err) {
      console.error('Error adding payment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      alert(`Failed to add payment: ${errorMessage}. Please try again.`);
    }
  };

  // Use real data instead of mock data
  const displayPayments = allPayments.filter((payment) => {
    // Apply search filter
    const matchesSearch =
      payment.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.paymentType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.category?.toLowerCase().includes(searchQuery.toLowerCase());

    // Apply status filter
    const matchesStatus = filterStatus === "all" || payment.status === filterStatus;

    // Apply category filter
    const matchesCategory =
      filterCategory === "all" ||
      payment.category?.toLowerCase() === filterCategory.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sort payments
  const sortedPayments = [...displayPayments].sort((a, b) => {
    if (sortField === "date") {
      return sortDirection === "asc"
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortField === "amount") {
      return sortDirection === "asc"
        ? a.amount - b.amount
        : b.amount - a.amount;
    } else if (sortField === "parent") {
      return sortDirection === "asc"
        ? a.parentName.localeCompare(b.parentName)
        : b.parentName.localeCompare(a.parentName);
    }
    return 0;
  });

  // Use real data from API instead of mock data
  const defaultPayments: Payment[] = [
    {
      id: "2",
      parentName: "Sarah Johnson",
      childName: "Michael Johnson",
      amount: 250.0,
      date: "2023-05-20",
      dueDate: "2023-05-15",
      status: "pending",
      paymentType: "Tuition Fee",
      paymentMethod: "Bank Transfer",
      category: "Tuition",
    },
    {
      id: "3",
      parentName: "David Williams",
      childName: "Sophia Williams",
      amount: 250.0,
      date: "2023-04-15",
      dueDate: "2023-04-10",
      status: "overdue",
      paymentType: "Tuition Fee",
      category: "Tuition",
    },
    {
      id: "4",
      parentName: "Jennifer Brown",
      childName: "Oliver Brown",
      amount: 250.0,
      date: "2023-05-10",
      dueDate: "2023-05-05",
      status: "paid",
      paymentType: "Tuition Fee",
      paymentMethod: "Credit Card",
      category: "Tuition",
    },
    {
      id: "5",
      parentName: "Robert Davis",
      childName: "Ava Davis",
      amount: 250.0,
      date: "2023-05-25",
      dueDate: "2023-05-20",
      status: "pending",
      paymentType: "Tuition Fee",
      category: "Tuition",
    },
    {
      id: "6",
      parentName: "John Smith",
      childName: "Emma Smith",
      amount: 50.0,
      date: "2023-05-18",
      dueDate: "2023-05-15",
      status: "paid",
      paymentType: "Art Supplies",
      paymentMethod: "Credit Card",
      category: "Supplies",
    },
    {
      id: "7",
      parentName: "Sarah Johnson",
      childName: "Michael Johnson",
      amount: 100.0,
      date: "2023-05-22",
      dueDate: "2023-05-20",
      status: "pending",
      paymentType: "Field Trip",
      category: "Activities",
    },
  ];

  // Filter payments based on search query and filters
  const filteredPayments = (payments.length > 0 ? payments : defaultPayments).filter((payment) => {
    const matchesSearch =
      payment.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.childName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.paymentType &&
        payment.paymentType.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      filterStatus === "all" || payment.status === filterStatus;

    const matchesCategory =
      filterCategory === "all" || payment.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sort payments
  const sortedFilteredPayments = [...filteredPayments].sort((a, b) => {
    let comparison = 0;

    if (sortField === "date") {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortField === "amount") {
      comparison = a.amount - b.amount;
    } else if (sortField === "parentName") {
      comparison = a.parentName.localeCompare(b.parentName);
    } else if (sortField === "status") {
      comparison = a.status.localeCompare(b.status);
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Calculate statistics
  const totalPaid = displayPayments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = displayPayments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOverdue = displayPayments
    .filter((p) => p.status === "overdue")
    .reduce((sum, p) => sum + p.amount, 0);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "overdue":
        return "destructive";
      default:
        return "default";
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsViewPaymentDialogOpen(true);
  };

  const handleSendReminder = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsReminderDialogOpen(true);
  };

  const handleSelectPayment = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedPayments(prev => [...prev, id]);
    } else {
      setSelectedPayments(prev => prev.filter(paymentId => paymentId !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPayments(sortedFilteredPayments.map((p) => p.id));
    } else {
      setSelectedPayments([]);
    }
  };

  return (
    <div className="w-full h-full bg-background p-6">
      <Tabs defaultValue="payments" className="w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Payment Management
            </h2>
            <p className="text-gray-600 text-sm">
              Process and track payments from parents
            </p>
          </div>
          <TabsList>
            <TabsTrigger value="payments">All Payments</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="payments">
          <Card className="w-full">
            <CardHeader className="pb-0">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search payments..."
                        className="pl-8 w-full sm:w-[250px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select
                        defaultValue="all"
                        onValueChange={(value) => setFilterStatus(value)}
                      >
                        <SelectTrigger className="w-full sm:w-[150px]">
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
                      <Select
                        defaultValue="all"
                        onValueChange={(value) => setFilterCategory(value)}
                      >
                        <SelectTrigger className="w-full sm:w-[150px]">
                          <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <SelectValue placeholder="Category" />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="Tuition">Tuition</SelectItem>
                          <SelectItem value="Supplies">Supplies</SelectItem>
                          <SelectItem value="Activities">Activities</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Bulk Actions */}
                  {selectedPayments.length > 0 && (
                    <div className="flex items-center gap-2 ml-auto">
                      <span className="text-sm text-muted-foreground">
                        {selectedPayments.length} selected
                      </span>
                      <Select
                        value={bulkAction || ""}
                        onValueChange={(value) => setBulkAction(value as any)}
                        disabled={isBulkProcessing}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Bulk Actions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mark_paid">Mark as Paid</SelectItem>
                          <SelectItem value="mark_pending">Mark as Pending</SelectItem>
                          <SelectItem value="send_reminder">Send Payment Reminder</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkAction}
                        disabled={!bulkAction || isBulkProcessing}
                      >
                        {isBulkProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Apply"
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedPayments([])}
                        disabled={isBulkProcessing}
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Dialog
                    open={isNewPaymentDialogOpen}
                    onOpenChange={setIsNewPaymentDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        New Payment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleAddPayment(new FormData(e.currentTarget));
                      }}>
                        <DialogHeader>
                          <DialogTitle>Process New Payment</DialogTitle>
                          <DialogDescription>
                            Enter the details to process a new payment or create a
                            payment request.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="parent">Parent</Label>
                              <Select name="parent" defaultValue={parents.length > 0 ? parents[0].id : "no_parent"}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select parent" />
                                </SelectTrigger>
                                <SelectContent>
                                  {parents.length > 0 ? (
                                    parents.map((parent) => (
                                      <SelectItem key={parent.id} value={parent.id}>
                                        {parent.name}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="no_parent" disabled>
                                      No parents available
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="child">Child</Label>
                              <Select name="child" defaultValue={children.length > 0 ? children[0].id : "no_child"}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select child" />
                                </SelectTrigger>
                                <SelectContent>
                                  {children.length > 0 ? (
                                    children.map((child) => (
                                      <SelectItem key={child.id} value={child.id}>
                                        {child.name}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="no_child" disabled>
                                      No children available
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="payment-type">Payment Type</Label>
                              <Select name="payment-type" defaultValue="Tuition Fee">
                                <SelectTrigger>
                                  <SelectValue placeholder="Select payment type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Tuition Fee">
                                    Tuition Fee
                                  </SelectItem>
                                  <SelectItem value="Art Supplies">
                                    Art Supplies
                                  </SelectItem>
                                  <SelectItem value="Field Trip">
                                    Field Trip
                                  </SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="category">Category</Label>
                              <Select name="category" defaultValue="Tuition">
                                <SelectTrigger>
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Tuition">Tuition</SelectItem>
                                  <SelectItem value="Supplies">
                                    Supplies
                                  </SelectItem>
                                  <SelectItem value="Activities">
                                    Activities
                                  </SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="amount">Amount ($)</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                                <Input
                                  id="amount"
                                  name="amount"
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  required
                                  defaultValue="250.00"
                                  className="pl-8"
                                />
                              </div>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="status">Status</Label>
                              <Select name="status" defaultValue="pending">
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="paid">Paid</SelectItem>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="overdue">Overdue</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="date">Payment Date</Label>
                              <Input
                                id="date"
                                name="date"
                                type="date"
                                required
                                defaultValue={
                                  new Date().toISOString().split("T")[0]
                                }
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="due-date">Due Date</Label>
                              <Input
                                id="due-date"
                                name="due-date"
                                type="date"
                                required
                                defaultValue={
                                  new Date().toISOString().split("T")[0]
                                }
                              />
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="payment-method">Payment Method</Label>
                            <Select name="payment-method" defaultValue="Credit Card">
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Credit Card">
                                  Credit Card
                                </SelectItem>
                                <SelectItem value="Bank Transfer">
                                  Bank Transfer
                                </SelectItem>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="Check">Check</SelectItem>
                                <SelectItem value="PayPal">PayPal</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="notes">Notes</Label>
                            <Textarea
                              id="notes"
                              name="notes"
                              placeholder="Add any additional notes about this payment"
                              className="min-h-[80px]"
                            />
                          </div>
                          <div className="flex items-center space-x-2 pt-2">
                            <Checkbox id="send-notification" name="send-notification" />
                            <Label
                              htmlFor="send-notification"
                              className="text-sm"
                            >
                              Send email notification to parent
                            </Label>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setIsNewPaymentDialogOpen(false)}>Cancel</Button>
                          <Button type="submit">Process Payment</Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-green-50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700">Total Paid</p>
                      <p className="text-2xl font-bold text-green-800">
                        ${totalPaid.toFixed(2)}
                      </p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  </CardContent>
                </Card>
                <Card className="bg-amber-50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-amber-700">Pending Payments</p>
                      <p className="text-2xl font-bold text-amber-800">
                        ${totalPending.toFixed(2)}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-amber-500" />
                  </CardContent>
                </Card>
                <Card className="bg-red-50">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-700">Overdue Payments</p>
                      <p className="text-2xl font-bold text-red-800">
                        ${totalOverdue.toFixed(2)}
                      </p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  </CardContent>
                </Card>
              </div>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30px]">
                        <Checkbox
                          checked={
                            selectedPayments.length === sortedPayments.length &&
                            sortedPayments.length > 0
                          }
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("parentName")}
                          className="flex items-center gap-1 p-0 h-auto font-medium"
                        >
                          Parent/Child
                          {sortField === "parentName" && (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>Payment Type</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("amount")}
                          className="flex items-center gap-1 p-0 h-auto font-medium"
                        >
                          Amount
                          {sortField === "amount" && (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("date")}
                          className="flex items-center gap-1 p-0 h-auto font-medium"
                        >
                          Date
                          {sortField === "date" && (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort("status")}
                          className="flex items-center gap-1 p-0 h-auto font-medium"
                        >
                          Status
                          {sortField === "status" && (
                            <ArrowUpDown className="h-3 w-3" />
                          )}
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPayments.length > 0 ? (
                      sortedPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedPayments.includes(payment.id)}
                              onCheckedChange={(checked) =>
                                handleSelectPayment(payment.id, checked as boolean)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {payment.parentName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {payment.childName}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-gray-50">
                              {payment.paymentType || "Tuition Fee"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            ${payment.amount.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {new Date(payment.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {payment.dueDate
                              ? new Date(payment.dueDate).toLocaleDateString()
                              : "--"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getStatusBadgeVariant(payment.status)}
                            >
                              {payment.status.charAt(0).toUpperCase() +
                                payment.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={() => handleViewPayment(payment)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {payment.status === "pending" ||
                              payment.status === "overdue" ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleSendReminder(payment)}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              ) : null}
                              {payment.status === "paid" && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleViewReceipt(payment.id)}
                                  >
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleRefund(payment.id, payment.amount)}
                                    disabled={isRefunding}
                                  >
                                    <RotateCcw className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                              {payment.status === "pending" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleUpdateStatus(payment.id, "paid")}
                                  disabled={isUpdatingStatus}
                                >
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="text-center py-6 text-muted-foreground"
                        >
                          No payments found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={3} className="text-muted-foreground">
                        {selectedPayments.length > 0 ? (
                          <span>
                            Selected {selectedPayments.length} payments
                          </span>
                        ) : (
                          <span>
                            Showing {sortedPayments.length} of{" "}
                            {displayPayments.length} payments
                          </span>
                        )}
                      </TableCell>
                      <TableCell colSpan={5} className="text-right">
                        {selectedPayments.length > 0 && (
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm">
                              <Send className="mr-2 h-4 w-4" />
                              Send Reminders
                            </Button>
                            <Button variant="outline" size="sm">
                              <Printer className="mr-2 h-4 w-4" />
                              Print Selected
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button variant="outline" size="sm">
                <Send className="mr-2 h-4 w-4" />
                Batch Reminders
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Payment Schedule
                </Button>
                <Button size="sm">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payments</CardTitle>
              <CardDescription>
                Manage payments that are awaiting processing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parent/Child</TableHead>
                    <TableHead>Payment Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Days Remaining</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayPayments
                    .filter((p) => p.status === "pending")
                    .map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {payment.parentName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {payment.childName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {payment.paymentType || "Tuition Fee"}
                        </TableCell>
                        <TableCell className="font-medium">
                          ${payment.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {payment.dueDate
                            ? new Date(payment.dueDate).toLocaleDateString()
                            : "--"}
                        </TableCell>
                        <TableCell>
                          {payment.dueDate
                            ? Math.ceil(
                                (new Date(payment.dueDate).getTime() -
                                  new Date().getTime()) /
                                  (1000 * 60 * 60 * 24),
                              )
                            : "--"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline">
                              <CreditCard className="mr-2 h-4 w-4" />
                              Process
                            </Button>
                            <Button size="sm" variant="outline">
                              <Send className="mr-2 h-4 w-4" />
                              Remind
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overdue">
          <Card>
            <CardHeader>
              <CardTitle>Overdue Payments</CardTitle>
              <CardDescription>
                Manage payments that are past their due date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parent/Child</TableHead>
                    <TableHead>Payment Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Days Overdue</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayPayments
                    .filter((p) => p.status === "overdue")
                    .map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {payment.parentName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {payment.childName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {payment.paymentType || "Tuition Fee"}
                        </TableCell>
                        <TableCell className="font-medium">
                          ${payment.amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {payment.dueDate
                            ? new Date(payment.dueDate).toLocaleDateString()
                            : "--"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive">
                            {payment.dueDate
                              ? Math.ceil(
                                  (new Date().getTime() -
                                    new Date(payment.dueDate).getTime()) /
                                    (1000 * 60 * 60 * 24),
                                )
                              : "--"}{" "}
                            days
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm">
                              <CreditCard className="mr-2 h-4 w-4" />
                              Process
                            </Button>
                            <Button size="sm" variant="outline">
                              <Send className="mr-2 h-4 w-4" />
                              Remind
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Send Reminders to All
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
                <CardDescription>Overview of payment status</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoadingAnalytics ? (
                  <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : analyticsData?.statusDistribution ? (
                  <div className="space-y-8">
                    {analyticsData.statusDistribution.map((status) => {
                      // Skip empty statuses
                      if (status.count === 0) return null;

                      // Calculate total for percentages
                      const total = analyticsData.statusDistribution.reduce(
                        (sum, s) => sum + s.amount, 0
                      );

                      // Determine color based on status
                      let colorClass = "bg-gray-500";
                      switch (status.status) {
                        case "paid":
                          colorClass = "bg-green-500";
                          break;
                        case "pending":
                          colorClass = "bg-amber-500";
                          break;
                        case "overdue":
                          colorClass = "bg-red-500";
                          break;
                        case "refunded":
                          colorClass = "bg-blue-500";
                          break;
                        case "failed":
                          colorClass = "bg-red-700";
                          break;
                      }

                      return (
                        <div key={status.status}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium">
                              {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ${status.amount.toFixed(2)} (
                              {Math.round((status.amount / total) * 100)}%)
                            </div>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${colorClass} rounded-full`}
                              style={{
                                width: `${Math.round((status.amount / total) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">Paid</div>
                        <div className="text-sm text-muted-foreground">
                          ${totalPaid.toFixed(2)} (
                          {Math.round(
                            (totalPaid /
                              (totalPaid + totalPending + totalOverdue)) *
                              100,
                          )}
                          %)
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{
                            width: `${Math.round((totalPaid / (totalPaid + totalPending + totalOverdue)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">Pending</div>
                        <div className="text-sm text-muted-foreground">
                          ${totalPending.toFixed(2)} (
                          {Math.round(
                            (totalPending /
                              (totalPaid + totalPending + totalOverdue)) *
                              100,
                          )}
                          %)
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{
                            width: `${Math.round((totalPending / (totalPaid + totalPending + totalOverdue)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">Overdue</div>
                        <div className="text-sm text-muted-foreground">
                          ${totalOverdue.toFixed(2)} (
                          {Math.round(
                            (totalOverdue /
                              (totalPaid + totalPending + totalOverdue)) *
                              100,
                          )}
                          %)
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500 rounded-full"
                          style={{
                            width: `${Math.round((totalOverdue / (totalPaid + totalPending + totalOverdue)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={fetchAnalyticsData}
                  disabled={isLoadingAnalytics}
                >
                  {isLoadingAnalytics ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Analytics
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Categories</CardTitle>
                <CardDescription>Breakdown by payment type</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAnalytics ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : analyticsData?.categoryDistribution ? (
                  <div className="space-y-4">
                    {analyticsData.categoryDistribution.slice(0, 5).map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full ${index === 0 ? 'bg-blue-500' : index === 1 ? 'bg-green-500' : index === 2 ? 'bg-purple-500' : index === 3 ? 'bg-yellow-500' : 'bg-gray-500'}`} />
                          <span>{category.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">${category.amount.toFixed(2)}</span>
                          <span className="text-xs text-muted-foreground">({category.percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500" />
                        <span>Tuition</span>
                      </div>
                      <span className="font-medium">
                        $
                        {displayPayments
                          .filter((p) => p.category === "Tuition")
                          .reduce((sum, p) => sum + p.amount, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500" />
                        <span>Supplies</span>
                      </div>
                      <span className="font-medium">
                        $
                        {displayPayments
                          .filter((p) => p.category === "Supplies")
                          .reduce((sum, p) => sum + p.amount, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-purple-500" />
                        <span>Activities</span>
                      </div>
                      <span className="font-medium">
                        $
                        {displayPayments
                          .filter((p) => p.category === "Activities")
                          .reduce((sum, p) => sum + p.amount, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Detailed Reports
                </Button>
              </CardFooter>
            </Card>

            {/* Monthly Revenue Card */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>Revenue over the last 12 months</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoadingAnalytics ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : analyticsData?.monthlyRevenue ? (
                  <div className="h-full w-full">
                    <div className="h-full w-full flex flex-col">
                      <div className="flex-1 grid grid-cols-12 gap-1">
                        {analyticsData.monthlyRevenue.map((item, index) => {
                          // Calculate bar height percentage based on max revenue
                          const maxRevenue = Math.max(
                            ...analyticsData.monthlyRevenue.map(d => d.revenue)
                          );
                          const heightPercentage = (item.revenue / maxRevenue) * 100;

                          // Determine bar color based on trend
                          let barColor = "bg-blue-500";
                          if (item.trend && item.trend > 0) barColor = "bg-green-500";
                          if (item.trend && item.trend < 0) barColor = "bg-red-500";

                          return (
                            <div key={index} className="flex flex-col items-center justify-end h-[200px]">
                              <div
                                className={`w-full ${barColor} rounded-t-sm relative group`}
                                style={{ height: `${heightPercentage}%` }}
                              >
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  ${item.revenue.toLocaleString()}
                                  {item.trend !== undefined && (
                                    <span className={item.trend > 0 ? "text-green-400" : item.trend < 0 ? "text-red-400" : ""}>
                                      {item.trend > 0 ? " +" : " "}{item.trend.toFixed(1)}%
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-xs mt-1 text-gray-600">
                                {item.month.substring(0, 3)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-md">
                    <BarChart3 className="h-16 w-16 text-gray-400" />
                    <span className="ml-2 text-gray-500">
                      No revenue data available
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Revenue Forecast Card */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Forecast</CardTitle>
                <CardDescription>Projected revenue for next 6 months</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoadingAnalytics ? (
                  <div className="h-full w-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : analyticsData?.revenueForecast ? (
                  <div className="h-full w-full">
                    <div className="h-full w-full flex flex-col">
                      <div className="flex-1 grid grid-cols-6 gap-1">
                        {analyticsData.revenueForecast.map((item, index) => {
                          // Calculate bar height percentage based on max revenue
                          const maxRevenue = Math.max(
                            ...analyticsData.revenueForecast.map(d => d.upperBound || d.predicted)
                          );
                          const heightPercentage = (item.predicted / maxRevenue) * 100;
                          const lowerBoundPercentage = ((item.lowerBound || item.predicted) / maxRevenue) * 100;
                          const upperBoundPercentage = ((item.upperBound || item.predicted) / maxRevenue) * 100;

                          return (
                            <div key={index} className="flex flex-col items-center justify-end h-[200px]">
                              {/* Confidence interval */}
                              <div className="relative w-full" style={{ height: `${upperBoundPercentage}%` }}>
                                <div
                                  className="absolute bottom-0 left-0 w-full bg-blue-200 opacity-30"
                                  style={{
                                    height: `${upperBoundPercentage - lowerBoundPercentage}%`,
                                  }}
                                ></div>
                                <div
                                  className="absolute bottom-0 left-0 w-full bg-blue-600 rounded-t-sm"
                                  style={{ height: `${heightPercentage}%` }}
                                >
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    ${item.predicted.toLocaleString()}
                                    <br />
                                    <span className="text-xs opacity-75">
                                      Range: ${item.lowerBound?.toLocaleString()} - ${item.upperBound?.toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs mt-1 text-gray-600 flex flex-col items-center">
                                <span>{item.month.substring(0, 3)}</span>
                                <span className="text-[10px] text-gray-400">{item.confidence}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-md">
                    <BarChart3 className="h-16 w-16 text-gray-400" />
                    <span className="ml-2 text-gray-500">
                      No forecast data available
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Trend Analysis Card */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Trends</CardTitle>
                <CardDescription>Analysis of payment patterns</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAnalytics ? (
                  <div className="h-[200px] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : analyticsData?.trendAnalysis ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Monthly Growth</h4>
                        <div className="flex items-center">
                          <span className={`text-2xl font-bold ${analyticsData.trendAnalysis.monthlyGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(analyticsData.trendAnalysis.monthlyGrowthRate * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Yearly Projection</h4>
                        <div className="flex items-center">
                          <span className={`text-2xl font-bold ${analyticsData.trendAnalysis.yearlyGrowthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(analyticsData.trendAnalysis.yearlyGrowthRate * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Revenue Stability</h4>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${analyticsData.trendAnalysis.revenueStability * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Unstable</span>
                        <span>Stable</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Top Growth Categories</h4>
                        <ul className="space-y-1">
                          {analyticsData.trendAnalysis.topGrowthCategories.map((cat, idx) => (
                            <li key={idx} className="text-sm flex justify-between">
                              <span>{cat.category}</span>
                              <span className="text-green-600">+{(cat.growthRate * 100).toFixed(1)}%</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Top Decline Categories</h4>
                        <ul className="space-y-1">
                          {analyticsData.trendAnalysis.topDeclineCategories.map((cat, idx) => (
                            <li key={idx} className="text-sm flex justify-between">
                              <span>{cat.category}</span>
                              <span className="text-red-600">-{(cat.declineRate * 100).toFixed(1)}%</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center bg-gray-100 rounded-md">
                    <BarChart3 className="h-16 w-16 text-gray-400" />
                    <span className="ml-2 text-gray-500">
                      No trend data available
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Top Families</CardTitle>
                <CardDescription>
                  Families with highest payment amounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Parent</TableHead>
                      <TableHead>Children</TableHead>
                      <TableHead>Total Paid</TableHead>
                      <TableHead>Pending</TableHead>
                      <TableHead>Overdue</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from(
                      new Set(displayPayments.map((p) => p.parentName)),
                    )
                      .slice(0, 5)
                      .map((parentName) => {
                        const parentPayments = displayPayments.filter(
                          (p) => p.parentName === parentName,
                        );
                        const totalPaid = parentPayments
                          .filter((p) => p.status === "paid")
                          .reduce((sum, p) => sum + p.amount, 0);
                        const totalPending = parentPayments
                          .filter((p) => p.status === "pending")
                          .reduce((sum, p) => sum + p.amount, 0);
                        const totalOverdue = parentPayments
                          .filter((p) => p.status === "overdue")
                          .reduce((sum, p) => sum + p.amount, 0);
                        const children = Array.from(
                          new Set(parentPayments.map((p) => p.childName)),
                        );

                        return (
                          <TableRow key={parentName}>
                            <TableCell className="font-medium">
                              {parentName}
                            </TableCell>
                            <TableCell>{children.join(", ")}</TableCell>
                            <TableCell>${totalPaid.toFixed(2)}</TableCell>
                            <TableCell>${totalPending.toFixed(2)}</TableCell>
                            <TableCell>${totalOverdue.toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="outline" size="sm">
                                <Users className="mr-2 h-4 w-4" />
                                View Family
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Payment Dialog */}
      <Dialog
        open={isViewPaymentDialogOpen}
        onOpenChange={setIsViewPaymentDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>
              Detailed information about this payment
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Parent
                  </h4>
                  <p className="font-medium">{selectedPayment.parentName}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Child
                  </h4>
                  <p>{selectedPayment.childName}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Payment Type
                  </h4>
                  <p>{selectedPayment.paymentType || "Tuition Fee"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Category
                  </h4>
                  <p>{selectedPayment.category || "Tuition"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Amount
                  </h4>
                  <p className="text-lg font-bold">
                    ${selectedPayment.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Status
                  </h4>
                  <Badge
                    variant={getStatusBadgeVariant(selectedPayment.status)}
                  >
                    {selectedPayment.status.charAt(0).toUpperCase() +
                      selectedPayment.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Payment Date
                  </h4>
                  <p>{new Date(selectedPayment.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Due Date
                  </h4>
                  <p>
                    {selectedPayment.dueDate
                      ? new Date(selectedPayment.dueDate).toLocaleDateString()
                      : "--"}
                  </p>
                </div>
              </div>

              {selectedPayment.paymentMethod && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Payment Method
                  </h4>
                  <p>{selectedPayment.paymentMethod}</p>
                </div>
              )}

              {selectedPayment.notes && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Notes
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedPayment.notes}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsViewPaymentDialogOpen(false)}
            >
              Close
            </Button>
            {selectedPayment && selectedPayment.status === "paid" && (
              <Button
                variant="outline"
                onClick={() => handleViewReceipt(selectedPayment.id)}
              >
                <FileText className="mr-2 h-4 w-4" />
                View Receipt
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receipt Dialog */}
      <Dialog
        open={isReceiptDialogOpen}
        onOpenChange={setIsReceiptDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          {receiptTransactionId ? (
            <PaymentReceipt
              transactionId={receiptTransactionId}
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

      {/* Payment Reminder Dialog */}
      <Dialog
        open={isReminderDialogOpen}
        onOpenChange={setIsReminderDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Payment Reminder</DialogTitle>
            <DialogDescription>
              Send a reminder email to the parent about their pending payment
            </DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="bg-muted p-3 rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium">Parent:</h4>
                    <p>{selectedPayment.parentName}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Amount Due:</h4>
                    <p className="font-bold">
                      ${selectedPayment.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <h4 className="text-sm font-medium">Payment Type:</h4>
                  <p>{selectedPayment.paymentType || "Tuition Fee"}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="reminder-subject">Email Subject</Label>
                <Input
                  id="reminder-subject"
                  defaultValue={`Payment Reminder: ${selectedPayment.paymentType || "Tuition Fee"} for ${selectedPayment.childName}`}
                />
              </div>

              <div>
                <Label htmlFor="reminder-message">Message</Label>
                <Textarea
                  id="reminder-message"
                  className="min-h-[150px]"
                  defaultValue={`Dear ${selectedPayment.parentName},

This is a friendly reminder that payment for ${selectedPayment.paymentType || "Tuition Fee"} in the amount of ${selectedPayment.amount.toFixed(2)} was due on ${selectedPayment.dueDate ? new Date(selectedPayment.dueDate).toLocaleDateString() : "[due date]"}.

Please process this payment at your earliest convenience.

Thank you,
Ninio Kindergarten Administration`}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReminderDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button>
              <Mail className="mr-2 h-4 w-4" />
              Send Reminder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentManagement;

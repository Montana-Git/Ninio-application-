import React, { useState } from "react";
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
  Users,
} from "lucide-react";

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

  // Mock data for default state
  const defaultPayments: Payment[] = [
    {
      id: "1",
      parentName: "John Smith",
      childName: "Emma Smith",
      amount: 250.0,
      date: "2023-05-15",
      dueDate: "2023-05-10",
      status: "paid",
      paymentType: "Tuition Fee",
      paymentMethod: "Credit Card",
      notes: "Monthly tuition payment",
      category: "Tuition",
    },
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

  const displayPayments = payments.length > 0 ? payments : defaultPayments;

  // Filter payments based on search query and filters
  const filteredPayments = displayPayments.filter((payment) => {
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
  const sortedPayments = [...filteredPayments].sort((a, b) => {
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

  const handleSelectPayment = (id: string) => {
    setSelectedPayments((prev) => {
      if (prev.includes(id)) {
        return prev.filter((paymentId) => paymentId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedPayments.length === sortedPayments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(sortedPayments.map((p) => p.id));
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
                            <Select defaultValue="john-smith">
                              <SelectTrigger>
                                <SelectValue placeholder="Select parent" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="john-smith">
                                  John Smith
                                </SelectItem>
                                <SelectItem value="sarah-johnson">
                                  Sarah Johnson
                                </SelectItem>
                                <SelectItem value="david-williams">
                                  David Williams
                                </SelectItem>
                                <SelectItem value="jennifer-brown">
                                  Jennifer Brown
                                </SelectItem>
                                <SelectItem value="robert-davis">
                                  Robert Davis
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="child">Child</Label>
                            <Select defaultValue="emma-smith">
                              <SelectTrigger>
                                <SelectValue placeholder="Select child" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="emma-smith">
                                  Emma Smith
                                </SelectItem>
                                <SelectItem value="michael-johnson">
                                  Michael Johnson
                                </SelectItem>
                                <SelectItem value="sophia-williams">
                                  Sophia Williams
                                </SelectItem>
                                <SelectItem value="oliver-brown">
                                  Oliver Brown
                                </SelectItem>
                                <SelectItem value="ava-davis">
                                  Ava Davis
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="payment-type">Payment Type</Label>
                            <Select defaultValue="tuition">
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="tuition">
                                  Tuition Fee
                                </SelectItem>
                                <SelectItem value="supplies">
                                  Art Supplies
                                </SelectItem>
                                <SelectItem value="activities">
                                  Field Trip
                                </SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="category">Category</Label>
                            <Select defaultValue="Tuition">
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
                                type="number"
                                defaultValue="250.00"
                                className="pl-8"
                              />
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select defaultValue="pending">
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="date">Payment Date</Label>
                            <Input
                              id="date"
                              type="date"
                              defaultValue={
                                new Date().toISOString().split("T")[0]
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="due-date">Due Date</Label>
                            <Input
                              id="due-date"
                              type="date"
                              defaultValue={
                                new Date().toISOString().split("T")[0]
                              }
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="payment-method">Payment Method</Label>
                          <Select defaultValue="credit-card">
                            <SelectTrigger>
                              <SelectValue placeholder="Select payment method" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="credit-card">
                                Credit Card
                              </SelectItem>
                              <SelectItem value="bank-transfer">
                                Bank Transfer
                              </SelectItem>
                              <SelectItem value="cash">Cash</SelectItem>
                              <SelectItem value="check">Check</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="notes">Notes</Label>
                          <Textarea
                            id="notes"
                            placeholder="Add any additional notes about this payment"
                            className="min-h-[80px]"
                          />
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                          <Checkbox id="send-notification" />
                          <Label
                            htmlFor="send-notification"
                            className="text-sm"
                          >
                            Send email notification to parent
                          </Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Process Payment</Button>
                      </DialogFooter>
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
                              onCheckedChange={() =>
                                handleSelectPayment(payment.id)
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
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                >
                                  <FileText className="h-4 w-4" />
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
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
                <CardDescription>Overview of payment status</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Categories</CardTitle>
                <CardDescription>Breakdown by payment type</CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Detailed Reports
                </Button>
              </CardFooter>
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
              <Button variant="outline">
                <FileText className="mr-2 h-4 w-4" />
                View Receipt
              </Button>
            )}
          </DialogFooter>
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

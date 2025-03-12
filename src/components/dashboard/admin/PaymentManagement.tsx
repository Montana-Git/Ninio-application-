import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Send, Download, Filter } from "lucide-react";

interface Payment {
  id: string;
  parentName: string;
  childName: string;
  amount: number;
  date: string;
  status: "paid" | "pending" | "overdue";
}

interface PaymentManagementProps {
  payments?: Payment[];
}

const PaymentManagement = ({ payments = [] }: PaymentManagementProps) => {
  const [isNewPaymentDialogOpen, setIsNewPaymentDialogOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Mock data for default state
  const defaultPayments: Payment[] = [
    {
      id: "1",
      parentName: "John Smith",
      childName: "Emma Smith",
      amount: 250.0,
      date: "2023-05-15",
      status: "paid",
    },
    {
      id: "2",
      parentName: "Sarah Johnson",
      childName: "Michael Johnson",
      amount: 250.0,
      date: "2023-05-20",
      status: "pending",
    },
    {
      id: "3",
      parentName: "David Williams",
      childName: "Sophia Williams",
      amount: 250.0,
      date: "2023-04-15",
      status: "overdue",
    },
    {
      id: "4",
      parentName: "Jennifer Brown",
      childName: "Oliver Brown",
      amount: 250.0,
      date: "2023-05-10",
      status: "paid",
    },
    {
      id: "5",
      parentName: "Robert Davis",
      childName: "Ava Davis",
      amount: 250.0,
      date: "2023-05-25",
      status: "pending",
    },
  ];

  const displayPayments = payments.length > 0 ? payments : defaultPayments;

  // Filter payments based on search query and status filter
  const filteredPayments = displayPayments.filter((payment) => {
    const matchesSearch =
      payment.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.childName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || payment.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

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

  return (
    <div className="w-full h-full bg-background p-6">
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Payment Management</CardTitle>
              <CardDescription>
                Process and track payments from parents
              </CardDescription>
            </div>
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
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Process New Payment</DialogTitle>
                  <DialogDescription>
                    Enter the details to process a new payment.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="parent" className="text-right">
                      Parent
                    </label>
                    <Select defaultValue="john-smith">
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select parent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="john-smith">John Smith</SelectItem>
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
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="child" className="text-right">
                      Child
                    </label>
                    <Select defaultValue="emma-smith">
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select child" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emma-smith">Emma Smith</SelectItem>
                        <SelectItem value="michael-johnson">
                          Michael Johnson
                        </SelectItem>
                        <SelectItem value="sophia-williams">
                          Sophia Williams
                        </SelectItem>
                        <SelectItem value="oliver-brown">
                          Oliver Brown
                        </SelectItem>
                        <SelectItem value="ava-davis">Ava Davis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="amount" className="text-right">
                      Amount
                    </label>
                    <Input
                      id="amount"
                      type="number"
                      defaultValue="250.00"
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <label htmlFor="date" className="text-right">
                      Date
                    </label>
                    <Input
                      id="date"
                      type="date"
                      defaultValue={new Date().toISOString().split("T")[0]}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsNewPaymentDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => setIsNewPaymentDialogOpen(false)}>
                    Process Payment
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search parents or children..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                defaultValue="all"
                onValueChange={(value) => setFilterStatus(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parent</TableHead>
                  <TableHead>Child</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{payment.parentName}</TableCell>
                      <TableCell>{payment.childName}</TableCell>
                      <TableCell>${payment.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        {new Date(payment.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(payment.status)}>
                          {payment.status.charAt(0).toUpperCase() +
                            payment.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {payment.status === "pending" ||
                          payment.status === "overdue" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2"
                            >
                              <Send className="h-3.5 w-3.5 mr-1" />
                              Remind
                            </Button>
                          ) : null}
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2"
                          >
                            View
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-6 text-muted-foreground"
                    >
                      No payments found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredPayments.length} of {displayPayments.length}{" "}
            payments
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              Send Reminders
            </Button>
            <Button size="sm">Generate Report</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentManagement;

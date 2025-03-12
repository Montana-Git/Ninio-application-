import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import { CreditCard, Download, AlertCircle } from "lucide-react";

interface Payment {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  description: string;
}

interface DuePayment {
  id: string;
  dueDate: string;
  amount: number;
  description: string;
  daysOverdue?: number;
}

interface PaymentSectionProps {
  paymentHistory?: Payment[];
  duePayments?: DuePayment[];
}

const PaymentSection = ({
  paymentHistory = [
    {
      id: "1",
      date: "2023-05-15",
      amount: 250,
      status: "paid",
      description: "May Tuition Fee",
    },
    {
      id: "2",
      date: "2023-06-15",
      amount: 250,
      status: "paid",
      description: "June Tuition Fee",
    },
    {
      id: "3",
      date: "2023-07-15",
      amount: 250,
      status: "paid",
      description: "July Tuition Fee",
    },
    {
      id: "4",
      date: "2023-08-15",
      amount: 275,
      status: "pending",
      description: "August Tuition Fee",
    },
  ],
  duePayments = [
    {
      id: "5",
      dueDate: "2023-09-15",
      amount: 275,
      description: "September Tuition Fee",
    },
    {
      id: "6",
      dueDate: "2023-09-30",
      amount: 50,
      description: "Art Supplies Fee",
    },
    {
      id: "7",
      dueDate: "2023-08-30",
      amount: 100,
      description: "Field Trip Fee",
      daysOverdue: 7,
    },
  ],
}: PaymentSectionProps) => {
  return (
    <div className="w-full bg-white p-6 rounded-lg">
      <Tabs defaultValue="due" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Payments</h2>
          <TabsList>
            <TabsTrigger value="due">Due Payments</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
          </TabsList>
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
                            <Button size="sm">
                              <CreditCard className="mr-2 h-4 w-4" />
                              Pay Now
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
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
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>View all your previous payments</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.description}
                      </TableCell>
                      <TableCell>{payment.date}</TableCell>
                      <TableCell>${payment.amount.toFixed(2)}</TableCell>
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
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Receipt
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PaymentSection;

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface Payment {
  id: number;
  date: string;
  amount: number;
  method: string;
  status: "Paid" | "Pending" | "Failed";
}

export default function PaymentHistoryTenant() {
  // In real use, you'd fetch these from your API
  const [payments, setPayments] = useState<Payment[]>([]);
  const [month, setMonth] = useState<string>("2025-06");

  useEffect(() => {
    // Dummy fetch simulation
    const data: Payment[] = [
      { id: 1, date: "2025-05-05", amount: 12000, method: "Credit Card", status: "Paid" },
      { id: 2, date: "2025-06-05", amount: 12000, method: "Bank Transfer", status: "Paid" },
      { id: 3, date: "2025-07-05", amount: 12000, method: "GCash", status: "Pending" },
    ];
    setPayments(data.filter(p => p.date.startsWith(month)));
  }, [month]);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header with month filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Payment History</h2>
        <div className="w-40">
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger>
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025-04">April 2025</SelectItem>
              <SelectItem value="2025-05">May 2025</SelectItem>
              <SelectItem value="2025-06">June 2025</SelectItem>
              <SelectItem value="2025-07">July 2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Read‑only Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payments for {month}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length > 0 ? (
                payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.id}</TableCell>
                    <TableCell>{p.date}</TableCell>
                    <TableCell className="text-right">
                      ₱{p.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{p.method}</TableCell>
                    <TableCell>{p.status}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No payments found for this month.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Calendar,
  Wrench,
  FileText,
  MessageCircle,
} from "lucide-react";

export default function TenantDashboard() {
  // Example state—swap in your real data / API hooks
  const [month] = useState<string>("2025-06");
  const upcomingRent = {
    dueDate: "2025-07-05",
    amount: 12000,
    property: "Condo B",
  };
  const leaseInfo = {
    start: "2025-01-01",
    end: "2026-01-01",
    unit: "Unit 4A",
  };
  const maintenanceRequests = [
    { id: 1, issue: "Leaky faucet", status: "Resolved", date: "2025-06-10" },
    { id: 2, issue: "AC not cooling", status: "In Progress", date: "2025-06-12" },
  ];
  const payments = [
    { id: 1, date: "2025-05-05", amount: 12000, status: "Paid" },
    { id: 2, date: "2025-06-05", amount: 12000, status: "Pending" },
  ];
  const messages = [
    { id: 1, from: "Landlord", subject: "Welcome!", date: "2025-06-01" },
    { id: 2, from: "Support", subject: "Rent Reminder", date: "2025-06-03" },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-teal-500" />
            <CardTitle>Upcoming Rent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">
              ₱{upcomingRent.amount.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              Due {upcomingRent.dueDate}
            </p>
            <p className="text-sm text-gray-600">{upcomingRent.property}</p>
            <Button size="sm" className="mt-3">
              Pay Now
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <CardTitle>Lease Period</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {leaseInfo.start} – {leaseInfo.end}
            </p>
            <p className="text-sm text-gray-600">Unit: {leaseInfo.unit}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center space-x-2">
            <Wrench className="h-5 w-5 text-yellow-500" />
            <CardTitle>My Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">
              {maintenanceRequests.length}
            </p>
            <p className="text-sm text-gray-600">Total Tickets</p>
            <Button size="sm" className="mt-3">
              View Requests
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-purple-500" />
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{messages.length}</p>
            <p className="text-sm text-gray-600">New Conversations</p>
            <Button size="sm" className="mt-3">
              View Messages
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Detail Tabs */}
      <Tabs defaultValue="rent" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <TabsTrigger value="rent">Payment History</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="leases">Leases</TabsTrigger>
        </TabsList>

        {/* Payment History */}
        <TabsContent value="rent">
          <Card>
            <CardHeader>
              <CardTitle>Payment History ({month})</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.id}</TableCell>
                      <TableCell>{p.date}</TableCell>
                      <TableCell className="text-right">
                        ₱{p.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{p.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Requests */}
        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Requests</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Issue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceRequests.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.id}</TableCell>
                      <TableCell>{r.issue}</TableCell>
                      <TableCell>{r.status}</TableCell>
                      <TableCell>{r.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messages */}
        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell>{m.id}</TableCell>
                      <TableCell>{m.from}</TableCell>
                      <TableCell>{m.subject}</TableCell>
                      <TableCell>{m.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lease Agreements */}
        <TabsContent value="leases">
          <Card>
            <CardHeader>
              <CardTitle>Lease Agreements</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <FileText className="inline-block h-4 w-4 mr-1 text-gray-600" />
                  Lease #{leaseInfo.unit} — {leaseInfo.start} to {leaseInfo.end}
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

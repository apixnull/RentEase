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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { BarChart2, PieChart, Users, Home, DollarSign, PenTool } from "lucide-react";

export default function LandlordDashboard() {
  // Month in YYYY-MM format
  const [month, setMonth] = useState<string>("2025-06");

  // Dummy stats
  const stats = {
    totalProperties: 12,
    activeTenants: 35,
    incomeThisMonth: 152_000,
    expenseThisMonth: 42_000,
  };

  // Dummy data
  const maintenanceByStatus = [
    { status: "Pending", count: 5 },
    { status: "In Progress", count: 3 },
    { status: "Completed", count: 12 },
  ];
  const newApplicants = [
    { id: 1, name: "Alice Ramos", applied: `${month}-03`, status: "Pending" },
    { id: 2, name: "Ben Cruz", applied: `${month}-05`, status: "Approved" },
    { id: 3, name: "Costa Lee", applied: `${month}-07`, status: "Rejected" },
  ];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Month selector */}
      <div className="flex justify-end">
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2025-04">April 2025</SelectItem>
            <SelectItem value="2025-05">May 2025</SelectItem>
            <SelectItem value="2025-06">June 2025</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex items-center space-x-2">
            <Home className="h-5 w-5 text-blue-500" />
            <CardTitle>Total Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.totalProperties}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-green-500" />
            <CardTitle>Active Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.activeTenants}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-teal-500" />
            <CardTitle>Income (Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              ₱{stats.incomeThisMonth.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center space-x-2">
            <PenTool className="h-5 w-5 text-red-500" />
            <CardTitle>Expenses (Month)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              ₱{stats.expenseThisMonth.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Tabs value="overview" onValueChange={() => {}} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="applicants">Applicants</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>

        {/* Overview: quick tables */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Maintenance table */}
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Requests</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenanceByStatus.map((m) => (
                      <TableRow key={m.status}>
                        <TableCell>{m.status}</TableCell>
                        <TableCell className="text-right">{m.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Applicants table */}
            <Card>
              <CardHeader>
                <CardTitle>New Applicants</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newApplicants.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>{a.id}</TableCell>
                        <TableCell>{a.name}</TableCell>
                        <TableCell>{a.applied}</TableCell>
                        <TableCell>{a.status}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Maintenance breakdown chart */}
        <TabsContent value="maintenance">
          <Card>
            <CardHeader className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <CardTitle>Maintenance by Status</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center border border-dashed rounded text-gray-400">
              {/* Chart goes here */}
              Pie chart placeholder
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applicants trends chart */}
        <TabsContent value="applicants">
          <Card>
            <CardHeader className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <CardTitle>Applicant Trends</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center border border-dashed rounded text-gray-400">
              {/* Chart goes here */}
              Line chart placeholder
            </CardContent>
          </Card>
        </TabsContent>

        {/* Income vs Expense bar chart */}
        <TabsContent value="charts">
          <Card>
            <CardHeader className="flex items-center space-x-2">
              <BarChart2 className="h-5 w-5" />
              <CardTitle>Income vs. Expenses</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center border border-dashed rounded text-gray-400">
              {/* Chart goes here */}
              Bar chart placeholder
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

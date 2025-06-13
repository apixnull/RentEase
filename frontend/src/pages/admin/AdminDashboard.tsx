import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Users,
  Home,
  FileText,
  BarChart2,
} from "lucide-react";

interface User {
  id: number;
  name: string;
  role: "Admin" | "Landlord" | "Tenant";
  email: string;
  status: "Active" | "Suspended";
}

interface Listing {
  id: number;
  title: string;
  landlord: string;
  status: "Pending" | "Approved" | "Rejected";
  date: string;
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<"users" | "listings" | "reports">("users");

  // Dummy stats
  const stats = {
    totalUsers: 120,
    totalLandlords: 30,
    totalTenants: 80,
    pendingListings: 12,
  };

  // Dummy data
  const users: User[] = [
    { id: 1, name: "Anna Santos", role: "Landlord", email: "anna@rent.com", status: "Active" },
    { id: 2, name: "Ben Cruz", role: "Tenant", email: "ben@rent.com", status: "Active" },
    { id: 3, name: "Cathy Lee", role: "Tenant", email: "cathy@rent.com", status: "Suspended" },
  ];
  const listings: Listing[] = [
    { id: 101, title: "Condo B", landlord: "Anna Santos", status: "Pending", date: "2025-06-10" },
    { id: 102, title: "Villa C", landlord: "Mark Tan", status: "Pending", date: "2025-06-11" },
    { id: 103, title: "Apartment A", landlord: "Julia Reyes", status: "Approved", date: "2025-06-05" },
  ];

  return (
    <div className="p-4 md:p-6 max-w-screen-xl mx-auto space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-indigo-500" />
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.totalUsers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center space-x-2">
            <Home className="h-5 w-5 text-green-500" />
            <CardTitle>Landlords</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.totalLandlords}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-teal-500" />
            <CardTitle>Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.totalTenants}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-yellow-500" />
            <CardTitle>Pending Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.pendingListings}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Users / Listings / Reports */}
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as "users" | "listings" | "reports")}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="listings">Listings Review</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* User Management */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>{u.id}</TableCell>
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.role}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Listings Review */}
        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle>Listings Review</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Landlord</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Submitted</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>{l.id}</TableCell>
                      <TableCell>{l.title}</TableCell>
                      <TableCell>{l.landlord}</TableCell>
                      <TableCell>{l.status}</TableCell>
                      <TableCell>{l.date}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            /* open review modal */
                          }}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports */}
        <TabsContent value="reports">
          <Card>
            <CardHeader className="flex items-center space-x-2">
              <BarChart2 className="h-5 w-5" />
              <CardTitle>Monthly Reports</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center border border-dashed rounded text-gray-400">
              {/* Plug in your Admin reports charts here */}
              Reports chart placeholder
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

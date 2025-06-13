import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  User,
  Phone,
  Mail,
  Calendar,
  Home,
  MapPin,
  Bed,
  Bath,
  Ruler,
  Star,
  Users,
  Clock,
  FilePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Property {
  id: number;
  title: string;
  address: string;
  type: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  price: number;
  status: "occupied" | "vacant";
  rating: number;
  image: string;
  description: string;
  amenities: string[];
}

interface Tenant {
  id: number;
  propertyId: number;
  name: string;
  email: string;
  phone: string;
  leaseStart: string;
  leaseEnd: string;
  rentAmount: number;
  paymentStatus: "current" | "overdue";
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
}

interface FinancialRecord {
  id: number;
  propertyId: number;
  type: "income" | "expense";
  amount: number;
  date: string;
  category: string;
  description: string;
}

// Hard-coded data
const properties: Property[] = [
  {
    id: 1,
    title: "Modern Downtown Apartment",
    address: "123 Main St, New York, NY 10001",
    type: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    price: 3200,
    status: "occupied",
    rating: 4.8,
    image: "/property1.jpg",
    description:
      "A modern apartment in the heart of downtown with great amenities and views of the city skyline.",
    amenities: ["Parking", "Gym", "Laundry", "AC", "Balcony"],
  },
  // …additional properties…
];

const tenants: Tenant[] = [
  {
    id: 1,
    propertyId: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "(555) 123-4567",
    leaseStart: "2023-01-15",
    leaseEnd: "2024-01-14",
    rentAmount: 3200,
    paymentStatus: "current",
    emergencyContact: {
      name: "Michael Johnson",
      phone: "(555) 987-6543",
      relation: "Spouse",
    },
  },
  // …additional tenants…
];

const financials: FinancialRecord[] = [
  { id: 1, propertyId: 1, type: "income", amount: 3200, date: "2023-06-01", category: "Rent", description: "Monthly rent payment" },
  { id: 2, propertyId: 1, type: "expense", amount: 150, date: "2023-06-05", category: "Maintenance", description: "Plumbing repair" },
  { id: 3, propertyId: 1, type: "expense", amount: 200, date: "2023-06-10", category: "Utilities", description: "Water bill" },
  { id: 4, propertyId: 1, type: "income", amount: 3200, date: "2023-05-01", category: "Rent", description: "Monthly rent payment" },
  // …additional records…
];

export const PropertyInfo = () => {
  const { id } = useParams<{ id?: string }>();
  const propId = Number(id);
  // pick matching or fallback to first
  const property =
    properties.find((p) => p.id === propId) || properties[0];

  const propertyTenant =
    tenants.find((t) => t.propertyId === property.id) || null;
  const propertyFinancials = financials.filter(
    (f) => f.propertyId === property.id
  );

  const totalIncome = propertyFinancials
    .filter((f) => f.type === "income")
    .reduce((sum, f) => sum + f.amount, 0);
  const totalExpenses = propertyFinancials
    .filter((f) => f.type === "expense")
    .reduce((sum, f) => sum + f.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/landlord/properties">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-2xl font-bold">{property.title}</h2>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/landlord/properties/${property.id}/edit`}>
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Link>
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overview & Tenant */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Card */}
          <Card>
            <div className="relative">
              <img
                src={property.image}
                alt={property.title}
                className="w-full h-64 object-cover rounded-t-lg"
              />
              <Badge className="absolute top-4 right-4">
                {property.status === "occupied" ? "Occupied" : "Vacant"}
              </Badge>
            </div>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{property.title}</CardTitle>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500 mr-1" />
                  {property.rating}
                </div>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-1" /> {property.address}
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{property.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { icon: <Home className="h-5 w-5" />, label: "Type", value: property.type },
                  { icon: <Bed className="h-5 w-5" />, label: "Bedrooms", value: property.bedrooms },
                  { icon: <Bath className="h-5 w-5" />, label: "Bathrooms", value: property.bathrooms },
                  { icon: <Ruler className="h-5 w-5" />, label: "Area", value: `${property.area} sqft` },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    {item.icon}
                    <div>
                      <p className="text-sm text-gray-500">{item.label}</p>
                      <p>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="font-semibold mb-2">Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <Badge key={a}>{a}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tenant Info */}
          {propertyTenant && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" /> Tenant Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Primary Tenant</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" /> {propertyTenant.name}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" /> {propertyTenant.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" /> {propertyTenant.phone}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Lease Details</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />{" "}
                        {new Date(propertyTenant.leaseStart).toLocaleDateString()} –{" "}
                        {new Date(propertyTenant.leaseEnd).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" /> ${propertyTenant.rentAmount}/mo
                      </div>
                      <Badge variant={propertyTenant.paymentStatus === "current" ? "default" : "destructive"}>
                        {propertyTenant.paymentStatus === "current" ? "Payment Current" : "Payment Overdue"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Emergency Contact</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" /> {propertyTenant.emergencyContact.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" /> {propertyTenant.emergencyContact.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" /> {propertyTenant.emergencyContact.relation}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" /> Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Total Income</span>
                <span className="text-green-600 font-medium">${totalIncome}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Expenses</span>
                <span className="text-red-600 font-medium">${totalExpenses}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span>Net Profit</span>
                <span className={netProfit >= 0 ? "text-green-600" : "text-red-600"}>
                  ${netProfit}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button variant="outline" asChild>
                <Link to={`/landlord/properties/${property.id}/add-lease`}>
                  <FilePlus className="h-4 w-4 mr-1" /> Add Lease
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/landlord/properties/${property.id}/record-income`}>
                  <TrendingUp className="h-4 w-4 mr-1" /> Record Income
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to={`/landlord/properties/${property.id}/record-expense`}>
                  <TrendingDown className="h-4 w-4 mr-1" /> Record Expense
                </Link>
              </Button>
              {!propertyTenant && (
                <Button variant="outline" asChild>
                  <Link to={`/landlord/properties/${property.id}/add-tenant`}>
                    <User className="h-4 w-4 mr-1" /> Add Tenant
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" /> Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-full">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Lease agreement signed</p>
                  <p className="text-sm text-gray-500">2 days ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <DollarSign className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">Rent payment received</p>
                  <p className="text-sm text-gray-500">5 days ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Financial Records Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {propertyFinancials.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={r.type === "income" ? "default" : "destructive"}>
                          {r.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{r.category}</TableCell>
                      <TableCell>{r.description}</TableCell>
                      <TableCell className="text-right">
                        <span className={r.type === "income" ? "text-green-600" : "text-red-600"}>
                          {r.type === "income" ? "+" : "-"}${r.amount}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="income">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {propertyFinancials
                    .filter((r) => r.type === "income")
                    .map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                        <TableCell>{r.category}</TableCell>
                        <TableCell>{r.description}</TableCell>
                        <TableCell className="text-right text-green-600">
                          +${r.amount}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="expenses">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {propertyFinancials
                    .filter((r) => r.type === "expense")
                    .map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                        <TableCell>{r.category}</TableCell>
                        <TableCell>{r.description}</TableCell>
                        <TableCell className="text-right text-red-600">
                          -${r.amount}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Delete Property</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Are you sure you want to delete this property? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                  Cancel
                </Button>
                <Button variant="destructive">Delete Property</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

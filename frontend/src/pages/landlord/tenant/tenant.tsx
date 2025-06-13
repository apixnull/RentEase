import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Property {
  id: number;
  title: string;
}

interface Tenant {
  id: number;
  propertyId: number;
  name: string;
  email: string;
  phone: string;
  leaseStart: string;
  leaseEnd: string;
}

const properties: Property[] = [
  { id: 1, title: "Modern Downtown Apartment" },
  { id: 2, title: "Luxury Villa in Banilad" },
  { id: 3, title: "Garden Condo in Uptown" },
];

const initialTenants: Tenant[] = [
  {
    id: 1,
    propertyId: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    phone: "+63 912 345 6789",
    leaseStart: "2025-01-15",
    leaseEnd: "2026-01-14",
  },
  {
    id: 2,
    propertyId: 2,
    name: "Michael Lee",
    email: "michael.lee@example.com",
    phone: "+63 917 654 3210",
    leaseStart: "2024-09-01",
    leaseEnd: "2025-08-31",
  },
  {
    id: 3,
    propertyId: 3,
    name: "Anna Cruz",
    email: "anna.cruz@example.com",
    phone: "+63 918 555 6666",
    leaseStart: "2025-03-01",
    leaseEnd: "2026-02-28",
  },
];

export default function Tenants() {
  const [tenants] = useState<Tenant[]>(initialTenants);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Current Tenants</h1>
      </div>

      {/* Table view on large screens */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Lease Period</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((t) => {
              const prop = properties.find((p) => p.id === t.propertyId)!;
              return (
                <TableRow key={t.id}>
                  <TableCell>{t.id}</TableCell>
                  <TableCell>{t.name}</TableCell>
                  <TableCell>{prop.title}</TableCell>
                  <TableCell>{t.email}</TableCell>
                  <TableCell>{t.phone}</TableCell>
                  <TableCell>
                    {new Date(t.leaseStart).toLocaleDateString()} –{" "}
                    {new Date(t.leaseEnd).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="icon" asChild title="View">
                      <Link to={`/tenants/${t.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Card view on smaller screens */}
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        {tenants.map((t) => {
          const prop = properties.find((p) => p.id === t.propertyId)!;
          return (
            <Card key={t.id}>
              <CardHeader>
                <CardTitle className="text-lg">{t.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <strong>Property:</strong> {prop.title}
                </p>
                <p>
                  <strong>Email:</strong> {t.email}
                </p>
                <p>
                  <strong>Phone:</strong> {t.phone}
                </p>
                <p>
                  <strong>Lease:</strong>{" "}
                  {new Date(t.leaseStart).toLocaleDateString()} –{" "}
                  {new Date(t.leaseEnd).toLocaleDateString()}
                </p>
                <div className="mt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/tenants/${t.id}`} className="flex items-center gap-1">
                      <Eye className="h-4 w-4" /> View
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

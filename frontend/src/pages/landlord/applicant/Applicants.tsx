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

interface Applicant {
  id: number;
  propertyId: number;
  name: string;
  email: string;
  phone: string;
  dateSubmitted: string;
}

const properties: Property[] = [
  { id: 1, title: "Modern Downtown Apartment" },
  { id: 2, title: "Luxury Villa in Banilad" },
  { id: 3, title: "Garden Condo in Uptown" },
];

const initialApplicants: Applicant[] = [
  {
    id: 1,
    propertyId: 1,
    name: "Alice Reyes",
    email: "alice.reyes@example.com",
    phone: "+63 912 111 2222",
    dateSubmitted: "2025-06-10",
  },
  {
    id: 2,
    propertyId: 2,
    name: "Ben Santos",
    email: "ben.santos@example.com",
    phone: "+63 917 333 4444",
    dateSubmitted: "2025-06-09",
  },
  {
    id: 3,
    propertyId: 3,
    name: "Carla Mendoza",
    email: "carla.mendoza@example.com",
    phone: "+63 918 555 6666",
    dateSubmitted: "2025-06-08",
  },
];

export default function Applicants() {
  const [applicants] = useState<Applicant[]>(initialApplicants);

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Applicants</h1>
      </div>

      {/* Table view on lg+ */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Date Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {applicants.map((app) => {
              const prop = properties.find((p) => p.id === app.propertyId)!;
              return (
                <TableRow key={app.id}>
                  <TableCell>{app.id}</TableCell>
                  <TableCell>{prop.title}</TableCell>
                  <TableCell>{app.name}</TableCell>
                  <TableCell>{app.email}</TableCell>
                  <TableCell>{app.phone}</TableCell>
                  <TableCell>{new Date(app.dateSubmitted).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="icon" asChild title="View">
                      <Link to={`/applicants/${app.id}`}>
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
        {applicants.map((app) => {
          const prop = properties.find((p) => p.id === app.propertyId)!;
          return (
            <Card key={app.id}>
              <CardHeader>
                <CardTitle className="text-lg">#{app.id} – {prop.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p><strong>Name:</strong> {app.name}</p>
                <p><strong>Email:</strong> {app.email}</p>
                <p><strong>Phone:</strong> {app.phone}</p>
                <p><strong>Date:</strong> {new Date(app.dateSubmitted).toLocaleDateString()}</p>
                <div className="mt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/applicants/${app.id}`} className="flex items-center gap-1">
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

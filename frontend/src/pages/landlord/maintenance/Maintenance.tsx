import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  Edit,
  Check,
  Trash2,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Property {
  id: number;
  title: string;
}

interface MaintenanceRequest {
  id: number;
  propertyId: number;
  tenantName: string;
  date: string;
  description: string;
  status: "pending" | "in progress" | "resolved";
  isTenantSubmitted: boolean;
}

const properties: Property[] = [
  { id: 1, title: "Modern Downtown Apartment" },
  { id: 2, title: "Luxury Villa in Banilad" },
  { id: 3, title: "Garden Condo in Uptown" },
];

const initialRequests: MaintenanceRequest[] = [
  {
    id: 1,
    propertyId: 1,
    tenantName: "Sarah Johnson",
    date: "2025-06-08",
    description: "Kitchen faucet is leaking continuously.",
    status: "pending",
    isTenantSubmitted: true,
  },
  {
    id: 2,
    propertyId: 2,
    tenantName: "Michael Lee",
    date: "2025-06-05",
    description: "Air conditioner making loud noise.",
    status: "in progress",
    isTenantSubmitted: true,
  },
  {
    id: 3,
    propertyId: 1,
    tenantName: "Sarah Johnson",
    date: "2025-06-07",
    description: "Scheduled pipe check-up (internal note).",
    status: "in progress",
    isTenantSubmitted: false,
  },
];

export default function Maintenance() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>(initialRequests);

  const handleResolve = (id: number) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "resolved" } : r))
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm("Delete this request?")) return;
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const renderStatus = (status: MaintenanceRequest["status"]) => {
    const variant =
      status === "pending" ? "destructive" :
      status === "in progress" ? "default" :
      "secondary";
    return <Badge variant={variant}>{status[0].toUpperCase() + status.slice(1)}</Badge>;
  };

  const tenantRequests = requests.filter((r) => r.isTenantSubmitted);
  const notedRequests  = requests.filter((r) => !r.isTenantSubmitted);

  const renderList = (list: MaintenanceRequest[]) => (
    <>
      {/* Table on large screens */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((r) => {
              const prop = properties.find((p) => p.id === r.propertyId)!;
              return (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{prop.title}</TableCell>
                  <TableCell>{r.tenantName}</TableCell>
                  <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                  <TableCell>{renderStatus(r.status)}</TableCell>
                  <TableCell className="truncate max-w-xs">{r.description}</TableCell>
                  <TableCell className="space-x-1">
                    <Button variant="outline" size="icon" asChild title="View">
                      <Link to={`/maintenance/${r.id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                    <Button variant="outline" size="icon" asChild title="Edit">
                      <Link to={`/maintenance/${r.id}/edit`}><Edit className="h-4 w-4" /></Link>
                    </Button>
                    {r.status !== "resolved" && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleResolve(r.id)}
                        title="Mark Resolved"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(r.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Cards on small/medium screens */}
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((r) => {
          const prop = properties.find((p) => p.id === r.propertyId)!;
          return (
            <Card key={r.id}>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>#{r.id} – {prop.title}</CardTitle>
                {renderStatus(r.status)}
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {r.isTenantSubmitted && (
                  <p><strong>Tenant:</strong> {r.tenantName}</p>
                )}
                <p><strong>Date:</strong> {new Date(r.date).toLocaleDateString()}</p>
                <p className="truncate"><strong>Issue:</strong> {r.description}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/maintenance/${r.id}`}>View</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/maintenance/${r.id}/edit`}>Edit</Link>
                  </Button>
                  {r.status !== "resolved" && (
                    <Button variant="outline" size="sm" onClick={() => handleResolve(r.id)}>
                      Resolve
                    </Button>
                  )}
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(r.id)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );

  return (
    <div className="p-6 space-y-8">
      {/* Header with Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Maintenance Requests</h1>
        <Button
          size="sm"
          asChild
        >
          <Link to="/maintenance/new">
            <Plus className="h-4 w-4 mr-1" />
            Add Maintenance
          </Link>
        </Button>
      </div>

      <section>
        <h2 className="text-xl font-semibold mb-4">Requests from Tenants</h2>
        {tenantRequests.length
          ? renderList(tenantRequests)
          : <p className="text-gray-500">No tenant-submitted requests.</p>}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Maintenance Notes</h2>
        {notedRequests.length
          ? renderList(notedRequests)
          : <p className="text-gray-500">No internal maintenance notes.</p>}
      </section>
    </div>
  );
}

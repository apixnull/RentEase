import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Edit, Check, Trash2, MapPin, User, Calendar, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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

const dummyRequests: MaintenanceRequest[] = [
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
    description: "Scheduled pipe check‑up (internal note).",
    status: "in progress",
    isTenantSubmitted: false,
  },
];

export default function MaintenanceDetails() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [requests, setRequests] = useState(dummyRequests);

  const reqId = id ? Number(id) : NaN;
  const req = requests.find((r) => r.id === reqId) ?? requests[0]!;

  const prop = properties.find((p) => p.id === req.propertyId);

  const handleResolve = () => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === req.id ? { ...r, status: "resolved" } : r
      )
    );
  };

  const handleDelete = () => {
    if (!confirm("Delete this maintenance request?")) return;
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
    navigate("/maintenance");
  };

  const statusVariant =
    req.status === "pending"
      ? "destructive"
      : req.status === "in progress"
      ? "default"
      : "secondary";

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            title="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-semibold">Maintenance #{req.id}</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            asChild
            title="Edit"
          >
            <Link to={`/maintenance/${req.id}/edit`}>
              <Edit className="h-5 w-5" />
            </Link>
          </Button>
          {req.status !== "resolved" && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleResolve}
              title="Mark Resolved"
            >
              <Check className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="destructive"
            size="icon"
            onClick={handleDelete}
            title="Delete"
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Info Card */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Details</CardTitle>
              <Badge variant={statusVariant}>
                {req.status[0].toUpperCase() + req.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {prop && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                <span className="font-medium">{prop.title}</span>
              </div>
            )}
            {req.isTenantSubmitted && (
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-500" />
                <span>{req.tenantName}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <span>{new Date(req.date).toLocaleDateString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Description Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-2">
              <Clipboard className="h-5 w-5 text-gray-500 mt-1" />
              <p className="text-gray-700">{req.description}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

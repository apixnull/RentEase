import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  MapPin,
  Calendar,
  DollarSign,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Tenant {
  id: number;
  name: string;
  email: string;
}

interface Property {
  id: number;
  title: string;
}

interface Payment {
  id: number;
  tenantId: number;
  propertyId: number;
  amount: number;
  date: string;
  method: "Cash" | "GCash" | "Credit Card" | "Bank Transfer";
  receiptUrl?: string;
}

const tenants: Tenant[] = [
  { id: 1, name: "Sarah Johnson", email: "sarah.johnson@example.com" },
  { id: 2, name: "Michael Lee",   email: "michael.lee@example.com"   },
];

const properties: Property[] = [
  { id: 1, title: "Modern Downtown Apartment" },
  { id: 2, title: "Luxury Villa in Banilad"       },
];

const initialPayments: Payment[] = [
  {
    id: 1,
    tenantId: 1,
    propertyId: 1,
    amount: 3200,
    date: "2025-06-01",
    method: "GCash",
    receiptUrl: "/receipts/receipt1.jpg",
  },
  {
    id: 2,
    tenantId: 2,
    propertyId: 2,
    amount: 5000,
    date: "2025-06-05",
    method: "Cash",
  },
];

export default function PaymentDetails() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>(initialPayments);

  const payId = id ? Number(id) : NaN;
  const pay = payments.find((p) => p.id === payId) ?? payments[0]!;

  const tenant = tenants.find((t) => t.id === pay.tenantId)!;
  const property = properties.find((p) => p.id === pay.propertyId)!;

  const handleDelete = () => {
    if (!confirm("Delete this payment?")) return;
    setPayments((prev) => prev.filter((p) => p.id !== pay.id));
    navigate("/payments");
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
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
          <h1 className="text-3xl font-semibold">Payment #{pay.id}</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            asChild
            title="Edit"
          >
            <Link to={`/payments/${pay.id}/edit`}>
              <Edit className="h-5 w-5" />
            </Link>
          </Button>
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
        {/* Receipt Image (if any) */}
        {pay.receiptUrl && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <ImageIcon /> Receipt
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <img
                src={pay.receiptUrl}
                alt={`Receipt #${pay.id}`}
                className="w-full h-auto object-contain"
              />
            </CardContent>
          </Card>
        )}

        {/* Tenant & Property Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Payer Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="font-medium">{tenant.name}</p>
                <p className="text-xs text-gray-600">{tenant.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-gray-500" />
              <p>{property.title}</p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Payment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-gray-500" />
              <p className="text-2xl font-semibold">₱{pay.amount.toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <p>{new Date(pay.date).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{pay.method}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

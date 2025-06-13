import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  FileText,
  FilePlus,
  X,
  User as UserIcon,
  Calendar as CalendarIcon,
  DollarSign,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Property {
  id: number;
  title: string;
  image: string;
}

interface Lease {
  id: number;
  propertyIds: number[];
  tenantName: string;
  leaseStart: string;
  leaseEnd: string;
  rentAmount: number;
  pdfUrl: string;
  reportUrl: string;
}

const properties: Property[] = [
  { id: 1, title: "Downtown Apt",    image: "/prop1-thumb.jpg" },
  { id: 2, title: "Banilad Villa",   image: "/prop2-thumb.jpg" },
  { id: 3, title: "Uptown Condo",    image: "/prop3-thumb.jpg" },
];

const dummyLeases: Lease[] = [
  {
    id: 1,
    propertyIds: [1, 2],
    tenantName: "Sarah Johnson",
    leaseStart: "2023-01-15",
    leaseEnd: "2024-01-14",
    rentAmount: 3200,
    pdfUrl: "/leases/lease1.pdf",
    reportUrl: "/leases/lease1-report.pdf",
  },
];

export const LeaseDetails = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [leases, setLeases] = useState<Lease[]>(dummyLeases);

  const leaseId = Number(id);
  const lease = leases.find((l) => l.id === leaseId) || leases[0];

  const assignedProps = lease.propertyIds
    .map((pid) => properties.find((p) => p.id === pid))
    .filter(Boolean) as Property[];

  const availableProps = properties.filter(
    (p) => !lease.propertyIds.includes(p.id)
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [newPropId, setNewPropId] = useState<number | "">("");

  const handleDeleteLease = () => {
    if (!confirm("Delete this lease?")) return;
    setLeases((prev) => prev.filter((l) => l.id !== lease.id));
    navigate("/landlord/leases");
  };

  const handleAssign = () => {
    if (newPropId === "") return;
    setLeases((prev) =>
      prev.map((l) =>
        l.id === lease.id
          ? { ...l, propertyIds: [...l.propertyIds, newPropId as number] }
          : l
      )
    );
    setNewPropId("");
    setModalOpen(false);
  };

  const handleRemoveProperty = (propId: number) => {
    setLeases((prev) =>
      prev.map((l) =>
        l.id === lease.id
          ? { ...l, propertyIds: l.propertyIds.filter((id) => id !== propId) }
          : l
      )
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold">Lease #{lease.id}</h1>
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(`/leases/${lease.id}/edit`)}
            title="Edit Lease"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={handleDeleteLease}
            title="Delete Lease"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setModalOpen(true)}
            title="Assign to Property"
          >
            <FilePlus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Redesigned Lease Information */}
      <Card>
        <CardHeader>
          <CardTitle>Lease Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tenant */}
          <div className="flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-gray-600" />
            <div>
              <div className="text-xs text-gray-500">Tenant</div>
              <div className="font-medium">{lease.tenantName}</div>
            </div>
          </div>

          {/* Period */}
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-gray-600" />
            <div>
              <div className="text-xs text-gray-500">Period</div>
              <div className="font-medium">
                {new Date(lease.leaseStart).toLocaleDateString()} –{" "}
                {new Date(lease.leaseEnd).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Rent */}
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-gray-600" />
            <div>
              <div className="text-xs text-gray-500">Monthly Rent</div>
              <div className="font-medium">₱{lease.rentAmount.toLocaleString()}/mo</div>
            </div>
          </div>

          {/* Downloads */}
          <div className="flex flex-col sm:flex-row gap-2 sm:col-span-2">
            <Button
              asChild
              variant="outline"
              className="flex-1 justify-start"
              size="sm"
            >
              <a href={lease.pdfUrl} download className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Download Lease PDF
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="flex-1 justify-start"
              size="sm"
            >
              <a href={lease.reportUrl} download className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Download Condition Report
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Property → Tenant Rows */}
      <div className="space-y-2">
        {assignedProps.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between border rounded px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <img
                src={p.image}
                alt={p.title}
                className="h-10 w-10 rounded object-cover"
              />
              <span className="font-medium">{p.title}</span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <span className="text-gray-700">{lease.tenantName}</span>
            </div>
            <button
              onClick={() => handleRemoveProperty(p.id)}
              className="text-red-500 hover:text-red-700 p-1"
              title="Remove from Lease"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Assign Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm relative">
            <button
              className="absolute top-3 right-3 text-gray-500"
              onClick={() => setModalOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold mb-4">
              Assign Lease #{lease.id}
            </h2>
            <select
              className="w-full border rounded px-3 py-2 mb-4"
              value={newPropId}
              onChange={(e) =>
                setNewPropId(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
            >
              <option value="">Select property...</option>
              {availableProps.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
            <Button
              onClick={handleAssign}
              disabled={newPropId === ""}
              className="w-full"
            >
              Assign Property
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaseDetails;

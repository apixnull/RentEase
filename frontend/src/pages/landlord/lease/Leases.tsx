import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  X,
  FilePlus,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Property { id: number; title: string; }
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
  { id: 1, title: "Modern Downtown Apartment" },
  { id: 2, title: "Luxury Villa in Banilad" },
  { id: 3, title: "Garden Condo in Uptown" },
];

const initialLeases: Lease[] = [
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
  {
    id: 2,
    propertyIds: [2, 3],
    tenantName: "Michael Lee",
    leaseStart: "2022-09-01",
    leaseEnd: "2023-08-31",
    rentAmount: 5000,
    pdfUrl: "/leases/lease2.pdf",
    reportUrl: "/leases/lease2-report.pdf",
  },
];

export const Leases = () => {
  const [leases, setLeases] = useState<Lease[]>(initialLeases);
  const [modalLeaseId, setModalLeaseId] = useState<number | null>(null);
  const [assignPropertyId, setAssignPropertyId] = useState<number | "">("");

  const handleDelete = (id: number) => {
    if (!confirm("Are you sure you want to delete this lease?")) return;
    setLeases((prev) => prev.filter((l) => l.id !== id));
  };

  const openModal = (leaseId: number) => {
    setAssignPropertyId("");
    setModalLeaseId(leaseId);
  };
  const closeModal = () => setModalLeaseId(null);

  const handleAssign = () => {
    if (modalLeaseId == null || assignPropertyId === "") return;
    setLeases((prev) =>
      prev.map((l) =>
        l.id === modalLeaseId
          ? { ...l, propertyIds: [...l.propertyIds, Number(assignPropertyId)] }
          : l
      )
    );
    setAssignPropertyId("");
    setModalLeaseId(null);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Leases</h1>

      {/* Large-screen table */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lease #</TableHead>
              <TableHead>Properties</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead className="text-right">Rent</TableHead>
              <TableHead>Lease PDF</TableHead>
              <TableHead>Condition Report</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leases.map((lease) => {
              const names = lease.propertyIds
                .map((pid) => properties.find((p) => p.id === pid)?.title)
                .filter(Boolean) as string[];
              const first = names[0];
              const extra = names.length - 1;
              return (
                <TableRow key={lease.id}>
                  <TableCell>{lease.id}</TableCell>
                  <TableCell>
                    {first}
                    {extra > 0 && (
                      <Button
                        variant="link"
                        size="icon"
                        onClick={() => openModal(lease.id)}
                        className="ml-2"
                        title="Show all properties"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(lease.leaseStart).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(lease.leaseEnd).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    ₱{lease.rentAmount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      size="icon"
                      asChild
                      title="Download Lease PDF"
                    >
                      <a href={lease.pdfUrl} download>
                        <FileText className="h-4 w-4" />
                      </a>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      size="icon"
                      asChild
                      title="Download Condition Report"
                    >
                      <a href={lease.reportUrl} download>
                        <FileText className="h-4 w-4" />
                      </a>
                    </Button>
                  </TableCell>
                  <TableCell className="space-x-1">
                    <Button
                      variant="outline"
                      size="icon"
                      asChild
                      title="View Lease"
                    >
                      <Link to={`/leases/${lease.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      asChild
                      title="Edit Lease"
                    >
                      <Link to={`/leases/${lease.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => openModal(lease.id)}
                      title="Assign Property"
                    >
                      <FilePlus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(lease.id)}
                      title="Delete Lease"
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

      {/* Small/medium screen cards */}
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        {leases.map((lease) => {
          const names = lease.propertyIds
            .map((pid) => properties.find((p) => p.id === pid)?.title)
            .filter(Boolean) as string[];
          const first = names[0];
          const extra = names.length - 1;
          return (
            <Card key={lease.id}>
              <CardHeader>
                <CardTitle className="text-lg">Lease #{lease.id}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <strong>Properties:</strong> {first}
                  {extra > 0 && (
                    <Button
                      variant="link"
                      size="icon"
                      onClick={() => openModal(lease.id)}
                      className="ml-1"
                      title="Show all"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div>
                  <strong>Period:</strong>{" "}
                  {new Date(lease.leaseStart).toLocaleDateString()} –{" "}
                  {new Date(lease.leaseEnd).toLocaleDateString()}
                </div>
                <div>
                  <strong>Rent:</strong> ₱{lease.rentAmount.toLocaleString()}/mo
                </div>

                {/* Lease PDF block */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    title="Download Lease PDF"
                  >
                    <a href={lease.pdfUrl} download className="flex items-center gap-1">
                      <FileText className="h-4 w-4" /> Lease PDF
                    </a>
                  </Button>
                </div>

                {/* Condition Report in its own block */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    title="Download Condition Report"
                  >
                    <a href={lease.reportUrl} download className="flex items-center gap-1">
                      <FileText className="h-4 w-4" /> Condition Report
                    </a>
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/leases/${lease.id}`}>View</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/leases/${lease.id}/edit`}>Edit</Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openModal(lease.id)}>
                    Assign
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(lease.id)}>
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Assign modal (property → tenant) */}
      {modalLeaseId != null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-500"
              onClick={closeModal}
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-xl font-semibold mb-4">
              Properties for Lease #{modalLeaseId}
            </h3>
            <ul className="divide-y">
              {leases
                .find((l) => l.id === modalLeaseId)!
                .propertyIds.map((pid) => {
                  const prop = properties.find((p) => p.id === pid)!;
                  const leaseData = leases.find((l) => l.id === modalLeaseId)!;
                  return (
                    <li key={pid} className="py-2">
                      <div className="flex items-center gap-2">
                        <span className="flex-1">{prop.title}</span>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                        <span>{leaseData.tenantName}</span>
                      </div>
                    </li>
                  );
                })}
            </ul>
            <div className="space-y-2 mt-4">
              <label className="block text-sm font-medium">Assign New Property</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={assignPropertyId}
                onChange={(e) =>
                  setAssignPropertyId(e.target.value === "" ? "" : Number(e.target.value))
                }
              >
                <option value="">Select property...</option>
                {properties
                  .filter((p) =>
                    !leases.find((l) => l.id === modalLeaseId)!.propertyIds.includes(p.id)
                  )
                  .map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
              </select>
              <Button
                onClick={handleAssign}
                disabled={assignPropertyId === ""}
                className="w-full"
              >
                Assign Property
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leases;

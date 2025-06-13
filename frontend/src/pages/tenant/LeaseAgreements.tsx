import { useState, useEffect } from "react";
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
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface Lease {
  id: number;
  unit: string;
  startDate: string;
  endDate: string;
  rent: number;
  pdfUrl: string;
}

export default function LeaseAgreements() {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    // Replace with real fetch from API
    const data: Lease[] = [
      {
        id: 1,
        unit: "Unit 4A",
        startDate: "2025-01-01",
        endDate: "2026-01-01",
        rent: 12000,
        pdfUrl: "/leases/lease-1.pdf",
      },
      {
        id: 2,
        unit: "Unit 2B",
        startDate: "2024-06-15",
        endDate: "2025-06-14",
        rent: 10000,
        pdfUrl: "/leases/lease-2.pdf",
      },
    ];

    if (filter === "current") {
      const today = new Date().toISOString().slice(0, 10);
      setLeases(data.filter(l => l.startDate <= today && l.endDate >= today));
    } else {
      setLeases(data);
    }
  }, [filter]);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Lease Agreements</h2>
        <div className="w-48">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Show..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leases</SelectItem>
              <SelectItem value="current">Current Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Leases Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filter === "current" ? "Current Leases" : "All Leases"}
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Rent</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leases.length > 0 ? (
                leases.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{l.id}</TableCell>
                    <TableCell>{l.unit}</TableCell>
                    <TableCell>{l.startDate}</TableCell>
                    <TableCell>{l.endDate}</TableCell>
                    <TableCell className="text-right">
                      ₱{l.rent.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(l.pdfUrl, "_blank")}
                      >
                        View PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No leases to display.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

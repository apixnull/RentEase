import { useState, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Download } from "lucide-react";
import html2pdf from "html2pdf.js";

const PROPERTY_LIST = ["Apartment A", "Condo B", "Villa C"];

export default function Reports() {
  const [month, setMonth] = useState("2025-06");
  const [property, setProperty] = useState(PROPERTY_LIST[0]);
  const reportRef = useRef<HTMLDivElement>(null);

  // Dummy data generators
  const incomeRecords = Array.from({ length: 4 }, (_, i) => ({
    id: i + 1,
    tenant: `Tenant ${i + 1}`,
    property,
    amount: 7000 + i * 500,
    date: `${month}-0${i + 1}`,
  }));
  const expenseRecords = Array.from({ length: 3 }, (_, i) => ({
    id: i + 1,
    category: ["Repair", "Utility", "Maintenance"][i],
    property,
    amount: 2000 + i * 300,
    date: `${month}-1${i}`,
  }));
  const tenantList = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    name: `Tenant ${i + 1}`,
    unit: `Unit ${i + 1}`,
    moveIn: `2025-0${i + 1}-15`,
  }));
  const maintenanceList = Array.from({ length: 2 }, (_, i) => ({
    id: i + 1,
    issue: ["Leaking faucet", "Broken heater"][i],
    unit: `Unit ${i + 2}`,
    status: ["Pending", "Resolved"][i],
    date: `${month}-2${i}`,
  }));
  const applicantList = Array.from({ length: 3 }, (_, i) => ({
    id: i + 1,
    name: `Applicant ${i + 1}`,
    unit: `Unit ${i + 1}`,
    applied: `${month}-0${i + 2}`,
    status: ["Pending", "Approved", "Rejected"][i],
  }));

  const handleDownload = () => {
    if (!reportRef.current) return;
    html2pdf()
      .set({ margin: 0.5, filename: `report_${month}_${property}.pdf` })
      .from(reportRef.current)
      .save();
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm mb-1">Month</label>
          <input
            type="month"
            className="w-full border rounded px-3 py-2"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm mb-1">Property</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={property}
            onChange={(e) => setProperty(e.target.value)}
          >
            {PROPERTY_LIST.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <Button
          onClick={handleDownload}
          className="whitespace-nowrap"
        >
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* Report Content */}
      <div ref={reportRef} className="space-y-6">
        {/* Income Section */}
        <Card>
          <CardHeader>
            <CardTitle>Income — {property}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomeRecords.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.id}</TableCell>
                    <TableCell>{r.tenant}</TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell className="text-right">₱{r.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Expense Section */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses — {property}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseRecords.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.id}</TableCell>
                    <TableCell>{r.category}</TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell className="text-right">₱{r.amount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Tenants Section */}
        <Card>
          <CardHeader>
            <CardTitle>Tenants Overview</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Move-in Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenantList.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.id}</TableCell>
                    <TableCell>{t.name}</TableCell>
                    <TableCell>{t.unit}</TableCell>
                    <TableCell>{t.moveIn}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Maintenance Section */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Requests</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Issue</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {maintenanceList.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.id}</TableCell>
                    <TableCell>{m.issue}</TableCell>
                    <TableCell>{m.unit}</TableCell>
                    <TableCell>{m.status}</TableCell>
                    <TableCell>{m.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Applicants Section */}
        <Card>
          <CardHeader>
            <CardTitle>Applicants This Month</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applicantList.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.id}</TableCell>
                    <TableCell>{a.name}</TableCell>
                    <TableCell>{a.unit}</TableCell>
                    <TableCell>{a.applied}</TableCell>
                    <TableCell>{a.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

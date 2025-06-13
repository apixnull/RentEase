import { useState } from "react";
import { Eye, Plus, Edit, Trash2, X } from "lucide-react";
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
import { Link } from "react-router-dom";

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
  { id: 1, tenantId: 1, propertyId: 1, amount: 3200, date: "2025-06-01" },
  { id: 2, tenantId: 2, propertyId: 2, amount: 5000, date: "2025-06-05" },
];

export default function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>(initialPayments);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Payment | null>(null);

  const [form, setForm] = useState<Partial<Payment>>({
    tenantId: undefined,
    propertyId: undefined,
    amount: undefined,
    date: "",
  });

  const sendNotification = (tenant: Tenant, message: string) => {
    console.log(`Notify ${tenant.email}: ${message}`);
    // integrate real email/SMS here
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ tenantId: undefined, propertyId: undefined, amount: undefined, date: "" });
    setModalOpen(true);
  };
  const openEdit = (p: Payment) => {
    setEditing(p);
    setForm({ ...p });
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const handleDelete = (id: number) => {
    if (!confirm("Delete this payment?")) return;
    const removed = payments.find((p) => p.id === id)!;
    setPayments((prev) => prev.filter((p) => p.id !== id));
    const tenant = tenants.find((t) => t.id === removed.tenantId)!;
    sendNotification(tenant, `Your payment of ₱${removed.amount} on ${removed.date} was deleted.`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { tenantId, propertyId, amount, date } = form;
    if (!tenantId || !propertyId || !amount || !date) return alert("All fields required");
    if (editing) {
      // update
      setPayments((prev) =>
        prev.map((p) =>
          p.id === editing.id ? { ...p, tenantId, propertyId, amount, date } as Payment : p
        )
      );
      const tenant = tenants.find((t) => t.id === tenantId)!;
      sendNotification(tenant, `Your payment was updated to ₱${amount} on ${date}.`);
    } else {
      // create
      const newPay: Payment = {
        id: Math.max(...payments.map((p) => p.id)) + 1,
        tenantId,
        propertyId,
        amount,
        date,
      };
      setPayments((prev) => [...prev, newPay]);
      const tenant = tenants.find((t) => t.id === tenantId)!;
      sendNotification(tenant, `Your payment of ₱${amount} on ${date} was received.`);
    }
    closeModal();
  };

  const renderForm = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          onClick={closeModal}
          className="absolute top-3 right-3 text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold mb-4">
          {editing ? "Edit Payment" : "Add Payment"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block mb-1">Tenant</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={form.tenantId ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, tenantId: Number(e.target.value) }))}
            >
              <option value="">Select tenant</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Property</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={form.propertyId ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, propertyId: Number(e.target.value) }))}
            >
              <option value="">Select property</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1">Amount (₱)</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={form.amount ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className="block mb-1">Date</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>
          <Button type="submit" className="w-full">
            {editing ? "Update Payment" : "Create Payment"}
          </Button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Payment History</h1>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4 mr-1" /> Add Payment
        </Button>
      </div>

      {/* Table on lg+ */}
      <div className="hidden lg:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p) => {
              const tenant = tenants.find((t) => t.id === p.tenantId)!;
              const prop   = properties.find((q) => q.id === p.propertyId)!;
              return (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{tenant.name}</TableCell>
                  <TableCell>{prop.title}</TableCell>
                  <TableCell>₱{p.amount.toLocaleString()}</TableCell>
                  <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                  <TableCell className="space-x-1">
                    <Button variant="outline" size="icon" asChild title="View">
                      <Link to={`/payments/${p.id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => openEdit(p)} title="Edit">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(p.id)} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Cards on small/medium */}
      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-4">
        {payments.map((p) => {
          const tenant = tenants.find((t) => t.id === p.tenantId)!;
          const prop   = properties.find((q) => q.id === p.propertyId)!;
          return (
            <Card key={p.id}>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>#{p.id}</CardTitle>
                <span className="font-medium">₱{p.amount.toLocaleString()}</span>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p><strong>Tenant:</strong> {tenant.name}</p>
                <p><strong>Property:</strong> {prop.title}</p>
                <p><strong>Date:</strong> {new Date(p.date).toLocaleDateString()}</p>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/payments/${p.id}`}><Eye className="h-4 w-4" /></Link>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEdit(p)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {modalOpen && renderForm}
    </div>
  );
}

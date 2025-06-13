import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";

interface Request {
  id: number;
  title: string;
  description: string;
  status: "Pending" | "In Progress" | "Resolved";
  date: string;
}

export default function RequestMaintenance() {
  // State for your requests (would come from your API)
  const [requests, setRequests] = useState<Request[]>([
    {
      id: 1,
      title: "Leaky faucet",
      description: "The kitchen faucet drips continuously.",
      status: "Resolved",
      date: "2025-06-10",
    },
    {
      id: 2,
      title: "AC not cooling",
      description: "Unit in bedroom isn't blowing cold air.",
      status: "In Progress",
      date: "2025-06-12",
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq: Request = {
      id: requests.length + 1,
      title: form.title,
      description: form.description,
      status: "Pending",
      date: new Date().toISOString().slice(0, 10),
    };
    setRequests([newReq, ...requests]);
    setForm({ title: "", description: "" });
    setModalOpen(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">My Maintenance Requests</h2>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Request
        </Button>
      </div>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Requests</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>{r.title}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {r.description}
                  </TableCell>
                  <TableCell>{r.status}</TableCell>
                  <TableCell>{r.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Request Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">New Maintenance Request</h3>
              <button onClick={() => setModalOpen(false)}>
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Title</label>
                <Input
                  type="text"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Description</label>
                <Textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Submit Request
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

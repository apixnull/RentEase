import { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Search, Eye, Check } from "lucide-react";

interface Report {
  id: number;
  type: "Listing" | "User" | "Bug";
  reporter: string;
  description: string;
  status: "Open" | "Resolved";
  date: string;
}

export default function WebsiteReports() {
  const [reports, setReports] = useState<Report[]>([
    {
      id: 1,
      type: "Listing",
      reporter: "Ben Cruz",
      description: "Inaccurate rent price",
      status: "Open",
      date: "2025-06-12",
    },
    {
      id: 2,
      type: "User",
      reporter: "Anna Santos",
      description: "Tenant is abusive in messages",
      status: "Resolved",
      date: "2025-06-10",
    },
    {
      id: 3,
      type: "Bug",
      reporter: "System",
      description: "File upload fails on Firefox",
      status: "Open",
      date: "2025-06-13",
    },
  ]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "Open" | "Resolved">("all");

  const visible = useMemo(() => {
    return reports.filter((r) => {
      const matchesFilter = filter === "all" || r.status === filter;
      const q = search.toLowerCase();
      const matchesSearch =
        r.reporter.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [reports, search, filter]);

  const markResolved = (id: number) => {
    setReports((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Resolved" } : r
      )
    );
  };

  const viewReport = (report: Report) => {
    // Could be replaced by modal or navigation
    console.log("View report:", report);
  };

  return (
    <div className="p-4 md:p-6 max-w-screen-xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Website Reports</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search by reporter or type"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-48">
            <Select
              value={filter}
              onValueChange={(v) =>
                setFilter(v as "all" | "Open" | "Resolved")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports ({visible.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length > 0 ? (
                visible.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.id}</TableCell>
                    <TableCell>{r.type}</TableCell>
                    <TableCell>{r.reporter}</TableCell>
                    <TableCell>{r.description}</TableCell>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{r.status}</TableCell>
                    <TableCell className="space-x-2">
                      <Button size="icon" variant="outline" onClick={() => viewReport(r)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {r.status === "Open" && (
                        <Button size="icon" onClick={() => markResolved(r.id)}>
                          <Check className="h-4 w-4 text-green-500" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No reports found.
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

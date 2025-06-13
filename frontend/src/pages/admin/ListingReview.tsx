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
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Search, Eye, Check, X } from "lucide-react";

interface Listing {
  id: number;
  title: string;
  landlord: string;
  status: "Pending" | "Approved" | "Rejected";
  date: string;
}

export default function ListingReview() {
  // Replace with fetch from your API
  const [listings, setListings] = useState<Listing[]>([
    { id: 101, title: "Condo B", landlord: "Anna Santos", status: "Pending", date: "2025-06-10" },
    { id: 102, title: "Villa C", landlord: "Mark Tan", status: "Pending", date: "2025-06-11" },
    { id: 103, title: "Apartment A", landlord: "Julia Reyes", status: "Approved", date: "2025-06-05" },
  ]);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "Pending" | "Approved" | "Rejected">("all");

  // filtered listings
  const visible = useMemo(() => {
    return listings.filter((l) => {
      const matchesFilter = filter === "all" || l.status === filter;
      const q = search.toLowerCase();
      const matchesSearch =
        l.title.toLowerCase().includes(q) ||
        l.landlord.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [listings, search, filter]);

  const updateStatus = (id: number, status: Listing["status"]) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    );
  };

  const viewListing = (l: Listing) => {
    // open modal or navigate to review page
    console.log("View listing", l);
  };

  return (
    <div className="p-4 md:p-6 max-w-screen-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Listing Review</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search by title or landlord"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-48">
            <Select
              value={filter}
              onValueChange={(v) =>
                setFilter(v as "all" | "Pending" | "Approved" | "Rejected")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Listings</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Listings ({visible.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Landlord</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Submitted</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.length > 0 ? (
                visible.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{l.id}</TableCell>
                    <TableCell>{l.title}</TableCell>
                    <TableCell>{l.landlord}</TableCell>
                    <TableCell>{l.status}</TableCell>
                    <TableCell>{l.date}</TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => viewListing(l)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {l.status === "Pending" && (
                        <>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => updateStatus(l.id, "Approved")}
                          >
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => updateStatus(l.id, "Rejected")}
                          >
                            <X className="h-4 w-4 text-white-500" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No listings match your criteria.
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

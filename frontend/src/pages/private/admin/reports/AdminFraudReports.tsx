import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getFraudReportsRequest } from "@/api/admin/fraudReportApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, RefreshCcw, Eye, Calendar, User, Building, Flag } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { FraudReport } from "@/api/admin/fraudReportApi";

type DateFilter = "all" | "this_week" | "this_month" | "this_year";

const AdminFraudReports = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<FraudReport[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [tablePage, setTablePage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchReports = async ({ silent = false }: { silent?: boolean } = {}) => {
    const abort = new AbortController();
    try {
      if (!silent) {
        setLoading(true);
      }
      setRefreshing(true);
      setError(null);
      const res = await getFraudReportsRequest({ signal: abort.signal });
      setData(res.data.reports ?? []);
    } catch (err: any) {
      if (err?.name === "CanceledError") return;
      setError("Failed to load fraud reports");
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to load fraud reports");
    } finally {
      if (!silent) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleRefresh = () => {
    if (!refreshing) {
      fetchReports({ silent: true });
    }
  };

  const getReasonBadgeVariant = (reason: string) => {
    const reasonMap: Record<string, "destructive" | "secondary" | "default"> = {
      scam: "destructive",
      fake_info: "destructive",
      discriminatory: "destructive",
      illegal: "destructive",
      inappropriate: "secondary",
      other: "default",
    };
    return reasonMap[reason] || "default";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getReporterName = (reporter: FraudReport["reporter"]) => {
    if (reporter.firstName && reporter.lastName) {
      return `${reporter.firstName} ${reporter.lastName}`;
    }
    return reporter.email;
  };

  // Date filtering logic
  const filteredData = useMemo(() => {
    if (!data) return [];
    if (dateFilter === "all") return data;

    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now);

    switch (dateFilter) {
      case "this_week": {
        // Start of week (Sunday)
        const dayOfWeek = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      }
      case "this_month": {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;
      }
      case "this_year": {
        startDate = new Date(now.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), 11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;
      }
      default:
        return data;
    }

    return data.filter((report) => {
      const reportDate = new Date(report.createdAt);
      return reportDate >= startDate && reportDate <= endDate;
    });
  }, [data, dateFilter]);

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const paginatedData = useMemo(() => {
    const start = (tablePage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, tablePage, rowsPerPage]);

  useEffect(() => {
    setTablePage(1);
  }, [dateFilter, rowsPerPage]);

  if (loading && !data) {
    return (
      <div className="space-y-6 p-6">
        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 text-white grid place-items-center shadow-md">
                  <Flag className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-gray-900">Fraud Reports</CardTitle>
                  <p className="text-sm text-gray-600 mt-0.5">Tenant fraud reports and complaints</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Reports Table */}
      <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center justify-between sm:justify-start gap-4">
              <CardTitle className="text-lg font-semibold">All Reports</CardTitle>
              {filteredData && (
                <Badge variant="secondary" className="text-xs">
                  {filteredData.length} {filteredData.length === 1 ? "report" : "reports"}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Select value={dateFilter} onValueChange={(value: DateFilter) => setDateFilter(value)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="this_week">This Week</SelectItem>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="this_year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600">{error}</p>
              <Button onClick={() => fetchReports()} variant="outline" className="mt-4">
                Try Again
              </Button>
            </div>
          ) : !data || data.length === 0 ? (
            <div className="text-center py-12">
              <Flag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No fraud reports yet</p>
              <p className="text-sm text-gray-500 mt-1">Reports will appear here when tenants submit them</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12">
              <Flag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No reports found for selected period</p>
              <p className="text-sm text-gray-500 mt-1">Try selecting a different time range</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Property</TableHead>
                      <TableHead className="w-[150px]">Reporter</TableHead>
                      <TableHead className="w-[120px]">Reason</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="w-[150px]">Reported At</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((report) => (
                    <TableRow key={report.id} className="hover:bg-gray-50/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          <div className="min-w-0">
                            <div className="font-medium text-sm text-gray-900 truncate">
                              {report.listing?.unit?.property?.title || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {report.listing?.unit?.label || "N/A"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div className="min-w-0">
                            <div className="text-sm text-gray-900 truncate">
                              {getReporterName(report.reporter)}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {report.reporter.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getReasonBadgeVariant(report.reason)} className="text-xs capitalize">
                          {report.reason.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-md">
                          <p className="text-sm text-gray-700 line-clamp-2">
                            {report.details || "No details provided"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(report.createdAt)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/listing/${report.listingId}/details`)}
                          className="gap-1.5 text-xs h-8"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Rows per page:</span>
                  <Select value={String(rowsPerPage)} onValueChange={(value) => setRowsPerPage(Number(value))}>
                    <SelectTrigger className="h-8 w-[100px]">
                      <SelectValue placeholder="Rows" />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 15, 20].map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={tablePage <= 1}
                    onClick={() => setTablePage((prev) => Math.max(1, prev - 1))}
                  >
                    Prev
                  </Button>
                  <span>
                    Page {tablePage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={tablePage >= totalPages}
                    onClick={() => setTablePage((prev) => Math.min(totalPages, prev + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFraudReports;


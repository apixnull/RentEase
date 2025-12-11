import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getFraudReportsRequest } from "@/api/admin/fraudReportApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, RefreshCcw, Eye, Calendar, User, Building, Flag, Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { FraudReport } from "@/api/admin/fraudReportApi";

type DateFilter = "all" | "this_week" | "this_month";

const AdminFraudReports = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<FraudReport[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>("this_week");
  const [tablePage, setTablePage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-200/80 via-indigo-200/75 to-blue-200/70 opacity-95" />
        <div className="relative m-[1px] rounded-[16px] bg-white/85 backdrop-blur-lg border border-white/60 shadow-lg">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-12 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-purple-300/50 to-indigo-400/40 blur-3xl"
            initial={{ opacity: 0.4, scale: 0.85 }}
            animate={{ opacity: 0.7, scale: 1.05 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-tl from-blue-200/40 to-indigo-200/35 blur-3xl"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 3.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          />

          <div className="px-4 sm:px-6 py-5 space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <motion.div whileHover={{ scale: 1.05 }} className="relative flex-shrink-0">
                  <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 grid place-items-center shadow-xl shadow-indigo-500/30">
                    <Flag className="h-5 w-5 relative z-10 text-orange-500" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                  </div>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 220 }}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white text-purple-600 border border-purple-100 shadow-sm grid place-items-center"
                  >
                    <Sparkles className="h-3 w-3" />
                  </motion.div>
                </motion.div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 truncate">
                      Fraud Reports
                    </h1>
                  </div>
                  <p className="text-sm text-slate-600 leading-6 flex items-center gap-1.5">
                    <Flag className="h-4 w-4 text-indigo-500" />
                    Monitor and manage tenant fraud reports and complaints
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="h-11 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 px-5 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 hover:brightness-110 disabled:opacity-70"
                >
                  {refreshing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Refreshing
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <RefreshCcw className="h-4 w-4" />
                      Refresh
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Stats and Filters Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-200/60">
              {/* Stats */}
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{data?.length || 0}</p>
                </div>
                <div className="h-12 w-px bg-slate-200" />
                <div>
                  <p className="text-xs text-gray-500 mb-1">Filtered</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredData.length}</p>
                </div>
              </div>

              {/* Date Filter Buttons */}
              <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-lg border border-slate-200">
                <Button
                  variant={dateFilter === "this_week" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setDateFilter("this_week")}
                  className={`text-xs h-8 px-4 !active:bg-white/90 !active:text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0 ${
                    dateFilter === "this_week"
                      ? "bg-white shadow-sm text-slate-600 font-medium border border-slate-200"
                      : "text-slate-500 hover:text-slate-600 hover:bg-white/60"
                  }`}
                >
                  This Week
                </Button>
                <Button
                  variant={dateFilter === "this_month" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setDateFilter("this_month")}
                  className={`text-xs h-8 px-4 !active:bg-white/90 !active:text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0 ${
                    dateFilter === "this_month"
                      ? "bg-white shadow-sm text-slate-600 font-medium border border-slate-200"
                      : "text-slate-500 hover:text-slate-600 hover:bg-white/60"
                  }`}
                >
                  This Month
                </Button>
                <Button
                  variant={dateFilter === "all" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setDateFilter("all")}
                  className={`text-xs h-8 px-4 !active:bg-white/90 !active:text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0 ${
                    dateFilter === "all"
                      ? "bg-white shadow-sm text-slate-600 font-medium border border-slate-200"
                      : "text-slate-500 hover:text-slate-600 hover:bg-white/60"
                  }`}
                >
                  All Time
                </Button>
              </div>
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
              style={{ originX: 0 }}
              className="relative h-1 w-full rounded-full overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/80 via-indigo-400/80 to-blue-400/80" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Reports Table */}
      <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">All Reports</CardTitle>
            {filteredData && (
              <Badge variant="secondary" className="text-xs">
                {filteredData.length} {filteredData.length === 1 ? "report" : "reports"}
              </Badge>
            )}
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
                          {/* Display images if available */}
                          {(report.image1Url || report.image2Url) && (
                            <div className="flex gap-2 mt-2">
                              {report.image1Url && (
                                <button
                                  onClick={() => setSelectedImage(report.image1Url || null)}
                                  className="relative group"
                                >
                                  <img
                                    src={report.image1Url}
                                    alt="Evidence 1"
                                    className="w-12 h-12 object-cover rounded border border-gray-300 hover:border-blue-500 transition-colors"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded transition-colors flex items-center justify-center">
                                    <ImageIcon className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </button>
                              )}
                              {report.image2Url && (
                                <button
                                  onClick={() => setSelectedImage(report.image2Url || null)}
                                  className="relative group"
                                >
                                  <img
                                    src={report.image2Url}
                                    alt="Evidence 2"
                                    className="w-12 h-12 object-cover rounded border border-gray-300 hover:border-blue-500 transition-colors"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded transition-colors flex items-center justify-center">
                                    <ImageIcon className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </button>
                              )}
                            </div>
                          )}
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

      {/* Image Viewer Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Evidence Image</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="relative">
              <img
                src={selectedImage}
                alt="Evidence"
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFraudReports;


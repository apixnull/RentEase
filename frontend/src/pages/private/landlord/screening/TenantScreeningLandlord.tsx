import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  Eye,
  FileText,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Archive,
  Loader2,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { getLandlordScreeningsListRequest } from "@/api/landlord/screeningApi";
import { inviteTenantForScreeningRequest } from "@/api/landlord/screeningApi";
import { deletePendingScreeningRequest } from "@/api/landlord/screeningApi";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Types based on API response
interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
}

interface ScreeningReport {
  id: string;
  tenantId: string;
  landlordId: string;
  status: "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED";
  remarks: string | null;
  reviewedAt: string | null;
  aiRiskScore: number | null;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | null;
  createdAt: string;
  updatedAt: string;
  tenant: Tenant;
}

interface StatusActionsProps {
  report: ScreeningReport;
  onViewDetails: (report: ScreeningReport) => void;
  onCreateLease: (tenantId: string, tenantName: string) => void;
  onDelete: (screeningId: string) => void;
}

// Complete Color Schema for Screening Statuses
const SCREENING_STATUS_THEME = {
  PENDING: {
    // Badge & Pill
    badge: "bg-amber-50 border border-amber-200 text-amber-700",
    pill: "bg-amber-100 text-amber-800",
    
    // Gradients
    gradient: "from-amber-500 to-orange-500",
    gradientLight: "from-amber-200/70 via-amber-100/50 to-amber-200/70",
    gradientButton: "from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700",
    
    // Backgrounds
    background: "bg-amber-50 border-amber-300",
    backgroundCard: "bg-gradient-to-br from-amber-50 to-orange-50",
    
    // Icon & Text
    iconBackground: "bg-amber-500",
    textColor: "text-amber-700",
    textColorDark: "text-amber-900",
    textColorLight: "text-amber-600",
    
    // Blur Effects
    blurLight: "bg-amber-200/40",
    blurDark: "bg-amber-300/40",
    
    // Borders
    border: "border-amber-200",
    borderDark: "border-amber-300",
    borderCard: "border-2 border-amber-300",
    
    // Timeline (if needed)
    timelineActive: "bg-amber-500 ring-4 ring-amber-200",
    timelineCompleted: "bg-amber-500",
    timelineLine: "bg-amber-300",
  },
  SUBMITTED: {
    // Badge & Pill
    badge: "bg-indigo-50 border border-indigo-200 text-indigo-700",
    pill: "bg-indigo-100 text-indigo-800",
    
    // Gradients
    gradient: "from-indigo-600 to-blue-600",
    gradientLight: "from-indigo-200/70 via-indigo-100/50 to-indigo-200/70",
    gradientButton: "from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700",
    
    // Backgrounds
    background: "bg-indigo-50 border-indigo-300",
    backgroundCard: "bg-gradient-to-br from-indigo-50 to-blue-50",
    
    // Icon & Text
    iconBackground: "bg-indigo-500",
    textColor: "text-indigo-700",
    textColorDark: "text-indigo-900",
    textColorLight: "text-indigo-600",
    
    // Blur Effects
    blurLight: "bg-indigo-200/40",
    blurDark: "bg-indigo-300/40",
    
    // Borders
    border: "border-indigo-200",
    borderDark: "border-indigo-300",
    borderCard: "border-2 border-indigo-300",
    
    // Timeline (if needed)
    timelineActive: "bg-indigo-500 ring-4 ring-indigo-200",
    timelineCompleted: "bg-indigo-500",
    timelineLine: "bg-indigo-300",
  },
  APPROVED: {
    // Badge & Pill
    badge: "bg-emerald-50 border border-emerald-200 text-emerald-700",
    pill: "bg-emerald-100 text-emerald-800",
    
    // Gradients
    gradient: "from-emerald-500 to-green-500",
    gradientLight: "from-emerald-200/70 via-emerald-100/50 to-emerald-200/70",
    gradientButton: "from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700",
    
    // Backgrounds
    background: "bg-emerald-50 border-emerald-300",
    backgroundCard: "bg-gradient-to-br from-emerald-50 to-green-50",
    
    // Icon & Text
    iconBackground: "bg-emerald-500",
    textColor: "text-emerald-700",
    textColorDark: "text-emerald-900",
    textColorLight: "text-emerald-600",
    
    // Blur Effects
    blurLight: "bg-emerald-200/40",
    blurDark: "bg-emerald-300/40",
    
    // Borders
    border: "border-emerald-200",
    borderDark: "border-emerald-300",
    borderCard: "border-2 border-emerald-300",
    
    // Timeline (if needed)
    timelineActive: "bg-emerald-500 ring-4 ring-emerald-200",
    timelineCompleted: "bg-emerald-500",
    timelineLine: "bg-emerald-300",
  },
  REJECTED: {
    // Badge & Pill
    badge: "bg-rose-50 border border-rose-200 text-rose-700",
    pill: "bg-rose-100 text-rose-800",
    
    // Gradients
    gradient: "from-rose-500 to-red-500",
    gradientLight: "from-rose-200/70 via-rose-100/50 to-rose-200/70",
    gradientButton: "from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700",
    
    // Backgrounds
    background: "bg-rose-50 border-rose-300",
    backgroundCard: "bg-gradient-to-br from-rose-50 to-red-50",
    
    // Icon & Text
    iconBackground: "bg-rose-500",
    textColor: "text-rose-700",
    textColorDark: "text-rose-900",
    textColorLight: "text-rose-600",
    
    // Blur Effects
    blurLight: "bg-rose-200/40",
    blurDark: "bg-rose-300/40",
    
    // Borders
    border: "border-rose-200",
    borderDark: "border-rose-300",
    borderCard: "border-2 border-rose-300",
    
    // Timeline (if needed)
    timelineActive: "bg-rose-500 ring-4 ring-rose-200",
    timelineCompleted: "bg-rose-500",
    timelineLine: "bg-rose-300",
  },
} as const;


const ScreeningLoadingSkeleton = () => (
  <div className="min-h-screen p-6">
    <div className="max-w-6xl mx-auto space-y-6">
      <Skeleton className="h-28 rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="rounded-[18px] border border-white/60 bg-white/80 p-4 space-y-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="flex flex-col sm:flex-row gap-3">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>
      <div className="rounded-[18px] border border-white/60 bg-white/80 p-4">
        <div className="flex gap-3 mb-4">
          <Skeleton className="h-9 w-32 rounded-full" />
          <Skeleton className="h-9 w-32 rounded-full" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-slate-100 rounded-lg p-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-32 rounded" />
                  <Skeleton className="h-3 w-40 rounded" />
                </div>
              </div>
              <div className="flex flex-wrap gap-3 sm:justify-end">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const TenantScreeningLandlord = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateSort, setDateSort] = useState<"newest" | "oldest">("newest");
  const [tenantEmail, setTenantEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [isStatsExpanded, setIsStatsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('latest');
  const [screeningReports, setScreeningReports] = useState<ScreeningReport[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchScreeningReports = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setRefreshing(true);
      setError(null);
      const response = await getLandlordScreeningsListRequest();
      setScreeningReports(response.data.data);
    } catch (err) {
      setError("Failed to fetch screening reports");
      console.error("Error fetching screening reports:", err);
    } finally {
      if (!silent) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchScreeningReports();
  }, [fetchScreeningReports]);

  const handleRefresh = () => {
    if (!refreshing) {
      fetchScreeningReports({ silent: true });
    }
  };

  const handleInviteTenant = async () => {
    if (!tenantEmail) {
      toast.error("Please enter a tenant email address");
      return;
    }

    setIsInviting(true);
    try {
      await inviteTenantForScreeningRequest({ tenantEmail });
      toast.success(`Screening invitation sent to ${tenantEmail}`);
      setTenantEmail("");
      // Refresh the list after inviting
      await fetchScreeningReports({ silent: true });
    } catch (error: any) {
      console.error("Failed to send screening invitation:", error);
      if (error?.response?.status === 409) {
        // Backend signals an already pending invitation
        const message =
          error.response.data?.message ||
          "A screening invitation is already pending for this tenant.";
        toast.error(message);
      } else {
        const message =
          error?.response?.data?.message ||
          "Failed to send screening invitation. Please try again.";
        toast.error(message);
      }
    } finally {
      setIsInviting(false);
    }
  };

  const handleViewDetails = (report: ScreeningReport) => {
    navigate(`/landlord/screening/${report.id}/details`);
  };

  const handleCreateLease = (tenantId: string, tenantName: string) => {
    toast.success(`Preparing lease for ${tenantName}`);
    navigate("/landlord/leases/create", {
      state: { tenantId, tenantName },
    });
  };

  const handleDeleteScreening = async (screeningId: string) => {
    if (!confirm("Are you sure you want to delete this pending screening? This action cannot be undone.")) {
      return;
    }

    setDeletingId(screeningId);
    try {
      await deletePendingScreeningRequest(screeningId);
      toast.success("Screening deleted successfully");
      // Refresh the list after deleting
      await fetchScreeningReports({ silent: true });
    } catch (error: any) {
      console.error("Failed to delete screening:", error);
      const message =
        error?.response?.data?.message ||
        "Failed to delete screening. Please try again.";
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const isOlderThanOneWeek = (dateString: string) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return new Date(dateString) < oneWeekAgo;
  };

  // Get the relevant date for sorting (createdAt for PENDING, updatedAt for others)
  const getRelevantDate = (report: ScreeningReport) => {
    return report.status === "PENDING" ? report.createdAt : report.updatedAt;
  };

  // Separate reports into latest and past
  const latestReports = screeningReports.filter(
    (report) => !isOlderThanOneWeek(getRelevantDate(report))
  );
  const pastReports = screeningReports.filter((report) =>
    isOlderThanOneWeek(getRelevantDate(report))
  );

  const filterReports = (reports: ScreeningReport[]) => {
    let filtered = reports.filter((report) => {
      const tenantName = `${report.tenant.firstName} ${report.tenant.lastName}`;
      const matchesSearch =
        tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.tenant.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || report.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort by date
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(getRelevantDate(a)).getTime();
      const dateB = new Date(getRelevantDate(b)).getTime();
      return dateSort === "newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  };

  const filteredLatestReports = filterReports(latestReports);
  const filteredPastReports = filterReports(pastReports);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-3 h-3" />;
      case "PENDING":
        return <Clock className="w-3 h-3" />;
      case "SUBMITTED":
        return <FileText className="w-3 h-3" />;
      case "REJECTED":
        return <XCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusTheme = (status: string) => {
    return SCREENING_STATUS_THEME[status as keyof typeof SCREENING_STATUS_THEME] || SCREENING_STATUS_THEME.PENDING;
  };

  const getRiskVariant = (riskLevel: string | null) => {
    switch (riskLevel) {
      case "LOW":
        return "default";
      case "MEDIUM":
        return "secondary";
      case "HIGH":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const approvedCount = screeningReports.filter(
    (r) => r.status === "APPROVED"
  ).length;
  const pendingCount = screeningReports.filter(
    (r) => r.status === "PENDING"
  ).length;
  const submittedCount = screeningReports.filter(
    (r) => r.status === "SUBMITTED"
  ).length;
  const rejectedCount = screeningReports.filter(
    (r) => r.status === "REJECTED"
  ).length;

  const StatusActions = ({
    report,
    onViewDetails,
    onCreateLease,
    onDelete,
  }: StatusActionsProps) => {
    switch (report.status) {
      case "PENDING":
        return (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(report.id)}
            disabled={deletingId === report.id}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            {deletingId === report.id ? (
              <>
                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-3 h-3 mr-1.5" />
                Delete
              </>
            )}
          </Button>
        );
      case "SUBMITTED":
      case "REJECTED":
        const submittedTheme = getStatusTheme(report.status);
        return (
          <Button 
            size="sm" 
            onClick={() => onViewDetails(report)}
            className={cn("bg-gradient-to-r", submittedTheme.gradientButton, "text-white")}
          >
            <Eye className="w-3 h-3 mr-1.5" />
            Review Details
          </Button>
        );
      case "APPROVED":
        const approvedTheme = getStatusTheme("APPROVED");
        return (
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
              onClick={() => onViewDetails(report)}
            >
              <Eye className="w-3 h-3 mr-1.5" />
              View Details
            </Button>
            <Button
              size="sm"
              className={cn("bg-gradient-to-r", approvedTheme.gradientButton, "text-white shadow-md hover:shadow-lg hover:brightness-110")}
              onClick={() =>
                onCreateLease(
                  report.tenantId,
                  `${report.tenant.firstName} ${report.tenant.lastName}`
                )
              }
            >
              Create Lease
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const ScreeningTable = ({ reports }: { reports: ScreeningReport[] }) => (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tenant</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Risk Level</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                No screening reports found matching your filters.
              </TableCell>
            </TableRow>
          ) : (
            reports.map((report) => {
              const tenantName = `${report.tenant.firstName} ${report.tenant.lastName}`;
              const relevantDate = getRelevantDate(report);
              const dateLabel =
                report.status === "PENDING"
                  ? "Invited"
                  : report.status === "SUBMITTED"
                  ? "Submitted"
                  : "Updated";

              return (
                <TableRow
                  key={report.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                          {getInitials(
                            report.tenant.firstName,
                            report.tenant.lastName
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{tenantName}</div>
                        <div className="text-xs text-gray-500">
                          {report.tenant.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {(() => {
                      const theme = getStatusTheme(report.status);
                      return (
                        <Badge
                          className={cn(
                            "flex items-center gap-1 w-fit text-xs border font-medium",
                            theme.badge
                          )}
                        >
                          <div className={`${theme.iconBackground} text-white p-0.5 rounded`}>
                            {getStatusIcon(report.status)}
                          </div>
                          {report.status}
                        </Badge>
                      );
                    })()}
                  </TableCell>
                  <TableCell>
                    {report.riskLevel ? (
                      <div className="flex items-center gap-2">
                        <Badge variant={getRiskVariant(report.riskLevel)} className="text-xs">
                          {report.riskLevel}
                        </Badge>
                        {report.riskLevel === "HIGH" && (
                          <AlertTriangle className="w-3 h-3 text-red-500" />
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Not assessed</span>
                    )}
                    {report.aiRiskScore && (
                      <Progress
                        value={report.aiRiskScore * 100}
                        className={cn(
                          "mt-1 h-1",
                          report.riskLevel === "HIGH"
                            ? "[&>div]:bg-red-500"
                            : report.riskLevel === "MEDIUM"
                            ? "[&>div]:bg-yellow-500"
                            : "[&>div]:bg-green-500"
                        )}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="text-xs text-gray-500">{dateLabel}</div>
                      <div>{formatDate(relevantDate)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusActions
                      report={report}
                      onViewDetails={handleViewDetails}
                      onCreateLease={handleCreateLease}
                      onDelete={handleDeleteScreening}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );

  const inviteActions = (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-sm">
          <UserPlus className="w-3 h-3 mr-1" />
          Invite Screening
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Invite Tenant for Screening</DialogTitle>
          <DialogDescription className="text-sm">
            Send a screening invitation to a potential tenant. They will receive an email with instructions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Enter tenant email address"
            value={tenantEmail}
            onChange={(e) => setTenantEmail(e.target.value)}
            className="text-sm"
          />
          <Button
            onClick={handleInviteTenant}
            disabled={isInviting}
            className="w-full bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-sm"
          >
            <Mail className="w-3 h-3 mr-1" />
            {isInviting ? "Sending..." : "Send Invitation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return <ScreeningLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-800 mb-2">
              Error Loading Reports
            </h3>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <Button onClick={() => fetchScreeningReports()} size="sm">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-sky-200/80 via-cyan-200/75 to-emerald-200/70 opacity-95" />
        <div className="relative m-[1px] rounded-[16px] bg-white/85 backdrop-blur-lg border border-white/60 shadow-lg">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-12 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-sky-300/50 to-cyan-400/40 blur-3xl"
            initial={{ opacity: 0.4, scale: 0.85 }}
            animate={{ opacity: 0.7, scale: 1.05 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-tl from-emerald-200/40 to-cyan-200/35 blur-3xl"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 3.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          />

          <div className="px-4 sm:px-6 py-5 space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: [0, -3, 3, 0] }}
                  className="relative flex-shrink-0"
                >
                  <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-sky-600 via-cyan-600 to-emerald-600 text-white grid place-items-center shadow-xl shadow-cyan-500/30">
                    <ShieldCheck className="h-5 w-5 relative z-10" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                  </div>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 220 }}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white text-sky-600 border border-sky-100 shadow-sm grid place-items-center"
                  >
                    <Sparkles className="h-3 w-3" />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-cyan-400/30"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 truncate">
                      Tenant Screening Reports
                    </h1>
                    <motion.div
                      animate={{ rotate: [0, 8, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Sparkles className="h-4 w-4 text-cyan-500" />
                    </motion.div>
                  </div>
                  <p className="text-sm text-slate-600 leading-6 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    Manage and review tenant screening applications
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="h-11 rounded-xl border-slate-200 bg-white/85 px-5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-white disabled:opacity-70"
                >
                  {refreshing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Refreshing
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Refresh Data
                    </span>
                  )}
                </Button>
                {inviteActions}
              </div>
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
              style={{ originX: 0 }}
              className="relative h-1 w-full rounded-full overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400/80 via-cyan-400/80 to-emerald-400/80" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">

        {/* Combined Stats and Search Section - Collapsible */}
        <Card className="mb-4">
          <CardHeader 
            className="pb-3 pt-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
            onClick={() => setIsStatsExpanded(!isStatsExpanded)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Overview & Filters</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsStatsExpanded(!isStatsExpanded);
                }}
              >
                {isStatsExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardHeader>
          {isStatsExpanded && (
            <CardContent className="pt-0 space-y-4">
              {/* Stats Overview - Matching Leases.tsx style */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(() => {
                  const theme = SCREENING_STATUS_THEME.PENDING;
                  return (
                    <button
                      type="button"
                      onClick={() =>
                        setStatusFilter(statusFilter === "PENDING" ? "all" : "PENDING")
                      }
                      className={cn(
                        "rounded-xl border-2 p-3 flex items-center gap-3 shadow-[0_2px_12px_-6px_rgba(15,23,42,0.25)] transition-all",
                        theme.borderCard,
                        theme.backgroundCard,
                        statusFilter === "PENDING" && "ring-2 ring-amber-400 shadow-md"
                      )}
                    >
                      <div className={`h-10 w-10 rounded-lg grid place-items-center ${theme.iconBackground}`}>
                        <Clock className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className={`text-xs uppercase tracking-wide ${theme.textColorLight}`}>Pending</p>
                        <p className={`text-lg font-semibold ${theme.textColorDark}`}>{pendingCount}</p>
                      </div>
                    </button>
                  );
                })()}

                {(() => {
                  const theme = SCREENING_STATUS_THEME.SUBMITTED;
                  return (
                    <button
                      type="button"
                      onClick={() =>
                        setStatusFilter(statusFilter === "SUBMITTED" ? "all" : "SUBMITTED")
                      }
                      className={cn(
                        "rounded-xl border-2 p-3 flex items-center gap-3 shadow-[0_2px_12px_-6px_rgba(15,23,42,0.25)] transition-all",
                        theme.borderCard,
                        theme.backgroundCard,
                        statusFilter === "SUBMITTED" && "ring-2 ring-indigo-400 shadow-md"
                      )}
                    >
                      <div className={`h-10 w-10 rounded-lg grid place-items-center ${theme.iconBackground}`}>
                        <FileText className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className={`text-xs uppercase tracking-wide ${theme.textColorLight}`}>Submitted</p>
                        <p className={`text-lg font-semibold ${theme.textColorDark}`}>{submittedCount}</p>
                      </div>
                    </button>
                  );
                })()}

                {(() => {
                  const theme = SCREENING_STATUS_THEME.APPROVED;
                  return (
                    <button
                      type="button"
                      onClick={() =>
                        setStatusFilter(statusFilter === "APPROVED" ? "all" : "APPROVED")
                      }
                      className={cn(
                        "rounded-xl border-2 p-3 flex items-center gap-3 shadow-[0_2px_12px_-6px_rgba(15,23,42,0.25)] transition-all",
                        theme.borderCard,
                        theme.backgroundCard,
                        statusFilter === "APPROVED" && "ring-2 ring-emerald-400 shadow-md"
                      )}
                    >
                      <div className={`h-10 w-10 rounded-lg grid place-items-center ${theme.iconBackground}`}>
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className={`text-xs uppercase tracking-wide ${theme.textColorLight}`}>Approved</p>
                        <p className={`text-lg font-semibold ${theme.textColorDark}`}>{approvedCount}</p>
                      </div>
                    </button>
                  );
                })()}

                {(() => {
                  const theme = SCREENING_STATUS_THEME.REJECTED;
                  return (
                    <button
                      type="button"
                      onClick={() =>
                        setStatusFilter(statusFilter === "REJECTED" ? "all" : "REJECTED")
                      }
                      className={cn(
                        "rounded-xl border-2 p-3 flex items-center gap-3 shadow-[0_2px_12px_-6px_rgba(15,23,42,0.25)] transition-all",
                        theme.borderCard,
                        theme.backgroundCard,
                        statusFilter === "REJECTED" && "ring-2 ring-rose-400 shadow-md"
                      )}
                    >
                      <div className={`h-10 w-10 rounded-lg grid place-items-center ${theme.iconBackground}`}>
                        <XCircle className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className={`text-xs uppercase tracking-wide ${theme.textColorLight}`}>Rejected</p>
                        <p className={`text-lg font-semibold ${theme.textColorDark}`}>{rejectedCount}</p>
                      </div>
                    </button>
                  );
                })()}
              </div>

              {/* Search and Date Sort */}
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center pt-2 border-t">
                <div className="flex-1 w-full">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search tenants by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 text-sm h-9"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <ArrowUpDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <Select value={dateSort} onValueChange={(value: "newest" | "oldest") => setDateSort(value)}>
                    <SelectTrigger className="w-[140px] h-9 text-sm">
                      <SelectValue placeholder="Sort by date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

      {/* Tabs for Latest and Past Screening Records */}
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Creative Tabs with Color Scheme - Transparent Gradients */}
            <div className="border-b bg-gradient-to-br from-slate-50/80 via-gray-50/60 to-slate-50/80 backdrop-blur-sm">
              <TabsList className="w-full h-auto bg-transparent p-2 sm:p-3 gap-2 grid grid-cols-2">
                <TabsTrigger 
                  value="latest" 
                  className={`relative flex-1 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-medium transition-all overflow-hidden ${
                    activeTab === 'latest' 
                      ? `bg-gradient-to-r from-emerald-500 to-teal-500/20 text-emerald-700 border border-emerald-200/50 shadow-sm backdrop-blur-sm` 
                      : `bg-gray-50/50 border border-gray-200 text-gray-600 hover:bg-gray-100/50`
                  }`}
                >
                  {activeTab === 'latest' && (
                    <div className={`absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500/10 opacity-50`} />
                  )}
                  <FileText className={`w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 ${activeTab === 'latest' ? 'text-emerald-700' : 'text-gray-500'}`} />
                  <span className="relative z-10 hidden sm:inline">Latest</span>
                  <span className="relative z-10 sm:hidden">Latest</span>
                  {filteredLatestReports.length > 0 && (
                    <Badge className={`ml-1 text-xs px-1.5 py-0 relative z-10 ${
                      activeTab === 'latest' 
                        ? `bg-emerald-100 text-emerald-800 border border-emerald-200/50` 
                        : `bg-gray-100 text-gray-700`
                    }`}>
                      {filteredLatestReports.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="past" 
                  className={`relative flex-1 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-medium transition-all overflow-hidden ${
                    activeTab === 'past' 
                      ? `bg-gradient-to-r from-emerald-500 to-teal-500/20 text-emerald-700 border border-emerald-200/50 shadow-sm backdrop-blur-sm` 
                      : `bg-gray-50/50 border border-gray-200 text-gray-600 hover:bg-gray-100/50`
                  }`}
                >
                  {activeTab === 'past' && (
                    <div className={`absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500/10 opacity-50`} />
                  )}
                  <Archive className={`w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 ${activeTab === 'past' ? 'text-emerald-700' : 'text-gray-500'}`} />
                  <span className="relative z-10">Past</span>
                  {filteredPastReports.length > 0 && (
                    <Badge className={`ml-1 text-xs px-1.5 py-0 relative z-10 ${
                      activeTab === 'past' 
                        ? `bg-emerald-100 text-emerald-800 border border-emerald-200/50` 
                        : `bg-gray-100 text-gray-700`
                    }`}>
                      {filteredPastReports.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Latest Records Tab */}
            <TabsContent value="latest" className="m-0 p-3 sm:p-4">
              <ScreeningTable reports={filteredLatestReports} />
            </TabsContent>

            {/* Past Records Tab */}
            <TabsContent value="past" className="m-0 p-3 sm:p-4">
              <ScreeningTable reports={filteredPastReports} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default TenantScreeningLandlord;
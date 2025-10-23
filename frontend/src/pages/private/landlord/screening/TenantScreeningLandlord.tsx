import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import {
  Search,
  Filter,
  UserPlus,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Mail,
  Eye,
  FileText,
} from "lucide-react";
import { getLandlordScreeningsListRequest } from "@/api/landlord/screeningApi";
import { inviteTenantForScreeningRequest } from "@/api/landlord/screeningApi";
import { cn } from "@/lib/utils";

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
}

const TenantScreeningLandlord = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [tenantEmail, setTenantEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [screeningReports, setScreeningReports] = useState<ScreeningReport[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchScreeningReports();
  }, []);

  const fetchScreeningReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLandlordScreeningsListRequest();
      setScreeningReports(response.data.data);
    } catch (err) {
      setError("Failed to fetch screening reports");
      console.error("Error fetching screening reports:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInviteTenant = async () => {
    if (!tenantEmail) {
      alert("Please enter a tenant email address");
      return;
    }

    setIsInviting(true);
    try {
      await inviteTenantForScreeningRequest({ tenantEmail });
      alert(`Screening invitation sent to ${tenantEmail}`);
      setTenantEmail("");
      // Refresh the list after inviting
      await fetchScreeningReports();
    } catch (error) {
      console.error("Failed to send screening invitation:", error);
      alert("Failed to send screening invitation. Please try again.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleViewDetails = (report: ScreeningReport) => {
    navigate(`/landlord/screening/${report.id}/details`);
  };

  const handleCreateLease = (tenantId: string, tenantName: string) => {
    alert(`Creating lease for ${tenantName} (ID: ${tenantId})`);
    // Navigate to lease creation page with tenant info
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
    return reports.filter((report) => {
      const tenantName = `${report.tenant.firstName} ${report.tenant.lastName}`;
      const matchesSearch =
        tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.tenant.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || report.status === statusFilter;
      const matchesRisk =
        riskFilter === "all" || report.riskLevel === riskFilter.toUpperCase();

      return matchesSearch && matchesStatus && matchesRisk;
    });
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "default";
      case "PENDING":
        return "secondary";
      case "SUBMITTED":
        return "outline";
      case "REJECTED":
        return "destructive";
      default:
        return "outline";
    }
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
  }: StatusActionsProps) => {
    switch (report.status) {
      case "SUBMITTED":
        return (
          <Button size="sm" onClick={() => onViewDetails(report)}>
            Review Details
          </Button>
        );
      case "APPROVED":
        return (
          <Button
            size="sm"
            onClick={() =>
              onCreateLease(
                report.tenantId,
                `${report.tenant.firstName} ${report.tenant.lastName}`
              )
            }
          >
            Create Lease
          </Button>
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
                    <Badge
                      variant={getStatusVariant(report.status)}
                      className="flex items-center gap-1 w-fit text-xs"
                    >
                      {getStatusIcon(report.status)}
                      {report.status}
                    </Badge>
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
                    <div className="flex items-center gap-2">
                      {/* Show eye icon only for non-pending statuses */}
                      {report.status !== "PENDING" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(report)}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                      )}
                      <StatusActions
                        report={report}
                        onViewDetails={handleViewDetails}
                        onCreateLease={handleCreateLease}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Loading screening reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-800 mb-2">
              Error Loading Reports
            </h3>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <Button onClick={fetchScreeningReports} size="sm">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Tenant Screening Reports
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage and review tenant screening applications
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Invite Tenant Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-sm">
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
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-sm"
                >
                  <Mail className="w-3 h-3 mr-1" />
                  {isInviting ? "Sending..." : "Send Invitation"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card
          className={`bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 cursor-pointer transition-all hover:shadow-md ${
            statusFilter === "PENDING" ? "ring-2 ring-blue-500" : ""
          }`}
          onClick={() =>
            setStatusFilter(statusFilter === "PENDING" ? "all" : "PENDING")
          }
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-600">Pending</p>
                <h3 className="text-xl font-bold text-blue-700">
                  {pendingCount}
                </h3>
                <p className="text-xs text-blue-500 mt-1">
                  Waiting for submission
                </p>
              </div>
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 cursor-pointer transition-all hover:shadow-md ${
            statusFilter === "SUBMITTED" ? "ring-2 ring-purple-500" : ""
          }`}
          onClick={() =>
            setStatusFilter(statusFilter === "SUBMITTED" ? "all" : "SUBMITTED")
          }
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-purple-600">Submitted</p>
                <h3 className="text-xl font-bold text-purple-700">
                  {submittedCount}
                </h3>
                <p className="text-xs text-purple-500 mt-1">Ready for review</p>
              </div>
              <FileText className="w-6 h-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`bg-gradient-to-r from-green-50 to-green-100 border-green-200 cursor-pointer transition-all hover:shadow-md ${
            statusFilter === "APPROVED" ? "ring-2 ring-green-500" : ""
          }`}
          onClick={() =>
            setStatusFilter(statusFilter === "APPROVED" ? "all" : "APPROVED")
          }
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-600">Approved</p>
                <h3 className="text-xl font-bold text-green-700">
                  {approvedCount}
                </h3>
                <p className="text-xs text-green-500 mt-1">
                  Ready for lease
                </p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`bg-gradient-to-r from-red-50 to-red-100 border-red-200 cursor-pointer transition-all hover:shadow-md ${
            statusFilter === "REJECTED" ? "ring-2 ring-red-500" : ""
          }`}
          onClick={() =>
            setStatusFilter(statusFilter === "REJECTED" ? "all" : "REJECTED")
          }
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-red-600">Rejected</p>
                <h3 className="text-xl font-bold text-red-700">
                  {rejectedCount}
                </h3>
                <p className="text-xs text-red-500 mt-1">Not approved</p>
              </div>
              <XCircle className="w-6 h-6 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                <Input
                  placeholder="Search tenants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-sm h-9"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="w-3 h-3 text-gray-400" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px] h-9 text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="SUBMITTED">Submitted</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-[130px] h-9 text-sm">
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Latest and Past Screening Records */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">
            {statusFilter === "all"
              ? "All Screening Reports"
              : `${
                  statusFilter.charAt(0) + statusFilter.slice(1).toLowerCase()
                } Screening Reports`}
          </CardTitle>
          <CardDescription className="text-sm">
            Manage your tenant screening applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="latest" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="latest" className="text-sm">
                Latest Records
                {latestReports.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {filteredLatestReports.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="past" className="text-sm">
                Past Records
                {pastReports.length > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {filteredPastReports.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="latest">
              <ScreeningTable reports={filteredLatestReports} />
            </TabsContent>

            <TabsContent value="past">
              <ScreeningTable reports={filteredPastReports} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantScreeningLandlord;
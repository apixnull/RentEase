import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  FileText,
  Briefcase,
  Home,
  Heart,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Smile,
  Frown,
} from "lucide-react";
import { getSpecificTenantScreeningRequest } from "@/api/tenant/screeningApi";
import { cn } from "@/lib/utils";

interface Landlord {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface TenantInfo {
  fullName: string;
  birthdate: string;
  employmentStatus: string;
  incomeSource: string;
  monthlyIncome: number;
}

interface Documents {
  hasGovernmentId: boolean;
  hasNbiClearance: boolean;
  hasProofOfIncome: boolean;
}

interface Employment {
  currentEmployer: string;
  jobPosition: string;
  yearsEmployed: number;
  employmentRemarks: string | null;
}

interface RentalHistory {
  previousLandlordName: string;
  previousLandlordContact: string;
  previousRentalAddress: string;
  reasonForLeaving: string;
  hadEvictionHistory: boolean;
  latePaymentHistory: boolean;
}

interface Lifestyle {
  smokes: boolean;
  drinksAlcohol: boolean;
  hasPets: boolean;
  worksNightShift: boolean;
  hasVisitors: boolean;
  noiseLevel: "LOW" | "MEDIUM" | "HIGH";
  otherLifestyle: string[];
}

interface ScreeningDetails {
  id: string;
  status: "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED";
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  landlord: Landlord;
  tenantInfo: TenantInfo;
  documents: Documents;
  employment: Employment;
  rentalHistory: RentalHistory;
  lifestyle: Lifestyle;
}

const ViewSpecificScreeningTenant = () => {
  const { screeningId } = useParams<{ screeningId: string }>();
  const navigate = useNavigate();
  const [screening, setScreening] = useState<ScreeningDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (screeningId) {
      fetchScreeningDetails();
    }
  }, [screeningId]);

  const fetchScreeningDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getSpecificTenantScreeningRequest(screeningId!);
      setScreening(response.data.data);
    } catch (err) {
      setError("Failed to fetch screening details");
      console.error("Error fetching screening details:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-4 h-4" />;
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "SUBMITTED":
        return <FileText className="w-4 h-4" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "text-green-600 bg-green-50 border-green-200";
      case "PENDING":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "SUBMITTED":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "REJECTED":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateAge = (birthdate: string) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatIncome = (income: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(income);
  };

  const getNoiseLevelText = (level: string) => {
    switch (level) {
      case "LOW": return "Low";
      case "MEDIUM": return "Medium";
      case "HIGH": return "High";
      default: return level;
    }
  };

  const getNoiseLevelColor = (level: string) => {
    switch (level) {
      case "LOW": return "text-green-600 bg-green-50";
      case "MEDIUM": return "text-yellow-600 bg-yellow-50";
      case "HIGH": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm">Loading screening details...</p>
        </div>
      </div>
    );
  }

  if (error || !screening) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-800 mb-2">
              {error || "Screening not found"}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {error || "The requested screening details could not be loaded."}
            </p>
            <Button onClick={() => navigate(-1)} size="sm">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Screening Details</h1>
          <p className="text-gray-600 text-sm mt-1">
            Application submitted on {formatDate(screening.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <Card className={cn("border-l-4", getStatusColor(screening.status))}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(screening.status)}
                  <div>
                    <h3 className="font-semibold text-lg">Application Status</h3>
                    <p className="text-sm text-gray-600">
                      {screening.status === "PENDING" && "Waiting for landlord review"}
                      {screening.status === "SUBMITTED" && "Under review by landlord"}
                      {screening.status === "APPROVED" && "Application approved"}
                      {screening.status === "REJECTED" && "Application not approved"}
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusVariant(screening.status)} className="text-sm">
                  {screening.status}
                </Badge>
              </div>
              
              {screening.remarks && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Landlord Remarks:</p>
                  <p className="text-sm text-gray-600 mt-1">{screening.remarks}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <p className="text-gray-500">Submitted</p>
                  <p className="font-medium">{formatDate(screening.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Last Updated</p>
                  <p className="font-medium">{formatDate(screening.updatedAt)}</p>
                </div>
                {screening.reviewedAt && (
                  <div className="col-span-2">
                    <p className="text-gray-500">Reviewed</p>
                    <p className="font-medium">{formatDate(screening.reviewedAt)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{screening.tenantInfo.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Age</p>
                  <p className="font-medium">
                    {calculateAge(screening.tenantInfo.birthdate)} years old
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Birthdate</p>
                  <p className="font-medium">
                    {formatDate(screening.tenantInfo.birthdate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Employment Status</p>
                  <p className="font-medium">{screening.tenantInfo.employmentStatus}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employment & Income */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="w-5 h-5" />
                Employment & Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Current Employer</p>
                  <p className="font-medium">{screening.employment.currentEmployer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Job Position</p>
                  <p className="font-medium">{screening.employment.jobPosition}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Years Employed</p>
                  <p className="font-medium">{screening.employment.yearsEmployed} years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Monthly Income</p>
                  <p className="font-medium">{formatIncome(screening.tenantInfo.monthlyIncome)}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Income Source</p>
                  <p className="font-medium">{screening.tenantInfo.incomeSource}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5" />
                Required Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Government ID</span>
                  {screening.documents.hasGovernmentId ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">NBI Clearance</span>
                  {screening.documents.hasNbiClearance ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Proof of Income</span>
                  {screening.documents.hasProofOfIncome ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lifestyle Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="w-5 h-5" />
                Lifestyle & Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  {screening.lifestyle.smokes ? (
                    <Frown className="w-4 h-4 text-red-500" />
                  ) : (
                    <Smile className="w-4 h-4 text-green-500" />
                  )}
                  <span className="text-sm">Smokes</span>
                </div>
                <div className="flex items-center gap-2">
                  {screening.lifestyle.drinksAlcohol ? (
                    <Frown className="w-4 h-4 text-orange-500" />
                  ) : (
                    <Smile className="w-4 h-4 text-green-500" />
                  )}
                  <span className="text-sm">Drinks Alcohol</span>
                </div>
                <div className="flex items-center gap-2">
                  {screening.lifestyle.hasPets ? (
                    <Smile className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Frown className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="text-sm">Has Pets</span>
                </div>
                <div className="flex items-center gap-2">
                  {screening.lifestyle.worksNightShift ? (
                    <Frown className="w-4 h-4 text-orange-500" />
                  ) : (
                    <Smile className="w-4 h-4 text-green-500" />
                  )}
                  <span className="text-sm">Works Night Shift</span>
                </div>
                <div className="flex items-center gap-2">
                  {screening.lifestyle.hasVisitors ? (
                    <Smile className="w-4 h-4 text-blue-500" />
                  ) : (
                    <Frown className="w-4 h-4 text-gray-500" />
                  )}
                  <span className="text-sm">Has Visitors</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Noise Level:</span>
                  <Badge variant="outline" className={getNoiseLevelColor(screening.lifestyle.noiseLevel)}>
                    {getNoiseLevelText(screening.lifestyle.noiseLevel)}
                  </Badge>
                </div>
              </div>
              
              {screening.lifestyle.otherLifestyle.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">Other Lifestyle Factors:</p>
                  <div className="flex flex-wrap gap-2">
                    {screening.lifestyle.otherLifestyle.map((factor, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rental History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Home className="w-5 h-5" />
                Rental History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Eviction History:</span>
                    {screening.rentalHistory.hadEvictionHistory ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Late Payments:</span>
                    {screening.rentalHistory.latePaymentHistory ? (
                      <XCircle className="w-4 h-4 text-red-500" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
                
                {screening.rentalHistory.previousLandlordName && (
                  <div>
                    <p className="text-sm text-gray-500">Previous Landlord</p>
                    <p className="font-medium">{screening.rentalHistory.previousLandlordName}</p>
                  </div>
                )}
                
                {screening.rentalHistory.previousRentalAddress && (
                  <div>
                    <p className="text-sm text-gray-500">Previous Address</p>
                    <p className="font-medium">{screening.rentalHistory.previousRentalAddress}</p>
                  </div>
                )}
                
                {screening.rentalHistory.reasonForLeaving && (
                  <div>
                    <p className="text-sm text-gray-500">Reason for Leaving</p>
                    <p className="font-medium">{screening.rentalHistory.reasonForLeaving}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-6">
          {/* Landlord Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5" />
                Landlord
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{screening.landlord.name}</p>
                  <p className="text-sm text-gray-500">{screening.landlord.email}</p>
                </div>
              </div>
              
            </CardContent>
          </Card>

          {/* Application Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-sm">Application Submitted</p>
                    <p className="text-xs text-gray-500">{formatDate(screening.createdAt)}</p>
                  </div>
                </div>
                
                {screening.reviewedAt && (
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full mt-2",
                      screening.status === "APPROVED" ? "bg-green-500" : "bg-red-500"
                    )}></div>
                    <div>
                      <p className="font-medium text-sm">
                        {screening.status === "APPROVED" ? "Application Approved" : "Application Rejected"}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(screening.reviewedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full" size="sm">
                  Download Application
                </Button>
                <Button variant="outline" className="w-full" size="sm">
                  Contact Support
                </Button>
                {screening.status === "REJECTED" && (
                  <Button className="w-full" size="sm">
                    Apply Again
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViewSpecificScreeningTenant;
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  User,
  Briefcase,
  Home,
  FileText,
  Shield,
  Mail,
  Calendar,
  DollarSign,
  Building,
  MapPin,
  Phone,
  Info,
  Wine,
  PawPrint,
  Moon,
  Users,
  Volume2,
  ThumbsDown,
  AlarmSmoke,
  TrendingUp,
  Activity,
  Heart,
  Zap,
} from "lucide-react";
import {
  getSpecificScreeningLandlordRequest,
  landlordReviewTenantScreeningRequest,
} from "@/api/landlord/screeningApi";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ========== TYPES ==========
interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
}

interface AiFindings {
  behavior?: string;
  financial?: string;
  [key: string]: any;
}

interface ScreeningDetail {
  id: string;
  tenantId: string;
  landlordId: string;
  status: "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED";
  remarks: string | null;
  reviewedAt: string | null;
  fullName: string;
  birthdate: string | null;
  employmentStatus: string | null;
  incomeSource: string | null;
  monthlyIncome: number | null;
  hasGovernmentId: boolean | null;
  hasNbiClearance: boolean | null;
  hasProofOfIncome: boolean | null;
  currentEmployer: string | null;
  jobPosition: string | null;
  yearsEmployed: number | null;
  employmentRemarks: string | null;
  previousLandlordName: string | null;
  previousLandlordContact: string | null;
  previousRentalAddress: string | null;
  reasonForLeaving: string | null;
  hadEvictionHistory: boolean | null;
  latePaymentHistory: boolean | null;
  smokes: boolean | null;
  drinksAlcohol: boolean | null;
  hasPets: boolean | null;
  worksNightShift: boolean | null;
  hasVisitors: boolean | null;
  noiseLevel: "LOW" | "MEDIUM" | "HIGH" | null;
  otherLifestyle: string[];
  aiRiskScore: number | null;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | null;
  aiScreeningSummary: string | null;
  aiFindings: AiFindings | null;
  aiGeneratedAt: string | null;
  createdAt: string;
  updatedAt: string;
  tenant: Tenant;
}

// ========== CUSTOM HOOKS ==========
const useScreeningData = (screeningId: string | undefined) => {
  const [screening, setScreening] = useState<ScreeningDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (screeningId) {
      fetchScreeningDetail();
    }
  }, [screeningId]);

  const fetchScreeningDetail = async () => {
    if (!screeningId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getSpecificScreeningLandlordRequest(screeningId);
      setScreening(response.data.data);
    } catch (err) {
      setError("Failed to fetch screening details");
      console.error("Error fetching screening details:", err);
    } finally {
      setLoading(false);
    }
  };

  return { screening, loading, error, refetch: fetchScreeningDetail };
};

// ========== UTILITY FUNCTIONS ==========
const utils = {
  getStatusIcon: (status: string) => {
    const icons = {
      APPROVED: <CheckCircle className="w-4 h-4" />,
      PENDING: <Clock className="w-4 h-4" />,
      SUBMITTED: <FileText className="w-4 h-4" />,
      REJECTED: <XCircle className="w-4 h-4" />,
    };
    return icons[status as keyof typeof icons] || <Clock className="w-4 h-4" />;
  },

  getStatusVariant: (status: string) => {
    const variants = {
      APPROVED: "default",
      PENDING: "secondary",
      SUBMITTED: "outline",
      REJECTED: "destructive",
    };
    return variants[status as keyof typeof variants] || "outline";
  },

  getRiskVariant: (riskLevel: string | null) => {
    const variants = {
      LOW: "default",
      MEDIUM: "secondary",
      HIGH: "destructive",
    };
    return riskLevel ? variants[riskLevel as keyof typeof variants] : "outline";
  },

  formatDate: (dateString: string | null) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },

  formatCurrency: (amount: number | null) => {
    if (!amount) return "Not provided";
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(amount);
  },

  calculateAge: (birthdate: string | null) => {
    if (!birthdate) return null;
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  },

  getInitials: (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  },

  getBooleanDisplay: (
    value: boolean | null,
    trueText = "Yes",
    falseText = "No"
  ) => {
    if (value === null)
      return {
        text: "Not provided",
        color: "bg-gray-300",
        variant: "outline" as const,
      };
    return value
      ? { text: trueText, color: "bg-red-500", variant: "destructive" as const }
      : { text: falseText, color: "bg-green-500", variant: "default" as const };
  },

  getLifestyleIcon: (type: string) => {
    const icons = {
      smokes: <AlarmSmoke className="w-4 h-4" />,
      drinksAlcohol: <Wine className="w-4 h-4" />,
      hasPets: <PawPrint className="w-4 h-4" />,
      worksNightShift: <Moon className="w-4 h-4" />,
      hasVisitors: <Users className="w-4 h-4" />,
      noiseLevel: <Volume2 className="w-4 h-4" />,
    };
    return icons[type as keyof typeof icons] || <Info className="w-4 h-4" />;
  },

  getRiskColor: (riskLevel: string | null) => {
    const colors = {
      LOW: "from-green-500 to-green-600",
      MEDIUM: "from-yellow-500 to-orange-500",
      HIGH: "from-red-500 to-pink-600",
    };
    return riskLevel
      ? colors[riskLevel as keyof typeof colors]
      : "from-gray-500 to-gray-600";
  },

  getRiskGradient: (riskScore: number | null) => {
    if (!riskScore) return "from-gray-500 to-gray-600";
    if (riskScore >= 0.7) return "from-red-500 to-pink-600";
    if (riskScore >= 0.4) return "from-yellow-500 to-orange-500";
    return "from-green-500 to-green-600";
  },
};

// ========== CONFIRMATION DIALOG COMPONENT ==========
const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: "APPROVE" | "REJECT";
  loading: boolean;
}) => {
  if (!isOpen) return null;

  const config = {
    APPROVE: {
      title: "Approve Application",
      description:
        "Are you sure you want to approve this tenant application? This action will notify the tenant and move forward with the rental process.",
      icon: <CheckCircle className="w-12 h-12 text-green-500" />,
      buttonText: "Yes, Approve Application",
      buttonVariant: "default" as const,
      buttonClass: "bg-green-600 hover:bg-green-700",
    },
    REJECT: {
      title: "Reject Application",
      description:
        "Are you sure you want to reject this tenant application? This action will notify the tenant and cannot be undone.",
      icon: <XCircle className="w-12 h-12 text-red-500" />,
      buttonText: "Yes, Reject Application",
      buttonVariant: "destructive" as const,
      buttonClass: "bg-red-600 hover:bg-red-700",
    },
  };

  const { title, description, icon, buttonText, buttonVariant, buttonClass } =
    config[type];

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-[999] p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 animate-in fade-in-90 zoom-in-90">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">{icon}</div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-gray-600 mt-1">{description}</p>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant={buttonVariant}
            onClick={onConfirm}
            disabled={loading}
            className={cn("flex-1", buttonClass)}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing...
              </>
            ) : (
              buttonText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ========== COMPONENTS ==========
const LoadingState = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <div>
        <p className="text-lg font-semibold text-gray-800">
          Loading screening details
        </p>
        <p className="text-gray-600">
          Please wait while we fetch the information...
        </p>
      </div>
    </div>
  </div>
);

const ErrorState = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
    <Card className="w-full max-w-md border-red-200">
      <CardContent className="p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{error}</h3>
          <p className="text-gray-600">
            We couldn't load the screening details. Please try again.
          </p>
        </div>
        <Button onClick={onRetry} className="w-full">
          Try Again
        </Button>
      </CardContent>
    </Card>
  </div>
);

const HeaderSection = ({
  screening,
}: {
  screening: ScreeningDetail;
  navigate: any;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">
        Tenant Screening Report
      </h1>
      <p className="text-gray-600 mt-1">
        Comprehensive analysis and risk assessment
      </p>
    </div>
    <Badge
      variant={utils.getStatusVariant(screening.status)}
      className="flex items-center gap-2 px-4 py-2 text-sm h-8"
    >
      {utils.getStatusIcon(screening.status)}
      {screening.status}
    </Badge>
  </div>
);

const RiskScoreMeter = ({
  riskScore,
  riskLevel,
}: {
  riskScore: number | null;
  riskLevel: string | null;
}) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center">
      <span className="font-medium text-gray-700">AI Risk Assessment</span>
      {riskLevel && (
        <Badge variant={utils.getRiskVariant(riskLevel)} className="text-sm">
          {riskLevel} RISK
        </Badge>
      )}
    </div>

    {riskScore !== null && (
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Risk Probability</span>
          <span className="font-semibold">{(riskScore * 100).toFixed(1)}%</span>
        </div>

        {/* Creative Risk Meter */}
        <div className="relative">
          <Progress
            value={riskScore * 100}
            className={cn(
              "h-4 rounded-full",
              `[&>div]:bg-gradient-to-r ${utils.getRiskGradient(riskScore)}`
            )}
          />
          <div className="absolute inset-0 flex justify-between items-center px-2">
            {[0, 25, 50, 75, 100].map((point) => (
              <div
                key={point}
                className={cn(
                  "w-1 h-1 rounded-full",
                  riskScore * 100 >= point ? "bg-white" : "bg-transparent"
                )}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span>Low Risk</span>
          <span>Medium Risk</span>
          <span>High Risk</span>
        </div>
      </div>
    )}
  </div>
);

const DocumentStatus = ({ screening }: { screening: ScreeningDetail }) => {
  const documents = [
    {
      label: "Government ID",
      value: screening.hasGovernmentId,
      description: "Valid government-issued ID",
    },
    {
      label: "NBI Clearance",
      value: screening.hasNbiClearance,
      description: "Criminal background clearance",
    },
    {
      label: "Proof of Income",
      value: screening.hasProofOfIncome,
      description: "Payslip, remittance, or bank proof",
    },
  ];

  const providedCount = documents.filter((doc) => doc.value).length;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="font-medium text-gray-700">Document Verification</span>
        <Badge variant={providedCount === 3 ? "default" : "secondary"}>
          {providedCount}/3 Provided
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {documents.map((doc, index) => {
          const display = utils.getBooleanDisplay(
            doc.value,
            "Verified",
            "Missing"
          );
          return (
            <div
              key={index}
              className={cn(
                "text-center p-4 border-2 rounded-xl transition-all duration-200",
                display.variant === "destructive"
                  ? "border-red-200 bg-red-50"
                  : "border-green-200 bg-green-50"
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 rounded-full mx-auto mb-3 transition-colors",
                  display.color
                )}
              />
              <h4
                className={cn(
                  "font-semibold mb-2",
                  display.variant === "destructive"
                    ? "text-red-900"
                    : "text-green-900"
                )}
              >
                {doc.label}
              </h4>
              <Badge variant={display.variant} className="mb-2">
                {display.text}
              </Badge>
              <p className="text-xs text-gray-600">{doc.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const LifestyleFactors = ({ screening }: { screening: ScreeningDetail }) => {
  const hasConcerningLifestyle =
    screening.smokes === true ||
    screening.drinksAlcohol === true ||
    screening.hasPets === true ||
    screening.worksNightShift === true ||
    screening.hasVisitors === true ||
    screening.noiseLevel === "HIGH" ||
    screening.otherLifestyle.length > 0;

  const lifestyleItems = [
    {
      type: "smokes",
      label: "Smokes",
      value: screening.smokes,
      icon: <AlarmSmoke className="w-4 h-4" />,
    },
    {
      type: "drinksAlcohol",
      label: "Drinks Alcohol",
      value: screening.drinksAlcohol,
      icon: <Wine className="w-4 h-4" />,
    },
    {
      type: "hasPets",
      label: "Has Pets",
      value: screening.hasPets,
      icon: <PawPrint className="w-4 h-4" />,
    },
    {
      type: "worksNightShift",
      label: "Works Night Shift",
      value: screening.worksNightShift,
      icon: <Moon className="w-4 h-4" />,
    },
    {
      type: "hasVisitors",
      label: "Has Visitors",
      value: screening.hasVisitors,
      icon: <Users className="w-4 h-4" />,
    },
  ];

  return (
    <Card
      className={cn(
        "border-l-4 transition-all duration-300",
        hasConcerningLifestyle
          ? "border-l-red-500 bg-gradient-to-r from-red-50 to-white"
          : "border-l-green-500 bg-gradient-to-r from-green-50 to-white"
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div
            className={cn(
              "p-3 rounded-xl",
              hasConcerningLifestyle ? "bg-red-100" : "bg-green-100"
            )}
          >
            <Activity
              className={cn(
                "w-6 h-6",
                hasConcerningLifestyle ? "text-red-600" : "text-green-600"
              )}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              Lifestyle Indicators
              {hasConcerningLifestyle && (
                <Badge variant="destructive" className="animate-pulse">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Attention Required
                </Badge>
              )}
            </div>
            <CardDescription
              className={
                hasConcerningLifestyle ? "text-red-700" : "text-green-700"
              }
            >
              {hasConcerningLifestyle
                ? "This tenant has lifestyle factors that may require special consideration"
                : "No concerning lifestyle factors reported"}
            </CardDescription>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Core Lifestyle Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {lifestyleItems.map((item, index) => {
            const display = utils.getBooleanDisplay(item.value);
            return (
              <div
                key={index}
                className={cn(
                  "flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105",
                  display.variant === "destructive"
                    ? "border-red-200 bg-red-50 shadow-sm"
                    : "border-green-200 bg-green-50"
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors",
                    display.variant === "destructive"
                      ? "bg-red-500"
                      : "bg-green-500"
                  )}
                >
                  {item.icon}
                </div>
                <span className="text-sm font-medium text-gray-700 text-center mb-2">
                  {item.label}
                </span>
                <Badge variant={display.variant} className="text-xs">
                  {display.text}
                </Badge>
              </div>
            );
          })}

          {/* Noise Level */}
          <div
            className={cn(
              "flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105",
              screening.noiseLevel === "HIGH"
                ? "border-red-200 bg-red-50"
                : screening.noiseLevel === "MEDIUM"
                ? "border-yellow-200 bg-yellow-50"
                : "border-green-200 bg-green-50"
            )}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mb-3",
                screening.noiseLevel === "HIGH"
                  ? "bg-red-500"
                  : screening.noiseLevel === "MEDIUM"
                  ? "bg-yellow-500"
                  : "bg-green-500"
              )}
            >
              <Volume2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700 text-center mb-2">
              Noise Level
            </span>
            <Badge
              variant={
                screening.noiseLevel === "HIGH"
                  ? "destructive"
                  : screening.noiseLevel === "MEDIUM"
                  ? "secondary"
                  : "default"
              }
              className="text-xs"
            >
              {screening.noiseLevel || "Not specified"}
            </Badge>
          </div>
        </div>

        {/* Other Lifestyle Factors */}
        {screening.otherLifestyle.length > 0 && (
          <div className="pt-4 border-t">
            <label className="text-sm font-medium text-gray-700 mb-3  flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Additional Lifestyle Preferences
            </label>
            <div className="flex flex-wrap gap-2">
              {screening.otherLifestyle.map((factor, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200"
                >
                  {factor}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AISummaryCard = ({ screening }: { screening: ScreeningDetail }) => {
  if (!screening.aiGeneratedAt) return null;

  return (
    <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-white">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <CardTitle>AI Risk Intelligence</CardTitle>
              <CardDescription>
                Generated on {utils.formatDate(screening.aiGeneratedAt)}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <RiskScoreMeter
          riskScore={screening.aiRiskScore}
          riskLevel={screening.riskLevel}
        />

        {screening.aiScreeningSummary && (
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2 text-gray-700">
              <TrendingUp className="w-4 h-4" />
              Executive Summary
            </h4>
            <div
              className={cn(
                "p-4 rounded-xl border-2 text-gray-700",
                screening.riskLevel === "HIGH"
                  ? "border-red-200 bg-red-50"
                  : screening.riskLevel === "MEDIUM"
                  ? "border-yellow-200 bg-yellow-50"
                  : "border-green-200 bg-green-50"
              )}
            >
              <p className="leading-relaxed">{screening.aiScreeningSummary}</p>
            </div>
          </div>
        )}

        {screening.aiFindings && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {screening.aiFindings.financial && (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-gray-700">
                  <DollarSign className="w-4 h-4" />
                  Financial Assessment
                </h4>
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {screening.aiFindings.financial}
                  </p>
                </div>
              </div>
            )}
            {screening.aiFindings.behavior && (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2 text-gray-700">
                  <Heart className="w-4 h-4" />
                  Behavioral Assessment
                </h4>
                <div className="p-4 rounded-xl border border-green-200 bg-green-50">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {screening.aiFindings.behavior}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const QuickStatsPanel = ({ screening }: { screening: ScreeningDetail }) => {
  const hasConcerningLifestyle =
    screening.smokes === true ||
    screening.drinksAlcohol === true ||
    screening.hasPets === true ||
    screening.worksNightShift === true ||
    screening.hasVisitors === true ||
    screening.noiseLevel === "HIGH" ||
    screening.otherLifestyle.length > 0;

  const documentScore = [
    screening.hasGovernmentId,
    screening.hasNbiClearance,
    screening.hasProofOfIncome,
  ].filter(Boolean).length;

  const stats = [
    {
      label: "Document Score",
      value: `${documentScore}/3`,
      color:
        documentScore === 3
          ? "text-green-600"
          : documentScore >= 2
          ? "text-yellow-600"
          : "text-red-600",
      icon: <FileText className="w-4 h-4" />,
    },
    {
      label: "Risk Level",
      value: screening.riskLevel || "N/A",
      color:
        screening.riskLevel === "HIGH"
          ? "text-red-600"
          : screening.riskLevel === "MEDIUM"
          ? "text-yellow-600"
          : "text-green-600",
      icon: <Activity className="w-4 h-4" />,
    },
    {
      label: "Lifestyle Factors",
      value: hasConcerningLifestyle ? "Attention" : "Good",
      color: hasConcerningLifestyle ? "text-red-600" : "text-green-600",
      icon: <Heart className="w-4 h-4" />,
    },
    {
      label: "Income Status",
      value:
        screening.monthlyIncome && screening.monthlyIncome > 15000
          ? "Adequate"
          : "Review",
      color:
        screening.monthlyIncome && screening.monthlyIncome > 15000
          ? "text-green-600"
          : "text-yellow-600",
      icon: <DollarSign className="w-4 h-4" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-4 rounded-xl border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">
              {stat.label}
            </span>
            {stat.icon}
          </div>
          <div className={cn("text-lg font-bold", stat.color)}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
};

// ========== MAIN COMPONENT ==========
const ViewSpecificScreeningLandlord = () => {
  const { screeningId } = useParams<{ screeningId: string }>();
  const navigate = useNavigate();
  const { screening, loading, error, refetch } = useScreeningData(screeningId);

  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    type: "APPROVE" | "REJECT" | null;
  }>({
    isOpen: false,
    type: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReviewAction = async (action: "APPROVE" | "REJECT") => {
    if (!screeningId || isSubmitting) return;

    // Normalize action before sending to API
    const normalizedAction =
      action === "REJECT"
        ? "REJECTED"
        : action === "APPROVE"
        ? "APPROVED"
        : action;

    setIsSubmitting(true);

    try {
      const response = await landlordReviewTenantScreeningRequest(screeningId, {
        action: normalizedAction,
      });

      // Show backend message (like "Tenant screening approved successfully.")
      toast.success(response.data.message);

      // Close dialog and refresh
      setConfirmationDialog({ isOpen: false, type: null });
      await refetch();
    } catch (err) {
      console.error(
        `Error ${action === "APPROVE" ? "approving" : "rejecting"} screening:`,
        err
      );
      alert(
        `Failed to ${
          action === "APPROVE" ? "approve" : "reject"
        } application. Please try again.`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openConfirmationDialog = (type: "APPROVE" | "REJECT") => {
    setConfirmationDialog({ isOpen: true, type });
  };

  const closeConfirmationDialog = () => {
    if (!isSubmitting) {
      setConfirmationDialog({ isOpen: false, type: null });
    }
  };

  if (loading) return <LoadingState />;
  if (error || !screening)
    return (
      <ErrorState error={error || "Screening not found"} onRetry={refetch} />
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={closeConfirmationDialog}
        onConfirm={() => handleReviewAction(confirmationDialog.type!)}
        type={confirmationDialog.type!}
        loading={isSubmitting}
      />

      <div className="max-w-7xl mx-auto">
        <HeaderSection screening={screening} navigate={navigate} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Analysis Section */}
            <AISummaryCard screening={screening} />

            {/* Review Status */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  Application Timeline
                </CardTitle>
                <CardDescription>
                  Screening progress and current status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      Current Status
                    </label>
                    <Badge
                      variant={utils.getStatusVariant(screening.status)}
                      className="flex items-center gap-2 w-fit"
                    >
                      {utils.getStatusIcon(screening.status)}
                      {screening.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      Submitted Date
                    </label>
                    <p className="font-medium text-gray-900">
                      {utils.formatDate(screening.createdAt)}
                    </p>
                  </div>
                </div>

                {screening.reviewedAt && (
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      Reviewed Date
                    </label>
                    <p className="font-medium text-gray-900">
                      {utils.formatDate(screening.reviewedAt)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  Personal Profile
                </CardTitle>
                <CardDescription>
                  Tenant's personal and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      Full Name
                    </label>
                    <p className="font-medium text-gray-900">
                      {screening.fullName}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Birthdate & Age
                    </label>
                    <p className="font-medium text-gray-900">
                      {screening.birthdate
                        ? `${utils.formatDate(
                            screening.birthdate
                          )} (${utils.calculateAge(
                            screening.birthdate
                          )} years old)`
                        : "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      Employment Status
                    </label>
                    <p className="font-medium text-gray-900">
                      {screening.employmentStatus || "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Monthly Income
                    </label>
                    <p className="font-medium text-gray-900">
                      {utils.formatCurrency(screening.monthlyIncome)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      Income Source
                    </label>
                    <p className="font-medium text-gray-900">
                      {screening.incomeSource || "Not provided"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <FileText className="w-5 h-5 text-orange-600" />
                  </div>
                  Document Verification
                </CardTitle>
                <CardDescription>
                  Required documents and verification status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentStatus screening={screening} />
              </CardContent>
            </Card>

            {/* Employment History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  Employment & Financial History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Current Employer
                    </label>
                    <p className="font-medium text-gray-900">
                      {screening.currentEmployer || "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      Job Position
                    </label>
                    <p className="font-medium text-gray-900">
                      {screening.jobPosition || "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      Years Employed
                    </label>
                    <p className="font-medium text-gray-900">
                      {screening.yearsEmployed !== null
                        ? `${screening.yearsEmployed} years`
                        : "Not provided"}
                    </p>
                  </div>
                </div>

                {screening.employmentRemarks && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-500">
                      Employment Remarks
                    </label>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border">
                      {screening.employmentRemarks}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rental History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Home className="w-5 h-5 text-indigo-600" />
                  </div>
                  Rental Background
                </CardTitle>
                <CardDescription>
                  Previous rental experience and reliability indicators
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Previous Landlord
                    </label>
                    <p className="font-medium text-gray-900">
                      {screening.previousLandlordName || "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Landlord Contact
                    </label>
                    <p className="font-medium text-gray-900">
                      {screening.previousLandlordContact || "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Previous Address
                    </label>
                    <p className="font-medium text-gray-900">
                      {screening.previousRentalAddress || "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-500">
                      Reason for Leaving
                    </label>
                    <p className="font-medium text-gray-900">
                      {screening.reasonForLeaving || "Not provided"}
                    </p>
                  </div>
                </div>

                {/* Red Flags */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  {[
                    {
                      label: "Eviction History",
                      value: screening.hadEvictionHistory,
                      icon: <ThumbsDown className="w-4 h-4" />,
                    },
                    {
                      label: "Late Payment History",
                      value: screening.latePaymentHistory,
                      icon: <ThumbsDown className="w-4 h-4" />,
                    },
                  ].map((item, index) => {
                    const display = utils.getBooleanDisplay(
                      item.value,
                      "Yes",
                      "No"
                    );
                    return (
                      <div
                        key={index}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border transition-all",
                          display.variant === "destructive"
                            ? "bg-red-50 border-red-200"
                            : "bg-green-50 border-green-200"
                        )}
                      >
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center",
                            display.variant === "destructive"
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
                          )}
                        >
                          {item.icon}
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-700">
                            {item.label}
                          </span>
                          <Badge variant={display.variant} className="ml-2">
                            {display.text}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Lifestyle Indicators */}
            <LifestyleFactors screening={screening} />
          </div>

          {/* Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Tenant Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Applicant Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-gray-200">
                    <AvatarFallback className="bg-blue-100 text-blue-600 text-lg font-semibold">
                      {utils.getInitials(
                        screening.tenant.firstName,
                        screening.tenant.lastName
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {screening.tenant.firstName} {screening.tenant.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-2 truncate">
                      <Mail className="w-4 h-4 flex-shrink-0" />
                      {screening.tenant.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Application Status
                    </span>
                    <Badge
                      variant={utils.getStatusVariant(screening.status)}
                      className="flex items-center gap-1"
                    >
                      {utils.getStatusIcon(screening.status)}
                      {screening.status}
                    </Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Submitted</span>
                    <span className="text-sm font-medium text-gray-900">
                      {utils.formatDate(screening.createdAt)}
                    </span>
                  </div>

                  {screening.reviewedAt && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Reviewed</span>
                      <span className="text-sm font-medium text-gray-900">
                        {utils.formatDate(screening.reviewedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Risk Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <QuickStatsPanel screening={screening} />
              </CardContent>
            </Card>

            {/* Actions Card */}
            <Card>
              <CardHeader>
                <CardTitle>Application Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {screening.status === "SUBMITTED" && (
                  <>
                    <Button
                      onClick={() => openConfirmationDialog("APPROVE")}
                      className="w-full bg-green-600 hover:bg-green-700 h-11 transition-all duration-200 hover:scale-105"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Application
                    </Button>
                    <Button
                      onClick={() => openConfirmationDialog("REJECT")}
                      variant="outline"
                      className="w-full h-11 border-red-200 text-red-600 hover:bg-red-50 transition-all duration-200"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Application
                    </Button>
                  </>
                )}
                {screening.status === "APPROVED" && (
                  <Button className="w-full h-11 transition-all duration-200 hover:scale-105">
                    <FileText className="w-4 h-4 mr-2" />
                    Create Lease Agreement
                  </Button>
                )}
                {(screening.status === "PENDING" ||
                  screening.status === "REJECTED") && (
                  <div className="text-center py-2">
                    <p className="text-sm text-gray-500">
                      {screening.status === "PENDING"
                        ? "Waiting for tenant to submit application"
                        : "Application has been rejected"}
                    </p>
                  </div>
                )}

                <Button
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => navigate("/landlord/screening")}
                >
                  Back to All Applications
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSpecificScreeningLandlord;

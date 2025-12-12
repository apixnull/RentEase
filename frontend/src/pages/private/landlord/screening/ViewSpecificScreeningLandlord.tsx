import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  User,
  FileText,
  Shield,
  Mail,
  DollarSign,
  MapPin,
  TrendingUp,
  Heart,
  Sparkles,
  Briefcase,
  Home,
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
  status: "PENDING" | "TENANT-REJECT" | "SUBMITTED" | "APPROVED" | "REJECTED";
  remarks: string | null;
  reviewedAt: string | null;
  submitted: string | null;
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
  "TENANT-REJECT": {
    // Badge & Pill
    badge: "bg-slate-50 border border-slate-200 text-slate-700",
    pill: "bg-slate-100 text-slate-800",
    
    // Gradients
    gradient: "from-slate-500 to-gray-500",
    gradientLight: "from-slate-200/70 via-slate-100/50 to-slate-200/70",
    gradientButton: "from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700",
    
    // Backgrounds
    background: "bg-slate-50 border-slate-300",
    backgroundCard: "bg-gradient-to-br from-slate-50 to-gray-50",
    
    // Icon & Text
    iconBackground: "bg-slate-500",
    textColor: "text-slate-700",
    textColorDark: "text-slate-900",
    textColorLight: "text-slate-600",
    
    // Blur Effects
    blurLight: "bg-slate-200/40",
    blurDark: "bg-slate-300/40",
    
    // Borders
    border: "border-slate-200",
    borderDark: "border-slate-300",
    borderCard: "border-2 border-slate-300",
    
    // Timeline (if needed)
    timelineActive: "bg-slate-500 ring-4 ring-slate-200",
    timelineCompleted: "bg-slate-500",
    timelineLine: "bg-slate-300",
  },
} as const;

// ========== UTILITY FUNCTIONS ==========
const utils = {
  getStatusTheme: (status: string) => {
    return SCREENING_STATUS_THEME[status as keyof typeof SCREENING_STATUS_THEME] || SCREENING_STATUS_THEME.PENDING;
  },

  getStatusIcon: (status: string) => {
    const icons = {
      APPROVED: <CheckCircle className="w-5 h-5" />,
      PENDING: <Clock className="w-5 h-5" />,
      SUBMITTED: <FileText className="w-5 h-5" />,
      REJECTED: <XCircle className="w-5 h-5" />,
      "TENANT-REJECT": <XCircle className="w-5 h-5" />,
    };
    return icons[status as keyof typeof icons] || <Clock className="w-5 h-5" />;
  },

  getStatusHeaderClasses: (status: string) => {
    const theme = utils.getStatusTheme(status);
    
    switch (status) {
      case "PENDING":
        return {
          gradient: "from-amber-300/80 via-orange-200/70 to-amber-200/60",
          iconBg: "bg-gradient-to-br from-amber-600 via-orange-600 to-amber-600",
          iconShadow: "shadow-amber-500/30",
          text: theme.textColorLight,
          titleGradient: "from-gray-900 via-amber-900 to-gray-900",
          bgBlur1: "from-amber-300/50 to-orange-400/40",
          bgBlur2: "from-orange-300/50 to-amber-300/40",
          bgBlur3: theme.blurLight,
          accentLine: "via-amber-400/70",
          underline: "from-amber-500/80 via-orange-400/80 to-amber-400/80",
          sparklesColor: theme.textColorLight,
        };
      case "SUBMITTED":
        return {
          gradient: "from-indigo-300/80 via-blue-200/70 to-indigo-200/60",
          iconBg: "bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-600",
          iconShadow: "shadow-indigo-500/30",
          text: theme.textColorLight,
          titleGradient: "from-gray-900 via-indigo-900 to-gray-900",
          bgBlur1: "from-indigo-300/50 to-blue-400/40",
          bgBlur2: "from-blue-300/50 to-indigo-300/40",
          bgBlur3: theme.blurLight,
          accentLine: "via-indigo-400/70",
          underline: "from-indigo-500/80 via-blue-400/80 to-indigo-400/80",
          sparklesColor: theme.textColorLight,
        };
      case "APPROVED":
        return {
          gradient: "from-emerald-300/80 via-green-200/70 to-emerald-200/60",
          iconBg: "bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-600",
          iconShadow: "shadow-emerald-500/30",
          text: theme.textColorLight,
          titleGradient: "from-gray-900 via-emerald-900 to-gray-900",
          bgBlur1: "from-emerald-300/50 to-green-400/40",
          bgBlur2: "from-green-300/50 to-emerald-300/40",
          bgBlur3: theme.blurLight,
          accentLine: "via-emerald-400/70",
          underline: "from-emerald-500/80 via-green-400/80 to-emerald-400/80",
          sparklesColor: theme.textColorLight,
        };
      case "REJECTED":
        return {
          gradient: "from-rose-300/80 via-red-200/70 to-rose-200/60",
          iconBg: "bg-gradient-to-br from-rose-600 via-red-600 to-rose-600",
          iconShadow: "shadow-rose-500/30",
          text: theme.textColorLight,
          titleGradient: "from-gray-900 via-rose-900 to-gray-900",
          bgBlur1: "from-rose-300/50 to-red-400/40",
          bgBlur2: "from-red-300/50 to-rose-300/40",
          bgBlur3: theme.blurLight,
          accentLine: "via-rose-400/70",
          underline: "from-rose-500/80 via-red-400/80 to-rose-400/80",
          sparklesColor: theme.textColorLight,
        };
      case "TENANT-REJECT":
        return {
          gradient: "from-slate-300/80 via-gray-200/70 to-slate-200/60",
          iconBg: "bg-gradient-to-br from-slate-600 via-gray-600 to-slate-600",
          iconShadow: "shadow-slate-500/30",
          text: theme.textColorLight,
          titleGradient: "from-gray-900 via-slate-900 to-gray-900",
          bgBlur1: "from-slate-300/50 to-gray-400/40",
          bgBlur2: "from-gray-300/50 to-slate-300/40",
          bgBlur3: theme.blurLight,
          accentLine: "via-slate-400/70",
          underline: "from-slate-500/80 via-gray-400/80 to-slate-400/80",
          sparklesColor: theme.textColorLight,
        };
      default:
        return {
          gradient: "from-slate-300/80 via-slate-200/70 to-slate-200/60",
          iconBg: "from-slate-600 via-slate-600 to-slate-600",
          iconShadow: "shadow-slate-500/30",
          text: "text-slate-600",
          titleGradient: "from-gray-900 via-slate-900 to-gray-900",
          bgBlur1: "from-slate-300/50 to-slate-400/40",
          bgBlur2: "from-slate-300/50 to-slate-300/40",
          bgBlur3: "bg-slate-200/30",
          accentLine: "via-slate-400/70",
          underline: "from-slate-500/80 via-slate-400/80 to-slate-400/80",
          sparklesColor: "text-slate-500",
        };
    }
  },

  getStatusBadgeClasses: (status: string) => {
    const theme = utils.getStatusTheme(status);
    return theme.badge;
  },

  formatDate: (dateString: string | null) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  formatShortDate: (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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
    if (!riskScore) return "[&>div]:from-gray-400 [&>div]:to-gray-500";
    if (riskScore >= 0.7) return "[&>div]:from-rose-500 [&>div]:to-red-600";
    if (riskScore >= 0.4)
      return "[&>div]:from-amber-400 [&>div]:to-orange-500";
    return "[&>div]:from-sky-400 [&>div]:to-blue-600";
  },

  formatLongDate: (dateString: string | null) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },
};

const riskThemes = {
  HIGH: {
    cardBg: "bg-gradient-to-br from-rose-50 to-red-50 border-rose-200/60",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    title: "text-rose-900",
    description: "text-rose-700",
    heading: "text-rose-800",
    accent: "text-rose-800",
    range: "text-rose-600",
    summaryBorder: "border-rose-200/60",
    summaryText: "text-rose-900",
    overallBorder: "border-rose-200/60",
    overallText: "text-rose-900",
    badge: "bg-gradient-to-br from-rose-50 to-red-50 border-rose-200/60 text-rose-700",
  },
  MEDIUM: {
    cardBg: "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/60",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    title: "text-amber-900",
    description: "text-amber-700",
    heading: "text-amber-800",
    accent: "text-amber-800",
    range: "text-amber-600",
    summaryBorder: "border-amber-200/60",
    summaryText: "text-amber-900",
    overallBorder: "border-amber-200/60",
    overallText: "text-amber-900",
    badge: "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/60 text-amber-700",
  },
  LOW: {
    cardBg: "bg-gradient-to-br from-sky-50 to-blue-50 border-sky-200/60",
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
    title: "text-sky-900",
    description: "text-sky-700",
    heading: "text-sky-800",
    accent: "text-sky-800",
    range: "text-sky-600",
    summaryBorder: "border-sky-200/60",
    summaryText: "text-sky-900",
    overallBorder: "border-sky-200/60",
    overallText: "text-sky-900",
    badge: "bg-gradient-to-br from-sky-50 to-blue-50 border-sky-200/60 text-sky-700",
  },
} as const;

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

  const config: {
    [key in "APPROVE" | "REJECT"]: {
      title: string;
      description: string;
      icon: React.ReactElement;
      buttonText: string;
      buttonVariant: "default" | "destructive";
      buttonClass: string;
    };
  } = {
    APPROVE: {
      title: "Approve Application",
      description:
        "Are you sure you want to approve this tenant application? This action will notify the tenant and move forward with the rental process.",
      icon: <CheckCircle className="w-12 h-12 text-green-500" />,
      buttonText: "Yes, Approve Application",
      buttonVariant: "default",
      buttonClass: "bg-green-600 hover:bg-green-700",
    },
    REJECT: {
      title: "Reject Application",
      description:
        "Are you sure you want to reject this tenant application? This action will notify the tenant and cannot be undone.",
      icon: <XCircle className="w-12 h-12 text-red-500" />,
      buttonText: "Yes, Reject Application",
      buttonVariant: "destructive",
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

// ========== LOADING & ERROR STATES ==========
const LoadingState = () => (
  <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-6xl space-y-6">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
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
  <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
    <Card className="w-full max-w-md shadow-md">
      <CardContent className="p-6 text-center space-y-4">
        <AlertTriangle className="mx-auto h-8 w-8 text-rose-500" />
        <div>
          <h3 className="text-base font-semibold text-slate-900">{error}</h3>
          <p className="mt-1 text-sm text-slate-600">
            The requested screening details could not be loaded.
          </p>
        </div>
        <Button onClick={onRetry} size="sm">
          Try Again
        </Button>
      </CardContent>
    </Card>
  </div>
);

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

      toast.success(response.data.message);

      setConfirmationDialog({ isOpen: false, type: null });
      await refetch();
    } catch (err) {
      console.error(
        `Error ${action === "APPROVE" ? "approving" : "rejecting"} screening:`,
        err
      );
      toast.error(
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

  const headerClasses = utils.getStatusHeaderClasses(screening.status);
  const riskLevelKey = (
    screening.riskLevel || "LOW"
  ) as keyof typeof riskThemes;
  const riskTheme = riskThemes[riskLevelKey];

  // Build timeline steps
  const timelineSteps: Array<{
    label: string;
    date: string;
    status: "active" | "completed" | "pending";
    icon: any;
    stepType: "PENDING" | "TENANT-REJECT" | "SUBMITTED" | "APPROVED" | "REJECTED";
    description: string;
  }> = [];

  // Always show PENDING step
  timelineSteps.push({
    label: "Invitation Sent",
    date: screening.createdAt,
    status: screening.status === "PENDING" ? "active" : "completed",
    icon: User,
    stepType: "PENDING",
    description: "You sent a screening invitation to this tenant.",
  });

  // Show TENANT-REJECT step if tenant declined
  if (screening.status === "TENANT-REJECT") {
    timelineSteps.push({
      label: "Invitation Declined",
      date: screening.updatedAt,
      status: "active",
      icon: XCircle,
      stepType: "TENANT-REJECT",
      description:
        "The tenant has declined your screening invitation.",
    });
  }

  // Show SUBMITTED step if status is SUBMITTED, APPROVED, or REJECTED
  if (
    screening.status === "SUBMITTED" ||
    screening.status === "APPROVED" ||
    screening.status === "REJECTED"
  ) {
    timelineSteps.push({
      label: "Application Submitted",
      date: screening.submitted || screening.createdAt,
      status: screening.status === "SUBMITTED" ? "active" : "completed",
      icon: FileText,
      stepType: "SUBMITTED",
      description:
        "The tenant has submitted their screening information for your review.",
    });
  }

  // Show APPROVED or REJECTED step
  if (screening.status === "APPROVED" && screening.reviewedAt) {
    timelineSteps.push({
      label: "Application Approved",
      date: screening.reviewedAt,
      status: "active",
      icon: CheckCircle,
      stepType: "APPROVED",
      description:
        "You have reviewed and approved this application. The tenant can now proceed with the next steps.",
    });
  } else if (screening.status === "REJECTED" && screening.reviewedAt) {
    timelineSteps.push({
      label: "Application Rejected",
      date: screening.reviewedAt,
      status: "active",
      icon: XCircle,
      stepType: "REJECTED",
      description:
        "You have reviewed this application and decided not to proceed.",
    });
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {/* Status-based Header - Similar to ViewSpecificScreeningTenant */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full"
        >
          <div className="relative overflow-hidden rounded-2xl">
            <div
              className={cn(
                "absolute inset-0 -z-10 bg-gradient-to-r opacity-95",
                headerClasses.gradient
              )}
            />

            <div className="relative m-[1px] rounded-[15px] bg-white/80 backdrop-blur-lg border border-white/60 shadow-lg">
              <motion.div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute -top-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-br blur-3xl",
                  headerClasses.bgBlur1
                )}
                initial={{ opacity: 0.4, scale: 0.8, x: -20 }}
                animate={{ opacity: 0.7, scale: 1.1, x: 0 }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }}
              />
              <motion.div
                aria-hidden
                className={cn(
                  "pointer-events-none absolute -bottom-12 -right-12 h-56 w-56 rounded-full bg-gradient-to-tl blur-3xl",
                  headerClasses.bgBlur2
                )}
                initial={{ opacity: 0.3, scale: 1, x: 20 }}
                animate={{ opacity: 0.8, scale: 1.2, x: 0 }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }}
              />

              <div className="px-4 sm:px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="relative flex-shrink-0"
                    >
                      <div
                        className={cn(
                          "relative h-12 w-12 rounded-2xl bg-gradient-to-br text-white grid place-items-center shadow-xl",
                          headerClasses.iconBg,
                          headerClasses.iconShadow
                        )}
                      >
                        <div className="relative z-10">
                          {utils.getStatusIcon(screening.status)}
                        </div>
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
                      </div>
                    </motion.div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 mb-1">
                        <h1
                          className={cn(
                            "text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r bg-clip-text text-transparent",
                            headerClasses.titleGradient
                          )}
                        >
                          {screening.tenant.firstName} {screening.tenant.lastName}
                        </h1>
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        >
                          <Sparkles
                            className={cn("h-5 w-5", headerClasses.sparklesColor)}
                          />
                        </motion.div>
                      </div>
                      <p className="text-sm text-slate-600 flex items-center gap-1.5">
                        <User
                          className={cn(
                            "h-3.5 w-3.5 flex-shrink-0",
                            headerClasses.text
                          )}
                        />
                        Screening Report • {utils.formatShortDate(screening.createdAt)}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-semibold border",
                      utils.getStatusBadgeClasses(screening.status)
                    )}
                  >
                    {screening.status}
                  </Badge>
                </div>

                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                  style={{ originX: 0 }}
                  className="mt-4 relative h-1 w-full rounded-full overflow-hidden"
                >
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-r rounded-full",
                      headerClasses.underline
                    )}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {/* Main Content */}
          <div className="space-y-6">

            {/* Application Timeline - First Section */}
            <Card className="border border-slate-200/70 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-600" />
                  Application Timeline
                </CardTitle>
                <CardDescription>
                  Track the progress of this screening application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Status Summary */}
                {(() => {
                  const theme = utils.getStatusTheme(screening.status);
                  return (
                    <div
                      className={cn(
                        "p-4 rounded-lg border-2",
                        theme.backgroundCard,
                        theme.borderCard
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-12 h-12 rounded-full flex items-center justify-center text-white",
                              theme.iconBackground
                            )}
                          >
                            {utils.getStatusIcon(screening.status)}
                          </div>
                          <div>
                            <p className={cn("font-semibold", theme.textColorDark)}>
                              Current Status
                            </p>
                            <p className={cn("text-sm", theme.textColor)}>
                              {screening.status}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs font-semibold border",
                              theme.badge
                            )}
                          >
                            {screening.status}
                          </Badge>
                          <p className={cn("text-xs mt-1", theme.textColorLight)}>
                            {screening.status === "PENDING"
                              ? utils.formatShortDate(screening.createdAt)
                              : screening.status === "TENANT-REJECT"
                              ? utils.formatShortDate(screening.updatedAt)
                              : screening.status === "SUBMITTED" &&
                                screening.submitted
                              ? utils.formatShortDate(screening.submitted)
                              : (screening.status === "APPROVED" ||
                                  screening.status === "REJECTED") &&
                                screening.reviewedAt
                              ? utils.formatShortDate(screening.reviewedAt)
                              : utils.formatShortDate(screening.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Timeline Steps */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">
                    Application Timeline
                  </h3>
                  <div className="relative">
                    <div className="space-y-4">
                      {timelineSteps.map((step, index) => {
                        const StepIcon = step.icon;
                        const isActive = step.status === "active";
                        const isCompleted = step.status === "completed";
                        const isLast = index === timelineSteps.length - 1;
                        const stepTheme = utils.getStatusTheme(step.stepType);

                        let iconBgColor = "bg-slate-400";
                        let iconRingColor = "";
                        let contentBgColor = "bg-slate-50";
                        let contentBorderColor = "border-slate-200";
                        let textColor = "text-slate-600";
                        let dateColor = "text-slate-500";
                        let timelineColor = "bg-slate-200";
                        let activeBadgeColor = "bg-slate-600";

                        if (isActive) {
                          // timelineActive is "bg-amber-500 ring-4 ring-amber-200", extract ring part
                          const timelineParts = stepTheme.timelineActive.split(" ");
                          iconBgColor = stepTheme.iconBackground;
                          iconRingColor = timelineParts.slice(1).join(" "); // Get "ring-4 ring-amber-200"
                          contentBgColor = stepTheme.backgroundCard;
                          contentBorderColor = stepTheme.borderCard;
                          textColor = stepTheme.textColorDark;
                          dateColor = stepTheme.textColor;
                          // Extract color from iconBackground and make it darker for badge
                          const colorMatch = stepTheme.iconBackground.match(/bg-(\w+)-(\d+)/);
                          if (colorMatch) {
                            activeBadgeColor = `bg-${colorMatch[1]}-600`;
                          }
                        } else if (isCompleted) {
                          iconBgColor = stepTheme.iconBackground;
                          contentBgColor = stepTheme.backgroundCard;
                          contentBorderColor = stepTheme.border;
                          textColor = stepTheme.textColorDark;
                          dateColor = stepTheme.textColor;
                          timelineColor = stepTheme.timelineLine;
                        }

                        return (
                          <div
                            key={index}
                            className="relative flex items-start gap-4"
                          >
                            {!isLast && (
                              <div
                                className={cn(
                                  "absolute left-5 top-12 w-0.5",
                                  timelineColor
                                )}
                                style={{ height: "calc(100% + 1rem)" }}
                              />
                            )}

                            <div
                              className={cn(
                                "relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white",
                                iconBgColor,
                                isActive ? `${iconRingColor} shadow-lg` : ""
                              )}
                            >
                              <StepIcon className="h-5 w-5" />
                              {isActive && (
                                <div
                                  className={cn(
                                    "absolute inset-0 rounded-full animate-ping opacity-75",
                                    iconBgColor
                                  )}
                                />
                              )}
                            </div>

                            <div
                              className={cn(
                                "flex-1 pt-1 pb-4 rounded-lg p-4",
                                contentBgColor,
                                contentBorderColor
                              )}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p className={cn("font-semibold", textColor)}>
                                  {step.label}
                                </p>
                                {isActive && (
                                  <Badge
                                    className={cn(activeBadgeColor, "text-white")}
                                  >
                                    Current
                                  </Badge>
                                )}
                              </div>
                              <p className={cn("text-sm", dateColor)}>
                                {utils.formatDate(step.date)}
                              </p>
                              <p className="text-sm text-slate-600 mt-2">
                                {step.description}
                              </p>
                              {isActive &&
                                (step.stepType === "APPROVED" ||
                                  step.stepType === "REJECTED" ||
                                  step.stepType === "TENANT-REJECT") &&
                                screening.remarks && (
                                  <div
                                    className={cn(
                                      "mt-3 rounded-lg border p-3 text-sm",
                                      stepTheme.border,
                                      stepTheme.backgroundCard
                                    )}
                                  >
                                    <p
                                      className={cn(
                                        "font-medium mb-1",
                                        stepTheme.textColorDark
                                      )}
                                    >
                                      {step.stepType === "TENANT-REJECT" ? "System Note:" : "Your Remarks:"}
                                    </p>
                                    <p
                                      className={stepTheme.textColor}
                                    >
                                      {screening.remarks}
                                    </p>
                                  </div>
                                )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Risk Intelligence - Second Section */}
            {screening.aiGeneratedAt && (
              <Card className={cn("border-2 shadow-sm", riskTheme.cardBg)}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-lg", riskTheme.iconBg)}>
                      <Shield className={cn("h-5 w-5", riskTheme.iconColor)} />
                    </div>
                    <div>
                      <CardTitle className={cn("text-base font-semibold", riskTheme.title)}>
                        AI Risk Intelligence
                      </CardTitle>
                      <CardDescription className={cn(riskTheme.description)}>
                        Generated on {utils.formatDate(screening.aiGeneratedAt)}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Risk Score Meter */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className={cn("font-medium", riskTheme.heading)}>
                        AI Risk Assessment
                      </span>
                      {screening.riskLevel && (
                        <Badge variant="outline" className={cn("text-sm", riskTheme.badge)}>
                          {screening.riskLevel} RISK
                        </Badge>
                      )}
                    </div>

                    {screening.aiRiskScore !== null && (
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className={cn(riskTheme.description)}>
                            Risk Score: {(screening.aiRiskScore * 100).toFixed(1)}%
                          </span>
                          <span className={cn("font-semibold", riskTheme.accent)}>
                            {screening.aiRiskScore.toFixed(2)} / 1.0
                          </span>
                        </div>

                        <div className="relative">
                          <Progress
                            value={screening.aiRiskScore * 100}
                            className={cn(
                              "h-4 rounded-full bg-white/80 border border-white/70 shadow-inner",
                              "[&>div]:bg-gradient-to-r",
                              utils.getRiskGradient(screening.aiRiskScore)
                            )}
                          />
                        </div>

                        <div className={cn("flex justify-between text-xs", riskTheme.range)}>
                          <span>Low Risk (0.0-0.4)</span>
                          <span>Medium Risk (0.4-0.7)</span>
                          <span>High Risk (0.7-1.0)</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {screening.aiScreeningSummary && (
                    <div className="space-y-3">
                      <h4 className={cn("font-semibold flex items-center gap-2", riskTheme.heading)}>
                        <TrendingUp className="w-4 h-4" />
                        Executive Summary
                      </h4>
                      <div
                        className={cn(
                          "p-4 rounded-xl border-2 bg-white/70",
                          riskTheme.summaryBorder,
                          riskTheme.summaryText
                        )}
                      >
                        <p className="leading-relaxed">
                          {screening.aiScreeningSummary}
                        </p>
                      </div>
                    </div>
                  )}

                  {screening.aiFindings && (
                    <div className="space-y-4">
                      <h4
                        className={cn(
                          "font-semibold text-sm uppercase tracking-wide",
                          riskTheme.heading
                        )}
                      >
                        Detailed AI Findings
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {screening.aiFindings.financial && (
                          <div className="space-y-3">
                            <h5 className="font-semibold flex items-center gap-2 text-slate-700">
                              <DollarSign className="w-4 h-4 text-indigo-600" />
                              Financial Assessment
                            </h5>
                            <div className="p-4 rounded-xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 to-blue-50">
                              <p className="text-indigo-900 text-sm leading-relaxed">
                                {screening.aiFindings.financial}
                              </p>
                            </div>
                          </div>
                        )}
                        {screening.aiFindings.employment && (
                          <div className="space-y-3">
                            <h5 className="font-semibold flex items-center gap-2 text-slate-700">
                              <Briefcase className="w-4 h-4 text-indigo-600" />
                              Employment Assessment
                            </h5>
                            <div className="p-4 rounded-xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 to-blue-50">
                              <p className="text-indigo-900 text-sm leading-relaxed">
                                {screening.aiFindings.employment}
                              </p>
                            </div>
                          </div>
                        )}
                        {screening.aiFindings.identity_verification && (
                          <div className="space-y-3">
                            <h5 className="font-semibold flex items-center gap-2 text-slate-700">
                              <Shield className="w-4 h-4 text-indigo-600" />
                              Identity Verification
                            </h5>
                            <div className="p-4 rounded-xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 to-blue-50">
                              <p className="text-indigo-900 text-sm leading-relaxed">
                                {screening.aiFindings.identity_verification}
                              </p>
                            </div>
                          </div>
                        )}
                        {screening.aiFindings.documents && (
                          <div className="space-y-3">
                            <h5 className="font-semibold flex items-center gap-2 text-slate-700">
                              <FileText className="w-4 h-4 text-indigo-600" />
                              Document Verification
                            </h5>
                            <div className="p-4 rounded-xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 to-blue-50">
                              <p className="text-indigo-900 text-sm leading-relaxed">
                                {screening.aiFindings.documents}
                              </p>
                            </div>
                          </div>
                        )}
                        {screening.aiFindings.rental_history && (
                          <div className="space-y-3">
                            <h5 className="font-semibold flex items-center gap-2 text-slate-700">
                              <Home className="w-4 h-4 text-indigo-600" />
                              Rental History
                            </h5>
                            <div className="p-4 rounded-xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 to-blue-50">
                              <p className="text-indigo-900 text-sm leading-relaxed">
                                {screening.aiFindings.rental_history}
                              </p>
                            </div>
                          </div>
                        )}
                        {screening.aiFindings.eviction_risk && (
                          <div className="space-y-3">
                            <h5 className="font-semibold flex items-center gap-2 text-slate-700">
                              <AlertTriangle className="w-4 h-4 text-rose-600" />
                              Eviction Risk
                            </h5>
                            <div className="p-4 rounded-xl border border-rose-200/60 bg-gradient-to-br from-rose-50 to-red-50">
                              <p className="text-rose-900 text-sm leading-relaxed">
                                {screening.aiFindings.eviction_risk}
                              </p>
                            </div>
                          </div>
                        )}
                        {screening.aiFindings.payment_behavior && (
                          <div className="space-y-3">
                            <h5 className="font-semibold flex items-center gap-2 text-slate-700">
                              <DollarSign className="w-4 h-4 text-indigo-600" />
                              Payment Behavior
                            </h5>
                            <div className="p-4 rounded-xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 to-blue-50">
                              <p className="text-indigo-900 text-sm leading-relaxed">
                                {screening.aiFindings.payment_behavior}
                              </p>
                            </div>
                          </div>
                        )}
                        {screening.aiFindings.lifestyle && (
                          <div className="space-y-3">
                            <h5 className="font-semibold flex items-center gap-2 text-slate-700">
                              <Heart className="w-4 h-4 text-indigo-600" />
                              Lifestyle Assessment
                            </h5>
                            <div className="p-4 rounded-xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 to-blue-50">
                              <p className="text-indigo-900 text-sm leading-relaxed">
                                {screening.aiFindings.lifestyle}
                              </p>
                            </div>
                          </div>
                        )}
                        {screening.aiFindings.behavior && (
                          <div className="space-y-3">
                            <h5 className="font-semibold flex items-center gap-2 text-slate-700">
                              <Heart className="w-4 h-4 text-indigo-600" />
                              Behavioral Assessment
                            </h5>
                            <div className="p-4 rounded-xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 to-blue-50">
                              <p className="text-indigo-900 text-sm leading-relaxed">
                                {screening.aiFindings.behavior}
                              </p>
                            </div>
                          </div>
                        )}
                        {screening.aiFindings.overall && (
                          <div className="space-y-3 md:col-span-2">
                            <h5
                              className={cn(
                                "font-semibold flex items-center gap-2",
                                riskTheme.heading
                              )}
                            >
                              <TrendingUp className="w-4 h-4" />
                              Overall Assessment
                            </h5>
                            <div
                              className={cn(
                                "p-4 rounded-xl border-2 bg-white/70",
                                riskTheme.overallBorder,
                                riskTheme.overallText
                              )}
                            >
                              <p className="leading-relaxed">
                                {screening.aiFindings.overall}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tenant Information Card */}
            <Card className="border border-slate-200/70 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <User className="h-5 w-5 text-indigo-600" />
                  Tenant Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">
                    Basic Information
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Full name
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {screening.fullName}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Birthdate
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {screening.birthdate
                          ? `${utils.formatLongDate(screening.birthdate)} (${utils.calculateAge(screening.birthdate)} years old)`
                          : "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Employment status
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900 capitalize">
                        {screening.employmentStatus?.toLowerCase() || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Income & Employment */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">
                    Income & Employment
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Monthly income
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {utils.formatCurrency(screening.monthlyIncome)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Income source
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {screening.incomeSource || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Current employer
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {screening.currentEmployer || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Position / role
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {screening.jobPosition || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Years in role
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {screening.yearsEmployed !== null
                          ? `${screening.yearsEmployed} year${screening.yearsEmployed === 1 ? "" : "s"}`
                          : "—"}
                      </p>
                    </div>
                  </div>
                  {screening.employmentRemarks && (
                    <div className="mt-4 rounded-lg border border-indigo-100/60 bg-indigo-50/60 p-3 text-sm text-indigo-800">
                      {screening.employmentRemarks}
                    </div>
                  )}
                </div>

                {/* Verification Documents */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">
                    Verification Documents
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      {
                        label: "Government ID",
                        value: screening.hasGovernmentId,
                      },
                      {
                        label: "NBI Clearance",
                        value: screening.hasNbiClearance,
                      },
                      {
                        label: "Proof of Income",
                        value: screening.hasProofOfIncome,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={cn(
                          "flex items-center justify-between rounded-lg border p-3 text-sm",
                          item.value
                            ? "border-emerald-200/60 bg-emerald-50/70 text-emerald-700"
                            : "border-slate-200/60 bg-white text-slate-600"
                        )}
                      >
                        <span>{item.label}</span>
                        {item.value ? (
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lifestyle & Preferences */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">
                    Lifestyle & Preferences
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-slate-50/70 px-3 py-2 text-sm">
                      <span>Smokes</span>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          screening.smokes ? "text-rose-600" : "text-emerald-600"
                        )}
                      >
                        {screening.smokes ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-slate-50/70 px-3 py-2 text-sm">
                      <span>Drinks alcohol</span>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          screening.drinksAlcohol
                            ? "text-amber-600"
                            : "text-emerald-600"
                        )}
                      >
                        {screening.drinksAlcohol ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-slate-50/70 px-3 py-2 text-sm">
                      <span>Has pets</span>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          screening.hasPets ? "text-sky-600" : "text-slate-500"
                        )}
                      >
                        {screening.hasPets ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-slate-50/70 px-3 py-2 text-sm">
                      <span>Works night shift</span>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          screening.worksNightShift
                            ? "text-amber-600"
                            : "text-emerald-600"
                        )}
                      >
                        {screening.worksNightShift ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-slate-50/70 px-3 py-2 text-sm">
                      <span>Regular visitors</span>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          screening.hasVisitors ? "text-sky-600" : "text-slate-500"
                        )}
                      >
                        {screening.hasVisitors ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-slate-50/70 px-3 py-2 text-sm">
                      <span>Noise level</span>
                      <Badge
                        className={cn(
                          "px-2 py-1 text-xs font-semibold",
                          screening.noiseLevel === "HIGH"
                            ? "text-rose-700 bg-rose-50 border border-rose-200/70"
                            : screening.noiseLevel === "MEDIUM"
                            ? "text-amber-700 bg-amber-50 border border-amber-200/70"
                            : "text-emerald-700 bg-emerald-50 border border-emerald-200/70"
                        )}
                      >
                        {screening.noiseLevel || "Not specified"}
                      </Badge>
                    </div>
                  </div>
                  {screening.otherLifestyle &&
                    screening.otherLifestyle.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Additional lifestyle factors
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {screening.otherLifestyle.map((factor, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {factor}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                {/* Rental History */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">
                    Rental History
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2 mb-4">
                    <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-white px-3 py-2 text-sm">
                      <span>Eviction history</span>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          screening.hadEvictionHistory
                            ? "text-rose-600"
                            : "text-emerald-600"
                        )}
                      >
                        {screening.hadEvictionHistory ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-white px-3 py-2 text-sm">
                      <span>Late payments</span>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          screening.latePaymentHistory
                            ? "text-rose-600"
                            : "text-emerald-600"
                        )}
                      >
                        {screening.latePaymentHistory ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                  {(screening.previousLandlordName ||
                    screening.previousLandlordContact ||
                    screening.previousRentalAddress ||
                    screening.reasonForLeaving) && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {screening.previousLandlordName && (
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Previous landlord
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-900">
                            {screening.previousLandlordName}
                          </p>
                        </div>
                      )}
                      {screening.previousLandlordContact && (
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Landlord contact
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-900">
                            {screening.previousLandlordContact}
                          </p>
                        </div>
                      )}
                      {screening.previousRentalAddress && (
                        <div className="sm:col-span-2">
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Previous address
                          </p>
                          <p className="mt-1 flex items-start gap-2 text-sm font-medium text-slate-900">
                            <MapPin className="mt-0.5 h-4 w-4 text-indigo-500" />
                            {screening.previousRentalAddress}
                          </p>
                        </div>
                      )}
                      {screening.reasonForLeaving && (
                        <div className="sm:col-span-2">
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Reason for leaving
                          </p>
                          <p className="mt-1 text-sm font-medium text-slate-900">
                            {screening.reasonForLeaving}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Applicant Profile & Application Actions - Combined */}
            <Card className="border border-slate-200/70 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <User className="h-5 w-5 text-indigo-600" />
                  Applicant Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border border-indigo-100">
                    <AvatarFallback className="bg-indigo-50 text-indigo-600">
                      {utils.getInitials(
                        screening.tenant.firstName,
                        screening.tenant.lastName
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {screening.tenant.firstName} {screening.tenant.lastName}
                    </p>
                    <Badge
                      variant="outline"
                      className="mt-1 text-[11px] uppercase tracking-wide border-indigo-200 text-indigo-700 bg-indigo-50/70"
                    >
                      Tenant
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-indigo-500" />
                    <span>{screening.tenant.email}</span>
                  </div>
                </div>
                <div className="rounded-lg border border-indigo-100/60 bg-indigo-50/50 p-3 text-xs text-indigo-700">
                  Application Status:{" "}
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-semibold border ml-2",
                      utils.getStatusBadgeClasses(screening.status)
                    )}
                  >
                    {screening.status}
                  </Badge>
                </div>

                {/* Application Actions */}
                <div className="pt-4 border-t border-slate-200">
                  <h4 className="text-sm font-semibold text-slate-900 mb-3">
                    Application Actions
                  </h4>
                  {screening.status === "SUBMITTED" && (
                    <div className="space-y-3">
                      {(() => {
                        const approveTheme = utils.getStatusTheme("APPROVED");
                        const rejectTheme = utils.getStatusTheme("REJECTED");
                        return (
                          <>
                            <Button
                              onClick={() => openConfirmationDialog("APPROVE")}
                              className={cn(
                                "w-full bg-gradient-to-r h-11 transition-all duration-200",
                                approveTheme.gradientButton
                              )}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve Application
                            </Button>
                            <Button
                              onClick={() => openConfirmationDialog("REJECT")}
                              variant="outline"
                              className={cn(
                                "w-full h-11 transition-all duration-200",
                                rejectTheme.borderDark,
                                rejectTheme.textColor,
                                "hover:bg-rose-50"
                              )}
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject Application
                            </Button>
                          </>
                        );
                      })()}
                    </div>
                  )}
                  {screening.status === "APPROVED" && (
                    <Button
                      onClick={() =>
                        navigate("/landlord/leases/create", {
                          state: {
                            tenantId: screening.tenant.id,
                            tenantName: `${screening.tenant.firstName} ${screening.tenant.lastName}`,
                            screeningId: screening.id,
                          },
                        })
                      }
                      className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:brightness-110 hover:shadow-xl transition-all duration-300"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Create Lease Agreement
                    </Button>
                  )}
                  {(screening.status === "PENDING" ||
                    screening.status === "REJECTED" ||
                    screening.status === "TENANT-REJECT") && (
                    <div className="text-center py-2">
                      <p className="text-sm text-gray-500">
                        {screening.status === "PENDING"
                          ? "Waiting for tenant to submit application"
                          : screening.status === "TENANT-REJECT"
                          ? "Tenant has declined this screening invitation"
                          : "Application has been rejected"}
                      </p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full h-11 mt-3"
                    onClick={() => navigate("/landlord/screening")}
                  >
                    Back to All Applications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={closeConfirmationDialog}
        onConfirm={() => handleReviewAction(confirmationDialog.type!)}
        type={confirmationDialog.type!}
        loading={isSubmitting}
      />
    </div>
  );
};

export default ViewSpecificScreeningLandlord;

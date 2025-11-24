import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Mail,
  MapPin,
  User,
  XCircle,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { getSpecificTenantScreeningRequest } from "@/api/tenant/screeningApi";
import { cn } from "@/lib/utils";

interface Landlord {
  id: string;
  name: string;
  email: string;
  role?: string | null;
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
  noiseLevel: "LOW" | "MEDIUM" | "HIGH" | "MODERATE";
  otherLifestyle: string[];
}

interface ScreeningDetails {
  id: string;
  status: "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED";
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  submitted: string | null;
  landlord: Landlord;
  tenantInfo: TenantInfo;
  documents: Documents;
  employment: Employment;
  rentalHistory: RentalHistory;
  lifestyle: Lifestyle;
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

  // Status-based color scheme functions - Uses theme where applicable
  const getStatusHeaderClasses = (status: string) => {
    const theme = getStatusTheme(status);
    
    switch (status) {
      case "PENDING":
        return {
          gradient: "from-amber-300/80 via-orange-200/70 to-amber-200/60",
          iconBg: `bg-gradient-to-br ${theme.gradient}`,
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
          iconBg: `bg-gradient-to-br ${theme.gradient}`,
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
          iconBg: `bg-gradient-to-br ${theme.gradient}`,
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
          iconBg: `bg-gradient-to-br ${theme.gradient}`,
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
  };


  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-5 h-5" />;
      case "PENDING":
        return <Clock className="w-5 h-5" />;
      case "SUBMITTED":
        return <FileText className="w-5 h-5" />;
      case "REJECTED":
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusTheme = (status: string) => {
    return SCREENING_STATUS_THEME[status as keyof typeof SCREENING_STATUS_THEME] || SCREENING_STATUS_THEME.PENDING;
  };

  const getStatusBadgeClasses = (status: string) => {
    const theme = getStatusTheme(status);
    return theme.badge;
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

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(income);
  };

  const getNoiseLevelText = (level: string) => {
    switch (level) {
      case "LOW":
        return "Low";
      case "MEDIUM":
      case "MODERATE":
        return "Moderate";
      case "HIGH":
        return "High";
      default:
        return level;
    }
  };

  const getNoiseLevelColor = (level: string) => {
    switch (level) {
      case "LOW":
        return "text-emerald-700 bg-emerald-50 border border-emerald-200/70";
      case "MEDIUM":
      case "MODERATE":
        return "text-amber-700 bg-amber-50 border border-amber-200/70";
      case "HIGH":
        return "text-rose-700 bg-rose-50 border border-rose-200/70";
      default:
        return "text-slate-700 bg-slate-50 border border-slate-200/70";
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Awaiting your submission";
      case "SUBMITTED":
        return "Under landlord review";
      case "APPROVED":
        return "Application approved";
      case "REJECTED":
        return "Application not approved";
      default:
        return "Screening in progress";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screepy-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header Skeleton */}
          <div className="relative overflow-hidden rounded-2xl">
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="space-y-6">
              {/* Application Timeline Skeleton */}
              <Card className="border border-slate-200/70 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current Status Summary Skeleton */}
                  <div className="p-4 rounded-lg border-2 border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-40" />
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <Skeleton className="h-12 w-full rounded-lg" />
                    </div>
                  </div>

                  {/* Timeline Steps Skeleton */}
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-20" />
                    <div className="relative">
                      <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-slate-200" />
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="relative flex items-start gap-4">
                            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                            <div className="flex-1 space-y-2 pt-1">
                              <div className="flex items-center justify-between">
                                <Skeleton className="h-5 w-40" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                              </div>
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-4 w-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tenant Information Skeleton */}
              <Card className="border border-slate-200/70 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-5 w-36" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <Skeleton className="h-4 w-32 mb-4" />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  {/* Income & Employment */}
                  <div>
                    <Skeleton className="h-4 w-40 mb-4" />
                    <div className="grid gap-4 sm:grid-cols-2">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-3 w-28" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  {/* Documents */}
                  <div>
                    <Skeleton className="h-4 w-44 mb-4" />
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full rounded-lg" />
                      ))}
                    </div>
                  </div>
                  <Separator />
                  {/* Lifestyle */}
                  <div>
                    <Skeleton className="h-4 w-40 mb-4" />
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full rounded-lg" />
                      ))}
                    </div>
                  </div>
                  <Separator />
                  {/* Rental History */}
                  <div>
                    <Skeleton className="h-4 w-32 mb-4" />
                    <div className="grid gap-3 sm:grid-cols-2 mb-4">
                      <Skeleton className="h-10 w-full rounded-lg" />
                      <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-3 w-28" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-6">
              {/* Landlord Details Skeleton */}
              <Card className="border border-slate-200/70 shadow-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                  </div>
                  <Skeleton className="h-16 w-full rounded-lg" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !screening) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-md">
          <CardContent className="p-6 text-center space-y-4">
            <AlertTriangle className="mx-auto h-8 w-8 text-rose-500" />
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {error || "Screening not found"}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {error || "The requested screening details could not be loaded."}
              </p>
            </div>
            <Button onClick={() => navigate(-1)} size="sm">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const headerClasses = getStatusHeaderClasses(screening.status);

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Status-based Header - Vibrant Colorful Design */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full"
        >
          <div className="relative overflow-hidden rounded-2xl">
            {/* Enhanced gradient border effect - Status-based vibrant colors */}
            <div className={cn("absolute inset-0 -z-10 bg-gradient-to-r opacity-95", headerClasses.gradient)} />
            
            {/* Glass card with enhanced backdrop */}
            <div className="relative m-[1px] rounded-[15px] bg-white/80 backdrop-blur-lg border border-white/60 shadow-lg">
              {/* Enhanced animated decorative blobs with more depth */}
              <motion.div
                aria-hidden
                className={cn("pointer-events-none absolute -top-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-br blur-3xl", headerClasses.bgBlur1)}
                initial={{ opacity: 0.4, scale: 0.8, x: -20 }}
                animate={{ opacity: 0.7, scale: 1.1, x: 0 }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
              />
              <motion.div
                aria-hidden
                className={cn("pointer-events-none absolute -bottom-12 -right-12 h-56 w-56 rounded-full bg-gradient-to-tl blur-3xl", headerClasses.bgBlur2)}
                initial={{ opacity: 0.3, scale: 1, x: 20 }}
                animate={{ opacity: 0.8, scale: 1.2, x: 0 }}
                transition={{ duration: 3.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
              />
              <motion.div
                aria-hidden
                className={cn("pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-32 w-32 rounded-full blur-2xl", headerClasses.bgBlur3)}
                initial={{ opacity: 0.2 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: 4, repeat: Infinity, repeatType: "mirror" }}
              />

              {/* Enhanced accent lines with shimmer effect */}
              <div className={cn("pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent", headerClasses.accentLine)} />
              <motion.div
                className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/60 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <div className={cn("pointer-events-none absolute inset-x-0 bottom-0 h-[1.5px] bg-gradient-to-r from-transparent to-transparent", headerClasses.accentLine)} />

              {/* Content */}
              <div className="px-4 sm:px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Enhanced primary icon with gradient */}
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="relative flex-shrink-0"
                    >
                      {/* Main icon container with gradient */}
                      <div className={cn(
                        "relative h-12 w-12 rounded-2xl bg-gradient-to-br text-white grid place-items-center shadow-xl",
                        headerClasses.iconBg,
                        headerClasses.iconShadow
                      )}>
                        <div className="relative z-10">
                          {getStatusIcon(screening.status)}
                        </div>
                        {/* Shine effect */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
                      </div>
                      
                      {/* Pulsing ring effect */}
                      <motion.div
                        className={cn(
                          "absolute inset-0 rounded-2xl border-2 opacity-30",
                          screening.status === "PENDING" ? "border-amber-400" :
                          screening.status === "SUBMITTED" ? "border-indigo-400" :
                          screening.status === "APPROVED" ? "border-emerald-400" :
                          "border-rose-400"
                        )}
                        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </motion.div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2.5 mb-1">
                        <h1 className={cn(
                          "text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r bg-clip-text text-transparent",
                          headerClasses.titleGradient
                        )}>
                          Screening Details
                        </h1>
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Sparkles className={cn("h-5 w-5", headerClasses.sparklesColor)} />
                        </motion.div>
                      </div>
                      <p className="text-sm text-slate-600 flex items-center gap-1.5">
                        <User className={cn("h-3.5 w-3.5 flex-shrink-0", headerClasses.text)} />
                        {getStatusMessage(screening.status)} • Submitted {formatShortDate(screening.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status badge */}
                  <Badge className={cn("text-xs font-semibold border", getStatusBadgeClasses(screening.status))}>
                    {screening.status}
                  </Badge>
                </div>

                {/* Enhanced animated underline with gradient shimmer */}
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
                  style={{ originX: 0 }}
                  className="mt-4 relative h-1 w-full rounded-full overflow-hidden"
                >
                  <div className={cn("absolute inset-0 bg-gradient-to-r rounded-full", headerClasses.underline)} />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            {/* Application Timeline - First */}
            <Card className="border border-slate-200/70 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-600" />
                  Application Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Status Summary */}
                {(() => {
                  const theme = getStatusTheme(screening.status);
                  return (
                    <div className={cn("p-4 rounded-lg border-2", theme.background, theme.borderCard)}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-white", theme.iconBackground)}>
                            {getStatusIcon(screening.status)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">Current Status</p>
                            <p className="text-sm text-slate-600">{getStatusMessage(screening.status)}</p>
                          </div>
                        </div>
                    <div className="text-right">
                      <Badge className={cn("text-xs font-semibold border", getStatusBadgeClasses(screening.status))}>
                        {screening.status}
                      </Badge>
                      <p className="text-xs text-slate-500 mt-1">
                        {screening.status === "PENDING" ? formatShortDate(screening.createdAt) :
                         screening.status === "SUBMITTED" && screening.submitted ? formatShortDate(screening.submitted) :
                         (screening.status === "APPROVED" || screening.status === "REJECTED") && screening.reviewedAt ? formatShortDate(screening.reviewedAt) :
                         formatShortDate(screening.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status Explanation */}
                  <div className={cn("mt-3 pt-3 border-t rounded-lg p-3", theme.border, theme.backgroundCard.replace('bg-gradient-to-br', 'bg'))}>
                    <p className={cn("text-sm leading-relaxed", theme.textColor)}>
                      {screening.status === "PENDING" && "The landlord has initiated a screening invitation. Please complete and submit your screening information."}
                      {screening.status === "SUBMITTED" && `You have submitted this information to landlord ${screening.landlord.name} for tenant screening. Wait for the landlord to review your information.`}
                      {screening.status === "APPROVED" && "The landlord has approved this tenant screening. Congratulations! You can now proceed with the next steps in your rental journey."}
                      {screening.status === "REJECTED" && "We're sorry, but your application was not approved at this time. Don't worry - there are many other rental opportunities available."}
                    </p>
                    {screening.status === "APPROVED" && (
                      <Button
                        onClick={() => navigate('/tenant/messages')}
                        className={cn("mt-3 bg-gradient-to-r", SCREENING_STATUS_THEME.APPROVED.gradientButton, "text-white")}
                        size="sm"
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message Landlord
                      </Button>
                    )}
                  </div>
                    </div>
                  );
                })()}

                {/* Application Timeline */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">Application Timeline</h3>
                  <div className="relative">
                    {/* Build timeline steps */}
                    {(() => {
                      const timelineSteps: Array<{
                        label: string;
                        date: string;
                        status: 'active' | 'completed' | 'pending';
                        icon: any;
                        stepType: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
                        description: string;
                      }> = [];

                      // Always show PENDING step
                      timelineSteps.push({
                        label: 'Invitation Initiated',
                        date: screening.createdAt,
                        status: screening.status === 'PENDING' ? 'active' : 'completed',
                        icon: User,
                        stepType: 'PENDING',
                        description: 'The landlord initiated a screening invitation for you.'
                      });

                      // Show SUBMITTED step if status is SUBMITTED, APPROVED, or REJECTED
                      if (screening.status === 'SUBMITTED' || screening.status === 'APPROVED' || screening.status === 'REJECTED') {
                        timelineSteps.push({
                          label: 'Application Submitted',
                          date: screening.submitted || screening.createdAt,
                          status: screening.status === 'SUBMITTED' ? 'active' : 'completed',
                          icon: FileText,
                          stepType: 'SUBMITTED',
                          description: 'You have successfully submitted your screening information. The landlord is now reviewing your application.'
                        });
                      }

                      // Show APPROVED or REJECTED step
                      if (screening.status === 'APPROVED' && screening.reviewedAt) {
                        timelineSteps.push({
                          label: 'Application Approved',
                          date: screening.reviewedAt,
                          status: 'active',
                          icon: CheckCircle,
                          stepType: 'APPROVED',
                          description: 'The landlord has reviewed and approved your application. You can proceed with the next steps.'
                        });
                      } else if (screening.status === 'REJECTED' && screening.reviewedAt) {
                        timelineSteps.push({
                          label: 'Application Rejected',
                          date: screening.reviewedAt,
                          status: 'active',
                          icon: XCircle,
                          stepType: 'REJECTED',
                          description: 'The landlord has reviewed your application and decided not to proceed. You may contact them for more information.'
                        });
                      }

                      // Determine timeline line color - only show if not final state (APPROVED/REJECTED)
                      const shouldShowMainTimeline = screening.status !== 'APPROVED' && screening.status !== 'REJECTED';
                      const getTimelineColor = () => {
                        if (screening.status === 'PENDING') return 'bg-amber-200';
                        if (screening.status === 'SUBMITTED') return 'bg-gradient-to-b from-amber-200 via-indigo-200 to-indigo-200';
                        return '';
                      };

                      return (
                        <>
                          {/* Timeline line - only show if not final state */}
                          {shouldShowMainTimeline && (
                            <div className={cn("absolute left-5 top-12 bottom-0 w-0.5", getTimelineColor())} />
                          )}
                          
                          <div className="space-y-4">
                            {timelineSteps.map((step, index) => {
                              const StepIcon = step.icon;
                              const isActive = step.status === 'active';
                              const isCompleted = step.status === 'completed';
                              const isLast = index === timelineSteps.length - 1;
                              
                              // Determine colors based on step type and status using theme
                              const stepTheme = getStatusTheme(step.stepType);
                              let iconBgColor = 'bg-slate-400';
                              let iconRingColor = '';
                              let contentBgColor = 'bg-slate-50';
                              let contentBorderColor = 'border-slate-200';
                              let textColor = 'text-slate-600';
                              let dateColor = 'text-slate-500';
                              let timelineColor = 'bg-slate-200';
                              let activeBadgeColor = 'bg-slate-600';

                              if (isActive) {
                                iconBgColor = stepTheme.iconBackground;
                                // Extract ring class from timelineActive
                                const ringMatch = stepTheme.timelineActive.match(/ring-\d+ ring-[\w-]+/);
                                iconRingColor = ringMatch ? ringMatch[0] : '';
                                // Use background from theme
                                if (step.stepType === 'PENDING') contentBgColor = 'bg-amber-50';
                                else if (step.stepType === 'SUBMITTED') contentBgColor = 'bg-indigo-50';
                                else if (step.stepType === 'APPROVED') contentBgColor = 'bg-emerald-50';
                                else if (step.stepType === 'REJECTED') contentBgColor = 'bg-rose-50';
                                contentBorderColor = stepTheme.borderCard;
                                textColor = stepTheme.textColorDark;
                                dateColor = stepTheme.textColor;
                                activeBadgeColor = stepTheme.iconBackground.replace('-500', '-600');
                              } else if (isCompleted) {
                                iconBgColor = stepTheme.iconBackground;
                                if (step.stepType === 'PENDING') contentBgColor = 'bg-amber-50';
                                else if (step.stepType === 'SUBMITTED') contentBgColor = 'bg-indigo-50';
                                contentBorderColor = stepTheme.border;
                                textColor = stepTheme.textColorDark;
                                dateColor = stepTheme.textColor;
                                timelineColor = stepTheme.timelineLine;
                              }

                              return (
                                <div key={index} className="relative flex items-start gap-4">
                                  {/* Timeline Line */}
                                  {!isLast && (
                                    <div className={cn("absolute left-5 top-12 w-0.5", timelineColor)} style={{ height: 'calc(100% + 1rem)' }} />
                                  )}
                                  
                                  {/* Icon Circle */}
                                  <div className={cn(
                                    "relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white",
                                    iconBgColor,
                                    isActive ? `${iconRingColor} shadow-lg` : ''
                                  )}>
                                    <StepIcon className="h-5 w-5" />
                                    {isActive && (
                                      <div className={cn("absolute inset-0 rounded-full animate-ping opacity-75", iconBgColor)} />
                                    )}
                                  </div>
                                  
                                  {/* Content */}
                                  <div className={cn("flex-1 pt-1 pb-4 rounded-lg p-4", contentBgColor, contentBorderColor)}>
                                    <div className="flex items-center justify-between mb-2">
                                      <p className={cn("font-semibold", textColor)}>
                                        {step.label}
                                      </p>
                                      {isActive && (
                                        <Badge className={cn(activeBadgeColor, "text-white")}>Current</Badge>
                                      )}
                                    </div>
                                    <p className={cn("text-sm", dateColor)}>
                                      {formatDate(step.date)}
                                    </p>
                                    <p className="text-sm text-slate-600 mt-2">
                                      {step.description}
                                    </p>
                                    {/* Show remarks for APPROVED or REJECTED */}
                                    {isActive && (step.stepType === 'APPROVED' || step.stepType === 'REJECTED') && screening.remarks && (
                                      <div className={cn(
                                        "mt-3 rounded-lg border p-3 text-sm",
                                        step.stepType === 'APPROVED' ? `${stepTheme.border} ${stepTheme.backgroundCard.replace('bg-gradient-to-br', 'bg')}` : `${stepTheme.border} ${stepTheme.backgroundCard.replace('bg-gradient-to-br', 'bg')}`
                                      )}>
                                        <p className={cn("font-medium mb-1", stepTheme.textColorDark)}>
                                          Landlord Remarks:
                                        </p>
                                        <p className={stepTheme.textColor}>
                                          {screening.remarks}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tenant Information - Consolidated */}
            <Card className="border border-slate-200/70 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <User className="h-5 w-5 text-indigo-600" />
                  Tenant Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information Category */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Basic Information</h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Full name</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">{screening.tenantInfo.fullName}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Birthdate</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {formatDate(screening.tenantInfo.birthdate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Age</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {calculateAge(screening.tenantInfo.birthdate)} years old
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Employment status</p>
                      <p className="mt-1 text-sm font-medium text-slate-900 capitalize">
                        {screening.tenantInfo.employmentStatus.toLowerCase()}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Income & Employment Category */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Income & Employment</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Monthly income</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {formatIncome(screening.tenantInfo.monthlyIncome)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Income source</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {screening.tenantInfo.incomeSource || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        {screening.employment.currentEmployer ? "Current employer" : "Business / employer"}
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {screening.employment.currentEmployer || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Position / role</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {screening.employment.jobPosition || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">Years in role</p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {screening.employment.yearsEmployed} year{screening.employment.yearsEmployed === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  {screening.employment.employmentRemarks && (
                    <div className="mt-4 rounded-lg border border-indigo-100/60 bg-indigo-50/60 p-3 text-sm text-indigo-800">
                      {screening.employment.employmentRemarks}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Verification Documents Category */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Verification Documents</h3>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      { label: "Government ID", value: screening.documents.hasGovernmentId },
                      { label: "NBI Clearance", value: screening.documents.hasNbiClearance },
                      { label: "Proof of Income", value: screening.documents.hasProofOfIncome },
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

                <Separator />

                {/* Lifestyle & Preferences Category */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Lifestyle & Preferences</h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-slate-50/70 px-3 py-2 text-sm">
                      <span>Smokes</span>
                      <span className={cn("text-xs font-medium", screening.lifestyle.smokes ? "text-rose-600" : "text-emerald-600")}>
                        {screening.lifestyle.smokes ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-slate-50/70 px-3 py-2 text-sm">
                      <span>Drinks alcohol</span>
                      <span className={cn("text-xs font-medium", screening.lifestyle.drinksAlcohol ? "text-amber-600" : "text-emerald-600")}>
                        {screening.lifestyle.drinksAlcohol ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-slate-50/70 px-3 py-2 text-sm">
                      <span>Has pets</span>
                      <span className={cn("text-xs font-medium", screening.lifestyle.hasPets ? "text-sky-600" : "text-slate-500")}>
                        {screening.lifestyle.hasPets ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-slate-50/70 px-3 py-2 text-sm">
                      <span>Works night shift</span>
                      <span className={cn("text-xs font-medium", screening.lifestyle.worksNightShift ? "text-amber-600" : "text-emerald-600")}>
                        {screening.lifestyle.worksNightShift ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-slate-50/70 px-3 py-2 text-sm">
                      <span>Regular visitors</span>
                      <span className={cn("text-xs font-medium", screening.lifestyle.hasVisitors ? "text-sky-600" : "text-slate-500")}>
                        {screening.lifestyle.hasVisitors ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-slate-50/70 px-3 py-2 text-sm">
                      <span>Noise level</span>
                      <Badge className={cn("px-2 py-1 text-xs font-semibold", getNoiseLevelColor(screening.lifestyle.noiseLevel))}>
                        {getNoiseLevelText(screening.lifestyle.noiseLevel)}
                      </Badge>
                    </div>
                  </div>
                  {screening.lifestyle.otherLifestyle && screening.lifestyle.otherLifestyle.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs uppercase tracking-wide text-slate-500">Additional lifestyle factors</p>
                      <div className="flex flex-wrap gap-2">
                        {screening.lifestyle.otherLifestyle.map((factor, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Rental History Category */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Rental History</h3>
                  <div className="grid gap-3 sm:grid-cols-2 mb-4">
                    <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-white px-3 py-2 text-sm">
                      <span>Eviction history</span>
                      <span className={cn("text-xs font-medium", screening.rentalHistory.hadEvictionHistory ? "text-rose-600" : "text-emerald-600")}>
                        {screening.rentalHistory.hadEvictionHistory ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-slate-200/60 bg-white px-3 py-2 text-sm">
                      <span>Late payments</span>
                      <span className={cn("text-xs font-medium", screening.rentalHistory.latePaymentHistory ? "text-rose-600" : "text-emerald-600")}>
                        {screening.rentalHistory.latePaymentHistory ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                  {(screening.rentalHistory.previousLandlordName || 
                    screening.rentalHistory.previousLandlordContact || 
                    screening.rentalHistory.previousRentalAddress || 
                    screening.rentalHistory.reasonForLeaving) && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {screening.rentalHistory.previousLandlordName && (
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">Previous landlord</p>
                          <p className="mt-1 text-sm font-medium text-slate-900">
                            {screening.rentalHistory.previousLandlordName}
                          </p>
                        </div>
                      )}
                      {screening.rentalHistory.previousLandlordContact && (
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">Landlord contact</p>
                          <p className="mt-1 text-sm font-medium text-slate-900">
                            {screening.rentalHistory.previousLandlordContact}
                          </p>
                        </div>
                      )}
                      {screening.rentalHistory.previousRentalAddress && (
                        <div className="sm:col-span-2">
                          <p className="text-xs uppercase tracking-wide text-slate-500">Previous address</p>
                          <p className="mt-1 flex items-start gap-2 text-sm font-medium text-slate-900">
                            <MapPin className="mt-0.5 h-4 w-4 text-indigo-500" />
                            {screening.rentalHistory.previousRentalAddress}
                          </p>
                        </div>
                      )}
                      {screening.rentalHistory.reasonForLeaving && (
                        <div className="sm:col-span-2">
                          <p className="text-xs uppercase tracking-wide text-slate-500">Reason for leaving</p>
                          <p className="mt-1 text-sm font-medium text-slate-900">
                            {screening.rentalHistory.reasonForLeaving}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            {/* Landlord Details */}
            <Card className="border border-slate-200/70 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-900">
                  <User className="h-5 w-5 text-indigo-600" />
                  Landlord Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border border-indigo-100">
                    {screening.landlord.avatarUrl ? (
                      <AvatarImage src={screening.landlord.avatarUrl} />
                    ) : (
                      <AvatarFallback className="bg-indigo-50 text-indigo-600">
                        {screening.landlord.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{screening.landlord.name}</p>
                    <Badge
                      variant="outline"
                      className="mt-1 text-[11px] uppercase tracking-wide border-indigo-200 text-indigo-700 bg-indigo-50/70"
                    >
                      {(screening.landlord.role || "Landlord").toString()}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3 text-sm text-slate-700">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-indigo-500" />
                    <span>{screening.landlord.email}</span>
                  </div>
                </div>
                <div className="rounded-lg border border-indigo-100/60 bg-indigo-50/50 p-3 text-xs text-indigo-700">
                  This landlord invited you to complete the screening for verification.
                </div>
              </CardContent>
            </Card>

          </aside>
        </div>
      </div>
    </div>
  );
};

export default ViewSpecificScreeningTenant;

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Home,
  Calendar,
  Lightbulb,
  AlertCircle,
  Sparkles,
  AlertTriangle,
  Eye,
  EyeOff,
  CheckCircle,
  HelpCircle,
  ExternalLink,
  Shield,
  Ban,
  XCircle,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { getLandlordSpecificListingRequest, toggleListingVisibilityRequest } from '@/api/landlord/listingApi';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface City {
  id: string;
  name: string;
}

interface Municipality {
  id: string;
  name: string;
}

interface Property {
  id: string;
  title: string;
  type: string;
  street: string;
  barangay: string;
  zipCode: string;
  city: City;
  municipality: Municipality | null;
}

interface Unit {
  id: string;
  label: string;
  description: string;
  floorNumber: number;
  maxOccupancy: number;
  targetPrice: number;
  requiresScreening: boolean;
  unitCondition: string;
  property: Property;
}

interface AiAnalysis {
  part: string;
  description: string;
}

interface SanitizeLog {
  part: string;
  action: string;
  reason: string;
  dataUsed: string | { text: string; category: string };
  isScammingPattern?: boolean;
}

interface ListingData {
  id: string;
  lifecycleStatus: string;
  visibleAt: string | null;
  hiddenAt: string | null;
  flaggedAt: string | null;
  blockedAt: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  expiresAt: string;
  isFeatured: boolean;
  riskLevel: string | null; // "LOW" | "MEDIUM" | "HIGH"
  aiAnalysis: AiAnalysis[] | null;
  propertySanitizeLogs: SanitizeLog[] | null;
  unitSanitizeLogs: SanitizeLog[] | null;
  providerName: string | null;
  providerTxnId: string | null;
  paymentAmount: number | null;
  paymentDate: string | null;
  blockedReason: string | null;
  flaggedReason: string | null;
  createdAt: string;
  updatedAt: string;
  unit: Unit;
}

export const ListingDetails = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const [listingData, setListingData] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  const simulatedTxnId = useMemo(() => {
    if (!listingData) return null;
    if (listingData.providerTxnId) {
      return listingData.providerTxnId;
    }
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    return `txn_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`;
  }, [listingData?.providerTxnId, listingData?.id]);

  const fetchListingData = async ({ silent }: { silent?: boolean } = {}) => {
    if (!listingId) return;
    
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const response = await getLandlordSpecificListingRequest(listingId);
      setListingData(response.data);
    } catch (err) {
      setError('Failed to load listing data');
      console.error('Error fetching listing data:', err);
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleRefresh = () => {
    fetchListingData({ silent: true });
  };

  const handleToggleVisibilityClick = () => {
    if (!listingData) return;
    
    const currentStatus = listingData.lifecycleStatus;
    if (currentStatus !== 'VISIBLE' && currentStatus !== 'HIDDEN') {
      toast.error('Cannot toggle visibility. Only VISIBLE or HIDDEN listings can be toggled.');
      return;
    }

    setShowToggleConfirm(true);
  };

  const handleConfirmToggle = async () => {
    if (!listingId || !listingData) return;

    try {
      setToggling(true);
      const response = await toggleListingVisibilityRequest(listingId);
      
      // Update local state
      setListingData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          lifecycleStatus: response.data.listing.lifecycleStatus,
          visibleAt: response.data.listing.visibleAt,
          hiddenAt: response.data.listing.hiddenAt,
        };
      });

      const newStatus = response.data.listing.lifecycleStatus;
      toast.success(`Listing is now ${newStatus.toLowerCase()}.`);
      setShowToggleConfirm(false);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || 'Failed to toggle listing visibility';
      toast.error(errorMessage);
      console.error('Error toggling visibility:', err);
    } finally {
      setToggling(false);
    }
  };





  const formatAddress = (property: Property) => {
    return `${property.street}, ${property.barangay}, ${property.city.name}, ${property.zipCode}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WAITING_REVIEW': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'VISIBLE': return 'bg-emerald-100 text-emerald-700 border-emerald-200'; // Full emerald green - active and visible
      case 'HIDDEN': return 'bg-teal-100 text-teal-700 border-teal-200'; // Similar to VISIBLE but with gray-blue mix (teal = emerald + gray)
      case 'EXPIRED': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'FLAGGED': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'BLOCKED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'WAITING_REVIEW': return 'from-purple-200/70 via-purple-100/50 to-indigo-200/70';
      case 'VISIBLE': return 'from-emerald-200/70 via-emerald-100/50 to-emerald-200/70'; // Full emerald color
      case 'HIDDEN': return 'from-teal-200/70 via-teal-100/50 to-teal-200/70'; // Similar to VISIBLE but with gray-blue mix
      case 'EXPIRED': return 'from-gray-200/70 via-gray-100/50 to-gray-200/70';
      case 'FLAGGED': return 'from-amber-200/70 via-amber-100/50 to-amber-200/70';
      case 'BLOCKED': return 'from-red-200/70 via-red-100/50 to-red-200/70';
      default: return 'from-gray-200/70 via-gray-100/50 to-gray-200/70';
    }
  };

  const getStatusBackgroundColor = (status: string) => {
    switch (status) {
      case 'WAITING_REVIEW': return 'bg-purple-50 border-purple-300';
      case 'VISIBLE': return 'bg-emerald-50 border-emerald-300';
      case 'HIDDEN': return 'bg-teal-50 border-teal-300';
      case 'EXPIRED': return 'bg-gray-50 border-gray-300';
      case 'FLAGGED': return 'bg-amber-50 border-amber-300';
      case 'BLOCKED': return 'bg-red-50 border-red-300';
      default: return 'bg-blue-50 border-blue-300';
    }
  };

  const getStatusIconBg = (status: string) => {
    switch (status) {
      case 'WAITING_REVIEW': return 'bg-purple-500';
      case 'VISIBLE': return 'bg-emerald-500';
      case 'HIDDEN': return 'bg-teal-500';
      case 'EXPIRED': return 'bg-gray-500';
      case 'FLAGGED': return 'bg-amber-500';
      case 'BLOCKED': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusBlurColor = (status: string, variant: 'light' | 'dark' = 'light') => {
    const colors = {
      WAITING_REVIEW: variant === 'light' ? 'bg-purple-200/40' : 'bg-purple-300/40',
      VISIBLE: variant === 'light' ? 'bg-emerald-200/40' : 'bg-emerald-300/40',
      HIDDEN: variant === 'light' ? 'bg-teal-200/40' : 'bg-teal-300/40',
      EXPIRED: variant === 'light' ? 'bg-gray-200/40' : 'bg-gray-300/40',
      FLAGGED: variant === 'light' ? 'bg-amber-200/40' : 'bg-amber-300/40',
      BLOCKED: variant === 'light' ? 'bg-red-200/40' : 'bg-red-300/40',
    };
    return colors[status as keyof typeof colors] || colors.WAITING_REVIEW;
  };

  const getCurrentLifecycleDate = () => {
    const status = listingData?.lifecycleStatus;
    if (!listingData) return null;
    
    switch (status) {
      case 'WAITING_REVIEW': return listingData.paymentDate;
      case 'VISIBLE': return listingData.visibleAt;
      case 'HIDDEN': return listingData.hiddenAt;
      case 'EXPIRED': return listingData.expiresAt;
      case 'FLAGGED': return listingData.flaggedAt;
      case 'BLOCKED': return listingData.blockedAt;
      default: return listingData.createdAt;
    }
  };

  const getCurrentLifecycleLabel = () => {
    const status = listingData?.lifecycleStatus;
    switch (status) {
      case 'WAITING_REVIEW': return 'Waiting Review Since';
      case 'VISIBLE': return 'Visible At';
      case 'HIDDEN': return 'Hidden At';
      case 'EXPIRED': return 'Expired At';
      case 'FLAGGED': return 'Flagged At';
      case 'BLOCKED': return 'Blocked At';
      default: return 'Created At';
    }
  };

  const getCurrentLifecycleIcon = () => {
    const status = listingData?.lifecycleStatus;
    switch (status) {
      case 'WAITING_REVIEW': return Calendar;
      case 'VISIBLE': return Eye;
      case 'HIDDEN': return EyeOff;
      case 'EXPIRED': return Calendar;
      case 'FLAGGED': return AlertTriangle;
      case 'BLOCKED': return AlertCircle;
      default: return Calendar;
    }
  };

  const getStatusExplanation = (status: string) => {
    switch (status) {
      case 'WAITING_REVIEW':
        return {
          text: 'Your listing has been submitted and is currently under review by our admin team. This process typically takes within 24 hours, though reviews may be completed immediately depending on current workload. You will be notified once the review is complete.',
          color: 'text-purple-700',
          bg: 'bg-purple-50',
          border: 'border-purple-200'
        };
      case 'FLAGGED':
        return {
          text: 'Your listing has been flagged for review. Please make the necessary changes based on the flagged reason provided below. Once you\'ve addressed the concerns, you may resubmit your listing for review.',
          color: 'text-amber-700',
          bg: 'bg-amber-50',
          border: 'border-amber-200'
        };
      case 'BLOCKED':
        return {
          text: 'Your listing has been blocked due to policy violations. This action is typically not easily reversible. The listing was blocked because it did not comply with our privacy policy and community guidelines. Please review the policy guidelines and contact support if you believe this was done in error.',
          color: 'text-red-700',
          bg: 'bg-red-50',
          border: 'border-red-200'
        };
      case 'EXPIRED':
        return {
          text: 'Your listing has expired and is no longer visible to renters. To continue receiving inquiries, please renew your listing by extending its duration or creating a new listing.',
          color: 'text-gray-700',
          bg: 'bg-gray-50',
          border: 'border-gray-200'
        };
      case 'VISIBLE':
        return {
          text: 'Your listing is currently live and visible to all renters. It will remain active until the expiration date.',
          color: 'text-emerald-700',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200'
        };
      case 'HIDDEN':
        return {
          text: 'Your listing is currently hidden from public view. You can make it visible again at any time from your listing management dashboard.',
          color: 'text-teal-700',
          bg: 'bg-teal-50',
          border: 'border-teal-200'
        };
      default:
        return null;
    }
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRiskLevelColor = (riskLevel: string | null) => {
    if (!riskLevel) return 'bg-gray-100 text-gray-700 border-gray-200';
    switch (riskLevel.toUpperCase()) {
      case 'LOW': return 'bg-green-100 text-green-700 border-green-200';
      case 'MEDIUM': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'HIGH': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDataUsed = (dataUsed: string | { text: string; category: string } | null) => {
    if (!dataUsed) return 'N/A';
    if (typeof dataUsed === 'string') {
      return dataUsed;
    }
    return dataUsed.text || 'N/A';
  };

  const formatReason = (reason: string | null) => {
    if (!reason) return 'N/A';
    
    // Map backend reason values to user-friendly labels
    const reasonMap: Record<string, string> = {
      'inappropriate': 'Inappropriate Content',
      'discriminatory': 'Discriminatory Language',
      'scam': 'Scamming Pattern',
      'fake_info': 'Fake Information',
      'privacy': 'Privacy Violation',
      'spam': 'Spam Content',
      'illegal': 'Illegal Content',
      'other': 'Other Violation',
    };

    // Check for exact match first (case-insensitive)
    const lowerReason = reason.toLowerCase().trim();
    if (reasonMap[lowerReason]) {
      return reasonMap[lowerReason];
    }

    // Check if reason contains any key as a word boundary
    for (const [key, label] of Object.entries(reasonMap)) {
      if (lowerReason === key || lowerReason.startsWith(key + ' ') || lowerReason.includes(' ' + key)) {
        return label;
      }
    }

    // If no match, format snake_case or return capitalized
    return reason.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };


  useEffect(() => {
    if (listingId) {
      fetchListingData();
    }
  }, [listingId]);


  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <Skeleton className="h-28 w-full rounded-2xl" />

          {/* Main Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6">
            {/* Left Column - Listing Information Skeleton */}
            <div className="space-y-6">
              <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
                <CardHeader>
                  <Skeleton className="h-6 w-40 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Skeleton className="h-4 w-32" />
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                    <Skeleton className="h-4 w-40" />
                    <div className="space-y-4">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-24 w-full" />
                    </div>
                    <Skeleton className="h-32 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Content Sanitization Skeleton */}
            <div className="space-y-6">
              <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-slate-200">
                <CardHeader>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-6 rounded-full" />
                      <Skeleton className="h-6 w-40" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listingData) {
    return (
      <div className="min-h-screen p-6">
        <div>
          <Card className="border-red-200 bg-white/90 backdrop-blur-sm shadow-lg">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Listing</h3>
                <p className="text-red-600 mb-6">{error || 'Listing not found'}</p>
                <div className="flex justify-center gap-3">
                  <Button onClick={handleBack} variant="outline" className="border-slate-300">
                    Go Back
                  </Button>
                  <Button onClick={() => fetchListingData()} className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                    Try Again
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { unit } = listingData;
  const { property } = unit;
  const daysUntilExpiry = getDaysUntilExpiry(listingData.expiresAt);
  
  // Build lifecycle flow: CREATED → PAYMENT → WAITING_REVIEW → VISIBLE/HIDDEN → FLAGGED → BLOCKED → EXPIRED
  const lifecycleSteps: Array<{ label: string; date: string; status: 'active' | 'completed' | 'pending'; icon: any; stepType?: 'WAITING_REVIEW' | 'VISIBLE' | 'HIDDEN' | 'FLAGGED' | 'BLOCKED' }> = [];
  
  // Always show Created
  lifecycleSteps.push({ label: 'Created', date: listingData.createdAt, status: 'completed', icon: CheckCircle });
  
  // Payment
  if (listingData.paymentDate) {
      lifecycleSteps.push({ label: 'Payment', date: listingData.paymentDate, status: 'completed', icon: CheckCircle });
      // Waiting Review (starts after payment) - don't show if already VISIBLE or HIDDEN
      if (listingData.lifecycleStatus !== 'VISIBLE' && listingData.lifecycleStatus !== 'HIDDEN') {
        lifecycleSteps.push({
          label: 'Waiting Review',
          date: listingData.paymentDate,
          status: listingData.lifecycleStatus === 'WAITING_REVIEW' ? 'active' : 'completed',
          icon: Calendar,
          stepType: 'WAITING_REVIEW'
        });
      }
    }

    // Show "Visible" step - only if current status is VISIBLE
    if (listingData.lifecycleStatus === 'VISIBLE' && listingData.visibleAt) {
      lifecycleSteps.push({ 
        label: 'Visible', 
        date: listingData.visibleAt, 
        status: 'active', 
        icon: Eye,
        stepType: 'VISIBLE'
      });
    }

    // Show "Hidden" step - only if current status is HIDDEN
    if (listingData.lifecycleStatus === 'HIDDEN' && listingData.hiddenAt) {
      lifecycleSteps.push({ 
        label: 'Hidden', 
        date: listingData.hiddenAt, 
        status: 'active', 
        icon: EyeOff,
        stepType: 'HIDDEN'
      });
    }

    // Flagged (intervention path)
    if (listingData.flaggedAt) {
      lifecycleSteps.push({ 
        label: 'Flagged', 
        date: listingData.flaggedAt, 
        status: listingData.lifecycleStatus === 'FLAGGED' ? 'active' : 'completed', 
        icon: AlertTriangle,
        stepType: 'FLAGGED'
      });
    }

    // Blocked (intervention path)
    if (listingData.blockedAt) {
      lifecycleSteps.push({ 
        label: 'Blocked', 
        date: listingData.blockedAt, 
        status: listingData.lifecycleStatus === 'BLOCKED' ? 'active' : 'completed', 
        icon: AlertCircle,
        stepType: 'BLOCKED'
      });
    }
  
  // Always show Expires at the end
  lifecycleSteps.push({ label: 'Expires', date: listingData.expiresAt, status: 'pending', icon: Calendar });
  
  const CurrentLifecycleIcon = getCurrentLifecycleIcon();

  return (
    <div className="min-h-screen  p-4 sm:p-6">
      <div className="space-y-6">
        {/* Custom Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl"
        >
          <div className={`absolute inset-0 -z-10 bg-gradient-to-r ${getStatusGradient(listingData.lifecycleStatus)} opacity-90`} />
          <div className="relative m-[1px] rounded-[15px] bg-white/70 backdrop-blur-md border border-white/50">
            <motion.div
              aria-hidden
              className={`pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full ${getStatusBlurColor(listingData.lifecycleStatus, 'light')} blur-3xl`}
              initial={{ opacity: 0.5, scale: 0.9 }}
              animate={{ opacity: 0.8, scale: 1 }}
              transition={{ duration: 2.2, repeat: Infinity, repeatType: "mirror" }}
            />
            <motion.div
              aria-hidden
              className={`pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full ${getStatusBlurColor(listingData.lifecycleStatus, 'dark')} blur-3xl`}
              initial={{ opacity: 0.4, scale: 1 }}
              animate={{ opacity: 0.75, scale: 1.1 }}
              transition={{ duration: 2.8, repeat: Infinity, repeatType: "mirror" }}
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />

            <div className="px-4 sm:px-6 py-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex flex-col gap-4 min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      transition={{ type: "spring", stiffness: 260, damping: 18 }}
                      className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white grid place-items-center shadow-md"
                    >
                      <Home className="h-6 w-6" />
                    </motion.div>
                    <div className="min-w-0 space-y-1">
                      <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 truncate">
                        Unit: {unit.label || 'Listing Details'}
                      </h1>
                      <p className="text-sm text-gray-600 leading-5 truncate">
                        Property: {property.title || 'Untitled Property'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    {property.type && (
                      <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200 capitalize">
                        {property.type.toLowerCase()}
                      </Badge>
                    )}
                    <div className="flex items-center gap-1 bg-white/70 border border-slate-200 rounded-full px-3 py-1 text-xs sm:text-sm text-slate-600">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                      <span className="truncate max-w-[220px] sm:max-w-[360px]">
                        {formatAddress(property) || 'Address not provided'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-white/70 border border-slate-200 rounded-full px-3 py-1 text-xs sm:text-sm text-slate-600">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
                      <span>Expires in {daysUntilExpiry} days</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-start lg:justify-end">
                  <Button
                    onClick={() => handleRefresh()}
                    variant="outline"
                    size="sm"
                    disabled={refreshing}
                    className="bg-white/90 hover:bg-white border-slate-300 text-slate-700 hover:text-slate-900 shadow-sm"
                  >
                    {refreshing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Refresh
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Refresh
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => navigate(`/landlord/units/${property.id}/${unit.id}`)}
                    variant="outline"
                    className="bg-white/90 hover:bg-white border-slate-300 text-slate-700 hover:text-slate-900 shadow-sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Unit
                  </Button>
                  {/* Toggle Visibility Button - Only show for VISIBLE or HIDDEN status */}
                  {(listingData.lifecycleStatus === 'VISIBLE' || listingData.lifecycleStatus === 'HIDDEN') && (
                    <Button
                      onClick={handleToggleVisibilityClick}
                      disabled={toggling}
                      variant="outline"
                      className={`bg-white/90 hover:bg-white border-slate-300 text-slate-700 hover:text-slate-900 shadow-sm ${
                        listingData.lifecycleStatus === 'VISIBLE' 
                          ? 'hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700' 
                          : 'hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700'
                      }`}
                    >
                      {listingData.lifecycleStatus === 'VISIBLE' ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Hide Listing
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Show Listing
                        </>
                      )}
                    </Button>
                  )}
                  <Badge className={getStatusColor(listingData.lifecycleStatus) + " text-sm py-1.5 px-3"}>
                    {listingData.lifecycleStatus.replace(/_/g, ' ')}
                  </Badge>
                  <Badge className={listingData.isFeatured ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 text-sm py-1.5 px-3 flex items-center gap-1" : "bg-gray-100 text-gray-600 border-gray-200 text-sm py-1.5 px-3 flex items-center gap-1"}>
                    <Sparkles className="h-3 w-3" />
                    {listingData.isFeatured ? 'Featured' : 'Not Featured'}
                  </Badge>
                </div>
              </div>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                style={{ originX: 0 }}
                className="mt-4 h-0.5 w-full bg-gradient-to-r from-emerald-400/70 via-emerald-300/70 to-sky-400/70 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6">
          {/* Left Column - Listing Information */}
          <div className="space-y-6">
            {/* Listing Details - PRIMARY */}
            <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">Listing Information</CardTitle>
                <CardDescription>Primary listing details and lifecycle status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Status Summary */}
                <div className={`p-4 rounded-lg border-2 ${getStatusBackgroundColor(listingData.lifecycleStatus)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusIconBg(listingData.lifecycleStatus)} text-white`}>
                        <CurrentLifecycleIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">Current Status</p>
                        <p className="text-sm text-slate-600">{getCurrentLifecycleLabel()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900">
                        {getCurrentLifecycleDate() ? formatDateTime(getCurrentLifecycleDate()!) : 'N/A'}
                      </p>
                      <p className="text-xs text-slate-500">Expires in {daysUntilExpiry} days</p>
                    </div>
                  </div>
                  
                  {/* Status Explanation */}
                  {(() => {
                    const explanation = getStatusExplanation(listingData.lifecycleStatus);
                    if (!explanation) return null;
                    return (
                      <div className={`mt-3 pt-3 border-t ${explanation.border} ${explanation.bg} rounded-lg p-3`}>
                        <p className={`text-sm leading-relaxed ${explanation.color}`}>
                          {explanation.text}
                        </p>
                      </div>
                    );
                  })()}
                  
                  {/* Only show blocked reason if status is BLOCKED */}
                  {listingData.lifecycleStatus === 'BLOCKED' && (
                    <div className="mt-3 pt-3 border-t border-red-300 space-y-2">
                      <span className="text-xs font-semibold text-red-700 uppercase tracking-wide block">Blocked Reason</span>
                      {listingData.blockedReason ? (
                        <p className="text-sm text-red-800">{listingData.blockedReason}</p>
                      ) : (
                        <p className="text-sm italic text-slate-400">No reason provided</p>
                      )}
                      <p className="text-xs text-red-700">Review the policy guidelines and resolve all violations before requesting reinstatement.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                        onClick={() => navigate('/privacy-policy')}
                      >
                        <ExternalLink className="h-3 w-3 mr-2" />
                        Read Policy Guidelines
                      </Button>
                    </div>
                  )}
                  {/* Only show flagged reason if status is FLAGGED */}
                  {listingData.lifecycleStatus === 'FLAGGED' && (
                    <div className="mt-3 pt-3 border-t border-amber-300 space-y-2">
                      <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide block">Flagged Reason</span>
                      {listingData.flaggedReason ? (
                        <p className="text-sm text-amber-800">{listingData.flaggedReason}</p>
                      ) : (
                        <p className="text-sm italic text-slate-400">No reason provided</p>
                      )}
                      <p className="text-xs text-amber-700">Address the requested updates and resubmit your listing to make it visible in public.</p>
                    </div>
                  )}
                </div>

                {/* Lifecycle Status Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Lifecycle Status</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-600">Current Status</span>
                        <Badge className={getStatusColor(listingData.lifecycleStatus)}>
                          {listingData.lifecycleStatus.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-600">Featured Status</span>
                        <Badge className={listingData.isFeatured ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200" : "bg-gray-100 text-gray-600 border-gray-200"}>
                          <Sparkles className="h-3 w-3 mr-1" />
                          {listingData.isFeatured ? 'Featured' : 'Not Featured'}
                        </Badge>
                      </div>
                    </div>
                    {listingData.riskLevel && (
                      <div className="mt-4">
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-slate-600" />
                            <span className="text-sm text-slate-600">Risk Level</span>
                          </div>
                          <Badge className={getRiskLevelColor(listingData.riskLevel)}>
                            {listingData.riskLevel}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Lifecycle Timeline - Vertical Design */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">Lifecycle Timeline</h3>
                    <div className="relative">
                      {/* Vertical Timeline */}
                      <div className="space-y-4">
                        {lifecycleSteps.map((step, index) => {
                          const StepIcon = step.icon;
                          const isActive = step.status === 'active';
                          const isCompleted = step.status === 'completed';
                          const isLast = index === lifecycleSteps.length - 1;
                          const isFlagged = step.stepType === 'FLAGGED';
                          const isBlocked = step.stepType === 'BLOCKED';
                          const isVisible = step.stepType === 'VISIBLE';
                          const isHidden = step.stepType === 'HIDDEN';
                          
                          // Determine colors based on step type
                          let iconBgColor = 'bg-slate-400';
                          let iconRingColor = '';
                          let contentBgColor = 'bg-slate-50';
                          let contentBorderColor = 'border-slate-200';
                          let textColor = 'text-slate-600';
                          let dateColor = 'text-slate-500';
                          let timelineColor = 'bg-slate-200';
                          let activeBadgeColor = 'bg-amber-600';
                          
                          if (isActive) {
                            if (isBlocked) {
                              iconBgColor = 'bg-red-500';
                              iconRingColor = 'ring-4 ring-red-200';
                              contentBgColor = 'bg-red-50';
                              contentBorderColor = 'border-2 border-red-300';
                              textColor = 'text-red-900';
                              dateColor = 'text-red-700';
                              activeBadgeColor = 'bg-red-600';
                            } else if (isFlagged) {
                              iconBgColor = 'bg-amber-500';
                              iconRingColor = 'ring-4 ring-amber-200';
                              contentBgColor = 'bg-amber-50';
                              contentBorderColor = 'border-2 border-amber-300';
                              textColor = 'text-amber-900';
                              dateColor = 'text-amber-700';
                              activeBadgeColor = 'bg-amber-600';
                            } else if (isVisible) {
                              iconBgColor = 'bg-emerald-500';
                              iconRingColor = 'ring-4 ring-emerald-200';
                              contentBgColor = 'bg-emerald-50';
                              contentBorderColor = 'border-2 border-emerald-300';
                              textColor = 'text-emerald-900';
                              dateColor = 'text-emerald-700';
                              activeBadgeColor = 'bg-emerald-600';
                            } else if (isHidden) {
                              iconBgColor = 'bg-teal-500';
                              iconRingColor = 'ring-4 ring-teal-200';
                              contentBgColor = 'bg-teal-50';
                              contentBorderColor = 'border-2 border-teal-300';
                              textColor = 'text-teal-900';
                              dateColor = 'text-teal-700';
                              activeBadgeColor = 'bg-teal-600';
                            } else {
                              iconBgColor = 'bg-amber-500';
                              iconRingColor = 'ring-4 ring-amber-200';
                              contentBgColor = 'bg-amber-50';
                              contentBorderColor = 'border-2 border-amber-300';
                              textColor = 'text-amber-900';
                              dateColor = 'text-amber-700';
                              activeBadgeColor = 'bg-amber-600';
                            }
                          } else if (isCompleted) {
                            if (isBlocked) {
                              iconBgColor = 'bg-red-500';
                              contentBgColor = 'bg-red-50';
                              contentBorderColor = 'border border-red-200';
                              textColor = 'text-red-900';
                              dateColor = 'text-red-700';
                              timelineColor = 'bg-red-300';
                            } else if (isFlagged) {
                              iconBgColor = 'bg-amber-500';
                              contentBgColor = 'bg-amber-50';
                              contentBorderColor = 'border border-amber-200';
                              textColor = 'text-amber-900';
                              dateColor = 'text-amber-700';
                              timelineColor = 'bg-amber-300';
                            } else if (isVisible) {
                              iconBgColor = 'bg-emerald-500';
                              contentBgColor = 'bg-emerald-50';
                              contentBorderColor = 'border border-emerald-200';
                              textColor = 'text-emerald-900';
                              dateColor = 'text-emerald-700';
                              timelineColor = 'bg-emerald-300';
                            } else if (isHidden) {
                              iconBgColor = 'bg-teal-500';
                              contentBgColor = 'bg-teal-50';
                              contentBorderColor = 'border border-teal-200';
                              textColor = 'text-teal-900';
                              dateColor = 'text-teal-700';
                              timelineColor = 'bg-teal-300';
                            } else {
                              iconBgColor = 'bg-emerald-500';
                              contentBgColor = 'bg-emerald-50';
                              contentBorderColor = 'border border-emerald-200';
                              textColor = 'text-emerald-900';
                              dateColor = 'text-emerald-700';
                              timelineColor = 'bg-emerald-300';
                            }
                          }
                          
                          return (
                            <div key={index} className="relative flex items-start gap-4">
                              {/* Timeline Line */}
                              {!isLast && (
                                <div className={`absolute left-5 top-12 w-0.5 h-full ${timelineColor}`} style={{ height: 'calc(100% + 1rem)' }} />
                              )}
                              
                              {/* Icon Circle */}
                              <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconBgColor} text-white ${isActive ? `${iconRingColor} shadow-lg` : ''}`}>
                                <StepIcon className="h-5 w-5" />
                                {isActive && (
                                  <motion.div
                                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className={`absolute inset-0 rounded-full ${iconBgColor}`}
                                  />
                                )}
                              </div>
                              
                              {/* Content */}
                              <div className={`flex-1 pt-1 pb-4 ${contentBgColor} ${contentBorderColor} rounded-lg p-4`}>
                                <div className="flex items-center justify-between mb-2">
                                  <p className={`font-semibold ${textColor}`}>
                                    {step.label}
                                  </p>
                                  {isActive && (
                                    <Badge className={`${activeBadgeColor} text-white`}>Current</Badge>
                                  )}
                                </div>
                                <p className={`text-sm ${dateColor}`}>
                                  {formatDateTime(step.date)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Visibility Reminder - Only show for VISIBLE or HIDDEN status */}
                    {(listingData.lifecycleStatus === 'VISIBLE' || listingData.lifecycleStatus === 'HIDDEN') && (
                      <div className={`mt-6 p-4 rounded-lg border-2 ${
                        listingData.lifecycleStatus === 'VISIBLE'
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-teal-50 border-teal-200'
                      }`}>
                        <div className="flex items-start gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            listingData.lifecycleStatus === 'VISIBLE'
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-teal-100 text-teal-600'
                          }`}>
                            {listingData.lifecycleStatus === 'VISIBLE' ? (
                              <Eye className="h-4 w-4" />
                            ) : (
                              <EyeOff className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-semibold mb-1 ${
                              listingData.lifecycleStatus === 'VISIBLE'
                                ? 'text-emerald-900'
                                : 'text-teal-900'
                            }`}>
                              {listingData.lifecycleStatus === 'VISIBLE' 
                                ? 'Your property is currently displayed' 
                                : 'Your property is currently not displayed'}
                            </p>
                            <p className={`text-sm leading-relaxed ${
                              listingData.lifecycleStatus === 'VISIBLE'
                                ? 'text-emerald-800'
                                : 'text-teal-800'
                            }`}>
                              {listingData.lifecycleStatus === 'VISIBLE' 
                                ? 'Your listing is visible to all tenants and appears in search results. If you want to hide it from public view, click the "Hide Listing" button above.' 
                                : 'Your listing is hidden from public view. Tenants cannot see or search for this listing. If you want to display it in public, click the "Show Listing" button above.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Information */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Payment Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                          <span className="text-sm text-slate-600">Amount Paid</span>
                          {listingData.paymentAmount !== null && listingData.paymentAmount !== undefined ? (
                            <span className="font-semibold text-green-700">₱{listingData.paymentAmount.toLocaleString()}</span>
                          ) : (
                            <span className="text-sm italic text-slate-400">Not applicable</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm text-slate-600">Payment Method</span>
                          {listingData.providerName ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {listingData.providerName}
                            </Badge>
                          ) : (
                            <span className="text-sm italic text-slate-400">Not applicable</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm text-slate-600">Transaction ID</span>
                          {simulatedTxnId ? (
                            <span className="text-xs font-mono text-slate-700 truncate max-w-[150px]" title={simulatedTxnId}>
                              {simulatedTxnId}
                            </span>
                          ) : (
                            <span className="text-sm italic text-slate-400">Not applicable</span>
                          )}
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                          <span className="text-sm text-slate-600">Payment Date</span>
                          {listingData.paymentDate ? (
                            <span className="text-sm font-medium text-slate-900">{formatDateTime(listingData.paymentDate)}</span>
                          ) : (
                            <span className="text-sm italic text-slate-400">Not applicable</span>
                          )}
                        </div>
                      </div>
                    </div>

                  {/* Reviewer Information */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Review Status</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-600">Reviewed At</span>
                        {listingData.reviewedAt ? (
                          <span className="text-sm font-medium text-slate-900">{formatDateTime(listingData.reviewedAt)}</span>
                        ) : (
                          <span className="text-sm italic text-slate-400">Not reviewed</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Image Flags removed: deprecated in backend */}
                </div>
              </CardContent>
            </Card>

            {/* AI Analysis Section */}
            {listingData.aiAnalysis && listingData.aiAnalysis.length > 0 && (
              <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-xl text-slate-900">AI Analysis</CardTitle>
                  </div>
                  <CardDescription>Automated analysis of your listing content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {listingData.aiAnalysis.map((analysis, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-500 text-white">
                          <span className="text-sm font-bold">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm mb-1 capitalize text-blue-900">
                            {analysis.part}
                          </p>
                          <p className="text-sm leading-relaxed text-blue-800">
                            {analysis.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Content Sanitization */}
          <div className="space-y-6">
            {(listingData.propertySanitizeLogs && listingData.propertySanitizeLogs.length > 0) ||
             (listingData.unitSanitizeLogs && listingData.unitSanitizeLogs.length > 0) ? (
              <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Ban className="h-5 w-5 text-red-600" />
                    <CardTitle className="text-xl text-slate-900">Content Sanitization Logs</CardTitle>
                  </div>
                  <CardDescription>Content automatically removed or modified</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {(() => {
                    const allLogs = [
                      ...(listingData.propertySanitizeLogs || []),
                      ...(listingData.unitSanitizeLogs || [])
                    ];
                    const hasScammingPattern = allLogs.some((log) =>
                      log.isScammingPattern === true ||
                      log.reason?.toLowerCase()?.trim() === "scam"
                    );

                    if (hasScammingPattern) {
                      return (
                        <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-400 rounded-lg p-4 shadow-sm">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                              <AlertCircle className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-red-900 mb-2">⚠️ Scamming Pattern Detected</h3>
                              <p className="text-sm text-red-800 leading-relaxed mb-3">
                                This scamming attempt has been <strong>recorded in your account</strong>.
                                Multiple attempts of fraudulent or scamming content will result in <strong>account suspension or permanent ban</strong>.
                                Please refrain from using fraudulent pricing schemes, upfront payment requests, or deceptive content in your listings.
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate('/terms-privacy')}
                                className="flex items-center gap-2 text-xs border-red-300 text-red-700 hover:bg-red-100"
                              >
                                <HelpCircle className="h-3 w-3" />
                                Learn More
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {listingData.propertySanitizeLogs && listingData.propertySanitizeLogs.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Property Content Removed
                      </h3>
                      <div className="space-y-3">
                        {listingData.propertySanitizeLogs.map((log, index) => {
                          const isScamReason = log.reason?.toLowerCase()?.trim() === "scam";
                          const isSevere = log.isScammingPattern || isScamReason;
                          return (
                            <div
                              key={index}
                              className={`p-4 rounded-lg border-2 ${
                                isSevere
                                  ? 'bg-red-50 border-red-300'
                                  : 'bg-amber-50 border-amber-300'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex items-center gap-2">
                                  {isSevere ? (
                                    <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                  ) : (
                                    <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                                  )}
                                  <span className="font-semibold text-sm capitalize text-slate-900">
                                    {log.part}
                                  </span>
                                  {isSevere && (
                                    <Badge className="bg-red-500 text-white text-xs">Scamming Pattern</Badge>
                                  )}
                                </div>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    isSevere
                                      ? 'border-red-300 text-red-700 bg-red-100'
                                      : 'border-amber-300 text-amber-700 bg-amber-100'
                                  }`}
                                >
                                  {log.action}
                                </Badge>
                              </div>
                              <p className={`text-sm font-medium mb-2 ${
                                isSevere ? 'text-red-800' : 'text-slate-700'
                              }`}>
                                Reason: {formatReason(log.reason)}
                              </p>
                              <div className={`mt-2 pt-2 border-t ${isSevere ? 'border-red-200' : 'border-slate-200'}`}>
                                <p className={`text-xs mb-1 ${isSevere ? 'text-red-700' : 'text-slate-600'}`}>Removed Content:</p>
                                <p className={`text-sm bg-white/50 p-2 rounded border font-mono break-words ${
                                  isSevere 
                                    ? 'text-red-900 border-red-200' 
                                    : 'text-slate-800 border-slate-200'
                                }`}>
                                  {formatDataUsed(log.dataUsed)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {listingData.unitSanitizeLogs && listingData.unitSanitizeLogs.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        Unit Content Removed
                      </h3>
                      <div className="space-y-3">
                        {listingData.unitSanitizeLogs.map((log, index) => {
                          const isScamReason = log.reason?.toLowerCase()?.trim() === "scam";
                          const isSevere = log.isScammingPattern || isScamReason;
                          return (
                            <div
                              key={index}
                              className={`p-4 rounded-lg border-2 ${
                                isSevere
                                  ? 'bg-red-50 border-red-300'
                                  : 'bg-amber-50 border-amber-300'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex items-center gap-2">
                                  {isSevere ? (
                                    <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                                  ) : (
                                    <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                                  )}
                                  <span className="font-semibold text-sm capitalize text-slate-900">
                                    {log.part}
                                  </span>
                                  {isSevere && (
                                    <Badge className="bg-red-500 text-white text-xs">Scamming Pattern</Badge>
                                  )}
                                </div>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    isSevere
                                      ? 'border-red-300 text-red-700 bg-red-100'
                                      : 'border-amber-300 text-amber-700 bg-amber-100'
                                  }`}
                                >
                                  {log.action}
                                </Badge>
                              </div>
                              <p className={`text-sm font-medium mb-2 ${
                                isSevere ? 'text-red-800' : 'text-slate-700'
                              }`}>
                                Reason: {formatReason(log.reason)}
                              </p>
                              <div className={`mt-2 pt-2 border-t ${isSevere ? 'border-red-200' : 'border-slate-200'}`}>
                                <p className={`text-xs mb-1 ${isSevere ? 'text-red-700' : 'text-slate-600'}`}>Removed Content:</p>
                                <p className={`text-sm bg-white/50 p-2 rounded border font-mono break-words ${
                                  isSevere 
                                    ? 'text-red-900 border-red-200' 
                                    : 'text-slate-800 border-slate-200'
                                }`}>
                                  {formatDataUsed(log.dataUsed)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/90 backdrop-blur-sm border-dashed border-2 border-slate-200 shadow-none">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Ban className="h-5 w-5 text-slate-500" />
                    <CardTitle className="text-xl text-slate-900">No Content Sanitization Logs</CardTitle>
                  </div>
                  <CardDescription>Your listing content passed automated checks.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600">
                    Keep providing accurate and policy-compliant information to maintain a clean record.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Toggle Visibility Confirmation Modal */}
      <Dialog open={showToggleConfirm} onOpenChange={setShowToggleConfirm}>
        <DialogContent className="sm:max-w-md bg-white border-slate-300 shadow-2xl">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                listingData?.lifecycleStatus === 'VISIBLE' 
                  ? 'bg-teal-100 text-teal-600' 
                  : 'bg-emerald-100 text-emerald-600'
              }`}>
                {listingData?.lifecycleStatus === 'VISIBLE' ? (
                  <EyeOff className="h-6 w-6" />
                ) : (
                  <Eye className="h-6 w-6" />
                )}
              </div>
              <DialogTitle className="text-xl font-semibold text-slate-900">
                {listingData?.lifecycleStatus === 'VISIBLE' ? 'Hide Listing?' : 'Show Listing?'}
              </DialogTitle>
            </div>
            <DialogDescription className="text-slate-600 text-base leading-relaxed pt-2">
              {listingData?.lifecycleStatus === 'VISIBLE' ? (
                <>
                  Your unit listing will be <strong className="text-slate-900">hidden from public view</strong>. 
                  Tenants will no longer be able to see or search for this listing. You can make it visible again at any time.
                </>
              ) : (
                <>
                  Your unit listing will be <strong className="text-slate-900">visible to all tenants</strong>. 
                  It will appear in search results and be accessible to potential renters. You can hide it again at any time.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 justify-end pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowToggleConfirm(false)} 
              disabled={toggling}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmToggle} 
              disabled={toggling}
              className={`${
                listingData?.lifecycleStatus === 'VISIBLE'
                  ? 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
              } text-white shadow-lg`}
            >
              {toggling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {listingData?.lifecycleStatus === 'VISIBLE' ? 'Hiding...' : 'Showing...'}
                </>
              ) : (
                <>
                  {listingData?.lifecycleStatus === 'VISIBLE' ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Listing
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show Listing
                    </>
                  )}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
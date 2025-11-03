import { useState, useEffect, useRef } from 'react';
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
  Edit,
  Mail,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { getLandlordSpecificListingRequest } from '@/api/landlord/listingApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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

interface AiRecommendation {
  part: string;
  suggestion: string;
}

interface AiAnalysis {
  part: string;
  description: string;
}

interface ListingData {
  id: string;
  lifecycleStatus: string;
  visibleAt: string | null;
  hiddenAt: string | null;
  flaggedAt: string | null;
  blockedAt: string | null;
  reviewedBy: string | null;
  lastReviewedAt: string | null;
  expiresAt: string;
  isFeatured: boolean;
  aiRecommendations: AiRecommendation[] | null;
  riskLevel: string | null; // "LOW" | "MEDIUM" | "HIGH"
  riskReason: string | null;
  aiAnalysis: AiAnalysis[] | null;
  yandexScreenshot: string | null;
  providerName: string | null;
  providerTxnId: string | null;
  paymentAmount: number | null;
  paymentDate: string | null;
  blockedReason: string | null;
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
  const aiRecommendationsRef = useRef<HTMLDivElement>(null);

  const fetchListingData = async () => {
    if (!listingId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await getLandlordSpecificListingRequest(listingId);
      setListingData(response.data);
    } catch (err) {
      setError('Failed to load listing data');
      console.error('Error fetching listing data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };





  const formatAddress = (property: Property) => {
    return `${property.street}, ${property.barangay}, ${property.city.name}, ${property.zipCode}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'WAITING_PAYMENT': return 'bg-blue-100 text-blue-700 border-blue-200';
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
      case 'WAITING_PAYMENT': return 'from-blue-200/70 via-blue-100/50 to-blue-200/70';
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
      case 'WAITING_PAYMENT': return 'bg-blue-50 border-blue-300';
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
      case 'WAITING_PAYMENT': return 'bg-blue-500';
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
      WAITING_PAYMENT: variant === 'light' ? 'bg-blue-200/40' : 'bg-blue-300/40',
      VISIBLE: variant === 'light' ? 'bg-emerald-200/40' : 'bg-emerald-300/40',
      HIDDEN: variant === 'light' ? 'bg-teal-200/40' : 'bg-teal-300/40',
      EXPIRED: variant === 'light' ? 'bg-gray-200/40' : 'bg-gray-300/40',
      FLAGGED: variant === 'light' ? 'bg-amber-200/40' : 'bg-amber-300/40',
      BLOCKED: variant === 'light' ? 'bg-red-200/40' : 'bg-red-300/40',
    };
    return colors[status as keyof typeof colors] || colors.WAITING_PAYMENT;
  };

  const getCurrentLifecycleDate = () => {
    const status = listingData?.lifecycleStatus;
    if (!listingData) return null;
    
    switch (status) {
      case 'WAITING_PAYMENT': return listingData.createdAt;
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
      case 'WAITING_PAYMENT': return 'Created At';
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
      case 'WAITING_PAYMENT': return Calendar;
      case 'VISIBLE': return Eye;
      case 'HIDDEN': return EyeOff;
      case 'EXPIRED': return Calendar;
      case 'FLAGGED': return AlertTriangle;
      case 'BLOCKED': return AlertCircle;
      default: return Calendar;
    }
  };

  const handleEditUnit = () => {
    if (listingData?.unit.id) {
      navigate(`/landlord/units/${listingData.unit.id}/edit`);
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


  useEffect(() => {
    if (listingId) {
      fetchListingData();
    }
  }, [listingId]);

  // Auto-scroll to AI recommendations if listing is FLAGGED or WAITING_PAYMENT
  useEffect(() => {
    if (listingData && (listingData.lifecycleStatus === 'FLAGGED' || listingData.lifecycleStatus === 'WAITING_PAYMENT') && aiRecommendationsRef.current) {
      // Small delay to ensure DOM is rendered
      setTimeout(() => {
        aiRecommendationsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        });
      }, 300);
    }
  }, [listingData]);

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <Skeleton className="h-20 w-full rounded-2xl" />
          
          {/* Unit & Property Information Skeleton */}
          <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>

          {/* Main Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Listing Information Skeleton */}
            <div className="lg:col-span-2 space-y-6">
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

            {/* Right Column - AI Recommendations Skeleton */}
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
                  <div className="mt-6">
                    <Skeleton className="h-10 w-full rounded-md" />
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
        <div className="max-w-7xl mx-auto">
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
                  <Button onClick={fetchListingData} className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
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
  
  // Build lifecycle flow: CREATED → WAITING_PAYMENT → ACTIVE (VISIBLE/HIDDEN) → FLAGGED → BLOCKED
  const lifecycleSteps: Array<{ label: string; date: string; status: 'active' | 'completed' | 'pending'; icon: any; stepType?: 'FLAGGED' | 'BLOCKED' }> = [];
  
  // Always show Created
  lifecycleSteps.push({ label: 'Created', date: listingData.createdAt, status: 'completed', icon: CheckCircle });
  
  // Show WAITING_PAYMENT status
  if (listingData.lifecycleStatus === 'WAITING_PAYMENT') {
    lifecycleSteps.push({ 
      label: 'Waiting Payment', 
      date: listingData.createdAt, 
      status: 'active', 
      icon: Calendar 
    });
  } else {
    // Show Payment step if payment was completed
    if (listingData.paymentDate) {
      lifecycleSteps.push({ label: 'Payment', date: listingData.paymentDate, status: 'completed', icon: CheckCircle });
    }
    
    // Show VISIBLE if it occurred
    if (listingData.visibleAt) {
      lifecycleSteps.push({ 
        label: 'Visible', 
        date: listingData.visibleAt, 
        status: listingData.lifecycleStatus === 'VISIBLE' ? 'active' : 'completed', 
        icon: Eye 
      });
    }
    
    // Show HIDDEN if it occurred (only if it happened after VISIBLE)
    if (listingData.hiddenAt) {
      lifecycleSteps.push({ 
        label: 'Hidden', 
        date: listingData.hiddenAt, 
        status: listingData.lifecycleStatus === 'HIDDEN' ? 'active' : 'completed', 
        icon: EyeOff 
      });
    }
    
    // Show FLAGGED if it occurred
    if (listingData.flaggedAt) {
      lifecycleSteps.push({ 
        label: 'Flagged', 
        date: listingData.flaggedAt, 
        status: listingData.lifecycleStatus === 'FLAGGED' ? 'active' : 'completed', 
        icon: AlertTriangle,
        stepType: 'FLAGGED'
      });
    }
    
    // Show BLOCKED if it occurred
    if (listingData.blockedAt) {
      lifecycleSteps.push({ 
        label: 'Blocked', 
        date: listingData.blockedAt, 
        status: listingData.lifecycleStatus === 'BLOCKED' ? 'active' : 'completed', 
        icon: AlertCircle,
        stepType: 'BLOCKED'
      });
    }
  }
  
  // Always show Expires at the end
  lifecycleSteps.push({ label: 'Expires', date: listingData.expiresAt, status: 'pending', icon: Calendar });
  
  const CurrentLifecycleIcon = getCurrentLifecycleIcon();

  return (
    <div className="min-h-screen  p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
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
            
            <div className="px-4 sm:px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white grid place-items-center shadow-md"
                  >
                    <Home className="h-5 w-5" />
                  </motion.div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900 truncate">
                        Listing Details
                      </h1>
                      <Sparkles className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-sm text-gray-600 leading-5 truncate">
                      {unit.label} • {property.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
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
                className="mt-3 h-0.5 w-full bg-gradient-to-r from-emerald-400/70 via-emerald-300/70 to-sky-400/70 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Unit & Property Information - Compact and Visible */}
        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl text-slate-900">Unit & Property Information</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Unit Label */}
            <div>
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold text-slate-900">{unit.label || 'No label provided'}</h3>
              </div>
            </div>

            {/* Property - Compact Row */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900">{property.title || 'No title provided'}</h3>
                    <Badge variant="outline" className="text-xs bg-slate-100 text-slate-700 capitalize">
                      {property.type ? property.type.toLowerCase() : 'N/A'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 truncate">{formatAddress(property) || <span className="italic text-slate-400">No address</span>}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Listing Information (PRIMARY) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Listing Details - PRIMARY */}
            <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900">Listing Information</CardTitle>
                <CardDescription>Primary listing details and lifecycle status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
                      
                      {/* Current Status Summary */}
                      <div className={`mt-6 p-4 rounded-lg border-2 ${getStatusBackgroundColor(listingData.lifecycleStatus)}`}>
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
                            {listingData.lifecycleStatus !== 'WAITING_PAYMENT' && (
                              <p className="text-xs text-slate-500">Expires in {daysUntilExpiry} days</p>
                            )}
                          </div>
                        </div>
                        {/* Only show blocked reason if status is BLOCKED */}
                        {listingData.lifecycleStatus === 'BLOCKED' && (
                          <div className="mt-3 pt-3 border-t border-red-300">
                            <span className="text-xs font-semibold text-red-700 uppercase tracking-wide block mb-1">Blocked Reason</span>
                            {listingData.blockedReason ? (
                              <p className="text-sm text-red-800">{listingData.blockedReason}</p>
                            ) : (
                              <p className="text-sm italic text-slate-400">No reason provided</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Payment Information - Only show if NOT waiting for payment */}
                  {listingData.lifecycleStatus !== 'WAITING_PAYMENT' && (
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
                          {listingData.providerTxnId ? (
                            <span className="text-xs font-mono text-slate-700 truncate max-w-[150px]" title={listingData.providerTxnId}>
                              {listingData.providerTxnId}
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
                  )}

                  {/* Reviewer Information */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Review Status</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-600">Reviewed By</span>
                        {listingData.reviewedBy ? (
                          <span className="text-sm font-medium text-slate-900">{listingData.reviewedBy}</span>
                        ) : (
                          <span className="text-sm italic text-slate-400">Not reviewed</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-600">Last Reviewed At</span>
                        {listingData.lastReviewedAt ? (
                          <span className="text-sm font-medium text-slate-900">{formatDateTime(listingData.lastReviewedAt)}</span>
                        ) : (
                          <span className="text-sm italic text-slate-400">Not reviewed</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* AI Recommendations with Urgent Warning */}
            <div ref={aiRecommendationsRef}>
              <Card className={`bg-white/90 backdrop-blur-sm shadow-lg ${
                listingData.lifecycleStatus === 'BLOCKED'
                  ? 'border-2 border-red-300 bg-gradient-to-br from-red-50 to-rose-50' 
                  : listingData.lifecycleStatus === 'FLAGGED'
                  ? 'border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50' 
                  : listingData.lifecycleStatus === 'WAITING_PAYMENT'
                  ? 'border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50'
                  : 'border-slate-200'
              }`}>
                <CardHeader>
                  <div className="space-y-3">
                    {/* Urgent Warning Banner - Show for FLAGGED and BLOCKED */}
                    {listingData.lifecycleStatus === 'FLAGGED' && (
                      <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg border-2 border-amber-400">
                        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-amber-900 mb-1">⚠️ Urgent Action Required</h3>
                          <p className="text-sm text-amber-800 leading-relaxed">
                            Your listing has been <strong>FLAGGED</strong> and requires immediate attention. 
                            <strong className="text-amber-900"> If these issues are not addressed within multiple days, your listing will be automatically BLOCKED.</strong>
                          </p>
                        </div>
                      </div>
                    )}
                    {listingData.lifecycleStatus === 'BLOCKED' && (
                      <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-red-100 to-rose-100 rounded-lg border-2 border-red-400">
                        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-red-900 mb-1">🚫 Listing Blocked</h3>
                          <p className="text-sm text-red-800 leading-relaxed">
                            Your listing has been <strong>BLOCKED</strong> and is no longer visible to users. 
                            <strong className="text-red-900"> Address the issues below and contact support to restore your listing.</strong>
                          </p>
                        </div>
                      </div>
                    )}

                    {/* AI Recommendations Header */}
                    <div className="flex items-center gap-2">
                      <Lightbulb className={`h-6 w-6 ${
                        listingData.lifecycleStatus === 'BLOCKED'
                          ? 'text-red-600'
                          : listingData.lifecycleStatus === 'FLAGGED'
                          ? 'text-amber-600'
                          : 'text-blue-600'
                      }`} />
                      <CardTitle className={`flex-1 flex items-center gap-2 text-xl ${
                        listingData.lifecycleStatus === 'BLOCKED'
                          ? 'text-red-900'
                          : listingData.lifecycleStatus === 'FLAGGED'
                          ? 'text-amber-900'
                          : 'text-slate-900'
                      }`}>
                        AI Recommendations
                        {listingData.lifecycleStatus === 'BLOCKED' && (
                          <Badge className="bg-red-500 text-white border-red-600 animate-pulse">
                            ⚠️ Action Required
                          </Badge>
                        )}
                        {listingData.lifecycleStatus === 'FLAGGED' && (
                          <Badge className="bg-amber-500 text-white border-amber-600 animate-pulse">
                            ⚠️ Action Required
                          </Badge>
                        )}
                      </CardTitle>
                    </div>
                    <CardDescription className={
                      listingData.lifecycleStatus === 'BLOCKED'
                        ? 'text-red-700 font-medium' 
                        : listingData.lifecycleStatus === 'FLAGGED' 
                        ? 'text-amber-700 font-medium' 
                        : listingData.lifecycleStatus === 'WAITING_PAYMENT'
                        ? 'text-blue-700 font-medium'
                        : 'text-slate-600'
                    }>
                      {listingData.lifecycleStatus === 'BLOCKED'
                        ? 'Your listing has been blocked. Address these issues immediately and contact support to restore your listing.'
                        : listingData.lifecycleStatus === 'FLAGGED' 
                        ? 'Address these issues immediately to prevent your listing from being blocked. Edit your unit information below to resolve these recommendations.'
                        : listingData.lifecycleStatus === 'WAITING_PAYMENT'
                        ? 'Complete payment to make your listing visible. Review these recommendations while waiting.'
                        : 'Recommendations to improve your listing performance'}
                    </CardDescription>
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate('/privacy-policy')}
                        className="flex items-center gap-2 text-xs"
                      >
                        <HelpCircle className="h-3 w-3" />
                        Learn More
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {listingData.aiRecommendations && listingData.aiRecommendations.length > 0 ? (
                    <>
                      <div className="space-y-4">
                        {listingData.aiRecommendations.map((recommendation, index) => (
                          <div key={index} className={`flex items-start gap-4 p-4 rounded-lg border-2 ${
                            listingData.lifecycleStatus === 'BLOCKED'
                              ? 'bg-white border-red-300 shadow-sm'
                              : listingData.lifecycleStatus === 'FLAGGED'
                              ? 'bg-white border-amber-300 shadow-sm'
                              : listingData.lifecycleStatus === 'WAITING_PAYMENT'
                              ? 'bg-white border-blue-300 shadow-sm'
                              : 'bg-blue-50 border-blue-200'
                          }`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              listingData.lifecycleStatus === 'BLOCKED'
                                ? 'bg-red-500 text-white'
                                : listingData.lifecycleStatus === 'FLAGGED'
                                ? 'bg-amber-500 text-white'
                                : listingData.lifecycleStatus === 'WAITING_PAYMENT'
                                ? 'bg-blue-500 text-white'
                                : 'bg-blue-500 text-white'
                            }`}>
                              <span className="text-sm font-bold">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <p className={`font-semibold text-sm mb-1 capitalize ${
                                listingData.lifecycleStatus === 'BLOCKED'
                                  ? 'text-red-900'
                                  : listingData.lifecycleStatus === 'FLAGGED'
                                  ? 'text-amber-900'
                                  : listingData.lifecycleStatus === 'WAITING_PAYMENT'
                                  ? 'text-blue-900'
                                  : 'text-blue-900'
                              }`}>
                                {recommendation.part}
                              </p>
                              <p className={`text-sm leading-relaxed ${
                                listingData.lifecycleStatus === 'BLOCKED'
                                  ? 'text-red-800'
                                  : listingData.lifecycleStatus === 'FLAGGED'
                                  ? 'text-amber-800'
                                  : listingData.lifecycleStatus === 'WAITING_PAYMENT'
                                  ? 'text-blue-800'
                                  : 'text-blue-800'
                              }`}>
                                {recommendation.suggestion}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 pt-4 border-t-2 border-slate-300 space-y-3">
                        {listingData.lifecycleStatus === 'BLOCKED' ? (
                          <>
                            <Button 
                              onClick={() => window.location.href = 'mailto:support@rentease.com?subject=Listing Blocked - Support Request'}
                              className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg"
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Contact Support
                            </Button>
                            <p className="text-xs text-center text-slate-600">
                              Blocked listings require support assistance to restore. This action is difficult to reverse.
                            </p>
                          </>
                        ) : listingData.lifecycleStatus === 'FLAGGED' ? (
                          <>
                            <Button 
                              onClick={handleEditUnit}
                              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-lg"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Your Unit Information Here
                            </Button>
                            <p className="text-xs text-center text-amber-700">
                              Fix these issues to restore your listing. If ignored for many days, your listing will be automatically blocked.
                            </p>
                          </>
                        ) : (
                          <Button 
                            onClick={handleEditUnit}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Your Unit Information Here
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="p-6 text-center border-2 border-dashed border-slate-300 rounded-lg bg-slate-50">
                      <Lightbulb className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600 font-medium mb-1">No AI Recommendations Available</p>
                      <p className="text-xs text-slate-500 italic">
                        {listingData.lifecycleStatus === 'WAITING_PAYMENT' 
                          ? 'Complete payment to receive recommendations for your listing.'
                          : 'Recommendations will appear here once your listing is analyzed.'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
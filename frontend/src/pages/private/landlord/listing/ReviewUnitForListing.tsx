import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Home, MapPin, Edit2, Sparkles, HelpCircle, CheckCircle2, AlertCircle, DollarSign, Info, XCircle } from 'lucide-react';
import { getUnitForListingReviewRequest, createPaymentSessionRequest, deleteListingOnPaymentFailureRequest } from '@/api/landlord/listingApi';
import { toast } from 'sonner';
import { Card, CardContent,  CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface Property {
  id: string;
  title: string;
  type: string;
  street: string;
  barangay: string;
  zipCode: string;
}

interface Unit {
  id: string;
  label: string;
  createdAt: string;
  updatedAt: string;
}

interface ReviewData {
  unit: Unit;
  property: Property;
}


const ReviewUnitForListing = () => {
  const { unitId } = useParams<{ unitId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFeatured, setIsFeatured] = useState(false);
  const [creatingListing, setCreatingListing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [paymentFailed, setPaymentFailed] = useState(false);
  
  const [agreed, setAgreed] = useState(false);
  

  const fetchReviewData = async () => {
    if (!unitId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await getUnitForListingReviewRequest(unitId);
      setReviewData(response.data);
    } catch (err) {
      setError('Failed to load unit data');
      console.error('Error fetching review data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async () => {
    if (!unitId) return;
    if (!agreed) {
      setCreateError('Please confirm you agree to the listing terms before proceeding.');
      return;
    }
    setShowConfirm(true);
  };

  const handleProceedPayment = async () => {
    if (!unitId) return;
    try {
      setCreatingListing(true);
      setCreateError(null);
      
      const payload = {
        isFeatured: isFeatured
      };

      const response = await createPaymentSessionRequest(unitId, payload);
      
      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      }
    } catch (err) {
      setCreateError('Failed to create payment session');
      console.error('Error creating payment session:', err);
    } finally {
      setCreatingListing(false);
      setShowConfirm(false);
    }
  };


  const formatAddress = (property: Property) => {
    return `${property.street}, ${property.barangay}, ${property.zipCode}`;
  };

  // Handle payment failure/cancellation
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    const listingId = searchParams.get('listingId');

    if (paymentStatus === 'failed' && listingId) {
      setPaymentFailed(true);
      
      // Delete the listing on payment failure
      const handlePaymentFailure = async () => {
        try {
          await deleteListingOnPaymentFailureRequest(listingId);
          toast.error('Payment was cancelled or failed. The listing has been removed.');
          
          // Remove query parameters from URL
          setSearchParams({});
          
          // Hide the alert after a brief moment
          setTimeout(() => {
            setPaymentFailed(false);
          }, 5000);
        } catch (err: any) {
          console.error('Error deleting listing on payment failure:', err);
          toast.error(err?.response?.data?.error || 'Failed to clean up listing. Please contact support.');
          setPaymentFailed(false);
        }
      };

      handlePaymentFailure();
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!unitId) return;
    
    fetchReviewData();
  }, [unitId]);

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="space-y-6">
          {/* Page Header Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-80" />
          </div>

          {/* Main Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Key Information Card Skeleton */}
            <Card className="lg:col-span-2 bg-white/90 backdrop-blur border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-36" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Unit Section Skeleton */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <Skeleton className="h-3 w-12 mb-4" />
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-6 w-40" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-6 w-28" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-4 w-36" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-4 w-36" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Property Section Skeleton */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <Skeleton className="h-3 w-16 mb-4" />
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3 w-12" />
                          <Skeleton className="h-6 w-48" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-4 w-64" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Publish CTA Card Skeleton */}
            <Card className="lg:col-span-2 h-full border-slate-200 bg-white shadow-sm">
              <CardContent className="p-5 h-full flex flex-col justify-between gap-4">
                <div className="space-y-3">
                  {/* Header Skeleton */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>

                  {/* Info banner skeleton */}
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-3 w-64 mt-2" />
                  </div>

                  {/* Pricing Options Skeleton */}
                  <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
                    <Skeleton className="h-3 w-36 mb-2" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                  </div>

                  {/* Agreement Skeleton */}
                  <Skeleton className="h-12 w-full rounded-md" />

                  {/* Edit Unit Link Skeleton */}
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>

                {/* Button Skeleton */}
                <Skeleton className="w-full h-12 rounded-md" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !reviewData) {
    return (
      <div className="min-h-screen p-6">
        <div>
          <Card className="border-red-200 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-red-800 mb-4">{error || 'Unit not found'}</p>
                <Button onClick={fetchReviewData}>
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { unit, property } = reviewData;

  return (
    <>
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
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
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: [0, -3, 3, 0] }}
                    className="relative flex-shrink-0"
                  >
                    <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-sky-600 via-cyan-600 to-emerald-600 text-white grid place-items-center shadow-xl shadow-cyan-500/30">
                      <Sparkles className="h-5 w-5 relative z-10" />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                    </div>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 220 }}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white text-sky-600 border border-sky-100 shadow-sm grid place-items-center"
                    >
                      <Star className="h-3 w-3" />
                    </motion.div>
                  </motion.div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 truncate">
                        Create New Listing
                      </h1>
                    </div>
                    <p className="text-sm text-slate-600 leading-6 flex items-center gap-1.5">
                      Review unit details and select listing options
                    </p>
                  </div>
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

        {/* Payment Failure Alert */}
        {paymentFailed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-red-200 bg-red-50/80 backdrop-blur-sm shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-red-900 mb-1">
                      Payment Cancelled or Failed
                    </h3>
                    <p className="text-sm text-red-700">
                      Your payment was cancelled or failed. The listing has been automatically removed. You can create a new listing by selecting your options below.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Unit & Property Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Unit Information Card */}
            <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 grid place-items-center">
                    <Home className="h-4 w-4 text-white" />
                  </div>
                  Unit Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                    <p className="text-xs font-medium text-slate-500 mb-1.5">Unit Label</p>
                    <p className="text-base font-semibold text-slate-900">{unit.label}</p>
                  </div>
                  <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                    <p className="text-xs font-medium text-slate-500 mb-1.5">Property Type</p>
                    <p className="text-sm font-medium text-slate-900 capitalize">{property.type.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Property Information Card */}
            <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 grid place-items-center">
                    <MapPin className="h-4 w-4 text-white" />
                  </div>
                  Property Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                  <p className="text-xs font-medium text-slate-500 mb-1.5">Property Title</p>
                  <p className="text-base font-semibold text-slate-900">{property.title}</p>
                </div>
                <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                  <p className="text-xs font-medium text-slate-500 mb-1.5">Full Address</p>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed">{formatAddress(property)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Edit Unit Link */}
            <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 grid place-items-center flex-shrink-0">
                    <Info className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 mb-2">Need to make changes?</p>
                    <p className="text-xs text-slate-600 mb-3">Review all information carefully before publishing. This listing will be visible to all tenants.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/landlord/units/${property.id}/${unit.id}`)}
                      className="gap-2 text-xs border-slate-300 text-slate-700 hover:bg-slate-50"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit Unit Information
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Listing Options */}
          <div className="space-y-6">
            {/* Pricing Options Card */}
            <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm sticky top-6">
              <CardHeader className="pb-3 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 grid place-items-center">
                      <DollarSign className="h-4 w-4 text-white" />
                    </div>
                    Listing Options
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/terms-privacy')}
                    className="h-7 w-7 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    title="Learn More"
                  >
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* Normal Listing Option */}
                <button
                  onClick={() => setIsFeatured(false)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    !isFeatured
                      ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-100 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors ${
                        !isFeatured 
                          ? 'border-emerald-600 bg-emerald-600' 
                          : 'border-slate-300 bg-white'
                      }`}>
                        {!isFeatured && <div className="h-2 w-2 rounded-full bg-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold mb-1 ${!isFeatured ? 'text-emerald-900' : 'text-slate-900'}`}>
                          Normal Listing
                        </p>
                        <p className={`text-xs leading-relaxed ${!isFeatured ? 'text-emerald-700' : 'text-slate-600'}`}>
                          Standard visibility in search results
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className={`text-lg font-bold ${!isFeatured ? 'text-emerald-700' : 'text-slate-700'}`}>
                        ₱100
                      </div>
                      <div className={`text-[10px] ${!isFeatured ? 'text-emerald-600' : 'text-slate-500'}`}>
                        one-time
                      </div>
                    </div>
                  </div>
                </button>

                {/* Featured Listing Option */}
                <button
                  onClick={() => setIsFeatured(true)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    isFeatured
                      ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-100 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-colors ${
                        isFeatured 
                          ? 'border-emerald-600 bg-emerald-600' 
                          : 'border-slate-300 bg-white'
                      }`}>
                        {isFeatured && <div className="h-2 w-2 rounded-full bg-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <p className={`text-sm font-semibold ${isFeatured ? 'text-emerald-900' : 'text-slate-900'}`}>
                            Featured Listing
                          </p>
                          <Star className={`h-3.5 w-3.5 ${isFeatured ? 'text-emerald-600 fill-emerald-600' : 'text-slate-400'}`} />
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            isFeatured 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            Recommended
                          </span>
                        </div>
                        <p className={`text-xs leading-relaxed ${isFeatured ? 'text-emerald-700' : 'text-slate-600'}`}>
                          Premium placement with boosted visibility
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <div className={`text-lg font-bold ${isFeatured ? 'text-emerald-700' : 'text-slate-700'}`}>
                        ₱150
                      </div>
                      <div className={`text-[10px] ${isFeatured ? 'text-emerald-600' : 'text-slate-500'}`}>
                        one-time
                      </div>
                    </div>
                  </div>
                </button>

                <div className="pt-2 border-t border-slate-200">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Featured listings appear in boosted sections and receive priority placement in search results for better visibility.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Terms & Agreement Card */}
            <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 grid place-items-center">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  Terms & Agreement
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>90-day publication period</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Content will be reviewed and sanitized</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>Scamming patterns may lead to penalties</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <label className="flex items-start gap-3 cursor-pointer select-none group">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => {
                        setAgreed(e.target.checked);
                        if (e.target.checked) {
                          setCreateError(null);
                        }
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 focus:ring-2"
                    />
                    <span className="text-xs text-slate-700 leading-relaxed flex-1">
                      I have read and agree to the{' '}
                      <a 
                        href="/terms-privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2 font-medium"
                      >
                        listing terms and privacy policy
                      </a>
                      .
                    </span>
                  </label>
                </div>

                {createError && (
                  <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-red-800 flex-1">{createError}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Button */}
            <Button 
              onClick={handleCreateListing}
              disabled={creatingListing || !agreed}
              className="w-full h-12 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all"
              size="lg"
            >
              {creatingListing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/50 border-t-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Proceed to Payment
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>

    {/* Confirmation Modal */}
    <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-900">Confirm and proceed</DialogTitle>
          <DialogDescription className="text-slate-600">
            We will sanitize content (remove inappropriate/discriminatory/illegal/spam). Scamming patterns are recorded and may lead to penalties or suspension. {isFeatured ? 'Featured listings are highlighted for better visibility.' : ''}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setShowConfirm(false)} className="border-slate-300">Cancel</Button>
          <Button onClick={handleProceedPayment} disabled={creatingListing} className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white">
            {creatingListing ? 'Processing...' : 'Proceed to Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default ReviewUnitForListing;
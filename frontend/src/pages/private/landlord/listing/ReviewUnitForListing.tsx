import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Star, Home, MapPin, CreditCard, Edit2, Sparkles, Clock, Calendar, HelpCircle, ExternalLink } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { getUnitForListingReviewRequest, createListingWithPaymentRequest, cancelListingPaymentRequest, getLandlordListingsRequest } from '@/api/landlord/listingApi';
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
  targetPrice: number;
  unitCondition: 'GOOD' | 'FAIR' | 'POOR' | string;
  createdAt: string;
  updatedAt: string;
}

interface ReviewData {
  unit: Unit;
  property: Property;
}

interface PaymentSuccessPayload {
  providerName: string;
  providerTxnId: string;
  paymentAmount: number;
  payerPhone: string;
  listingId?: string;
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

      const response = await createListingWithPaymentRequest(unitId, payload);
      
      if (response.data.checkoutUrl && response.data.paymentDetails) {
        const { checkoutUrl, paymentDetails, listingId } = response.data;
        const paymentSuccessPayload: PaymentSuccessPayload = {
          providerName: paymentDetails.providerName || 'paymongo',
          providerTxnId: paymentDetails.providerTxnId,
          paymentAmount: paymentDetails.paymentAmount,
          payerPhone: paymentDetails.payerPhone,
          listingId: listingId
        };
        localStorage.setItem('pendingPaymentSuccess', JSON.stringify(paymentSuccessPayload));
        window.location.href = checkoutUrl;
      } else if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      }
    } catch (err) {
      setCreateError('Failed to create listing');
      console.error('Error creating listing:', err);
    } finally {
      setCreatingListing(false);
      setShowConfirm(false);
    }
  };



  const handleBack = () => {
    navigate(-1);
  };

  const formatAddress = (property: Property) => {
    return `${property.street}, ${property.barangay}, ${property.zipCode}`;
  };

  const formatDateLong = (isoDate: string) => {
    try {
      return new Date(isoDate).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return isoDate;
    }
  };

  const handleCancelListing = useCallback(async (listingId: string) => {
    try {
      await cancelListingPaymentRequest(listingId);
      
      // Remove cancel param from URL without refresh
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('cancel');
      setSearchParams(newSearchParams, { replace: true });
    } catch (err) {
      console.error('Error canceling listing:', err);
      // Still remove param even on error
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('cancel');
      setSearchParams(newSearchParams, { replace: true });
    } 
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!unitId) return;
    
    fetchReviewData();
  }, [unitId]);

  useEffect(() => {
    if (!unitId) return;
    
    // Check for cancel parameter separately to avoid refresh
    const cancelParam = searchParams.get('cancel');
    if (cancelParam && cancelParam === unitId) {
      // Find pending listing for this unit
      const findAndCancelListing = async () => {
        try {
          const listingsResponse = await getLandlordListingsRequest();
          const listings = listingsResponse.data.listings || [];
          
          // Find listing for this unit in WAITING_PAYMENT status
          const pendingListing = listings.find(
            (listing: any) => 
              listing.unit?.id === unitId && 
              listing.lifecycleStatus === 'WAITING_PAYMENT'
          );
          
          if (pendingListing?.id) {
            await handleCancelListing(pendingListing.id);
          } else {
            // Just remove param if no pending listing found
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete('cancel');
            setSearchParams(newSearchParams, { replace: true });
          }
        } catch (err) {
          console.error('Error finding listing:', err);
          // Remove param on error
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.delete('cancel');
          setSearchParams(newSearchParams, { replace: true });
        }
      };
      
      findAndCancelListing();
    }
  }, [unitId, searchParams, handleCancelListing, setSearchParams]);

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-6xl mx-auto space-y-6">
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
        <div className="max-w-6xl mx-auto">
          <Card className="border-red-200 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-red-800 mb-4">{error || 'Unit not found'}</p>
                <Button onClick={handleBack} variant="outline" className="mr-2">
                  Go Back
                </Button>
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

  return (<>
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader
          title="Review Unit for Listing"
          description="Preview details, choose visibility, and publish with confidence"
          className="mb-2"
        />
        {/* Hero Header removed per request */}

        {/* Primary CTA banner removed; a single sticky action button is provided at the bottom */}

        {/* Key Information + Publish block */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
          {/* Key Information - High importance */}
          <Card className={`lg:col-span-2 bg-white/90 backdrop-blur border-slate-200 shadow-sm`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-slate-900">Key Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Unit */}
                <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm`}>
                  <div className="text-[11px] text-slate-600 mb-4 font-semibold uppercase tracking-wide">Unit</div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-700 grid place-items-center shadow-sm">
                        <Home className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-0.5">Label</div>
                        <div className="font-semibold text-lg text-slate-900">{unit.label}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-700 grid place-items-center shadow-sm">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-0.5">Monthly rate</div>
                        <div className="font-semibold text-xl text-slate-900">₱{unit.targetPrice.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-sky-50 text-sky-700 grid place-items-center shadow-sm">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-0.5">Created</div>
                        <div className="font-medium text-sm text-slate-900">{formatDateLong(unit.createdAt)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-700 grid place-items-center shadow-sm">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-0.5">Last Updated</div>
                        <div className="font-medium text-sm text-slate-900">{formatDateLong(unit.updatedAt)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Property */}
                <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm`}>
                  <div className="text-[11px] text-slate-600 mb-4 font-semibold uppercase tracking-wide">Property</div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-700 grid place-items-center shadow-sm">
                        <Home className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-0.5">Title</div>
                        <div className="font-semibold text-lg text-slate-900">{property.title}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-700 grid place-items-center shadow-sm">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-0.5">Address</div>
                        <div className="font-medium text-sm text-slate-900 leading-relaxed">{formatAddress(property)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Publish CTA (separate card on the right, same block) */}
          <Card className={`lg:col-span-2 h-full border-slate-200 bg-white shadow-sm`}>
            <CardContent className="p-5 h-full flex flex-col justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-slate-900 text-base font-semibold">Publish Your Unit</h3>
                      <p className="text-[11px] text-slate-600">Make your listing visible to renters</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/privacy-policy')}
                    className="flex items-center gap-2 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  >
                    <HelpCircle className="h-3 w-3" />
                    Learn More
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>


                {/* Pricing Options - Selectable */}
                <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
                  <div className="pb-2 border-b border-slate-100">
                    <p className="text-[11px] font-medium text-slate-700 uppercase tracking-wide">Select Pricing Option</p>
                  </div>
                  
                  {/* Normal Listing Option */}
                  <button
                    onClick={() => setIsFeatured(false)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all border focus:outline-none ${
                      !isFeatured
                        ? 'border-emerald-500 ring-2 ring-emerald-100'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                    aria-pressed={!isFeatured}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-4 w-4 rounded-full border ${!isFeatured ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-white'} transition-colors`} />
                      <div>
                        <span className={`text-xs font-medium block ${!isFeatured ? 'text-emerald-800' : 'text-slate-900'}`}>
                          Normal Listing
                        </span>
                        <p className={`text-[11px] mt-0.5 ${!isFeatured ? 'text-emerald-700' : 'text-slate-600'}`}>Standard visibility</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${!isFeatured ? 'text-emerald-800' : 'text-slate-900'}`}>₱100</span>
                    </div>
                  </button>

                  {/* Featured Listing Option */}
                  <button
                    onClick={() => setIsFeatured(true)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all border focus:outline-none ${
                      isFeatured
                        ? 'border-emerald-500 ring-2 ring-emerald-100'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
                    aria-pressed={isFeatured}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`h-4 w-4 rounded-full border ${isFeatured ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300 bg-white'} transition-colors`} />
                      <div>
                        <span className={`text-xs font-medium flex items-center gap-1 ${isFeatured ? 'text-emerald-800' : 'text-slate-900'}`}>
                          <Star className={`h-3 w-3 ${isFeatured ? 'text-emerald-700' : 'text-slate-700'}`} />
                          Featured Listing
                        </span>
                        <p className={`text-[11px] mt-0.5 ${isFeatured ? 'text-emerald-700' : 'text-slate-600'}`}>Premium placement</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${isFeatured ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>Recommended</span>
                      <span className={`text-sm font-semibold ${isFeatured ? 'text-emerald-800' : 'text-slate-900'}`}>₱150</span>
                    </div>
                  </button>

                  <p className="text-[11px] text-slate-600 pt-2 border-t border-slate-100">Click to select your listing type. Featured listings appear in boosted sections and get priority in search results.</p>
                </div>

                {/* Agreement */}
                <div className="rounded-md border border-slate-200 bg-white p-3 space-y-2">
                  <label className="flex items-start gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    <span className="text-xs text-slate-700">
                      I have read and agree to the pricing and listing terms, including a 90-day publication period and content guidelines. See our{' '}
                      <a 
                        href="/privacy-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-900 underline underline-offset-2"
                      >
                        privacy policy
                      </a>.
                    </span>
                  </label>
                </div>

                {/* Edit Unit Link */}
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs text-slate-700 mb-2">Please review all information before publishing. This listing will be visible publicly.</p>
                  <button
                    onClick={() => navigate(`/landlord/units/${unit.id}/edit`)}
                    className="group flex items-center gap-1.5 text-xs font-medium text-slate-900 hover:text-slate-700 transition-colors w-full"
                  >
                    <Edit2 className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    <span className="underline decoration-slate-300 group-hover:decoration-slate-500">Edit unit information</span>
                  </button>
                </div>

                {createError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">{createError}</p>
                  </div>
                )}
              </div>

              <Button 
                onClick={handleCreateListing}
                disabled={creatingListing || !agreed}
                className="w-full h-12 px-6 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
              >
                {creatingListing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Proceed to Payment
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
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

    
  </>);
};

export default ReviewUnitForListing;
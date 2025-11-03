import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Star, Home, MapPin, CreditCard, Edit2, Sparkles, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { getUnitForListingReviewRequest, createListingWithPaymentRequest, cancelListingPaymentRequest, getLandlordListingsRequest } from '@/api/landlord/listingApi';
import { Card, CardContent,  CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
  const [createError, setCreateError] = useState<string | null>(null);
  const [cancelingListing, setCancelingListing] = useState(false);

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

    // Simple confirmation
    const confirmed = window.confirm(
      `Are you sure you want to proceed to payment for ${isFeatured ? 'Featured' : 'Normal'} listing? This will redirect you to the payment page.`
    );
    
    if (!confirmed) return;

    try {
      setCreatingListing(true);
      setCreateError(null);
      
      const payload = {
        isFeatured: isFeatured
      };

      const response = await createListingWithPaymentRequest(unitId, payload);
      
      // Extract payment details from PayMongo response
      if (response.data.checkoutUrl && response.data.paymentDetails) {
        const { checkoutUrl, paymentDetails, listingId } = response.data;
        
        // Prepare payment success payload
        const paymentSuccessPayload: PaymentSuccessPayload = {
          providerName: paymentDetails.providerName || 'paymongo',
          providerTxnId: paymentDetails.providerTxnId,
          paymentAmount: paymentDetails.paymentAmount,
          payerPhone: paymentDetails.payerPhone,
          listingId: listingId
        };

        // Store payment details for success page
        localStorage.setItem('pendingPaymentSuccess', JSON.stringify(paymentSuccessPayload));
        
        // Redirect to checkout URL
        window.location.href = checkoutUrl;
      } else {
        // Fallback if payment details aren't in the expected format
        if (response.data.checkoutUrl) {
          window.location.href = response.data.checkoutUrl;
        }
      }
      
    } catch (err) {
      setCreateError('Failed to create listing');
      console.error('Error creating listing:', err);
    } finally {
      setCreatingListing(false);
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
      setCancelingListing(true);
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
    } finally {
      setCancelingListing(false);
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
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 h-96"></div>
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 h-96"></div>
            </div>
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

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <PageHeader
          title="Review Unit for Listing"
          description="Preview your unit and confirm key details before publishing"
          className="mb-2"
        />
        {/* Hero Header removed per request */}

        {/* Primary CTA banner removed; a single sticky action button is provided at the bottom */}

        {/* Key Information + Publish block */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
          {/* Key Information - High importance */}
          <Card className="lg:col-span-2 bg-white/85 backdrop-blur border-emerald-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-slate-900">Key Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Unit */}
                <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-5 shadow-sm">
                  <div className="text-xs text-emerald-700 mb-4 font-bold uppercase tracking-wide">Unit</div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 grid place-items-center shadow-sm">
                        <Home className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-0.5">Label</div>
                        <div className="font-bold text-lg text-emerald-900">{unit.label}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 grid place-items-center shadow-sm">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-0.5">Monthly rate</div>
                        <div className="font-extrabold text-xl text-emerald-600">₱{unit.targetPrice.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 grid place-items-center shadow-sm">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-0.5">Created</div>
                        <div className="font-semibold text-sm text-slate-900">{formatDateLong(unit.createdAt)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 grid place-items-center shadow-sm">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-0.5">Last Updated</div>
                        <div className="font-semibold text-sm text-slate-900">{formatDateLong(unit.updatedAt)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Property */}
                <div className="rounded-xl border-2 border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 p-5 shadow-sm">
                  <div className="text-xs text-sky-700 mb-4 font-bold uppercase tracking-wide">Property</div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-sky-100 text-sky-700 grid place-items-center shadow-sm">
                        <Home className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-0.5">Title</div>
                        <div className="font-bold text-lg text-sky-900">{property.title}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-sky-100 text-sky-700 grid place-items-center shadow-sm">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 mb-0.5">Address</div>
                        <div className="font-semibold text-sm text-slate-900 leading-relaxed">{formatAddress(property)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Publish CTA (separate card on the right, same block) */}
          <Card className="lg:col-span-2 h-full border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 via-green-50 to-emerald-50 shadow-lg">
            <CardContent className="p-4 h-full flex flex-col justify-between gap-3">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 shadow-sm">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-emerald-900 text-base font-bold">Publish Your Unit</h3>
                    <p className="text-[10px] text-emerald-700/80">Get your listing live and reach potential tenants</p>
                  </div>
                </div>

                <div className="rounded-lg border-2 border-emerald-300 bg-white/90 backdrop-blur-sm p-3 shadow-sm">
                  <div className="flex items-start gap-2">
                    <Clock className="h-3.5 w-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-emerald-900 mb-0.5">90-Day Listing Period</p>
                      <p className="text-[10px] text-emerald-700/80">Your property will be advertised for <span className="font-bold text-emerald-700">3 months</span> starting from publication date.</p>
                    </div>
                  </div>
                </div>

                {/* Pricing Options - Selectable */}
                <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2 shadow-sm">
                  <div className="pb-1.5 border-b border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide mb-1.5">Select Pricing Option</p>
                  </div>
                  
                  {/* Normal Listing Option */}
                  <button
                    onClick={() => setIsFeatured(false)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
                      !isFeatured
                        ? 'bg-emerald-50 border-2 border-emerald-400 shadow-sm'
                        : 'bg-slate-50 border-2 border-transparent hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {!isFeatured && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      )}
                      <div>
                        <span className={`text-xs font-semibold block ${!isFeatured ? 'text-emerald-900' : 'text-slate-900'}`}>
                          Normal Listing
                        </span>
                        <p className="text-[10px] text-slate-500 mt-0.5">Standard visibility</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${!isFeatured ? 'text-emerald-700' : 'text-slate-900'}`}>₱100</span>
                  </button>

                  {/* Featured Listing Option */}
                  <button
                    onClick={() => setIsFeatured(true)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg transition-all ${
                      isFeatured
                        ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-400 shadow-sm'
                        : 'bg-gradient-to-r from-amber-50/50 to-yellow-50/50 border-2 border-transparent hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isFeatured && (
                        <CheckCircle2 className="h-4 w-4 text-amber-600" />
                      )}
                      <div>
                        <span className={`text-xs font-semibold flex items-center gap-1 ${isFeatured ? 'text-amber-900' : 'text-amber-800'}`}>
                          <Star className={`h-3 w-3 ${isFeatured ? 'text-amber-600 fill-amber-600' : 'text-amber-500'}`} />
                          Featured Listing
                        </span>
                        <p className={`text-[10px] mt-0.5 ${isFeatured ? 'text-amber-700' : 'text-amber-600'}`}>Premium placement</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${isFeatured ? 'text-amber-700' : 'text-amber-600'}`}>₱150</span>
                  </button>

                  <p className="text-[10px] text-slate-500 pt-1 border-t border-slate-100">Click to select your listing type. Featured listings appear in boosted sections and get priority in search results.</p>
                </div>


                {/* Terms and Conditions */}
                <div className="rounded-md border border-slate-200 bg-white p-3">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    By clicking <span className="font-semibold">Proceed to Payment</span>, you agree to the{' '}
                    <a 
                      href="/privacy-policy" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 underline decoration-emerald-400/50 hover:decoration-emerald-600 font-medium transition-colors"
                    >
                      listing terms and privacy policy
                    </a>
                    , pricing, and that your unit information will be displayed publicly for 90 days (3 months).
                  </p>
                </div>

                {/* Edit Unit Link */}
                <div className="rounded-lg border border-blue-200 bg-blue-50/80 p-3">
                  <p className="text-xs text-blue-900 mb-2">
                    Please review all information before publishing. This listing will be visible publicly.
                  </p>
                  <button
                    onClick={() => navigate(`/landlord/units/${unit.id}/edit`)}
                    className="group flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-800 transition-colors w-full"
                  >
                    <Edit2 className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    <span className="underline decoration-blue-400/50 hover:decoration-blue-600">Edit unit information</span>
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
                disabled={creatingListing}
                className="w-full h-12 px-6 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
  );
};

export default ReviewUnitForListing;
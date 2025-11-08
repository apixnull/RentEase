import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  MapPin,
  Home,
  Lightbulb,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { getLandlordListingInfoSuccessRequest } from "@/api/landlord/listingApi";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface SuccessUnit { id: string; label: string }
interface SuccessAddress { street: string; barangay: string; zipCode: string; city: string }
interface SuccessProperty { id: string; title: string; address: SuccessAddress }
interface SuccessData { listingId: string; isFeatured: boolean; unit: SuccessUnit; property: SuccessProperty }

const ListingPaymentSuccess = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const [listingData, setListingData] = useState<SuccessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListingData = async () => {
    if (!listingId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getLandlordListingInfoSuccessRequest(listingId);
      setListingData(response.data);
      // Smooth transition delay
      await new Promise((resolve) => setTimeout(resolve, 4000));
    } catch (err) {
      setError("Failed to load listing data");
      console.error("Error fetching listing data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate("/landlord/listing");
  };

  const handleViewDetails = () => {
    if (!listingData) return;
    navigate(`/landlord/listing/${listingData.listingId}/details`);
  };

  const formatAddress = (address: SuccessAddress) => {
    const parts = [address.street, address.barangay, address.zipCode, address.city].filter(Boolean);
    return parts.join(", ");
  };

  useEffect(() => {
    if (listingId) {
      fetchListingData();
    }
  }, [listingId]);

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-72" />
                  <Skeleton className="h-4 w-96" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
              <div className="mt-6">
                <Skeleton className="h-10 w-48 rounded-md" />
              </div>
            </CardContent>
          </Card>
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
                  <Lightbulb className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Unable to Load Listing
                </h3>
                <p className="text-red-600 mb-6">
                  {error || "Listing not found"}
                </p>
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={handleBackToDashboard}
                    variant="outline"
                    className="border-slate-300"
                  >
                    Back to Dashboard
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

  const { unit, property } = listingData;
  const price = listingData.isFeatured ? 150 : 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Navigation */}


        {/* Success Section */}
        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-lg">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Payment Successful</h1>
                <p className="text-slate-700 mt-1">Thank you for purchasing listing.</p>
                <p className="text-slate-600 text-sm mt-1">A copy of this receipt has been sent to your email.</p>

                {/* Receipt */}
                <div className="mt-6 rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-200 p-4">
                    <div>
                      <div className="text-xl font-semibold text-slate-900">RentEase Receipt</div>
                      <div className="text-xs text-slate-500">Official proof of payment</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500">Date</div>
                      <div className="text-sm font-medium text-slate-800">{new Date().toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="p-4 grid gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-slate-900">{unit.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <span className="text-slate-700">{property.title} • {formatAddress(property.address)}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="rounded-md bg-slate-50 p-3">
                        <div className="text-xs text-slate-500">Plan</div>
                        <div className="font-medium text-slate-900">{listingData.isFeatured ? 'Featured' : 'Standard'}</div>
                      </div>
                      <div className="rounded-md bg-slate-50 p-3">
                        <div className="text-xs text-slate-500">Price</div>
                        <div className="font-medium text-slate-900">₱{price.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="rounded-md bg-slate-50 p-3">
                        <div className="text-xs text-slate-500">Listing ID</div>
                        <div className="font-medium text-slate-900 break-all">{listingData.listingId}</div>
                      </div>
                      <div className="rounded-md bg-slate-50 p-3">
                        <div className="text-xs text-slate-500">Payment Status</div>
                        <div className="font-medium text-emerald-700">Paid</div>
                      </div>
                      <div className="rounded-md bg-slate-50 p-3">
                        <div className="text-xs text-slate-500">Merchant</div>
                        <div className="font-medium text-slate-900">RentEase</div>
                      </div>
                    </div>
                    {/* Benefit and duration notes */}
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className={`rounded-md p-3 border ${listingData.isFeatured ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div className="text-xs text-slate-500">Listing Style</div>
                        <div className={`text-sm font-medium ${listingData.isFeatured ? 'text-emerald-800' : 'text-slate-900'}`}>
                          {listingData.isFeatured ? 'Premium style with boosted placement' : 'Standard visibility'}
                        </div>
                      </div>
                      <div className="rounded-md p-3 border bg-slate-50 border-slate-200">
                        <div className="text-xs text-slate-500">Duration</div>
                        <div className="text-sm font-medium text-slate-900">Displayed for 90 days</div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-dashed border-slate-200" />
                  <div className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-slate-500">Thank you for choosing RentEase!</div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => navigate('/privacy-policy')}
                        className="flex items-center gap-2 text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                      >
                        <HelpCircle className="h-3 w-3" />
                        Learn More About Listings
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      <Button onClick={handleViewDetails} className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white">
                        See listing details
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Receipt-only page; removed additional learn more and next steps */}
      </div>
    </div>
  );
};

export default ListingPaymentSuccess;


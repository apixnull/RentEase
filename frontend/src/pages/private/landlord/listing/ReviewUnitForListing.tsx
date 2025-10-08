import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Building, Users, Shield, Camera, Home, CheckCircle } from 'lucide-react';
import { getUnitForListingReviewRequest, createListingWithPaymentRequest } from '@/api/landlord/listingApi';
import { Card, CardContent,  CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface City {
  name: string;
}

interface Property {
  id: string;
  title: string;
  type: string;
  street: string;
  barangay: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  mainImageUrl: string;
  nearInstitutions: string;
  city: City;
  municipality: null;
}

interface Amenity {
  id: string;
  name: string;
  category: string;
}

interface UnitLeaseRule {
  text: string;
  category: string;
}

interface Unit {
  id: string;
  label: string;
  description: string;
  status: string;
  floorNumber: number;
  maxOccupancy: number;
  targetPrice: number;
  securityDeposit: number;
  requiresScreening: boolean;
  mainImageUrl: string;
  otherImages: string[];
  unitLeaseRules: UnitLeaseRule[];
  createdAt: string;
  updatedAt: string;
  amenities: Amenity[];
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
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [creatingListing, setCreatingListing] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

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
    return `${property.street}, ${property.barangay}, ${property.city.name}, ${property.zipCode}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Utility': return '⚡';
      case 'Facility': return '🏢';
      case 'Kitchen': return '👨‍🍳';
      case 'Room Feature': return '🛏️';
      case 'Security': return '🔒';
      case 'Service': return '🧹';
      default: return '✅';
    }
  };

  const groupAmenitiesByCategory = (amenities: Amenity[]) => {
    return amenities.reduce((acc, amenity) => {
      if (!acc[amenity.category]) {
        acc[amenity.category] = [];
      }
      acc[amenity.category].push(amenity);
      return acc;
    }, {} as Record<string, Amenity[]>);
  };

  const groupLeaseRulesByCategory = (rules: UnitLeaseRule[]) => {
    return rules.reduce((acc, rule) => {
      if (!acc[rule.category]) {
        acc[rule.category] = [];
      }
      acc[rule.category].push(rule);
      return acc;
    }, {} as Record<string, UnitLeaseRule[]>);
  };

  useEffect(() => {
    if (unitId) {
      fetchReviewData();
    }
  }, [unitId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 h-96"></div>
              <div className="bg-white rounded-xl shadow-sm p-6 h-96"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !reviewData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
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
  const groupedAmenities = groupAmenitiesByCategory(unit.amenities);
  const groupedLeaseRules = groupLeaseRulesByCategory(unit.unitLeaseRules);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={handleBack} className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-slate-200">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Review Your Listing</h1>
            <p className="text-slate-600 text-sm">Preview your unit details before publishing</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Images and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  {unit.mainImageUrl ? (
                    <img
                      src={unit.mainImageUrl}
                      alt={unit.label}
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                      <Camera className="h-12 w-12 text-slate-400" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 backdrop-blur-sm text-slate-800 border-slate-200 shadow-sm">
                      {unit.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-1">{unit.label}</h2>
                      <p className="text-slate-600">{unit.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">₱{unit.targetPrice.toLocaleString()}</p>
                      <p className="text-sm text-slate-500">per month</p>
                    </div>
                  </div>

                  {/* Key Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <Building className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs text-slate-600">Floor</p>
                      <p className="font-semibold text-slate-900">{unit.floorNumber}</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                      <Users className="h-5 w-5 text-green-600 mx-auto mb-1" />
                      <p className="text-xs text-slate-600">Max Occupancy</p>
                      <p className="font-semibold text-slate-900">{unit.maxOccupancy}</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                      <Home className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                      <p className="text-xs text-slate-600">Unit Type</p>
                      <p className="font-semibold text-slate-900 capitalize">{property.type.toLowerCase()}</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                      <Shield className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                      <p className="text-xs text-slate-600">Screening</p>
                      <p className="font-semibold text-slate-900">
                        {unit.requiresScreening ? 'Required' : 'Not Required'}
                      </p>
                    </div>
                  </div>

                  {/* Additional Images */}
                  {unit.otherImages && unit.otherImages.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-base font-semibold mb-3 text-slate-900">Additional Photos</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {unit.otherImages.slice(0, 6).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`${unit.label} photo ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-slate-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Amenities */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-slate-900">Amenities & Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(groupedAmenities).map(([category, amenities]) => (
                    <div key={category} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                      <h4 className="font-semibold text-slate-900 mb-2 text-sm">
                        {getCategoryIcon(category)} {category}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {amenities.map((amenity) => (
                          <div key={amenity.id} className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded transition-colors">
                            <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                            <span className="text-slate-700 text-sm">{amenity.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Lease Rules */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-slate-900">House Rules & Policies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(groupedLeaseRules).map(([category, rules]) => (
                    <div key={category} className="border-b border-slate-100 last:border-0 pb-3 last:pb-0">
                      <h4 className="font-semibold text-slate-900 mb-2 capitalize text-sm">
                        {category} Rules
                      </h4>
                      <ul className="space-y-1">
                        {rules.map((rule, index) => (
                          <li key={index} className="flex items-start gap-2 p-1 hover:bg-slate-50 rounded transition-colors">
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-1.5 flex-shrink-0"></div>
                            <span className="text-slate-700 text-sm">{rule.text}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Property Info and Actions */}
          <div className="space-y-6">
            {/* Property Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-slate-900">Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{property.title}</h3>
                  <p className="text-slate-600 text-sm capitalize">{property.type.toLowerCase()}</p>
                </div>
                
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-900 mb-1">Complete Address</p>
                    <p className="text-sm text-slate-600 leading-relaxed">{formatAddress(property)}</p>
                  </div>
                </div>

                {property.nearInstitutions && (
                  <div>
                    <p className="text-sm font-medium text-slate-900 mb-1">Nearby Institutions</p>
                    <div className="flex flex-wrap gap-1">
                      {JSON.parse(property.nearInstitutions).slice(0, 4).map((inst: any, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                          {inst.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-sm sticky top-6">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <p className="text-lg font-semibold text-slate-900">Ready to Publish?</p>
                    <p className="text-slate-600 text-sm">Review all details carefully before proceeding</p>
                  </div>
                  
                  <Button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 font-semibold"
                    size="lg"
                  >
                    Proceed to Payment
                  </Button>
                  
                  <p className="text-xs text-slate-500">
                    By proceeding, you agree to our terms and privacy policy
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create Listing Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-md bg-white/90 backdrop-blur-sm border-slate-200 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-lg text-slate-900">Finalize Your Listing</DialogTitle>
              <DialogDescription className="text-slate-600 text-sm">
                Choose your listing options and proceed to payment
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Featured Listing Option */}
              <div className="flex items-start space-x-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <Checkbox 
                  id="featured" 
                  checked={isFeatured}
                  onCheckedChange={(checked) => setIsFeatured(checked as boolean)}
                  className="mt-0.5 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                />
                <div className="grid gap-1">
                  <Label htmlFor="featured" className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
                    <Star className="h-4 w-4 text-amber-600 fill-amber-600" />
                    Feature this listing
                  </Label>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Get premium visibility in search results and recommendations. Your listing will stand out to more potential tenants.
                  </p>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-0.5">
                      Payment Required
                    </p>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      {isFeatured ? 
                        'You will be redirected to complete the featured listing payment.' : 
                        'You will be redirected to complete the listing payment.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              {createError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{createError}</p>
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsCreateModalOpen(false)}
                disabled={creatingListing}
                className="sm:flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Review Again
              </Button>
              <Button 
                onClick={handleCreateListing}
                disabled={creatingListing}
                className="sm:flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {creatingListing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Proceed to Payment'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ReviewUnitForListing;
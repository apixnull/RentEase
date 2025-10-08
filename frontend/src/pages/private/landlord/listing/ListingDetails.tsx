import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Eye, 
  Star, 
  MapPin, 
  Building, 
  Users, 
  Shield, 
  Home, 
  Calendar,
  TrendingUp,
  Lightbulb,
  ShieldCheck,
  BadgeCheck,
  CreditCard,
  Zap,
  Target,
  Edit,
  Share,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { getLandlordSpecificListingRequest } from '@/api/landlord/listingApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface City {
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
  mainImageUrl: string;
  otherImages: string[];
  unitLeaseRules: UnitLeaseRule[];
  targetPrice: number;
  securityDeposit: number;
  requiresScreening: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  amenities: Amenity[];
  property: Property;
}

interface AiAnalysis {
  part: string;
  description: string;
}

interface AiRecommendation {
  part: string;
  suggestion: string;
}

interface ListingData {
  id: string;
  lifecycleStatus: string;
  expiresAt: string;
  isFeatured: boolean;
  riskLevel: string;
  riskReason: string;
  aiAnalysis: AiAnalysis[];
  aiRecommendations: AiRecommendation[];
  providerName: string;
  providerTxnId: string;
  paymentAmount: number;
  paymentDate: string;
  payerPhone: string;
  blockedAt: string | null;
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
  const [activeImage, setActiveImage] = useState(0);

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

  const handleEdit = () => {
    navigate(`/landlord/listing/${listingId}/edit`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };



  const formatAddress = (property: Property) => {
    return `${property.street}, ${property.barangay}, ${property.city.name}, ${property.zipCode}`;
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VISIBLE': return 'bg-green-100 text-green-800 border-green-200';
      case 'HIDDEN': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'EXPIRED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUnitStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800 border-green-200';
      case 'OCCUPIED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const parseNearInstitutions = (nearInstitutions: string) => {
    try {
      return JSON.parse(nearInstitutions);
    } catch {
      return [];
    }
  };

  const getDaysUntilExpiry = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
    if (listingId) {
      fetchListingData();
    }
  }, [listingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-green-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 h-96"></div>
              <div className="bg-white rounded-xl shadow-sm p-6 h-96"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 p-6">
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
  const nearInstitutions = parseNearInstitutions(property.nearInstitutions);
  const daysUntilExpiry = getDaysUntilExpiry(listingData.expiresAt);
  const groupedAmenities = groupAmenitiesByCategory(unit.amenities);
  const groupedLeaseRules = groupLeaseRulesByCategory(unit.unitLeaseRules);
  const allImages = [unit.mainImageUrl, ...unit.otherImages];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleBack} 
              className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border-slate-200 hover:bg-white shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Listing Details</h1>
              <p className="text-slate-600">Manage and monitor your property listing</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border-slate-200 hover:bg-white shadow-sm"
            >
              <Share className="h-4 w-4" />
              Share
            </Button>
            <Button 
              onClick={handleEdit}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-sm"
            >
              <Edit className="h-4 w-4" />
              Edit Listing
            </Button>
          </div>
        </div>

        {/* Status Banner */}
        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(listingData.lifecycleStatus) + " text-sm py-1.5 px-3"}>
                    {listingData.lifecycleStatus}
                  </Badge>
                  <Badge className={getUnitStatusColor(unit.status) + " text-sm py-1.5 px-3"}>
                    {unit.status}
                  </Badge>
                  {listingData.isFeatured && (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-sm py-1.5 px-3 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-600" />
                      Featured
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{unit.viewCount} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Expires in {daysUntilExpiry} days</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images Gallery */}
            <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
              <CardContent className="p-0">
                <div className="relative">
                  {/* Main Image */}
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    {allImages[activeImage] ? (
                      <img
                        src={allImages[activeImage]}
                        alt={`${unit.label} - Image ${activeImage + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                        <Home className="h-12 w-12 text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Image Thumbnails */}
                  {allImages.length > 1 && (
                    <div className="p-4">
                      <div className="flex gap-2 overflow-x-auto">
                        {allImages.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setActiveImage(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                              activeImage === index 
                                ? 'border-green-500' 
                                : 'border-slate-200'
                            }`}
                          >
                            <img
                              src={image}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-slate-100/50 p-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-white">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="amenities" className="data-[state=active]:bg-white">
                  Amenities
                </TabsTrigger>
                <TabsTrigger value="rules" className="data-[state=active]:bg-white">
                  House Rules
                </TabsTrigger>
                <TabsTrigger value="analysis" className="data-[state=active]:bg-white">
                  AI Analysis
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Unit Details */}
                <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                      <Home className="h-5 w-5 text-blue-600" />
                      Unit Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-900 text-xl">{unit.label}</h3>
                      <p className="text-slate-600 mt-1">{unit.description}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <Building className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-600">Floor</p>
                        <p className="font-semibold text-slate-900">{unit.floorNumber}</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                        <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-600">Max Occupancy</p>
                        <p className="font-semibold text-slate-900">{unit.maxOccupancy}</p>
                      </div>
                      <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <Target className="h-6 w-6 text-amber-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-600">Monthly Price</p>
                        <p className="font-semibold text-slate-900">₱{unit.targetPrice.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <Shield className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-600">Deposit</p>
                        <p className="font-semibold text-slate-900">₱{unit.securityDeposit.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                      <Shield className="h-4 w-4 text-slate-600" />
                      <span className="text-sm text-slate-700">
                        Tenant screening: {unit.requiresScreening ? 'Required' : 'Not required'}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Property Details */}
                <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                      <MapPin className="h-5 w-5 text-green-600" />
                      Property Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">{property.title}</h3>
                      <Badge variant="outline" className="mt-1 bg-slate-100 text-slate-700 capitalize">
                        {property.type.toLowerCase()}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-900">Complete Address</p>
                      <p className="text-slate-600 leading-relaxed">{formatAddress(property)}</p>
                    </div>

                    {nearInstitutions.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-slate-900 mb-2">Nearby Institutions</p>
                        <div className="flex flex-wrap gap-2">
                          {nearInstitutions.map((inst: any, index: number) => (
                            <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                              {inst.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Amenities Tab */}
              <TabsContent value="amenities" className="space-y-6">
                <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-900">Amenities & Features</CardTitle>
                    <CardDescription>
                      All amenities included with this unit
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {Object.entries(groupedAmenities).map(([category, amenities]) => (
                        <div key={category} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                          <h4 className="font-semibold text-slate-900 mb-3 text-lg">{category}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {amenities.map((amenity) => (
                              <div key={amenity.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <span className="text-slate-700">{amenity.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* House Rules Tab */}
              <TabsContent value="rules" className="space-y-6">
                <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg text-slate-900">House Rules & Policies</CardTitle>
                    <CardDescription>
                      Rules and guidelines for tenants
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {Object.entries(groupedLeaseRules).map(([category, rules]) => (
                        <div key={category} className="border-b border-slate-100 last:border-0 pb-4 last:pb-0">
                          <h4 className="font-semibold text-slate-900 mb-3 capitalize text-lg">
                            {category} Rules
                          </h4>
                          <ul className="space-y-2">
                            {rules.map((rule, index) => (
                              <li key={index} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                                <div className="w-2 h-2 bg-slate-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="text-slate-700">{rule.text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* AI Analysis Tab */}
              <TabsContent value="analysis" className="space-y-6">
                {/* AI Analysis */}
                <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      AI Quality Analysis
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      Automated assessment of your listing quality
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Risk Assessment */}
                      <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200">
                          <ShieldCheck className="h-5 w-5 text-slate-700" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-slate-900">Risk Assessment</span>
                            <Badge className={getRiskLevelColor(listingData.riskLevel) + " shadow-sm"}>
                              {listingData.riskLevel} Risk
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed">{listingData.riskReason}</p>
                        </div>
                      </div>

                      {/* Analysis Points */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {listingData.aiAnalysis.map((analysis, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:shadow-sm transition-shadow">
                            <BadgeCheck className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-slate-900 text-sm capitalize">{analysis.part}</p>
                              <p className="text-xs text-slate-600 mt-1">{analysis.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Recommendations */}
                {listingData.aiRecommendations.length > 0 && (
                  <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                        <Lightbulb className="h-5 w-5 text-amber-600" />
                        Optimization Suggestions
                      </CardTitle>
                      <CardDescription className="text-slate-600">
                        Recommendations to improve your listing performance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {listingData.aiRecommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200 hover:shadow-sm transition-shadow">
                            <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-amber-800 text-xs font-bold">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-amber-900 text-sm capitalize">{recommendation.part}</p>
                              <p className="text-xs text-amber-800 mt-1 leading-relaxed">{recommendation.suggestion}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Listing Status */}
            <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">Listing Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Status</span>
                    <Badge className={getStatusColor(listingData.lifecycleStatus)}>
                      {listingData.lifecycleStatus}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Unit Status</span>
                    <Badge className={getUnitStatusColor(unit.status)}>
                      {unit.status}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Featured</span>
                    <span className={`text-sm font-medium ${
                      listingData.isFeatured ? 'text-amber-600' : 'text-slate-600'
                    }`}>
                      {listingData.isFeatured ? 'Yes' : 'No'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Expires</span>
                    <span className="text-sm text-slate-700">{formatDate(listingData.expiresAt)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Views</span>
                    <span className="text-sm font-semibold text-slate-900">{unit.viewCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <span className="text-sm text-slate-600">Amount Paid</span>
                    <span className="font-semibold text-green-600">₱{listingData.paymentAmount}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Payment Method</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {listingData.providerName}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Transaction ID</span>
                    <span className="text-xs font-mono text-slate-500 truncate max-w-[100px]">
                      {listingData.providerTxnId}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Date Paid</span>
                    <span className="text-sm text-slate-700">{formatDate(listingData.paymentDate)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Payer Phone</span>
                    <span className="text-sm text-slate-700">{listingData.payerPhone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleEdit}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-sm"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Listing
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm"
                >
                  <Share className="h-4 w-4 mr-2" />
                  Share Listing
                </Button>

                <Button 
                  variant="outline" 
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Boost Listing
                </Button>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">View Count</span>
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4 text-slate-500" />
                      <span className="font-semibold text-slate-900">{unit.viewCount}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Days Active</span>
                    <span className="font-semibold text-slate-900">
                      {Math.ceil((new Date().getTime() - new Date(listingData.createdAt).getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Risk Level</span>
                    <Badge className={getRiskLevelColor(listingData.riskLevel)}>
                      {listingData.riskLevel}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
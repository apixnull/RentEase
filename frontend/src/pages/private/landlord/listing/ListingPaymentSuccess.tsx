import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  ArrowLeft,
  Eye,
  Star,
  MapPin,
  Building,
  Users,
  Shield,
  Home,
  Clock,
  TrendingUp,
  Lightbulb,
  ShieldCheck,
  BadgeCheck,
  Calendar,
  CreditCard,
  Target,
  Zap,
  ArrowRight,
} from "lucide-react";
import { getLandlordSpecificListingRequest } from "@/api/landlord/listingApi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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

const ListingPaymentSuccess = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const [listingData, setListingData] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListingData = async () => {
    if (!listingId) return;

    try {
      setLoading(true);
      setError(null);
      const response = await getLandlordSpecificListingRequest(listingId);
      setListingData(response.data);
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

  const handleViewListing = () => {
    // Navigate to public listing page
    navigate(`/listings/${listingId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAddress = (property: Property) => {
    return `${property.street}, ${property.barangay}, ${property.city.name}`;
  };

  const getRiskLevelColor = (riskLevel?: string | null) => {
    if (!riskLevel) {
      return "bg-gray-100 text-gray-800 border-gray-200";
    }

    switch (riskLevel.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VISIBLE":
        return "bg-green-100 text-green-800 border-green-200";
      case "HIDDEN":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "EXPIRED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
                  <Shield className="h-8 w-8 text-red-600" />
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
                  <Button
                    onClick={fetchListingData}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  >
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handleBackToDashboard}
            className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border-slate-200 hover:bg-white shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </Button>
          <Badge
            className={
              getStatusColor(listingData.lifecycleStatus) + " shadow-sm"
            }
          >
            {listingData.lifecycleStatus}
          </Badge>
        </div>

        {/* Success Hero Section */}
        <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 sm:p-8 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                    Listing Published Successfully!
                  </h1>
                  <p className="text-green-50 text-sm sm:text-base opacity-90">
                    Your listing is now live and visible to potential tenants.
                    Start receiving inquiries today!
                  </p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-2 text-sm mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Expires in {daysUntilExpiry} days</span>
                </div>
                <p className="text-xs opacity-80">
                  on {formatDate(listingData.expiresAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Stats & Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Views</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {unit.viewCount}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Eye className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Monthly Price</p>
                      <p className="text-2xl font-bold text-green-600">
                        ₱{unit.targetPrice.toLocaleString()}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Target className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-600">Status</p>
                      <p className="text-lg font-bold text-slate-900 capitalize">
                        {listingData.lifecycleStatus.toLowerCase()}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Zap className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Unit & Property Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Unit Details */}
              <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                    <Home className="h-5 w-5 text-blue-600" />
                    Unit Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-lg">
                      {unit.label}
                    </h3>
                    <p className="text-slate-600 text-sm mt-1">
                      {unit.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <Building className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs text-slate-600">Floor</p>
                      <p className="font-semibold text-slate-900 text-sm">
                        {unit.floorNumber}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
                      <Users className="h-5 w-5 text-green-600 mx-auto mb-1" />
                      <p className="text-xs text-slate-600">Occupancy</p>
                      <p className="font-semibold text-slate-900 text-sm">
                        {unit.maxOccupancy}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Property Details */}
              <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                    <MapPin className="h-5 w-5 text-green-600" />
                    Property Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {property.title}
                    </h3>
                    <Badge
                      variant="outline"
                      className="mt-1 bg-slate-100 text-slate-700 capitalize"
                    >
                      {property.type.toLowerCase()}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-900">
                      Address
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {formatAddress(property)}
                    </p>
                  </div>

                  {nearInstitutions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-slate-900 mb-2">
                        Nearby Institutions
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {nearInstitutions
                          .slice(0, 3)
                          .map((inst: any, index: number) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-blue-50 text-blue-700 border-blue-200 text-xs"
                            >
                              {inst.name}
                            </Badge>
                          ))}
                        {nearInstitutions.length > 3 && (
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 text-slate-600 border-slate-200 text-xs"
                          >
                            +{nearInstitutions.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* AI Insights Section */}
            <div className="space-y-6">
              {/* AI Analysis */}
              <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    AI Quality Analysis
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Automated assessment of your listing quality and performance
                    potential
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
                          <span className="font-semibold text-slate-900">
                            Risk Assessment
                          </span>
                          <Badge
                            className={
                              getRiskLevelColor(listingData.riskLevel) +
                              " shadow-sm"
                            }
                          >
                            {listingData.riskLevel} Risk
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">
                          {listingData.riskReason}
                        </p>
                      </div>
                    </div>

                    {/* Analysis Points */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {listingData.aiAnalysis.map((analysis, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-200 hover:shadow-sm transition-shadow"
                        >
                          <BadgeCheck className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-slate-900 text-sm capitalize">
                              {analysis.part}
                            </p>
                            <p className="text-xs text-slate-600 mt-1">
                              {analysis.description}
                            </p>
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
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                      <Lightbulb className="h-5 w-5 text-amber-600" />
                      Optimization Suggestions
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                      Recommendations to improve your listing performance and
                      visibility
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {listingData.aiRecommendations.map(
                        (recommendation, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200 hover:shadow-sm transition-shadow"
                          >
                            <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-amber-800 text-xs font-bold">
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-amber-900 text-sm capitalize">
                                {recommendation.part}
                              </p>
                              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                                {recommendation.suggestion}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Payment Success Card */}
            <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg text-slate-900">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  Payment Confirmed
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                  <span className="text-sm text-slate-600">Amount Paid</span>
                  <span className="font-semibold text-green-600 text-lg">
                    ₱{listingData.paymentAmount}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">
                      Payment Method
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200"
                    >
                      {listingData.providerName}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">
                      Transaction ID
                    </span>
                    <span className="text-xs font-mono text-slate-500 truncate max-w-[100px]">
                      {listingData.providerTxnId}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Date Paid</span>
                    <span className="text-sm text-slate-700">
                      {formatDate(listingData.paymentDate)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Payer Phone</span>
                    <span className="text-sm text-slate-700">
                      {listingData.payerPhone}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Center */}
            <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-slate-900">
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleViewListing}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white shadow-sm"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Live Listing
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Share Listing
                </Button>

                {listingData.isFeatured && (
                  <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                    <Star className="h-4 w-4 text-amber-600 fill-amber-600" />
                    <span className="text-sm font-medium text-amber-800">
                      Featured Listing Active
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Tips */}
            <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-slate-900">
                  Boost Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Eye className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">
                      Monitor Analytics
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      Track views and engagement metrics regularly
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">
                      Quick Responses
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      Reply to inquiries within 2 hours for better conversion
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">
                      Update Regularly
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      Refresh photos and details every 2 weeks
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-slate-200 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-sm text-slate-700 mb-2">
                  Need help with your listing?
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingPaymentSuccess;

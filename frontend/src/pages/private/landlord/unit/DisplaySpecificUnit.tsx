import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Users,
  Star,
  Shield,
  CheckCircle,
  Home,
  DollarSign,
  Image as ImageIcon,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  Globe,
  Zap,
  Loader2,
  Building,
  Calendar,
  UserCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getUnitDetailsRequest } from "@/api/landlord/unitApi";

// Types based on your backend response
type Amenity = {
  id: string;
  name: string;
  category: string;
};

type UnitLeaseRule = {
  text: string;
  category: string;
};

type ReviewSummary = {
  total: number;
  average: number;
  stars: number;
};

type UnitReview = {
  id: string;
  tenantId: string;
  unitId: string;
  leaseId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
};

type UnitDetails = {
  id: string;
  propertyId: string;
  label: string;
  description: string;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  floorNumber: number | null;
  createdAt: string;
  updatedAt: string;
  maxOccupancy: number;
  mainImageUrl: string;
  otherImages: string[] | null;
  unitLeaseRules: UnitLeaseRule[] | null;
  viewCount: number;
  targetPrice: number;
  securityDeposit: number | null;
  requiresScreening: boolean;
  listedAt: string | null;
  amenities: Amenity[] | null;
  reviews: UnitReview[];
  reviewsSummary: ReviewSummary;
  property: {
    id: string;
    title: string;
    address: string;
  };
  isListed: boolean;
};

// Lease rule categories for grouping
const leaseRuleCategories = [
  { id: "general", name: "General Policies" },
  { id: "visitor", name: "Visitor Policies" },
  { id: "payment", name: "Payment Policies" },
  { id: "maintenance", name: "Maintenance Policies" },
  { id: "safety", name: "Safety Policies" },
  { id: "noise", name: "Noise Policies" },
  { id: "pet", name: "Pet Policies" },
  { id: "cleaning", name: "Cleaning Policies" },
  { id: "parking", name: "Parking Policies" },
  { id: "other", name: "Other Policies" },
];

const DisplaySpecificUnit = () => {
  const { unitId, propertyId } = useParams<{ unitId: string; propertyId: string }>();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(0);
  const [unit, setUnit] = useState<UnitDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch unit details
  useEffect(() => {
    const fetchUnitDetails = async () => {
      if (!propertyId || !unitId) {
        setError("Property ID or Unit ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getUnitDetailsRequest(unitId);
        setUnit(response.data);
      } catch (err) {
        console.error('Error fetching unit details:', err);
        setError('Failed to load unit details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUnitDetails();
  }, [propertyId, unitId]);

  // Group amenities by category - handle nullable amenities
  const groupedAmenities = unit?.amenities?.reduce((acc, amenity) => {
    if (!acc[amenity.category]) {
      acc[amenity.category] = [];
    }
    acc[amenity.category].push(amenity);
    return acc;
  }, {} as Record<string, Amenity[]>) || {};

  // Group lease rules by category - handle nullable lease rules
  const groupedLeaseRules = unit?.unitLeaseRules?.reduce((acc, rule) => {
    if (!acc[rule.category]) {
      acc[rule.category] = [];
    }
    acc[rule.category].push(rule);
    return acc;
  }, {} as Record<string, UnitLeaseRule[]>) || {};

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format date with time
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle edit unit
  const handleEdit = () => {
    navigate(`/landlord/units/${unitId}/edit`);
  };

  // Handle delete unit
  const handleDelete = () => {
    // In real app, this would call an API
    console.log('Deleting unit:', unitId);
    // After successful deletion, navigate back to property units
    if (unit) {
      navigate(`/landlord/units/${unit.propertyId}`);
    }
  };

  // Change unit status
  const changeStatus = (newStatus: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE") => {
    if (unit) {
      setUnit(prev => prev ? {
        ...prev,
        status: newStatus
      } : null);
      // In real app, this would call an API
    }
  };

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  // Get all images including main and others (handle nullable otherImages)
  const allImages = unit ? [unit.mainImageUrl, ...(unit.otherImages || [])] : [];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-green-600" />
            <p className="mt-2 text-gray-600">Loading unit details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !unit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <Link to={`/landlord/properties/${propertyId}?tab=units`}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Unit Details</h1>
          </div>
          <Card className="p-8 text-center border-0 shadow-lg">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {error || "Unit not found"}
              </h2>
              <p className="text-gray-600 mb-6">
                {error 
                  ? "There was an error loading the unit details. Please try again." 
                  : "The unit you're looking for doesn't exist or has been removed."
                }
              </p>
              <Button onClick={() => navigate(`/landlord/units/${propertyId}`)}>
                Back to Property Units
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-cyan-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header with Logo and Navigation */}
        <div className="flex items-center justify-between mb-8">
     

          <Link to={`/landlord/units/${unit.propertyId}`}>
            <Button
              variant="ghost"
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg border border-gray-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Units
            </Button>
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="xl:col-span-2 space-y-6">
            {/* Image Gallery Card */}
            <Card className="border-0 shadow-lg overflow-hidden">
              {/* Main Image */}
              <div className="h-64 sm:h-80 md:h-96 bg-gray-100 relative overflow-hidden">
                <img
                  src={allImages[selectedImage]}
                  alt={unit.label}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {selectedImage === 0 ? "Main Image" : `Image ${selectedImage + 1}`}
                </div>
              </div>
              
              {/* Thumbnail Gallery */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Image Gallery ({allImages.length} images)
                  </span>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2">
                  {allImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? "border-green-500 shadow-md scale-105"
                          : "border-transparent hover:border-green-300"
                      } relative group bg-white`}
                    >
                      <img
                        src={image}
                        alt={`${unit.label} ${index === 0 ? "main" : `view ${index}`}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-xs font-medium">
                          {index === 0 ? "Main" : index}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Status & Actions Card */}
            <Card className="border-0 shadow-lg p-6 bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-white shadow-sm">
                    <Building className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {unit.label}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        className={
                          unit.status === "AVAILABLE"
                            ? "bg-green-100 text-green-800 border-green-200"
                            : unit.status === "OCCUPIED"
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : "bg-amber-100 text-amber-800 border-amber-200"
                        }
                      >
                        {unit.status}
                      </Badge>
                      <Badge 
                        className={unit.listedAt ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}
                      >
                        <Globe className="h-3 w-3 mr-1" />
                        {unit.listedAt ? "Listed" : "Unlisted"}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 flex-wrap">

                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => changeStatus("AVAILABLE")}>
                        Mark as Available
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => changeStatus("OCCUPIED")}>
                        Mark as Occupied
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => changeStatus("MAINTENANCE")}>
                        Mark for Maintenance
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {/* Property Info */}
              <div className="flex items-center gap-2 text-gray-600 mt-4 p-3 bg-white rounded-lg border">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">
                  {unit.property.title} • {unit.property.address}
                </span>
              </div>
            </Card>


            {/* Unit Description Card */}
            <Card className="border-0 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-100 to-blue-100 text-green-600">
                  <Home className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Description</h2>
                  <p className="text-gray-600 text-sm">Detailed information about your unit</p>
                </div>
              </div>
              
              <p className="text-gray-700 leading-relaxed text-lg mb-6">{unit.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-600 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <Users className="h-6 w-6" />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Max Occupancy</p>
                  <p className="text-lg font-bold text-gray-900">{unit.maxOccupancy}</p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <Building className="h-6 w-6" />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Floor</p>
                  <p className="text-lg font-bold text-gray-900">
                    {unit.floorNumber ? `Floor ${unit.floorNumber}` : "Ground Floor"}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-600 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <Eye className="h-6 w-6" />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Views</p>
                  <p className="text-lg font-bold text-gray-900">{unit.viewCount}</p>
                </div>
                
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="p-2 rounded-lg bg-green-100 text-green-600 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Created</p>
                  <p className="text-xs font-semibold text-gray-900">
                    {formatDate(unit.createdAt)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Amenities Card */}
            <Card className="border-0 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-100 to-blue-100 text-green-600">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Amenities</h2>
                  <p className="text-gray-600 text-sm">Features and facilities included</p>
                </div>
              </div>

              {!unit.amenities || unit.amenities.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">No amenities added</p>
                  <p className="text-sm">Add amenities to attract more tenants</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={handleEdit}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Add Amenities
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(groupedAmenities).map(([category, categoryAmenities]) => (
                    <div key={category} className="border-2 border-gray-100 rounded-xl p-5 bg-white hover:border-green-200 transition-colors">
                      <h3 className="font-semibold text-gray-900 text-lg mb-4 pb-3 border-b">{category}</h3>
                      <div className="space-y-3">
                        {categoryAmenities.map((amenity) => (
                          <div key={amenity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="text-gray-700 font-medium">{amenity.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Lease Rules Card */}
            <Card className="border-0 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-100 to-blue-100 text-green-600">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Lease Rules</h2>
                  <p className="text-gray-600 text-sm">Policies and guidelines for tenants</p>
                </div>
              </div>

              {!unit.unitLeaseRules || unit.unitLeaseRules.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl">
                  <Shield className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg mb-2">No lease rules specified</p>
                  <p className="text-sm">Add rules to set clear expectations for tenants</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={handleEdit}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Add Lease Rules
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {leaseRuleCategories.map((category) => {
                    const categoryRules = groupedLeaseRules[category.id] || [];
                    if (categoryRules.length === 0) return null;

                    return (
                      <div key={category.id} className="border-2 border-gray-100 rounded-xl p-5 bg-white hover:border-green-200 transition-colors">
                        <h3 className="font-semibold text-gray-900 text-lg mb-4 pb-3 border-b">
                          {category.name}
                        </h3>
                        <div className="space-y-3">
                          {categoryRules.map((rule, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 text-sm bg-gray-50 rounded-xl px-4 py-3 border"
                            >
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-gray-700 font-medium">{rule.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Reviews Card */}
            <Card className="border-0 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-100 to-blue-100 text-green-600">
                  <Star className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
                  <p className="text-gray-600 text-sm">Feedback from tenants</p>
                </div>
              </div>

              {/* Review Summary */}
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 mb-6 border border-green-200">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900">
                      {unit.reviewsSummary.average.toFixed(1)}
                    </div>
                    <div className="flex items-center justify-center mt-2">
                      {renderStars(Math.round(unit.reviewsSummary.average))}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      {unit.reviewsSummary.total} review{unit.reviewsSummary.total !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  <div className="flex-1 max-w-xs">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = unit.reviews.filter(r => r.rating === star).length;
                      const percentage = unit.reviewsSummary.total > 0 ? (count / unit.reviewsSummary.total) * 100 : 0;
                      
                      return (
                        <div key={star} className="flex items-center gap-3 text-sm mb-2">
                          <span className="w-6 text-gray-600 font-medium">{star}</span>
                          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                          <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-gradient-to-r from-amber-400 to-amber-500 h-2.5 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="w-8 text-gray-600 text-right font-medium">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-6">
                {unit.reviews.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl">
                    <Star className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg mb-2">No reviews yet</p>
                    <p className="text-sm">Reviews will appear here once tenants leave feedback</p>
                  </div>
                ) : (
                  unit.reviews.map((review) => (
                    <div key={review.id} className="border-2 border-gray-100 rounded-xl p-5 bg-white hover:border-green-200 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {review.tenant.firstName[0]}{review.tenant.lastName[0]}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {review.tenant.firstName} {review.tenant.lastName}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              {renderStars(review.rating)}
                              <span className="text-sm text-gray-500">
                                {formatDate(review.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-4 border">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Pricing & Actions Card */}
            <Card className="border-0 shadow-lg p-6 bg-gradient-to-br from-green-50 to-blue-50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-white shadow-sm text-green-600">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Pricing & Actions</h2>
                  <p className="text-gray-600 text-sm">Manage your unit</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-center p-4 bg-white rounded-xl border-2 border-green-200">
                  <div className="text-2xl md:text-3xl font-bold text-green-600 mb-2">
                    {formatCurrency(unit.targetPrice)}
                  </div>
                  <p className="text-gray-600 font-medium">Monthly Rent</p>
                </div>

                {unit.securityDeposit && (
                  <div className="flex justify-between items-center p-3 bg-white rounded-lg border">
                    <span className="text-gray-600 font-medium">Security Deposit</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(unit.securityDeposit)}
                    </span>
                  </div>
                )}

                {unit.requiresScreening && (
                  <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <UserCheck className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-800">
                        Tenant Screening Required
                      </span>
                    </div>
                  </div>  
                )}
              </div>

              <div className="space-y-3 mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  className="w-full border-blue-200 text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-3"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Edit Unit
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50 py-3"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-5 w-5 mr-2" />
                  Delete Unit
                </Button>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold text-gray-900 mb-4">Unit Information</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-2 hover:bg-white rounded-lg transition-colors">
                    <span className="text-gray-600">Property:</span>
                    <span className="font-medium text-right">{unit.property.title}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-white rounded-lg transition-colors">
                    <span className="text-gray-600">Unit ID:</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{unit.id}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-white rounded-lg transition-colors">
                    <span className="text-gray-600">Created:</span>
                    <span className="text-right text-xs font-medium">{formatDateTime(unit.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-white rounded-lg transition-colors">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="text-right text-xs font-medium">{formatDateTime(unit.updatedAt)}</span>
                  </div>
                  {unit.listedAt && (
                    <div className="flex justify-between items-center p-2 hover:bg-white rounded-lg transition-colors">
                      <span className="text-gray-600">Listed Since:</span>
                      <span className="text-right text-xs font-medium">{formatDateTime(unit.listedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Quick Stats Card */}
            <Card className="border-0 shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-100 to-blue-100 text-green-600">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Quick Stats</h2>
                  <p className="text-gray-600 text-sm">Unit performance overview</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Total Views", value: unit.viewCount, icon: Eye, color: "blue" },
                  { label: "Reviews", value: unit.reviewsSummary.total, icon: Star, color: "amber" },
                  { label: "Rating", value: unit.reviewsSummary.average.toFixed(1), icon: Star, color: "amber", isRating: true },
                  { label: "Amenities", value: unit.amenities?.length || 0, icon: CheckCircle, color: "green" },
                  { label: "Lease Rules", value: unit.unitLeaseRules?.length || 0, icon: Shield, color: "purple" },
                  { label: "Images", value: allImages.length, icon: ImageIcon, color: "cyan" },
                  { label: "Listing Status", value: unit.listedAt ? "Active" : "Inactive", icon: Globe, color: unit.listedAt ? "green" : "gray", isBadge: true },
                ].map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-white transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-${stat.color}-100 text-${stat.color}-600`}>
                        <stat.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                    </div>
                    {stat.isBadge ? (
                      <Badge 
                        className={unit.listedAt ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}
                      >
                        {stat.value}
                      </Badge>
                    ) : stat.isRating ? (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <span className="font-semibold text-gray-900">{stat.value}</span>
                      </div>
                    ) : (
                      <span className="font-semibold text-gray-900">{stat.value}</span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="p-6 max-w-md w-full shadow-2xl border-0">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Delete Unit
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete "{unit.label}"? This action cannot be undone and all unit data including reviews and images will be permanently removed.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Yes, Delete Unit
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisplaySpecificUnit;
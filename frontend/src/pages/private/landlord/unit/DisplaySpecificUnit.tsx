import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Edit, 
  Trash2, 
  Share2, 
  Building, 
  Users, 
  Key, 
  Sparkles, 
  CircleDollarSign, 
  User, 
  Star,
  Camera,
  Shield,
  Home,
  ChevronDown,
  Eye,
  EyeOff,
  Clock,
  AlertTriangle,
  AlertCircle,
  CreditCard,
  Calendar,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { getUnitDetailsRequest } from "@/api/landlord/unitApi";

// Types based on your backend response
interface City {
  name: string;
}

interface Municipality {
  name: string;
}

interface Property {
  id: string;
  title: string;
  street: string;
  barangay: string;
  zipCode: string;
  city: City;
  municipality: Municipality | null;
}

interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
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

interface LatestListing {
  id: string;
  lifecycleStatus: "WAITING_PAYMENT" | "VISIBLE" | "HIDDEN" | "EXPIRED" | "FLAGGED" | "BLOCKED";
  isFeatured: boolean;
  visibleAt: string | null;
  hiddenAt: string | null;
  flaggedAt: string | null;
  blockedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface Unit {
  id: string;
  label: string;
  description: string;
  floorNumber: number;
  maxOccupancy: number;
  targetPrice: number;
  mainImageUrl: string;
  otherImages: string[];
  unitLeaseRules: UnitLeaseRule[] | null;
  viewCount: number;
  requiresScreening: boolean;
  unitCondition: string;
  occupiedAt: string | null;
  listedAt: string | null;
  createdAt: string;
  updatedAt: string;
  amenities: Amenity[] | null;
  occupant: Tenant | null;
  property: Property;
  reviews: Review[];
  reviewStats: ReviewStats;
  latestListing: LatestListing | null;
}

// Image Gallery Component
const ImageGallery = ({ images, unitLabel, mainImageUrl }: { images: string[], unitLabel: string, mainImageUrl?: string }) => {
  // Always put mainImageUrl first if it exists and in images
  let gallery = images;
  if (mainImageUrl && images.length && images[0] !== mainImageUrl) {
    gallery = [mainImageUrl, ...images.filter((img) => img !== mainImageUrl)];
  }
  const [selectedImage, setSelectedImage] = useState(0);
  if (gallery.length === 0) {
    return (
      <Card className="h-64 flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="text-center text-gray-500">
          <Camera className="h-12 w-12 mx-auto mb-2" />
          <p>No images available</p>
        </div>
      </Card>
    );
  }
  return (
    <Card className="overflow-hidden shadow-lg border-0">
      {/* Main Image */}
      <div className="aspect-[21/10] bg-gray-100 relative overflow-hidden rounded-t-xl">
        <img
          src={gallery[selectedImage]}
          alt={`${unitLabel} - Image ${selectedImage + 1}`}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      {/* Thumbnail Strip */}
      {gallery.length > 1 && (
        <div className="p-4 bg-white">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {gallery.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === index ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {mainImageUrl && image === mainImageUrl && (
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-emerald-600 text-white text-[10px] font-semibold rounded shadow">Main Image</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

// Unit Header Component
const UnitHeader = ({ unit, onEdit, onDelete, onShare, onAdvertise }: { 
  unit: Unit; 
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
  onAdvertise: () => void;
}) => {
  const formatPropertyAddress = (property: Property) => [
    property.street, property.barangay, property.city?.name, property.municipality?.name, property.zipCode
  ].filter(Boolean).join(", ");

  const getConditionColor = (condition: string) => {
    const colors = {
      'GOOD': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'NEED_MAINTENANCE': 'bg-amber-100 text-amber-700 border-amber-200',
      'UNDER_MAINTENANCE': 'bg-blue-100 text-blue-700 border-blue-200',
      'UNUSABLE': 'bg-rose-100 text-rose-700 border-rose-200',
    };
    return colors[condition as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const UnitIcon = () => (
    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white grid place-items-center shadow-md">
      <Key className="h-5 w-5" />
    </div>
  );

  const formatLongDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="relative overflow-hidden rounded-2xl mb-8">
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-200/70 via-emerald-100/50 to-sky-200/70 opacity-90" />
      <div className="relative m-[1px] rounded-[15px] bg-white/70 backdrop-blur-md border border-white/50 p-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <UnitIcon />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900 truncate">
                  {unit.label}
                </h1>
                <Sparkles className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-sm text-gray-600 leading-5 truncate">
                {unit.unitCondition.replace(/_/g, ' ')}
                {unit.occupiedAt ? ' • Occupied' : ' • Available'}
                {unit.listedAt ? ' • Listed' : ' • Unlisted'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onShare} className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={onEdit} className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete} className="gap-2 text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
        <div className="mt-3 flex items-start gap-2 text-sm text-gray-700">
          <Building className="h-4 w-4 text-gray-500 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">{unit.property.title}</p>
            <p className="truncate max-w-full">{formatPropertyAddress(unit.property)}</p>
          </div>
        </div>
        {/* Dates row (created, updated) */}
        <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
          <span>Created: {formatLongDate(unit.createdAt)}</span>
          <span>Updated: {formatLongDate(unit.updatedAt)}</span>
        </div>
        {/* Animated gradient underline */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          style={{ originX: 0 }}
          className="mt-3 h-0.5 w-full bg-gradient-to-r from-emerald-400/70 via-emerald-300/70 to-sky-400/70 rounded-full"
        />
        {/* Badges Row */}
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge className={getConditionColor(unit.unitCondition)}>
            {unit.unitCondition.replace(/_/g, ' ')}
          </Badge>
          <Badge className={unit.occupiedAt ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-emerald-100 text-emerald-700 border-emerald-200"}>
            {unit.occupiedAt ? "Occupied" : "Available"}
          </Badge>
          <Badge className={unit.listedAt ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}>
            {unit.listedAt ? "Listed" : "Unlisted"}
          </Badge>
          {unit.requiresScreening && (
            <Badge className="bg-purple-100 text-purple-700 border-purple-200">
              <Shield className="h-3 w-3 mr-1" />
              Screening Required
            </Badge>
          )}
        </div>
        {/* Occupant Info */}
        {unit.occupiedAt && unit.occupant && (
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200 mt-4">
            <div className="flex items-center gap-3 flex-1">
              {unit.occupant.avatarUrl ? (
                <img 
                  src={unit.occupant.avatarUrl} 
                  alt={`${unit.occupant.firstName} ${unit.occupant.lastName}`}
                  className="w-10 h-10 rounded-full border-2 border-white"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
              )}
              <div>
                <p className="font-semibold text-blue-900">
                  {unit.occupant.firstName} {unit.occupant.lastName}
                </p>
                <p className="text-sm text-blue-700">{unit.occupant.email}</p>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              Current Occupant
            </Badge>
          </div>
        )}
        {/* Advertise Button for Unlisted Units (NOT shown if FLAGGED) */}
        {!unit.listedAt && 
         onAdvertise && 
         unit.latestListing?.lifecycleStatus !== 'FLAGGED' && (
          <div className="mt-4">
            <Button onClick={onAdvertise} className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 gap-2">
              <Sparkles className="h-4 w-4" />
              Advertise Unit
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

// Key Metrics Component
const KeyMetrics = ({ unit }: { unit: Unit }) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Unit Details</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center gap-3">
          <CircleDollarSign className="h-8 w-8 text-emerald-600" />
          <div>
            <span className="block text-xs text-gray-500">Monthly Rate</span>
            <span className="block text-lg font-bold text-gray-900">₱{unit.targetPrice.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Home className="h-8 w-8 text-blue-600" />
          <div>
            <span className="block text-xs text-gray-500">Floor Number</span>
            <span className="block text-lg font-bold text-gray-900">{unit.floorNumber}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-purple-600" />
          <div>
            <span className="block text-xs text-gray-500">Max Occupancy</span>
            <span className="block text-lg font-bold text-gray-900">{unit.maxOccupancy}</span>
          </div>
        </div>
        {unit.requiresScreening && (
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-purple-700" />
            <div>
              <span className="block text-xs text-gray-500">Screening</span>
              <span className="block text-sm bg-purple-100 text-purple-700 border border-purple-200 rounded px-2 py-0.5">Required</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// Combined status section: availability + condition
const UnitStatusSection = ({ unit }: { unit: Unit }) => {
  const getConditionColor = (condition: string) => {
    const colors = {
      'GOOD': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'NEED_MAINTENANCE': 'bg-amber-100 text-amber-700 border-amber-200',
      'UNDER_MAINTENANCE': 'bg-blue-100 text-blue-700 border-blue-200',
      'UNUSABLE': 'bg-rose-100 text-rose-700 border-rose-200',
    };
    return colors[condition as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const isAvailable = !unit.occupiedAt || !unit.occupant;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Availability & Condition</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Availability</span>
          {isAvailable ? (
            <span className="px-2 py-0.5 rounded border bg-emerald-50 text-emerald-700 border-emerald-200 text-sm font-medium">Available</span>
          ) : (
            <div className="flex items-center gap-3">
              {unit.occupant?.avatarUrl ? (
                <img src={unit.occupant.avatarUrl} alt={`${unit.occupant.firstName} ${unit.occupant.lastName}`} className="w-7 h-7 rounded-full border" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-100 border flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
              )}
              <div className="text-sm">
                <p className="font-medium text-gray-900">Resident: {unit.occupant?.firstName} {unit.occupant?.lastName}</p>
                <p className="text-gray-600">{unit.occupant?.email}</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Unit Condition</span>
          <span className={`px-2 py-0.5 rounded border font-medium text-xs ${getConditionColor(unit.unitCondition)}`}>{unit.unitCondition.replace(/_/g, ' ')}</span>
        </div>
      </div>
    </Card>
  );
};

// Combined stats section: engagement
const UnitStatsSection = ({ unit }: { unit: Unit }) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div>
          <span className="block text-gray-500">Total Reviews</span>
          <span className="block text-xl font-bold">{unit.reviewStats.totalReviews}</span>
        </div>
        <div>
          <span className="block text-gray-500">Average Rating</span>
          <span className="flex items-center justify-center gap-1 text-xl font-bold">
            <Star className="h-5 w-5 text-amber-500 fill-current" />
            {unit.reviewStats.averageRating > 0 ? unit.reviewStats.averageRating.toFixed(1) : 'N/A'}
          </span>
        </div>
        <div>
          <span className="block text-gray-500">Views</span>
          <span className="block text-xl font-bold">{unit.viewCount}</span>
        </div>
      </div>
    </Card>
  );
};

// Amenities Component
const AmenitiesSection = ({ amenities }: { amenities: Amenity[] | null }) => {
  const [open, setOpen] = useState(false);
  
  // Handle null gracefully
  const safeAmenities = amenities || [];
  const groupedAmenities = safeAmenities.reduce((acc, amenity) => {
    if (!acc[amenity.category]) acc[amenity.category] = [];
    acc[amenity.category].push(amenity);
    return acc;
  }, {} as Record<string, Amenity[]>);

  if (safeAmenities.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Amenities</h3>
          <button onClick={() => setOpen((v) => !v)} className="text-sm text-gray-600 flex items-center gap-1">
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {open && (
          <p className="text-gray-500 text-center py-4">No amenities added yet</p>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Amenities</h3>
        <button onClick={() => setOpen((v) => !v)} className="text-sm text-gray-600 flex items-center gap-1">
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {open && (
        <div className="space-y-4 mt-4">
          {Object.entries(groupedAmenities).map(([category, categoryAmenities]) => (
            <div key={category}>
              <h4 className="font-medium text-gray-700 mb-2">{category}</h4>
              <div className="flex flex-wrap gap-2">
                {categoryAmenities.map((amenity) => (
                  <Badge 
                    key={amenity.id} 
                    variant="secondary"
                    className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1"
                  >
                    {amenity.name}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

// Lease Rules Component
const LeaseRulesSection = ({ rules }: { rules: UnitLeaseRule[] | null }) => {
  const [open, setOpen] = useState(false);
  
  // Handle null gracefully
  const safeRules = rules || [];
  const groupedRules = safeRules.reduce((acc, rule) => {
    if (!acc[rule.category]) acc[rule.category] = [];
    acc[rule.category].push(rule);
    return acc;
  }, {} as Record<string, UnitLeaseRule[]>);

  if (safeRules.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Lease Rules</h3>
          <button onClick={() => setOpen((v) => !v)} className="text-sm text-gray-600 flex items-center gap-1">
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {open && (
          <p className="text-gray-500 text-center py-4">No lease rules specified</p>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Lease Rules</h3>
        <button onClick={() => setOpen((v) => !v)} className="text-sm text-gray-600 flex items-center gap-1">
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {open && (
        <div className="space-y-4 mt-4">
          {Object.entries(groupedRules).map(([category, categoryRules]) => (
            <div key={category}>
              <h4 className="font-medium text-gray-700 mb-2 capitalize">{category} Rules</h4>
              <div className="flex flex-wrap gap-2">
                {categoryRules.map((rule, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1"
                  >
                    {rule.text}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

// Reviews Component (collapsible)
const ReviewsSection = ({ reviews, reviewStats }: { reviews: Review[], reviewStats: ReviewStats }) => {
  const [open, setOpen] = useState(false);
  if (reviews.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Reviews</h3>
          <button onClick={() => setOpen((v) => !v)} className="text-sm text-gray-600 flex items-center gap-1">
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {open && (
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No reviews yet</p>
            <p className="text-sm text-gray-400 mt-1">Be the first to review this unit</p>
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900">Reviews</h3>
        <button onClick={() => setOpen((v) => !v)} className="text-sm text-gray-600 flex items-center gap-1">
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {open && (
        <>
          <div className="flex items-center justify-between mb-6">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500 fill-current" />
                <span className="text-2xl font-bold text-gray-900">
                  {reviewStats.averageRating.toFixed(1)}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-3 mb-2">
                  {review.tenant.avatarUrl ? (
                    <img 
                      src={review.tenant.avatarUrl} 
                      alt={`${review.tenant.firstName} ${review.tenant.lastName}`}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {review.tenant.firstName} {review.tenant.lastName}
                    </p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-500 fill-current" />
                      <span className="text-sm text-gray-600">{review.rating}.0</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-gray-700 mt-2">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
};

// Listing Status Section Component
const ListingStatusSection = ({ 
  latestListing
}: { 
  latestListing: LatestListing | null;
}) => {
  const navigate = useNavigate();
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!latestListing) {
    return null;
  }

  const { lifecycleStatus } = latestListing;

  // WAITING_PAYMENT
  if (lifecycleStatus === 'WAITING_PAYMENT') {
    return (
      <Card className={`p-6 bg-blue-50 border-blue-300`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Listing Status</h3>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200">
              <CreditCard className="h-3 w-3 mr-1" />
              Waiting Payment
            </Badge>
            <Badge className={latestListing.isFeatured ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200" : "bg-gray-100 text-gray-600 border-gray-200"}>
              <Sparkles className="h-3 w-3 mr-1" />
              {latestListing.isFeatured ? "Featured" : "Not Featured"}
            </Badge>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-blue-500" />
            <span className="text-gray-600">Created:</span>
            <span className="font-medium text-gray-900">{formatDate(latestListing.createdAt)}</span>
          </div>
          <Button 
            onClick={() => navigate(`/landlord/listing/${latestListing.id}/details`)} 
            className="w-full gap-2 mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
          >
            View Listing Details
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  // VISIBLE
  if (lifecycleStatus === 'VISIBLE') {
    return (
      <Card className={`p-6 bg-emerald-50 border-emerald-300`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Listing Status</h3>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
              <Eye className="h-3 w-3 mr-1" />
              Visible
            </Badge>
            <Badge className={latestListing.isFeatured ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200" : "bg-gray-100 text-gray-600 border-gray-200"}>
              <Sparkles className="h-3 w-3 mr-1" />
              {latestListing.isFeatured ? "Featured" : "Not Featured"}
            </Badge>
          </div>
        </div>
        <div className="space-y-3">
          {latestListing.visibleAt && (
            <div className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4 text-emerald-600" />
              <span className="text-gray-600">Visible At:</span>
              <span className="font-medium text-gray-900">{formatDate(latestListing.visibleAt)}</span>
            </div>
          )}
          {latestListing.createdAt && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-emerald-500" />
              <span className="text-gray-600">Created:</span>
              <span className="font-medium text-gray-900">{formatDate(latestListing.createdAt)}</span>
            </div>
          )}
          {latestListing.expiresAt && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-emerald-500" />
              <span className="text-gray-600">Expires:</span>
              <span className="font-medium text-gray-900">{formatDate(latestListing.expiresAt)}</span>
            </div>
          )}
          <Button 
            onClick={() => navigate(`/landlord/listing/${latestListing.id}/details`)} 
            variant="outline"
            className="w-full gap-2 mt-4 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          >
            View Listing Details
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  // HIDDEN
  if (lifecycleStatus === 'HIDDEN') {
    return (
      <Card className={`p-6 bg-teal-50 border-teal-300`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Listing Status</h3>
          <div className="flex items-center gap-2">
            <Badge className="bg-teal-100 text-teal-700 border-teal-200">
              <EyeOff className="h-3 w-3 mr-1" />
              Hidden
            </Badge>
            <Badge className={latestListing.isFeatured ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200" : "bg-gray-100 text-gray-600 border-gray-200"}>
              <Sparkles className="h-3 w-3 mr-1" />
              {latestListing.isFeatured ? "Featured" : "Not Featured"}
            </Badge>
          </div>
        </div>
        <div className="space-y-3">
          {latestListing.visibleAt && (
            <div className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4 text-teal-500" />
              <span className="text-gray-600">Visible At:</span>
              <span className="font-medium text-gray-900">{formatDate(latestListing.visibleAt)}</span>
            </div>
          )}
          {latestListing.createdAt && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-teal-500" />
              <span className="text-gray-600">Created:</span>
              <span className="font-medium text-gray-900">{formatDate(latestListing.createdAt)}</span>
            </div>
          )}
          {latestListing.expiresAt && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-teal-500" />
              <span className="text-gray-600">Expires:</span>
              <span className="font-medium text-gray-900">{formatDate(latestListing.expiresAt)}</span>
            </div>
          )}
          <Button 
            onClick={() => navigate(`/landlord/listing/${latestListing.id}/details`)} 
            variant="outline"
            className="w-full gap-2 mt-4 border-teal-200 text-teal-700 hover:bg-teal-50"
          >
            View Listing Details
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  // FLAGGED
  if (lifecycleStatus === 'FLAGGED') {
    return (
      <Card className="p-6 bg-amber-50 border-amber-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Listing Status</h3>
          <div className="flex items-center gap-2">
            <Badge className="bg-amber-100 text-amber-700 border-amber-200">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Flagged
            </Badge>
            <Badge className={latestListing.isFeatured ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200" : "bg-gray-100 text-gray-600 border-gray-200"}>
              <Sparkles className="h-3 w-3 mr-1" />
              {latestListing.isFeatured ? "Featured" : "Not Featured"}
            </Badge>
          </div>
        </div>
        <div className="space-y-3">
          {latestListing.flaggedAt && (
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-gray-600">Flagged At:</span>
              <span className="font-medium text-gray-900">{formatDate(latestListing.flaggedAt)}</span>
            </div>
          )}
          {latestListing.visibleAt && (
            <div className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4 text-amber-500" />
              <span className="text-gray-600">Visible At:</span>
              <span className="font-medium text-gray-900">{formatDate(latestListing.visibleAt)}</span>
            </div>
          )}
          {latestListing.createdAt && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-amber-500" />
              <span className="text-gray-600">Created:</span>
              <span className="font-medium text-gray-900">{formatDate(latestListing.createdAt)}</span>
            </div>
          )}
          {latestListing.expiresAt && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-amber-500" />
              <span className="text-gray-600">Expires:</span>
              <span className="font-medium text-gray-900">{formatDate(latestListing.expiresAt)}</span>
            </div>
          )}
          <Button 
            onClick={() => navigate(`/landlord/listing/${latestListing.id}/details`)} 
            className="w-full gap-2 mt-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
          >
            View Listing Details
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  // BLOCKED
  if (lifecycleStatus === 'BLOCKED') {
    return (
      <Card className="p-6 bg-red-50 border-red-300">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Listing Status</h3>
          <div className="flex items-center gap-2">
            <Badge className="bg-red-100 text-red-700 border-red-200">
              <AlertCircle className="h-3 w-3 mr-1" />
              Blocked
            </Badge>
            <Badge className={latestListing.isFeatured ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200" : "bg-gray-100 text-gray-600 border-gray-200"}>
              <Sparkles className="h-3 w-3 mr-1" />
              {latestListing.isFeatured ? "Featured" : "Not Featured"}
            </Badge>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-gray-600">Blocked At:</span>
            <span className="font-medium text-gray-900">
              {latestListing.blockedAt ? formatDate(latestListing.blockedAt) : 'N/A'}
            </span>
          </div>
          {latestListing.visibleAt && (
            <div className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4 text-red-500" />
              <span className="text-gray-600">Visible At:</span>
              <span className="font-medium text-gray-900">{formatDate(latestListing.visibleAt)}</span>
            </div>
          )}
          {latestListing.createdAt && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-red-500" />
              <span className="text-gray-600">Created:</span>
              <span className="font-medium text-gray-900">{formatDate(latestListing.createdAt)}</span>
            </div>
          )}
          {latestListing.expiresAt && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-red-500" />
              <span className="text-gray-600">Expires:</span>
              <span className="font-medium text-gray-900">{formatDate(latestListing.expiresAt)}</span>
            </div>
          )}
          <Button 
            onClick={() => navigate(`/landlord/listing/${latestListing.id}/details`)} 
            className="w-full gap-2 mt-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
          >
            View Listing Details
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  // EXPIRED
  if (lifecycleStatus === 'EXPIRED') {
    return (
      <Card className={`p-6 bg-gray-50 border-gray-300`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Listing Status</h3>
          <div className="flex items-center gap-2">
            <Badge className="bg-gray-100 text-gray-700 border-gray-200">
              <Clock className="h-3 w-3 mr-1" />
              Expired
            </Badge>
            <Badge className={latestListing.isFeatured ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200" : "bg-gray-100 text-gray-600 border-gray-200"}>
              <Sparkles className="h-3 w-3 mr-1" />
              {latestListing.isFeatured ? "Featured" : "Not Featured"}
            </Badge>
          </div>
        </div>
        <div className="space-y-3">
          {latestListing.visibleAt && (
            <div className="flex items-center gap-2 text-sm">
              <Eye className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Visible At:</span>
              <span className="font-medium text-gray-900">{formatDate(latestListing.visibleAt)}</span>
            </div>
          )}
          {latestListing.createdAt && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Created:</span>
              <span className="font-medium text-gray-900">{formatDate(latestListing.createdAt)}</span>
            </div>
          )}
          {latestListing.expiresAt && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Expired At:</span>
              <span className="font-medium text-gray-900">{formatDate(latestListing.expiresAt)}</span>
            </div>
          )}
          <Button 
            onClick={() => navigate(`/landlord/listing/${latestListing.id}/details`)} 
            variant="outline"
            className="w-full gap-2 mt-4 border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            View Listing Details
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  // Fallback
  return null;
};

// Main Component
const DisplaySpecificUnit = () => {
  const { unitId, propertyId } = useParams<{ unitId: string; propertyId: string }>();
  const navigate = useNavigate();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnitDetails = async () => {
      if (!unitId) {
        setError("Unit ID is missing");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const response = await getUnitDetailsRequest(unitId);
        setUnit(response.data);
      } catch (err) {
        setError("Failed to load unit details. Please try again.");
        console.error('Error fetching unit details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnitDetails();
  }, [unitId, propertyId]);

  // Handler functions
  const handleEdit = () => navigate(`/landlord/units/${unitId}/edit`);
  const handleDelete = () => { /* TODO: Implement delete */ };
  const handleShare = () => { /* TODO: Implement share */ };
  const handleAdvertise = () => navigate(`/landlord/units/${unitId}/list`);

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <Card className="p-6 mb-8">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </div>
            <div className="mt-4">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-20" />
            </div>
          </Card>

          {/* Main Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Card className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </Card>
              <Card className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <Card className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </Card>
              <Card className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <p className="text-red-600 text-lg">{error || 'Unit data not found.'}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const allImages = [unit.mainImageUrl, ...(unit.otherImages || [])].filter(Boolean);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <UnitHeader 
          unit={unit}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onShare={handleShare}
          onAdvertise={handleAdvertise}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Gallery and Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery (pass mainImageUrl explicitly) */}
            <ImageGallery images={allImages} unitLabel={unit.label} mainImageUrl={unit.mainImageUrl} />
            {/* Description */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {unit.description || (
                  <span className="text-gray-500 italic">
                    No description provided for this unit.
                  </span>
                )}
              </p>
            </Card>
            {/* Amenities */}
            <AmenitiesSection amenities={unit.amenities} />
            {/* Lease Rules */}
            <LeaseRulesSection rules={unit.unitLeaseRules} />
            {/* Reviews */}
            <ReviewsSection reviews={unit.reviews} reviewStats={unit.reviewStats} />
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Listing Status Section */}
            {unit.latestListing && (
              <ListingStatusSection 
                latestListing={unit.latestListing}
              />
            )}
            {/* Key Metrics */}
            <KeyMetrics unit={unit} />
            {/* Advertise CTA - Show if no listing or listing is expired/blocked (NOT for FLAGGED) */}
            {(!unit.latestListing || 
              unit.latestListing.lifecycleStatus === 'EXPIRED' || 
              unit.latestListing.lifecycleStatus === 'BLOCKED') && (
              <Card className="p-6 bg-gradient-to-br from-emerald-50 to-sky-50 border-emerald-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Advertise Your Unit</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Looking for more tenants? Make your unit visible on our platform to reach more qualified renters. Boost your exposure and fill vacancies faster.
                </p>
                <Button onClick={handleAdvertise} className="gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700">
                  <Sparkles className="h-4 w-4" />
                  Advertise Unit
                </Button>
              </Card>
            )}
            {/* Availability & Condition */}
            <UnitStatusSection unit={unit} />
            {/* Engagement (views, rating, reviews count) */}
            <UnitStatsSection unit={unit} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisplaySpecificUnit; 
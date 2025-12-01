import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Edit, 
  Trash2, 
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
  CheckCircle,
  XCircle,
  Wrench,
  Calendar,
  ArrowRight,
  MapPin,
  RotateCcw,
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getUnitDetailsRequest, deleteUnitRequest } from "@/api/landlord/unitApi";

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
  lifecycleStatus: "WAITING_PAYMENT" | "WAITING_REVIEW" | "VISIBLE" | "HIDDEN" | "EXPIRED" | "FLAGGED" | "BLOCKED";
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
  leaseId: string | null;
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
      <Card className="h-48 flex items-center justify-center bg-gray-100 rounded-xl">
        <div className="text-center text-gray-500">
          <Camera className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">No images available</p>
        </div>
      </Card>
    );
  }
  return (
    <Card className="overflow-hidden shadow-lg border-0">
      {/* Main Image */}
      <div className="bg-gray-100 relative overflow-hidden rounded-t-xl w-[60%] mx-auto">
        <div className="aspect-[6/5] w-full">
          <img
            src={gallery[selectedImage]}
            alt={`${unitLabel} - Image ${selectedImage + 1}`}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      </div>
      {/* Thumbnail Strip */}
      {gallery.length > 1 && (
        <div className="p-2 bg-white">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {gallery.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative flex-shrink-0 w-14 h-10 rounded-md overflow-hidden border-2 transition-all ${
                  selectedImage === index ? 'border-emerald-500 ring-1 ring-emerald-200' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {mainImageUrl && image === mainImageUrl && (
                  <span className="absolute bottom-0 left-0 px-1 py-0.5 bg-emerald-600 text-white text-[8px] font-semibold rounded shadow">Main</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

// Helper functions
const formatPropertyAddress = (property: Property) => [
  property.street, property.barangay, property.city?.name, property.municipality?.name, property.zipCode
].filter(Boolean).join(", ");

const getConditionColor = (condition: string) => {
  const colors = {
    'GOOD': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'NEED_MAINTENANCE': 'bg-amber-100 text-amber-700 border-amber-200',
    'UNDER_MAINTENANCE': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'UNUSABLE': 'bg-rose-100 text-rose-700 border-rose-200',
  };
  return colors[condition as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
};

const getConditionIcon = (condition: string) => {
  switch (condition) {
    case 'GOOD':
      return <CheckCircle className="h-4 w-4" />;
    case 'NEED_MAINTENANCE':
      return <AlertTriangle className="h-4 w-4" />;
    case 'UNDER_MAINTENANCE':
      return <Wrench className="h-4 w-4" />;
    case 'UNUSABLE':
      return <XCircle className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const formatLongDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

// Unit Header Component
const UnitHeader = ({ 
  unit, 
  onEdit, 
  onDelete, 
  onRefresh,
  refreshing
}: { 
  unit: Unit; 
  onEdit: () => void;
  onDelete: () => void;
  onRefresh: () => void;
  refreshing: boolean;
}) => {

  return (
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
                  <Key className="h-5 w-5 relative z-10" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                </div>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 220 }}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white text-sky-600 border border-sky-100 shadow-sm grid place-items-center"
                >
                  <Sparkles className="h-3 w-3" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-cyan-400/30"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 truncate">
                    {unit.label}
                  </h1>
                  <motion.div
                    animate={{ rotate: [0, 8, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Sparkles className="h-4 w-4 text-cyan-500" />
                  </motion.div>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-slate-600">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm border text-xs sm:text-sm ${unit.occupiedAt ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-emerald-100 text-emerald-700 border-emerald-200"}`}>
                    {unit.occupiedAt ? "Occupied" : "Available"}
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm border text-xs sm:text-sm ${unit.listedAt ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                    {unit.listedAt ? "Listed" : "Unlisted"}
                  </div>
                  {unit.requiresScreening && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm border border-purple-200 bg-purple-100 text-purple-700 text-xs sm:text-sm">
                      <Shield className="h-3 w-3" />
                      Screening Required
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm border border-slate-200 text-xs sm:text-sm text-slate-600">
                  <Building className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="font-medium text-slate-900">{unit.property.title}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm border border-slate-200 text-xs sm:text-sm text-slate-600">
                  <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
                  <span className="truncate max-w-[220px] sm:max-w-[360px]">
                    {formatPropertyAddress(unit.property) || 'Address not provided'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm border border-slate-200">
                    <CircleDollarSign className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="font-semibold text-slate-900">₱{unit.targetPrice.toLocaleString()}/month</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm border border-slate-200">
                    <Home className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Floor {unit.floorNumber}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm border border-slate-200">
                    <Users className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Max {unit.maxOccupancy}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm border border-slate-200">
                    <Shield className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{unit.requiresScreening ? "Screening Required" : "Screening Not Required"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm border border-slate-200">
                    <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Created {formatLongDate(unit.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm border border-slate-200">
                    <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Updated {formatLongDate(unit.updatedAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
              <Button
                onClick={onRefresh}
                variant="outline"
                size="sm"
                disabled={refreshing}
                className="bg-white/90 hover:bg-white border-slate-300 text-slate-700 hover:text-slate-900 shadow-sm"
              >
                {refreshing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Refresh
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Refresh
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={onEdit} className="gap-2 bg-white/90 hover:bg-white border-slate-300 text-slate-700 hover:text-slate-900 shadow-sm">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={onDelete} className="gap-2 text-red-600 hover:text-red-700 bg-white/90 hover:bg-white border-red-300 shadow-sm">
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
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
  );
};


// Combined stats section: engagement
const UnitStatsSection = ({ unit }: { unit: Unit }) => {
  const navigate = useNavigate();
  
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Engagement</h3>
        <Button
          onClick={() => navigate('/landlord/engagement')}
          variant="outline"
          size="sm"
          className="gap-2 text-xs h-8"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          Engagement
        </Button>
      </div>
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
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Amenities</h3>
          <button onClick={() => setOpen((v) => !v)} className="text-xs text-gray-600 flex items-center gap-1">
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {open && (
          <p className="text-xs text-gray-500 text-center py-3">No amenities added yet</p>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">Amenities</h3>
        <button onClick={() => setOpen((v) => !v)} className="text-xs text-gray-600 flex items-center gap-1">
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {open && (
        <div className="space-y-3 mt-3">
          {Object.entries(groupedAmenities).map(([category, categoryAmenities]) => (
            <div key={category}>
              <h4 className="font-medium text-sm text-gray-700 mb-2">{category}</h4>
              <div className="flex flex-wrap gap-1.5">
                {categoryAmenities.map((amenity) => (
                  <Badge 
                    key={amenity.id} 
                    variant="secondary"
                    className="bg-emerald-50 text-emerald-700 border-emerald-200 px-2 py-0.5 text-xs"
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
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Lease Rules</h3>
          <button onClick={() => setOpen((v) => !v)} className="text-xs text-gray-600 flex items-center gap-1">
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {open && (
          <p className="text-xs text-gray-500 text-center py-3">No lease rules specified</p>
        )}
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">Lease Rules</h3>
        <button onClick={() => setOpen((v) => !v)} className="text-xs text-gray-600 flex items-center gap-1">
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      {open && (
        <div className="space-y-3 mt-3">
          {Object.entries(groupedRules).map(([category, categoryRules]) => (
            <div key={category}>
              <h4 className="font-medium text-sm text-gray-700 mb-2 capitalize">{category} Rules</h4>
              <div className="flex flex-wrap gap-1.5">
                {categoryRules.map((rule, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 border-blue-200 px-2 py-0.5 text-xs"
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

// Avatar component with placeholder
const Avatar = ({ 
  src, 
  alt, 
  className = "", 
  size = "md",
  name 
}: { 
  src?: string | null; 
  alt?: string; 
  className?: string;
  size?: "sm" | "md" | "lg";
  name?: string;
}) => {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-8 w-8",
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Reset error state when src changes
  useEffect(() => {
    if (src) {
      setImageError(false);
    }
  }, [src]);

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={alt || "Avatar"}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center border border-gray-300 ${className}`}>
      {name ? (
        <span className={`text-gray-600 font-medium ${size === "sm" ? "text-xs" : size === "md" ? "text-sm" : "text-base"}`}>
          {getInitials(name)}
        </span>
      ) : (
        <User className={`${iconSizes[size]} text-gray-400`} />
      )}
    </div>
  );
};

// Reviews Component with filters (collapsible)
const ReviewsSection = ({ reviews, reviewStats }: { reviews: Review[], reviewStats: ReviewStats }) => {
  const [open, setOpen] = useState(false);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const totalReviews = reviews.length;

  if (totalReviews === 0) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">Reviews</h3>
          <button onClick={() => setOpen((v) => !v)} className="text-xs text-gray-600 flex items-center gap-1">
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {open && (
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-1">No reviews yet</p>
            <p className="text-xs text-gray-500">This unit hasn't received any reviews yet</p>
          </div>
        )}
      </Card>
    );
  }

  // Filter reviews by rating
  const filteredReviews = selectedRatingFilter !== null
    ? reviews.filter((r) => r.rating === selectedRatingFilter)
    : reviews;

  // Pagination: show first 6, then all if showAllReviews is true
  const displayedReviews = showAllReviews || filteredReviews.length <= 6
    ? filteredReviews
    : filteredReviews.slice(0, 6);

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">Reviews</h3>
          {reviewStats.averageRating > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span>{reviewStats.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <button onClick={() => setOpen((v) => !v)} className="text-xs text-gray-600 flex items-center gap-1">
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      {open && (
        <>
          {/* Star Rating Filter */}
          <div className="mb-4 pb-4 border-b">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Filter by rating:</span>
              <button
                onClick={() => setSelectedRatingFilter(null)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedRatingFilter === null
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = reviews.filter((r) => r.rating === rating).length;
                return (
                  <button
                    key={rating}
                    onClick={() => setSelectedRatingFilter(rating)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      selectedRatingFilter === rating
                        ? "bg-yellow-100 text-yellow-700 border-2 border-yellow-400"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Star className={`h-4 w-4 ${selectedRatingFilter === rating ? "fill-yellow-500" : ""}`} />
                    <span>{rating}</span>
                    <span className="text-xs text-gray-500">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          {displayedReviews.length > 0 ? (
            <>
              <div className="space-y-4">
                {displayedReviews.map((review) => {
                  const tenantFullName = `${review.tenant.firstName} ${review.tenant.lastName}`.trim() || "Anonymous";
                  
                  return (
                    <div key={review.id} className="p-3 sm:p-4 border rounded-lg bg-gray-50">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <Avatar
                            src={review.tenant.avatarUrl}
                            alt={tenantFullName}
                            className="flex-shrink-0"
                            size="sm"
                            name={tenantFullName !== "Anonymous" ? tenantFullName : undefined}
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">{tenantFullName}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="inline-flex items-center gap-1 text-yellow-500">
                            <Star className="h-4 w-4 fill-yellow-400" />
                            <span className="text-sm font-medium text-gray-800">{review.rating}</span>
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="mt-3 text-sm text-gray-700 break-words">{review.comment}</p>
                      )}
                    </div>
                  );
                })}
              </div>
              {!showAllReviews && filteredReviews.length > 6 && (
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllReviews(true)}
                    className="text-sm"
                  >
                    Show All Reviews ({filteredReviews.length})
                  </Button>
                </div>
              )}
              {showAllReviews && filteredReviews.length > 6 && (
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowAllReviews(false)}
                    className="text-sm"
                  >
                    Show Less
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-gray-600">
                No reviews found with the selected rating filter.
              </p>
            </div>
          )}
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
      <Card className={`p-4 bg-blue-50 border-blue-300`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">Listing Status</h3>
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
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-gray-600">Created:</span>
            <span className="font-medium text-gray-900">{formatDate(latestListing.createdAt)}</span>
          </div>
          <Button 
            onClick={() => navigate(`/landlord/listing/${latestListing.id}/details`)} 
            className="w-full gap-2 mt-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-sm h-9"
          >
            View Listing Details
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </Card>
    );
  }

  // WAITING_REVIEW
  if (lifecycleStatus === 'WAITING_REVIEW') {
    return (
      <Card className={`p-4 bg-purple-50 border-purple-300`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">Listing Status</h3>
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-100 text-purple-700 border-purple-200">
              <Clock className="h-3 w-3 mr-1" />
              Waiting Review
            </Badge>
            <Badge className={latestListing.isFeatured ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200" : "bg-gray-100 text-gray-600 border-gray-200"}>
              <Sparkles className="h-3 w-3 mr-1" />
              {latestListing.isFeatured ? "Featured" : "Not Featured"}
            </Badge>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-purple-500" />
            <span className="text-gray-600">Created:</span>
            <span className="font-medium text-gray-900">{formatDate(latestListing.createdAt)}</span>
          </div>
          <Button 
            onClick={() => navigate(`/landlord/listing/${latestListing.id}/details`)} 
            className="w-full gap-2 mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
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
      <Card className={`p-4 bg-emerald-50 border-emerald-300`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">Listing Status</h3>
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
      <Card className={`p-4 bg-teal-50 border-teal-300`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">Listing Status</h3>
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
      <Card className="p-4 bg-amber-50 border-amber-300">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">Listing Status</h3>
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
      <Card className="p-4 bg-red-50 border-red-300">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">Listing Status</h3>
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
      <Card className={`p-4 bg-gray-50 border-gray-300`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-900">Listing Status</h3>
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
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchUnitDetails = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!unitId) {
      setError("Unit ID is missing");
      setLoading(false);
      return;
    }

    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);
    
    try {
      const response = await getUnitDetailsRequest(unitId);
      setUnit(response.data);
    } catch (err) {
      setError("Failed to load unit details. Please try again.");
      console.error('Error fetching unit details:', err);
    } finally {
      if (!silent) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchUnitDetails();
  }, [unitId, propertyId]);

  // Handler functions
  const handleEdit = () => navigate(`/landlord/units/${propertyId}/${unitId}/edit`);
  const handleDelete = () => {
    if (!unit?.id) return;
    setDeleteModalOpen(true);
    setDeleteConfirmation("");
    setAgreedToTerms(false);
  };
  const handleAdvertise = () => navigate(`/landlord/listing/${unitId}/review`);
  const handleRefresh = () => fetchUnitDetails({ silent: true });

  const handleDeleteConfirm = async () => {
    if (!unit?.id || !unitId) return;
    if (deleteConfirmation !== "DELETE" || !agreedToTerms) return;

    setDeleting(true);
    try {
      await deleteUnitRequest(unitId);
      toast.success("Unit deleted successfully");
      navigate(`/landlord/properties/${propertyId}`, { replace: true });
    } catch (err: any) {
      console.error("Error deleting unit:", err);
      toast.error(err?.response?.data?.message || "Failed to delete unit");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setDeleteConfirmation("");
    setAgreedToTerms(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="space-y-6 p-4 sm:p-6">
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
    <div className="min-h-screen py-2">
      <div className="space-y-6 p-2 sm:p-6">
        {/* Header */}
        <UnitHeader 
          unit={unit}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Gallery and Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery (pass mainImageUrl explicitly) */}
            <ImageGallery images={allImages} unitLabel={unit.label} mainImageUrl={unit.mainImageUrl} />
            {/* Description */}
            <Card className="p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {unit.description || (
                  <span className="text-gray-500 italic text-sm">
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

            {/* Occupant Information Section - Below Listing Status */}
            {unit.occupiedAt && unit.occupant && (
              <Card className="p-4">
                <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  Current Occupant
                </h3>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
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
                      <p className="font-semibold text-blue-900 text-sm">
                        {unit.occupant.firstName} {unit.occupant.lastName}
                      </p>
                      <p className="text-xs text-blue-700">{unit.occupant.email}</p>
                    </div>
                  </div>
                  {unit.leaseId && (
                    <Button
                      onClick={() => navigate(`/landlord/leases/${unit.leaseId}/details`)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3 gap-1.5"
                    >
                      <ArrowRight className="h-3 w-3" />
                      View Lease
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {/* Advertise CTA - Show if no listing or listing is expired/blocked (NOT for FLAGGED) */}
            {(!unit.latestListing || 
              unit.latestListing.lifecycleStatus === 'EXPIRED' || 
              unit.latestListing.lifecycleStatus === 'BLOCKED') && (
              <Card className="p-4 bg-gradient-to-br from-emerald-50 to-sky-50 border-emerald-100">
                <h3 className="text-base font-semibold text-gray-900 mb-2">Advertise Your Unit</h3>
                <p className="text-xs text-gray-700 mb-3">
                  Looking for more tenants? Make your unit visible on our platform to reach more qualified renters.
                </p>
                <Button onClick={handleAdvertise} className="gap-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-sm h-9">
                  <Sparkles className="h-3.5 w-3.5" />
                  Advertise Unit
                </Button>
              </Card>
            )}
            {/* Engagement (views, rating, reviews count) */}
            <UnitStatsSection unit={unit} />

            {/* Unit Condition Section */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-gray-600" />
                  Unit Condition
                </h3>
              </div>
              <div className={`p-4 rounded-xl border-2 ${getConditionColor(unit.unitCondition)}`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getConditionColor(unit.unitCondition)}`}>
                    {getConditionIcon(unit.unitCondition)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Current Status</p>
                    <p className="text-lg font-bold capitalize">
                      {unit.unitCondition.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
                {unit.unitCondition === 'UNDER_MAINTENANCE' && (
                  <div className="mt-3 pt-3 border-t border-yellow-300">
                    <p className="text-xs text-yellow-800">
                      This unit is currently under maintenance. Maintenance requests are being addressed.
                    </p>
                  </div>
                )}
                {unit.unitCondition === 'NEED_MAINTENANCE' && (
                  <div className="mt-3 pt-3 border-t border-amber-300">
                    <p className="text-xs text-amber-800">
                      This unit requires maintenance attention. Consider creating a maintenance request.
                    </p>
                  </div>
                )}
                {unit.unitCondition === 'UNUSABLE' && (
                  <div className="mt-3 pt-3 border-t border-rose-300">
                    <p className="text-xs text-rose-800">
                      This unit is currently unusable and should not be listed or occupied.
                    </p>
                  </div>
                )}
                {unit.unitCondition === 'GOOD' && (
                  <div className="mt-3 pt-3 border-t border-emerald-300">
                    <p className="text-xs text-emerald-800">
                      This unit is in good condition and ready for listing or occupancy.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={(open) => {
        if (!open) {
          handleDeleteCancel();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Delete Unit
                </DialogTitle>
                <DialogDescription className="text-base text-gray-600 mt-1">
                  This action cannot be undone
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Warning Box */}
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 mb-1">
                    Warning: This is a destructive action
                  </h4>
                  <p className="text-sm text-red-800">
                    Once you delete this unit, all related data will be permanently removed and cannot be restored.
                  </p>
                </div>
              </div>
            </div>

            {/* Unit Info */}
            {unit && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2">Unit to be deleted:</h4>
                <p className="text-gray-700 font-medium">{unit.label}</p>
                <p className="text-sm text-gray-600 mt-1">{formatPropertyAddress(unit.property)}</p>
                <p className="text-sm text-gray-600 mt-1">Property: {unit.property.title}</p>
              </div>
            )}

            {/* What will be deleted */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="font-semibold text-amber-900 mb-3">
                The following will be permanently deleted:
              </h4>
              <ul className="space-y-2 text-sm text-amber-800">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span><strong>All Listings</strong> for this unit</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span><strong>All Leases</strong> related to this unit</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span><strong>All Maintenance Requests</strong> for this unit</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span><strong>All Unit Reviews</strong> and ratings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span><strong>All View Records</strong> and analytics data</span>
                </li>
              </ul>
            </div>

            {/* Type Confirmation */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900">
                Type <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">DELETE</span> to confirm:
              </label>
              <Input
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type DELETE here"
                className="font-mono"
                disabled={deleting}
              />
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <Checkbox
                id="delete-terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                disabled={deleting}
                className="mt-0.5"
              />
              <label
                htmlFor="delete-terms"
                className="text-sm text-gray-700 cursor-pointer flex-1"
              >
                I understand that deleting this unit is a permanent and irreversible action. 
                All related data including listings, leases, maintenance requests, reviews, 
                and view records will be permanently deleted and cannot be restored. I agree to proceed with 
                this deletion at my own risk.
              </label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={
                deleteConfirmation !== "DELETE" ||
                !agreedToTerms ||
                deleting
              }
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Deleting..." : "Delete Unit Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DisplaySpecificUnit; 
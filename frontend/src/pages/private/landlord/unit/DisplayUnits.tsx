import { useMemo, useState } from "react";
import { Building, ChevronLeft, ChevronRight, Home, Plus, Search, Star, Clock, Eye, RefreshCw, Filter, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useParams } from "react-router-dom"; 

// Updated type based on new backend response
type Unit = {
  id: string;
  label: string;
  description: string;
  floorNumber: number | null;
  maxOccupancy: number;
  targetPrice: number;
  mainImageUrl?: string;
  createdAt: string;
  updatedAt: string;
  isListed: boolean;
  occupiedAt: string | null;
  viewCount: number;
  requiresScreening: boolean;
  unitCondition: "GOOD" | "NEED_MAINTENANCE" | "UNDER_MAINTENANCE" | "UNUSABLE";
  amenities: Array<{ id: string; name: string; category: string }>;
  reviewStats: { totalReviews: number; averageRating: number };
};

// Helper functions
const getConditionBadgeClasses = (condition: Unit["unitCondition"]) => {
  switch (condition) {
    case "GOOD":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "NEED_MAINTENANCE":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "UNDER_MAINTENANCE":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "UNUSABLE":
      return "bg-rose-100 text-rose-800 border-rose-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getUnitBadgeType = (createdAt: string, updatedAt: string) => {
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  const created = new Date(createdAt);
  const updated = new Date(updatedAt);
  
  if (created > threeDaysAgo) {
    return "NEW";
  }
  else if (updated > threeDaysAgo) {
    return "UPDATED";
  }
  
  return null;
};

const StarRating = ({ rating, showText = true }: { rating: number; showText?: boolean }) => {
  const normalizedRating = Math.max(0, Math.min(5, rating));
  const fullStars = Math.floor(normalizedRating);
  const hasHalfStar = normalizedRating % 1 >= 0.5;
  
  return (
    <div className="flex items-center gap-0.5">
      <div className="flex">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) {
            return <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />;
          } else if (i === fullStars && hasHalfStar) {
            return <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />;
          } else {
            return <Star key={i} className="h-3 w-3 text-gray-300" />;
          }
        })}
      </div>
      {showText && (
        <span className="text-xs text-gray-600 ml-1">{normalizedRating.toFixed(1)}</span>
      )}
    </div>
  );
};

// Loading Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
  </div>
);

// Units Subnavigation Component
const UnitsSubnav = ({
  unitQuery,
  setUnitQuery,
  unitCondition,
  setUnitCondition,
  availability,
  setAvailability,
  amenities,
  selectedAmenities,
  setSelectedAmenities,
  filteredUnitsCount,
  onAddUnit,
}: {
  unitQuery: string;
  setUnitQuery: (query: string) => void;
  unitCondition: "ALL" | Unit["unitCondition"];
  setUnitCondition: (c: "ALL" | Unit["unitCondition"]) => void;
  availability: "ALL" | "AVAILABLE" | "OCCUPIED";
  setAvailability: (v: "ALL" | "AVAILABLE" | "OCCUPIED") => void;
  amenities: string[];
  selectedAmenities: string[];
  setSelectedAmenities: (names: string[]) => void;
  filteredUnitsCount: number;
  onAddUnit: () => void;
}) => {
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);

  const toggleAmenity = (name: string) => {
    setSelectedAmenities(
      selectedAmenities.includes(name)
        ? selectedAmenities.filter((n) => n !== name)
        : [...selectedAmenities, name]
    );
  };

  const clearAmenities = () => setSelectedAmenities([]);

  return (
    <Card className="p-4">
      <div className="flex flex-col lg:flex-row gap-3 justify-between items-start lg:items-center">
        <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              value={unitQuery}
              onChange={(e) => setUnitQuery(e.target.value)}
              placeholder="Search units by label, floor, price..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>
          <select
            value={unitCondition}
            onChange={(e) => setUnitCondition(e.target.value as any)}
            className="w-full md:w-48 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          >
            <option value="ALL">All Conditions</option>
            <option value="GOOD">Good</option>
            <option value="NEED_MAINTENANCE">Need Maintenance</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            <option value="UNUSABLE">Unusable</option>
          </select>
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value as any)}
            className="w-full md:w-44 px-3 py-2 rounded-lg border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          >
            <option value="ALL">All Availability</option>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
          </select>
          <div className="relative">
            <Button
              variant="outline"
              className="text-sm h-9 gap-2"
              onClick={() => setAmenitiesOpen((v) => !v)}
            >
              <Filter className="h-4 w-4" /> Amenities
            </Button>
            {amenitiesOpen && (
              <div className="absolute z-10 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-md p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500">Select amenities</span>
                  <button onClick={clearAmenities} className="text-xs text-emerald-700 hover:underline">Clear</button>
                </div>
                <div className="max-h-56 overflow-auto space-y-1">
                  {amenities.map((name) => (
                    <label key={name} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(name)}
                        onChange={() => toggleAmenity(name)}
                      />
                      <span>{name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onAddUnit}
            className="bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            Create Unit
          </Button>
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        {filteredUnitsCount} units found
      </div>
    </Card>
  );
};

// Main PropertyUnits Component
const DisplayUnits = ({ units = [], loading, error }: { units: Unit[]; loading?: boolean; error?: string | null }) => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();
  
  // Units filters and pagination
  const [unitQuery, setUnitQuery] = useState("");
  const [unitCondition, setUnitCondition] = useState<"ALL" | Unit["unitCondition"]>("ALL");
  const [availability, setAvailability] = useState<"ALL" | "AVAILABLE" | "OCCUPIED">("ALL");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [unitPage, setUnitPage] = useState(1);
  const unitPageSize = 8;

  const allAmenities = useMemo(() => {
    const set = new Set<string>();
    units.forEach(u => u.amenities.forEach(a => set.add(a.name)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [units]);

  const filteredUnits = useMemo(() => {
    const q = unitQuery.trim().toLowerCase();

    return units.filter((unit) => {
      if (unitCondition !== "ALL" && unit.unitCondition !== unitCondition) return false;
      if (availability === "AVAILABLE" && unit.occupiedAt) return false;
      if (availability === "OCCUPIED" && !unit.occupiedAt) return false;
      if (selectedAmenities.length > 0) {
        const unitAmenityNames = new Set(unit.amenities.map(a => a.name));
        for (const name of selectedAmenities) {
          if (!unitAmenityNames.has(name)) return false;
        }
      }
      if (q) {
        const matches = unit.label.toLowerCase().includes(q) ||
          (unit.floorNumber !== null && String(unit.floorNumber).includes(q)) ||
          String(unit.targetPrice).includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [units, unitQuery, unitCondition, availability, selectedAmenities]);

  const totalUnitPages = Math.max(
    1,
    Math.ceil(filteredUnits.length / unitPageSize)
  );

  const goToUnitPage = (next: number) => {
    const clamped = Math.min(Math.max(1, next), totalUnitPages);
    setUnitPage(clamped);
  };

  const handleRetry = () => window.location.reload();

  const handleAddUnit = () => {
    navigate(`/landlord/units/${propertyId}/create`);
  };

  const currentUnits = filteredUnits.slice((unitPage - 1) * unitPageSize, unitPage * unitPageSize);

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-red-800 text-sm">
              Error loading units: {error}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="text-red-800 border-red-300 hover:bg-red-100 h-8"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Units Subnavigation */}
      <UnitsSubnav
        unitQuery={unitQuery}
        setUnitQuery={(query) => {
          setUnitQuery(query);
          setUnitPage(1);
        }}
        unitCondition={unitCondition}
        setUnitCondition={(c) => {
          setUnitCondition(c);
          setUnitPage(1);
        }}
        availability={availability}
        setAvailability={(v) => {
          setAvailability(v);
          setUnitPage(1);
        }}
        amenities={allAmenities}
        selectedAmenities={selectedAmenities}
        setSelectedAmenities={(names) => {
          setSelectedAmenities(names);
          setUnitPage(1);
        }}
        filteredUnitsCount={filteredUnits.length}
        onAddUnit={handleAddUnit}
      />

      {/* Loading State */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        /* Units List */
        <UnitsList
          units={currentUnits}
          unitPage={unitPage}
          totalUnitPages={totalUnitPages}
          onPageChange={goToUnitPage}
        />
      )}
    </div>
  );
};

// Presentational UnitsList Component
const UnitsList = ({ 
  units, 
  unitPage, 
  totalUnitPages,
  onPageChange,
}: { 
  units: Unit[];
  unitPage: number;
  totalUnitPages: number;
  onPageChange: (page: number) => void;
}) => {

  if (units.length === 0) {
    return (
      <div className="text-center py-8">
        <Building className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-base font-medium text-gray-900 mb-1">No units found</h3>
        <p className="text-gray-500 text-sm">No units match your search criteria.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {units.map((unit) => (
          <UnitCard key={unit.id} unit={unit} />
        ))}
      </div>

      {totalUnitPages > 1 && (
        <Pagination 
          currentPage={unitPage}
          totalPages={totalUnitPages}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
};

// Sub-components for UnitsList
const UnitCard = ({ unit }: { unit: Unit }) => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => navigate(`/landlord/units/${propertyId}/${unit.id}`)}
      className="cursor-pointer overflow-hidden border border-gray-200 transition-all duration-200 hover:shadow-md hover:border-emerald-200 h-full flex flex-col"
    >
      <UnitImage unit={unit} />
      <UnitDetails unit={unit} />
    </Card>
  );
};

const UnitImage = ({ unit }: { unit: Unit }) => {
  const badgeType = getUnitBadgeType(unit.createdAt, unit.updatedAt);
  
  return (
    <div className="relative w-full bg-gray-100 overflow-hidden" style={{ height: '160px' }}>
      {unit.mainImageUrl ? (
        <img 
          src={unit.mainImageUrl} 
          alt={unit.label} 
          className="w-full h-full object-cover" 
          style={{ objectFit: 'cover', objectPosition: 'center', width: '100%', height: '100%' }}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-sky-50 flex items-center justify-center">
          <Home className="h-7 w-7 text-emerald-400" />
        </div>
      )}
      <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
        <Badge variant="secondary" className={`text-[10px] font-medium ${getConditionBadgeClasses(unit.unitCondition)}`}>
          {unit.unitCondition.replaceAll("_", " ")}
        </Badge>
        <Badge variant="secondary" className={`text-[10px] font-medium ${unit.occupiedAt ? "bg-blue-100 text-blue-800 border-blue-200" : "bg-emerald-100 text-emerald-800 border-emerald-200"}`}>
          {unit.occupiedAt ? "Occupied" : "Available"}
        </Badge>
        {badgeType === "NEW" && (
          <Badge variant="secondary" className="bg-rose-100 text-rose-800 border-rose-200 text-[10px]">
            <Clock className="h-3 w-3 mr-1" />
            New
          </Badge>
        )}
        {badgeType === "UPDATED" && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 text-[10px]">
            <RefreshCw className="h-3 w-3 mr-1" />
            Updated
          </Badge>
        )}
      </div>
    </div>
  );
};

const UnitDetails = ({ unit }: { unit: Unit }) => (
  <div className="p-3 flex-1 flex flex-col">
    <UnitHeader unit={unit} />
    <UnitMeta unit={unit} />
    <UnitFeatures unit={unit} />
    <UnitFooter unit={unit} />
  </div>
);

const UnitHeader = ({ unit }: { unit: Unit }) => (
  <div className="flex items-center justify-between mb-1">
    <h4 className="font-semibold text-gray-900 text-sm truncate">{unit.label}</h4>
    <span className="text-emerald-700 font-bold text-sm">₱{unit.targetPrice.toLocaleString()}/mo</span>
  </div>
);

const UnitMeta = ({ unit }: { unit: Unit }) => (
  <div className="space-y-1 mb-1">
    <div className="flex items-center justify-between">
      <div className="text-[11px] text-gray-600">
        {unit.floorNumber !== null ? `Floor ${unit.floorNumber}` : 'No Floor'} • Max {unit.maxOccupancy}
      </div>
      <div className="flex items-center gap-1">
        <Eye className="h-3 w-3 text-gray-400" />
        <span className="text-[11px] text-gray-500">{unit.viewCount}</span>
      </div>
    </div>
    <div className="flex items-center gap-1 text-[11px] text-gray-600">
      <Calendar className="h-3 w-3 text-gray-400" />
      <span>{unit.isListed ? "Listed" : "Not Listed"}</span>
    </div>
  </div>
);

const UnitFeatures = ({ unit }: { unit: Unit }) => (
  <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 mb-2">
    <div className="flex items-center justify-center p-1.5 bg-gray-50 rounded">
      <span className={unit.requiresScreening ? "text-emerald-600" : "text-gray-400"}>
        {unit.requiresScreening ? "Screening Required" : "No Screening"}
      </span>
    </div>
  </div>
);

const UnitFooter = ({ unit }: { unit: Unit }) => (
  <div className="pt-2 border-t border-gray-100">
    <div className="flex items-center justify-between mb-1">
      <StarRating rating={unit.reviewStats.averageRating} showText={false} />
      <Badge variant="secondary" className="text-[10px]">
        {unit.amenities.length} amenities
      </Badge>
    </div>
    <div className="flex items-center justify-between">
      {unit.reviewStats.totalReviews > 0 ? (
        <>
          <span className="text-[11px] text-gray-600">
            {unit.reviewStats.averageRating.toFixed(1)} ({unit.reviewStats.totalReviews} review{unit.reviewStats.totalReviews !== 1 ? 's' : ''})
          </span>
        </>
      ) : (
        <span className="text-[11px] text-gray-400">No reviews</span>
      )}
    </div>
  </div>
);

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i);
    } else if (currentPage >= totalPages - 2) {
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      for (let i = currentPage - 2; i <= currentPage + 2; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200">
      <p className="text-sm text-gray-600">
        Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
      </p>
      <div className="flex items-center gap-1">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1} 
          className="gap-1 h-8"
        >
          <ChevronLeft className="h-3 w-3" /> Prev
        </Button>
        
        <div className="hidden sm:flex items-center gap-1">
          {getPageNumbers().map((pageNum) => (
            <Button 
              key={pageNum} 
              variant={currentPage === pageNum ? "default" : "outline"} 
              size="sm" 
              className={`h-8 w-8 p-0 text-xs ${currentPage === pageNum ? 'bg-gradient-to-r from-emerald-600 to-sky-600' : ''}`} 
              onClick={() => onPageChange(pageNum)}
            >
              {pageNum}
            </Button>
          ))}
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages} 
          className="gap-1 h-8"
        >
          Next <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default DisplayUnits;
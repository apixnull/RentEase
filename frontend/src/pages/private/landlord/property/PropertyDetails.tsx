import { useMemo, useState } from "react";
import { useParams, Link, useSearchParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Building, MapPin, Layers, BedDouble, Bath, Maximize, Info, ChevronLeft, ChevronRight, Search, Plus, Star } from "lucide-react";
import { toast } from "sonner";

type Property = {
  id: string;
  title: string;
  type: string;
  street: string;
  barangay: string;
  zipCode?: string | null;
  city?: { id: string; name: string } | null;
  municipality?: { id: string; name: string } | null;
  mainImageUrl?: string | null;
  description?: string | null;
  amenities?: string[];
  Unit?: Array<{
    id: string;
    name: string;
    bedrooms: number;
    bathrooms: number;
    floorArea: number;
    rent: number;
    status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
    imageUrl?: string | null;
    averageRating: number;
    reviewCount: number;
    maxOccupancy: number;
    floorNumber?: number;
    description: string;
  }>;
};

function formatAddress(property: Property): string {
  const locality = property.city?.name || property.municipality?.name || "";
  const segments = [property.street, property.barangay, locality, property.zipCode].filter(Boolean);
  return segments.join(", ");
}

const mockProperty: Property = {
  id: "p-1",
  title: "Luxury Apartment Complex",
  type: "APARTMENT",
  street: "123 Mango Ave",
  barangay: "Barangay Luz",
  zipCode: "6000",
  city: { id: "c1", name: "Cebu City" },
  municipality: null,
  mainImageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=870&auto=format&fit=crop",
  description: "Modern apartment complex with convenient access to transport and shopping. Features 24/7 security, parking space, and beautiful garden areas.",
  amenities: ["Parking", "Security", "Elevator", "Backup Power", "Garden", "CCTV"],
  Unit: Array.from({ length: 12 }).map((_, i) => ({
    id: `u-${i + 1}`,
    name: `Unit ${i + 1}`,
    bedrooms: (i % 3) + 1,
    bathrooms: (i % 2) + 1,
    floorArea: 30 + i * 5,
    rent: 12000 + i * 1500,
    status: i % 3 === 0 ? "MAINTENANCE" : i % 2 === 0 ? "AVAILABLE" : "OCCUPIED",
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=870&auto=format&fit=crop",
    averageRating: 4.2 + (i * 0.1) % 0.8, // Random ratings between 4.2 and 5.0
    reviewCount: 5 + (i % 10),
    maxOccupancy: 2 + (i % 3),
    floorNumber: (i % 5) + 1,
    description: `Spacious unit with ${(i % 3) + 1} bedroom${(i % 3) + 1 > 1 ? 's' : ''} and ${(i % 2) + 1} bathroom${(i % 2) + 1 > 1 ? 's' : ''}.`
  })),
};

const getPropertyTypeIcon = (type: string) => {
  switch (type) {
    case "APARTMENT":
    case "CONDOMINIUM":
      return <Building className="h-4 w-4" />;
    default:
      return <Home className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "AVAILABLE":
      return "bg-emerald-100 text-emerald-800";
    case "OCCUPIED":
      return "bg-blue-100 text-blue-800";
    case "MAINTENANCE":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const Tabs = ({ active, onChange }: { active: string; onChange: (key: string) => void }) => {
  const items = [
    { key: "overview", label: "Overview", icon: Info },
    { key: "units", label: "Units", icon: Layers },
  ];
  return (
    <div className="flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((item) => (
        <Button
          key={item.key}
          variant={active === item.key ? "default" : "outline"}
          className={`gap-2 ${active === item.key ? "bg-gradient-to-r from-emerald-600 to-sky-600 text-white" : ""}`}
          onClick={() => onChange(item.key)}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Button>
      ))}
    </div>
  );
};

const StarRating = ({ rating, size = 4 }: { rating: number; size?: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => {
        if (i < fullStars) {
          return <Star key={i} className={`h-${size} w-${size} fill-yellow-400 text-yellow-400`} />;
        } else if (i === fullStars && hasHalfStar) {
          return <Star key={i} className={`h-${size} w-${size} fill-yellow-400 text-yellow-400`} />;
        } else {
          return <Star key={i} className={`h-${size} w-${size} text-gray-300`} />;
        }
      })}
      <span className="text-sm text-gray-600 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
};

const PropertyDetails = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") || "overview";
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl);

  // Units filters and pagination
  const [unitQuery, setUnitQuery] = useState("");
  const [unitStatus, setUnitStatus] = useState<string>("ALL");
  const [unitPage, setUnitPage] = useState(1);
  const unitPageSize = 6;

  const property = useMemo(() => ({ ...mockProperty, id: propertyId || mockProperty.id }), [propertyId]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    const next = new URLSearchParams(searchParams);
    next.set("tab", key);
    setSearchParams(next, { replace: true });
  };

  const availableUnits = property.Unit?.filter((u) => u.status === "AVAILABLE").length || 0;

  const filteredUnits = useMemo(() => {
    const q = unitQuery.trim().toLowerCase();
    return (property.Unit || []).filter((u) => {
      if (unitStatus !== "ALL" && u.status !== unitStatus) return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        String(u.bedrooms).includes(q) ||
        String(u.bathrooms).includes(q) ||
        String(u.floorArea).includes(q) ||
        String(u.rent).includes(q)
      );
    });
  }, [property.Unit, unitQuery, unitStatus]);

  const totalUnitPages = Math.max(1, Math.ceil(filteredUnits.length / unitPageSize));
  const currentUnits = filteredUnits.slice((unitPage - 1) * unitPageSize, unitPage * unitPageSize);

  function goToUnitPage(next: number) {
    const clamped = Math.min(Math.max(1, next), totalUnitPages);
    setUnitPage(clamped);
  }

  const handleDelete = () => {
    if (!property.id) return;
    const confirmed = window.confirm("Are you sure you want to delete this property? This action cannot be undone.");
    if (!confirmed) return;
    // TODO: integrate API deletion
    toast.success("Property deleted");
    navigate("/landlord/properties", { replace: true });
  };

  const handleAddUnit = () => {
    // Navigate to add unit page or open a modal
    toast.success("Add unit functionality would open here");
    // In a real app: navigate(`/landlord/properties/${property.id}/units/add`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-sky-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-medium">
            <span>Property Details</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{property.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1 bg-white border border-gray-200 px-2 py-1 rounded-md">
              {getPropertyTypeIcon(property.type)}
              {property.type.replaceAll("_", " ")}
            </span>
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md">
              {availableUnits} Available
            </span>
            <span className="inline-flex items-center gap-1 bg-gray-50 text-gray-700 px-2 py-1 rounded-md">
              {property.Unit?.length || 0} Total Units
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-start sm:justify-end">
          <Link to="/landlord/properties">
            <Button variant="outline" size="sm">Back to Properties</Button>
          </Link>
          <Link to={`/landlord/properties/${property.id}/listing`}>
            <Button variant="outline" size="sm">Listing</Button>
          </Link>
          <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700">
            Edit Property
          </Button>
          <Button size="sm" onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
            Delete
          </Button>
        </div>
      </div>

      {/* Tabs directly below title */}
      <div className="flex flex-col gap-4">
        <Tabs active={activeTab} onChange={handleTabChange} />

        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-0 lg:col-span-2 overflow-hidden">
              <div className="relative aspect-video bg-gray-100">
                {property.mainImageUrl ? (
                  <img 
                    src={property.mainImageUrl} 
                    alt={property.title} 
                    className="h-full w-full object-cover" 
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center">
                    <Home className="h-12 w-12 text-emerald-400" />
                  </div>
                )}
                <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-medium text-emerald-700">
                  {getPropertyTypeIcon(property.type)}
                  <span>{property.type.replaceAll("_", " ")}</span>
                </div>
              </div>
              <div className="p-4 md:p-6">
                <h2 className="text-lg font-semibold text-gray-900">Property Information</h2>
                <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                  {property.description}
                </p>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <MapPin className="h-4 w-4 mt-0.5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">Address</p>
                      <p>{formatAddress(property)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <Layers className="h-4 w-4 mt-0.5 text-gray-500" />
                    <div>
                      <p className="font-medium text-gray-900">Property Type</p>
                      <p>{property.type.replaceAll("_", " ")}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4 md:p-6">
              <h3 className="text-lg font-semibold text-gray-900">At a Glance</h3>
              <div className="mt-4 space-y-3 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Total Units</span>
                  <span className="font-medium">{property.Unit?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Available Units</span>
                  <span className="font-medium">{availableUnits}</span>
                </div>
                <div className="flex justify-between">
                  <span>Occupied Units</span>
                  <span className="font-medium">{property.Unit?.filter(u => u.status === "OCCUPIED").length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Under Maintenance</span>
                  <span className="font-medium">{property.Unit?.filter(u => u.status === "MAINTENANCE").length || 0}</span>
                </div>
              </div>
              {property.amenities && property.amenities.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((a) => (
                      <span key={a} className="text-xs px-2 py-1 rounded-md bg-gray-50 border border-gray-200 text-gray-700">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === "units" && (
          <div className="space-y-6">
            <Card className="p-4 md:p-6">
              <div className="flex flex-col lg:flex-row gap-3 justify-between items-start lg:items-center">
                <div className="flex flex-col lg:flex-row gap-3 w-full lg:w-auto">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      value={unitQuery}
                      onChange={(e) => { setUnitPage(1); setUnitQuery(e.target.value); }}
                      placeholder="Search units by name, size, rent..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    />
                  </div>
                  <select
                    value={unitStatus}
                    onChange={(e) => { setUnitPage(1); setUnitStatus(e.target.value); }}
                    className="w-full lg:w-56 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="AVAILABLE">Available</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </div>
                <Button 
                  onClick={handleAddUnit} 
                  className="bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 gap-2 mt-3 lg:mt-0"
                >
                  <Plus className="h-4 w-4" />
                  Add Unit
                </Button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Showing {Math.min((unitPage - 1) * unitPageSize + 1, filteredUnits.length)} to {Math.min(unitPage * unitPageSize, filteredUnits.length)} of {filteredUnits.length} units
              </div>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentUnits.map((unit) => (
                <Card key={unit.id} className="overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-md">
                  <div className="relative aspect-[4/3] bg-gray-100">
                    {unit.imageUrl ? (
                      <img 
                        src={unit.imageUrl} 
                        alt={unit.name} 
                        className="h-full w-full object-cover" 
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center">
                        <Home className="h-10 w-10 text-emerald-400" />
                      </div>
                    )}
                    <div className={`absolute top-3 right-3 text-xs px-2 py-1 rounded-md font-medium ${getStatusColor(unit.status)}`}>
                      {unit.status}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900">{unit.name}</h4>
                      <span className="text-emerald-700 font-medium">₱{unit.rent.toLocaleString()}/mo</span>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Floor {unit.floorNumber} • Max {unit.maxOccupancy} people
                      </div>
                      {unit.reviewCount > 0 && (
                        <div className="flex items-center">
                          <StarRating rating={unit.averageRating} size={3} />
                          <span className="text-xs text-gray-500 ml-1">({unit.reviewCount})</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-4 grid grid-cols-3 gap-2 text-sm text-gray-600">
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                        <BedDouble className="h-4 w-4 mb-1" />
                        <span>{unit.bedrooms} BR</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                        <Bath className="h-4 w-4 mb-1" />
                        <span>{unit.bathrooms} BA</span>
                      </div>
                      <div className="flex flex-col items-center p-2 bg-gray-50 rounded-lg">
                        <Maximize className="h-4 w-4 mb-1" />
                        <span>{unit.floorArea}m²</span>
                      </div>
                    </div>
                    
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">{unit.description}</p>
                    
                    <div className="mt-4">
                      <Button variant="outline" className="w-full">View Unit Details</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {totalUnitPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Page <span className="font-medium">{unitPage}</span> of <span className="font-medium">{totalUnitPages}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => goToUnitPage(unitPage - 1)} disabled={unitPage === 1} className="gap-1">
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalUnitPages) }, (_, i) => {
                      let pageNum;
                      if (totalUnitPages <= 5) pageNum = i + 1;
                      else if (unitPage <= 3) pageNum = i + 1;
                      else if (unitPage >= totalUnitPages - 2) pageNum = totalUnitPages - 4 + i;
                      else pageNum = unitPage - 2 + i;
                      return (
                        <Button 
                          key={pageNum} 
                          variant={unitPage === pageNum ? "default" : "outline"} 
                          size="sm" 
                          className={`h-9 w-9 p-0 ${unitPage === pageNum ? 'bg-gradient-to-r from-emerald-600 to-sky-600' : ''}`} 
                          onClick={() => goToUnitPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => goToUnitPage(unitPage + 1)} disabled={unitPage === totalUnitPages} className="gap-1">
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetails;
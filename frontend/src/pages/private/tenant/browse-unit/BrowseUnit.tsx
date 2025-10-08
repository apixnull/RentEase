import { useMemo, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, Search, MapPin, Filter, ChevronLeft, ChevronRight, MessageCircle, Eye, Star, Crown } from "lucide-react";
import { getVisibleListingsForTenantRequest } from "@/api/tenant/browseUnitApi";
import { useNavigate } from "react-router-dom";

type City = { id: string; name: string };
type Municipality = { id: string; name: string };
type Amenity = { id: string; name: string; category: string };

type Property = {
  id: string;
  title: string;
  type: string;
  street: string;
  barangay: string;
  zipCode: string | null;
  city: City | null;
  municipality: Municipality | null;
};

type Unit = {
  id: string;
  label: string;
  mainImageUrl: string | null;
  viewCount: number;
  targetPrice: number;
  requiresScreening: boolean;
  property: Property;
  avgRating: number | null;
  amenities: Amenity[];
};

type Listing = {
  id: string;
  isFeatured: boolean;
  unit: Unit;
};

type ApiResponse = {
  featured: Listing[];
  mostViewed: Listing[];
  mostRated: Listing[];
  newlyListed: Listing[];
};

// Format full address
function formatFullAddress(property: Property): string {
  const segments = [
    property.street,
    property.barangay,
    property.city?.name || property.municipality?.name,
    property.zipCode
  ].filter(Boolean);
  return segments.join(", ");
}

// Get property type display name
function getPropertyTypeDisplay(type: string): string {
  const typeMap: { [key: string]: string } = {
    'APARTMENT': 'Apartment',
    'HOUSE': 'House',
    'CONDO': 'Condominium',
    'TOWNHOUSE': 'Townhouse',
    'STUDIO': 'Studio'
  };
  return typeMap[type] || type.replace('_', ' ');
}

const StarRating = ({ rating, size = 12, showNumber = false }: { rating: number | null; size?: number; showNumber?: boolean }) => {
  if (rating === null || rating === 0) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-400">No ratings</span>
      </div>
    );
  }

  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => {
        if (i < fullStars) {
          return <Star key={i} className={`h-${size} w-${size} fill-yellow-400 text-yellow-400`} />;
        } else if (i === fullStars && hasHalfStar) {
          return <Star key={i} className={`h-${size} w-${size} fill-yellow-400 text-yellow-400`} />;
        } else {
          return <Star key={i} className={`h-${size} w-${size} text-gray-300`} />;
        }
      })}
      {showNumber && <span className="text-xs text-gray-600 ml-1">{rating.toFixed(1)}</span>}
    </div>
  );
};

const BrowseUnit = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("ALL");
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>("ALL");
  const [selectedAmenity, setSelectedAmenity] = useState<string>("ALL");
  const [priceRange, setPriceRange] = useState<string>("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 16;
  const [isScrolled, setIsScrolled] = useState(false);

  // Server-triggered search: applied snapshot
  const [appliedQuery, setAppliedQuery] = useState("");
  const [appliedCity, setAppliedCity] = useState<string>("ALL");
  const [appliedMunicipality, setAppliedMunicipality] = useState<string>("ALL");
  const [appliedAmenity, setAppliedAmenity] = useState<string>("ALL");
  const [appliedPriceRange, setAppliedPriceRange] = useState<string>("ALL");
  const [activeCategory, setActiveCategory] = useState<"FEATURED" | "MOST_VIEWED" | "TOP_RATED" | "NEWLY_LISTED">("FEATURED");

  // State for API data
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data using useEffect
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getVisibleListingsForTenantRequest();
        setApiData(response.data.data);
      } catch (err) {
        setError("Failed to load properties");
        console.error("Error fetching listings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const executeSearch = () => {
    setAppliedQuery(query);
    setAppliedCity(selectedCity);
    setAppliedMunicipality(selectedMunicipality);
    setAppliedAmenity(selectedAmenity);
    setAppliedPriceRange(priceRange);
    setPage(1);
  };

  // Price ranges
  const priceRanges = [
    { value: "ALL", label: "Any Price" },
    { value: "0-5000", label: "Under ₱5,000" },
    { value: "5000-10000", label: "₱5,000 - ₱10,000" },
    { value: "10000-20000", label: "₱10,000 - ₱20,000" },
    { value: "20000-30000", label: "₱20,000 - ₱30,000" },
    { value: "30000-50000", label: "₱30,000 - ₱50,000" },
    { value: "50000+", label: "₱50,000+" }
  ];

  // Get all units from API data based on active category
  const allUnits = useMemo(() => {
    if (!apiData) return [];
    
    const featured = apiData.featured || [];
    const mostViewed = apiData.mostViewed || [];
    const mostRated = apiData.mostRated || [];
    const newlyListed = apiData.newlyListed || [];

    let listings: Listing[] = [];

    switch (activeCategory) {
      case "FEATURED":
        listings = featured;
        break;
      case "MOST_VIEWED":
        listings = mostViewed;
        break;
      case "TOP_RATED":
        listings = mostRated;
        break;
      case "NEWLY_LISTED":
      default:
        listings = newlyListed;
        break;
    }

    // Remove duplicates by unit id
    const uniqueListings = listings.filter((listing, index, self) => 
      index === self.findIndex(l => l.unit.id === listing.unit.id)
    );

    return uniqueListings;
  }, [apiData, activeCategory]);

  // Extract unique cities, municipalities, and amenities from all units
  const uniqueCities = useMemo(() => {
    const names = allUnits
      .map((listing) => listing.unit.property.city?.name)
      .filter(Boolean) as string[];
    return Array.from(new Set(names));
  }, [allUnits]);

  const uniqueMunicipalities = useMemo(() => {
    const names = allUnits
      .map((listing) => listing.unit.property.municipality?.name)
      .filter(Boolean) as string[];
    return Array.from(new Set(names));
  }, [allUnits]);

  const uniqueAmenities = useMemo(() => {
    const amenitySet = new Set<string>();
    allUnits.forEach(listing => {
      listing.unit.amenities?.forEach(amenity => {
        amenitySet.add(amenity.name);
      });
    });
    return Array.from(amenitySet);
  }, [allUnits]);

  // Handle scroll for sticky search
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredUnits = useMemo(() => {
    const q = appliedQuery.trim().toLowerCase();
    const filtered = allUnits.filter((listing) => {
      const u = listing.unit;
      
      // City filter
      if (appliedCity !== "ALL") {
        const cityName = u.property.city?.name || "";
        if (cityName !== appliedCity) return false;
      }

      // Municipality filter
      if (appliedMunicipality !== "ALL") {
        const municipalityName = u.property.municipality?.name || "";
        if (municipalityName !== appliedMunicipality) return false;
      }

      // Amenity filter
      if (appliedAmenity !== "ALL") {
        const unitAmenityNames = new Set(u.amenities?.map((a) => a.name) || []);
        if (!unitAmenityNames.has(appliedAmenity)) return false;
      }

      // Price range filter
      if (appliedPriceRange !== "ALL") {
        const price = u.targetPrice;
        switch (appliedPriceRange) {
          case "0-5000":
            if (price > 5000) return false;
            break;
          case "5000-10000":
            if (price < 5000 || price > 10000) return false;
            break;
          case "10000-20000":
            if (price < 10000 || price > 20000) return false;
            break;
          case "20000-30000":
            if (price < 20000 || price > 30000) return false;
            break;
          case "30000-50000":
            if (price < 30000 || price > 50000) return false;
            break;
          case "50000+":
            if (price < 50000) return false;
            break;
        }
      }

      // Search query
      if (!q) return true;
      return (
        u.label.toLowerCase().includes(q) ||
        u.property.title.toLowerCase().includes(q) ||
        formatFullAddress(u.property).toLowerCase().includes(q)
      );
    });

    return filtered;
  }, [allUnits, appliedQuery, appliedCity, appliedMunicipality, appliedAmenity, appliedPriceRange]);

  const totalPages = Math.max(1, Math.ceil(filteredUnits.length / pageSize));
  const current = filteredUnits.slice((page - 1) * pageSize, page * pageSize);

  function goToPage(next: number) {
    const clamped = Math.min(Math.max(1, next), totalPages);
    setPage(clamped);
  }

  // Simple AI Chatbot widget (mock)
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([
    { role: "assistant", content: "Hi! I can help you find a property. Try '2BR in Cebu with wifi'" },
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, chatOpen]);

  const sendChat = () => {
    const text = chatInput.trim();
    if (!text) return;
    setMessages((m) => [...m, { role: "user", content: text }]);
    setChatInput("");
    setTimeout(() => {
      const lower = text.toLowerCase();
      const suggested: string[] = [];
      if (lower.includes("2br") || lower.includes("2 br") || lower.includes("2 bedrooms")) suggested.push("Bedrooms: 2");
      if (lower.includes("wifi")) suggested.push("Amenity: wifi");
      if (lower.includes("cebu")) suggested.push("City: Cebu City");
      const reply = suggested.length > 0
        ? `Try filtering: ${suggested.join(", ")}`
        : "Try keywords like '1BR', 'wifi', 'Cebu City', 'parking'";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading properties...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <Card className="p-8 text-center border border-dashed border-red-200 bg-red-50">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <Home className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-medium text-red-900">Failed to load properties</h3>
          <p className="text-red-700 mt-2">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-3 md:p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            <span>Tenant • Browse</span>
          </div>
          <h1 className="mt-2 text-xl md:text-2xl font-bold text-gray-900">Browse Properties</h1>
          <p className="text-xs text-gray-600 mt-1">Find available units across the city</p>
        </div>

        <Link to="/tenant">
          <Button variant="outline" className="gap-2 text-xs h-8 border-green-200 text-green-700 hover:bg-green-50">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Sticky Search and Filters */}
      <div className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'py-1 bg-white/90 backdrop-blur-sm' : 'py-0'}`}>
        <Card className={`border-green-100 shadow-sm transition-all duration-300 ${isScrolled ? 'p-2' : 'p-3'} bg-gradient-to-br from-green-50 to-blue-50`}>
          <div className="flex flex-col gap-3">
            {/* Search Bar */}
            <div className="flex gap-2 items-stretch">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 h-3.5 w-3.5" />
                <input
                  value={query}
                  onChange={(e) => { setPage(1); setQuery(e.target.value); }}
                  placeholder="Search by unit, property, or address..."
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-green-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400"
                />
              </div>
              <Button 
                onClick={executeSearch} 
                className="px-3 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-xs h-9 text-white"
              >
                Search
              </Button>
              <Button 
                variant="outline" 
                className="md:hidden px-2 py-2 h-9 border-green-200 text-green-700 hover:bg-green-50"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-3.5 w-3.5" />
              </Button>
            </div>

            {/* Filters Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-4 gap-3 ${showFilters ? 'grid' : 'hidden md:grid'}`}>
              {/* City Filter */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-green-800">City</label>
                <select
                  value={selectedCity}
                  onChange={(e) => { setSelectedCity(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 rounded-lg border border-green-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400"
                >
                  <option value="ALL">All Cities</option>
                  {uniqueCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Municipality Filter */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-green-800">Municipality</label>
                <select
                  value={selectedMunicipality}
                  onChange={(e) => { setSelectedMunicipality(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 rounded-lg border border-green-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400"
                >
                  <option value="ALL">All Municipalities</option>
                  {uniqueMunicipalities.map((municipality) => (
                    <option key={municipality} value={municipality}>{municipality}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-green-800">Price Range</label>
                <select
                  value={priceRange}
                  onChange={(e) => { setPriceRange(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 rounded-lg border border-green-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400"
                >
                  {priceRanges.map((range) => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>

              {/* Amenity Filter */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-green-800">Amenity</label>
                <select
                  value={selectedAmenity}
                  onChange={(e) => { setSelectedAmenity(e.target.value); setPage(1); }}
                  className="w-full px-3 py-2 rounded-lg border border-green-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400"
                >
                  <option value="ALL">All Amenities</option>
                  {uniqueAmenities.map((amenity) => (
                    <option key={amenity} value={amenity}>{amenity}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => { 
                  setQuery(""); 
                  setSelectedCity("ALL");
                  setSelectedMunicipality("ALL");
                  setSelectedAmenity("ALL");
                  setPriceRange("ALL");
                  setPage(1); 
                  setAppliedQuery(""); 
                  setAppliedCity("ALL");
                  setAppliedMunicipality("ALL");
                  setAppliedAmenity("ALL");
                  setAppliedPriceRange("ALL");
                }}
                className="gap-1 text-xs px-2 py-1 h-7 border-green-200 text-green-700 hover:bg-green-50"
              >
                Reset Filters
              </Button>
              
              {/* Category Tabs */}
              <div className="flex items-center gap-1">
                {[
                  { key: "FEATURED" as const, label: "Featured" },
                  { key: "NEWLY_LISTED" as const, label: "New" },
                  { key: "MOST_VIEWED" as const, label: "Popular" },
                  { key: "TOP_RATED" as const, label: "Top Rated" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => { setActiveCategory(tab.key); setPage(1); }}
                    className={`px-2 py-1 rounded-full text-xs border transition-all duration-200 ${
                      activeCategory === tab.key 
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white border-transparent shadow-sm' 
                        : 'bg-white text-gray-700 border-green-200 hover:bg-green-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Results header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-xs text-green-700">
          Showing <span className="font-medium">{current.length}</span> of <span className="font-medium">{filteredUnits.length}</span> units
        </p>
        <div className="flex items-center gap-2 text-xs text-green-700">
          <span>Page</span>
          <span className="font-medium">{page}</span>
          <span>of</span>
          <span className="font-medium">{totalPages}</span>
        </div>
      </div>

      {/* Units grid */}
      {current.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            {current.map((listing) => {
              const unit = listing.unit;
              const isFeatured = listing.isFeatured;
              
              return (
                <Card 
                  key={listing.id} 
                  className={`overflow-hidden border transition-all duration-200 hover:shadow-md ${
                    isFeatured ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50' : 'border-green-100 bg-white'
                  }`}
                >
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-green-50 to-blue-50">
                    {unit.mainImageUrl ? (
                      <img 
                        src={unit.mainImageUrl} 
                        alt={unit.label} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className={`h-full w-full flex items-center justify-center ${
                        isFeatured 
                          ? 'bg-gradient-to-br from-yellow-100 to-amber-100' 
                          : 'bg-gradient-to-br from-green-50 to-blue-50'
                      }`}>
                        <Home className={`h-6 w-6 ${
                          isFeatured ? 'text-amber-400' : 'text-green-400'
                        }`} />
                      </div>
                    )}
                    {/* Featured badge */}
                    {isFeatured && (
                      <div className="absolute top-1 left-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white px-1.5 py-0.5 rounded text-xs flex items-center gap-0.5 font-medium">
                        <Crown className="h-2.5 w-2.5" />
                        Featured
                      </div>
                    )}
                    
                    {/* Price badge */}
                    <div className="absolute top-1 right-1 bg-gradient-to-r from-green-600 to-blue-600 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                      ₱{unit.targetPrice.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="p-2 space-y-1.5">
                    {/* Title and Rating row */}
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900 text-xs leading-tight line-clamp-2">
                        {unit.property.title} • {unit.label}
                      </h3>
                      <div className="flex items-center gap-0.5 ml-1 flex-shrink-0">
                        <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-gray-600">
                          {unit.avgRating ? unit.avgRating.toFixed(1) : "0.0"}
                        </span>
                      </div>
                    </div>

                    {/* Property Type */}
                    <div className="text-xs text-green-600 font-medium">
                      {getPropertyTypeDisplay(unit.property.type)}
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-1 text-xs text-gray-600">
                      <MapPin className="h-2.5 w-2.5 flex-shrink-0 mt-0.5 text-green-500" />
                      <span className="leading-tight line-clamp-2">{formatFullAddress(unit.property)}</span>
                    </div>

                    {/* View count and screening */}
                    <div className="flex justify-between items-center text-xs text-gray-500">
                      <div className="flex items-center gap-0.5">
                        <Eye className="h-2.5 w-2.5 text-blue-500" />
                        <span>{unit.viewCount}</span>
                      </div>
                      {unit.requiresScreening && (
                        <span className="text-amber-600 font-medium text-xs">Screening</span>
                      )}
                    </div>

                    {/* Amenities preview */}
                    {unit.amenities && unit.amenities.length > 0 && (
                      <div className="pt-1">
                        <div className="flex flex-wrap gap-0.5">
                          {unit.amenities.slice(0, 2).map((amenity, index) => (
                            <span key={`${amenity.id}-${index}`} className="text-[10px] px-1 py-0.5 rounded bg-gradient-to-r from-green-100 to-blue-100 text-green-700 border border-green-200">
                              {amenity.name}
                            </span>
                          ))}
                          {unit.amenities.length > 2 && (
                            <span className="text-[10px] px-1 py-0.5 rounded bg-gradient-to-r from-green-100 to-blue-100 text-green-700 border border-green-200">
                              +{unit.amenities.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={() => navigate(`/tenant/browse-unit/${listing.id}/details`)}
                      size="sm"
                      variant={isFeatured ? "default" : "outline"} 
                      className={`w-full text-xs h-7 ${
                        isFeatured 
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600' 
                          : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-transparent'
                      }`}
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-green-100">
              <p className="text-xs text-green-700">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredUnits.length)} of {filteredUnits.length} units
              </p>
              <div className="flex items-center gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => goToPage(page - 1)} 
                  disabled={page === 1} 
                  className="gap-1 h-7 text-xs border-green-200 text-green-700 hover:bg-green-50"
                >
                  <ChevronLeft className="h-3 w-3" /> Prev
                </Button>
                <div className="hidden sm:flex items-center gap-0.5">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (page <= 3) pageNum = i + 1;
                    else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = page - 2 + i;
                    return (
                      <Button 
                        key={pageNum} 
                        variant={page === pageNum ? "default" : "outline"} 
                        size="sm" 
                        className={`h-7 w-7 p-0 text-xs ${
                          page === pageNum 
                            ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white' 
                            : 'border-green-200 text-green-700 hover:bg-green-50'
                        }`} 
                        onClick={() => goToPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => goToPage(page + 1)} 
                  disabled={page === totalPages} 
                  className="gap-1 h-7 text-xs border-green-200 text-green-700 hover:bg-green-50"
                >
                  Next <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <Card className="p-6 text-center border border-dashed border-green-200 bg-gradient-to-br from-green-50 to-blue-50">
          <div className="mx-auto w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mb-2">
            <Home className="h-5 w-5 text-green-500" />
          </div>
          <h3 className="text-sm font-medium text-green-800">No units found</h3>
          <p className="text-green-600 text-xs mt-1 max-w-md mx-auto">
            Try adjusting your search or filters.
          </p>
        </Card>
      )}

      {/* AI Chatbot widget */}
      <div className="fixed bottom-3 right-3 z-50">
        {chatOpen ? (
          <Card className="w-72 max-w-[calc(100vw-1.5rem)] shadow-xl rounded-lg overflow-hidden border-green-200">
            <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 text-white flex items-center justify-between">
              <div className="flex items-center gap-1 font-semibold text-xs">
                <MessageCircle className="h-3.5 w-3.5" /> Ask AI • Helper
              </div>
              <button className="text-white/90 hover:text-white text-xs" onClick={() => setChatOpen(false)}>Close</button>
            </div>
            <div className="p-2 border-b border-green-100">
              <div className="flex flex-wrap gap-0.5">
                {['Studios under 10k', '2BR with wifi', 'Near Cebu City', 'Parking + AC'].map((s) => (
                  <button 
                    key={s} 
                    onClick={() => { setChatInput(s); setTimeout(() => sendChat(), 0); }} 
                    className="text-xs px-1.5 py-0.5 rounded-full bg-gradient-to-r from-green-50 to-blue-50 text-green-700 border border-green-200 hover:from-green-100 hover:to-blue-100"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-2 h-48 overflow-y-auto space-y-1.5 bg-white">
              {messages.map((m, idx) => (
                <div key={idx} className={`${m.role === 'assistant' ? 'bg-gradient-to-r from-green-50 to-blue-50' : 'bg-gray-50'} p-1.5 rounded text-xs text-gray-800 border border-green-100`}>
                  {m.content}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-2 border-t border-green-100 flex gap-1">
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendChat(); }}
                placeholder="Ask for wifi 2BR in Cebu..."
                className="flex-1 px-2 py-1.5 rounded border border-green-200 text-xs focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-400"
              />
              <Button 
                size="sm" 
                onClick={sendChat} 
                className="text-xs h-8 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
              >
                Send
              </Button>
            </div>
          </Card>
        ) : (
          <Button 
            onClick={() => setChatOpen(true)} 
            className="gap-1 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg text-xs h-8 text-white"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            Ask AI
          </Button>
        )}
      </div>
    </div>
  );
};

export default BrowseUnit;
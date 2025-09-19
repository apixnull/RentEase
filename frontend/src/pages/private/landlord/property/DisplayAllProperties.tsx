import { useMemo, useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Search, Home, Building, MapPin, 
  ChevronLeft, ChevronRight, X, Plus, Filter
} from "lucide-react";

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
  Unit?: Array<{ id: string }>;
};

function formatAddress(property: Property): string {
  const locality = property.city?.name || property.municipality?.name || "";
  const segments = [property.street, property.barangay, locality, property.zipCode].filter(Boolean);
  return segments.join(", ");
}

const baseExample: Property = {
  id: "base",
  title: "Sample Property",
  type: "APARTMENT",
  street: "123 Mango Ave",
  barangay: "Barangay Luz",
  zipCode: "6000",
  city: { id: "c1", name: "Cebu City" },
  municipality: null,
  mainImageUrl: "https://images.unsplash.com/photo-1749315098378-4671599e1d81?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  Unit: [{ id: "u1" }, { id: "u2" }, { id: "u3" }],
};

const mockProperties: Property[] = Array.from({ length: 37 }).map((_, idx) => {
  const types = ["APARTMENT", "CONDOMINIUM", "BOARDING_HOUSE", "SINGLE_HOUSE"] as const;
  const cities = [
    { id: "c1", name: "Cebu City" },
    { id: "c2", name: "Mandaue" },
  ];
  const municipalities = [
    { id: "m1", name: "Toledo" },
    { id: "m2", name: "Danao" },
  ];

  const useCity = idx % 2 === 0;
  const place = useCity ? cities[idx % cities.length] : municipalities[idx % municipalities.length];
  const type = types[idx % types.length];

  return {
    ...baseExample,
    id: `p-${idx + 1}`,
    title: `${baseExample.title} ${idx + 1}`,
    type,
    city: useCity ? (place as { id: string; name: string }) : null,
    municipality: !useCity ? (place as { id: string; name: string }) : null,
  } as Property;
});

const getPropertyTypeIcon = (type: string) => {
  switch (type) {
    case "APARTMENT":
    case "CONDOMINIUM":
      return <Building className="h-4 w-4" />;
    case "BOARDING_HOUSE":
    case "SINGLE_HOUSE":
      return <Home className="h-4 w-4" />;
    default:
      return <Home className="h-4 w-4" />;
  }
};

const DisplayProperty = () => {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [placeFilter, setPlaceFilter] = useState<string>("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<number | null>(null);

  const properties = mockProperties;

  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(properties.map((p) => p.type)));
  }, [properties]);

  const uniquePlaces = useMemo(() => {
    const names = properties.map((p) => p.city?.name || p.municipality?.name).filter(Boolean) as string[];
    return Array.from(new Set(names));
  }, [properties]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return properties.filter((p) => {
      if (typeFilter !== "ALL" && p.type !== typeFilter) return false;
      if (placeFilter !== "ALL") {
        const placeName = (p.city?.name || p.municipality?.name || "").toLowerCase();
        if (placeName !== placeFilter.toLowerCase()) return false;
      }
      if (!normalizedQuery) return true;
      const address = formatAddress(p).toLowerCase();
      const title = p.title.toLowerCase();
      return title.includes(normalizedQuery) || address.includes(normalizedQuery);
    });
  }, [properties, query, typeFilter, placeFilter]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  function goToPage(next: number) {
    const clamped = Math.min(Math.max(1, next), totalPages);
    setPage(clamped);
  }

  const resetFilters = () => {
    setQuery("");
    setTypeFilter("ALL");
    setPlaceFilter("ALL");
    setPage(1);
  };

  // Handle horizontal scrolling on mobile
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeoutRef.current !== null) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = window.setTimeout(() => {
        setIsScrolling(false);
        scrollTimeoutRef.current = null;
      }, 150);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current !== null) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
    };
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-sky-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-medium">
            <span>Landlord • Properties</span>
          </div>
          <h1 className="mt-3 text-2xl md:text-3xl font-bold text-gray-900">Your Properties</h1>
          <p className="text-sm text-gray-600 mt-1">Manage and view all your rental properties</p>
        </div>
        
        <Button className="bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 gap-2">
          <Plus className="h-4 w-4" />
          Add Property
        </Button>
      </div>

      {/* Search and Filter Section */}
      <Card className="p-4 md:p-6 bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                value={query}
                onChange={(e) => {
                  setPage(1);
                  setQuery(e.target.value);
                }}
                placeholder="Search properties by title or address..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
            
            <Button 
              variant="outline" 
              className="md:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className={`flex-col sm:flex-row gap-3 ${showFilters ? 'flex' : 'hidden md:flex'}`}>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select
                value={typeFilter}
                onChange={(e) => {
                  setPage(1);
                  setTypeFilter(e.target.value);
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              >
                <option value="ALL">All Property Types</option>
                {uniqueTypes.map((t) => (
                  <option key={t} value={t}>
                    {t.replaceAll("_", " ")}
                  </option>
                ))}
              </select>

              <select
                value={placeFilter}
                onChange={(e) => {
                  setPage(1);
                  setPlaceFilter(e.target.value);
                }}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              >
                <option value="ALL">All Locations</option>
                {uniquePlaces.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-sm text-gray-600">
          Showing <span className="font-medium">{current.length}</span> of{" "}
          <span className="font-medium">{filtered.length}</span> properties
        </p>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Page</span>
          <span className="font-medium">{page}</span>
          <span>of</span>
          <span className="font-medium">{totalPages}</span>
        </div>
      </div>

      {/* Properties Grid */}
      {current.length > 0 ? (
        <>
          {/* Mobile horizontal scroll */}
          <div className="md:hidden -mx-4 px-4">
            <div 
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {current.map((property) => {
                const unitsCount = property.Unit?.length ?? 0;
                return (
                  <Card 
                    key={property.id}
                    className="min-w-[85%] snap-center overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      {property.mainImageUrl ? (
                        <img
                          src={property.mainImageUrl}
                          alt={property.title}
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center">
                          <Home className="h-12 w-12 text-emerald-400" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-emerald-700">
                          {getPropertyTypeIcon(property.type)}
                          <span>{property.type.replaceAll("_", " ")}</span>
                        </div>
                      </div>
                      <div className="absolute top-3 right-3">
                        <div className="bg-emerald-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                          {unitsCount} {unitsCount === 1 ? 'Unit' : 'Units'}
                        </div>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 truncate">{property.title}</h3>
                      <div className="flex items-start gap-2 mt-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{formatAddress(property)}</span>
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <Link to={`/landlord/properties/${property.id}?tab=overview`}>
                          <Button variant="outline" size="sm" className="w-full">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
            {!isScrolling && (
              <div className="flex justify-center mt-2">
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i + 1 === page ? 'w-6 bg-emerald-500' : 'w-2 bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Desktop grid */}
          <div className="hidden md:grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {current.map((property) => {
              const unitsCount = property.Unit?.length ?? 0;
              return (
                <Card 
                  key={property.id} 
                  className="overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-md"
                >
                  <div className="relative aspect-video overflow-hidden">
                    {property.mainImageUrl ? (
                      <img
                        src={property.mainImageUrl}
                        alt={property.title}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center">
                        <Home className="h-12 w-12 text-emerald-400" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-emerald-700">
                        {getPropertyTypeIcon(property.type)}
                        <span>{property.type.replaceAll("_", " ")}</span>
                      </div>
                    </div>
                    <div className="absolute top-3 right-3">
                      <div className="bg-emerald-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                        {unitsCount} {unitsCount === 1 ? 'Unit' : 'Units'}
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate">{property.title}</h3>
                    <div className="flex items-start gap-2 mt-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{formatAddress(property)}</span>
                    </div>
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <Link to={`/landlord/properties/${property.id}?tab=overview`}>
                        <Button variant="outline" size="sm" className="w-full">View Details</Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <Card className="p-10 text-center border border-dashed border-gray-300 bg-gradient-to-br from-emerald-50/50 to-sky-50/50">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-emerald-100 to-sky-100 flex items-center justify-center mb-4">
            <Home className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No properties found</h3>
          <p className="text-gray-600 mt-1 max-w-md mx-auto">
            Try adjusting your search filters or add a new property to get started.
          </p>
          <Button className="mt-4 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 gap-2">
            <Plus className="h-4 w-4" />
            Add Your First Property
          </Button>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} properties
          </p>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => goToPage(page - 1)} 
              disabled={page === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={page === pageNum ? "default" : "outline"}
                    size="sm"
                    className={`h-9 w-9 p-0 ${page === pageNum ? 'bg-gradient-to-r from-emerald-600 to-sky-600' : ''}`}
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
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayProperty;
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Home,
  Building,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar,
  X,
  Sparkles,
  Wrench,
} from "lucide-react";
import { getLandlordPropertiesRequest } from "@/api/landlord/propertyApi";
import { toast } from "sonner";
import { motion } from "framer-motion";

type Property = {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  address: {
    street: string;
    barangay: string;
    zipCode: string;
    city: {
      id: string;
      name: string;
    };
    municipality: { id: string; name: string } | null;
  };
  mainImageUrl?: string | null;
  unitsSummary: {
    total: number;
    listed: number;
    available: number;
    occupied: number;
    maintenance: number;
  };
};

const PROPERTY_TYPES = [
  { value: "ALL", label: "All Types", icon: Home },
  { value: "APARTMENT", label: "Apartment", icon: Building },
  { value: "CONDOMINIUM", label: "Condominium", icon: Building },
  { value: "BOARDING_HOUSE", label: "Boarding House", icon: Home },
  { value: "SINGLE_HOUSE", label: "Single House", icon: Home },
];


function formatAddress(property: Property): string {
  const locality = property.address.city?.name || property.address.municipality?.name || "";
  const segments = [property.address.street, property.address.barangay, locality].filter(Boolean);
  return segments.join(", ");
}

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

const formatPropertyType = (type: string): string => {
  return type.replaceAll("_", " ").toLowerCase();
};

const formatDateDisplay = (property: Property): { text: string; isNew: boolean } => {
  const created = new Date(property.createdAt);
  const updated = new Date(property.updatedAt);
  const now = new Date();
  
  const diffCreated = Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  const diffUpdated = Math.ceil((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffCreated <= 3) {
    return { text: "Just Added", isNew: true };
  }
  
  if (diffUpdated <= 1) return { text: "Updated today", isNew: false };
  if (diffUpdated === 1) return { text: "Updated yesterday", isNew: false };
  if (diffUpdated < 7) return { text: `Updated ${diffUpdated} days ago`, isNew: false };
  
  return { text: `Updated ${updated.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`, isNew: false };
};

const shouldShowNewBadge = (property: Property): boolean => {
  const created = new Date(property.createdAt);
  const now = new Date();
  const diffCreated = Math.ceil((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  return diffCreated <= 3;
};

const DisplayProperties = () => {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState("ALL");
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const res = await getLandlordPropertiesRequest({
          signal: controller.signal,
        });
        setProperties(res.data);
      } catch (err: any) {
        const isAborted = err?.name === "AbortError" || err?.code === "ERR_CANCELED";
        if (!isAborted) {
          console.error("Error fetching properties:", err);
          toast.error("Failed to fetch properties");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
    return () => controller.abort();
  }, []);

  const sortedProperties = useMemo(() => {
    return [...properties].sort((a, b) => {
      const aRecentDate = new Date(Math.max(
        new Date(a.createdAt).getTime(),
        new Date(a.updatedAt).getTime()
      ));
      
      const bRecentDate = new Date(Math.max(
        new Date(b.createdAt).getTime(),
        new Date(b.updatedAt).getTime()
      ));
      
      return bRecentDate.getTime() - aRecentDate.getTime();
    });
  }, [properties]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    let result = sortedProperties;

    if (selectedType !== "ALL") {
      result = result.filter(property => property.type === selectedType);
    }

    if (normalizedQuery) {
      result = result.filter((p) => {
        const address = formatAddress(p).toLowerCase();
        const title = p.title.toLowerCase();
        return title.includes(normalizedQuery) || address.includes(normalizedQuery);
      });
    }

    return result;
  }, [sortedProperties, query, selectedType]);

  const propertiesPerPage = 8;
  const totalPages = Math.max(1, Math.ceil(filtered.length / propertiesPerPage));
  const currentPageProperties = filtered.slice(
    (page - 1) * propertiesPerPage,
    page * propertiesPerPage
  );

  const goToPage = (newPage: number) => {
    setPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, page - 1);
      let end = Math.min(totalPages - 1, page + 1);

      if (page <= 3) {
        end = Math.min(totalPages - 1, maxVisiblePages - 1);
      }

      if (page >= totalPages - 2) {
        start = Math.max(2, totalPages - (maxVisiblePages - 2));
      }

      if (start > 2) {
        pages.push(-1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push(-2);
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const PropertyCard = ({ property }: { property: Property }) => {
    const showNewBadge = shouldShowNewBadge(property);
    const dateInfo = formatDateDisplay(property);
    const hasMaintenance = property.unitsSummary.maintenance > 0;

    return (
      <Card 
        className="group w-full overflow-hidden border border-gray-200/80 hover:border-emerald-200 transition-all duration-300 hover:shadow-xl rounded-xl bg-white/90 backdrop-blur-sm cursor-pointer"
        onClick={() => navigate(`/landlord/properties/${property.id}`)}
      >
        {/* Image Section - Reduced */}
        <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-emerald-50/50 to-blue-50/50">
          {property.mainImageUrl ? (
            <img
              src={property.mainImageUrl}
              alt={property.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-emerald-50 to-blue-100 flex items-center justify-center">
              <Home className="h-8 w-8 text-emerald-400" />
            </div>
          )}
          
          {/* Top Badges */}
          <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
            <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-emerald-700 border border-emerald-200/50">
              {getPropertyTypeIcon(property.type)}
              <span className="capitalize">{formatPropertyType(property.type)}</span>
            </div>
            
            <div className="flex gap-1.5">
              {showNewBadge && (
                <div className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  <Sparkles className="h-3 w-3" />
                  <span>NEW</span>
                </div>
              )}
              {hasMaintenance && (
                <div className="flex items-center gap-1 bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                  <Wrench className="h-3 w-3" />
                  <span>{property.unitsSummary.maintenance}</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Gradient Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/30 to-transparent" />
        </div>

        {/* Content Section - Reduced */}
        <div className="p-3 space-y-2">
          {/* Title */}
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2 flex-1 pr-2">
              {property.title}
            </h3>
          </div>

          {/* Location */}
          <div className="flex items-start gap-1.5 text-xs text-gray-600">
            <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <span className="leading-tight line-clamp-2 flex-1">
              {formatAddress(property)}
            </span>
          </div>

          {/* Date Information */}
          <div className={`flex items-center gap-1.5 text-xs ${
            dateInfo.isNew ? "text-emerald-600 font-semibold" : "text-gray-500"
          }`}>
            <Calendar className="h-3.5 w-3.5" />
            <span>{dateInfo.text}</span>
          </div>

          {/* Units Summary */}
          <div className="grid grid-cols-4 gap-1.5 p-2 bg-gradient-to-r from-emerald-50/80 to-blue-50/80 rounded-lg border border-emerald-100/50">
            <div className="text-center">
              <div className="font-bold text-gray-900 text-sm">{property.unitsSummary.total}</div>
              <div className="text-[10px] text-gray-600 mt-0.5">Total</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-emerald-600 text-sm">{property.unitsSummary.listed}</div>
              <div className="text-[10px] text-gray-600 mt-0.5">Listed</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-600 text-sm">{property.unitsSummary.occupied}</div>
              <div className="text-[10px] text-gray-600 mt-0.5">Occupied</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-amber-600 text-sm">{property.unitsSummary.maintenance}</div>
              <div className="text-[10px] text-gray-600 mt-0.5">Maint</div>
            </div>
          </div>

        </div>
      </Card> 
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 w-full">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-40 hidden sm:block" />
              <Skeleton className="h-9 w-32 hidden sm:block" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden rounded-2xl">
              <Skeleton className="aspect-[5/3] w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-40" />
                <div className="grid grid-cols-4 gap-2">
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                  <Skeleton className="h-10" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Custom Page Header - Matching Financials.tsx */}
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
              <div className="flex items-center gap-4 min-w-0">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: [0, -3, 3, 0] }}
                  className="relative flex-shrink-0"
                >
                  <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-sky-600 via-cyan-600 to-emerald-600 text-white grid place-items-center shadow-xl shadow-cyan-500/30">
                    <Home className="h-5 w-5 relative z-10" />
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
                      Your Properties
                    </h1>
                    <motion.div
                      animate={{ rotate: [0, 8, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Sparkles className="h-4 w-4 text-cyan-500" />
                    </motion.div>
                  </div>
                  <p className="text-sm text-slate-600 leading-6 flex items-center gap-1.5">
                    <Building className="h-4 w-4 text-emerald-500" />
                    Manage your rental portfolio
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  onClick={() => navigate("/landlord/properties/create")}
                  className="h-11 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 px-5 text-sm font-semibold text-white shadow-md shadow-cyan-500/30 hover:brightness-110 gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Property
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

      {/* Enhanced Search and Filter Bar */}
      <Card className="p-4 bg-white/90 backdrop-blur-sm border border-gray-200/60 shadow-sm rounded-xl">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {/* Search Input */}
          <div className="flex-1 relative min-w-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, location, or type..."
              className="pl-10 h-10 text-sm"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter and Count */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-sm text-gray-600 whitespace-nowrap">
              <span className="font-semibold text-emerald-600">{filtered.length}</span> properties
            </div>

            <Select
              value={selectedType}
              onValueChange={(val) => {
                setSelectedType(val);
                setPage(1);
              }}
            >
              <SelectTrigger className="h-10 min-w-[160px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent align="end">
                {PROPERTY_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filter Indicator */}
        {selectedType !== "ALL" && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-emerald-200/30">
            <span className="text-sm text-gray-600">Active filter:</span>
            <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-medium">
              {PROPERTY_TYPES.find((t) => t.value === selectedType)?.label}
              <button
                onClick={() => setSelectedType("ALL")}
                className="ml-1 hover:text-emerald-900 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Enhanced Properties Grid */}
      {currentPageProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
          {currentPageProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center border border-dashed border-gray-200 bg-white/95 backdrop-blur-sm rounded-xl">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4 border border-emerald-100">
            <Home className="h-8 w-8 text-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No properties found</h3>
          <p className="text-gray-600 text-sm mb-6 max-w-md mx-auto">
            {selectedType !== "ALL" || query
              ? "Try adjusting your filters or search criteria to find what you're looking for."
              : "Start building your rental portfolio by adding your first property."}
          </p>
          <Button
            onClick={() => {
              navigate("/landlord/properties/create");
              setSelectedType("ALL");
              setQuery("");
            }}
            className="bg-emerald-600 hover:bg-emerald-700 gap-2 text-white py-2.5 px-5 rounded-md font-medium"
          >
            <Plus className="h-5 w-5" />
            Add Your First Property
          </Button>
        </Card>
      )}

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <Card className="p-4 bg-white/90 backdrop-blur-sm border border-gray-200/60 rounded-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-emerald-600">{(page - 1) * propertiesPerPage + 1}-{Math.min(page * propertiesPerPage, filtered.length)}</span> of <span className="font-semibold">{filtered.length}</span> properties
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                className="h-9 w-9 p-0 rounded-md border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-1">
                {getPageNumbers().map((pageNum, index) => {
                  if (pageNum === -1 || pageNum === -2) {
                    return (
                      <span key={`ellipsis-${index}`} className="px-2 text-gray-400 text-sm">
                        ...
                      </span>
                    );
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      className={`h-9 w-9 p-0 rounded-md text-sm font-medium ${page === pageNum ? "bg-emerald-600 text-white shadow-sm" : "border-gray-200 hover:bg-gray-50"}`}
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
                className="h-9 w-9 p-0 rounded-md border-gray-200 hover:bg-gray-50 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DisplayProperties;
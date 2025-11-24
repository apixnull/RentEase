import { type ReactNode, isValidElement, cloneElement, useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Building, LayoutDashboard, Home, MapPin, Sparkles, Building2, RotateCcw, Loader2, Calendar } from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPropertyDetailsAndUnitsRequest } from "@/api/landlord/propertyApi";

interface CityRef { id: string; name: string }
interface MunicipalityRef { id: string; name: string }
interface UnitsSummary { total?: number; maintenance?: number; unusable?: number }
interface PropertyAddress { street?: string; barangay?: string; zipCode?: string; city?: CityRef | null; municipality?: MunicipalityRef | null }
interface PropertyLocation { latitude?: number | null; longitude?: number | null }
interface PropertyMedia { mainImageUrl?: string | null; nearInstitutions?: Array<{ name: string; type: string }> | null; otherInformation?: Array<{ context: string; description: string }> | null }
interface Property {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  address?: PropertyAddress;
  location?: PropertyLocation;
  media?: PropertyMedia;
  unitsSummary?: UnitsSummary;
}

interface PropertyLayoutProps {
  children: ReactNode;
}

const PropertyLayout = ({ children }: PropertyLayoutProps) => {
  const { propertyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Determine if we're on details or units page
  const isDetailsPage = location.pathname.includes("/properties/") && !location.pathname.includes("/units");
  const isUnitsPage = location.pathname.includes("/units");

  const handleNavigateToDetails = () => {
    navigate(`/landlord/properties/${propertyId}`);
  };

  const handleNavigateToUnits = () => {
    navigate(`/landlord/units/${propertyId}`);
  };

  const fetchAll = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!propertyId) return;
    const controller = new AbortController();
      try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
        setError(null);
        const propRes = await getPropertyDetailsAndUnitsRequest(propertyId, { signal: controller.signal });
        setProperty(propRes.data?.property ?? null);
        setUnits(propRes.data?.units ?? []);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.response?.data?.message || "Failed to load property data");
        }
      } finally {
      if (!silent) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
      }
    };  

  useEffect(() => {
    fetchAll();
  }, [propertyId]);

  const handleRefresh = () => {
    fetchAll({ silent: true });
  };

  const injectedChild = isValidElement(children)
    ? cloneElement(children as any, { property, units, loading, error })
    : children;

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatAddress = (property: Property): string => {
    const locality = property.address?.city?.name || property.address?.municipality?.name || "";
    const segments = [property.address?.street, property.address?.barangay, locality, property.address?.zipCode].filter(Boolean);
    return segments.join(", ");
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "APARTMENT":
      case "CONDOMINIUM":
        return Building2;
      default:
        return Home;
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Custom Page Header - Matching DisplayProperties.tsx */}
      {property && (
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
                    {(() => {
                      const TypeIcon = getTypeIcon(property.type);
                      return (
                        <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-sky-600 via-cyan-600 to-emerald-600 text-white grid place-items-center shadow-xl shadow-cyan-500/30">
                          <TypeIcon className="h-5 w-5 relative z-10" />
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                        </div>
                      );
                    })()}
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
                        {property.title}
                      </h1>
                      <motion.div
                        animate={{ rotate: [0, 8, -8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Sparkles className="h-4 w-4 text-cyan-500" />
                      </motion.div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm border border-slate-200 text-xs sm:text-sm">
                        <Building className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="capitalize">{property.type.replaceAll("_", " ")}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm border border-slate-200 text-xs sm:text-sm">
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
                        <span>Created {formatDate(property.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm border border-slate-200 text-xs sm:text-sm">
                        <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
                        <span>Updated {formatDate(property.updatedAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm border border-slate-200 text-xs sm:text-sm text-slate-600">
                      <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" />
                      <span className="truncate max-w-[220px] sm:max-w-[360px]">
                        {formatAddress(property) || 'Address not provided'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    onClick={handleRefresh}
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
      )}

      {/* Navigation Tabs */}
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-0">
          <div className="border-b bg-gradient-to-br from-slate-50/80 via-gray-50/60 to-slate-50/80 backdrop-blur-sm">
            <div className="w-full h-auto bg-transparent p-2 sm:p-3 gap-2 grid grid-cols-2">
              <button
                onClick={handleNavigateToDetails}
                className={`relative flex-1 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-medium transition-all overflow-hidden ${
                  isDetailsPage
                    ? `bg-gradient-to-r from-emerald-500 to-teal-500/20 text-emerald-700 border border-emerald-200/50 shadow-sm backdrop-blur-sm`
                    : `bg-gray-50/50 border border-gray-200 text-gray-600 hover:bg-gray-100/50`
                }`}
              >
                {isDetailsPage && (
                  <div className={`absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500/10 opacity-50`} />
                )}
                <LayoutDashboard className={`w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 ${isDetailsPage ? 'text-emerald-700' : 'text-gray-500'}`} />
                <span className="relative z-10">Property Overview</span>
              </button>
              <button
                onClick={handleNavigateToUnits}
                className={`relative flex-1 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-medium transition-all overflow-hidden ${
                  isUnitsPage
                    ? `bg-gradient-to-r from-emerald-500 to-teal-500/20 text-emerald-700 border border-emerald-200/50 shadow-sm backdrop-blur-sm`
                    : `bg-gray-50/50 border border-gray-200 text-gray-600 hover:bg-gray-100/50`
                }`}
              >
                {isUnitsPage && (
                  <div className={`absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500/10 opacity-50`} />
                )}
                <Building className={`w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 ${isUnitsPage ? 'text-emerald-700' : 'text-gray-500'}`} />
                <span className="relative z-10">Units</span>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Page Content */}
      <div className="space-y-6">
        {injectedChild}
      </div>
    </div>
  );
};

export default PropertyLayout;
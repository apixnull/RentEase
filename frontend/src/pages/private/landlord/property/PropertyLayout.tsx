import { type ReactNode, isValidElement, cloneElement, useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Building, LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getPropertyDetailsAndUnitsRequest } from "@/api/landlord/propertyApi";
import PropertyHeader from "./PropertyHeader.tsx";

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

  // Determine if we're on details or units page
  const isDetailsPage = location.pathname.includes("/properties/") && !location.pathname.includes("/units");
  const isUnitsPage = location.pathname.includes("/units");

  const handleNavigateToDetails = () => {
    navigate(`/landlord/properties/${propertyId}`);
  };

  const handleNavigateToUnits = () => {
    navigate(`/landlord/units/${propertyId}`);
  };

  useEffect(() => {
    if (!propertyId) return;
    const controller = new AbortController();
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);
        const propRes = await getPropertyDetailsAndUnitsRequest(propertyId, { signal: controller.signal });
        setProperty(propRes.data?.property ?? null);
        setUnits(propRes.data?.units ?? []);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setError(err.response?.data?.message || "Failed to load property data");
        }
      } finally {
        setLoading(false);
      }
    };  
    fetchAll();
    return () => controller.abort();
  }, [propertyId]);

  const injectedChild = isValidElement(children)
    ? cloneElement(children as any, { property, units, loading, error })
    : children;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      {/* Breadcrumb Header */}
      {property && (
        <PropertyHeader property={property} />
      )}

      {/* Navigation Tabs */}
      <Card className="p-1.5 border-0 shadow-sm">
        <div className="flex gap-1">
          <Button
            variant={isDetailsPage ? "default" : "ghost"}
            size="sm"
            className={`gap-2 flex-1 justify-center ${
              isDetailsPage
                ? "bg-gradient-to-r from-emerald-600 to-sky-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={handleNavigateToDetails}
          >
            <LayoutDashboard className="h-4 w-4" />
            Property Overview
          </Button>
          <Button
            variant={isUnitsPage ? "default" : "ghost"}
            size="sm"
            className={`gap-2 flex-1 justify-center ${
              isUnitsPage
                ? "bg-gradient-to-r from-emerald-600 to-sky-600 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={handleNavigateToUnits}
          >
            <Building className="h-4 w-4" />
            Units
          </Button>
        </div>
      </Card>

      {/* Page Content */}
      <div className="space-y-6">
        {injectedChild}
      </div>
    </div>
  );
};

export default PropertyLayout;
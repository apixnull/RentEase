import { type ReactNode } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Building, LayoutDashboard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PropertyLayoutProps {
  children: ReactNode;
}

const PropertyLayout = ({ children }: PropertyLayoutProps) => {
  const { propertyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine if we're on details or units page
  const isDetailsPage = location.pathname.includes("/properties/") && !location.pathname.includes("/units");
  const isUnitsPage = location.pathname.includes("/units");

  const handleBackToProperties = () => {
    navigate("/landlord/properties");
  };

  const handleNavigateToDetails = () => {
    navigate(`/landlord/properties/${propertyId}`);
  };

  const handleNavigateToUnits = () => {
    navigate(`/landlord/units/${propertyId}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between">
    

        {/* Back to Properties Button */}
        <Button
          variant="outline"
          className="gap-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
          onClick={handleBackToProperties}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Properties
        </Button>
      </div>

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
        {children}
      </div>
    </div>
  );
};

export default PropertyLayout;
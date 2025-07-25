// src/pages/landlord/property/Properties.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { GlobalLoader } from "@/components/shared/GlobalLoader";
import { getPropertiesRequest } from "@/services/api/landlord.api";
import GenericErrorState from "@/components/shared/GenericErrorState";
import { ChevronDown, ChevronUp } from "lucide-react";

// UPDATED: Simplified Feature type to string array
type UnitCounts = {
  AVAILABLE: number;
  OCCUPIED: number;
  MAINTENANCE: number;
};

// UPDATED: Simplified PriceRange type
type PriceRange = {
  min: number;
  max: number;
};

type Property = {
  id: string;
  title: string;
  description: string;
  type: string;
  street: string;
  barangay: string;
  municipality: string;
  city: string;
  province: string;
  zipCode: string;
  requiresScreening: boolean;
  isListed: boolean;
  mainImageUrl: string | null;
  amenities: string[];
  features: string[]; // CHANGED: Now string array
  unitCounts: UnitCounts;
  unitCount: number;
  pendingApplicationCount: number;
  priceRange: PriceRange; // CHANGED: Simplified structure
};

// Helper to format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Helper to format property type
const formatPropertyType = (type: string): string => {
  return type
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Helper to get property type color
const getPropertyTypeColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'apartment': return 'bg-teal-100 text-teal-800';
    case 'condominium': return 'bg-purple-100 text-purple-800';
    case 'boarding_house': return 'bg-amber-100 text-amber-800';
    default: return 'bg-blue-100 text-blue-800';
  }
};

// Helper to format feature name
const formatFeatureName = (name: string): string => {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
};

const Properties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedAmenities, setExpandedAmenities] = useState<Record<string, boolean>>({});
  const [expandedFeatures, setExpandedFeatures] = useState<Record<string, boolean>>({});
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await getPropertiesRequest();
        
        // Map backend data to frontend structure
        const mappedProperties = res.data.properties.map((prop: any) => ({
          ...prop,
          // Handle empty unitCounts
          unitCounts: prop.unitCounts && Object.keys(prop.unitCounts).length > 0 
            ? prop.unitCounts 
            : { AVAILABLE: 0, OCCUPIED: 0, MAINTENANCE: 0 },
          // CHANGED: Map sharedFeatures to features
          features: prop.sharedFeatures || [],  // <-- THIS IS THE CRITICAL CHANGE
        }));
                
        setProperties(mappedProperties);
        setFilteredProperties(mappedProperties);
      } catch (err) {
        console.error("Error fetching properties:", err);
        setError("Failed to load properties. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProperties(properties);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = properties.filter(
      (property) =>
        property.title.toLowerCase().includes(term) ||
        property.description.toLowerCase().includes(term) ||
        property.type.toLowerCase().includes(term) ||
        property.barangay.toLowerCase().includes(term) ||
        property.city.toLowerCase().includes(term) ||
        property.street.toLowerCase().includes(term) ||
        property.amenities.some(amenity => 
          amenity.toLowerCase().includes(term)
        ) ||
        // UPDATED: Feature search now uses strings directly
        property.features.some(feature => 
          feature.toLowerCase().includes(term)
        )
    );
    setFilteredProperties(filtered);
    setCurrentPage(1);
  }, [searchTerm, properties]);

  const toggleAmenities = (propertyId: string) => {
    setExpandedAmenities(prev => ({
      ...prev,
      [propertyId]: !prev[propertyId]
    }));
  };

  const toggleFeatures = (propertyId: string) => {
    setExpandedFeatures(prev => ({
      ...prev,
      [propertyId]: !prev[propertyId]
    }));
  };

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProperties = filteredProperties.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  if (isLoading) {
    return <GlobalLoader text="Loading properties..." isLoading />;
  }

  if (error) {
    return <GenericErrorState errorMessage={error} title="Property Load Error" retryText="Reload Page"/>;
  }

  if (properties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12">
        <div className="text-center max-w-md">
          <div className="bg-gradient-to-r from-teal-100 to-blue-100 rounded-full p-4 inline-block mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-teal-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            No Properties Found
          </h2>
          <p className="text-gray-600 mb-6">
            You haven't listed any properties yet. Start by adding your first
            property to manage.
          </p>
          <Button asChild>
            <Link to="/landlord/property/add-property">Add Property</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-5 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <span className="bg-gradient-to-r from-teal-600 to-blue-600 text-transparent bg-clip-text">
                My Properties
              </span>
              <Badge variant="secondary" className="text-sm font-semibold">
                {properties.length} properties
              </Badge>
            </h1>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:max-w-xs">
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 absolute left-3 top-3 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <Button asChild className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 shadow-md">
              <Link to="/landlord/property/add-property" className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Property
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentProperties.map((property) => {
          const isAmenitiesExpanded = expandedAmenities[property.id];
          const isFeaturesExpanded = expandedFeatures[property.id];
          
          // UPDATED: Get all features as string array
          const allFeatures = property.features || [];
          const maxFeaturesToShow = 3;
          
          return (
            <Link to={`/landlord/property/${property.id}`} key={property.id} className="group">
              <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-xl border border-gray-200 rounded-xl hover:-translate-y-1">
                {/* Property Image */}
                <div className="relative">
                  {property.mainImageUrl ? (
                    <div className="h-48 bg-gray-200">
                      <img
                        src={property.mainImageUrl}
                        alt={property.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-r from-teal-50 to-blue-50 border-b flex items-center justify-center">
                      <div className="text-center p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs text-gray-500 mt-2">No property image</p>
                      </div>
                    </div>
                  )}
                  {/* Status Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <Badge variant={property.isListed ? "default" : "secondary"} className="text-xs px-2 py-1 shadow-md">
                      {property.isListed ? "Listed" : "Unlisted"}
                    </Badge>
                    <Badge className={`text-xs px-2 py-1 shadow-md ${getPropertyTypeColor(property.type)}`}>
                      {formatPropertyType(property.type)}
                    </Badge>
                    {property.requiresScreening && (
                      <Badge variant="secondary" className="text-xs px-2 py-1 shadow-md bg-rose-100 text-rose-800">
                        Tenant Screening
                      </Badge>
                    )}
                  </div>
                </div>

                <CardHeader className="pb-3 px-4 pt-4">
                  <CardTitle className="text-lg font-bold line-clamp-1 group-hover:text-teal-600">{property.title}</CardTitle>
                  <CardDescription className="text-sm line-clamp-2 h-10 text-gray-600">
                    {property.description.length > 100 
                      ? `${property.description.substring(0, 100)}...` 
                      : property.description || "No description provided."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-grow pb-3 px-4">
                  {/* Location */}
                  <div className="flex items-start text-sm text-gray-600 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-gray-800">{`${property.street}, ${property.barangay}`}</p>
                      <p className="truncate text-gray-500">{`${property.municipality}, ${property.city}, ${property.province} ${property.zipCode}`}</p>
                    </div>
                  </div>
                  
                  {/* Features - Limited to 3 with show more */}
                  {allFeatures.length > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1.5">
                        <h4 className="text-xs font-semibold text-gray-500">Features</h4>
                        {allFeatures.length > maxFeaturesToShow && (
                          <button
                            onClick={(e) => { e.preventDefault(); toggleFeatures(property.id); }}
                            className="text-xs text-blue-600 hover:underline flex items-center z-10"
                          >
                            {isFeaturesExpanded ? "Show less" : "Show all"}
                            {isFeaturesExpanded ? <ChevronUp className="h-3 w-3 ml-0.5" /> : <ChevronDown className="h-3 w-3 ml-0.5" />}
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {/* UPDATED: Render features as simple badges */}
                        {(isFeaturesExpanded ? allFeatures : allFeatures.slice(0, maxFeaturesToShow)).map((feature, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs py-0.5 px-2 bg-white border-gray-200 text-gray-700"
                          >
                            {formatFeatureName(feature)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unit Metrics */}
                  <div className="grid grid-cols-4 gap-2 mb-4 text-center">
                    <div className="p-1.5 bg-teal-50 rounded-lg border border-teal-100">
                      <div className="text-base font-bold text-teal-800">{property.unitCounts.AVAILABLE}</div>
                      <div className="text-[0.7rem] font-medium text-teal-600">Available</div>
                    </div>
                    <div className="p-1.5 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="text-base font-bold text-blue-800">{property.unitCounts.OCCUPIED}</div>
                      <div className="text-[0.7rem] font-medium text-blue-600">Occupied</div>
                    </div>
                    <div className="p-1.5 bg-amber-50 rounded-lg border border-amber-100">
                      <div className="text-base font-bold text-amber-800">{property.unitCounts.MAINTENANCE}</div>
                      <div className="text-[0.7rem] font-medium text-amber-600">Maintenance</div>
                    </div>
                    <div className="p-1.5 bg-gray-100 rounded-lg border border-gray-200">
                      <div className="text-base font-bold text-gray-800">{property.unitCount}</div>
                      <div className="text-[0.7rem] font-medium text-gray-600">Total Units</div>
                    </div>
                  </div>
                  
                  {/* Price Range */}
                  {property.priceRange && (
                    <div className="mb-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">Price Range</h4>
                      <div className="text-center bg-gradient-to-r from-teal-50 to-blue-50 py-3 rounded-md">
                        <div className="font-bold text-teal-700 text-lg">
                          {formatCurrency(property.priceRange.min)} - {formatCurrency(property.priceRange.max)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {property.type === 'BOARDING_HOUSE' ? 'per Head' : 'per Unit'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Amenities */}
                  {property.amenities.length > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1.5">
                        <h4 className="text-xs font-semibold text-gray-500">Amenities</h4>
                        {property.amenities.length > 3 && (
                          <button
                            onClick={(e) => { e.preventDefault(); toggleAmenities(property.id); }}
                            className="text-xs text-blue-600 hover:underline flex items-center z-10"
                          >
                            {isAmenitiesExpanded ? "Show less" : "Show all"}
                            {isAmenitiesExpanded ? <ChevronUp className="h-3 w-3 ml-0.5" /> : <ChevronDown className="h-3 w-3 ml-0.5" />}
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(isAmenitiesExpanded ? property.amenities : property.amenities.slice(0, 3)).map((amenity, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs py-0.5 px-2 bg-white border-gray-200 text-gray-700 capitalize"
                          >
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-2 pb-4 px-4 mt-auto">
                  <div className="w-full">
                    {/* Applications */}
                    <div className={`flex items-center justify-between rounded-lg px-3 py-2 mb-3 ${
                      property.pendingApplicationCount > 0
                        ? "bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200"
                        : "bg-gray-100 border border-gray-200"
                    }`}>
                      <span className="text-sm font-medium text-gray-800">Pending Applications</span>
                      <span className={`text-sm font-bold rounded-full px-2 py-0.5 ${
                        property.pendingApplicationCount > 0
                          ? "text-blue-800 bg-blue-100"
                          : "text-gray-600 bg-gray-200"
                      }`}>
                        {property.pendingApplicationCount}
                      </span>
                    </div>
                    
                    <Button asChild className="w-full bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white shadow-lg transition-all duration-300 transform group-hover:scale-105">
                      <div className="w-full text-center">Manage Property</div>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className="border-gray-300 shadow-sm"
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            className="border-gray-300 shadow-sm"
          >
            Next
          </Button>
        </div>
      )}

      {/* No results message */}
      {filteredProperties.length === 0 && (
        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border border-gray-200 mt-6">
          <h3 className="text-lg font-medium text-gray-800">
            No properties found
          </h3>
          <p className="text-gray-600 mt-1">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default Properties;
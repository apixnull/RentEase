// src/pages/landlord/property/Properties.tsx
import { useState, useEffect } from "react";
import { useLoaderData, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type Property = {
  id: string;
  title: string;
  description: string;
  type: string;
  street: string;
  barangay: string;
  city: string;
  province: string;
  requiresScreening: boolean;
  isListed: boolean;
};

type LoaderData = {
  properties: Property[];
};

const Properties = () => {
  const { properties: initialProperties } = useLoaderData() as LoaderData;
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter properties based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProperties(initialProperties);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = initialProperties.filter(
      (property) =>
        property.title.toLowerCase().includes(term) ||
        property.description.toLowerCase().includes(term) ||
        property.type.toLowerCase().includes(term) ||
        property.barangay.toLowerCase().includes(term) ||
        property.city.toLowerCase().includes(term)
    );
    setFilteredProperties(filtered);
    setCurrentPage(1); // Reset to first page when search changes
  }, [searchTerm, initialProperties]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProperties = filteredProperties.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // If there are no properties, show the empty state
  if (initialProperties.length === 0) {
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
            <Link to="/landlord/property/create">Add Property</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">
          My Properties
        </h1>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Input
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
          <Button asChild>
            <Link to="/landlord/property/create">+ Add Property</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
        {currentProperties.map((property) => (
          <div
            key={property.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200 hover:shadow-md transition-shadow text-sm"
          >
            {/* Property Details */}
            <div className="p-3">
              <div className="flex justify-between items-start gap-2 mb-1">
                <h3 className="font-bold text-gray-800 line-clamp-1 text-sm">
                  {property.title}
                </h3>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    variant={property.isListed ? "default" : "secondary"}
                    className="text-xs px-2 py-1"
                  >
                    {property.isListed ? "Listed" : "Unlisted"}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="shrink-0 text-xs px-1.5 py-0"
                  >
                    {property.type}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-xs mt-1 line-clamp-2 min-h-[40px]">
                {property.description || "No description provided"}
              </p>

              {/* Location */}
              <div className="mt-2 flex items-center text-xs text-gray-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3.5 w-3.5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="line-clamp-1">
                  {property.barangay}, {property.city}
                </span>
              </div>

              {/* Screening Requirement */}
              {property.requiresScreening && (
                <div className="mt-2 flex justify-center">
                  <Badge
                    variant="secondary"
                    className="text-2xs py-0.5 px-2 flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-3 w-3 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    Tenant Screening Required
                  </Badge>
                </div>
              )}

              {/* Manage Button */}
              <div className="mt-3 flex justify-center">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                >
                  <Link to={`/landlord/property/${property.id}`}>Manage</Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
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
          >
            Next
          </Button>
        </div>
      )}

      {/* No results message */}
      {filteredProperties.length === 0 && (
        <div className="text-center py-8">
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
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Grid,
  List,
  Plus,
  Star,
  MapPin,
  Home,
  Bed,
  Bath,
  Ruler,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Hardcoded properties data
const properties = [
  {
    id: 1,
    title: "Modern Downtown Apartment",
    address: "123 Main St, New York, NY",
    type: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    area: 1200,
    price: 3200,
    status: "occupied",
    rating: 4.8,
    image: "/property1.jpg",
  },
  {
    id: 2,
    title: "Cozy Suburban House",
    address: "456 Oak Ave, Brooklyn, NY",
    type: "House",
    bedrooms: 3,
    bathrooms: 2.5,
    area: 1800,
    price: 4200,
    status: "vacant",
    rating: 4.5,
    image: "/property2.jpg",
  },
  {
    id: 3,
    title: "Luxury Waterfront Condo",
    address: "789 Beach Blvd, Miami, FL",
    type: "Condo",
    bedrooms: 3,
    bathrooms: 3,
    area: 2200,
    price: 5800,
    status: "occupied",
    rating: 4.9,
    image: "/property3.jpg",
  },
  {
    id: 4,
    title: "Charming Studio Apartment",
    address: "101 Park Lane, Boston, MA",
    type: "Studio",
    bedrooms: 1,
    bathrooms: 1,
    area: 600,
    price: 1800,
    status: "vacant",
    rating: 4.2,
    image: "/property4.jpg",
  },
  {
    id: 5,
    title: "Spacious Family Home",
    address: "202 Pine Rd, Chicago, IL",
    type: "House",
    bedrooms: 4,
    bathrooms: 3,
    area: 2400,
    price: 3800,
    status: "occupied",
    rating: 4.7,
    image: "/property5.jpg",
  },
];

const statusVariants = {
  occupied: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  vacant: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
};

export const PropertiesPage = () => {
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold tracking-tight">My Properties</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "px-3",
                viewMode === "card" && "bg-white dark:bg-gray-700"
              )}
              onClick={() => setViewMode("card")}
            >
              <Grid className="h-4 w-4 mr-2" />
              <span>Cards</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "px-3",
                viewMode === "table" && "bg-white dark:bg-gray-700"
              )}
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4 mr-2" />
              <span>Table</span>
            </Button>
          </div>
          <Button asChild>
            <Link to="/landlord/properties/add" className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              <span>Add Property</span>
            </Link>
          </Button>
        </div>
      </div>

      {viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div
              key={property.id}
              className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 bg-white dark:bg-gray-900 rounded-full px-2 py-1 flex items-center text-sm font-medium">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                  {property.rating}
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{property.title}</h3>
                  <Badge
                    className={cn(
                      "text-xs",
                      statusVariants[property.status as keyof typeof statusVariants]
                    )}
                  >
                    {property.status === "occupied" ? "Occupied" : "Vacant"}
                  </Badge>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{property.address}</span>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2 text-sm">
                  <div className="flex flex-col items-center">
                    <Home className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <span>{property.type}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Bed className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <span>{property.bedrooms}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Bath className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <span>{property.bathrooms}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Ruler className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <span>{property.area} sqft</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
                    <span className="font-semibold">
                      {property.price.toLocaleString()}/mo
                    </span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/landlord/properties/${property.id}`}>
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-md border dark:border-gray-700">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Bed/Bath</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <img
                        src={property.image}
                        alt={property.title}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                      <div>
                        <div>{property.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {property.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{property.type}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                      <span className="truncate max-w-[150px]">
                        {property.address}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {property.bedrooms} / {property.bathrooms}
                  </TableCell>
                  <TableCell>{property.area} sqft</TableCell>
                  <TableCell>
                    ${property.price.toLocaleString()}/mo
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        "text-xs",
                        statusVariants[property.status as keyof typeof statusVariants]
                      )}
                    >
                      {property.status === "occupied" ? "Occupied" : "Vacant"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                      {property.rating}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/landlord/properties/${property.id}`}>
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
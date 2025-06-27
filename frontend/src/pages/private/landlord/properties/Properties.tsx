import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Grid,
  List,
  Plus,
  MapPin,
  Home,
  Search,
  Filter,
  ArrowUpDown,
  Layers,
  Check,
  X,
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
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Property types definition
type PropertyType = 
  | "APARTMENT" 
  | "HOUSE" 
  | "CONDO" 
  | "STUDIO" 
  | "COMMERCIAL" 
  | "TOWNHOUSE" 
  | "VILLA";

const formatPropertyType = (type: PropertyType): string => {
  const labels: Record<PropertyType, string> = {
    APARTMENT: "Apartment",
    HOUSE: "House",
    CONDO: "Condo",
    STUDIO: "Studio",
    COMMERCIAL: "Commercial",
    TOWNHOUSE: "Townhouse",
    VILLA: "Villa"
  };
  return labels[type] || type;
};

interface Property {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  listedPrice: number;
  isNegotiable: boolean;
  requiresScreening: boolean;
  createdAt: string;
  updatedAt: string;
  street: string;
  barangay: string;
  municipality: string;
  city: string;
  province: string;
  zipCode: string;
  tags: string[];
  unitCount: number;
  occupiedUnits: number;
  image: string;
}

const mockProperties: Property[] = [
  {
    id: "prop-1",
    title: "Modern BGC Condo",
    description: "Luxury condo in the heart of Bonifacio Global City",
    type: "CONDO",
    listedPrice: 45000,
    isNegotiable: true,
    requiresScreening: true,
    createdAt: "2023-10-15",
    updatedAt: "2023-11-20",
    street: "32nd Street",
    barangay: "Bonifacio Global City",
    municipality: "Taguig",
    city: "Metro Manila",
    province: "NCR",
    zipCode: "1634",
    tags: ["Swimming Pool", "Gym", "24/7 Security", "Pet-friendly", "Near MRT"],
    unitCount: 8,
    occupiedUnits: 6,
    image: "/property1.jpg",
  },
  {
    id: "prop-2",
    title: "Makati CBD Office Space",
    description: "Prime commercial space in Makati Central Business District",
    type: "COMMERCIAL",
    listedPrice: 125000,
    isNegotiable: false,
    requiresScreening: true,
    createdAt: "2023-09-10",
    updatedAt: "2023-11-15",
    street: "Ayala Avenue",
    barangay: "San Lorenzo",
    municipality: "Makati",
    city: "Metro Manila",
    province: "NCR",
    zipCode: "1226",
    tags: ["High Foot Traffic", "Retail Space", "Near Banks"],
    unitCount: 5,
    occupiedUnits: 3,
    image: "/property2.jpg",
  },
  {
    id: "prop-3",
    title: "Quezon City Townhouse",
    description: "Spacious townhouse in a quiet Quezon City neighborhood",
    type: "TOWNHOUSE",
    listedPrice: 35000,
    isNegotiable: true,
    requiresScreening: false,
    createdAt: "2023-08-22",
    updatedAt: "2023-11-18",
    street: "Capitol Hills Drive",
    barangay: "Matandang Balara",
    municipality: "Quezon City",
    city: "Metro Manila",
    province: "NCR",
    zipCode: "1119",
    tags: ["Gated Community", "Parking", "Garden"],
    unitCount: 1,
    occupiedUnits: 1,
    image: "/property3.jpg",
  },
  {
    id: "prop-4",
    title: "Alabang Villa",
    description: "Luxury villa in exclusive Alabang village",
    type: "VILLA",
    listedPrice: 95000,
    isNegotiable: true,
    requiresScreening: true,
    createdAt: "2023-11-05",
    updatedAt: "2023-11-20",
    street: "Acacia Avenue",
    barangay: "Ayala Alabang",
    municipality: "Muntinlupa",
    city: "Metro Manila",
    province: "NCR",
    zipCode: "1780",
    tags: ["Swimming Pool", "Maid's Room", "Security", "Landscaped Garden"],
    unitCount: 1,
    occupiedUnits: 0,
    image: "/property4.jpg",
  },
  {
    id: "prop-5",
    title: "Cebu Beachfront Apartment",
    description: "Beachfront apartment with stunning ocean views",
    type: "APARTMENT",
    listedPrice: 28000,
    isNegotiable: false,
    requiresScreening: true,
    createdAt: "2023-07-30",
    updatedAt: "2023-11-19",
    street: "Beach Road",
    barangay: "Lapu-Lapu",
    municipality: "Mactan",
    city: "Cebu",
    province: "Cebu",
    zipCode: "6015",
    tags: ["Beach Access", "Ocean View", "Resort Amenities"],
    unitCount: 12,
    occupiedUnits: 10,
    image: "/property5.jpg",
  },
  {
    id: "prop-6",
    title: "Davao Farmhouse",
    description: "Spacious farmhouse with agricultural land",
    type: "HOUSE",
    listedPrice: 55000,
    isNegotiable: true,
    requiresScreening: false,
    createdAt: "2023-10-01",
    updatedAt: "2023-11-15",
    street: "Farmers Road",
    barangay: "Buhangin",
    municipality: "Davao City",
    city: "Davao",
    province: "Davao del Sur",
    zipCode: "8000",
    tags: ["Agricultural Land", "Farmhouse", "Quiet Location"],
    unitCount: 1,
    occupiedUnits: 1,
    image: "/property6.jpg",
  },
];

const propertyTypes = [...new Set(mockProperties.map(p => p.type))];

export const Properties = () => {
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Property; direction: "asc" | "desc" } | null>(null);

  const handleSort = (key: keyof Property) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredProperties = mockProperties.filter(property => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.barangay.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(property.type);
    
    return matchesSearch && matchesType;
  });

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (!sortConfig) return 0;
    
    const key = sortConfig.key;
    if (a[key] < b[key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[key] > b[key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const toggleTypeFilter = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const formatAddress = (property: Property) => {
    return `${property.street}, ${property.barangay}, ${property.city}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0
    }).format(price);
  };

  const renderTags = (tags: string[]) => {
    if (tags.length <= 3) {
      return tags.map(tag => (
        <Badge key={tag} variant="secondary" className="text-xs">
          {tag}
        </Badge>
      ));
    }
    
    return (
      <div className="flex items-center">
        {tags.slice(0, 2).map(tag => (
          <Badge key={tag} variant="secondary" className="text-xs mr-1">
            {tag}
          </Badge>
        ))}
        <Badge variant="secondary" className="text-xs">
          +{tags.length - 2} more
        </Badge>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Properties</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredProperties.length} properties found in the Philippines
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
            <Input
              placeholder="Search properties..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <div className="px-2 py-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                  Property Type
                </div>
                {propertyTypes.map((type) => (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={selectedTypes.includes(type)}
                    onCheckedChange={() => toggleTypeFilter(type)}
                  >
                    {formatPropertyType(type)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

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
              <Link to="/landlord/property/add-property" className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                <span>Add Property</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Active filters display */}
      {selectedTypes.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          {selectedTypes.map(type => (
            <Badge 
              key={type} 
              variant="outline"
              className="flex items-center gap-1"
            >
              {formatPropertyType(type as PropertyType)} // error here Argument of type 'string' is not assignable to parameter of type 'PropertyType'.ts(2345)
(parameter) type: string

              <button 
                onClick={() => toggleTypeFilter(type)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <button 
            onClick={() => setSelectedTypes([])}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {viewMode === "card" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProperties.map((property) => (
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
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-lg">{property.title}</h3>
                  <Badge variant="outline">
                    {formatPropertyType(property.type)}
                  </Badge>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{formatAddress(property)}</span>
                </div>
                
                <div className="mt-3">
                  {renderTags(property.tags)}
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm border-t dark:border-gray-700 pt-3">
                  <div className="flex flex-col">
                    <span className="text-gray-500 dark:text-gray-400">Price</span>
                    <span className="font-medium">
                      {formatPrice(property.listedPrice)}/mo
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 dark:text-gray-400">Negotiable</span>
                    <span className="font-medium">
                      {property.isNegotiable ? (
                        <span className="text-green-600 dark:text-green-400 flex items-center">
                          <Check className="h-4 w-4 mr-1" /> Yes
                        </span>
                      ) : (
                        <span className="text-gray-500 flex items-center">
                          <X className="h-4 w-4 mr-1" /> No
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 dark:text-gray-400">Screening</span>
                    <span className="font-medium">
                      {property.requiresScreening ? (
                        <span className="text-green-600 dark:text-green-400">Required</span>
                      ) : (
                        <span className="text-gray-500">Not required</span>
                      )}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-500 dark:text-gray-400">Units</span>
                    <span className="font-medium flex items-center">
                      <Layers className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-400" />
                      {property.occupiedUnits}/{property.unitCount} occupied
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button variant="outline" className="w-full" asChild>
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
        <div className="rounded-md border dark:border-gray-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button 
                    className="flex items-center"
                    onClick={() => handleSort("title")}
                  >
                    Property
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </button>
                </TableHead>
                <TableHead>
                  <button 
                    className="flex items-center"
                    onClick={() => handleSort("type")}
                  >
                    Type
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </button>
                </TableHead>
                <TableHead>Location</TableHead>
                <TableHead>
                  <button 
                    className="flex items-center"
                    onClick={() => handleSort("listedPrice")}
                  >
                    Price
                    <ArrowUpDown className="h-4 w-4 ml-1" />
                  </button>
                </TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Negotiable</TableHead>
                <TableHead>Screening</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProperties.map((property) => (
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
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {property.barangay}, {property.city}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {formatPropertyType(property.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {property.street}, {property.barangay}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {formatPrice(property.listedPrice)}/mo
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {property.occupiedUnits}/{property.unitCount} occupied
                    </div>
                  </TableCell>
                  <TableCell>
                    {property.isNegotiable ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-gray-400" />
                    )}
                  </TableCell>
                  <TableCell>
                    {property.requiresScreening ? (
                      <Badge variant="default" className="text-xs">
                        Required
                      </Badge>
                    ) : (
                      <span className="text-sm text-gray-500">Not required</span>
                    )}
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

      {filteredProperties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <Home className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
            No properties found in the Philippines
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Try adjusting your search or filters
          </p>
          <Button asChild>
            <Link to="/landlord/properties/add">
              <Plus className="h-4 w-4 mr-2" />
              Add New Property
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};
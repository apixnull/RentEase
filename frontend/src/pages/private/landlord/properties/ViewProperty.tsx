import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Home,
  Bed,
  Bath,
  Ruler,
  DollarSign,
  Tag,
  Plus,
  Edit,
  Check,
  X,
  LayoutGrid,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type PropertyType = 'HOUSE' | 'APARTMENT' | 'CONDO' | 'STUDIO' | 'COMMERCIAL' | 'OTHER';

type Property = {
  id: string;
  title: string;
  description: string;
  type: PropertyType;
  createdAt: string;
  updatedAt: string;
  listedPrice: number;
  isNegotiable: boolean;
  requiresScreening: boolean;
  
  // Address fields
  street: string;
  barangay: string;
  municipality: string;
  city: string;
  province: string;
  zipCode: string;
  
  // Relationships
  tags: string[];
  PropertyPhoto: { url: string }[];
  Unit: {
    id: string;
    label: string;
    description: string;
    status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
    bedrooms: number;
    bathrooms: number;
    area: number;
    price: number;
    isNegotiable: boolean;
  }[];
};

// Mock property data based on Prisma schema
const mockProperty: Property = {
  id: "prop-1",
  title: "Modern BGC Condominium",
  description: "A luxury condominium in the heart of Bonifacio Global City with premium amenities and 24/7 security.",
  type: "CONDO",
  createdAt: "2023-01-15T08:30:00Z",
  updatedAt: "2023-11-20T14:45:00Z",
  listedPrice: 45000,
  isNegotiable: true,
  requiresScreening: true,
  street: "32nd Street",
  barangay: "Bonifacio Global City",
  municipality: "Taguig",
  city: "Metro Manila",
  province: "NCR",
  zipCode: "1634",
  tags: ["Swimming Pool", "Gym", "24/7 Security", "Pet-friendly"],
  PropertyPhoto: [
    { url: "/property1.jpg" },
    { url: "/property2.jpg" },
    { url: "/property3.jpg" },
    { url: "/property4.jpg" },
    { url: "/property5.jpg" }
  ],
  Unit: [
    {
      id: "unit-1",
      label: "Unit 101",
      description: "2-bedroom corner unit with city view",
      status: "OCCUPIED",
      bedrooms: 2,
      bathrooms: 2,
      area: 85,
      price: 25000,
      isNegotiable: false
    },
    {
      id: "unit-2",
      label: "Unit 102",
      description: "2-bedroom unit with balcony",
      status: "AVAILABLE",
      bedrooms: 2,
      bathrooms: 1,
      area: 75,
      price: 22000,
      isNegotiable: true
    },
    {
      id: "unit-3",
      label: "Unit 201",
      description: "3-bedroom unit with extra storage",
      status: "AVAILABLE",
      bedrooms: 3,
      bathrooms: 2,
      area: 110,
      price: 35000,
      isNegotiable: true
    },
    {
      id: "unit-4",
      label: "Unit 202",
      description: "1-bedroom studio unit",
      status: "MAINTENANCE",
      bedrooms: 1,
      bathrooms: 1,
      area: 45,
      price: 15000,
      isNegotiable: false
    }
  ]
};

export const ViewProperty = () => {
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const property = mockProperty;
  
  const formatAddress = () => {
    return `${property.street}, ${property.barangay}, ${property.municipality}, ${property.city}, ${property.province} ${property.zipCode}`;
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const statusVariants = {
    AVAILABLE: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    OCCUPIED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    MAINTENANCE: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  };
  
  const unitCount = property.Unit.length;
  const availableUnits = property.Unit.filter(u => u.status === "AVAILABLE").length;
  const occupiedUnits = property.Unit.filter(u => u.status === "OCCUPIED").length;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button asChild variant="outline" className="mb-4">
            <Link to="/landlord/properties">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Properties
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">{property.title}</h1>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{formatAddress()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to={`/landlord/properties/${property.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Property
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/landlord/properties/${property.id}/units/add`}>
              <Plus className="h-4 w-4 mr-2" />
              Add Unit
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Photo Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            {property.PropertyPhoto.length > 0 ? (
              <img
                src={property.PropertyPhoto[selectedPhoto].url}
                alt={`Property view ${selectedPhoto + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <Home className="h-12 w-12" />
              </div>
            )}
          </div>
          <div className="grid grid-cols-5 gap-2 mt-2">
            {property.PropertyPhoto.map((photo, index) => (
              <button
                key={index}
                className={cn(
                  "aspect-square rounded-md overflow-hidden",
                  index === selectedPhoto && "ring-2 ring-blue-500"
                )}
                onClick={() => setSelectedPhoto(index)}
              >
                <img
                  src={photo.url}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
        
        {/* Property Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6 h-fit">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Property Type</div>
              <div className="font-medium flex items-center">
                <Home className="h-4 w-4 mr-2" />
                {property.type}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Units</div>
              <div className="font-medium flex items-center">
                <LayoutGrid className="h-4 w-4 mr-2" />
                {unitCount} units
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Created</div>
              <div className="font-medium">{formatDate(property.createdAt)}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
              <div className="text-sm text-gray-500 dark:text-gray-400">Last Updated</div>
              <div className="font-medium">{formatDate(property.updatedAt)}</div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium mb-2">Property Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Listed Price</span>
                <span className="font-medium">₱{property.listedPrice.toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between">
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
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Screening</span>
                <span className="font-medium">
                  {property.requiresScreening ? (
                    <span className="text-green-600 dark:text-green-400 flex items-center">
                      <Check className="h-4 w-4 mr-1" /> Required
                    </span>
                  ) : (
                    <span className="text-gray-500 flex items-center">
                      <X className="h-4 w-4 mr-1" /> Not required
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium mb-2">Property Tags</h3>
            <div className="flex flex-wrap gap-2">
              {property.tags.map(tag => (
                <Badge 
                  key={tag} 
                  variant="secondary"
                  className="flex items-center"
                >
                  <Tag className="h-4 w-4 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Unit Status Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Available</span>
                <span className="font-medium">{availableUnits} units</span>
              </div>
              <div className="flex justify-between">
                <span>Occupied</span>
                <span className="font-medium">{occupiedUnits} units</span>
              </div>
              <div className="flex justify-between">
                <span>Under Maintenance</span>
                <span className="font-medium">
                  {unitCount - availableUnits - occupiedUnits} units
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs for Details and Units */}
      <Tabs defaultValue="details" className="mt-6">
        <TabsList>
          <TabsTrigger value="details">Property Details</TabsTrigger>
          <TabsTrigger value="units">Units ({unitCount})</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="pt-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Property Description</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {property.description}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Address Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="w-24 text-gray-500 dark:text-gray-400">Street:</span>
                    <span>{property.street}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-gray-500 dark:text-gray-400">Barangay:</span>
                    <span>{property.barangay}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-gray-500 dark:text-gray-400">Municipality:</span>
                    <span>{property.municipality}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-gray-500 dark:text-gray-400">City:</span>
                    <span>{property.city}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-gray-500 dark:text-gray-400">Province:</span>
                    <span>{property.province}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-gray-500 dark:text-gray-400">Zip Code:</span>
                    <span>{property.zipCode}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Property Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="w-24 text-gray-500 dark:text-gray-400">Property ID:</span>
                    <span>{property.id}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-gray-500 dark:text-gray-400">Type:</span>
                    <span>{property.type}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-gray-500 dark:text-gray-400">Created:</span>
                    <span>{formatDate(property.createdAt)}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-gray-500 dark:text-gray-400">Updated:</span>
                    <span>{formatDate(property.updatedAt)}</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-gray-500 dark:text-gray-400">Listed Price:</span>
                    <span>₱{property.listedPrice.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-gray-500 dark:text-gray-400">Negotiable:</span>
                    <span>
                      {property.isNegotiable ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="units" className="pt-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Property Units</h2>
                <Button asChild size="sm">
                  <Link to={`/landlord/properties/${property.id}/units/add`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Unit
                  </Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {property.Unit.map(unit => (
                  <div 
                    key={unit.id}
                    className="border dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{unit.label}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {unit.description}
                          </p>
                        </div>
                        <Badge
                          className={cn(
                            "text-xs",
                            statusVariants[unit.status]
                          )}
                        >
                          {unit.status}
                        </Badge>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-4 gap-2 text-sm">
                        <div className="flex flex-col items-center">
                          <Bed className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          <span className="text-xs">{unit.bedrooms}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Bath className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          <span className="text-xs">{unit.bathrooms}</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Ruler className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          <span className="text-xs">{unit.area} m²</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <DollarSign className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                          <span className="text-xs">₱{unit.price.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-between items-center">
                        <div>
                          {unit.isNegotiable && (
                            <Badge variant="outline" className="text-green-600 dark:text-green-400 text-xs">
                              Negotiable
                            </Badge>
                          )}
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/landlord/properties/${property.id}/units/${unit.id}`}>
                            Manage Unit
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="maintenance" className="pt-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-4">Maintenance Requests</h2>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-medium">Active Requests</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage ongoing maintenance issues
                </p>
              </div>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </div>
            
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">Plumbing Issue - Unit 202</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Reported: November 15, 2023
                    </p>
                  </div>
                  <Badge variant="destructive">Urgent</Badge>
                </div>
                <p className="mt-2 text-sm">
                  Leaking pipe in the bathroom causing water damage to the floor below.
                </p>
                <div className="mt-3 flex items-center text-sm">
                  <Wrench className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                  <span>Assigned to: Mario's Plumbing Services</span>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">AC Repair - Unit 101</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Reported: November 18, 2023
                    </p>
                  </div>
                  <Badge>In Progress</Badge>
                </div>
                <p className="mt-2 text-sm">
                  Air conditioning unit not cooling properly during daytime hours.
                </p>
                <div className="mt-3 flex items-center text-sm">
                  <Wrench className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                  <span>Assigned to: CoolAir Technicians</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
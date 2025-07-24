// src/pages/landlord/property/PropertyDetails.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Trash2, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Edit, 
  Plus,
  Check,
  X,
  Home,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Sofa,
  Car,
  ShieldCheck,
  BarChart2,
  Image as ImageIcon,
  GlassWater,
  MapPin,
  FileText,
  Clock,
  ThumbsUp,
  ThumbsDown,
  UserX,
  Search
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { getPropertiesDetailsRequest } from "@/services/api/landlord.api";

// Update interfaces to match new backend response
interface Photo {
  id: string;
  url: string;
}

interface Unit {
  id: string;
  label: string;
  description: string;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  floorNumber: number;
  maxOccupancy: number;
  features: string[];
  photos: Photo[];
  targetPrice: number;
  isNegotiable: boolean;
  leaseRules: string[];
}

interface UnitStatusCount {
  AVAILABLE: number;
  OCCUPIED: number;
  MAINTENANCE: number;
}

interface ApplicationStatusCount {
  PENDING: number;
  REVIEWED: number;
  APPROVED: number;
  REJECTED: number;
  WITHDRAWN: number;
}

interface Property {
  id: string;
  title: string;
  description: string;
  type: string;
  street: string;
  zipCode: string;
  barangay: string;
  city: string;
  municipality: string | null;
  province: string;
  requiresScreening: boolean;
  isListed: boolean;
  amenities: string[];
  sharedFeatures: string[];
  rules: string[];
  photos: Photo[];
  mainImageUrl: string;
  unitCount: number;
  unitStatusCount: UnitStatusCount;
  priceRange: number;
  applicationStatusCount: ApplicationStatusCount;
  units: Unit[];
}

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [isBatchDeleting, setIsBatchDeleting] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState("");
  const unitsPerPage = 10;

  useEffect(() => {
    // Get active tab from localStorage if exists
    const savedTab = localStorage.getItem(`property-${id}-activeTab`);
    if (savedTab) {
      setActiveTab(savedTab);
    }
    
    const fetchProperty = async () => {
      try {
        const res = await getPropertiesDetailsRequest(id!);
        const propertyData = res.data.property;
        // Transform backend data to match frontend interface
        const transformedProperty: Property = {
          id: propertyData.id,
          title: propertyData.title,
          description: propertyData.description,
          type: propertyData.type,
          street: propertyData.address.street,
          barangay: propertyData.address.barangay,
          municipality: propertyData.address.municipality,
          city: propertyData.address.city,
          province: propertyData.address.province,
          zipCode: propertyData.address.zipCode,
          requiresScreening: propertyData.requiresScreening,
          isListed: propertyData.isListed,
          amenities: propertyData.amenityTags,
          sharedFeatures: propertyData.propertySharedFeatures,
          rules: propertyData.propertyRules,
          photos: propertyData.propertyImageUrls.map((url: string, idx: number) => ({ id: String(idx), url })),
          mainImageUrl: propertyData.mainImageUrl,
          unitCount: propertyData.unitCount,
          unitStatusCount: propertyData.unitStatusCount,
          priceRange: propertyData.priceRange,
          applicationStatusCount: propertyData.applicationStatusCount,
          units: propertyData.units.map((unit: any) => ({
            id: unit.id,
            label: unit.label,
            description: unit.description,
            status: unit.status,
            floorNumber: unit.floorNumber,
            maxOccupancy: unit.maxOccupancy,
            features: unit.unitFeatureTags,
            photos: unit.unitImageUrls.map((url: string, idx: number) => ({ id: String(idx), url })),
            targetPrice: unit.targetPrice,
            isNegotiable: unit.isNegotiable,
            leaseRules: unit.leaseRules,
          })),
        };
        setProperty(transformedProperty);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch property details", err);
        setError("Failed to load property details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    if (id) {
      localStorage.setItem(`property-${id}-activeTab`, activeTab);
    }
  }, [activeTab, id]);

  const toggleListingStatus = async () => {
    if (!property) return;
    
    try {
      const res = await axios.patch(
        `http://localhost:4000/api/landlord/property/${id}/status`,
        { isListed: !property.isListed },
        { withCredentials: true }
      );
      setProperty({ ...property, isListed: res.data.property.isListed });
    } catch (err) {
      console.error("Failed to update listing status", err);
      alert("Failed to update listing status. Please try again.");
    }
  };

  const handleEditProperty = () => {
    navigate(`/landlord/property/edit/${id}`);
  };

  const handleAddUnit = () => {
    navigate(`/landlord/property/${id}/unit/new`);
  };

  const handleEditUnit = (unitId: string) => {
    navigate(`/landlord/property/${id}/unit/${unitId}/edit`);
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (!confirm("Are you sure you want to delete this unit? This action cannot be undone.")) {
      return;
    }
    
    try {
      await axios.delete(
        `http://localhost:4000/api/landlord/property/${id}/unit/${unitId}`,
        { withCredentials: true }
      );
      
      // Refresh property data
      const res = await axios.get(
        `http://localhost:4000/api/landlord/property/${id}`,
        { withCredentials: true }
      );
      
      const propertyData = res.data.property;
      const transformedProperty: Property = {
        id: propertyData.id,
        title: propertyData.title,
        description: propertyData.description,
        type: propertyData.type,
        street: propertyData.address.street,
        barangay: propertyData.address.barangay,
        municipality: propertyData.address.municipality,
        city: propertyData.address.city,
        province: propertyData.address.province,
        zipCode: propertyData.address.zipCode,
        requiresScreening: propertyData.requiresScreening,
        isListed: propertyData.isListed,
        amenities: propertyData.amenityTags,
        sharedFeatures: propertyData.propertySharedFeatures,
        rules: propertyData.propertyRules,
        photos: propertyData.propertyImageUrls.map((url: string, idx: number) => ({ id: String(idx), url })),
        mainImageUrl: propertyData.mainImageUrl,
        unitCount: propertyData.unitCount,
        unitStatusCount: propertyData.unitStatusCount,
        priceRange: propertyData.priceRange,
        applicationStatusCount: propertyData.applicationStatusCount,
        units: propertyData.units.map((unit: any) => ({
          id: unit.id,
          label: unit.label,
          description: unit.description,
          status: unit.status,
          floorNumber: unit.floorNumber,
          maxOccupancy: unit.maxOccupancy,
          features: unit.unitFeatureTags,
          photos: unit.unitImageUrls.map((url: string, idx: number) => ({ id: String(idx), url })),
          targetPrice: unit.targetPrice,
          isNegotiable: unit.isNegotiable,
          leaseRules: unit.leaseRules,
        })),
      };
      
      setProperty(transformedProperty);
    } catch (err) {
      console.error("Failed to delete unit", err);
      alert("Failed to delete unit. Please try again.");
    }
  };

  const handleBatchDelete = async () => {
    if (selectedUnits.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedUnits.length} units? This action cannot be undone.`)) {
      return;
    }
    
    setIsBatchDeleting(true);
    try {
      // Delete units in parallel
      await Promise.all(
        selectedUnits.map(unitId => 
          axios.delete(
            `http://localhost:4000/api/landlord/property/${id}/unit/${unitId}`,
            { withCredentials: true }
          )
        )
      );
      
      // Refresh property data
      const res = await axios.get(
        `http://localhost:4000/api/landlord/property/${id}`,
        { withCredentials: true }
      );
      
      const propertyData = res.data.property;
      const transformedProperty: Property = {
        id: propertyData.id,
        title: propertyData.title,
        description: propertyData.description,
        type: propertyData.type,
        street: propertyData.address.street,
        barangay: propertyData.address.barangay,
        municipality: propertyData.address.municipality,
        city: propertyData.address.city,
        province: propertyData.address.province,
        zipCode: propertyData.address.zipCode,
        requiresScreening: propertyData.requiresScreening,
        isListed: propertyData.isListed,
        amenities: propertyData.amenityTags,
        sharedFeatures: propertyData.propertySharedFeatures,
        rules: propertyData.propertyRules,
        photos: propertyData.propertyImageUrls.map((url: string, idx: number) => ({ id: String(idx), url })),
        mainImageUrl: propertyData.mainImageUrl,
        unitCount: propertyData.unitCount,
        unitStatusCount: propertyData.unitStatusCount,
        priceRange: propertyData.priceRange,
        applicationStatusCount: propertyData.applicationStatusCount,
        units: propertyData.units.map((unit: any) => ({
          id: unit.id,
          label: unit.label,
          description: unit.description,
          status: unit.status,
          floorNumber: unit.floorNumber,
          maxOccupancy: unit.maxOccupancy,
          features: unit.unitFeatureTags,
          photos: unit.unitImageUrls.map((url: string, idx: number) => ({ id: String(idx), url })),
          targetPrice: unit.targetPrice,
          isNegotiable: unit.isNegotiable,
          leaseRules: unit.leaseRules,
        })),
      };
      
      setProperty(transformedProperty);
      setSelectedUnits([]);
      setIsBatchMode(false);
    } catch (err) {
      console.error("Failed to delete units", err);
      alert("Failed to delete some units. Please try again.");
    } finally {
      setIsBatchDeleting(false);
    }
  };

  const toggleSelectUnit = (unitId: string) => {
    setSelectedUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId) 
        : [...prev, unitId]
    );
  };

  const toggleSelectAllOnPage = () => {
    if (!property) return;
    
    const currentUnitIds = filteredUnits
      .slice((currentPage - 1) * unitsPerPage, currentPage * unitsPerPage)
      .map(unit => unit.id);
    
    // If all current page units are selected, deselect them
    if (currentUnitIds.every(id => selectedUnits.includes(id))) {
      setSelectedUnits(prev => prev.filter(id => !currentUnitIds.includes(id)));
    } else {
      // Otherwise select all on page
      setSelectedUnits(prev => [...new Set([...prev, ...currentUnitIds])]);
    }
  };

  // Photo navigation
  const nextPhoto = () => {
    if (!property) return;
    setCurrentPhotoIndex(prev => 
      prev === property.photos.length - 1 ? 0 : prev + 1
    );
  };

  const prevPhoto = () => {
    if (!property) return;
    setCurrentPhotoIndex(prev => 
      prev === 0 ? property.photos.length - 1 : prev - 1
    );
  };

  // Filter units based on search query
  const filteredUnits = property?.units.filter(unit => 
    unit.label.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Pagination logic
  const indexOfLastUnit = currentPage * unitsPerPage;
  const indexOfFirstUnit = indexOfLastUnit - unitsPerPage;
  const currentUnits = filteredUnits.slice(indexOfFirstUnit, indexOfLastUnit);
  const totalPages = Math.ceil(filteredUnits.length / unitsPerPage);

  // Helper to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800";
      case "OCCUPIED":
        return "bg-blue-100 text-blue-800";
      case "MAINTENANCE":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format price (single value)
  const formatPrice = (price: number | null | undefined) => {
    if (price === null || price === undefined) return "N/A";
    return `₱${price.toLocaleString()}`;
  };

  // Format property type
  const formatPropertyType = (type: string) => {
    return type.charAt(0) + type.slice(1).toLowerCase();
  };

  // Render amenity icons (add more as needed)
  const renderAmenityIcon = (amenity: string) => {
    switch(amenity.toLowerCase()) {
      case "wifi":
      case "wi-fi":
        return <Wifi size={16} className="mr-1" />;
      case "swimming pool":
        return <GlassWater size={16} className="mr-1" />;
      case "furnished":
        return <Sofa size={16} className="mr-1" />;
      case "parking":
        return <Car size={16} className="mr-1" />;
      case "gated community":
        return <ShieldCheck size={16} className="mr-1" />;
      case "air conditioning":
        return <Sofa size={16} className="mr-1" />; // Replace with AC icon if available
      default:
        return null;
    }
  };

  // Render application status icon
  const renderApplicationStatusIcon = (status: string) => {
    switch(status) {
      case "PENDING": return <Clock size={16} className="mr-1 text-yellow-500" />;
      case "REVIEWED": return <FileText size={16} className="mr-1 text-blue-500" />;
      case "APPROVED": return <ThumbsUp size={16} className="mr-1 text-green-500" />;
      case "REJECTED": return <ThumbsDown size={16} className="mr-1 text-red-500" />;
      case "WITHDRAWN": return <UserX size={16} className="mr-1 text-gray-500" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Skeleton className="h-8 w-24 mr-4" />
          <Skeleton className="h-10 flex-1" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 text-red-700 p-6 rounded-lg inline-flex flex-col items-center max-w-md mx-auto">
          <AlertCircle size={48} className="mb-4" />
          <h2 className="text-xl font-bold mb-2">Unable to Load Property</h2>
          <p className="mb-4">{error || "Property details could not be found."}</p>
          <Button 
            variant="outline"
            onClick={() => navigate(-1)}
            className="border-gray-300"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const {
    title,
    street,
    barangay,
    municipality,
    city,
    zipCode,
    description,
    province,
    type,
    requiresScreening,
    isListed,
    amenities,
    photos,
    unitCount,
    unitStatusCount,
    applicationStatusCount,
    priceRange,
    units,
    sharedFeatures,
    rules
  } = property;

  // Full address
  const fullAddress = `${street}, ${barangay}, ${municipality ? municipality + ',' : ''} ${city}, ${province} ${zipCode}`;

  // Calculate total applications
  const totalApplications = Object.values(applicationStatusCount).reduce((sum, count) => sum + count, 0);

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Redesigned Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-xl">
                  <Home className="text-blue-600" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
                  <div className="flex items-center mt-1 text-gray-600 text-sm">
                    <MapPin size={16} className="mr-2" />
                    <span>{fullAddress}</span>
                  </div>
                </div>
              </div>
              
               <div className="mt-4 flex items-center gap-4">
          <Badge variant="secondary" className="px-3 py-1 text-sm">
            {formatPropertyType(type)}
          </Badge>
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${
              isListed ? "bg-green-500" : "bg-gray-500"
            }`}></span>
            <div className="text-gray-600">
              {isListed ? "Listed" : "Unlisted"}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${
              requiresScreening ? "bg-blue-500" : "bg-gray-500"
            }`}></span>
            <div className="text-gray-600">
              {requiresScreening ? "Screening Required" : "No Screening"}
            </div>
          </div>
        </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={isListed ? "outline" : "secondary"}
                onClick={toggleListingStatus}
                className="border-gray-300 bg-white"
              >
                {isListed ? (
                  <><EyeOff size={16} className="mr-2" /> Unlist</>
                ) : (
                  <><Eye size={16} className="mr-2" /> List</>
                )}
              </Button>
              <Button 
                variant="secondary"
                onClick={handleEditProperty}
                className="bg-gray-800 text-white hover:bg-gray-700"
              >
                <Edit size={16} className="mr-2" /> Edit
              </Button>
              <Button variant="destructive" className="bg-red-600 hover:bg-red-700">
                <Trash2 size={16} className="mr-2" /> Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs with persistence */}
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList className="bg-gray-100 p-1 rounded-lg">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 rounded-md"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="units" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4 py-2 rounded-md"
          >
            Units ({unitCount})
          </TabsTrigger>
        </TabsList>

        {/* Overview Section */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Property Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Photo Gallery */}
              <Card className="overflow-hidden">
                <CardHeader className="bg-gray-50 py-3">
                  <CardTitle className="text-lg flex items-center">
                    <ImageIcon size={18} className="mr-2 text-gray-600" />
                    Property Photos
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {photos.length > 0 ? (
                    <div className="relative aspect-video bg-gray-50">
                      <img
                        src={photos[currentPhotoIndex].url}
                        alt={`Property ${currentPhotoIndex + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {/* Navigation buttons */}
                      {photos.length > 1 && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full shadow"
                            onClick={prevPhoto}
                          >
                            <ChevronLeft size={24} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full shadow"
                            onClick={nextPhoto}
                          >
                            <ChevronRight size={24} />
                          </Button>
                          {/* Photo counter */}
                          <div className="absolute bottom-4 right-4 bg-black/50 text-white text-sm px-2 py-1 rounded">
                            {currentPhotoIndex + 1} / {photos.length}
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-video flex items-center justify-center bg-gray-100 text-gray-500">
                      <div className="text-center p-6">
                        <ImageIcon size={48} className="mx-auto mb-4" />
                        <p>No photos available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              {/* Description Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Home size={18} className="mr-2 text-gray-600" />
                    Property Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                      <p className="text-gray-800">{description || "No description provided"}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Property Type</h3>
                        <p className="text-gray-800">{formatPropertyType(type)}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Tenant Screening</h3>
                        <Badge variant={requiresScreening ? "default" : "secondary"}>
                          {requiresScreening ? "Required" : "Not Required"}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Listing Status</h3>
                        <Badge variant={isListed ? "default" : "secondary"}>
                          {isListed ? "Listed" : "Unlisted"}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Target Price</h3>
                      <p className="font-medium">{formatPrice(priceRange)}</p>
                    </div>
                    {/* Shared Features */}
                    {sharedFeatures && sharedFeatures.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Shared Features</h3>
                        <ul className="list-disc ml-5 text-gray-800">
                          {sharedFeatures.map((feature, idx) => (
                            <li key={idx}>{feature}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {/* Property Rules */}
                    {rules && rules.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Property Rules</h3>
                        <ul className="list-disc ml-5 text-gray-800">
                          {rules.map((rule, idx) => (
                            <li key={idx}>{rule}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart2 size={18} className="mr-2 text-gray-600" />
                    Unit Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <StatCard 
                      title="Total Units" 
                      value={unitCount} 
                      icon={<Home size={20} className="text-gray-500" />}
                    />
                    <StatCard 
                      title="Available" 
                      value={unitStatusCount.AVAILABLE} 
                      variant="success"
                      icon={<div className="w-3 h-3 rounded-full bg-green-500"></div>}
                    />
                    <StatCard 
                      title="Occupied" 
                      value={unitStatusCount.OCCUPIED} 
                      variant="info"
                      icon={<div className="w-3 h-3 rounded-full bg-blue-500"></div>}
                    />
                    <StatCard 
                      title="Maintenance" 
                      value={unitStatusCount.MAINTENANCE} 
                      variant="warning"
                      icon={<div className="w-3 h-3 rounded-full bg-yellow-500"></div>}
                    />
                  </div>
                </CardContent>
              </Card>
              
              {/* Applications Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText size={18} className="mr-2 text-gray-600" />
                    Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl font-bold">{totalApplications}</div>
                      <div className="text-sm text-gray-500">Total Applications</div>
                    </div>
                    <div className="bg-blue-100 text-blue-800 rounded-full p-2">
                      <FileText size={24} />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {Object.entries(applicationStatusCount).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center">
                          {renderApplicationStatusIcon(status)}
                          <span className="capitalize">{status.toLowerCase()}</span>
                        </div>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Amenities Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sofa size={18} className="mr-2 text-gray-600" />
                    Amenities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {amenities.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2">
                      {amenities.map((amenity, idx) => (
                        <div key={idx} className="flex items-center py-1">
                          {renderAmenityIcon(amenity)}
                          <span>{amenity}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No amenities listed</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Units Section */}
        <TabsContent value="units">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center">
                    <Home size={18} className="mr-2 text-gray-600" />
                    Property Units
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {filteredUnits.length} units found
                  </p>
                </div>
                
                <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
                  <div className="relative w-full md:w-64">
                    <Input
                      placeholder="Search units..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-10"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {isBatchMode ? (
                      <>
                        <Button 
                          variant="destructive" 
                          onClick={handleBatchDelete}
                          disabled={selectedUnits.length === 0 || isBatchDeleting}
                          className="min-w-[150px]"
                        >
                          {isBatchDeleting ? (
                            "Deleting..."
                          ) : (
                            <>
                              <Trash2 size={16} className="mr-2" />
                              Delete ({selectedUnits.length})
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsBatchMode(false)}
                          className="border-gray-300"
                        >
                          <X size={16} className="mr-2" />
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsBatchMode(true)}
                          className="border-gray-300"
                        >
                          <Check size={16} className="mr-2" />
                          Batch Select
                        </Button>
                        <Button 
                          onClick={handleAddUnit}
                          className="bg-gray-800 text-white hover:bg-gray-700"
                        >
                          <Plus size={16} className="mr-2" />
                          Add Unit
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              {units.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Home size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Units Added</h3>
                  <p className="text-gray-500 mb-6">Get started by adding your first unit</p>
                  <Button 
                    onClick={handleAddUnit}
                    className="bg-gray-800 text-white hover:bg-gray-700"
                  >
                    <Plus size={16} className="mr-2" />
                    Add Unit
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {isBatchMode && (
                    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                      <Checkbox
                        id="select-all"
                        checked={
                          currentUnits.length > 0 && 
                          currentUnits.every(unit => selectedUnits.includes(unit.id))
                        }
                        onCheckedChange={toggleSelectAllOnPage}
                      />
                      <label htmlFor="select-all" className="text-sm font-medium text-gray-700">
                        Select all on this page
                      </label>
                    </div>
                  )}
                  
                  {filteredUnits.length === 0 ? (
                    <div className="py-12 text-center">
                      <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search size={32} className="text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No units found</h3>
                      <p className="text-gray-500 mb-6">
                        Try adjusting your search to find what you're looking for
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setSearchQuery("");
                          setCurrentPage(1);
                        }}
                        className="border-gray-300"
                      >
                        Clear search
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {currentUnits.map((unit) => (
                          <Card 
                            key={unit.id} 
                            className="overflow-hidden hover:shadow-md transition-shadow relative p-2 rounded-lg min-h-[260px]"
                          >
                            {isBatchMode && (
                              <div className="absolute top-3 left-3 z-10">
                                <Checkbox
                                  checked={selectedUnits.includes(unit.id)}
                                  onCheckedChange={() => toggleSelectUnit(unit.id)}
                                  className="w-5 h-5 bg-white border-2 border-gray-300 rounded"
                                />
                              </div>
                            )}
                            {!isBatchMode && (
                              <div className="absolute top-2 right-2 flex gap-1 z-10">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="w-7 h-7 rounded-full bg-white/80 hover:bg-gray-100"
                                  onClick={() => handleEditUnit(unit.id)}
                                >
                                  <Edit size={14} className="text-gray-600" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="w-8 h-8 rounded-full bg-white/80 hover:bg-red-50 text-red-600"
                                  onClick={() => handleDeleteUnit(unit.id)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            )}
                            <div className="h-28 bg-gray-100 rounded-md mb-2">
                              {unit.photos.length > 0 ? (
                                <img
                                  src={unit.photos[0].url}
                                  alt={`Unit ${unit.label}`}
                                  className="w-full h-full object-cover rounded-md"
                                />
                              ) : (
                                <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-300 rounded-xl w-full h-full flex items-center justify-center text-gray-400">
                                  <Home size={24} />
                                </div>
                              )}
                            </div>
                            <CardContent className="p-2">
                              <div className="flex justify-between items-center mb-1">
                                <CardTitle className="text-gray-800 text-base font-semibold truncate">{unit.label}</CardTitle>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(unit.status)}`}>
                                  {unit.status}
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mb-1 truncate">Floor {unit.floorNumber}</div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs text-gray-600">{formatPrice(unit.targetPrice)}</span>
                                <span className="text-xs text-gray-400">/mo</span>
                                <span className="text-xs text-gray-600 ml-2">Max: {unit.maxOccupancy}</span>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs text-gray-600">{unit.isNegotiable ? "Negotiable" : "Fixed"}</span>
                              </div>
                              {/* Creative Features Display: show up to 3 as badges, rest as '+N more' */}
                              {unit.features && unit.features.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {unit.features.slice(0, 3).map((feature, idx) => (
                                    <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-medium">
                                      {feature}
                                    </span>
                                  ))}
                                  {unit.features.length > 3 && (
                                    <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                                      +{unit.features.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                              {/* Action Buttons */}
                              <div className="flex gap-2 mt-2">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="text-xs px-2 py-1 h-7"
                                  onClick={() => navigate(`/landlord/property/${id}/unit/${unit.id}/lease/add`)}
                                >
                                  Add Lease
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs px-2 py-1 h-7 border-gray-300"
                                  onClick={() => navigate(`/landlord/property/${id}/unit/${unit.id}`)}
                                >
                                  Manage Unit
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t border-gray-200">
                          <div className="text-sm text-gray-600">
                            Showing {(currentPage - 1) * unitsPerPage + 1} -{' '}
                            {Math.min(currentPage * unitsPerPage, filteredUnits.length)} of {filteredUnits.length} units
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPage(currentPage - 1)}
                              className="border-gray-300"
                            >
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              disabled={currentPage === totalPages}
                              onClick={() => setCurrentPage(currentPage + 1)}
                              className="border-gray-300"
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper component for stats
const StatCard = ({ 
  title, 
  value, 
  variant = "default",
  icon
}: {
  title: string;
  value: number;
  variant?: "default" | "success" | "warning" | "info";
  icon?: React.ReactNode;
}) => {
  const variantClasses = {
    default: "bg-gray-50 text-gray-800",
    success: "bg-green-50 text-green-800",
    warning: "bg-yellow-50 text-yellow-800",
    info: "bg-blue-50 text-blue-800"
  };
  
  return (
    <div className={`rounded-lg p-3 ${variantClasses[variant]}`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xl font-bold mt-1">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
};

export default PropertyDetails;
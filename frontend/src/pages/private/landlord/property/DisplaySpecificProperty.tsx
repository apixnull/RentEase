import { useNavigate } from "react-router-dom";
import { Home, Building, MapPin, CheckCircle2, Wrench, AlertTriangle, Ban, Users, Info, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface CityRef { id: string; name: string }
interface MunicipalityRef { id: string; name: string }
interface UnitsSummary { total?: number; listed?: number; occupied?: number; good?: number; needMaintenance?: number; underMaintenance?: number; unusable?: number }
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

// Loading Component (Skeleton)
const LoadingSpinner = () => (
  <div className="space-y-6">
    <Card className="p-0 overflow-hidden">
      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-6 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="overflow-hidden">
            <Skeleton className="h-56 w-full" />
          </Card>
          <Card className="overflow-hidden">
            <Skeleton className="h-56 w-full" />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-6 w-40" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Card>
  </div>
);

// Error Component
const ErrorMessage = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <Card className="p-8 text-center">
    <div className="text-red-500 mb-4">
      <Home className="h-16 w-16 mx-auto" />
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      Error Loading Property
    </h3>
    <p className="text-gray-500 mb-4">{message}</p>
    <Button
      onClick={onRetry}
      className="bg-gradient-to-r from-emerald-600 to-sky-600"
    >
      Try Again
    </Button>
  </Card>
);

// Helper functions

const formatAddress = (property: Property): string => {
  const locality = property.address?.city?.name || property.address?.municipality?.name || "";
  const segments = [property.address?.street, property.address?.barangay, locality, property.address?.zipCode].filter(Boolean);
  return segments.join(", ");
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getPropertyTypeIcon = (type: string) => {
  switch (type) {
    case "APARTMENT":
    case "CONDOMINIUM":
      return <Building className="h-4 w-4" />;
    default:
      return <Home className="h-4 w-4" />;
  }
};

// Leaflet Map Component
const PropertyMap = ({ latitude, longitude, title }: { latitude?: number | null; longitude?: number | null; title: string }) => {
  if (!latitude || !longitude) {
    return null;
  }

  const center: [number, number] = [latitude, longitude];

  return (
    <div className="h-full bg-gray-100 rounded-lg overflow-hidden">
      <MapContainer center={center} zoom={15} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center}>
          <Popup>{title}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

// Sub-components for PropertyOverview
const PropertyImage = ({ property }: { property: Property }) => (
  <Card className="overflow-hidden border-0 shadow-sm">
    <div className="h-56 bg-gray-100">
      {property.media?.mainImageUrl ? (
        <img 
          src={property.media.mainImageUrl} 
          alt={property.title} 
          className="h-full w-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
      ) : null}
      <div className={`h-full w-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center ${property.media?.mainImageUrl ? 'hidden' : ''}`}>
        <Home className="h-12 w-12 text-emerald-400" />
      </div>
    </div>
  </Card>
);

const PropertyMapSection = ({ property }: { property: Property }) => (
  <Card className="border-0 shadow-sm overflow-hidden">
    <div className="h-56">
      <PropertyMap 
        latitude={property.location?.latitude} 
        longitude={property.location?.longitude} 
        title={property.title}
      />
    </div>
  </Card>
);

const NoMapSection = ({ property }: { property: Property }) => (
  <Card className="border-0 shadow-sm p-6 bg-gradient-to-br from-gray-50 to-white">
    <div className="h-56 flex flex-col justify-center items-center text-center">
      <MapPin className="h-12 w-12 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Location Information</h3>
      <p className="text-gray-600 mb-4">No map coordinates available for this property</p>
      <div className="flex items-center gap-3 text-gray-700">
        <MapPin className="h-5 w-5 text-gray-500" />
        <div className="text-left">
          <p className="font-medium text-gray-900">Address</p>
          <p className="text-sm text-gray-600">{formatAddress(property)}</p>
        </div>
      </div>
    </div>
  </Card>
);

const InfoRow = ({ label, value, isCode = false }: { label: string; value: string; isCode?: boolean }) => (
  <div className="flex justify-between py-3 border-b border-gray-100">
    <span className="text-gray-600 font-medium">{label}</span>
    <span className={`font-medium ${isCode ? 'font-mono text-sm' : ''}`}>{value}</span>
  </div>
);

const NearbyInstitutionsSection = ({ nearInstitutions }: { nearInstitutions: Array<{name: string; type: string}> }) => (
  <div>
    <h3 className="text-xl font-semibold text-gray-900 mb-4">Nearby Institutions</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {nearInstitutions.map((inst, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
          <span className="font-medium text-gray-900">{inst.name}</span>
          <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
            {inst.type}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const OtherInformationSection = ({ info }: { info: Array<{ context: string; description: string }> }) => (
  <Card className="p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-100">
    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2"><Info className="h-5 w-5 text-emerald-600" /> Other Information</h3>
    <div className="space-y-3">
      {info.map((it, idx) => (
        <div key={idx} className="p-3 bg-white rounded-lg border border-gray-100">
          <p className="font-medium text-gray-900">{it.context}</p>
          <p className="text-sm text-gray-600">{it.description}</p>
        </div>
      ))}
    </div>
  </Card>
);

const LocationDetailItem = ({ icon, title, content, isCode = false }: { 
  icon: React.ReactNode; 
  title: string; 
  content: string;
  isCode?: boolean;
}) => (
  <div className="flex items-start gap-3">
    {icon}
    <div>
      <p className="font-medium text-gray-900 mb-1">{title}</p>
      <p className={`text-gray-600 ${isCode ? 'font-mono text-sm' : ''}`}>{content}</p>
    </div>
  </div>
);

const BasicInfoSection = ({ property }: { property: Property }) => (
  <div>
    <h3 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h3>
    <div className="space-y-4">
      <InfoRow label="Property ID" value={property.id} isCode />
      <InfoRow label="Type" value={property.type.replaceAll("_", " ")} />
      <InfoRow label="Created" value={formatDate(property.createdAt)} />
      <InfoRow label="Last Updated" value={formatDate(property.updatedAt)} />
    </div>
  </div>
);

const UnitsSummarySection = ({ property }: { property: Property }) => {
  const s = property.unitsSummary || {};
  const items = [
    { label: "Total", value: s.total || 0, icon: <Users className="h-4 w-4 text-gray-500" />, color: "text-gray-800" },
    { label: "Listed", value: s.listed || 0, icon: <Sparkles className="h-4 w-4 text-green-500" />, color: "text-green-600" },
    { label: "Occupied", value: s.occupied || 0, icon: <Users className="h-4 w-4 text-blue-500" />, color: "text-blue-600" },
    { label: "Good", value: s.good || 0, icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, color: "text-emerald-600" },
    { label: "Need Maint.", value: s.needMaintenance || 0, icon: <AlertTriangle className="h-4 w-4 text-amber-500" />, color: "text-amber-600" },
    { label: "Under Maint.", value: s.underMaintenance || 0, icon: <Wrench className="h-4 w-4 text-amber-500" />, color: "text-amber-600" },
    { label: "Unusable", value: s.unusable || 0, icon: <Ban className="h-4 w-4 text-rose-500" />, color: "text-rose-600" },
  ];

  return (
    <Card className="p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-100">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Units Summary</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {items.map((it) => (
          <div key={it.label} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
            <div className="flex items-center gap-2 text-gray-700">
              {it.icon}
              <span className="text-sm">{it.label}</span>
            </div>
            <span className={`font-semibold ${it.color}`}>{it.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

const LocationDetailsSection = ({ property }: { property: Property }) => (
  <Card className="p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-100">
    <h3 className="text-xl font-semibold text-gray-900 mb-4">Location Details</h3>
    <div className="space-y-3">
      <LocationDetailItem 
        icon={<MapPin className="h-5 w-5 text-gray-500" />}
        title="Full Address"
        content={formatAddress(property)}
      />
      {property.location?.latitude && property.location?.longitude && (
        <LocationDetailItem 
          icon={<MapPin className="h-5 w-5 text-gray-500" />}
          title="Coordinates"
          content={`${property.location.latitude!.toFixed(6)}, ${property.location.longitude!.toFixed(6)}`}
          isCode
        />
      )}
    </div>
  </Card>
);

const LeftColumn = ({ property, nearInstitutions }: { property: Property; nearInstitutions: Array<{name: string; type: string}> }) => (
  <div className="space-y-8">
    <BasicInfoSection property={property} />
    {nearInstitutions.length > 0 && <NearbyInstitutionsSection nearInstitutions={nearInstitutions} />}
    {property.media?.otherInformation && property.media.otherInformation.length > 0 && (
      <OtherInformationSection info={property.media.otherInformation} />
    )}
  </div>
);

const RightColumn = ({ property }: { property: Property }) => (
  <div className="space-y-8">
    <UnitsSummarySection property={property} />
    <LocationDetailsSection property={property} />
  </div>
);

// Property Overview Component
const PropertyOverview = ({ 
  property, 
  onEdit, 
  onDelete,
}: { 
  property: Property;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const nearInstitutions = property.media?.nearInstitutions || [];
  const hasMap = !!(property.location?.latitude && property.location?.longitude);
  
  return (
    <div className="space-y-6">
      <Card className="p-0 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between gap-2 mb-6">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
              {getPropertyTypeIcon(property.type)}
              <span>{property.type.replaceAll("_", " ")}</span>
            </div>
            <div className="flex gap-2 shrink-0 flex-wrap">
              <Button 
                onClick={onEdit}
                className="bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700"
              >
                Edit Property
              </Button>
              <Button 
                onClick={onDelete}
                variant="outline" 
                className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
              >
                Delete Property
              </Button>
            </div>
          </div>

          {/* Image and Map Section */}
          <div className={`grid gap-6 mb-8 ${hasMap ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
            <PropertyImage property={property} />
            {hasMap ? (
              <PropertyMapSection property={property} />
            ) : (
              <NoMapSection property={property} />
            )}
          </div>

          {/* Content Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <LeftColumn property={property} nearInstitutions={nearInstitutions} />
            <RightColumn property={property} />
          </div>
        </div>
      </Card>
    </div>
  );
};

const DisplaySpecificProperty = ({ property, loading, error }: { property: Property | null; loading?: boolean; error?: string | null }) => {
  const navigate = useNavigate();
  

  const handleDelete = () => {
    if (!property?.id) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this property? This action cannot be undone."
    );
    if (!confirmed) return;
    toast.success("Property deleted");
    navigate("/landlord/properties", { replace: true });
  };

  const handleEdit = () => {
    toast.success("Edit property functionality would open here");
  };

  const handleRetry = () => window.location.reload();

  // Render loading state
  if (loading) {
    return <LoadingSpinner />;
  }

  // Render error state
  if (error && !property) {
    return <ErrorMessage message={error} onRetry={handleRetry} />;
  }

  return (
    <div className="space-y-6">
      {/* Error banner if there was an error but we have property data */}
      {error && property && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-amber-800 text-sm">
              Property loaded with issues: {error}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      {property && (
        <PropertyOverview
          property={property}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default DisplaySpecificProperty;
import { Building2, Home, MapPin, Sparkles, Stars, Waves } from "lucide-react";
import { motion } from "framer-motion";

interface CityRef { id: string; name: string }
interface MunicipalityRef { id: string; name: string }
interface PropertyAddress { street?: string; barangay?: string; zipCode?: string; city?: CityRef | null; municipality?: MunicipalityRef | null }
interface Property {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  address?: PropertyAddress;
}

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
      return <Building2 className="h-4 w-4" />;
    default:
      return <Home className="h-4 w-4" />;
  }
};

const PropertyHeader = ({ property }: { property: Property }) => {
  const TypeIcon = () => (
    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white grid place-items-center shadow-md">
      {getTypeIcon(property.type)}
    </div>
  );

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-emerald-200/70 via-emerald-100/50 to-sky-200/70 opacity-90" />
      <div className="relative m-[1px] rounded-[15px] bg-white/70 backdrop-blur-md border border-white/50 p-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <TypeIcon />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900 truncate">
                  {property.title}
                </h1>
                <Sparkles className="h-4 w-4 text-emerald-500" />
              </div>
              <p className="text-sm text-gray-600 leading-5 truncate">
                {property.type.replaceAll("_", " ")} • Created {formatDate(property.createdAt)} • Updated {formatDate(property.updatedAt)}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sky-500/80">
            <Stars className="h-4 w-4" />
            <Waves className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-3 flex items-start gap-2 text-sm text-gray-700">
          <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
          <div>
            <p className="font-medium text-gray-900">Address</p>
            <p className="truncate max-w-full">{formatAddress(property)}</p>
          </div>
        </div>

        {/* Gradient Underline - animated like PageHeader */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          style={{ originX: 0 }}
          className="mt-3 h-0.5 w-full bg-gradient-to-r from-emerald-400/70 via-emerald-300/70 to-sky-400/70 rounded-full"
        />
      </div>
    </div>
  );
};

export default PropertyHeader;



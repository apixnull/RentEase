import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  MapPin,
  Image as ImageIcon,
  Home,
  Building,
  ChevronLeft,
  ChevronRight,
  X,
  Zap,
  Navigation,
  Locate,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  createPropertyRequest,
  getCitiesAndMunicipalitiesRequest,
} from "@/api/landlord/propertyApi";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { motion, AnimatePresence, easeInOut } from "framer-motion";

// Leaflet imports
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type Option = { id: string; name: string };
type Institution = { name: string; type: string };

const PROPERTY_TYPES = [
  { value: "APARTMENT", label: "Apartment", icon: Building, description: "A self-contained unit within a larger building" },
  { value: "CONDOMINIUM", label: "Condominium", icon: Building, description: "Individually owned unit in a multi-unit building" },
  { value: "BOARDING_HOUSE", label: "Boarding House", icon: Home, description: "Shared living spaces with private rooms" },
  { value: "SINGLE_HOUSE", label: "Single House", icon: Home, description: "Standalone residential home" },
];

const INSTITUTION_TYPES = [
  "Education",
  "Healthcare",
  "Commerce",
  "Government",
  "Finance",
  "Transport",
  "Leisure",
  "Religion",
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easeInOut,
    },
  },
};

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0
  })
};

// Leaflet Map Click Handler Component
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function SearchSelect({
  label,
  placeholder,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  placeholder: string;
  value: Option | null;
  onChange: (opt: Option | null) => void;
  options: Option[];
  disabled?: boolean;
}) {
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return !q
      ? options
      : options.filter((o) => o.name.toLowerCase().includes(q));
  }, [options, query]);

  React.useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <motion.div variants={itemVariants} className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-900">{label}</label>
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          className="w-full h-12 px-4 rounded-xl border border-gray-300 text-left bg-white hover:border-gray-400 transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none disabled:opacity-60"
          onClick={() => setOpen((p) => !p)}
        >
          {value ? (
            <span className="text-gray-900">{value.name}</span>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </button>
        {open && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute z-10 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg"
          >
            <div className="p-2 border-b border-gray-100">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full h-10 px-3 rounded-lg bg-gray-50 outline-none border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
              />
            </div>
            <ul className="max-h-64 overflow-auto py-1">
              {filtered.length === 0 && (
                <li className="px-3 py-3 text-sm text-gray-500 text-center">
                  No results found
                </li>
              )}
              {filtered.map((opt) => (
                <li key={opt.id}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-3 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors border-b border-gray-50 last:border-b-0"
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                    }}
                  >
                    {opt.name}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function InstitutionForm({
  institution,
  onChange,
  onRemove,
  index,
}: {
  institution: Institution;
  onChange: (inst: Institution) => void;
  onRemove: () => void;
  index: number;
}) {
  const [nameError, setNameError] = React.useState("");

  const handleNameChange = (value: string) => {
    const words = value.trim().split(/\s+/);
    if (words.length > 3) {
      setNameError("Maximum 3 words allowed");
    } else {
      setNameError("");
    }
    onChange({ ...institution, name: value });
  };

  return (
    <motion.div
      variants={itemVariants}
      className="flex flex-col md:flex-row gap-4 items-start p-4 border border-gray-200 rounded-xl bg-gray-50"
    >
      <div className="flex-1 w-full">
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          Institution {index + 1}
        </label>
        <input
          value={institution.name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g., Ayala Mall Cebu"
          className="h-11 w-full px-4 rounded-lg border border-gray-300 bg-white outline-none text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
        />
        {nameError && <p className="text-xs text-red-500 mt-2">{nameError}</p>}
        <p className="text-xs text-gray-500 mt-2">
          Maximum 3 words (e.g., 'University of Cebu')
        </p>
      </div>
      <div className="flex-1 w-full">
        <label className="text-sm font-semibold text-gray-900 mb-2 block">
          Type
        </label>
        <select
          value={institution.type}
          onChange={(e) => onChange({ ...institution, type: e.target.value })}
          className="h-11 w-full px-4 rounded-lg border border-gray-300 bg-white outline-none text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
        >
          <option value="">Select type</option>
          {INSTITUTION_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={onRemove}
        className="h-11 mt-6 md:mt-8 px-4 border-gray-300 hover:border-red-300 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
      >
        Remove
      </Button>
    </motion.div>
  );
}

// Function to reverse geocode coordinates to address
const reverseGeocode = async (lat: number, lng: number) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
    );
    const data = await response.json();
    
    if (data && data.address) {
      const address = data.address;
      return {
        street: address.road || address.pedestrian || '',
        barangay: address.suburb || address.neighbourhood || '',
        city: address.city || address.town || address.municipality || '',
        municipality: address.municipality || address.county || '',
        state: address.state || '',
        postcode: address.postcode || '',
        displayName: data.display_name || ''
      };
    }
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
  }
  return null;
};

export default function CreateProperty() {
  const STEPS = [
    { 
      id: 0, 
      title: "Welcome to RentEase", 
      description: "Let's create your property together",
      icon: Home,
      isWelcome: true
    },
    { 
      id: 1, 
      title: "Pin Your Property Location", 
      description: "Click on the map to set your property location or use your current location",
      icon: MapPin 
    },
    { 
      id: 2, 
      title: "Verify Property Address", 
      description: "We've detected the address from the map location. Please verify and make any necessary changes.",
      icon: Navigation 
    },
    { 
      id: 3, 
      title: "Property Details", 
      description: "Tell us about your property type and give it a title",
      icon: FileText 
    },
    { 
      id: 4, 
      title: "Nearby Places", 
      description: "Add nearby institutions to attract more tenants (optional)",
      icon: Building 
    },
    { 
      id: 5, 
      title: "Property Photos", 
      description: "Upload photos of your property",
      icon: ImageIcon 
    },
  ] as const;
  
  const [step, setStep] = React.useState<number>(0);
  const [direction, setDirection] = React.useState(0);
  const [showContent, setShowContent] = React.useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Form state
  const [title, setTitle] = React.useState("");
  const [type, setType] = React.useState("");
  const [street, setStreet] = React.useState("");
  const [barangay, setBarangay] = React.useState("");
  const [zipCode, setZipCode] = React.useState("");
  const [city, setCity] = React.useState<Option | null>(null);
  const [municipality, setMunicipality] = React.useState<Option | null>(null);
  const [localityMode, setLocalityMode] = React.useState<
    "city" | "municipality" | null
  >(null);
  const [latitude, setLatitude] = React.useState<number | null>(null);
  const [longitude, setLongitude] = React.useState<number | null>(null);
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imageError, setImageError] = React.useState<string>("");
  const [imagePreview, setImagePreview] = React.useState<string>("");
  const [nearInstitutions, setNearInstitutions] = React.useState<Institution[]>([]);

  // Map state
  const [mapCenter, setMapCenter] = useState<[number, number]>([10.3157, 123.8854]); // Default Cebu coordinates

  // API data state
  const [cities, setCities] = React.useState<Option[]>([]);
  const [municipalities, setMunicipalities] = React.useState<Option[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const maxBytes = 5 * 1024 * 1024; // 5MB

  // Fetch cities and municipalities
  React.useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const response = await getCitiesAndMunicipalitiesRequest();
        setCities(response.data.cities || []);
        setMunicipalities(response.data.municipalities || []);
      } catch (err) {
        setError("Failed to load locations");
        console.error("Error fetching locations:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Show content with delay for animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [step]);

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setLatitude(lat);
        setLongitude(lng);
        setMapCenter([lat, lng]);
        
        // Reverse geocode to get address
        const address = await reverseGeocode(lat, lng);
        if (address) {
          setStreet(address.street || '');
          setBarangay(address.barangay || '');
          setZipCode(address.postcode || '');
          
          // Auto-select city/municipality if matches
          if (address.city) {
            const matchedCity = cities.find(c => 
              c.name.toLowerCase().includes(address.city.toLowerCase()) ||
              address.city.toLowerCase().includes(c.name.toLowerCase())
            );
            if (matchedCity) {
              setCity(matchedCity);
              setLocalityMode("city");
            }
          }
          
          if (address.municipality && !city) {
            const matchedMunicipality = municipalities.find(m => 
              m.name.toLowerCase().includes(address.municipality.toLowerCase()) ||
              address.municipality.toLowerCase().includes(m.name.toLowerCase())
            );
            if (matchedMunicipality) {
              setMunicipality(matchedMunicipality);
              setLocalityMode("municipality");
            }
          }
        }
        
        setIsLocating(false);
        toast.success("Location detected successfully!");
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Unable to get your current location");
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Handle map click
  const handleMapClick = async (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
    
    // Reverse geocode the clicked location
    const address = await reverseGeocode(lat, lng);
    if (address) {
      setStreet(address.street || '');
      setBarangay(address.barangay || '');
      setZipCode(address.postcode || '');
      
      // Auto-select city/municipality if matches
      if (address.city) {
        const matchedCity = cities.find(c => 
          c.name.toLowerCase().includes(address.city.toLowerCase()) ||
          address.city.toLowerCase().includes(c.name.toLowerCase())
        );
        if (matchedCity) {
          setCity(matchedCity);
          setLocalityMode("city");
        }
      }
      
      if (address.municipality && !city) {
        const matchedMunicipality = municipalities.find(m => 
          m.name.toLowerCase().includes(address.municipality.toLowerCase()) ||
          address.municipality.toLowerCase().includes(m.name.toLowerCase())
        );
        if (matchedMunicipality) {
          setMunicipality(matchedMunicipality);
          setLocalityMode("municipality");
        }
      }
    }
  };

  function handleImageChange(file: File | null) {
    setImageError("");
    setImagePreview("");
    setImageFile(null);
    if (!file) return;
    if (file.size > maxBytes) {
      setImageError("File exceeds 5MB limit");
      return;
    }
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  }

  function addInstitution() {
    if (nearInstitutions.length >= 10) return;
    setNearInstitutions([...nearInstitutions, { name: "", type: "" }]);
  }

  function updateInstitution(index: number, institution: Institution) {
    const updated = [...nearInstitutions];
    updated[index] = institution;
    setNearInstitutions(updated);
  }

  function removeInstitution(index: number) {
    const updated = nearInstitutions.filter((_, i) => i !== index);
    setNearInstitutions(updated);
  }

  // Filter valid institutions (non-empty name and type)
  const validInstitutions = nearInstitutions.filter(
    (inst) => inst.name.trim() && inst.type.trim()
  );

  const uploadMainImage = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const randomName = crypto.randomUUID();
    const path = `property_main_images/${randomName}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("rentease-images")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadError) throw new Error(uploadError.message);

    const { data } = supabase.storage
      .from("rentease-images")
      .getPublicUrl(path);
    return data.publicUrl;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (step !== STEPS.length - 1) return;

    try {
      setIsSubmitting(true);

      if (!imageFile) {
        toast.error("Please upload a main image before submitting.");
        setIsSubmitting(false);
        return;
      }

      // 1️⃣ Upload image
      const mainImageUrl = await uploadMainImage(imageFile);

      // 2️⃣ Build payload
      const payload = {
        title: title.trim(),
        type: type as
          | "APARTMENT"
          | "CONDOMINIUM"
          | "BOARDING_HOUSE"
          | "SINGLE_HOUSE",
        street: street.trim(),
        barangay: barangay.trim(),
        zipCode: zipCode.trim() || undefined,
        cityId: city?.id ?? undefined,
        municipalityId: municipality?.id ?? undefined,
        latitude: latitude || undefined,
        longitude: longitude || undefined,
        mainImageUrl,
        nearInstitutions:
          validInstitutions.length > 0 ? validInstitutions : undefined,
      };

      // 3️⃣ Call backend API
      const res = await createPropertyRequest(payload);
      const { message, id } = res.data;

      // 4️⃣ Show success toast
      toast.success(message);

      // 5️⃣ Navigate to property page
      navigate(`/landlord/properties/${id}?tab=overview`);
    } catch (err: any) {
      console.error("Submit failed:", err);

      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("Something went wrong while creating the property.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Prevent Enter key from submitting form on non-final steps
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && step < STEPS.length - 1) {
      e.preventDefault();
    }
  };

  // Step validations
  const isBasicsValid = title.trim().length > 0 && !!type;
  const hasOneLocality =
    (localityMode === "city" && !!city) ||
    (localityMode === "municipality" && !!municipality);
  const isAddressValid =
    street.trim().length > 0 && barangay.trim().length > 0 && hasOneLocality;
  const hasCoordinates = latitude !== null && longitude !== null;

  function nextStep() {
    setShowContent(false);
    setDirection(1);
    setTimeout(() => {
      if (step === 1 && !hasCoordinates) {
        toast.error("Please set your property location on the map first");
        return;
      }
      if (step === 2 && !isAddressValid) return;
      if (step === 3 && !isBasicsValid) return;
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }, 200);
  }

  function prevStep() {
    setShowContent(false);
    setDirection(-1);
    setTimeout(() => {
      setStep((s) => Math.max(s - 1, 0));
    }, 200);
  }

  const currentStep = STEPS[step];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/40 to-blue-50/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <motion.div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="absolute top-10 left-10 w-20 h-20 bg-emerald-200/20 rounded-full blur-xl"
          animate={{
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/4 right-20 w-16 h-16 bg-blue-200/20 rounded-full blur-xl"
          animate={{
            y: [0, 15, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </motion.div>

      <div className="relative max-w-6xl mx-auto p-4 sm:p-6">
        {/* Header with Logo and Exit */}
        <motion.div 
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-green-500" fill="currentColor" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                RentEase
              </span>
              <span className="bg-green-100 text-green-700 font-medium rounded-full text-xs px-2 py-1 border border-green-200">
                Landlord
              </span>
            </div>
          </div>
          
          <Button
            variant="ghost"
            onClick={() => navigate("/landlord/properties")}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200"
          >
            <X className="w-5 h-5 mr-2" />
            Exit
          </Button>
        </motion.div>

        {/* Progress Bar */}
        {step > 0 && (
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Step {step} of {STEPS.length - 1}</span>
              <span>{Math.round((step / (STEPS.length - 1)) * 100)}% complete</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}

        <Card className="rounded-2xl border-gray-200 shadow-lg">
          <CardHeader className="text-center border-b border-gray-200 pb-6">
            <motion.div 
              className="mx-auto w-14 h-14 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center mb-3"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <currentStep.icon className="w-6 h-6 text-white" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <CardTitle className={`font-bold text-gray-900 ${step === 1 ? 'text-xl' : 'text-2xl'}`}>
                {currentStep.title}
              </CardTitle>
              <CardDescription className={`text-gray-600 mt-1 max-w-2xl mx-auto ${step === 1 ? 'text-sm' : ''}`}>
                {currentStep.description}
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="p-6">
            <div onKeyDown={handleKeyDown}>
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  {showContent && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                    >
                      {/* Welcome Step */}
                      {step === 0 && (
                        <motion.div 
                          className="text-center space-y-6 py-4"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <motion.div variants={itemVariants} className="space-y-3">
                            <p className="text-gray-600 max-w-xl mx-auto">
                              We'll guide you through setting up your property in our system. 
                              Start by pinning your location on the map!
                            </p>
                          </motion.div>
                          
                          <motion.div 
                            variants={containerVariants}
                            className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto"
                          >
                            {[
                              { icon: MapPin, color: "emerald", title: "Map Location", desc: "Pin your property" },
                              { icon: FileText, color: "blue", title: "Details", desc: "Property information" },
                              { icon: ImageIcon, color: "purple", title: "Photos", desc: "Add property photos" },
                            ].map((item) => (
                              <motion.div
                                key={item.title}
                                variants={itemVariants}
                                className="text-center p-4 bg-white rounded-xl border border-gray-200 hover:border-emerald-300 transition-colors"
                                whileHover={{ y: -2 }}
                              >
                                <div className={`w-10 h-10 bg-${item.color}-100 rounded-xl flex items-center justify-center mx-auto mb-2`}>
                                  <item.icon className={`w-5 h-5 text-${item.color}-600`} />
                                </div>
                                <h4 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h4>
                                <p className="text-xs text-gray-600">{item.desc}</p>
                              </motion.div>
                            ))}
                          </motion.div>
                        </motion.div>
                      )}

                      {/* Step 1: Map Location */}
                      {step === 1 && (
                        <motion.div 
                          className="space-y-4"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <motion.div variants={itemVariants} className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <h3 className="text-lg font-semibold text-gray-900">
                                Click on the map to set your property location
                              </h3>
                              <Button
                                onClick={getCurrentLocation}
                                disabled={isLocating}
                                className="bg-blue-500 hover:bg-blue-600 text-white text-sm"
                                size="sm"
                              >
                                <Locate className="w-4 h-4 mr-1" />
                                {isLocating ? "Locating..." : "My Location"}
                              </Button>
                            </div>
                            
                            <div className="h-96 rounded-xl border-2 border-gray-300 overflow-hidden bg-gray-100 relative">
                              <MapContainer
                                center={mapCenter}
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                              >
                                <TileLayer
                                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <MapClickHandler onMapClick={handleMapClick} />
                                {latitude && longitude && (
                                  <Marker position={[latitude, longitude]} />
                                )}
                              </MapContainer>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              <div className="bg-gray-50 rounded-lg p-3">
                                <label className="font-medium text-gray-700">Latitude</label>
                                <div className="font-mono text-gray-900">{latitude?.toFixed(6) || "Not set"}</div>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-3">
                                <label className="font-medium text-gray-700">Longitude</label>
                                <div className="font-mono text-gray-900">{longitude?.toFixed(6) || "Not set"}</div>
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}

                      {/* Step 2: Address Verification */}
                      {step === 2 && (
                        <motion.div 
                          className="space-y-4"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <motion.div variants={itemVariants} className="bg-green-50 border border-green-200 rounded-xl p-4">
                            <div className="flex items-start gap-2">
                              <Navigation className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <h4 className="font-semibold text-green-900 text-sm mb-1">Address Detected</h4>
                                <p className="text-green-700 text-sm">
                                  Verify the address details below from your map location.
                                </p>
                              </div>
                            </div>
                          </motion.div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <motion.div variants={itemVariants} className="space-y-3">
                              <label className="text-sm font-semibold text-gray-900">
                                Street Address
                              </label>
                              <input
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                                placeholder="House No., Street Name"
                                className="h-11 w-full px-4 rounded-xl border border-gray-300 bg-white outline-none text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                                required
                              />
                            </motion.div>
                            
                            <motion.div variants={itemVariants} className="space-y-3">
                              <label className="text-sm font-semibold text-gray-900">
                                Barangay
                              </label>
                              <input
                                value={barangay}
                                onChange={(e) => setBarangay(e.target.value)}
                                placeholder="Barangay"
                                className="h-11 w-full px-4 rounded-xl border border-gray-300 bg-white outline-none text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                                required
                              />
                            </motion.div>

                            <motion.div variants={itemVariants} className="space-y-3">
                              <label className="text-sm font-semibold text-gray-900">
                                ZIP Code
                              </label>
                              <input
                                value={zipCode}
                                onChange={(e) => setZipCode(e.target.value)}
                                placeholder="e.g., 6000"
                                className="h-11 w-full px-4 rounded-xl border border-gray-300 bg-white outline-none text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                                inputMode="numeric"
                                pattern="[0-9]*"
                              />
                            </motion.div>

                            <motion.div variants={itemVariants} className="space-y-3">
                              <label className="text-sm font-semibold text-gray-900">
                                Locality Type
                              </label>
                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  { value: "city", label: "City" },
                                  { value: "municipality", label: "Municipality" }
                                ].map((locality) => (
                                  <button
                                    key={locality.value}
                                    type="button"
                                    onClick={() => {
                                      setLocalityMode(locality.value as "city" | "municipality");
                                      if (locality.value === "city") setMunicipality(null);
                                      else setCity(null);
                                    }}
                                    className={`p-3 rounded-lg border text-center transition-all duration-200 text-sm ${
                                      localityMode === locality.value
                                        ? "border-emerald-500 bg-emerald-50"
                                        : "border-gray-300 bg-white hover:border-emerald-300"
                                    }`}
                                  >
                                    {locality.label}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          </div>

                          {localityMode && (
                            <motion.div variants={itemVariants}>
                              {localityMode === "city" && (
                                <SearchSelect
                                  label="Select City"
                                  placeholder={loading ? "Loading cities..." : "Search for your city"}
                                  value={city}
                                  onChange={(opt) => setCity(opt)}
                                  options={cities}
                                  disabled={loading}
                                />
                              )}
                              {localityMode === "municipality" && (
                                <SearchSelect
                                  label="Select Municipality"
                                  placeholder={loading ? "Loading municipalities..." : "Search for your municipality"}
                                  value={municipality}
                                  onChange={(opt) => setMunicipality(opt)}
                                  options={municipalities}
                                  disabled={loading}
                                />
                              )}
                              {error && (
                                <p className="text-red-500 text-sm mt-2">{error}</p>
                              )}
                            </motion.div>
                          )}
                        </motion.div>
                      )}

                      {/* Step 3: Property Basics */}
                      {step === 3 && (
                        <motion.div 
                          className="space-y-4"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <motion.div variants={itemVariants} className="space-y-3">
                            <h3 className="text-lg font-semibold text-gray-900">
                              Property Type
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {PROPERTY_TYPES.map((propertyType) => {
                                const Icon = propertyType.icon;
                                return (
                                  <button
                                    key={propertyType.value}
                                    type="button"
                                    onClick={() => setType(propertyType.value)}
                                    className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                                      type === propertyType.value
                                        ? "border-emerald-500 bg-emerald-50 shadow-sm"
                                        : "border-gray-300 bg-white hover:border-emerald-300"
                                    }`}
                                  >
                                    <Icon className={`w-5 h-5 mb-2 ${
                                      type === propertyType.value ? "text-emerald-600" : "text-gray-400"
                                    }`} />
                                    <div className="text-sm font-semibold text-gray-900 mb-1">
                                      {propertyType.label}
                                    </div>
                                    <div className="text-xs text-gray-600">
                                      {propertyType.description}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                          
                          <motion.div variants={itemVariants} className="space-y-3">
                            <label className="text-sm font-semibold text-gray-900">
                              Property Title
                            </label>
                            <input
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              placeholder="e.g., Cozy Apartment near IT Park"
                              className="h-11 w-full px-4 rounded-xl border border-gray-300 bg-white outline-none text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                              required
                            />
                            <p className="text-xs text-gray-500">
                              Choose a descriptive title that highlights your property's best features
                            </p>
                          </motion.div>
                        </motion.div>
                      )}

                      {/* Step 4: Nearby Institutions */}
                      {step === 4 && (
                        <motion.div 
                          className="space-y-4"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <motion.div variants={itemVariants} className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">
                                Added: {validInstitutions.length} / 10
                              </span>
                              {validInstitutions.length > 0 && (
                                <span className="text-sm font-medium text-emerald-600">
                                  {validInstitutions.length} valid
                                </span>
                              )}
                            </div>

                            {nearInstitutions.length === 0 ? (
                              <motion.div 
                                variants={itemVariants}
                                className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50"
                              >
                                <Building className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">No institutions added yet</p>
                              </motion.div>
                            ) : (
                              <div className="space-y-3 max-h-60 overflow-y-auto">
                                {nearInstitutions.map((institution, index) => (
                                  <InstitutionForm
                                    key={index}
                                    institution={institution}
                                    onChange={(inst) => updateInstitution(index, inst)}
                                    onRemove={() => removeInstitution(index)}
                                    index={index}
                                  />
                                ))}
                              </div>
                            )}

                            {nearInstitutions.length < 10 && (
                              <motion.div variants={itemVariants}>
                                <Button
                                  type="button"
                                  onClick={addInstitution}
                                  variant="outline"
                                  className="w-full h-11 border-2 border-dashed border-gray-300 hover:border-emerald-300 hover:bg-emerald-50 text-gray-600 rounded-xl text-sm"
                                >
                                  + Add Institution ({nearInstitutions.length}/10)
                                </Button>
                              </motion.div>
                            )}
                          </motion.div>
                        </motion.div>
                      )}

                      {/* Step 5: Property Photo */}
                      {step === 5 && (
                        <motion.div 
                          className="space-y-4"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <motion.div variants={itemVariants} className="space-y-3">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-900">
                                  Main Image
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
                                    className="hidden"
                                    id="image-upload"
                                  />
                                  <label htmlFor="image-upload" className="cursor-pointer block">
                                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <div className="text-sm font-semibold text-gray-700 mb-1">
                                      Click to upload main image
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      PNG, JPG, JPEG up to 5MB
                                    </div>
                                  </label>
                                </div>
                                {imageError && (
                                  <p className="text-red-500 text-xs mt-2">{imageError}</p>
                                )}
                              </div>

                              <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-900">
                                  Image Preview
                                </label>
                                {imagePreview ? (
                                  <motion.div 
                                    className="w-48 h-48 rounded-xl border-2 border-emerald-200 overflow-hidden mx-auto"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                  >
                                    <img
                                      src={imagePreview}
                                      alt="Property preview"
                                      className="w-full h-full object-cover"
                                    />
                                  </motion.div>
                                ) : (
                                  <div className="w-48 h-48 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center mx-auto">
                                    <div className="text-center text-gray-400">
                                      <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                                      <p className="text-sm">No image selected</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Navigation Buttons */}
              <motion.div 
                className="flex items-center justify-between gap-4 pt-6 mt-6 border-t border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={step === 0}
                  className="h-10 px-5 rounded-xl border-gray-300 disabled:opacity-50 text-sm"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {step < STEPS.length - 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={
                      (step === 1 && !hasCoordinates) ||
                      (step === 2 && !isAddressValid) ||
                      (step === 3 && !isBasicsValid)
                    }
                    className="h-10 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 text-sm"
                  >
                    {step === 0 ? 'Get Started' : 'Next'}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="h-10 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      'Create Property'
                    )}
                  </Button>
                )}
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
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

// Cebu province bounds (more restrictive): [southWest, northEast]
const CEBU_BOUNDS = [
  [9.2, 123.2],
  [11.4, 124.0],
] as const;

// Cebu province center and zoom constraints
const CEBU_CENTER: [number, number] = [10.3157, 123.8854];
const CEBU_MIN_ZOOM = 8;
const CEBU_MAX_ZOOM = 16;

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

// Function to reverse geocode coordinates to address using Nominatim
const reverseGeocode = async (lat: number, lng: number) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'RentEase/1.0'
        }
      }
    );

    if (!response.ok) throw new Error("Failed to fetch location");

    const data = await response.json();
    
    if (data && data.address) {
      const address = data.address;
      
      // Parse Philippine address components more intelligently
      let street = '';
      let barangay = '';
      let city = '';
      let municipality = '';
      let postcode = '';
      
      // Street address - try multiple fields
      street = address.road || address.pedestrian || address.footway || address.path || '';
      
      // Barangay - try multiple fields
      barangay = address.suburb || address.neighbourhood || address.hamlet || address.village || '';
      
      // City/Municipality - better logic for Philippine addresses
      if (address.city && address.city.toLowerCase().includes('city')) {
        city = address.city;
      } else if (address.town && address.town.toLowerCase().includes('city')) {
        city = address.town;
      } 
      // If no city found, check for municipality
      else if (address.municipality) {
        municipality = address.municipality;
      } else if (address.county) {
        municipality = address.county;
      } else if (address.town) {
        municipality = address.town;
      } else if (address.city) {
        municipality = address.city;
      }
      
      // ZIP code
      postcode = address.postcode || '';
      
      return {
        street: street || '',
        barangay: barangay || '',
        city: city || '',
        municipality: municipality || '',
        state: address.state || '',
        postcode: postcode || '',
        displayName: data.display_name || ''
      };
    }
    
    return null;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return null;
  }
};

export default function CreateProperty() {
  const STEPS = [
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
  
  const [step, setStep] = React.useState<number>(1);
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
  const [imageUrl, setImageUrl] = React.useState<string>("");
  const [imageInputMode, setImageInputMode] = React.useState<"file" | "url">("file");
  const [imageError, setImageError] = React.useState<string>("");
  const [imagePreview, setImagePreview] = React.useState<string>("");
  const [nearInstitutions, setNearInstitutions] = React.useState<Institution[]>([]);
  const [otherInformation, setOtherInformation] = React.useState<Array<{ context: string; description: string }>>([]);

  // Map state
  const [mapCenter, setMapCenter] = useState<[number, number]>(CEBU_CENTER); // Default Cebu coordinates
  const cebuBoundsRef = React.useRef<L.LatLngBounds | null>(null);
  const mapRef = React.useRef<L.Map | null>(null);
  

  // API data state
  const [cities, setCities] = React.useState<Option[]>([]);
  const [municipalities, setMunicipalities] = React.useState<Option[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [localityQuery, setLocalityQuery] = React.useState("");

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

  // Build Cebu bounds once
  useEffect(() => {
    cebuBoundsRef.current = L.latLngBounds(CEBU_BOUNDS as any);
  }, []);

  // Forward geocode locality name within Cebu province
  const forwardGeocodeLocality = async (name: string): Promise<{ lat: number; lon: number } | null> => {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name + ', Cebu, Philippines')}&limit=1`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        return { lat, lon };
      }
      return null;
    } catch (e) {
      console.error('Forward geocoding failed:', e);
      return null;
    }
  };

  const handleLocalitySearch = async () => {
    const q = localityQuery.trim();
    if (!q) return;
    
    try {
      const result = await forwardGeocodeLocality(q);
      if (result) {
        const { lat, lon } = result;
        
        // Validate within Cebu bounds
        const within = cebuBoundsRef.current?.contains(L.latLng(lat, lon));
        if (!within) {
          toast.error('No results found within Cebu for "' + q + '"');
          return;
        }

        // Set marker coordinates and center map
        setLatitude(lat);
        setLongitude(lon);
        setMapCenter([lat, lon]);
        
        // Smooth animation to the location
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lon], 14, { 
            duration: 1.2,
            easeLinearity: 0.1
          });
        }
        
        // Auto-populate address fields from search result coordinates
        const address = await reverseGeocode(lat, lon);
        
        if (address) {
          setStreet(address.street || '');
          setBarangay(address.barangay || '');
          setZipCode(address.postcode || '');
          
          // Auto-select city/municipality if matches
          if (address.city) {
            const matchedCity = cities.find(c => 
              c.name.toLowerCase().includes(address.city.toLowerCase()) ||
              address.city.toLowerCase().includes(c.name.toLowerCase()) ||
              address.city.toLowerCase().replace('city', '').trim() === c.name.toLowerCase() ||
              c.name.toLowerCase().replace('city', '').trim() === address.city.toLowerCase().replace('city', '').trim()
            );
            if (matchedCity) {
              setCity(matchedCity);
              setLocalityMode("city");
            }
          }
          
          if (address.municipality && !city) {
            const matchedMunicipality = municipalities.find(m => 
              m.name.toLowerCase().includes(address.municipality.toLowerCase()) ||
              address.municipality.toLowerCase().includes(m.name.toLowerCase()) ||
              address.municipality.toLowerCase().replace('municipality', '').trim() === m.name.toLowerCase() ||
              m.name.toLowerCase().replace('municipality', '').trim() === address.municipality.toLowerCase().replace('municipality', '').trim()
            );
            if (matchedMunicipality) {
              setMunicipality(matchedMunicipality);
              setLocalityMode("municipality");
            }
          }
          
          // If still no match, try to match city field as municipality (for cases like Bantayan)
          if (!city && !municipality && address.city) {
            const matchedMunicipality = municipalities.find(m => 
              m.name.toLowerCase().includes(address.city.toLowerCase()) ||
              address.city.toLowerCase().includes(m.name.toLowerCase())
            );
            if (matchedMunicipality) {
              setMunicipality(matchedMunicipality);
              setLocalityMode("municipality");
            }
          }
        }
        
        toast.success(`Map centered to ${q} - Address populated automatically`);
      } else {
        toast.error('No results found for "' + q + '" in Cebu');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Error searching for location');
    }
  };

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
        
        // Smooth animation to the current location
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], 15, { 
            duration: 1.5,
            easeLinearity: 0.1
          });
        }
        
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
              address.city.toLowerCase().includes(c.name.toLowerCase()) ||
              address.city.toLowerCase().replace('city', '').trim() === c.name.toLowerCase() ||
              c.name.toLowerCase().replace('city', '').trim() === address.city.toLowerCase().replace('city', '').trim()
            );
            if (matchedCity) {
              setCity(matchedCity);
              setLocalityMode("city");
            }
          }
          
          if (address.municipality && !city) {
            const matchedMunicipality = municipalities.find(m => 
              m.name.toLowerCase().includes(address.municipality.toLowerCase()) ||
              address.municipality.toLowerCase().includes(m.name.toLowerCase()) ||
              address.municipality.toLowerCase().replace('municipality', '').trim() === m.name.toLowerCase() ||
              m.name.toLowerCase().replace('municipality', '').trim() === address.municipality.toLowerCase().replace('municipality', '').trim()
            );
            if (matchedMunicipality) {
              setMunicipality(matchedMunicipality);
              setLocalityMode("municipality");
            }
          }
          
          // If still no match, try to match city field as municipality (for cases like Bantayan)
          if (!city && !municipality && address.city) {
            const matchedMunicipality = municipalities.find(m => 
              m.name.toLowerCase().includes(address.city.toLowerCase()) ||
              address.city.toLowerCase().includes(m.name.toLowerCase())
            );
            if (matchedMunicipality) {
              setMunicipality(matchedMunicipality);
              setLocalityMode("municipality");
            }
          }
        }
        
        setIsLocating(false);
        toast.success("Location detected and address populated!");
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
    // Ensure click is within Cebu bounds
    if (lat < CEBU_BOUNDS[0][0] || lat > CEBU_BOUNDS[1][0] || 
        lng < CEBU_BOUNDS[0][1] || lng > CEBU_BOUNDS[1][1]) {
      toast.error("Please select a location within Cebu province");
      return;
    }
    
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
          address.city.toLowerCase().includes(c.name.toLowerCase()) ||
          address.city.toLowerCase().replace('city', '').trim() === c.name.toLowerCase() ||
          c.name.toLowerCase().replace('city', '').trim() === address.city.toLowerCase().replace('city', '').trim()
        );
        if (matchedCity) {
          setCity(matchedCity);
          setLocalityMode("city");
        }
      }
      
      if (address.municipality && !city) {
        const matchedMunicipality = municipalities.find(m => 
          m.name.toLowerCase().includes(address.municipality.toLowerCase()) ||
          address.municipality.toLowerCase().includes(m.name.toLowerCase()) ||
          address.municipality.toLowerCase().replace('municipality', '').trim() === m.name.toLowerCase() ||
          m.name.toLowerCase().replace('municipality', '').trim() === address.municipality.toLowerCase().replace('municipality', '').trim()
        );
        if (matchedMunicipality) {
          setMunicipality(matchedMunicipality);
          setLocalityMode("municipality");
        }
      }
      
      // If still no match, try to match city field as municipality (for cases like Bantayan)
      if (!city && !municipality && address.city) {
        const matchedMunicipality = municipalities.find(m => 
          m.name.toLowerCase().includes(address.city.toLowerCase()) ||
          address.city.toLowerCase().includes(m.name.toLowerCase())
        );
        if (matchedMunicipality) {
          setMunicipality(matchedMunicipality);
          setLocalityMode("municipality");
        }
      }
      
      // Show success message with populated info
      toast.success(`Address populated: ${address.street || 'Street'}, ${address.barangay || 'Barangay'}`);
    }
  };

  function handleImageChange(file: File | null) {
    setImageError("");
    setImagePreview("");
    setImageFile(null);
    setImageUrl("");
    if (!file) return;
    if (file.size > maxBytes) {
      setImageError("File exceeds 5MB limit");
      return;
    }
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  }

  function handleImageUrlChange(url: string) {
    setImageError("");
    setImagePreview("");
    setImageFile(null);
    setImageUrl(url);
    
    if (!url.trim()) {
      setImagePreview("");
      return;
    }

    // Validate URL format
    try {
      const urlObj = new URL(url);
      // Check if it's a valid image URL
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
      const pathname = urlObj.pathname.toLowerCase();
      const isImageUrl = imageExtensions.some(ext => pathname.endsWith(ext)) || 
                        urlObj.hostname.includes('imgur') ||
                        urlObj.hostname.includes('cloudinary') ||
                        urlObj.hostname.includes('unsplash') ||
                        urlObj.hostname.includes('pexels');
      
      if (!isImageUrl) {
        // Still allow it but show a warning
        setImageError("Please ensure the URL points to a valid image");
      }
      
      // Set preview
      setImagePreview(url);
    } catch (error) {
      setImageError("Please enter a valid URL");
      setImagePreview("");
    }
  }

  function handleImageModeChange(mode: "file" | "url") {
    setImageInputMode(mode);
    setImageError("");
    setImagePreview("");
    setImageFile(null);
    setImageUrl("");
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

  // Other Information handlers
  function addOtherInformation() {
    if (otherInformation.length >= 10) return;
    setOtherInformation([...otherInformation, { context: "", description: "" }]);
  }

  function updateOtherInformation(index: number, entry: { context: string; description: string }) {
    const updated = [...otherInformation];
    updated[index] = entry;
    setOtherInformation(updated);
  }

  function removeOtherInformation(index: number) {
    const updated = otherInformation.filter((_, i) => i !== index);
    setOtherInformation(updated);
  }

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

    // Check if we're on the last step (step 5 - Property Photos)
    if (step !== 5) return;

    try {
      setIsSubmitting(true);

      if (imageInputMode === "file" && !imageFile) {
        toast.error("Please upload a main image before submitting.");
        setIsSubmitting(false);
        return;
      }

      if (imageInputMode === "url" && !imageUrl.trim()) {
        toast.error("Please enter an image URL before submitting.");
        setIsSubmitting(false);
        return;
      }

      // 1️⃣ Get image URL (either upload file or use provided URL)
      let mainImageUrl: string;
      if (imageInputMode === "file" && imageFile) {
        mainImageUrl = await uploadMainImage(imageFile);
      } else if (imageInputMode === "url" && imageUrl.trim()) {
        // Validate URL one more time
        try {
          new URL(imageUrl.trim());
          mainImageUrl = imageUrl.trim();
        } catch (error) {
          toast.error("Please enter a valid image URL.");
          setIsSubmitting(false);
          return;
        }
      } else {
        toast.error("Please provide a main image (file upload or URL).");
        setIsSubmitting(false);
        return;
      }

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
        otherInformation:
          otherInformation.filter((e) => e.context.trim() || e.description.trim()).map((e) => ({
            context: e.context.trim(),
            description: e.description.trim(),
          })).length > 0
            ? otherInformation
                .filter((e) => e.context.trim() || e.description.trim())
                .map((e) => ({ context: e.context.trim(), description: e.description.trim() }))
            : undefined,
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
      const idx = STEPS.findIndex((s) => s.id === step);
      const next = STEPS[Math.min(idx + 1, STEPS.length - 1)].id;
      setStep(next);
    }, 200);
  }

  function prevStep() {
    setShowContent(false);
    setDirection(-1);
    setTimeout(() => {
      const idx = STEPS.findIndex((s) => s.id === step);
      const prev = STEPS[Math.max(idx - 1, 0)].id;
      setStep(prev);
    }, 200);
  }

  const currentStep = React.useMemo(() => STEPS.find((s) => s.id === step)!, [STEPS, step]);
  const lastStepId = STEPS[STEPS.length - 1].id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 relative overflow-hidden">
      {/* Modern Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-emerald-100/30 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-blue-100/30 rounded-full blur-2xl animate-pulse delay-1000" />

      <div className="relative max-w-8xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Modern Creative Header */}
        <motion.div 
          className="relative mb-8"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Background Elements */}
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-full blur-xl" />
          <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-lg" />
          
          <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl p-6">
            <div className="flex items-center justify-between">
              {/* Left Side - Brand */}
              <div className="flex items-center gap-4">
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 via-emerald-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Zap className="w-7 h-7 text-white" fill="currentColor" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" />
                </motion.div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                      RentEase
                    </h1>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Create Property</p>
                </div>
              </div>
              
              {/* Right Side - Actions */}
              <div className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="ghost"
                    onClick={() => navigate("/landlord/properties")}
                    className="group relative overflow-hidden bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-600 hover:text-red-700 rounded-xl border border-red-200 hover:border-red-300 h-11 px-6 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <X className="w-4 h-4 mr-2 relative z-10" />
                    <span className="relative z-10 font-medium">Exit</span>
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content - Side by Side Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Step Info */}
          <div className="lg:col-span-1">
            <Card className="rounded-2xl border-gray-200 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <motion.div 
                  className="mx-auto w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  <currentStep.icon className="w-6 h-6 text-white" />
                </motion.div>
                <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                  {currentStep.title}
                </CardTitle>
                <CardDescription className="text-gray-600 text-sm leading-relaxed">
                  {currentStep.description}
                </CardDescription>
              </CardHeader>
              
              {/* Step Navigation */}
              <CardContent className="p-6 pt-0">
                <div className="space-y-3">
                  {STEPS.map((stepItem) => (
                    <div
                      key={stepItem.id}
                      className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                        step === stepItem.id
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                          : step > stepItem.id
                          ? 'bg-gray-50 text-gray-600'
                          : 'bg-gray-50 text-gray-400'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        step === stepItem.id
                          ? 'bg-emerald-500 text-white'
                          : step > stepItem.id
                          ? 'bg-emerald-200 text-emerald-600'
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        {stepItem.id}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{stepItem.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Form */}
          <div className="lg:col-span-2">
            <Card className="rounded-2xl border-gray-200 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div>
                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                      key={step}
                      custom={direction}
                      variants={stepVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      className="h-full"
                    >
                      {showContent && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4, delay: 0.2 }}
                          className="h-full flex flex-col"
                        >
                      

                      {/* Step 1: Map Location - Compact Design */}
                      {step === 1 && (
                        <div className="space-y-6">
                          {/* Search Controls */}
                          <div className="flex flex-col sm:flex-row gap-3">
                            <input
                              value={localityQuery}
                              onChange={(e) => setLocalityQuery(e.target.value)}
                              placeholder="Search city or municipality in Cebu"
                              className="flex-1 h-10 px-4 rounded-lg border border-gray-300 bg-white outline-none text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleLocalitySearch(); } }}
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={handleLocalitySearch}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white h-10 px-4 rounded-lg text-sm"
                              >
                                Search
                              </Button>
                              <Button
                                onClick={getCurrentLocation}
                                disabled={isLocating}
                                className="bg-blue-500 hover:bg-blue-600 text-white h-10 px-4 rounded-lg text-sm"
                              >
                                <Locate className="w-4 h-4 mr-1" />
                                {isLocating ? "Locating..." : "My Location"}
                              </Button>
                            </div>
                          </div>
                          
                          {/* Map */}
                          <div className="h-96 rounded-lg border border-gray-300 overflow-hidden bg-gray-100 relative">
                            <MapContainer
                              ref={mapRef}
                              center={mapCenter}
                              zoom={12}
                              minZoom={CEBU_MIN_ZOOM}
                              maxZoom={CEBU_MAX_ZOOM}
                              maxBounds={CEBU_BOUNDS as any}
                              maxBoundsViscosity={1.0}
                              worldCopyJump={false}
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
                          
                          {/* Compact Coordinates */}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <label className="font-medium text-gray-700 text-xs">Latitude</label>
                              <div className="font-mono text-gray-900">{latitude?.toFixed(6) || "Not set"}</div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <label className="font-medium text-gray-700 text-xs">Longitude</label>
                              <div className="font-mono text-gray-900">{longitude?.toFixed(6) || "Not set"}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Address Verification */}
                      {step === 2 && (
                        <motion.div 
                          className="space-y-4"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <motion.div variants={itemVariants} className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div className="flex items-start gap-2">
                              <Navigation className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <h4 className="font-semibold text-blue-900 text-sm mb-1">⚠️ Please Verify Your Exact Address</h4>
                                <p className="text-blue-700 text-sm mb-2">
                                  The address details below were automatically detected from your map location. <strong>Please carefully review and correct any information to ensure the exact address is accurate.</strong>
                                </p>
                                <div className="bg-blue-100 rounded-lg p-3 mt-2">
                                  <p className="text-blue-800 text-xs font-medium mb-1">Important:</p>
                                  <ul className="text-blue-700 text-xs space-y-1">
                                    <li>• Verify the street name and house number</li>
                                    <li>• Confirm the correct barangay</li>
                                    <li>• Ensure the city/municipality is accurate</li>
                                    <li>• Check the ZIP code if available</li>
                                  </ul>
                                </div>
                                {latitude && longitude && (
                                  <div className="mt-2 text-xs text-blue-600 font-mono">
                                    📍 Coordinates: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                                  </div>
                                )}
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

                        {/* Other Information */}
                        <motion.div variants={itemVariants} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Other Information (optional)</h3>
                            {otherInformation.length < 10 && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={addOtherInformation}
                                className="h-10 px-3 text-sm border-gray-300"
                              >
                                + Add Item ({otherInformation.length}/10)
                              </Button>
                            )}
                          </div>
                          {otherInformation.length === 0 ? (
                            <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-sm text-gray-500">
                              No additional information added
                            </div>
                          ) : (
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                              {otherInformation.map((entry, index) => (
                                <div key={index} className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start p-4 border border-gray-200 rounded-xl bg-gray-50">
                                  <div className="lg:col-span-4">
                                    <label className="text-sm font-semibold text-gray-900 mb-2 block">Context</label>
                                    <input
                                      value={entry.context}
                                      onChange={(e) => updateOtherInformation(index, { ...entry, context: e.target.value })}
                                      placeholder="e.g., Second Floor"
                                      className="h-11 w-full px-4 rounded-lg border border-gray-300 bg-white outline-none text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                                    />
                                  </div>
                                  <div className="lg:col-span-7">
                                    <label className="text-sm font-semibold text-gray-900 mb-2 block">Description</label>
                                    <input
                                      value={entry.description}
                                      onChange={(e) => updateOtherInformation(index, { ...entry, description: e.target.value })}
                                      placeholder="has a lot of information about the stuff and etc"
                                      className="h-11 w-full px-4 rounded-lg border border-gray-300 bg-white outline-none text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                                    />
                                  </div>
                                  <div className="lg:col-span-1 flex lg:justify-end">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => removeOtherInformation(index)}
                                      className="h-11 mt-6 px-4 border-gray-300 hover:border-red-300 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
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
                            {/* Input Mode Toggle */}
                            <div className="flex items-center gap-2 mb-4">
                              <span className="text-sm font-semibold text-gray-900">Image Source:</span>
                              <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                                <button
                                  type="button"
                                  onClick={() => handleImageModeChange("file")}
                                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                    imageInputMode === "file"
                                      ? "bg-white text-emerald-600 shadow-sm"
                                      : "text-gray-600 hover:text-gray-900"
                                  }`}
                                >
                                  Upload File
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleImageModeChange("url")}
                                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                    imageInputMode === "url"
                                      ? "bg-white text-emerald-600 shadow-sm"
                                      : "text-gray-600 hover:text-gray-900"
                                  }`}
                                >
                                  Image URL
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-900">
                                  Main Image
                                </label>
                                
                                {imageInputMode === "file" ? (
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
                                ) : (
                                  <div className="space-y-2">
                                    <input
                                      type="url"
                                      value={imageUrl}
                                      onChange={(e) => handleImageUrlChange(e.target.value)}
                                      placeholder="https://example.com/image.jpg"
                                      className="h-11 w-full px-4 rounded-xl border border-gray-300 bg-white outline-none text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                                    />
                                    <p className="text-xs text-gray-500">
                                      Enter a direct link to an image (e.g., from Imgur, Cloudinary, or any image hosting service)
                                    </p>
                                  </div>
                                )}
                                
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
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between gap-4 pt-6 mt-6 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={step === 1}
                    className="h-10 px-6 rounded-lg border-gray-300 disabled:opacity-50 text-sm"
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  {step !== lastStepId ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={
                        (step === 1 && !hasCoordinates) ||
                        (step === 2 && !isAddressValid) ||
                        (step === 3 && !isBasicsValid)
                      }
                      className="h-10 px-6 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 text-sm"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="h-10 px-6 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
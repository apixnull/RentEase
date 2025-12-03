import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import { motion } from "framer-motion";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getCitiesAndMunicipalitiesRequest,
  getPropertyEditableDataRequest,
  updatePropertyRequest,
} from "@/api/landlord/propertyApi";
import { privateApi } from "@/api/axios";
import { supabase } from "@/lib/supabaseClient";
import {
  AlertTriangle,
  Building,
  ArrowLeft,
  Home,
  Image as ImageIcon,
  Link as LinkIcon,
  Locate,
  Loader2,
  MapPin,
  Navigation,
  RefreshCw,
  Search,
  Upload,
  Edit,
  Save,
  Info,
  Plus,
  Trash2,
} from "lucide-react";

type Option = { id: string; name: string };
type Institution = { name: string; type: string };
type OtherInfo = { context: string; description: string };

type EditableProperty = {
  id: string;
  title: string;
  type: string;
  address?: {
    street?: string;
    barangay?: string;
    zipCode?: string;
    city?: Option | null;
    municipality?: Option | null;
  };
  location?: {
    latitude?: number | null;
    longitude?: number | null;
  };
  media?: {
    mainImageUrl?: string | null;
    nearInstitutions?: Institution[] | null;
    otherInformation?: OtherInfo[] | null;
  };
};

const PROPERTY_TYPES = [
  { value: "APARTMENT", label: "Apartment", description: "Self-contained unit in a larger building", icon: Building },
  { value: "CONDOMINIUM", label: "Condominium", description: "Individually owned unit in a tower", icon: Building },
  { value: "BOARDING_HOUSE", label: "Boarding House", description: "Shared living spaces with private rooms", icon: Home },
  { value: "SINGLE_HOUSE", label: "Single House", description: "Standalone residential property", icon: Home },
] as const;

const INSTITUTION_TYPES = [
  "Education",
  "Healthcare",
  "Commerce",
  "Government",
  "Finance",
  "Transport",
  "Leisure",
  "Religion",
] as const;

const MAX_INSTITUTIONS = 10;
const MAX_OTHER_INFO = 10;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const CEBU_CENTER: [number, number] = [10.3157, 123.8854];
const CEBU_BOUNDS = [
  [9.2, 123.2],
  [11.4, 124.0],
] as const;

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (latitude: number, longitude: number) => void;
}) {
  useMapEvents({
    click: (event) => {
      onMapClick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

const reverseGeocode = async (lat: number, lng: number) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { "User-Agent": "RentEase/1.0" } }
    );
    if (!response.ok) throw new Error("Failed to reverse geocode");
    const data = await response.json();
    const address = data?.address;
    return {
      street:
        address?.road ||
        address?.pedestrian ||
        address?.footway ||
        address?.path ||
        "",
      barangay:
        address?.suburb ||
        address?.neighbourhood ||
        address?.hamlet ||
        address?.village ||
        "",
      zipCode: address?.postcode || "",
      city: address?.city || address?.town || "",
      municipality:
        address?.municipality ||
        address?.county ||
        address?.town ||
        address?.city ||
        "",
    };
  } catch (error) {
    console.error("Reverse geocode error:", error);
    return null;
  }
};

const forwardGeocodeLocality = async (name: string) => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      `${name}, Cebu, Philippines`
    )}&limit=1`;
    const response = await fetch(url, { headers: { "Accept-Language": "en" } });
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error("Forward geocoding failed:", error);
    return null;
  }
};

const generateRandomName = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const extractPathFromSupabaseUrl = (url: string): string | null => {
  try {
    // Extract path from Supabase public URL
    // Format: https://[project].supabase.co/storage/v1/object/public/rentease-images/path/to/file
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/rentease-images\/(.+)/);
    if (pathMatch && pathMatch[1]) {
      return decodeURIComponent(pathMatch[1]);
    }
    return null;
  } catch {
    return null;
  }
};

const deleteImageFromSupabase = async (url: string): Promise<void> => {
  const path = extractPathFromSupabaseUrl(url);
  if (!path) return;

  const { error } = await supabase.storage
    .from("rentease-images")
    .remove([path]);

  if (error) {
    console.error("Failed to delete old image:", error);
    // Don't throw - we'll continue even if deletion fails
  }
};

const uploadMainImage = async (file: File): Promise<string> => {
  // Check if using local storage (development mode or explicit flag)
  const useLocalStorage =
    import.meta.env.VITE_USE_LOCAL_STORAGE === "true" ||
    import.meta.env.MODE === "development";

  if (useLocalStorage) {
    // Local storage mode: Upload to backend endpoint
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await privateApi.post("/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const mockUrl = response.data.url; // e.g., "/local-images/property_main_images/uuid.jpg"

      // In development, prepend backend URL to make it accessible
      if (import.meta.env.MODE === "development") {
        const backendUrl = "http://localhost:5000";
        return `${backendUrl}${mockUrl}`;
      }

      // In production with local storage, return as-is (backend should handle full URL)
      return mockUrl;
    } catch (error: any) {
      console.error("Local upload error:", error);
      throw new Error(
        error.response?.data?.error || "Failed to upload image to local storage"
      );
    }
  } else {
    // Supabase storage mode (production)
    const ext = file.name.split(".").pop();
    const randomName = generateRandomName();
    const path = `property_main_images/${randomName}.${ext}`;

    const { error } = await supabase.storage
      .from("rentease-images")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from("rentease-images").getPublicUrl(path);
    return data.publicUrl;
  }
};

const EditProperty = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [street, setStreet] = useState("");
  const [barangay, setBarangay] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState<Option | null>(null);
  const [municipality, setMunicipality] = useState<Option | null>(null);
  const [localityMode, setLocalityMode] = useState<"city" | "municipality" | null>(
    null
  );

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(CEBU_CENTER);
  const [cities, setCities] = useState<Option[]>([]);
  const [municipalities, setMunicipalities] = useState<Option[]>([]);
  const [mapMessage, setMapMessage] = useState<string | null>(null);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [localityQuery, setLocalityQuery] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  const [nearInstitutions, setNearInstitutions] = useState<Institution[]>([]);
  const [otherInformation, setOtherInformation] = useState<OtherInfo[]>([]);

  const [imageMode, setImageMode] = useState<"link" | "upload">("link");
  const [imageLink, setImageLink] = useState("");
  const [mainImagePreview, setMainImagePreview] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);

  const mapRef = useRef<L.Map | null>(null);
  const cebuBoundsRef = useRef<L.LatLngBounds | null>(null);

  useEffect(() => {
    cebuBoundsRef.current = L.latLngBounds(CEBU_BOUNDS as any);
  }, []);

  useEffect(() => {
    if (!propertyId) {
      toast.error("Missing property identifier");
      navigate("/landlord/properties");
      return;
    }

    const controller = new AbortController();
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [propertyRes, localityRes] = await Promise.all([
          getPropertyEditableDataRequest(propertyId, { signal: controller.signal }),
          getCitiesAndMunicipalitiesRequest({ signal: controller.signal }),
        ]);

        const property: EditableProperty | undefined = propertyRes.data?.property;
        if (!property) {
          throw new Error("Property data not found");
        }

        const addr = property.address || {};
        const loc = property.location || {};
        const media = property.media || {};

        setTitle(property.title || "");
        setType(property.type || "");
        setStreet(addr.street || "");
        setBarangay(addr.barangay || "");
        setZipCode(addr.zipCode || "");

        if (addr.city) {
          setCity(addr.city);
          setLocalityMode("city");
        } else if (addr.municipality) {
          setMunicipality(addr.municipality);
          setLocalityMode("municipality");
        }

        const lat = loc.latitude ?? null;
        const lng = loc.longitude ?? null;
        setLatitude(lat);
        setLongitude(lng);
        if (lat && lng) setMapCenter([lat, lng]);

        setCities(localityRes.data?.cities || []);
        setMunicipalities(localityRes.data?.municipalities || []);

        setNearInstitutions(
          Array.isArray(media.nearInstitutions) ? media.nearInstitutions : []
        );
        setOtherInformation(
          Array.isArray(media.otherInformation) ? media.otherInformation : []
        );

        if (media.mainImageUrl) {
          setImageMode("link");
          setImageLink(media.mainImageUrl);
          setMainImagePreview(media.mainImageUrl);
          setOriginalImageUrl(media.mainImageUrl);
        } else {
          setImageMode("upload");
          setImageLink("");
          setMainImagePreview("");
          setOriginalImageUrl(null);
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        const message =
          err.response?.data?.message ??
          err.message ??
          "Failed to load property data";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [propertyId, navigate]);

  const handleMapClick = async (lat: number, lng: number) => {
    const withinBounds =
      lat >= CEBU_BOUNDS[0][0] &&
      lat <= CEBU_BOUNDS[1][0] &&
      lng >= CEBU_BOUNDS[0][1] &&
      lng <= CEBU_BOUNDS[1][1];

    if (!withinBounds) {
      setMapMessage("Please stay within Cebu province.");
      return;
    }

    setLatitude(lat);
    setLongitude(lng);
    setMapCenter([lat, lng]);
    setMapMessage("Location updated. Reverse geocoding address…");
    setIsReverseGeocoding(true);

    const address = await reverseGeocode(lat, lng);
    if (address) {
      setStreet(address.street || street);
      setBarangay(address.barangay || barangay);
      setZipCode(address.zipCode || zipCode);

      if (address.city) {
        const normalized = address.city.toLowerCase();
        const matchedCity = cities.find((c) =>
          c.name.toLowerCase().includes(normalized)
        );
        if (matchedCity) {
          setCity(matchedCity);
          setMunicipality(null);
          setLocalityMode("city");
        }
      }

      if (address.municipality && !city) {
        const normalized = address.municipality.toLowerCase();
        const matchedMunicipality = municipalities.find((m) =>
          m.name.toLowerCase().includes(normalized)
        );
        if (matchedMunicipality) {
          setMunicipality(matchedMunicipality);
          setCity(null);
          setLocalityMode("municipality");
        }
      }

      setMapMessage("Address populated from the selected point.");
    } else {
      setMapMessage("Unable to fetch address for that point.");
    }
    setIsReverseGeocoding(false);
  };

  const handleFlyToMarker = () => {
    if (latitude && longitude && mapRef.current) {
      mapRef.current.flyTo([latitude, longitude], 15, { duration: 0.9 });
    }
  };

  const handleLocalitySearch = async () => {
    const query = localityQuery.trim();
    if (!query) return;

    const result = await forwardGeocodeLocality(query);
    if (!result) {
      toast.error(`No results found for "${query}" within Cebu.`);
      return;
    }

    const latLng = L.latLng(result.lat, result.lon);
    const within = cebuBoundsRef.current?.contains(latLng);
    if (!within) {
      toast.error(`"${query}" is outside the Cebu boundary.`);
      return;
    }

    setLatitude(result.lat);
    setLongitude(result.lon);
    setMapCenter([result.lat, result.lon]);

    if (mapRef.current) {
      mapRef.current.flyTo([result.lat, result.lon], 15, { duration: 1.1 });
    }

    const address = await reverseGeocode(result.lat, result.lon);
    if (address) {
      setStreet(address.street || street);
      setBarangay(address.barangay || barangay);
      setZipCode(address.zipCode || zipCode);
    }

    toast.success(`Map centered to ${query}`);
  };

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

        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], 15, { duration: 1.2 });
        }

        const address = await reverseGeocode(lat, lng);
        if (address) {
          setStreet(address.street || street);
          setBarangay(address.barangay || barangay);
          setZipCode(address.zipCode || zipCode);
        }

        setIsLocating(false);
        toast.success("Location detected and address populated.");
      },
      () => {
        toast.error("Unable to fetch your current location.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleImageChange = (file: File | null) => {
    setImageError("");
    setImageFile(null);

    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("File exceeds 5MB limit.");
      return;
    }
    setImageMode("upload");
    setImageFile(file);
    setMainImagePreview(URL.createObjectURL(file));
  };

  const handleImageModeChange = (mode: "link" | "upload") => {
    setImageMode(mode);
    if (mode === "link") {
      setImageFile(null);
      setImageError("");
      setMainImagePreview(imageLink);
    }
  };

  const addInstitution = () => {
    if (nearInstitutions.length >= MAX_INSTITUTIONS) return;
    setNearInstitutions([...nearInstitutions, { name: "", type: "" }]);
  };

  const updateInstitution = (index: number, payload: Partial<Institution>) => {
    setNearInstitutions((prev) =>
      prev.map((inst, i) => (i === index ? { ...inst, ...payload } : inst))
    );
  };

  const removeInstitution = (index: number) => {
    setNearInstitutions((prev) => prev.filter((_, i) => i !== index));
  };

  const addOtherInformation = () => {
    if (otherInformation.length >= MAX_OTHER_INFO) return;
    setOtherInformation([
      ...otherInformation,
      { context: "", description: "" },
    ]);
  };

  const updateOtherInformation = (
    index: number,
    payload: Partial<OtherInfo>
  ) => {
    setOtherInformation((prev) =>
      prev.map((info, i) => (i === index ? { ...info, ...payload } : info))
    );
  };

  const removeOtherInformation = (index: number) => {
    setOtherInformation((prev) => prev.filter((_, i) => i !== index));
  };

  const hasValidLocality =
    (localityMode === "city" && !!city) ||
    (localityMode === "municipality" && !!municipality);

  const isFormReady = useMemo(() => {
    return (
      title.trim().length > 0 &&
      type.trim().length > 0 &&
      street.trim().length > 0 &&
      barangay.trim().length > 0 &&
      hasValidLocality
    );
  }, [title, type, street, barangay, hasValidLocality]);

  const sanitizeInstitutions = () =>
    nearInstitutions
      .map((inst) => ({
        name: inst.name.trim(),
        type: inst.type.trim(),
      }))
      .filter((inst) => inst.name && inst.type);

  const sanitizeOtherInformation = () =>
    otherInformation
      .map((info) => ({
        context: info.context.trim(),
        description: info.description.trim(),
      }))
      .filter((info) => info.context || info.description);

  const handleSave = async () => {
    if (!propertyId) return;

    if (!isFormReady) {
      toast.error("Please complete all required fields.");
      return;
    }

    if (!hasValidLocality) {
      toast.error("Select a city or municipality.");
      return;
    }

    try {
      setIsSaving(true);
      let mainImageUrl = mainImagePreview.trim();

      if (imageMode === "link") {
        if (!imageLink.trim()) {
          toast.error("Provide an image link or switch to upload.");
          setIsSaving(false);
          return;
        }
        mainImageUrl = imageLink.trim();
        
        // If switching from Supabase image to external link, delete the old Supabase image
        if (originalImageUrl && originalImageUrl !== mainImageUrl) {
          const oldPath = extractPathFromSupabaseUrl(originalImageUrl);
          if (oldPath) {
            await deleteImageFromSupabase(originalImageUrl);
          }
        }
      } else if (imageMode === "upload") {
        if (!imageFile) {
          toast.error("Select an image to upload.");
          setIsSaving(false);
          return;
        }
        
        // Delete old Supabase image if it exists
        if (originalImageUrl) {
          const oldPath = extractPathFromSupabaseUrl(originalImageUrl);
          if (oldPath) {
            await deleteImageFromSupabase(originalImageUrl);
          }
        }
        
        // Upload new image (already uploaded in frontend, just get the URL)
        mainImageUrl = await uploadMainImage(imageFile);
      }

      const payload = {
        title: title.trim(),
        type,
        street: street.trim(),
        barangay: barangay.trim(),
        zipCode: zipCode.trim(),
        cityId: localityMode === "city" ? city?.id ?? null : null,
        municipalityId:
          localityMode === "municipality" ? municipality?.id ?? null : null,
        latitude,
        longitude,
        mainImageUrl,
        nearInstitutions: sanitizeInstitutions(),
        otherInformation: sanitizeOtherInformation(),
      };

      await updatePropertyRequest(propertyId, payload);
      toast.success("Property updated successfully.");
      navigate(`/landlord/properties/${propertyId}`);
    } catch (err: any) {
      console.error("Update failed:", err);
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          "Failed to update property."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="mb-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div>
                    <Skeleton className="h-7 w-32 mb-2" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </div>

          {/* Form Sections Skeleton */}
          <div className="space-y-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="shadow-md">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="relative mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-emerald-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Edit className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Edit Property</h1>
                  <p className="text-sm text-gray-600">Update your property information</p>
                </div>
              </div>
              <Link to={`/landlord/properties/${propertyId}`}>
                <Button
                  variant="outline"
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-red-200 bg-red-50 shadow-sm">
              <CardContent className="flex items-center gap-3 text-red-700 py-4">
                <AlertTriangle className="h-5 w-5" />
                <span>{error}</span>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Basic Details */}
        <Card className="shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5 text-blue-600" />
              Basic Details
            </CardTitle>
            <CardDescription>Essential information about your property</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                Property Title *
                <Info className="h-4 w-4 text-gray-400" />
              </label>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g., Cozy Apartment near IT Park"
                className="h-10"
                required
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                Property Type *
                <Info className="h-4 w-4 text-gray-400" />
              </label>
              <div className="grid sm:grid-cols-2 gap-4">
                {PROPERTY_TYPES.map((propertyType) => {
                  const Icon = propertyType.icon;
                  const selected = type === propertyType.value;
                  return (
                    <button
                      key={propertyType.value}
                      type="button"
                      onClick={() => setType(propertyType.value)}
                      className={`text-left rounded-xl border-2 p-4 transition-all ${
                        selected
                          ? "border-emerald-500 bg-emerald-50 shadow-md"
                          : "border-slate-200 bg-white hover:border-emerald-300 hover:shadow-sm"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 mb-2 ${
                          selected ? "text-emerald-600" : "text-slate-400"
                        }`}
                      />
                      <div className="font-semibold text-slate-900">
                        {propertyType.label}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {propertyType.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  Street *
                  <Info className="h-4 w-4 text-gray-400" />
                </label>
                <Input
                  value={street}
                  onChange={(event) => setStreet(event.target.value)}
                  placeholder="House No., Street Name"
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  Barangay *
                  <Info className="h-4 w-4 text-gray-400" />
                </label>
                <Input
                  value={barangay}
                  onChange={(event) => setBarangay(event.target.value)}
                  placeholder="Barangay name"
                  className="h-10"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  ZIP Code
                  <Info className="h-4 w-4 text-gray-400" />
                </label>
                <Input
                  value={zipCode}
                  onChange={(event) => setZipCode(event.target.value)}
                  placeholder="e.g., 6000"
                  inputMode="numeric"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  Locality Type *
                  <Info className="h-4 w-4 text-gray-400" />
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={localityMode === "city" ? "default" : "outline"}
                    className="flex-1 h-10"
                    onClick={() => {
                      setLocalityMode("city");
                      setMunicipality(null);
                    }}
                  >
                    City
                  </Button>
                  <Button
                    type="button"
                    variant={localityMode === "municipality" ? "default" : "outline"}
                    className="flex-1 h-10"
                    onClick={() => {
                      setLocalityMode("municipality");
                      setCity(null);
                    }}
                  >
                    Municipality
                  </Button>
                </div>
              </div>
            </div>

            {localityMode === "city" && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  Select City *
                  <Info className="h-4 w-4 text-gray-400" />
                </label>
                <select
                  value={city?.id || ""}
                  onChange={(event) => {
                    const selected =
                      cities.find((c) => c.id === event.target.value) || null;
                    setCity(selected);
                  }}
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  required
                >
                  <option value="">Choose city</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {localityMode === "municipality" && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  Select Municipality *
                  <Info className="h-4 w-4 text-gray-400" />
                </label>
                <select
                  value={municipality?.id || ""}
                  onChange={(event) => {
                    const selected =
                      municipalities.find((m) => m.id === event.target.value) || null;
                    setMunicipality(selected);
                  }}
                  className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  required
                >
                  <option value="">Choose municipality</option>
                  {municipalities.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location & Map */}
        <Card className="shadow-md">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              Location & Map
            </CardTitle>
            <CardDescription>Set your property location on the map</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1 flex items-center gap-2 border-2 border-slate-200 rounded-xl px-4 py-2.5 bg-white focus-within:border-emerald-400 transition-colors">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={localityQuery}
                  onChange={(event) => setLocalityQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleLocalitySearch();
                    }
                  }}
                  placeholder="Search city or municipality in Cebu"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleLocalitySearch} className="whitespace-nowrap h-10">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button
                  variant="outline"
                  onClick={getCurrentLocation}
                  disabled={isLocating}
                  className="whitespace-nowrap h-10"
                >
                  {isLocating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Locate className="h-4 w-4 mr-2" />
                  )}
                  {isLocating ? "Locating…" : "My Location"}
                </Button>
              </div>
            </div>

            <div className="rounded-xl border-2 border-gray-200 bg-gray-50 overflow-hidden shadow-sm">
              <MapContainer
                // @ts-ignore - whenReady signature issue with react-leaflet types
                whenReady={(event: any) => {
                  mapRef.current = event.target as L.Map;
                }}
                center={mapCenter}
                zoom={latitude && longitude ? 14 : 11}
                className="h-80 w-full"
                maxBounds={CEBU_BOUNDS as any}
                maxBoundsViscosity={1.0}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapClickHandler onMapClick={handleMapClick} />
                {latitude && longitude && <Marker position={[latitude, longitude]} />}
              </MapContainer>
              <div className="p-5 space-y-4 bg-white border-t">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-500" />
                    Coordinates
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-emerald-600 hover:bg-emerald-50"
                    onClick={handleFlyToMarker}
                    disabled={!latitude || !longitude}
                  >
                    <Navigation className="h-3.5 w-3.5 mr-1" />
                    Focus Marker
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-slate-50 px-3 py-2 border border-gray-200">
                    <p className="text-xs text-slate-500 mb-1">Latitude</p>
                    <p className="text-sm font-mono text-slate-800">
                      {latitude ? latitude.toFixed(6) : "Not set"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-slate-50 px-3 py-2 border border-gray-200">
                    <p className="text-xs text-slate-500 mb-1">Longitude</p>
                    <p className="text-sm font-mono text-slate-800">
                      {longitude ? longitude.toFixed(6) : "Not set"}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Click anywhere on the map within Cebu to update the pin. We'll try to
                  populate the address automatically.
                </p>
              </div>
            </div>
            {mapMessage && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600 flex items-center gap-2">
                {isReverseGeocoding ? (
                  <RefreshCw className="h-4 w-4 animate-spin text-emerald-500" />
                ) : (
                  <MapPin className="h-4 w-4 text-emerald-500" />
                )}
                <span>{mapMessage}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Nearby Institutions */}
        <Card className="shadow-md">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-purple-600" />
                  Nearby Institutions
                </CardTitle>
                <CardDescription>
                  Highlight up to 10 nearby landmarks to help tenants understand your location.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addInstitution}
                disabled={nearInstitutions.length >= MAX_INSTITUTIONS}
                className="whitespace-nowrap w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add ({nearInstitutions.length}/{MAX_INSTITUTIONS})
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {nearInstitutions.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <Building className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-500">No nearby institutions listed yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {nearInstitutions.map((institution, index) => (
                  <div
                    key={`institution-${index}`}
                    className="grid md:grid-cols-12 gap-4 border-2 border-slate-200 rounded-xl p-5 bg-white hover:border-purple-200 transition-colors"
                  >
                    <div className="md:col-span-5 space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Institution Name</label>
                      <Input
                        value={institution.name}
                        onChange={(event) =>
                          updateInstitution(index, { name: event.target.value })
                        }
                        placeholder="e.g., Ayala Center"
                        className="h-10"
                      />
                      <p className="text-xs text-slate-400">
                        Keep it to three words for readability.
                      </p>
                    </div>
                    <div className="md:col-span-5 space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Type</label>
                      <select
                        value={institution.type}
                        onChange={(event) =>
                          updateInstitution(index, { type: event.target.value })
                        }
                        className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      >
                        <option value="">Select type</option>
                        {INSTITUTION_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-semibold text-gray-700 block opacity-0 pointer-events-none select-none h-[20px]">Action</label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="w-full h-10 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeInstitution(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Other Information */}
        <Card className="shadow-md">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-amber-600" />
                  Other Information
                </CardTitle>
                <CardDescription>
                  Add quick facts such as "Pet-friendly" or "Second floor".
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={addOtherInformation}
                disabled={otherInformation.length >= MAX_OTHER_INFO}
                className="whitespace-nowrap w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add ({otherInformation.length}/{MAX_OTHER_INFO})
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            {otherInformation.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <Info className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <p className="text-sm text-slate-500">Add quick facts like "Second floor" or "Pet-friendly".</p>
              </div>
            ) : (
              <div className="space-y-3">
                {otherInformation.map((info, index) => (
                  <div
                    key={`info-${index}`}
                    className="grid md:grid-cols-12 gap-4 border-2 border-slate-200 rounded-xl p-5 bg-white hover:border-amber-200 transition-colors"
                  >
                    <div className="md:col-span-4 space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Context</label>
                      <Input
                        value={info.context}
                        onChange={(event) =>
                          updateOtherInformation(index, {
                            context: event.target.value,
                          })
                        }
                        placeholder="e.g., Second Floor"
                        className="h-10"
                      />
                    </div>
                    <div className="md:col-span-6 space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Description</label>
                      <Input
                        value={info.description}
                        onChange={(event) =>
                          updateOtherInformation(index, {
                            description: event.target.value,
                          })
                        }
                        placeholder="e.g., Balcony overlooks the garden"
                        className="h-10"
                      />
                    </div>
                    <div className="md:col-span-2 flex md:items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="w-full h-10 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeOtherInformation(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Property Photo */}
        <Card className="shadow-md">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-purple-600" />
              Property Photo
            </CardTitle>
            <CardDescription>Upload or link an image for your property</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                Image Source
                <Info className="h-4 w-4 text-gray-400" />
              </label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={imageMode === "link" ? "default" : "outline"}
                  onClick={() => handleImageModeChange("link")}
                  className="h-10 px-4 text-sm flex items-center gap-2"
                >
                  <LinkIcon className="h-4 w-4" />
                  Use Link
                </Button>
                <Button
                  type="button"
                  variant={imageMode === "upload" ? "default" : "outline"}
                  onClick={() => handleImageModeChange("upload")}
                  className="h-10 px-4 text-sm flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload File
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {imageMode === "link" ? (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Image Link</label>
                    <Input
                      placeholder="https://example.com/property.jpg"
                      value={imageLink}
                      onChange={(event) => {
                        setImageLink(event.target.value);
                        setMainImagePreview(event.target.value);
                      }}
                      className="h-10"
                    />
                    <p className="text-xs text-slate-500">
                      Paste a direct image link for your property.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700">Upload Image</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors bg-gray-50 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="edit-image-upload"
                        onChange={(event) =>
                          handleImageChange(event.target.files?.[0] ?? null)
                        }
                      />
                      <label htmlFor="edit-image-upload" className="cursor-pointer block">
                        <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <div className="text-sm font-semibold text-slate-700 mb-2">
                          Click to upload a new image
                        </div>
                        <p className="text-xs text-slate-500">PNG/JPG up to 5MB</p>
                      </label>
                    </div>
                    {imageError && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {imageError}
                      </p>
                    )}
                    {imageFile && (
                      <p className="text-xs text-emerald-700 flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        Selected: {imageFile.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">Preview</label>
                {mainImagePreview ? (
                  <div className="w-full aspect-square rounded-xl border-2 border-purple-200 overflow-hidden bg-slate-100 shadow-sm">
                    <img
                      src={mainImagePreview}
                      alt="Property preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-square rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 mx-auto mb-3 text-slate-400" />
                      <p className="text-sm">No image selected</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4 pt-4 border-t">
          <Link to={`/landlord/properties/${propertyId}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="button"
            disabled={!isFormReady || isSaving}
            onClick={handleSave}
            className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditProperty;
 

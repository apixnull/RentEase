import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L, { type LeafletEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  getCitiesAndMunicipalitiesRequest,
  getPropertyEditableDataRequest,
  updatePropertyRequest,
} from "@/api/landlord/propertyApi";
import { supabase } from "@/lib/supabaseClient";
import {
  AlertTriangle,
  Building,
  ChevronLeft,
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
  const ext = file.name.split(".").pop();
  const randomName = generateRandomName();
  const path = `property_main_images/${randomName}.${ext}`;

  const { error } = await supabase.storage
    .from("rentease-images")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("rentease-images").getPublicUrl(path);
  return data.publicUrl;
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
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Loading property details…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6 pb-8">
        <div className="flex flex-col gap-3">
          <Button
            variant="ghost"
            className="w-fit px-0 text-slate-600 hover:text-slate-900"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to property
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Edit Property
            </h1>
            <p className="text-sm text-slate-600">
              Update the property information and location, then save your changes when you’re ready.
            </p>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-3 text-red-700 py-4">
              <AlertTriangle className="h-5 w-5" />
              <span>{error}</span>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Basic Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Property Title</Label>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g., Cozy Apartment near IT Park"
              />
            </div>

            <div className="space-y-3">
              <Label>Property Type</Label>
              <div className="grid sm:grid-cols-2 gap-3">
                {PROPERTY_TYPES.map((propertyType) => {
                  const Icon = propertyType.icon;
                  const selected = type === propertyType.value;
                  return (
                    <button
                      key={propertyType.value}
                      type="button"
                      onClick={() => setType(propertyType.value)}
                      className={`text-left rounded-xl border p-4 transition-all ${
                        selected
                          ? "border-emerald-500 bg-emerald-50 shadow-sm"
                          : "border-slate-200 bg-white hover:border-emerald-300"
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
                      <p className="text-xs text-slate-500">
                        {propertyType.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Street</Label>
                <Input
                  value={street}
                  onChange={(event) => setStreet(event.target.value)}
                  placeholder="House No., Street Name"
                />
              </div>
              <div className="space-y-2">
                <Label>Barangay</Label>
                <Input
                  value={barangay}
                  onChange={(event) => setBarangay(event.target.value)}
                  placeholder="Barangay name"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ZIP code</Label>
                <Input
                  value={zipCode}
                  onChange={(event) => setZipCode(event.target.value)}
                  placeholder="e.g., 6000"
                  inputMode="numeric"
                />
              </div>
              <div className="space-y-2">
                <Label>Locality Type</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={localityMode === "city" ? "default" : "outline"}
                    className="flex-1"
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
                    className="flex-1"
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
                <Label>Select City</Label>
                <select
                  value={city?.id || ""}
                  onChange={(event) => {
                    const selected =
                      cities.find((c) => c.id === event.target.value) || null;
                    setCity(selected);
                  }}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-1 focus-visible:ring-emerald-500"
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
                <Label>Select Municipality</Label>
                <select
                  value={municipality?.id || ""}
                  onChange={(event) => {
                    const selected =
                      municipalities.find((m) => m.id === event.target.value) || null;
                    setMunicipality(selected);
                  }}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-1 focus-visible:ring-emerald-500"
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

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Location & Map</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex-1 flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-white">
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
                <Button onClick={handleLocalitySearch} className="whitespace-nowrap">
                  Search
                </Button>
                <Button
                  variant="secondary"
                  onClick={getCurrentLocation}
                  disabled={isLocating}
                  className="whitespace-nowrap"
                >
                  <Locate className="h-4 w-4 mr-2" />
                  {isLocating ? "Locating…" : "Use my location"}
                </Button>
              </div>
            </div>

            <div className="rounded-md border border-gray-200 bg-gray-50">
              <MapContainer
                whenReady={(event: LeafletEvent) => {
                  return mapRef.current = event.target as L.Map;
                }}
                center={mapCenter}
                zoom={latitude && longitude ? 14 : 11}
                className="h-72 w-full rounded-t-md"
                maxBounds={CEBU_BOUNDS as any}
                maxBoundsViscosity={1.0}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapClickHandler onMapClick={handleMapClick} />
                {latitude && longitude && <Marker position={[latitude, longitude]} />}
              </MapContainer>
              <div className="p-4 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-500" />
                    Coordinates
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-emerald-600"
                    onClick={handleFlyToMarker}
                    disabled={!latitude || !longitude}
                  >
                    <Navigation className="h-3.5 w-3.5 mr-1" />
                    Focus marker
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-600">
                  <div className="rounded bg-white px-2 py-1 border border-gray-200">
                    {latitude ? latitude.toFixed(6) : "Not set"}
                  </div>
                  <div className="rounded bg-white px-2 py-1 border border-gray-200">
                    {longitude ? longitude.toFixed(6) : "Not set"}
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Click anywhere on the map within Cebu to update the pin. We'll try to
                  populate the address automatically.
                </p>
              </div>
            </div>
            {mapMessage && (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600 flex items-center gap-2">
                {isReverseGeocoding ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                )}
                <span>{mapMessage}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Nearby Institutions</CardTitle>
              <p className="text-sm text-slate-500">
                Highlight up to 10 nearby landmarks to help tenants understand your location.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addInstitution}
              disabled={nearInstitutions.length >= MAX_INSTITUTIONS}
              className="whitespace-nowrap w-full sm:w-auto"
            >
              + Add ({nearInstitutions.length}/{MAX_INSTITUTIONS})
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {nearInstitutions.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                No nearby institutions listed yet.
              </div>
            ) : (
              <div className="space-y-3">
                {nearInstitutions.map((institution, index) => (
                  <div
                    key={`institution-${index}`}
                    className="grid md:grid-cols-12 gap-3 border border-slate-200 rounded-xl p-4 bg-white"
                  >
                    <div className="md:col-span-5 space-y-2">
                      <Label>Institution Name</Label>
                      <Input
                        value={institution.name}
                        onChange={(event) =>
                          updateInstitution(index, { name: event.target.value })
                        }
                        placeholder="e.g., Ayala Center"
                      />
                      <p className="text-xs text-slate-400">
                        Keep it to three words for readability.
                      </p>
                    </div>
                    <div className="md:col-span-5 space-y-2">
                      <Label>Type</Label>
                      <select
                        value={institution.type}
                        onChange={(event) =>
                          updateInstitution(index, { type: event.target.value })
                        }
                        className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:ring-1 focus-visible:ring-emerald-500"
                      >
                        <option value="">Select type</option>
                        {INSTITUTION_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2 flex md:items-end">
                      <Button
                        variant="outline"
                        className="w-full border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => removeInstitution(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Other Information</CardTitle>
              <p className="text-sm text-slate-500">
                Add quick facts such as “Pet-friendly” or “Second floor”.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={addOtherInformation}
              disabled={otherInformation.length >= MAX_OTHER_INFO}
              className="whitespace-nowrap w-full sm:w-auto"
            >
              + Add ({otherInformation.length}/{MAX_OTHER_INFO})
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {otherInformation.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
                Add quick facts like “Second floor” or “Pet-friendly”.
              </div>
            ) : (
              <div className="space-y-3">
                {otherInformation.map((info, index) => (
                  <div
                    key={`info-${index}`}
                    className="grid md:grid-cols-12 gap-3 border border-slate-200 rounded-xl p-4 bg-white"
                  >
                    <div className="md:col-span-4 space-y-2">
                      <Label>Context</Label>
                      <Input
                        value={info.context}
                        onChange={(event) =>
                          updateOtherInformation(index, {
                            context: event.target.value,
                          })
                        }
                        placeholder="e.g., Second Floor"
                      />
                    </div>
                    <div className="md:col-span-6 space-y-2">
                      <Label>Description</Label>
                      <Input
                        value={info.description}
                        onChange={(event) =>
                          updateOtherInformation(index, {
                            description: event.target.value,
                          })
                        }
                        placeholder="e.g., Balcony overlooks the garden"
                      />
                    </div>
                    <div className="md:col-span-2 flex md:items-end">
                      <Button
                        variant="outline"
                        className="w-full border-red-200 text-red-600 hover:bg-red-50"
                        onClick={() => removeOtherInformation(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Property Photo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Label className="text-sm font-medium text-slate-700">
                Image Source:
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={imageMode === "link" ? "default" : "outline"}
                  onClick={() => handleImageModeChange("link")}
                  className="h-8 px-3 text-xs flex items-center gap-1"
                >
                  <LinkIcon className="h-3.5 w-3.5" />
                  Use Link
                </Button>
                <Button
                  type="button"
                  variant={imageMode === "upload" ? "default" : "outline"}
                  onClick={() => handleImageModeChange("upload")}
                  className="h-8 px-3 text-xs flex items-center gap-1"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload File
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                {imageMode === "link" ? (
                  <div className="space-y-2">
                    <Label>Image Link</Label>
                    <Input
                      placeholder="https://example.com/property.jpg"
                      value={imageLink}
                      onChange={(event) => {
                        setImageLink(event.target.value);
                        setMainImagePreview(event.target.value);
                      }}
                    />
                    <p className="text-xs text-slate-500">
                      Paste a direct image link for your property.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Label>Upload Image</Label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-emerald-400 transition-colors">
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
                        <ImageIcon className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                        <div className="text-sm font-semibold text-slate-700">
                          Click to upload a new image
                        </div>
                        <p className="text-xs text-slate-500">PNG/JPG up to 5MB</p>
                      </label>
                    </div>
                    {imageError && (
                      <p className="text-xs text-red-500">{imageError}</p>
                    )}
                    {imageFile && (
                      <p className="text-xs text-emerald-700">
                        Selected: {imageFile.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-900">
                  Preview
                </Label>
                {mainImagePreview ? (
                  <div className="w-full aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-100">
                    <img
                      src={mainImagePreview}
                      alt="Property preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full aspect-square rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-400">
                    <div className="text-center">
                      <ImageIcon className="h-10 w-10 mx-auto mb-2" />
                      <p className="text-sm">No image selected</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-emerald-100 bg-emerald-50/70">
          <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-3 py-4">
            <div className="text-sm text-emerald-900">
              Review your changes, then save to update this property.
            </div>
            <Button
              size="lg"
              disabled={!isFormReady || isSaving}
              onClick={handleSave}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProperty;
 

import { useState, useRef, useEffect, createRef } from "react";
import type { RefObject } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, ArrowRight, ArrowLeft, Upload, AlertCircle, X } from "lucide-react";
import { addPropertyRequest } from "@/services/api/landlord.api";
import type { CheckedState } from "@radix-ui/react-checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/lib/supabaseClient";
import ResetWarning from "./ResetWarning";
import { allAmenities, allFeatures, commonRules } from "@/constants/property";
import CustomProgressBar from "./CustomProgressBar";

interface Unit {
  label: string;
  description: string;
  maxOccupancy: number;
  floorNumber: number | null;
  targetPrice: number;
  isNegotiable: boolean;
  unitFeatureTags: string[];
  leaseRules: string[];
}

const MAX_ADDITIONAL_PHOTOS = 4;
const MAX_UNIT_PHOTOS = 3;
const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MAX_WORDS_SHARED = 3;
const MAX_WORDS_RULES = 20;

// 1. Add a utility to create an array of refs for dynamic lists
function useDynamicRefs<T>(length: number) {
  const refs = useRef<Array<RefObject<T>>>([]);
  if (refs.current.length !== length) {
    refs.current = Array(length)
      .fill(null)
      .map((_, i) => refs.current[i] || createRef<T>());
  }
  return refs.current;
}

// 1. Define a union type for all valid suggestion fields
const SUGGESTION_FIELDS = ["amenity", "feature", "rule", "unitFeature", "leaseRule"] as const;
type SuggestionField = typeof SUGGESTION_FIELDS[number];

const AddProperty = () => {
  const navigate = useNavigate();
  const STORAGE_KEY = "propertyFormData";

  // Load saved data
  const savedData = localStorage.getItem(STORAGE_KEY);
  const initialData = savedData ? JSON.parse(savedData) : null;
  const shouldResetToStep1 = initialData?.step === 2 && (
    !initialData?.mainPhoto?.preview ||
    !initialData?.additionalPhotos?.length ||
    !initialData?.unitPhotos?.length
  );

  const [step, setStep] = useState(shouldResetToStep1 ? 1 : (initialData?.step || 1));
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [type, setType] = useState(initialData?.type || "APARTMENT");
  const [street, setStreet] = useState(initialData?.street || "");
  const [barangay, setBarangay] = useState(initialData?.barangay || "");
  const [municipality, setMunicipality] = useState(initialData?.municipality || "");
  const [city, setCity] = useState(initialData?.city || "");
  const [province, setProvince] = useState(initialData?.province || "");
  const [zipCode, setZipCode] = useState(initialData?.zipCode || "");
  const [requiresScreening, setRequiresScreening] = useState(initialData?.requiresScreening || false);
  const [amenities, setAmenities] = useState<string[]>(initialData?.amenities || [""]);
  const [features, setFeatures] = useState<string[]>(initialData?.features || [""]);
  const [propertyRules, setPropertyRules] = useState<string[]>(initialData?.propertyRules || [""]);
  
  // Photo states
  const [mainPhoto, setMainPhoto] = useState<{ file: File | null; preview: string }>({ file: null, preview: "" });
  const [additionalPhotos, setAdditionalPhotos] = useState<{ file: File | null; preview: string }[]>([]);
  const [unitPhotos, setUnitPhotos] = useState<{ file: File | null; preview: string }[]>([]);
  
  // Unit state
  const [unit, setUnit] = useState<Unit>(() => {
    const defaultUnit = {
      label: "",
      description: "",
      maxOccupancy: 1,
      floorNumber: null,
      targetPrice: 0,
      isNegotiable: false,
      unitFeatureTags: [""],
      leaseRules: [""]
    };
    
    if (initialData?.unit) {
      return {
        ...defaultUnit,
        ...initialData.unit,
        unitFeatureTags: initialData.unit.unitFeatureTags || [""],
        leaseRules: initialData.unit.leaseRules || [""]
      };
    }
    
    return defaultUnit;
  });

  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  // Update state types for better TS safety
  const [activeSuggestionField, setActiveSuggestionField] = useState<SuggestionField | null>(null);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number | null>(null);
  const [showResetWarning, setShowResetWarning] = useState(shouldResetToStep1);
  const [focusedInput, setFocusedInput] = useState<{field: SuggestionField, index: number} | null>(null);
  // Remove the old refs for amenitiesRef, featuresRef, rulesRef, unitFeaturesRef, leaseRulesRef
  // Instead, use dynamic refs for each list
  const amenityInputRefs = useDynamicRefs<HTMLInputElement>(amenities.length);
  const featureInputRefs = useDynamicRefs<HTMLInputElement>(features.length);
  const ruleInputRefs = useDynamicRefs<HTMLInputElement>(propertyRules.length);
  const unitFeatureInputRefs = useDynamicRefs<HTMLInputElement>(unit.unitFeatureTags.length);
  const leaseRuleInputRefs = useDynamicRefs<HTMLInputElement>(unit.leaseRules.length);

  // Save form data to localStorage
  useEffect(() => {
    const formData = {
      step,
      title,
      description,
      type,
      street,
      barangay,
      municipality,
      city,
      province,
      zipCode,
      requiresScreening,
      amenities,
      features,
      propertyRules,
      unit,
      mainPhoto,
      additionalPhotos,
      unitPhotos
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [
    step, title, description, type, street, barangay,
    municipality, city, province, zipCode, requiresScreening, amenities,
    features, propertyRules, unit, mainPhoto, additionalPhotos, unitPhotos
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mainPhoto.preview) URL.revokeObjectURL(mainPhoto.preview);
      additionalPhotos.forEach(photo => photo.preview && URL.revokeObjectURL(photo.preview));
      unitPhotos.forEach(photo => photo.preview && URL.revokeObjectURL(photo.preview));
    };
  }, []);

  // Show reset warning
  useEffect(() => {
    if (showResetWarning) {
      const timer = setTimeout(() => setShowResetWarning(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showResetWarning]);

  // Update the click outside handler to check all dynamic refs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const allRefs = [
        ...amenityInputRefs,
        ...featureInputRefs,
        ...ruleInputRefs,
        ...unitFeatureInputRefs,
        ...leaseRuleInputRefs,
      ];
      if (!allRefs.some(ref => ref.current && ref.current.contains(event.target as Node))) {
        setSuggestions([]);
        setActiveSuggestionField(null);
        setActiveSuggestionIndex(null);
        setFocusedInput(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [amenityInputRefs, featureInputRefs, ruleInputRefs, unitFeatureInputRefs, leaseRuleInputRefs]);

  // Suggestion handlers
  const showSuggestions = (value: string, field: SuggestionField, index: number) => {
    setActiveSuggestionField(field);
    setActiveSuggestionIndex(index);
    setFocusedInput({field, index});
    
    // Get current list based on field type
    let currentList: string[] = [];
    switch (field) {
      case "amenity":
        currentList = [...amenities];
        currentList.splice(index, 1); // Exclude current item
        break;
      case "feature":
        currentList = [...features];
        currentList.splice(index, 1);
        break;
      case "rule":
        currentList = [...propertyRules];
        currentList.splice(index, 1);
        break;
      case "unitFeature":
        currentList = [...unit.unitFeatureTags];
        currentList.splice(index, 1);
        break;
      case "leaseRule":
        currentList = [...unit.leaseRules];
        currentList.splice(index, 1);
        break;
      default:
        setSuggestions([]);
        return;
    }

    // Filter suggestions based on input value
    const filtered = [];
    switch (field) {
      case "amenity":
        filtered.push(...allAmenities.filter(a => 
          a.toLowerCase().includes(value.toLowerCase()) && 
          !currentList.includes(a)
        ));
        break;
      case "feature":
        filtered.push(...allFeatures.filter(f => 
          f.toLowerCase().includes(value.toLowerCase()) && 
          !currentList.includes(f)
        ));
        break;
      case "rule":
      case "leaseRule":
        filtered.push(...commonRules.filter(r => 
          r.toLowerCase().includes(value.toLowerCase()) && 
          !currentList.includes(r)
        ));
        break;
      case "unitFeature":
        filtered.push(...allFeatures.filter(f => 
          f.toLowerCase().includes(value.toLowerCase()) && 
          !currentList.includes(f)
        ));
        break;
    }

    setSuggestions(filtered);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (activeSuggestionField === null || activeSuggestionIndex === null) return;

    switch (activeSuggestionField) {
      case "amenity":
        setAmenities(prev => {
          const newAmenities = [...prev];
          newAmenities[activeSuggestionIndex] = suggestion;
          return newAmenities;
        });
        break;
      case "feature":
        setFeatures(prev => {
          const newFeatures = [...prev];
          newFeatures[activeSuggestionIndex] = suggestion;
          return newFeatures;
        });
        break;
      case "rule":
        setPropertyRules(prev => {
          const newRules = [...prev];
          newRules[activeSuggestionIndex] = suggestion;
          return newRules;
        });
        break;
      case "unitFeature":
        setUnit(prev => ({
          ...prev,
          unitFeatureTags: prev.unitFeatureTags.map((f, i) => 
            i === activeSuggestionIndex ? suggestion : f
          )
        }));
        break;
      case "leaseRule":
        setUnit(prev => ({
          ...prev,
          leaseRules: prev.leaseRules.map((r, i) => 
            i === activeSuggestionIndex ? suggestion : r
          )
        }));
        break;
    }

    setSuggestions([]);
    setActiveSuggestionField(null);
    setActiveSuggestionIndex(null);
    setFocusedInput(null);
  };

  // Field handlers
  const handleAmenityChange = (index: number, value: string) => {
    const newAmenities = [...amenities];
    newAmenities[index] = value;
    setAmenities(newAmenities);
    if (focusedInput?.field === "amenity" && focusedInput.index === index) {
      showSuggestions(value, "amenity", index);
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
    if (focusedInput?.field === "feature" && focusedInput.index === index) {
      showSuggestions(value, "feature", index);
    }
  };

  const handlePropertyRuleChange = (index: number, value: string) => {
    const newRules = [...propertyRules];
    newRules[index] = value;
    setPropertyRules(newRules);
    if (focusedInput?.field === "rule" && focusedInput.index === index) {
      showSuggestions(value, "rule", index);
    }
  };

  const handleUnitFeatureChange = (index: number, value: string) => {
    const newFeatures = [...unit.unitFeatureTags];
    newFeatures[index] = value;
    setUnit(prev => ({ ...prev, unitFeatureTags: newFeatures }));
    if (focusedInput?.field === "unitFeature" && focusedInput.index === index) {
      showSuggestions(value, "unitFeature", index);
    }
  };

  const handleLeaseRuleChange = (index: number, value: string) => {
    const newRules = [...unit.leaseRules];
    newRules[index] = value;
    setUnit(prev => ({ ...prev, leaseRules: newRules }));
    if (focusedInput?.field === "leaseRule" && focusedInput.index === index) {
      showSuggestions(value, "leaseRule", index);
    }
  };

  const addAmenity = () => setAmenities([...amenities, ""]);
  const removeAmenity = (index: number) => {
    if (amenities.length > 1) setAmenities(amenities.filter((_, i) => i !== index));
  };

  const addFeature = () => setFeatures([...features, ""]);
  const removeFeature = (index: number) => {
    if (features.length > 1) setFeatures(features.filter((_, i) => i !== index));
  };

  const addPropertyRule = () => setPropertyRules([...propertyRules, ""]);
  const removePropertyRule = (index: number) => {
    if (propertyRules.length > 1) setPropertyRules(propertyRules.filter((_, i) => i !== index));
  };

  const addUnitFeature = () => setUnit(prev => ({ ...prev, unitFeatureTags: [...prev.unitFeatureTags, ""] }));
  const removeUnitFeature = (index: number) => {
    if (unit.unitFeatureTags.length > 1) {
      setUnit(prev => ({ ...prev, unitFeatureTags: prev.unitFeatureTags.filter((_, i) => i !== index) }));
    }
  };

  const addLeaseRule = () => setUnit(prev => ({ ...prev, leaseRules: [...prev.leaseRules, ""] }));
  const removeLeaseRule = (index: number) => {
    if (unit.leaseRules.length > 1) {
      setUnit(prev => ({ ...prev, leaseRules: prev.leaseRules.filter((_, i) => i !== index) }));
    }
  };

  const handleUnitChange = (field: keyof Unit, value: any) => {
    setUnit(prev => ({ ...prev, [field]: value }));
  };

  // Validation helpers
  const validateWordLimit = (value: string, maxWords: number): boolean => {
    return value.split(/\s+/).length <= maxWords;
  };

  const validateFile = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      alert(`File "${file.name}" exceeds 2MB limit. Please choose a smaller file.`);
      return false;
    }
    return true;
  };

  // Photo handlers
  const handleMainPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (!validateFile(file)) return;
      
      if (mainPhoto.preview) URL.revokeObjectURL(mainPhoto.preview);
      
      setMainPhoto({
        file,
        preview: URL.createObjectURL(file)
      });
    }
  };

  const handleAdditionalPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(validateFile);
      if (validFiles.length !== newFiles.length) return;
      
      const totalAdditional = additionalPhotos.length + validFiles.length;
      if (totalAdditional > MAX_ADDITIONAL_PHOTOS) {
        alert(`You can upload up to ${MAX_ADDITIONAL_PHOTOS} additional photos.`);
        return;
      }
      
      const newPhotos = validFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      
      setAdditionalPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const removeAdditionalPhoto = (index: number) => {
    const newPhotos = [...additionalPhotos];
    const [removed] = newPhotos.splice(index, 1);
    URL.revokeObjectURL(removed.preview);
    setAdditionalPhotos(newPhotos);
  };

  const handleUnitPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(validateFile);
      if (validFiles.length !== newFiles.length) return;
      
      const totalPhotos = unitPhotos.length + validFiles.length;
      if (totalPhotos > MAX_UNIT_PHOTOS) {
        alert(`You can upload up to ${MAX_UNIT_PHOTOS} photos per unit.`);
        return;
      }
      
      const newUnitPhotos = validFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      
      setUnitPhotos(prev => [...prev, ...newUnitPhotos]);
    }
  };

  const removeUnitPhoto = (index: number) => {
    const newUnitPhotos = [...unitPhotos];
    const [removed] = newUnitPhotos.splice(index, 1);
    URL.revokeObjectURL(removed.preview);
    setUnitPhotos(newUnitPhotos);
  };

  // Form validation
  const validateStep = () => {
    const newErrors: any = {};
    
    // Word limit validation
    if (!features.every(f => validateWordLimit(f, MAX_WORDS_SHARED))) {
      newErrors.features = `Each feature must be ${MAX_WORDS_SHARED} words or less`;
    }
    
    if (!amenities.every(a => validateWordLimit(a, MAX_WORDS_SHARED))) {
      newErrors.amenities = `Each amenity must be ${MAX_WORDS_SHARED} words or less`;
    }
    
    if (!propertyRules.every(r => validateWordLimit(r, MAX_WORDS_RULES))) {
      newErrors.propertyRules = `Each rule must be ${MAX_WORDS_RULES} words or less`;
    }
    
    if (!unit.unitFeatureTags.every(f => validateWordLimit(f, MAX_WORDS_SHARED))) {
      newErrors.unitFeatures = `Each feature must be ${MAX_WORDS_SHARED} words or less`;
    }
    
    if (!unit.leaseRules.every(r => validateWordLimit(r, MAX_WORDS_RULES))) {
      newErrors.leaseRules = `Each lease rule must be ${MAX_WORDS_RULES} words or less`;
    }
    
    if (step === 1) {
      if (!title) newErrors.title = "Title is required";
      if (!description) newErrors.description = "Description is required";
      if (!street) newErrors.street = "Street is required";
      if (!barangay) newErrors.barangay = "Barangay is required";
      if (!province) newErrors.province = "Province is required";
      if (!zipCode) newErrors.zipCode = "Zip code is required";
      
      if (!mainPhoto.preview) newErrors.mainPhoto = "Main property photo is required.";
      if (additionalPhotos.length < 1) {
        newErrors.additionalPhotos = `At least 1 additional photo is required`;
      }
    } else if (step === 2) {
      if (!unit.label) newErrors.unit_label = "Unit label is required";
      if (!unit.targetPrice || unit.targetPrice <= 0) {
        newErrors.unit_targetPrice = "Valid price is required";
      }
      
      if (unitPhotos.length < 3) {
        newErrors.unitPhotos = `3 unit photo is required`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep((prev: number) => prev + 1);
  };

  const prevStep = () => setStep((prev: number) => prev - 1);

  // Image upload function
  const uploadImageToSupabase = async (file: File, folderPath: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folderPath}/${uuidv4()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("rentease-images")
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error("Upload error:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from("rentease-images")
      .getPublicUrl(data.path);

    return publicUrl;
  };

  // 1. On submit, upload all images to Supabase first, then send property data (with image URLs) to backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    setIsSubmitting(true);

    try {
      // Generate IDs for property and unit
      const propertyId = uuidv4();
      const unitId = uuidv4();

      // 1. Upload images to Supabase first
      let mainPhotoUrl = "";
      let additionalPhotoUrls: string[] = [];
      let unitPhotoUrls: string[] = [];
      try {
        // Upload main photo
        if (mainPhoto.file) {
          mainPhotoUrl = await uploadImageToSupabase(mainPhoto.file, `properties/${propertyId}`);
        }
        // Upload additional photos
        for (const photo of additionalPhotos) {
          if (photo.file) {
            const url = await uploadImageToSupabase(photo.file, `properties/${propertyId}`);
            additionalPhotoUrls.push(url);
          }
        }
        // Upload unit photos
        for (const photo of unitPhotos) {
          if (photo.file) {
            const url = await uploadImageToSupabase(photo.file, `properties/${propertyId}/units/${unitId}`);
            unitPhotoUrls.push(url);
          }
        }
      } catch (uploadErr) {
        setErrors({ submit: "Image upload failed. Please try again." });
        setIsSubmitting(false);
        return;
      }

      // 2. Prepare unit data (with unitImageUrls)
      const unitData = {
        ...unit,
        id: unitId,
        unitImageUrls: unitPhotoUrls,
      };

      // 3. Prepare property payload (with image URLs)
      const payload = {
        title,
        description,
        type,
        street,
        barangay,
        municipality,
        city,
        province,
        zipCode,
        requiresScreening: requiresScreening ? "true" : "false",
        amenities: JSON.stringify(amenities.filter(a => a)),
        features: JSON.stringify(features.filter(f => f)),
        rules: JSON.stringify(propertyRules.filter(r => r)),
        unit: JSON.stringify(unitData),
        photos: JSON.stringify(additionalPhotoUrls),
        mainImageUrl: mainPhotoUrl,
        propertyId
      };

      // 4. Send property data to backend (with image URLs)
      let backendResponse;
      try {
        backendResponse = await addPropertyRequest(payload);
      } catch (err) {
        setErrors({ submit: "Failed to create property. Please try again." });
        setIsSubmitting(false);
        return;
      }

      // 5. Clear form data and localStorage
      localStorage.removeItem(STORAGE_KEY);
      setTitle("");
      setDescription("");
      setStreet("");
      setBarangay("");
      setMunicipality("");
      setCity("");
      setProvince("");
      setZipCode("");
      setRequiresScreening(false);
      setAmenities([""]);
      setFeatures([""]);
      setPropertyRules([""]);
      setMainPhoto({ file: null, preview: "" });
      setAdditionalPhotos([]);
      setUnitPhotos([]);
      setUnit({
        label: "",
        description: "",
        maxOccupancy: 1,
        floorNumber: null,
        targetPrice: 0,
        isNegotiable: false,
        unitFeatureTags: [""],
        leaseRules: [""]
      });
      setErrors({});
      setStep(1);
      navigate("/landlord/property/my-properties");
    } catch (error) {
      setErrors({ submit: "Failed to create property. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update SuggestionDropdown to use absolute positioning and render as a sibling to the Input
  const SuggestionDropdown = ({ field, index }: {
    field: SuggestionField;
    index: number;
  }) => {
    if (
      suggestions.length === 0 ||
      activeSuggestionField !== field ||
      activeSuggestionIndex !== index
    ) return null;
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute left-0 right-0 z-20 mt-1 bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto"
        >
          <div className="flex justify-between items-center p-2 border-b">
            <span className="text-xs font-medium text-gray-500">Suggestions</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5"
              onClick={() => {
                setSuggestions([]);
                setActiveSuggestionField(null);
                setFocusedInput(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {suggestions.map((suggestion, idx) => (
            <div
              key={idx}
              className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 min-h-screen">
      <div className="max-w-5xl mx-auto">

      <CustomProgressBar currentStep={step} />
        
      {showResetWarning && <ResetWarning onClose={() => setShowResetWarning(false)} />}

        <Card className="w-full shadow-lg border-0">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-4 text-gray-800">Property Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-semibold text-gray-700 mb-1 block text-sm">Property Title</label>
                        <Input 
                          placeholder="e.g., Modern Downtown Apartment" 
                          value={title} 
                          onChange={e => setTitle(e.target.value)} 
                          aria-invalid={!!errors.title} 
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
                      </div>
                      <div>
                        <label className="font-semibold text-gray-700 mb-1 block text-sm">Property Type</label>
                        <select 
                          value={type} 
                          onChange={e => setType(e.target.value)} 
                          className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex h-10 w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="APARTMENT">Apartment</option>
                          <option value="CONDOMINIUM">Condominium</option>
                          <option value="BOARDING_HOUSE">Boarding House</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="font-semibold text-gray-700 mb-1 block text-sm">Description</label>
                        <Textarea 
                          placeholder="Provide a detailed description..." 
                          value={description} 
                          onChange={e => setDescription(e.target.value)} 
                          className="min-h-[80px]" 
                          aria-invalid={!!errors.description} 
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold mb-3 text-gray-800">Address</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-semibold text-gray-700 mb-1 block text-sm">Street</label>
                        <Input 
                          placeholder="Street Name, Building, House No." 
                          value={street} 
                          onChange={e => setStreet(e.target.value)} 
                          aria-invalid={!!errors.street} 
                        />
                        {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
                      </div>
                      <div>
                        <label className="font-semibold text-gray-700 mb-1 block text-sm">Barangay</label>
                        <Input 
                          placeholder="Barangay" 
                          value={barangay} 
                          onChange={e => setBarangay(e.target.value)} 
                          aria-invalid={!!errors.barangay} 
                        />
                        {errors.barangay && <p className="text-red-500 text-xs mt-1">{errors.barangay}</p>}
                      </div>
                      <div>
                        <label className="font-semibold text-gray-700 mb-1 block text-sm">Municipality</label>
                        <Input 
                          placeholder="Municipality" 
                          value={municipality} 
                          onChange={e => setMunicipality(e.target.value)} 
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-gray-700 mb-1 block text-sm">City</label>
                        <Input 
                          placeholder="City" 
                          value={city} 
                          onChange={e => setCity(e.target.value)} 
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-gray-700 mb-1 block text-sm">Province</label>
                        <Input 
                          placeholder="Province" 
                          value={province} 
                          onChange={e => setProvince(e.target.value)} 
                          aria-invalid={!!errors.province} 
                        />
                        {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province}</p>}
                      </div>
                      <div>
                        <label className="font-semibold text-gray-700 mb-1 block text-sm">Zip Code</label>
                        <Input 
                          placeholder="Zip Code" 
                          value={zipCode} 
                          onChange={e => setZipCode(e.target.value)} 
                          aria-invalid={!!errors.zipCode} 
                        />
                        {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition">
                      <Checkbox 
                        id="screening" 
                        checked={requiresScreening} 
                        onCheckedChange={(checked: CheckedState) => setRequiresScreening(checked === true)} 
                        className="h-4 w-4" 
                      />
                      <div>
                        <label htmlFor="screening" className="font-semibold cursor-pointer text-sm">Requires Tenant Screening</label>
                        <p className="text-xs text-gray-500">Screen potential tenants through background checks.</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold mb-3 text-gray-800">Property Rules</h4>
                    <div className="mb-3">
                      <p className="text-sm text-gray-600 mb-2">
                        Add property-specific rules (max {MAX_WORDS_RULES} words per rule)
                      </p>
                      {errors.propertyRules && (
                        <p className="text-red-500 text-xs mb-2">{errors.propertyRules}</p>
                      )}
                    </div>
                    <div className="relative" ref={ruleInputRefs[propertyRules.length - 1]}>
                      {propertyRules.map((rule, index) => (
                        <div key={index} className="flex items-start gap-2 mb-3">
                          <div className="flex-1 relative">
                            <Input 
                              placeholder={`Rule ${index + 1} (e.g., "No smoking inside the unit")`}
                              value={rule} 
                              onChange={e => handlePropertyRuleChange(index, e.target.value)}
                              onFocus={() => showSuggestions(rule, "rule", index)}
                              className="pr-10"
                            />
                            <span className="absolute right-2 top-2 text-xs text-gray-500">
                              {rule.split(/\s+/).length}/{MAX_WORDS_RULES}
                            </span>
                            <SuggestionDropdown field="rule" index={index} />
                          </div>
                          {propertyRules.length > 1 && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removePropertyRule(index)}
                              className="mt-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button onClick={addPropertyRule} variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" /> Add Rule
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <div className="relative" ref={amenityInputRefs[amenities.length - 1]}>
                        <h4 className="text-lg font-bold mb-3 text-gray-800">Amenities</h4>
                        {errors.amenities && (
                          <p className="text-red-500 text-xs mb-2">{errors.amenities}</p>
                        )}
                        {amenities.map((amenity, index) => (
                          <div key={index} className="relative flex items-center gap-2 mb-2">
                            <div className="flex-1 relative">
                              <Input
                                ref={amenityInputRefs[index]}
                                placeholder="e.g., Near UC Main, With Security" 
                                value={amenity} 
                                onChange={e => handleAmenityChange(index, e.target.value)} 
                                onFocus={() => showSuggestions(amenity, "amenity", index)} 
                              />
                              <span className="absolute right-2 top-2 text-xs text-gray-500">
                                {amenity.split(/\s+/).length}/{MAX_WORDS_SHARED}
                              </span>
                              <SuggestionDropdown field="amenity" index={index} />
                            </div>
                            {amenities.length > 1 && (
                              <Button variant="ghost" size="icon" onClick={() => removeAmenity(index)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button onClick={addAmenity} variant="outline" size="sm">
                          <Plus className="mr-2 h-4 w-4" /> Add Amenity
                        </Button>
                      </div>

                      <div className="mt-6 relative" ref={featureInputRefs[features.length - 1]}>
                        <h4 className="text-lg font-bold mb-3 text-gray-800">Features</h4>
                        {errors.features && (
                          <p className="text-red-500 text-xs mb-2">{errors.features}</p>
                        )}
                        {features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 mb-2">
                            <div className="flex-1 relative">
                              <Input 
                                placeholder="e.g., Kitchen, Laundry Area" 
                                value={feature} 
                                onChange={e => handleFeatureChange(index, e.target.value)} 
                                onFocus={() => showSuggestions(feature, "feature", index)}
                              />
                              <span className="absolute right-2 top-2 text-xs text-gray-500">
                                {feature.split(/\s+/).length}/{MAX_WORDS_SHARED}
                              </span>
                              <SuggestionDropdown field="feature" index={index} />
                            </div>
                            {features.length > 1 && (
                              <Button variant="ghost" size="icon" onClick={() => removeFeature(index)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button onClick={addFeature} variant="outline" size="sm">
                          <Plus className="mr-2 h-4 w-4" /> Add Feature
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold mb-3 text-gray-800">Property Photos</h4>
                      
                      <div className="mb-6">
                        <h5 className="font-semibold text-gray-700 mb-2">Main Photo (Required)</h5>
                        <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-indigo-500 transition mb-2">
                          <Upload className="mx-auto h-8 w-8 text-gray-400" />
                          <label htmlFor="main-photo" className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-700 mt-2 block text-sm">
                            <span>Upload Main Photo</span>
                            <Input 
                              id="main-photo" 
                              type="file" 
                              className="sr-only" 
                              accept="image/*" 
                              onChange={handleMainPhotoChange} 
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-1">Max 2MB (Required)</p>
                          {errors.mainPhoto && <p className="text-red-500 text-xs mt-1">{errors.mainPhoto}</p>}
                        </div>
                        {mainPhoto.preview && (
                          <div className="relative group aspect-square max-w-xs mx-auto mb-4">
                            <img 
                              src={mainPhoto.preview} 
                              alt="Main property" 
                              className="h-full w-full object-cover rounded-lg shadow-sm" 
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                              <Button 
                                variant="destructive" 
                                size="icon" 
                                className="h-6 w-6" 
                                onClick={() => {
                                  URL.revokeObjectURL(mainPhoto.preview);
                                  setMainPhoto({ file: null, preview: "" });
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">Additional Photos (Required: {MAX_ADDITIONAL_PHOTOS})</h5>
                        <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-indigo-500 transition">
                          <Upload className="mx-auto h-8 w-8 text-gray-400" />
                          <label htmlFor="additional-photos" className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-700 mt-2 block text-sm">
                            <span>Upload Additional Photos</span>
                            <Input 
                              id="additional-photos" 
                              type="file" 
                              className="sr-only" 
                              multiple 
                              accept="image/*" 
                              onChange={handleAdditionalPhotosChange} 
                              disabled={additionalPhotos.length >= MAX_ADDITIONAL_PHOTOS} 
                            />
                          </label>
                          <p className="text-xs text-gray-500 mt-1">
                            {additionalPhotos.length}/{MAX_ADDITIONAL_PHOTOS} photos (max 2MB each)
                          </p>
                          {errors.additionalPhotos && <p className="text-red-500 text-xs mt-1">{errors.additionalPhotos}</p>}
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {additionalPhotos.map((photo, index) => (
                            <div key={index} className="relative group aspect-square">
                              <img 
                                src={photo.preview} 
                                alt={`property ${index}`} 
                                className="h-full w-full object-cover rounded-lg shadow-sm" 
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                <Button 
                                  variant="destructive" 
                                  size="icon" 
                                  className="h-6 w-6" 
                                  onClick={() => removeAdditionalPhoto(index)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div>
                  <h3 className="text-xl font-bold mb-4 text-gray-800">Add Unit</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Add your first unit for this property. You can add more units later after creation.
                  </p>
                  <div className={`border rounded-lg shadow-sm overflow-hidden ${Object.keys(errors).some(key => key.startsWith('unit_')) ? 'border-red-500' : 'border-gray-200'}`}>
                    <div className="flex justify-between items-center p-3 bg-gray-50">
                      <div className="flex items-center">
                        {Object.keys(errors).some(key => key.startsWith('unit_')) && <AlertCircle className="h-5 w-5 text-red-500 mr-2" />}
                        <h4 className={`font-bold text-base ${Object.keys(errors).some(key => key.startsWith('unit_')) ? 'text-red-600' : 'text-gray-800'}`}>{unit.label || `Unit Details`}</h4>
                      </div>
                    </div>
                    <div className="p-4 bg-white space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="font-semibold text-gray-700 mb-1 block text-sm">Unit Label</label>
                          <Input
                            placeholder="e.g., Unit A"
                            value={unit.label}
                            onChange={e => handleUnitChange("label", e.target.value)}
                            aria-invalid={!!errors.unit_label}
                          />
                          {errors.unit_label && <p className="text-red-500 text-xs mt-1">{errors.unit_label}</p>}
                        </div>
                        <div>
                          <label className="font-semibold text-gray-700 mb-1 block text-sm">Max Occupancy</label>
                          <Input
                            placeholder="e.g., 2"
                            type="number"
                            value={unit.maxOccupancy}
                            onChange={e => handleUnitChange("maxOccupancy", parseInt(e.target.value) || 1)}
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-gray-700 mb-1 block text-sm">Floor Number (Optional)</label>
                          <Input
                            placeholder="e.g., 2"
                            type="number"
                            value={unit.floorNumber || ""}
                            onChange={e => handleUnitChange("floorNumber", e.target.value ? parseInt(e.target.value) : null)}
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="font-semibold text-gray-700 mb-1 block text-sm">Unit Description</label>
                        <Textarea 
                          placeholder="Describe the unit..." 
                          value={unit.description} 
                          onChange={e => handleUnitChange("description", e.target.value)} 
                          className="min-h-[60px]" 
                        />
                      </div>

                      <div className="border-t pt-4">
                        <h5 className="text-base font-bold mb-3 text-gray-800">Pricing</h5>
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="font-semibold text-gray-700 mb-1 block text-sm">Target Price (₱)</label>
                              <Input 
                                placeholder="e.g., 5000" 
                                type="number" 
                                value={unit.targetPrice || ""} 
                                onChange={e => handleUnitChange("targetPrice", parseFloat(e.target.value))} 
                                aria-invalid={!!errors.unit_targetPrice} 
                              />
                              {errors.unit_targetPrice && <p className="text-red-500 text-xs mt-1">{errors.unit_targetPrice}</p>}
                            </div>
                            <div className="flex items-center">
                              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50 transition w-full">
                                <Checkbox 
                                  id="isNegotiable" 
                                  checked={unit.isNegotiable} 
                                  onCheckedChange={checked => handleUnitChange("isNegotiable", checked)} 
                                  className="h-4 w-4" 
                                />
                                <div>
                                  <label htmlFor="isNegotiable" className="font-semibold cursor-pointer text-sm">Price is Negotiable</label>
                                  <p className="text-xs text-gray-500">Allow tenants to negotiate.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-4 relative" ref={unitFeatureInputRefs[unit.unitFeatureTags.length - 1]}>
                        <h5 className="text-base font-bold mb-3 text-gray-800">Unit Features</h5>
                        {errors.unitFeatures && (
                          <p className="text-red-500 text-xs mb-2">{errors.unitFeatures}</p>
                        )}
                        {unit.unitFeatureTags.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 mb-2">
                            <div className="flex-1 relative">
                              <Input
                                ref={unitFeatureInputRefs[index]}
                                placeholder="e.g., Air Conditioning, Mini Fridge"
                                value={feature}
                                onChange={e => handleUnitFeatureChange(index, e.target.value)}
                                onFocus={() => showSuggestions(feature, "unitFeature", index)}
                              />
                              <span className="absolute right-2 top-2 text-xs text-gray-500">
                                {feature.split(/\s+/).length}/{MAX_WORDS_SHARED}
                              </span>
                              <SuggestionDropdown field="unitFeature" index={index} />
                            </div>
                            {unit.unitFeatureTags.length > 1 && (
                              <Button variant="ghost" size="icon" onClick={() => removeUnitFeature(index)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button onClick={addUnitFeature} variant="outline" size="sm">
                          <Plus className="mr-2 h-4 w-4" /> Add Feature
                        </Button>
                      </div>

                      <div className="border-t pt-4 relative" ref={leaseRuleInputRefs[unit.leaseRules.length - 1]}>
                        <h5 className="text-base font-bold mb-3 text-gray-800">Lease Rules</h5>
                        <div className="mb-3">
                          <p className="text-sm text-gray-600 mb-2">
                            Add unit-specific lease rules (max {MAX_WORDS_RULES} words per rule)
                          </p>
                          {errors.leaseRules && (
                            <p className="text-red-500 text-xs mb-2">{errors.leaseRules}</p>
                          )}
                        </div>
                        {unit.leaseRules.map((rule, index) => (
                          <div key={index} className="flex items-start gap-2 mb-3">
                            <div className="flex-1 relative">
                              <Input
                                ref={leaseRuleInputRefs[index]}
                                placeholder={`Rule ${index + 1} (e.g., "Minimum lease duration: 6 months")`}
                                value={rule}
                                onChange={e => handleLeaseRuleChange(index, e.target.value)}
                                onFocus={() => showSuggestions(rule, "leaseRule", index)}
                                className="pr-10"
                              />
                              <span className="absolute right-2 top-2 text-xs text-gray-500">
                                {rule.split(/\s+/).length}/{MAX_WORDS_RULES}
                              </span>
                              <SuggestionDropdown field="leaseRule" index={index} />
                            </div>
                            {unit.leaseRules.length > 1 && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => removeLeaseRule(index)}
                                className="mt-1"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button onClick={addLeaseRule} variant="outline" size="sm">
                          <Plus className="mr-2 h-4 w-4" /> Add Lease Rule
                        </Button>
                      </div>

                      <div className="border-t pt-4">
                        <h5 className="text-base font-bold mb-3 text-gray-800">Unit Photos (Required: {MAX_UNIT_PHOTOS})</h5>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <div>
                            <Input 
                              type="file" 
                              multiple 
                              accept="image/*"
                              onChange={handleUnitPhotoChange} 
                              disabled={unitPhotos.length >= MAX_UNIT_PHOTOS} 
                              className="mb-2" 
                            />
                            <p className="text-xs text-gray-500">
                              {unitPhotos.length}/{MAX_UNIT_PHOTOS} photos (max 2MB each)
                            </p>
                            {errors.unitPhotos && <p className="text-red-500 text-xs mt-1">{errors.unitPhotos}</p>}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {unitPhotos.map((photo, index) => (
                              <div key={index} className="relative group aspect-square">
                                <img 
                                  src={photo.preview} 
                                  alt={`unit photo ${index}`} 
                                  className="h-full w-full object-cover rounded-lg shadow-sm" 
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                  <Button 
                                    variant="destructive" 
                                    size="icon" 
                                    className="h-6 w-6" 
                                    onClick={() => removeUnitPhoto(index)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {errors.submit && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{errors.submit}</p>
                </div>
              )}
              <div className="mt-6 flex justify-between items-center">
                {step > 1 ? <Button variant="outline" onClick={prevStep}><ArrowLeft className="mr-2 h-4 w-4" /> Previous</Button> : <div />}
                {step < 2 ? <Button onClick={nextStep}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button> :
                  <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 w-36">
                    <AnimatePresence mode="wait">
                      {isSubmitting ? (
                        <motion.div
                          key="loading"
                          initial={{ opacity: 0, y: -20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 20 }}
                          className="flex items-center justify-center"
                        >
                          <motion.div
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
                          />
                          <span className="ml-2">Creating...</span>
                        </motion.div>
                      ) : (
                        <motion.span key="submit">Submit Property</motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                }
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddProperty;
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import {
  ArrowLeft,
  Home,
  MapPin,
  Tag,
  DollarSign,
  Image,
  Plus,
  Trash2,
  Building,
  Check,
  X,
  ChevronRight,
  Bed,
  Users,
  CheckCircle,
  Info,
  Copy,
  Layers,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

// Property types based on Prisma model
type PropertyType = "HOUSE" | "APARTMENT" | "CONDO" | "STUDIO" | "COMMERCIAL" | "OTHER";
type UnitStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE" | "UNAVAILABLE";

// Form data structure
interface PropertyFormData {
  title: string;
  description: string;
  type: PropertyType;
  street: string;
  barangay: string;
  municipality: string;
  city: string;
  province: string;
  zipCode: string;
  requiresScreening: boolean;
  tags: string[];
}

interface UnitFormData {
  id: string;
  label: string;
  description: string;
  maxOccupancy: number;
  chargePerHead: boolean;
  pricePerHead?: number;
  pricePerUnit?: number;
  isNegotiable: boolean;
  status: UnitStatus;
  photos: File[];
  photoPreviews: string[];
}

// Field sets for step validation
const stepFields = {
  1: ['title', 'type'],
  2: ['description'],
  3: ['street', 'barangay', 'municipality', 'city', 'province', 'zipCode'],
  4: [] // Units handled separately
};

export const AddProperty = () => {
  const navigate = useNavigate();
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    setValue, 
    watch,
    trigger,
    control
  } = useForm<PropertyFormData>({
    defaultValues: {
      type: "HOUSE",
      requiresScreening: false,
      tags: [],
    }
  });
  
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});
  const [unitErrors, setUnitErrors] = useState<Record<string, Record<string, string>>>({});
  const [units, setUnits] = useState<UnitFormData[]>([
    {
      id: Math.random().toString(36).slice(2, 11),
      label: "Main Unit",
      description: "Default unit for this property",
      maxOccupancy: 1,
      chargePerHead: false,
      isNegotiable: false,
      status: "AVAILABLE",
      photos: [],
      photoPreviews: []
    }
  ]);
  
  const tags = watch("tags") || [];
  const totalSteps = 4;
  
  // Steps data
  const steps = [
    { id: 1, title: "Property Type" },
    { id: 2, title: "Description & Features" },
    { id: 3, title: "Address" },
    { id: 4, title: "Units" },
  ];

  // Initialize expanded state for units
  useEffect(() => {
    if (units.length > 0) {
      // Expand the first unit by default
      const initialExpanded: Record<string, boolean> = {};
      initialExpanded[units[0].id] = true;
      setExpandedUnits(initialExpanded);
    }
  }, []);

  // Toggle unit expansion
  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => ({
      ...prev,
      [unitId]: !prev[unitId]
    }));
  };

  // Generate new unit
  const createNewUnit = (): UnitFormData => ({
    id: Math.random().toString(36).slice(2, 11),
    label: `Unit ${units.length + 1}`,
    description: "",
    maxOccupancy: 1,
    chargePerHead: false,
    isNegotiable: false,
    status: "AVAILABLE",
    photos: [],
    photoPreviews: []
  });

  // Add a new unit
  const addUnit = () => {
    const newUnit = createNewUnit();
    setUnits([...units, newUnit]);
    // Clear errors when adding a new unit
    setUnitErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[newUnit.id];
      return newErrors;
    });
    
    // Expand the new unit when added
    setExpandedUnits(prev => ({
      ...prev,
      [newUnit.id]: true
    }));
  };

  // Duplicate a unit
  const duplicateUnit = (index: number) => {
    const unitToDuplicate = units[index];
    const newUnit = {
      ...unitToDuplicate,
      id: Math.random().toString(36).slice(2, 11),
      label: `${unitToDuplicate.label} (copy)`,
      photos: [],
      photoPreviews: []
    };
    setUnits([...units, newUnit]);
    // Expand the duplicated unit
    setExpandedUnits(prev => ({
      ...prev,
      [newUnit.id]: true
    }));
  };

  // Remove a unit
  const removeUnit = (index: number) => {
    const unitIdToRemove = units[index].id;
    
    // Clean up photo previews
    units[index].photoPreviews.forEach(preview => URL.revokeObjectURL(preview));
    
    // Remove from expanded state
    const newExpanded = { ...expandedUnits };
    delete newExpanded[unitIdToRemove];
    setExpandedUnits(newExpanded);
    
    // Remove from units array
    const newUnits = [...units];
    newUnits.splice(index, 1);
    setUnits(newUnits);
    
    // Clear errors for removed unit
    setUnitErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[unitIdToRemove];
      return newErrors;
    });
  };

  // Update unit field
  const updateUnitField = (id: string, field: keyof UnitFormData, value: any) => {
    setUnits(units.map(unit => 
      unit.id === id ? { ...unit, [field]: value } : unit
    ));
    
    // Clear error when field is updated
    setUnitErrors(prev => {
      const unitError = prev[id] ? { ...prev[id] } : {};
      delete unitError[field];
      
      if (Object.keys(unitError).length === 0) {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      }
      
      return {
        ...prev,
        [id]: unitError
      };
    });
  };

  // Handle photo uploads for a unit
  const handlePhotoUpload = (unitId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    const unitIndex = units.findIndex(u => u.id === unitId);
    if (unitIndex === -1) return;
    
    const unit = units[unitIndex];
    const newPhotos: File[] = [];
    const newPreviews: string[] = [];
    
    // Only allow up to 2 photos per unit
    const remainingSlots = 2 - unit.photos.length;
    if (remainingSlots <= 0) return;
    
    const filesToProcess = files.slice(0, remainingSlots);
    
    filesToProcess.forEach(file => {
      if (!file.type.match("image.*")) return;
      newPhotos.push(file);
      const previewUrl = URL.createObjectURL(file);
      newPreviews.push(previewUrl);
    });
    
    const updatedUnits = [...units];
    updatedUnits[unitIndex] = {
      ...unit,
      photos: [...unit.photos, ...newPhotos],
      photoPreviews: [...unit.photoPreviews, ...newPreviews]
    };
    
    setUnits(updatedUnits);
  };
  
  // Remove a photo from a unit
  const removePhoto = (unitId: string, index: number) => {
    const unitIndex = units.findIndex(u => u.id === unitId);
    if (unitIndex === -1) return;
    
    const unit = units[unitIndex];
    const newPhotos = [...unit.photos];
    const newPreviews = [...unit.photoPreviews];
    
    // Revoke the URL object
    URL.revokeObjectURL(newPreviews[index]);
    
    newPhotos.splice(index, 1);
    newPreviews.splice(index, 1);
    
    const updatedUnits = [...units];
    updatedUnits[unitIndex] = {
      ...unit,
      photos: newPhotos,
      photoPreviews: newPreviews
    };
    
    setUnits(updatedUnits);
  };
  
  // Add a tag
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setValue("tags", newTags);
      setTagInput("");
    }
  };
  
  // Remove a tag
  const removeTag = (tag: string) => {
    const newTags = tags.filter(t => t !== tag);
    setValue("tags", newTags);
  };
  
  // Validate step before proceeding
  const nextStep = async () => {
    const fields = stepFields[currentStep as keyof typeof stepFields];
    const isValid = await trigger(fields as (keyof PropertyFormData)[], { shouldFocus: true });
    
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Validate units with inline errors
  const validateUnits = (): boolean => {
    const errors: Record<string, Record<string, string>> = {};
    let isValid = true;

    if (units.length === 0) {
      return false;
    }
    
    for (const unit of units) {
      const unitErrors: Record<string, string> = {};
      
      if (!unit.label.trim()) {
        unitErrors.label = "Label is required";
        isValid = false;
      }
      
      if (!unit.description.trim()) {
        unitErrors.description = "Description is required";
        isValid = false;
      }
      
      if (unit.maxOccupancy < 1) {
        unitErrors.maxOccupancy = "Max occupancy must be at least 1";
        isValid = false;
      }
      
      if (unit.chargePerHead) {
        if (!unit.pricePerHead || unit.pricePerHead <= 0) {
          unitErrors.pricePerHead = "Please enter a valid price per person";
          isValid = false;
        }
      } else {
        if (!unit.pricePerUnit || unit.pricePerUnit <= 0) {
          unitErrors.pricePerUnit = "Please enter a valid monthly rent";
          isValid = false;
        }
      }
      
      if (Object.keys(unitErrors).length > 0) {
        errors[unit.id] = unitErrors;
        // Expand unit if it has errors
        if (!expandedUnits[unit.id]) {
          setExpandedUnits(prev => ({ ...prev, [unit.id]: true }));
        }
      }
    }
    
    setUnitErrors(errors);
    return isValid;
  };
  
  // Handle form submission
  const onSubmit = async (data: PropertyFormData) => {
    if (!validateUnits()) return;
    
    // Show confirmation dialog
    const confirmed = window.confirm("Are you sure you want to create this property? You'll be able to add more details later.");
    if (!confirmed) return;
    
    setIsSubmitting(true);
    
    try {
      // Create property payload
      const propertyData = {
        title: data.title,
        description: data.description,
        type: data.type,
        street: data.street,
        barangay: data.barangay,
        municipality: data.municipality,
        city: data.city,
        province: data.province,
        zipCode: data.zipCode,
        requiresScreening: data.requiresScreening,
        tags: data.tags,
      };
      
      // Create units payload
      const unitsData = units.map(unit => ({
        label: unit.label,
        description: unit.description,
        maxOccupancy: unit.maxOccupancy,
        chargePerHead: unit.chargePerHead,
        pricePerHead: unit.pricePerHead,
        pricePerUnit: unit.pricePerUnit,
        isNegotiable: unit.isNegotiable,
        status: unit.status,
        photos: unit.photos
      }));
      
      // Simulate API calls
      await new Promise(resolve => setTimeout(resolve, 1200));
      const propertyId = "prop-" + Math.random().toString(36).slice(2, 11);
      
      navigate(`/landlord/properties/${propertyId}/add-units`);
      
    } catch (error) {
      console.error("Error creating property:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Clean up preview URLs
  useEffect(() => {
    return () => {
      units.forEach(unit => {
        unit.photoPreviews.forEach(preview => URL.revokeObjectURL(preview));
      });
    };
  }, [units]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 overflow-auto max-h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-900">
      <div className="mb-8">
        <Button asChild variant="ghost" className="px-0 mb-4">
          <Link to="/landlord/properties">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Link>
        </Button>
        
        <div className="flex flex-col">
          <div>
            <h1 className="text-3xl font-bold dark:text-white bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
              Create New Property
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Step-by-step wizard to add your property and units
            </p>
          </div>
          
          {/* Progress Steps */}
          <div className="mt-8">
            <div className="flex justify-between mb-4">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center w-1/5">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all",
                    currentStep === step.id 
                      ? "bg-gradient-to-r from-blue-600 to-green-500 text-white border-2 border-blue-600"
                      : currentStep > step.id
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-2 border-green-500"
                      : "bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-400"
                  )}>
                    {currentStep > step.id ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="font-medium">{step.id}</span>
                    )}
                  </div>
                  <span className={cn(
                    "text-sm text-center",
                    currentStep === step.id 
                      ? "text-blue-600 dark:text-blue-400 font-medium"
                      : currentStep > step.id
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-500 dark:text-gray-400"
                  )}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
            <Progress 
              value={(currentStep - 1) * 25} 
              className="h-2 bg-gradient-to-r from-blue-500 via-blue-400 to-green-500"
            />
          </div>
        </div>
      </div>
      
      <form 
        id="property-form"
        onSubmit={currentStep === 4 ? handleSubmit(onSubmit) : (e) => e.preventDefault()}
        className="space-y-6"
      >
        {/* Step 1: Property Type */}
        {currentStep === 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 shadow-sm transition-all animate-fadeIn">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg mr-3">
                <Home className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold">Property Type</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  placeholder="Modern BGC Condominium"
                  {...register("title", { required: "Title is required" })}
                  className={cn("py-5 px-4 text-base", errors.title && "border-red-500")}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Property Type *</Label>
                <Controller
                  name="type"
                  control={control}
                  rules={{ required: "Property type is required" }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="py-5 px-4 text-base">
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HOUSE">House</SelectItem>
                        <SelectItem value="APARTMENT">Apartment</SelectItem>
                        <SelectItem value="CONDO">Condo</SelectItem>
                        <SelectItem value="STUDIO">Studio</SelectItem>
                        <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Controller
                    name="requiresScreening"
                    control={control}
                    render={({ field }) => (
                      <Checkbox 
                        id="requiresScreening"
                        className="h-5 w-5"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="requiresScreening" className="text-base">Requires tenant screening</Label>
                </div>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                <div className="flex items-start">
                  <Building className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Every property requires at least one unit. You'll be able to add units in the final step.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 2: Description & Features */}
        {currentStep === 2 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 shadow-sm transition-all animate-fadeIn">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-lg mr-3">
                <Tag className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold">Description & Features</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your property in detail..."
                  {...register("description", { required: "Description is required" })}
                  className={cn(errors.description && "border-red-500", "min-h-[150px] py-4 px-4 text-base")}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>
              
              <div>
                <Label>Add property features (e.g. Swimming Pool, Gym, etc.)</Label>
                <div className="flex mt-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Enter a feature..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="py-4 px-4"
                  />
                  <Button 
                    type="button" 
                    variant="secondary" 
                    className="ml-2 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                    onClick={addTag}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <Badge key={tag} className="flex items-center py-1.5 px-3 text-sm bg-gradient-to-r from-blue-100 to-green-100 text-blue-800 dark:from-blue-900/30 dark:to-green-900/30 dark:text-blue-300">
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Step 3: Address */}
        {currentStep === 3 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 shadow-sm transition-all animate-fadeIn">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-2 rounded-lg mr-3">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold">Property Address</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="street">Street *</Label>
                <Input
                  id="street"
                  placeholder="32nd Street"
                  {...register("street", { required: "Street is required" })}
                  className={cn("py-4 px-4", errors.street && "border-red-500")}
                />
                {errors.street && (
                  <p className="text-sm text-red-500">{errors.street.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="barangay">Barangay *</Label>
                <Input
                  id="barangay"
                  placeholder="Bonifacio Global City"
                  {...register("barangay", { required: "Barangay is required" })}
                  className={cn("py-4 px-4", errors.barangay && "border-red-500")}
                />
                {errors.barangay && (
                  <p className="text-sm text-red-500">{errors.barangay.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="municipality">Municipality *</Label>
                <Input
                  id="municipality"
                  placeholder="Taguig"
                  {...register("municipality", { required: "Municipality is required" })}
                  className={cn("py-4 px-4", errors.municipality && "border-red-500")}
                />
                {errors.municipality && (
                  <p className="text-sm text-red-500">{errors.municipality.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="Metro Manila"
                  {...register("city", { required: "City is required" })}
                  className={cn("py-4 px-4", errors.city && "border-red-500")}
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="province">Province *</Label>
                <Input
                  id="province"
                  placeholder="NCR"
                  {...register("province", { required: "Province is required" })}
                  className={cn("py-4 px-4", errors.province && "border-red-500")}
                />
                {errors.province && (
                  <p className="text-sm text-red-500">{errors.province.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="zipCode">Zip Code *</Label>
                <Input
                  id="zipCode"
                  placeholder="1634"
                  {...register("zipCode", { 
                    required: "Zip code is required",
                    pattern: {
                      value: /^[0-9]{4}$/,
                      message: "Zip code must be 4 digits"
                    }
                  })}
                  className={cn("py-4 px-4", errors.zipCode && "border-red-500")}
                />
                {errors.zipCode && (
                  <p className="text-sm text-red-500">{errors.zipCode.message}</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Step 4: Units */}
        {currentStep === 4 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6 shadow-sm transition-all animate-fadeIn">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-lg mr-3">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold">Property Units</h2>
            </div>
            
            <div className="space-y-8">
              {units.length === 0 && (
                <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center text-red-500">
                    <Info className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p className="text-sm">
                      Please add at least one unit
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-gray-700 dark:text-gray-300">
                  {units.length} {units.length === 1 ? 'Unit' : 'Units'} Added
                </h3>
                <Button 
                  type="button" 
                  variant="secondary"
                  onClick={addUnit}
                  className="px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Unit
                </Button>
              </div>
              
              {/* Scrollable units container with fixed height */}
              <div className="max-h-[calc(100vh-450px)] overflow-y-auto pr-2 custom-scrollbar">
                {units.map((unit, index) => (
                  <div key={unit.id} className="border dark:border-gray-700 rounded-xl bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900/30 dark:to-gray-900/30 mb-4">
                    <div 
                      className="flex justify-between items-center p-4 cursor-pointer"
                      onClick={() => toggleUnit(unit.id)}
                    >
                      <div className="flex items-center">
                        <Bed className="h-5 w-5 mr-3 text-blue-500" />
                        <div>
                          <h3 className="font-semibold text-lg">{unit.label}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {expandedUnits[unit.id] ? "Click to collapse" : "Click to expand"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="flex space-x-2 mr-4">
                          <Button 
                            type="button" 
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              duplicateUnit(index);
                            }}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Duplicate
                          </Button>
                          <Button 
                            type="button" 
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeUnit(index);
                            }}
                            disabled={units.length <= 1}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                        <div className="ml-2">
                          {expandedUnits[unit.id] ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {expandedUnits[unit.id] && (
                      <div className="p-6 pt-0">
                        <div className="space-y-6 mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor={`unit-label-${unit.id}`}>Unit Label *</Label>
                              <Input
                                id={`unit-label-${unit.id}`}
                                placeholder="Main Unit"
                                value={unit.label}
                                onChange={(e) => updateUnitField(unit.id, 'label', e.target.value)}
                                className={cn("py-4 px-4", unitErrors[unit.id]?.label && "border-red-500")}
                              />
                              {unitErrors[unit.id]?.label && (
                                <p className="text-sm text-red-500">{unitErrors[unit.id].label}</p>
                              )}
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`max-occupancy-${unit.id}`}>Max Occupancy *</Label>
                              <Input
                                id={`max-occupancy-${unit.id}`}
                                type="number"
                                placeholder="3"
                                value={unit.maxOccupancy}
                                onChange={(e) => updateUnitField(unit.id, 'maxOccupancy', Number(e.target.value))}
                                min="1"
                                max="10"
                                className={cn("py-4 px-4", unitErrors[unit.id]?.maxOccupancy && "border-red-500")}
                              />
                              {unitErrors[unit.id]?.maxOccupancy && (
                                <p className="text-sm text-red-500">{unitErrors[unit.id].maxOccupancy}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`unit-description-${unit.id}`}>Unit Description *</Label>
                            <Textarea
                              id={`unit-description-${unit.id}`}
                              placeholder="Describe this unit..."
                              value={unit.description}
                              onChange={(e) => updateUnitField(unit.id, 'description', e.target.value)}
                              className={cn("py-4 px-4 min-h-[100px]", unitErrors[unit.id]?.description && "border-red-500")}
                            />
                            {unitErrors[unit.id]?.description && (
                              <p className="text-sm text-red-500">{unitErrors[unit.id].description}</p>
                            )}
                          </div>
                          
                          {/* Pricing Model */}
                          <div className="space-y-4">
                            <Label>Pricing Model *</Label>
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  id={`fixed-price-${unit.id}`}
                                  name={`pricing-model-${unit.id}`}
                                  checked={!unit.chargePerHead}
                                  onChange={() => updateUnitField(unit.id, 'chargePerHead', false)}
                                  className="peer sr-only"
                                />
                                <Label
                                  htmlFor={`fixed-price-${unit.id}`}
                                  className={cn(
                                    "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-checked:border-primary",
                                    !unit.chargePerHead && "border-blue-600"
                                  )}
                                >
                                  <DollarSign className="mb-3 h-6 w-6" />
                                  Fixed Price
                                </Label>
                              </div>
                              <div className="flex items-center">
                                <input
                                  type="radio"
                                  id={`per-head-${unit.id}`}
                                  name={`pricing-model-${unit.id}`}
                                  checked={unit.chargePerHead}
                                  onChange={() => updateUnitField(unit.id, 'chargePerHead', true)}
                                  className="peer sr-only"
                                />
                                <Label
                                  htmlFor={`per-head-${unit.id}`}
                                  className={cn(
                                    "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-checked:border-primary",
                                    unit.chargePerHead && "border-green-600"
                                  )}
                                >
                                  <Users className="mb-3 h-6 w-6" />
                                  Per Person
                                </Label>
                              </div>
                            </div>
                          </div>

                          {/* Price Inputs */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {unit.chargePerHead ? (
                              <div className="space-y-2">
                                <Label htmlFor={`price-per-head-${unit.id}`}>Price Per Person (PHP) *</Label>
                                <Input
                                  id={`price-per-head-${unit.id}`}
                                  type="number"
                                  placeholder="5000"
                                  value={unit.pricePerHead || ''}
                                  onChange={(e) => updateUnitField(unit.id, 'pricePerHead', Number(e.target.value))}
                                  min="1"
                                  className={cn("py-4 px-4", unitErrors[unit.id]?.pricePerHead && "border-red-500")}
                                />
                                {unitErrors[unit.id]?.pricePerHead && (
                                  <p className="text-sm text-red-500">{unitErrors[unit.id].pricePerHead}</p>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <Label htmlFor={`price-per-unit-${unit.id}`}>Monthly Rent (PHP) *</Label>
                                <Input
                                  id={`price-per-unit-${unit.id}`}
                                  type="number"
                                  placeholder="20000"
                                  value={unit.pricePerUnit || ''}
                                  onChange={(e) => updateUnitField(unit.id, 'pricePerUnit', Number(e.target.value))}
                                  min="1"
                                  className={cn("py-4 px-4", unitErrors[unit.id]?.pricePerUnit && "border-red-500")}
                                />
                                {unitErrors[unit.id]?.pricePerUnit && (
                                  <p className="text-sm text-red-500">{unitErrors[unit.id].pricePerUnit}</p>
                                )}
                              </div>
                            )}
                            
                            <div className="space-y-2">
                              <Label htmlFor={`unit-status-${unit.id}`}>Unit Status *</Label>
                              <Select
                                value={unit.status}
                                onValueChange={(value) => updateUnitField(unit.id, 'status', value as UnitStatus)}
                              >
                                <SelectTrigger className="py-5 px-4 text-base">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="AVAILABLE">Available</SelectItem>
                                  <SelectItem value="OCCUPIED">Occupied</SelectItem>
                                  <SelectItem value="MAINTENANCE">Under Maintenance</SelectItem>
                                  <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          {/* Negotiable checkbox */}
                          <div className="flex items-center space-x-3 mt-4">
                            <Checkbox 
                              id={`is-negotiable-${unit.id}`}
                              className="h-5 w-5"
                              checked={unit.isNegotiable}
                              onCheckedChange={(checked) => updateUnitField(unit.id, 'isNegotiable', checked)}
                            />
                            <Label htmlFor={`is-negotiable-${unit.id}`} className="text-base">
                              Price is negotiable
                            </Label>
                          </div>
                          
                          {/* Unit Photos */}
                          <div className="space-y-4 mt-6">
                            <Label>Unit Photos (Max 2)</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {unit.photoPreviews.map((preview, idx) => (
                                <div key={idx} className="relative group aspect-square">
                                  <img 
                                    src={preview} 
                                    alt={`Preview ${idx + 1}`} 
                                    className="w-full h-full object-cover rounded-lg border"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removePhoto(unit.id, idx)}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                  <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                    {idx + 1}/{unit.photoPreviews.length}
                                  </div>
                                </div>
                              ))}
                              
                              {unit.photoPreviews.length < 2 && (
                                <label 
                                  htmlFor={`photo-upload-${unit.id}`}
                                  className="aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                >
                                  <div className="bg-gradient-to-r from-blue-100 to-green-100 dark:from-blue-900/20 dark:to-green-900/20 p-3 rounded-full mb-3">
                                    <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <span className="text-sm text-gray-500 text-center px-2">
                                    Upload Photo<br />({2 - unit.photoPreviews.length} remaining)
                                  </span>
                                  <input
                                    id={`photo-upload-${unit.id}`}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handlePhotoUpload(unit.id, e)}
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    You can add multiple units to this property. Each unit can have up to 2 photos. 
                    The monthly rent and max occupancy are specific to each unit.
                    Click on a unit header to expand/collapse its details.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 sticky bottom-0 bg-gradient-to-b from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-900 py-4 z-10">
          <Button 
            type="button" 
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting}
            className="px-6 py-5"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          {currentStep < totalSteps ? (
            <Button 
              type="button" 
              onClick={nextStep}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8 py-5 text-white"
            >
              Next Step
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button 
              type="submit" 
              form="property-form"
              disabled={isSubmitting}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 px-8 py-5 text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Property...
                </div>
              ) : (
                <>
                  Create Property
                  <CheckCircle className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </div>
      </form>
      
      <style >{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #10b981);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #059669);
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #2d3748;
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #60a5fa, #34d399);
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #3b82f6, #10b981);
        }
      `}</style>
    </div>
  );
};
import React, { useState, useEffect} from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { FaTrash, FaUpload, FaTimes, FaCheck } from "react-icons/fa";

interface UnitFormData {
  label: string;
  description: string;
  status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE";
  floorNumber?: number;
  maxOccupancy: number;
  unitFeatureTags: string[];
  targetPrice: number;
  isNegotiable: boolean;
  isListed: boolean;
  unitLeaseRules: string[];
  images: File[];
}

interface UnitError {
  general?: string;
  label?: string;
  targetPrice?: string;
  maxOccupancy?: string;
  leaseRules?: string;
  images?: string;
  featureTags?: string;
}

const AddUnit = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [unit, setUnit] = useState<UnitFormData>({
    label: "",
    description: "",
    status: "AVAILABLE",
    floorNumber: undefined,
    maxOccupancy: 1,
    unitFeatureTags: [],
    targetPrice: 0,
    isNegotiable: false,
    isListed: true, // Default to listed
    unitLeaseRules: [],
    images: [],
  });
  
  const [featureTagInput, setFeatureTagInput] = useState<string>("");
  const [leaseRuleInput, setLeaseRuleInput] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<UnitError>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [existingUnits, setExistingUnits] = useState<string[]>([]); // For label validation

  // Fetch existing units for label validation
  useEffect(() => {
    const fetchUnits = async () => {
      if (!propertyId) return;
      
      try {
        const response = await axios.get(
          `http://localhost:4000/api/landlord/unit/${propertyId}/units`,
          { withCredentials: true }
        );
        
        // Extract unit labels for validation
        const labels = response.data.map((unit: any) => unit.label);
        setExistingUnits(labels);
      } catch (error) {
        console.error("Failed to fetch existing units", error);
      }
    };

    fetchUnits();
  }, [propertyId]);

  const handleInputChange = (
    field: keyof UnitFormData,
    value: any
  ) => {
    setUnit(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field-specific errors
    if (field in errors) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof typeof errors];
        return newErrors;
      });
    }
  };

  // Feature tags handler
  const handleFeatureTag = (action: "add" | "remove", tag?: string) => {
    if (action === "add" && featureTagInput.trim()) {
      const tagText = featureTagInput.trim();
      
      // Validate single word
      if (tagText.includes(" ")) {
        setErrors(prev => ({
          ...prev,
          featureTags: "Features must be single words"
        }));
        return;
      }
      
      // Validate max features
      if (unit.unitFeatureTags.length >= 15) {
        setErrors(prev => ({
          ...prev,
          featureTags: "Maximum 15 features allowed"
        }));
        return;
      }
      
      if (!unit.unitFeatureTags.includes(tagText)) {
        setUnit(prev => ({
          ...prev,
          unitFeatureTags: [...prev.unitFeatureTags, tagText]
        }));
      }
      setFeatureTagInput("");
    } else if (action === "remove" && tag) {
      setUnit(prev => ({
        ...prev,
        unitFeatureTags: prev.unitFeatureTags.filter(t => t !== tag)
      }));
    }
    
    // Clear errors if fixed
    if (errors.featureTags) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.featureTags;
        return newErrors;
      });
    }
  };

  // Lease rules handler
  const addLeaseRule = () => {
    const ruleText = leaseRuleInput.trim();
    if (!ruleText) return;
    
    // Validate word count
    const wordCount = ruleText.split(/\s+/).length;
    if (wordCount > 20) {
      setErrors(prev => ({
        ...prev,
        leaseRules: "Lease rules must be 20 words or less per item"
      }));
      return;
    }
    
    // Validate max rules
    if (unit.unitLeaseRules.length >= 10) {
      setErrors(prev => ({
        ...prev,
        leaseRules: "Maximum of 10 lease rules allowed"
      }));
      return;
    }
    
    setUnit(prev => ({
      ...prev,
      unitLeaseRules: [...prev.unitLeaseRules, ruleText]
    }));
    
    // Clear input and any existing error
    setLeaseRuleInput("");
    
    if (errors.leaseRules) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.leaseRules;
        return newErrors;
      });
    }
  };

  const removeLeaseRule = (ruleIndex: number) => {
    setUnit(prev => ({
      ...prev,
      unitLeaseRules: prev.unitLeaseRules.filter((_, index) => index !== ruleIndex)
    }));
  };

  // Image handling
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files).slice(0, 3);
    setUnit(prev => ({
      ...prev,
      images: files
    }));
    
    // Clear image error when images are added
    if (errors.images) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.images;
        return newErrors;
      });
    }
  };

  const removeImage = (imageIndex: number) => {
    setUnit(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== imageIndex)
    }));
  };

  // Image upload to storage
  const uploadImages = async (unitId: string, images: File[]) => {
    if (!propertyId) return [];
    
    const imageUrls: string[] = [];
    
    for (const image of images) {
      const fileExt = image.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.floor(Math.random() * 10000)}.${fileExt}`;
      const filePath = `properties/${propertyId}/units/${unitId}/photos/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from("rentease-images")
        .upload(filePath, image);
      
      if (uploadError) {
        console.error("Error uploading image:", uploadError);
        continue;
      }
      
      const { data: urlData } = supabase.storage
        .from("rentease-images")
        .getPublicUrl(filePath);
      
      if (urlData.publicUrl) {
        imageUrls.push(urlData.publicUrl);
      }
    }
    
    return imageUrls;
  };

  // Form validation
  const validateForm = () => {
    let isValid = true;
    const newErrors: UnitError = {};
    
    // Label validation
    if (!unit.label.trim()) {
      newErrors.label = "Label is required";
      isValid = false;
    }
    
    // Check for duplicate label in property
    if (existingUnits.includes(unit.label.trim())) {
      newErrors.label = "Unit label must be unique within this property";
      isValid = false;
    }
    
    // Price validation
    if (unit.targetPrice <= 0) {
      newErrors.targetPrice = "Price must be positive";
      isValid = false;
    }
    
    // Max occupancy validation
    if (unit.maxOccupancy < 1) {
      newErrors.maxOccupancy = "Max occupancy must be at least 1";
      isValid = false;
    }
    
    // Lease rules validation
    unit.unitLeaseRules.forEach((rule, ruleIndex) => {
      const wordCount = rule.trim().split(/\s+/).length;
      if (wordCount > 20) {
        newErrors.leaseRules = `Rule #${ruleIndex + 1} exceeds 20 words (${wordCount})`;
        isValid = false;
      }
    });
    
    if (unit.unitLeaseRules.length > 10) {
      newErrors.leaseRules = `Maximum of 10 lease rules allowed (${unit.unitLeaseRules.length})`;
      isValid = false;
    }
    
    // Feature tags validation
    unit.unitFeatureTags.forEach(tag => {
      if (tag.includes(" ")) {
        newErrors.featureTags = "Features must be single words";
        isValid = false;
      }
    });
    
    if (unit.unitFeatureTags.length > 15) {
      newErrors.featureTags = "Maximum 15 features allowed";
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage("");

    // Validate form
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    
    try {
      if (!propertyId) throw new Error("Property ID is missing");

      /**
       * Prepare data for backend submission
       * Note: Images are handled separately
       * 
       * Expected payload:
       * {
       *   label: string,
       *   description: string,
       *   status: "AVAILABLE" | "OCCUPIED" | "MAINTENANCE",
       *   floorNumber?: number,
       *   maxOccupancy: number,
       *   unitFeatureTags: string[],
       *   targetPrice: number,
       *   isNegotiable: boolean,
       *   isListed: boolean,
       *   unitLeaseRules: string[],
       *   propertyId: string
       * }
       */
      const payload = {
        ...unit,
        propertyId,
        // Images will be uploaded separately
        images: undefined
      };

      // Create unit record in database
      const response = await axios.post(
        "http://localhost:4000/api/landlord/unit/add-unit",
        payload,
        { withCredentials: true }
      );

      const { unitId, message } = response.data;

      if (!unitId) {
        throw new Error(message || "Unit creation failed. No unit ID returned.");
      }

      // Upload images if any
      if (unit.images.length > 0) {
        const imageUrls = await uploadImages(unitId, unit.images);

        // Update unit with image URLs
        await axios.patch(
          `http://localhost:4000/api/landlord/unit/${unitId}/update-images`,
          {
            propertyId,
            unitImageUrls: imageUrls,
          },
          { withCredentials: true }
        );
      }

      // Success handling
      setSuccessMessage("Unit created successfully!");
      setTimeout(() => navigate(`/landlord/property/${propertyId}/details`), 2000);
    } catch (error: any) {
      console.error("❌ Error creating unit:", error);
      setErrors(prev => ({
        ...prev,
        general: error.response?.data?.message || error.message || "Unexpected error while creating unit"
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
        Add New Unit
      </h2>
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          {successMessage}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded">
            {errors.general}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Label *
            </label>
            <input
              type="text"
              value={unit.label}
              onChange={(e) => handleInputChange("label", e.target.value)}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.label ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., Room A, Unit 201"
            />
            {errors.label && (
              <p className="text-red-500 text-sm mt-1">{errors.label}</p>
            )}
          </div>
          
          
          
          
          {/* Floor Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Floor Number
            </label>
            <input
              type="number"
              value={unit.floorNumber || ""}
              onChange={(e) => handleInputChange(
                "floorNumber",
                e.target.value ? parseInt(e.target.value) : undefined
              )}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g., 2"
              min="0"
            />
          </div>
          
          {/* Max Occupancy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Occupancy *
            </label>
            <input
              type="number"
              value={unit.maxOccupancy}
              min="1"
              onChange={(e) => handleInputChange(
                "maxOccupancy",
                parseInt(e.target.value)
              )}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.maxOccupancy ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.maxOccupancy && (
              <p className="text-red-500 text-sm mt-1">{errors.maxOccupancy}</p>
            )}
          </div>
          
          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Target Price (₱) *
            </label>
            <input
              type="number"
              value={unit.targetPrice}
              min="0"
              step="100"
              onChange={(e) => handleInputChange(
                "targetPrice",
                parseFloat(e.target.value)
              )}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.targetPrice ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.targetPrice && (
              <p className="text-red-500 text-sm mt-1">{errors.targetPrice}</p>
            )}
          </div>
          
          {/* Negotiable */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="negotiable"
              checked={unit.isNegotiable}
              onChange={(e) => handleInputChange("isNegotiable", e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="negotiable"
              className="ml-2 block text-sm text-gray-700"
            >
              Price negotiable
            </label>
          </div>
        </div>
        
        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={unit.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Describe the unit features, size, etc."
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Feature Tags */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Features (1 word each, max 15)
            </label>
            
            {errors.featureTags && (
              <p className="text-red-500 text-sm mb-2">{errors.featureTags}</p>
            )}
            
            <div className="flex flex-wrap gap-2 mb-2">
              {unit.unitFeatureTags.map((tag, tagIndex) => (
                <span
                  key={tagIndex}
                  className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center text-xs"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleFeatureTag("remove", tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <FaTimes size={10} />
                  </button>
                </span>
              ))}
            </div>
            
            {unit.unitFeatureTags.length < 15 && (
              <div className="flex">
                <input
                  type="text"
                  value={featureTagInput}
                  onChange={(e) => setFeatureTagInput(e.target.value)}
                  className="flex-1 px-3 py-1 border border-gray-300 rounded-l-md text-sm"
                  placeholder="Add feature (e.g., WiFi, AC)"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleFeatureTag("add");
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleFeatureTag("add")}
                  className="bg-blue-600 text-white px-3 py-1 rounded-r-md hover:bg-blue-700 text-sm"
                >
                  Add
                </button>
              </div>
            )}
          </div>
          
          {/* Lease Rules */}
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lease Rules (max 10 rules, 20 words each)
            </label>
            
            {errors.leaseRules && (
              <p className="text-red-500 text-sm mb-2">{errors.leaseRules}</p>
            )}
            
            <div className="space-y-1 mb-2 max-h-40 overflow-y-auto">
              {unit.unitLeaseRules.map((rule, ruleIndex) => (
                <div key={ruleIndex} className="flex justify-between items-center bg-gray-50 px-2 py-1 rounded text-sm">
                  <span className="truncate">{rule}</span>
                  <button
                    type="button"
                    onClick={() => removeLeaseRule(ruleIndex)}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              ))}
            </div>
            
            {unit.unitLeaseRules.length < 10 && (
              <div className="flex">
                <textarea
                  value={leaseRuleInput}
                  onChange={(e) => setLeaseRuleInput(e.target.value)}
                  rows={2}
                  className="flex-1 px-2 py-1 border border-gray-300 rounded-l-md text-sm"
                  placeholder="Add lease rule"
                />
                <button
                  type="button"
                  onClick={addLeaseRule}
                  className="bg-green-600 text-white px-3 py-1 rounded-r-md hover:bg-green-700 text-sm"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Image Upload */}
        <div className="border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Images (max 3)
          </label>
          
          {errors.images && (
            <p className="text-red-500 text-sm mb-2">{errors.images}</p>
          )}
          
          <div className="flex flex-wrap gap-4 mb-3">
            {unit.images.map((image, imgIndex) => (
              <div key={imgIndex} className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${imgIndex + 1}`}
                  className="w-20 h-20 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(imgIndex)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                >
                  <FaTimes size={10} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="flex items-center">
            <label className="flex items-center px-3 py-1 bg-gray-200 text-gray-700 rounded-l cursor-pointer hover:bg-gray-300 text-sm">
              <FaUpload className="mr-1" />
              Select Images
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            <span className="ml-2 text-sm text-gray-500">
              {unit.images.length} / 3 images selected
            </span>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-2 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-md hover:from-teal-700 hover:to-blue-700 disabled:opacity-75 transition-all"
          >
            {loading ? (
              "Saving Unit..."
            ) : (
              <>
                <FaCheck className="mr-2" />
                Save Unit
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUnit;
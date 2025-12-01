import React, { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Home,
  Upload,
  DollarSign,
  Shield,
  X,

  Loader,
  Edit,
  Plus,
  Trash2,
  Camera,
  Star,
  Info,
  ExternalLink,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { getAmenitiesRequest } from "@/api/landlord/propertyApi";
import { getUnitDetailsRequest, updateUnitRequest } from "@/api/landlord/unitApi";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Lease rule categories
const leaseRuleCategories = [
  { id: "general", name: "General Policies" },
  { id: "visitor", name: "Visitor Policies" },
  { id: "payment", name: "Payment Policies" },
  { id: "maintenance", name: "Maintenance Policies" },
  { id: "safety", name: "Safety Policies" },
  { id: "noise", name: "Noise Policies" },
  { id: "pet", name: "Pet Policies" },
  { id: "cleaning", name: "Cleaning Policies" },
  { id: "parking", name: "Parking Policies" },
  { id: "other", name: "Other Policies" },
];

type LeaseRule = {
  id: string;
  text: string;
  category: string;
};

type Amenity = {
  id: string;
  name: string;
  category: string;
};

// Unit data types matching DisplaySpecificUnit
interface UnitLeaseRule {
  text: string;
  category: string;
}

interface Unit {
  id: string;
  label: string;
  description: string;
  floorNumber: number;
  maxOccupancy: number;
  targetPrice: number;
  mainImageUrl: string;
  otherImages: string[];
  unitLeaseRules: UnitLeaseRule[] | null;
  requiresScreening: boolean;
  amenities: Amenity[] | null;
  willAffectListing?: boolean;
  latestListing?: {
    id: string;
    lifecycleStatus: string;
    flaggedReason?: string | null;
  } | null;
}

const EditUnit = () => {
  const { propertyId, unitId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const otherImagesInputRef = useRef<HTMLInputElement>(null);

  // State for amenities
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [isLoadingAmenities, setIsLoadingAmenities] = useState(true);
  const [amenitiesError, setAmenitiesError] = useState<string | null>(null);

  // Loading state for unit data
  const [loadingUnit, setLoadingUnit] = useState(true);
  const [unitError, setUnitError] = useState<string | null>(null);
  const [unitData, setUnitData] = useState<Unit | null>(null);
  const [willAffectListing, setWillAffectListing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    label: "",
    description: "",
    floorNumber: "",
    maxOccupancy: 1,
    amenities: [] as string[],
    mainImage: null as File | null,
    mainImagePreview: "",
    otherImages: [] as File[],
    otherImagesPreviews: [] as string[],
    existingMainImageUrl: "",
    existingOtherImageUrls: [] as string[],
    targetPrice: "",
    leaseRules: [] as LeaseRule[],
    newLeaseRule: "",
    newLeaseRuleCategory: "general",
    requiresScreening: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  // Fetch unit data and populate form
  useEffect(() => {
    const fetchUnitData = async () => {
      if (!unitId) {
        setUnitError("Unit ID is missing");
        setLoadingUnit(false);
        return;
      }

      try {
        setLoadingUnit(true);
        setUnitError(null);
        const response = await getUnitDetailsRequest(unitId);
        const unit: Unit = response.data;

        // Store unit data and willAffectListing flag
        setUnitData(unit);
        setWillAffectListing(unit.willAffectListing || false);

        // Populate form with existing unit data
        setFormData({
          label: unit.label || "",
          description: unit.description || "",
          floorNumber: unit.floorNumber?.toString() || "",
          maxOccupancy: unit.maxOccupancy || 1,
          amenities: unit.amenities?.map((a) => a.id) || [],
          mainImage: null,
          mainImagePreview: unit.mainImageUrl || "",
          otherImages: [],
          otherImagesPreviews: unit.otherImages || [],
          existingMainImageUrl: unit.mainImageUrl || "",
          existingOtherImageUrls: unit.otherImages || [],
          targetPrice: unit.targetPrice?.toString() || "",
          leaseRules:
            unit.unitLeaseRules?.map((rule, index) => ({
              id: `existing-${index}`,
              text: rule.text,
              category: rule.category,
            })) || [],
          newLeaseRule: "",
          newLeaseRuleCategory: "general",
          requiresScreening: unit.requiresScreening || false,
        });
      } catch (err: any) {
        console.error("Error fetching unit data:", err);
        setUnitError(
          err.response?.data?.message || "Failed to load unit data. Please try again."
        );
        toast.error("Failed to load unit data");
      } finally {
        setLoadingUnit(false);
      }
    };

    fetchUnitData();
  }, [unitId]);

  // Fetch amenities from API
  useEffect(() => {
    const controller = new AbortController();

    const fetchAmenities = async () => {
      try {
        setIsLoadingAmenities(true);
        setAmenitiesError(null);
        const res = await getAmenitiesRequest({ signal: controller.signal });
        setAmenities(res.data);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch amenities:", err);
          setAmenitiesError("Failed to load amenities. Please try again.");
          toast.error("Failed to load amenities");
        }
      } finally {
        setIsLoadingAmenities(false);
      }
    };

    fetchAmenities();
    return () => controller.abort();
  }, []);

  // Group amenities by category
  const groupedAmenities = amenities.reduce((acc, amenity) => {
    if (!acc[amenity.category]) {
      acc[amenity.category] = [];
    }
    acc[amenity.category].push(amenity);
    return acc;
  }, {} as Record<string, Amenity[]>);

  // Group lease rules by category
  const groupedLeaseRules = formData.leaseRules.reduce((acc, rule) => {
    if (!acc[rule.category]) {
      acc[rule.category] = [];
    }
    acc[rule.category].push(rule);
    return acc;
  }, {} as Record<string, LeaseRule[]>);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleAmenityChange = (amenityId: string) => {
    setFormData((prev) => {
      const amenities = prev.amenities.includes(amenityId)
        ? prev.amenities.filter((id) => id !== amenityId)
        : [...prev.amenities, amenityId];
      return { ...prev, amenities };
    });
  };

  // Handle main image selection
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setFormData((prev) => ({
          ...prev,
          mainImage: file,
          mainImagePreview: URL.createObjectURL(file),
        }));
      } else {
        toast.error("Please select a valid image file");
      }
    }
  };

  // Handle additional images selection
  const handleOtherImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    // Calculate total: existing URLs + new files already added + new files being added
    const totalImages = formData.existingOtherImageUrls.length + formData.otherImages.length + imageFiles.length;
    if (totalImages > 6) {
      toast.error("You can only have exactly 6 additional images");
      return;
    }

    const newImages = [...formData.otherImages, ...imageFiles];
    const newPreviews = [
      ...formData.otherImagesPreviews,
      ...imageFiles.map((file) => URL.createObjectURL(file)),
    ];

    setFormData((prev) => ({
      ...prev,
      otherImages: newImages,
      otherImagesPreviews: newPreviews,
    }));

    if (otherImagesInputRef.current) {
      otherImagesInputRef.current.value = "";
    }
  };

  const removeOtherImage = (index: number) => {
    // Check if it's an existing image (from URLs) or a new file
    const isExistingImage = index < formData.existingOtherImageUrls.length;
    
    if (isExistingImage) {
      // Remove from existing URLs - need to remove from both arrays at the same index
      setFormData((prev) => ({
        ...prev,
        existingOtherImageUrls: prev.existingOtherImageUrls.filter((_, i) => i !== index),
        otherImagesPreviews: prev.otherImagesPreviews.filter((_, i) => i !== index),
      }));
    } else {
      // Remove from new files - adjust index to account for existing images
      const adjustedIndex = index - formData.existingOtherImageUrls.length;
      setFormData((prev) => {
        const newOtherImages = prev.otherImages.filter((_, i) => i !== adjustedIndex);
        // Remove the preview at the current index (which is after existing images)
        const newPreviews = prev.otherImagesPreviews.filter((_, i) => i !== index);
        return {
          ...prev,
          otherImages: newOtherImages,
          otherImagesPreviews: newPreviews,
        };
      });
    }
  };

  const addLeaseRule = () => {
    if (formData.newLeaseRule.trim() && formData.leaseRules.length < 10) {
      const wordCount = formData.newLeaseRule.trim().split(/\s+/).length;
      if (wordCount <= 7) {
        const newRule: LeaseRule = {
          id: Date.now().toString(),
          text: formData.newLeaseRule.trim(),
          category: formData.newLeaseRuleCategory,
        };
        setFormData((prev) => ({
          ...prev,
          leaseRules: [...prev.leaseRules, newRule],
          newLeaseRule: "",
        }));
      } else {
        toast.error("Lease rule must be 7 words or less");
      }
    }
  };

  const removeLeaseRule = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      leaseRules: prev.leaseRules.filter((rule) => rule.id !== id),
    }));
  };

  const getWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  const validateForm = (): boolean => {
    if (!formData.label.trim()) {
      toast.error("Please provide a unit label/name");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Please provide a description");
      return false;
    }
    if (formData.label.length > 50) {
      toast.error("Unit label must be 50 characters or less");
      return false;
    }
    if (getWordCount(formData.description) > 30) {
      toast.error("Description must be 30 words or less");
      return false;
    }
    const hasMainImage = formData.mainImagePreview || formData.existingMainImageUrl;
    if (!hasMainImage) {
      toast.error("Please upload a main image for the unit");
      return false;
    }
    const totalOtherImages = formData.otherImagesPreviews.length;
    if (totalOtherImages !== 6) {
      toast.error("Please ensure you have exactly 6 additional images");
      return false;
    }
    const price = parseFloat(formData.targetPrice);
    if (!formData.targetPrice || price <= 0 || price > 100000) {
      toast.error("Monthly rent must be between ₱1 and ₱100,000");
      return false;
    }
    if (
      formData.leaseRules.some((rule) => rule.text.split(/\s+/).length > 7)
    ) {
      toast.error("All lease rules must be 7 words or less");
      return false;
    }
    return true;
  };

  // Function to upload image to Supabase
  const uploadImageToSupabase = async (
    file: File,
    unitId: string,
    fileName: string
  ): Promise<string> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fullFileName = `${fileName}.${fileExt}`;
      const filePath = `unit_images/${unitId}/${fullFileName}`;

      const { error } = await supabase.storage
        .from("rentease-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true, // Allow overwriting
        });

      if (error) {
        throw error;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("rentease-images").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading image to Supabase:", error);
      throw new Error(`Failed to upload image: ${error}`);
    }
  };

  // Function to delete image from Supabase
  const deleteImageFromSupabase = async (imageUrl: string): Promise<void> => {
    try {
      // Extract the file path from the URL
      const urlParts = imageUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `unit_images/${unitId}/${fileName}`;

      const { error } = await supabase.storage
        .from("rentease-images")
        .remove([filePath]);

      if (error) {
        console.error("Error deleting image:", error);
        // Don't throw - continue even if deletion fails
      }
    } catch (error) {
      console.error("Error in deleteImageFromSupabase:", error);
      // Don't throw - continue even if deletion fails
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!propertyId || !unitId) {
      toast.error("Invalid property or unit ID");
      return;
    }

    // Show confirmation dialog if editing will affect listing status
    if (willAffectListing) {
      setShowConfirmDialog(true);
      return;
    }

    // Proceed with submission
    await submitForm();
  };

  const submitForm = async () => {
    if (!propertyId || !unitId) {
      toast.error("Invalid property or unit ID");
      return;
    }

    setIsSubmitting(true);
    setImageUploading(true);

    try {
      let mainImageUrl = formData.existingMainImageUrl;
      const otherImageUrls: string[] = [];

      // Handle main image
      if (formData.mainImage) {
        // Delete old main image if it exists
        if (formData.existingMainImageUrl) {
          await deleteImageFromSupabase(formData.existingMainImageUrl);
        }
        // Upload new main image
        mainImageUrl = await uploadImageToSupabase(
          formData.mainImage,
          unitId,
          "main"
        );
      }

      // Handle other images
      // Find which existing images are still present (their URLs are in the previews)
      const remainingExistingImages = formData.otherImagesPreviews.filter((preview) =>
        formData.existingOtherImageUrls.includes(preview)
      );

      // Find removed existing images
      const removedExistingImages = formData.existingOtherImageUrls.filter(
        (url) => !remainingExistingImages.includes(url)
      );

      // Delete removed existing images
      for (const removedUrl of removedExistingImages) {
        await deleteImageFromSupabase(removedUrl);
      }

      // Upload all new images (all items in formData.otherImages are new)
      for (let i = 0; i < formData.otherImages.length; i++) {
        const imageUrl = await uploadImageToSupabase(
          formData.otherImages[i],
          unitId,
          `image_${Date.now()}_${i + 1}`
        );
        otherImageUrls.push(imageUrl);
      }

      // Combine remaining existing images with new images
      const finalOtherImages = [
        ...remainingExistingImages,
        ...otherImageUrls,
      ].slice(0, 6); // Ensure max 6 images

      setImageUploading(false);

      // Prepare update data
      const updateData = {
        label: formData.label.trim(),
        description: formData.description.trim(),
        floorNumber: formData.floorNumber ? parseInt(formData.floorNumber) : null,
        maxOccupancy: formData.maxOccupancy,
        amenities: formData.amenities,
        mainImageUrl: mainImageUrl || null,
        otherImages: finalOtherImages.length > 0 ? finalOtherImages : null,
        unitLeaseRules:
          formData.leaseRules.length > 0
            ? formData.leaseRules.map((rule) => ({
                text: rule.text,
                category: rule.category,
              }))
            : null,
        targetPrice: parseFloat(formData.targetPrice),
        requiresScreening: formData.requiresScreening,
      };

      // Update unit via API
      await updateUnitRequest(unitId, updateData);

      toast.success("Unit updated successfully!");
      navigate(`/landlord/units/${propertyId}/${unitId}`);
    } catch (error: any) {
      console.error("Error updating unit:", error);
      setImageUploading(false);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to update unit. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state with Skeleton
  if (loadingUnit) {
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
            {[1, 2, 3, 4, 5].map((i) => (
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

  // Error state
  if (unitError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-red-600 text-2xl">!</span>
          </div>
          <p className="text-red-600 text-lg mb-4">{unitError}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
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
                  <h1 className="text-2xl font-bold text-gray-900">Edit Unit</h1>
                  <p className="text-sm text-gray-600">Update your unit information</p>
                </div>
              </div>
              <Link to={`/landlord/units/${propertyId}/${unitId}`}>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Unit Basics */}
          <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5 text-blue-600" />
                Unit Basics
              </CardTitle>
              <CardDescription>Basic information about your unit</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    Unit Label/Name *
                    <Info className="h-4 w-4 text-gray-400" />
                  </label>
                  <Input
                    name="label"
                    value={formData.label}
                    onChange={handleInputChange}
                    placeholder="e.g., Unit 3A, Studio B, Garden Suite"
                    maxLength={50}
                    required
                    className="h-10"
                  />
                  <p className="text-xs text-gray-500">
                    {formData.label.length}/50 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    Floor Number
                    <Info className="h-4 w-4 text-gray-400" />
                  </label>
                  <Input
                    name="floorNumber"
                    type="number"
                    min="0"
                    max="200"
                    value={formData.floorNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., 3 (leave blank for single-level)"
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  Description *
                  <Info className="h-4 w-4 text-gray-400" />
                </label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what makes your unit special..."
                  rows={5}
                  required
                  className="resize-none"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{getWordCount(formData.description)}/30 words</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-emerald-600" />
                Features & Amenities
              </CardTitle>
              <CardDescription>Select amenities available in your unit</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoadingAmenities ? (
                <div className="flex items-center justify-center py-12">
                  <Loader className="h-8 w-8 animate-spin text-emerald-600 mr-3" />
                  <span className="text-gray-600">Loading amenities...</span>
                </div>
              ) : amenitiesError ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-red-600 mb-2">{amenitiesError}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(groupedAmenities).map(
                    ([category, categoryAmenities]) => (
                      <div
                        key={category}
                        className="border-2 border-gray-100 rounded-xl p-5 bg-white hover:border-emerald-200 transition-colors"
                      >
                        <h3 className="font-semibold text-gray-900 text-lg mb-4 pb-2 border-b">
                          {category}
                        </h3>
                        <div className="space-y-3">
                          {categoryAmenities.map((amenity) => (
                            <div
                              key={amenity.id}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <input
                                type="checkbox"
                                id={`amenity-${amenity.id}`}
                                checked={formData.amenities.includes(amenity.id)}
                                onChange={() => handleAmenityChange(amenity.id)}
                                className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                              />
                              <label
                                htmlFor={`amenity-${amenity.id}`}
                                className="text-sm text-gray-700 flex-1 cursor-pointer"
                              >
                                {amenity.name}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
              <div className="mt-6 bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <p className="text-sm text-emerald-700">
                  <strong>{formData.amenities.length} amenities</strong> selected out of {amenities.length} available
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Photos */}
          <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-purple-600" />
                Photos
              </CardTitle>
              <CardDescription>Upload images to showcase your unit</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Main Image */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">
                  Cover Photo *
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleMainImageChange}
                  accept="image/*"
                  className="hidden"
                />
                {!formData.mainImagePreview ? (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-purple-400 transition-colors bg-gray-50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="font-semibold text-gray-900 mb-2">Add a Cover Photo</h4>
                    <p className="text-gray-600 mb-4">Choose your best photo</p>
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Cover Photo
                    </Button>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-4 border-2 border-purple-200">
                    <div className="flex items-center gap-4">
                      <img
                        src={formData.mainImagePreview}
                        alt="Main preview"
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {formData.mainImage ? "New Cover Photo Selected" : "Current Cover Photo"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formData.mainImage?.name || "Existing image"}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            mainImage: null,
                            mainImagePreview: prev.existingMainImageUrl,
                          }))
                        }
                      >
                        {formData.mainImage ? "Revert" : "Change Photo"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Images */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">
                  Additional Photos (6 required) *
                </label>
                <input
                  type="file"
                  ref={otherImagesInputRef}
                  onChange={handleOtherImagesChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.otherImagesPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Additional ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                        onClick={() => removeOtherImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        {index + 1}
                      </div>
                      {index < formData.existingOtherImageUrls.length && (
                        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Existing
                        </div>
                      )}
                    </div>
                  ))}

                  {Array.from({
                    length: 6 - formData.otherImagesPreviews.length,
                  }).map((_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center cursor-pointer hover:border-purple-400 transition-colors bg-gray-50"
                      onClick={() => otherImagesInputRef.current?.click()}
                    >
                      <Plus className="h-8 w-8 text-gray-400" />
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => otherImagesInputRef.current?.click()}
                  disabled={formData.otherImagesPreviews.length >= 6}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Add More Photos ({formData.otherImagesPreviews.length}/6)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Occupancy */}
          <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-600" />
                Pricing & Occupancy
              </CardTitle>
              <CardDescription>Set your rental price and occupancy details</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700">
                    Monthly Rent (₱) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      ₱
                    </span>
                    <Input
                      name="targetPrice"
                      type="number"
                      min="1"
                      max="100000"
                      value={formData.targetPrice}
                      onChange={handleInputChange}
                      placeholder="15000"
                      required
                      className="h-10 pl-8"
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Competitive range: ₱8,000 - ₱25,000 for similar units
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700">
                    Maximum Occupancy *
                  </label>
                  <Input
                    name="maxOccupancy"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.maxOccupancy}
                    onChange={handleInputChange}
                    required
                    className="h-10 text-center"
                  />
                  <p className="text-xs text-gray-500 text-center">
                    {formData.maxOccupancy} {formData.maxOccupancy === 1 ? "person" : "people"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 p-4 border-2 border-amber-200 rounded-xl bg-white">
                <input
                  type="checkbox"
                  id="requiresScreening"
                  name="requiresScreening"
                  checked={formData.requiresScreening}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <div>
                  <label
                    htmlFor="requiresScreening"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    Require tenant screening
                  </label>
                  <p className="text-xs text-gray-500">
                    This will be shown to the tenant
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lease Rules */}
          <Card className="shadow-md">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                House Rules
              </CardTitle>
              <CardDescription>Set clear expectations for tenants</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Add Rules Section */}
              <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Rule Category
                    </label>
                    <select
                      value={formData.newLeaseRuleCategory}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          newLeaseRuleCategory: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500"
                    >
                      {leaseRuleCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Rule Text (7 words max)
                    </label>
                    <Input
                      value={formData.newLeaseRule}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          newLeaseRule: e.target.value,
                        }))
                      }
                      placeholder="e.g., No smoking inside the unit"
                      onKeyPress={(e) =>
                        e.key === "Enter" &&
                        (e.preventDefault(), addLeaseRule())
                      }
                      className="h-10"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        {formData.newLeaseRule.split(/\s+/).filter((w) => w).length}/7 words
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={addLeaseRule}
                  disabled={
                    formData.leaseRules.length >= 10 ||
                    !formData.newLeaseRule.trim()
                  }
                  className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule ({formData.leaseRules.length}/10)
                </Button>
              </div>

              {/* Rules Display */}
              {formData.leaseRules.length > 0 && (
                <div className="bg-white rounded-xl p-6 border-2 border-indigo-200">
                  <h3 className="font-semibold text-gray-900 text-lg mb-4">
                    Your House Rules ({formData.leaseRules.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {leaseRuleCategories.map((category) => {
                      const categoryRules = groupedLeaseRules[category.id] || [];
                      if (categoryRules.length === 0) return null;

                      return (
                        <div
                          key={category.id}
                          className="border-2 border-gray-100 rounded-xl p-4 bg-gray-50"
                        >
                          <h4 className="font-medium text-gray-900 text-sm mb-3 pb-2 border-b">
                            {category.name}
                          </h4>
                          <div className="space-y-2">
                            {categoryRules.map((rule) => (
                              <div
                                key={rule.id}
                                className="flex justify-between items-center text-sm bg-white rounded-lg px-3 py-2 border"
                              >
                                <span className="text-gray-700 flex-1">
                                  {rule.text}
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => removeLeaseRule(rule.id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t">
            <Link to={`/landlord/units/${propertyId}/${unitId}`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting || imageUploading}
              className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 gap-2"
            >
              {isSubmitting || imageUploading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  {imageUploading ? "Uploading Images..." : "Updating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Confirmation Dialog for Listing Status Change */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent className="max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
                <Info className="h-5 w-5" />
                {unitData?.latestListing?.lifecycleStatus === "FLAGGED"
                  ? "Listing Flagged - Edit Required"
                  : "Warning: Listing Status Will Change"}
              </AlertDialogTitle>
              <AlertDialogDescription className="pt-4 space-y-4">
                {unitData?.latestListing?.lifecycleStatus === "FLAGGED" ? (
                  // FLAGGED Status - Less verbose, show flag reason
                  <>
                    <div className="space-y-3">
                      <p className="text-base text-gray-700">
                        Your listing has been <strong className="text-amber-700">FLAGGED</strong> and requires modification.
                      </p>
                      {unitData?.latestListing?.flaggedReason && (
                        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                          <p className="text-sm text-amber-800 font-semibold mb-2">
                            Flag Reason:
                          </p>
                          <p className="text-sm text-amber-900">
                            {unitData.latestListing.flaggedReason}
                          </p>
                        </div>
                      )}
                      <p className="text-base text-gray-700">
                        By clicking <strong>"Save Changes"</strong>, your listing status will be
                        reset to <strong className="text-purple-700">WAITING_REVIEW</strong>.
                        Please address the flag reason above when making your edits.
                      </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-blue-800 font-semibold mb-2">
                            Need More Information?
                          </p>
                          <p className="text-sm text-blue-700 mb-3">
                            Review our policy guidelines to understand what content is allowed.
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              window.open("/privacy-policy", "_blank");
                            }}
                            className="bg-white hover:bg-blue-50 border-blue-300 text-blue-700"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Policy Guidelines
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // VISIBLE/HIDDEN Status - Detailed warning
                  <>
                    <div className="space-y-3">
                      <p className="text-base text-gray-700">
                        Your unit currently has a listing with status{" "}
                        <strong className={
                          unitData?.latestListing?.lifecycleStatus === "VISIBLE"
                            ? "text-emerald-700"
                            : "text-teal-700"
                        }>
                          {unitData?.latestListing?.lifecycleStatus === "VISIBLE"
                            ? "VISIBLE (Active and visible to tenants)"
                            : "HIDDEN (Active but hidden from public search)"}
                        </strong>
                        .
                      </p>
                      <p className="text-base text-gray-700">
                        By clicking <strong>"Save Changes"</strong>, the listing status will be
                        reset to <strong className="text-purple-700">WAITING_REVIEW</strong>.
                        This means your listing will need to be reviewed by an admin
                        again before it can be visible to tenants.
                      </p>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                      <p className="text-sm text-red-800 font-semibold mb-2">
                        ⚠️ Why This Happens:
                      </p>
                      <p className="text-sm text-red-700">
                        This action ensures that all new information submitted complies with our
                        website terms and community guidelines. Any changes to unit details,
                        descriptions, images, or lease rules must be reviewed to prevent
                        violations such as discriminatory content, fake information, or
                        inappropriate material.
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-blue-800 font-semibold mb-2">
                            Need More Information?
                          </p>
                          <p className="text-sm text-blue-700 mb-3">
                            Review our policy guidelines to understand what content is allowed
                            and ensure your listing complies with our terms of service.
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              window.open("/privacy-policy", "_blank");
                            }}
                            className="bg-white hover:bg-blue-50 border-blue-300 text-blue-700"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Policy Guidelines
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-sm text-amber-800">
                        <strong>Note:</strong> If your unit is already being leased
                        and you set it to HIDDEN to avoid new inquiries, editing
                        the unit will require admin review again. Your listing will
                        go back from its current status to WAITING_REVIEW.
                      </p>
                    </div>
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setShowConfirmDialog(false);
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowConfirmDialog(false);
                  submitForm();
                }}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Continue Editing
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default EditUnit;

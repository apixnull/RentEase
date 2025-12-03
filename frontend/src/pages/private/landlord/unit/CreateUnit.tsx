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
import {
  ArrowLeft,
  Home,
  Upload,
  DollarSign,
  Shield,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  X,
  Image as ImageIcon,
  Loader,
  Zap,
  Plus,
  Trash2,
  Camera,
  Star,
  Lightbulb,
  Info,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { getAmenitiesRequest } from "@/api/landlord/propertyApi";
import { supabase } from "@/lib/supabaseClient";
import { privateApi } from "@/api/axios";
import { createUnitRequest } from "@/api/landlord/unitApi";
import { motion } from "framer-motion";

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

const CreateUnit = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const otherImagesInputRef = useRef<HTMLInputElement>(null);

  // State for amenities
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [isLoadingAmenities, setIsLoadingAmenities] = useState(true);
  const [amenitiesError, setAmenitiesError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    label: "",
    description: "",
    floorNumber: "",
    maxOccupancy: 1,
    amenities: [] as string[],
    mainImage: null as File | null,
    mainImagePreview: "",
    mainImageUrl: "",
    otherImages: [] as File[],
    otherImagesPreviews: [] as string[],
    otherImageUrls: [] as string[],
    targetPrice: "",
    leaseRules: [] as LeaseRule[],
    newLeaseRule: "",
    newLeaseRuleCategory: "general",
    requiresScreening: false,
  });

  const [imageInputMode, setImageInputMode] = useState<"file" | "url">("file");

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Steps configuration
  const steps = [
    {
      id: 1,
      title: "Unit Basics",
      description: "Tell us about your unit",
      icon: Home,
      guideline:
        "Choose a clear, descriptive name that helps tenants identify your unit",
    },
    {
      id: 2,
      title: "Features & Amenities",
      description: "What makes your unit special",
      icon: Star,
      guideline: "Select amenities that match your target tenant's lifestyle",
    },
    {
      id: 3,
      title: "Photos",
      description: "Showcase your unit",
      icon: Camera,
      guideline: "High-quality photos increase booking chances by 40%",
    },
    {
      id: 4,
      title: "Pricing",
      description: "Set your rates",
      icon: DollarSign,
      guideline: "Competitive pricing helps you attract tenants faster",
    },
    {
      id: 5,
      title: "House Rules",
      description: "Set expectations",
      icon: Shield,
      guideline: "Clear rules prevent misunderstandings with tenants",
    },
  ];

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
          mainImageUrl: "",
        }));
      } else {
        toast.error("Please select a valid image file");
      }
    }
  };

  // Handle main image URL
  const handleMainImageUrlChange = (url: string) => {
    setFormData((prev) => {
      let preview = "";
      if (url.trim()) {
        try {
          new URL(url.trim());
          preview = url.trim();
        } catch {
          preview = "";
        }
      }
      return {
        ...prev,
        mainImageUrl: url,
        mainImage: null,
        mainImagePreview: preview,
      };
    });
  };

  // Handle image mode change
  const handleImageModeChange = (mode: "file" | "url") => {
    setImageInputMode(mode);
    setFormData((prev) => ({
      ...prev,
      mainImage: null,
      mainImagePreview: "",
      mainImageUrl: "",
      otherImages: [],
      otherImagesPreviews: [],
      otherImageUrls: [],
    }));
  };

  // Handle other image URLs
  const handleOtherImageUrlChange = (index: number, url: string) => {
    setFormData((prev) => {
      const newUrls = [...prev.otherImageUrls];
      const newPreviews = [...prev.otherImagesPreviews];
      
      // Ensure arrays are long enough
      while (newUrls.length <= index) {
        newUrls.push("");
        newPreviews.push("");
      }
      
      newUrls[index] = url;
      // Set preview to URL if valid, otherwise empty
      try {
        if (url.trim()) {
          new URL(url.trim());
          newPreviews[index] = url.trim();
        } else {
          newPreviews[index] = "";
        }
      } catch {
        newPreviews[index] = "";
      }
      
      return {
        ...prev,
        otherImageUrls: newUrls.slice(0, 6),
        otherImagesPreviews: newPreviews.slice(0, 6),
      };
    });
  };


  // Remove other image URL
  const removeOtherImageUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      otherImageUrls: prev.otherImageUrls.filter((_, i) => i !== index),
      otherImagesPreviews: prev.otherImagesPreviews.filter((_, i) => i !== index),
    }));
  };

  // Handle additional images selection
  const handleOtherImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    const totalImages = imageFiles.length + formData.otherImages.length;
    if (totalImages > 6) {
      toast.error("You can only upload exactly 6 additional images");
      return;
    }

    const newImages = [...formData.otherImages, ...imageFiles];
    const newPreviews = [
      ...formData.otherImagesPreviews,
      ...imageFiles.map((file) => URL.createObjectURL(file)),
    ];

    setFormData((prev) => ({
      ...prev,
      otherImages: newImages.slice(0, 6),
      otherImagesPreviews: newPreviews.slice(0, 6),
    }));

    if (otherImagesInputRef.current) {
      otherImagesInputRef.current.value = "";
    }
  };

  const removeOtherImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      otherImages: prev.otherImages.filter((_, i) => i !== index),
      otherImagesPreviews: prev.otherImagesPreviews.filter(
        (_, i) => i !== index
      ),
    }));
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

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
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
        return true;
      case 3:
        if (imageInputMode === "file") {
          if (!formData.mainImage) {
            toast.error("Please upload a main image for the unit");
            return false;
          }
          if (formData.otherImages.length !== 6) {
            toast.error("Please upload exactly 6 additional images");
            return false;
          }
        } else {
          if (!formData.mainImageUrl.trim()) {
            toast.error("Please enter a main image URL for the unit");
            return false;
          }
          if (formData.otherImageUrls.length !== 6 || formData.otherImageUrls.some(url => !url.trim())) {
            toast.error("Please enter exactly 6 additional image URLs");
            return false;
          }
        }
        return true;
      case 4:
        const price = parseFloat(formData.targetPrice);
        if (!formData.targetPrice || price <= 0 || price > 100000) {
          toast.error("Monthly rent must be between ₱1 and ₱100,000");
          return false;
        }
        return true;
      case 5:
        if (
          formData.leaseRules.some((rule) => rule.text.split(/\s+/).length > 7)
        ) {
          toast.error("All lease rules must be 7 words or less");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  // Function to generate UUID
  const generateUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };

  // Function to upload image (dual-mode: local for development, Supabase for production)
  const uploadImageToSupabase = async (
    file: File,
    unitId: string,
    fileName: string
  ): Promise<string> => {
    // Check if using local storage (development mode or explicit flag)
    const useLocalStorage =
      import.meta.env.VITE_USE_LOCAL_STORAGE === "true" ||
      import.meta.env.MODE === "development";

    if (useLocalStorage) {
      // Local storage mode: Upload to backend endpoint
      try {
        const formData = new FormData();
        formData.append("image", file);

        const response = await privateApi.post("/upload/unit-image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const mockUrl = response.data.url; // e.g., "/local-images/unit_images/uuid.jpg"

        // In development, prepend backend URL to make it accessible
        if (import.meta.env.MODE === "development") {
          const backendUrl = "http://localhost:5000";
          return `${backendUrl}${mockUrl}`;
        }

        // In production with local storage, return as-is
        return mockUrl;
      } catch (error: any) {
        console.error("Local upload error:", error);
        const errorMsg =
          error.response?.data?.error || "Failed to upload image to local storage";
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
    } else {
      // Supabase storage mode (production)
      try {
        const fileExt = file.name.split(".").pop();
        const fullFileName = `${fileName}.${fileExt}`;
        const filePath = `unit_images/${unitId}/${fullFileName}`;

        const { error } = await supabase.storage
          .from("rentease-images")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
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
    }
  };

  // Function to delete entire unit folder from Supabase (for rollback)
  const deleteUnitFolderFromSupabase = async (
    unitId: string
  ): Promise<void> => {
    try {
      const { data: files, error: listError } = await supabase.storage
        .from("rentease-images")
        .list(`unit_images/${unitId}`);

      if (listError) {
        console.error("Error listing files for deletion:", listError);
        return;
      }

      if (files && files.length > 0) {
        const filePaths = files.map(
          (file) => `unit_images/${unitId}/${file.name}`
        );

        const { error: deleteError } = await supabase.storage
          .from("rentease-images")
          .remove(filePaths);

        if (deleteError) {
          console.error("Error deleting files:", deleteError);
        } else {
          console.log(
            `Successfully deleted ${filePaths.length} files for unit ${unitId}`
          );
        }
      }
    } catch (error) {
      console.error("Error in deleteUnitFolderFromSupabase:", error);
    }
  };

  const handleFinalSubmit = async () => {
    if (!validateStep(5)) return;
    if (!propertyId) {
      toast.error("Invalid property ID");
      return;
    }

    setIsSubmitting(true);
    setImageUploading(true);

    // Generate the actual UUID that will be used for the unit
    const unitId = generateUUID();
    let uploadedImages = false;

    try {
      // First upload all images to Supabase using the actual unitId
      let mainImageUrl = "";
      let otherImageUrls: string[] = [];

      if (imageInputMode === "file") {
        // Upload main image
        if (formData.mainImage) {
          mainImageUrl = await uploadImageToSupabase(
            formData.mainImage,
            unitId,
            "main"
          );
        }

        // Upload other images
        if (formData.otherImages.length > 0) {
          for (let i = 0; i < formData.otherImages.length; i++) {
            const imageUrl = await uploadImageToSupabase(
              formData.otherImages[i],
              unitId,
              `image_${i + 1}`
            );
            otherImageUrls.push(imageUrl);
          }
        }
        uploadedImages = true;
      } else {
        // Use URLs directly
        mainImageUrl = formData.mainImageUrl.trim();
        otherImageUrls = formData.otherImageUrls.filter(url => url.trim());
        uploadedImages = false; // No files to rollback
      }

      // Prepare the complete unit data with image URLs and the unitId
      const completeUnitData = {
        id: unitId, // Send the actual UUID to backend
        label: formData.label.trim(),
        description: formData.description.trim(),
        status: "AVAILABLE" as const,
        floorNumber: formData.floorNumber
          ? parseInt(formData.floorNumber)
          : null,
        maxOccupancy: formData.maxOccupancy,
        amenities: formData.amenities,
        mainImageUrl: mainImageUrl,
        otherImages: otherImageUrls.length > 0 ? otherImageUrls : null,
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

      // Create unit with all data including image URLs and the actual unitId
      const response = await createUnitRequest(propertyId, completeUnitData);

      setImageUploading(false);
      toast.success(response.data.message || "Unit added successfully!");
      navigate(`/landlord/units/${propertyId}/${unitId}`);
    } catch (error: any) {
      console.error("Error creating unit:", error);

      // Rollback: Delete uploaded images if backend creation failed
      if (uploadedImages) {
        console.log("Rolling back: Deleting uploaded images...");
        await deleteUnitFolderFromSupabase(unitId);
      }

      setImageUploading(false);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to add unit. Please try again."
      );
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep === steps.length) {
      if (validateStep(currentStep)) {
        setShowConfirmation(true);
      }
    } else {
      nextStep();
    }
  };

  // removed legacy progress bar in favor of left step sidebar

  // Confirmation Dialog with transparent background
  const renderConfirmation = () => (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="p-6 max-w-md w-full shadow-2xl border-0">
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Confirm Unit Creation
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Review your details carefully. Once created, this unit will be saved
            under your property but not listed yet.
          </p>

          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => setShowConfirmation(false)}
              disabled={isSubmitting}
            >
              Review Details
            </Button>
            <Button
              onClick={handleFinalSubmit}
              disabled={isSubmitting || imageUploading}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {isSubmitting || imageUploading ? (
                <>
                  <Loader className="h-4 w-4 animate-spin mr-2" />
                  {imageUploading ? "Uploading Images..." : "Creating Unit..."}
                </>
              ) : (
                "Create Unit"
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  // Render step content with new color scheme
  const renderStepContent = () => {
    const currentStepData = steps.find((step) => step.id === currentStep);
    if (!currentStepData) return null;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Steps Sidebar */}
        <div className="hidden lg:block">
          <Card className="rounded-2xl border-gray-200 shadow-md bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="space-y-2">
                {steps.map((s) => (
                  <div
                    key={s.id}
                    className={`flex items-center gap-3 p-2 rounded-xl transition-all ${
                      currentStep === s.id
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                        : currentStep > s.id
                        ? "bg-gray-50 text-gray-600"
                        : "bg-gray-50 text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                        currentStep === s.id
                          ? "bg-emerald-500 text-white"
                          : currentStep > s.id
                          ? "bg-emerald-200 text-emerald-700"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {s.id}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {s.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - 2/4 width */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-r from-green-100 to-blue-100 text-green-600">
                  <currentStepData.icon className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    {currentStepData.title}
                  </CardTitle>
                  <CardDescription>
                    {currentStepData.description}
                  </CardDescription>
                  <p className="mt-1 text-xs text-emerald-700">
                    {currentStepData.guideline}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-4 p-4">
              {/* Step 1: Unit Basics */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
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
                        className="h-10 text-base"
                      />
                      <p className="text-xs text-gray-500">
                        {formData.label.length}/50 characters • Be specific and
                        clear
                      </p>
                    </div>

                    <div className="space-y-3">
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

                    <div className="space-y-3 md:col-span-2">
                      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        Description *
                        <Info className="h-4 w-4 text-gray-400" />
                      </label>
                      <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe what makes your unit special. Highlight unique features, recent renovations, or special amenities..."
                        rows={5}
                        required
                        className="resize-none"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>
                          {getWordCount(formData.description)}/30 words
                        </span>
                        <span>Focus on what tenants care about</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Amenities */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {isLoadingAmenities ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader className="h-8 w-8 animate-spin text-green-600 mr-3" />
                      <span className="text-gray-600 text-lg">
                        Loading amenities...
                      </span>
                    </div>
                  ) : amenitiesError ? (
                    <div className="text-center py-12 text-gray-500">
                      <Star className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-red-600 mb-2 text-lg">
                        {amenitiesError}
                      </p>
                      <p className="text-sm">Please try refreshing the page</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(groupedAmenities).map(
                          ([category, categoryAmenities]) => (
                            <div
                              key={category}
                              className="border-2 border-gray-100 rounded-xl p-5 bg-white hover:border-green-200 transition-colors"
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
                                      checked={formData.amenities.includes(
                                        amenity.id
                                      )}
                                      onChange={() =>
                                        handleAmenityChange(amenity.id)
                                      }
                                      className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
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

                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-5 border border-green-200">
                        <div className="flex items-center gap-3 mb-2">
                          <Lightbulb className="h-5 w-5 text-green-600" />
                          <h4 className="font-semibold text-green-900">
                            Selection Summary
                          </h4>
                        </div>
                        <p className="text-green-700 text-sm">
                          You've selected{" "}
                          <strong>{formData.amenities.length} amenities</strong>{" "}
                          out of {amenities.length} available. Units with more
                          amenities typically attract tenants faster.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 3: Photos */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  {/* Image Input Mode Toggle */}
                  <div className="flex items-center gap-3 mb-4">
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

                  {/* Main Image Section */}
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
                    <div className="flex items-center gap-3 mb-4">
                      <Camera className="h-6 w-6 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          Cover Photo
                        </h3>
                        <p className="text-gray-600 text-sm">
                          This is the first image tenants will see
                        </p>
                      </div>
                    </div>

                    {imageInputMode === "file" ? (
                      <>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleMainImageChange}
                          accept="image/*"
                          className="hidden"
                        />

                        {!formData.mainImagePreview ? (
                          <div
                            className="border-3 border-dashed border-green-300 rounded-xl p-12 text-center cursor-pointer hover:border-green-400 transition-colors bg-white"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Camera className="h-12 w-12 text-green-400 mx-auto mb-4" />
                            <h4 className="font-semibold text-gray-900 text-lg mb-2">
                              Add a Cover Photo
                            </h4>
                            <p className="text-gray-600">
                              Choose your best photo that shows the unit's main
                              feature
                            </p>
                            <Button className="mt-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Cover Photo
                            </Button>
                          </div>
                        ) : (
                          <div className="bg-white rounded-xl p-4 border-2 border-green-200">
                            <div className="flex items-center gap-4">
                              <img
                                src={formData.mainImagePreview}
                                alt="Main preview"
                                className="w-24 h-24 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">
                                  Cover Photo Selected
                                </p>
                                <p className="text-sm text-gray-500">
                                  {formData.mainImage?.name}
                                </p>
                              </div>
                              <Button
                                variant="outline"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    mainImage: null,
                                    mainImagePreview: "",
                                  }))
                                }
                              >
                                Change Photo
                              </Button>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="space-y-3">
                        <Input
                          type="url"
                          value={formData.mainImageUrl}
                          onChange={(e) => handleMainImageUrlChange(e.target.value)}
                          placeholder="https://example.com/image.jpg"
                          className="h-11 w-full"
                        />
                        <p className="text-xs text-gray-500">
                          Enter a direct link to an image (e.g., from Imgur, Cloudinary, or any image hosting service)
                        </p>
                        {formData.mainImagePreview && (
                          <div className="bg-white rounded-xl p-4 border-2 border-green-200">
                            <img
                              src={formData.mainImagePreview}
                              alt="Main preview"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Additional Images Section */}
                  <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-6 border border-blue-200">
                    <div className="flex items-center gap-3 mb-4">
                      <ImageIcon className="h-6 w-6 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          Additional Photos
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Show different angles and features (6 required)
                        </p>
                      </div>
                    </div>

                    {imageInputMode === "file" ? (
                      <>
                        <input
                          type="file"
                          ref={otherImagesInputRef}
                          onChange={handleOtherImagesChange}
                          accept="image/*"
                          multiple
                          className="hidden"
                        />

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
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
                            </div>
                          ))}

                          {Array.from({
                            length: 6 - formData.otherImages.length,
                          }).map((_, index) => (
                            <div
                              key={`empty-${index}`}
                              className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex items-center justify-center cursor-pointer hover:border-green-400 transition-colors bg-white"
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
                          disabled={formData.otherImages.length >= 6}
                          className="w-full"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Add More Photos ({formData.otherImages.length}/6)
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-700">
                                  Image {index + 1} URL
                                </label>
                                {formData.otherImageUrls[index] && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeOtherImageUrl(index)}
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                              <Input
                                type="url"
                                value={formData.otherImageUrls[index] || ""}
                                onChange={(e) => handleOtherImageUrlChange(index, e.target.value)}
                                placeholder={`https://example.com/image${index + 1}.jpg`}
                                className="h-10"
                              />
                              {formData.otherImagesPreviews[index] && (
                                <div className="mt-2">
                                  <img
                                    src={formData.otherImagesPreviews[index]}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">
                          Enter direct links to 6 images (e.g., from Imgur, Cloudinary, or any image hosting service)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Pricing */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pricing Section */}
                    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-5 border border-green-200">
                      <div className="flex items-center gap-3 mb-6">
                        <DollarSign className="h-6 w-6 text-green-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            Monthly Rent
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Set your monthly rental price
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
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
                              className="h-10 pl-8 text-base font-semibold"
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            Competitive range: ₱8,000 - ₱25,000 for similar
                            units
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Occupancy & Screening */}
                    <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl p-5 border border-blue-200">
                      <div className="flex items-center gap-3 mb-6">
                        <Users className="h-6 w-6 text-blue-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            Occupancy & Screening
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Set capacity and tenant requirements
                          </p>
                        </div>
                      </div>

                      <div className="space-y-6">
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
                            className="h-10 text-center text-base font-semibold"
                          />
                          <p className="text-xs text-gray-500 text-center">
                            {formData.maxOccupancy}{" "}
                            {formData.maxOccupancy === 1 ? "person" : "people"}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 p-4 border-2 border-blue-200 rounded-xl bg-white">
                          <input
                            type="checkbox"
                            id="requiresScreening"
                            name="requiresScreening"
                            checked={formData.requiresScreening}
                            onChange={handleInputChange}
                            className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <div>
                            <label
                              htmlFor="requiresScreening"
                              className="text-sm font-medium text-gray-700"
                            >
                              Require tenant screening
                            </label>
                            <p className="text-xs text-gray-500">
                              This will be shown to the tenant
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Lease Rules */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  {/* Add Rules Section */}
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-6 border border-green-200">
                    <div className="flex items-center gap-3 mb-6">
                      <Shield className="h-6 w-6 text-green-600" />
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          Add Lease Rules
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Set clear expectations for tenants
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
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
                          className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                        >
                          {leaseRuleCategories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-3">
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
                          className="h-12"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>
                            {
                              formData.newLeaseRule
                                .split(/\s+/)
                                .filter((w) => w).length
                            }
                            /7 words
                          </span>
                          <span>Keep it clear and concise</span>
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
                      className="w-full mt-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Rule ({formData.leaseRules.length}/10)
                    </Button>
                  </div>

                  {/* Rules Display */}
                  {formData.leaseRules.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 border-2 border-green-200">
                      <div className="flex items-center gap-3 mb-6">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            Your House Rules
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {formData.leaseRules.length} rules added
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {leaseRuleCategories.map((category) => {
                          const categoryRules =
                            groupedLeaseRules[category.id] || [];
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar - 1/4 width */}
        <div className="space-y-4 lg:col-span-1">
          {/* Advice / Guide */}
          <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-gray-900">Advice</h3>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed">
                {currentStepData.guideline}
              </p>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Progress
              </h4>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                  }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                Step {currentStep} of {steps.length}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                Quick Stats
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amenities</span>
                  <span className="font-semibold">
                    {formData.amenities.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Photos</span>
                  <span className="font-semibold">
                    {imageInputMode === "file"
                      ? formData.otherImages.length + (formData.mainImage ? 1 : 0)
                      : formData.otherImageUrls.filter(url => url.trim()).length + (formData.mainImageUrl.trim() ? 1 : 0)}
                    /7
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rules</span>
                  <span className="font-semibold">
                    {formData.leaseRules.length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.08),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.08),transparent_50%)]" />

      <div className="relative max-w-8xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Modern Creative Header */}
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-blue-400/20 rounded-full blur-xl" />
          <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-lg" />
          <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 via-emerald-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap className="w-7 h-7 text-white" fill="currentColor" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                      RentEase
                    </h1>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    Create Unit
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link to={`/landlord/units/${propertyId}`}>
                  <Button
                    variant="ghost"
                    className="group relative overflow-hidden bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-600 hover:text-red-700 rounded-xl border border-red-200 hover:border-red-300 h-11 px-4 sm:px-6 transition-all duration-300"
                    title="Back to Units"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <ArrowLeft className="w-4 h-4 sm:mr-2 relative z-10" />
                    <span className="relative z-10 font-medium hidden sm:inline">
                      Back to Units
                    </span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div>
          {renderStepContent()}
          <div className="flex items-center justify-between gap-4 pt-6 mt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="h-10 px-6 rounded-lg border-gray-300 disabled:opacity-50 text-sm"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={nextStep}
                className="h-10 px-6 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg transition-all duration-200 text-sm"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-10 px-6 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white shadow-lg transition-all duration-200 disabled:opacity-50 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  "Confirm Unit Creation"
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Confirmation Dialog */}
        {showConfirmation && renderConfirmation()}
      </div>
    </div>
  );
};

export default CreateUnit;

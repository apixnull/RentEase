import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/lib/supabaseClient";
import { Plus, X, Star, Upload, Home, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import axios from "axios";

const MAX_IMAGES = 5;
const MAX_FEATURES = 15;
const MAX_RULES = 15;

const AddProperty = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [formData, setFormData] = useState({
    id: uuidv4(),
    title: "",
    description: "",
    type: "",
    street: "",
    barangay: "",
    municipality: "",
    city: "",
    province: "",
    zipCode: "",
    amenityTags: [] as string[],
    propertyFeatures: [] as string[],
    leaseRules: [] as string[],
    propertyImageUrls: [] as string[],
    mainImageUrl: "",
    requiresScreening: false,
  });

  // UI state
  const [currentAmenity, setCurrentAmenity] = useState("");
  const [currentFeature, setCurrentFeature] = useState("");
  const [currentRule, setCurrentRule] = useState("");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // Cleanup image previews on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
    };
  }, [imagePreviews]);

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];

    files.slice(0, MAX_IMAGES - imageFiles.length).forEach((file) => {
      if (newFiles.length < MAX_IMAGES) {
        newFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }
    });

    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
    e.target.value = "";
  };

  // Handle image removal
  const removeImage = (index: number) => {
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];

    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);

    // Reset main image if removed
    if (formData.mainImageUrl === imagePreviews[index]) {
      setFormData((prev) => ({ ...prev, mainImageUrl: "" }));
    }

    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  // Set main image
  const setMainImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      mainImageUrl: imagePreviews[index],
    }));
  };

  // Add amenity (single word only)
  const addAmenity = () => {
    // Extract first word only
    const amenity = currentAmenity.trim().split(/\s+/)[0];

    if (amenity && !formData.amenityTags.includes(amenity)) {
      setFormData((prev) => ({
        ...prev,
        amenityTags: [...prev.amenityTags, amenity],
      }));
      setCurrentAmenity("");
    }
  };

  // Add feature - limited to 3 words
  const addFeature = () => {
    const trimmedFeature = currentFeature.trim();
    const words = trimmedFeature.split(/\s+/);

    if (words.length > 3) {
      toast.warning("Features should be 3 words or less");
      return;
    }

    if (trimmedFeature && formData.propertyFeatures.length < MAX_FEATURES) {
      setFormData((prev) => ({
        ...prev,
        propertyFeatures: [...prev.propertyFeatures, trimmedFeature],
      }));
      setCurrentFeature("");
    }
  };

  // Add rule
  const addRule = () => {
    if (currentRule.trim() && formData.leaseRules.length < MAX_RULES) {
      setFormData((prev) => ({
        ...prev,
        leaseRules: [...prev.leaseRules, currentRule.trim()],
      }));
      setCurrentRule("");
    }
  };

  // Remove amenity
  const removeAmenity = (index: number) => {
    setFormData((prev) => {
      const newAmenities = [...prev.amenityTags];
      newAmenities.splice(index, 1);
      return { ...prev, amenityTags: newAmenities };
    });
  };

  // Remove feature
  const removeFeature = (index: number) => {
    setFormData((prev) => {
      const newFeatures = [...prev.propertyFeatures];
      newFeatures.splice(index, 1);
      return { ...prev, propertyFeatures: newFeatures };
    });
  };

  // Remove rule
  const removeRule = (index: number) => {
    setFormData((prev) => {
      const newRules = [...prev.leaseRules];
      newRules.splice(index, 1);
      return { ...prev, leaseRules: newRules };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // ✅ Prepare data without image fields
      const finalData = {
        ...formData,
        amenityTags: JSON.stringify(formData.amenityTags),
        propertyFeatures: JSON.stringify(formData.propertyFeatures),
        leaseRules: JSON.stringify(formData.leaseRules),
      };

      // ✅ 1. Create property
      const response = await axios.post(
        "http://localhost:4000/api/landlord/property/add-property",
        finalData,
        { withCredentials: true }
      );

      const { propertyId } = response.data;

      // ✅ 2. Upload images to Supabase
      let uploadedImageUrls: string[] = [];

      if (imageFiles.length > 0) {
        const propertyFolder = `properties/${propertyId}/`;

        for (const file of imageFiles) {
          const fileName = `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 9)}-${file.name}`;
          const filePath = `${propertyFolder}${fileName}`;

          const { data, error } = await supabase.storage
            .from("rentease-images")
            .upload(filePath, file);

          if (error) throw error;

          const { data: publicUrlData } = supabase.storage
            .from("rentease-images")
            .getPublicUrl(data.path);

          uploadedImageUrls.push(publicUrlData.publicUrl);
        }

        // ✅ 3. Determine main image
        let mainImageUrl = "";
        if (formData.mainImageUrl) {
          const mainIndex = imagePreviews.indexOf(formData.mainImageUrl);
          if (mainIndex !== -1 && mainIndex < uploadedImageUrls.length) {
            mainImageUrl = uploadedImageUrls[mainIndex];
          }
        }

        if (!mainImageUrl && uploadedImageUrls.length > 0) {
          mainImageUrl = uploadedImageUrls[0];
        }

        // ✅ 4. Update backend with image URLs
        await axios.patch(
          "http://localhost:4000/api/landlord/property/update-images",
          {
            propertyId,
            propertyImageUrls: JSON.stringify(uploadedImageUrls),
            mainImageUrl,
          },
          { withCredentials: true }
        );
      }

      toast.success("Property created successfully!");
      navigate(`/landlord/property/${propertyId}/details`);
    } catch (error: any) {
      console.error("Error creating property:", error);
      toast.error(
        error?.response?.data?.message ||
          error.message ||
          "Failed to create property. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigation between steps
  const nextStep = () => {
    // Basic validation for required fields in current step
    if (currentStep === 1) {
      if (!formData.title || !formData.type || !formData.description) {
        toast.error("Please fill in all required fields");
        return;
      }
    } else if (currentStep === 2) {
      if (
        !formData.street ||
        !formData.barangay ||
        !formData.city ||
        !formData.province ||
        !formData.zipCode
      ) {
        toast.error("Please fill in all required address fields");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  // Step navigation tabs
  const StepTabs = () => (
    <div className="flex justify-between mb-6 border-b">
      {[1, 2, 3, 4].map((step) => (
        <button
          key={step}
          type="button"
          onClick={() => setCurrentStep(step)}
          className={`pb-3 px-4 relative ${
            currentStep === step
              ? "text-teal-600 font-medium"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {step === 1 && "Basic Info"}
          {step === 2 && "Address"}
          {step === 3 && "Details"}
          {step === 4 && "Media"}
          {currentStep === step && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"></div>
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div className="p-4 md:p-6 h-full overflow-hidden">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-6 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          <Home className="text-teal-600 h-6 w-6" />
          <h1 className="text-lg font-bold bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
            Add New Property
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 flex flex-col"
        >
          <StepTabs />
          
          <div className="flex-1 overflow-y-auto pb-4">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <section className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="title" className="p-1">
                      Property Title *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                      placeholder="e.g., Modern 3-Bedroom Apartment"
                    />
                  </div>

                  <div>
                    <Label htmlFor="type" className="p-1">
                      Property Type *
                    </Label>
                    <select
                      id="type"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                      className="w-full p-2 border rounded-sm text-sm"
                      required
                    >
                      <option value="">Select Type</option>
                      <option value="APARTMENT">Apartment</option>
                      <option value="SINGLE_HOUSE">Single House</option>
                      <option value="CONDOMINIUM">Condominium</option>
                      <option value="BOARDING_HOUSE">Boarding House</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="description" className="p-1">
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      required
                      rows={4}
                      placeholder="Describe your property in detail..."
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Step 2: Address */}
            {currentStep === 2 && (
              <section className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="street" className="p-1">
                      Street *
                    </Label>
                    <Input
                      id="street"
                      value={formData.street}
                      onChange={(e) =>
                        setFormData({ ...formData, street: e.target.value })
                      }
                      required
                      placeholder="Street name and number"
                    />
                  </div>

                  <div>
                    <Label htmlFor="barangay" className="p-1">
                      Barangay *
                    </Label>
                    <Input
                      id="barangay"
                      value={formData.barangay}
                      onChange={(e) =>
                        setFormData({ ...formData, barangay: e.target.value })
                      }
                      required
                      placeholder="Barangay"
                    />
                  </div>

                  <div>
                    <Label htmlFor="municipality" className="p-1">
                      Municipality
                    </Label>
                    <Input
                      id="municipality"
                      value={formData.municipality}
                      onChange={(e) =>
                        setFormData({ ...formData, municipality: e.target.value })
                      }
                      placeholder="Municipality"
                    />
                  </div>

                  <div>
                    <Label htmlFor="province" className="p-1">
                      Province *
                    </Label>
                    <Input
                      id="province"
                      value={formData.province}
                      onChange={(e) =>
                        setFormData({ ...formData, province: e.target.value })
                      }
                      required
                      placeholder="Province"
                    />
                  </div>

                  <div>
                    <Label htmlFor="city" className="p-1">
                      City *
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      required
                      placeholder="City"
                    />
                  </div>

                  <div>
                    <Label htmlFor="zipCode" className="p-1">
                      ZIP Code *
                    </Label>
                    <Input
                      id="zipCode"
                      value={formData.zipCode}
                      onChange={(e) =>
                        setFormData({ ...formData, zipCode: e.target.value })
                      }
                      required
                      placeholder="ZIP code"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Step 3: Details */}
            {currentStep === 3 && (
              <section className="space-y-8">
                {/* Amenities Section */}
                <div>
                  <h2 className="text-md font-semibold mb-4 pb-2 border-b border-gray-200">
                    <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                      Amenities
                    </span>
                    <span className="block text-sm text-gray-500 mt-1">
                      Add one word per amenity (e.g., Pool, Gym, Wifi)
                    </span>
                  </h2>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.amenityTags.map((amenity, index) => (
                      <div
                        key={index}
                        className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full flex items-center shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <span className="select-none">{amenity}</span>
                        <button
                          type="button"
                          onClick={() => removeAmenity(index)}
                          aria-label={`Remove amenity ${amenity}`}
                          className="ml-2 p-1 rounded-full text-teal-600 hover:text-teal-800 hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-400"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={currentAmenity}
                      onChange={(e) => setCurrentAmenity(e.target.value)}
                      placeholder="Add amenities (e.g., Pool, Gym)"
                    />
                    <Button
                      type="button"
                      onClick={addAmenity}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>

                {/* Property Features Section */}
                <div>
                  <h2 className="text-md font-semibold mb-4 pb-2 border-b border-gray-200">
                    <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                      Property Features
                      <span className="text-sm text-gray-500 ml-2">
                        ({formData.propertyFeatures.length}/{MAX_FEATURES})
                      </span>
                    </span>
                    <span className="block text-sm text-gray-500 mt-1">
                      Add one word per amenity (e.g., Pool, Gym, Wifi)
                    </span>
                  </h2>

                  <div className="space-y-3 mb-4">
                    {formData.propertyFeatures.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 bg-gray-50 p-3 rounded"
                      >
                        <div className="font-medium">{feature}</div>
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={currentFeature}
                      onChange={(e) => setCurrentFeature(e.target.value)}
                      placeholder="Add feature (e.g., 3 Bedrooms)"
                    />
                    <Button
                      type="button"
                      onClick={addFeature}
                      className="bg-teal-600 hover:bg-teal-700"
                      disabled={formData.propertyFeatures.length >= MAX_FEATURES}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>

                {/* Lease Rules Section */}
                <div>
                  <h2 className="text-md font-semibold mb-4 pb-2 border-b border-gray-200">
                    <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                      Lease Rules
                      <span className="text-sm text-gray-500 ml-2">
                        ({formData.leaseRules.length}/{MAX_RULES})
                      </span>
                    </span>
                    <span className="block text-sm text-gray-500 mt-1">
                      10 words per rule
                    </span>
                  </h2>

                  <div className="space-y-3 mb-4">
                    {formData.leaseRules.map((rule, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded"
                      >
                        <div>{rule}</div>
                        <button
                          type="button"
                          onClick={() => removeRule(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={currentRule}
                      onChange={(e) => setCurrentRule(e.target.value)}
                      placeholder="Add lease rule (e.g., No pets allowed)"
                    />
                    <Button
                      type="button"
                      onClick={addRule}
                      className="bg-teal-600 hover:bg-teal-700"
                      disabled={formData.leaseRules.length >= MAX_RULES}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>

                {/* Screening Section */}
                <div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-md">
                    <div>
                      <h3 className="font-medium">Require Tenant Screening</h3>
                      <p className="text-sm text-gray-600">
                        Enable this to require background checks for applicants
                      </p>
                    </div>
                    <Switch
                      checked={formData.requiresScreening}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, requiresScreening: checked })
                      }
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Step 4: Media */}
            {currentStep === 4 && (
              <section className="space-y-6">
                <div>
                  <h2 className="text- font-semibold mb-1 pb-0 border-b border-gray-200 flex items-center justify-between">
                    <span className="bg-gradient-to-r from-teal-600 to-blue-600 bg-clip-text text-transparent">
                      Property Images
                      <span className="text-sm text-gray-500 ml-2">
                        ({imagePreviews.length}/{MAX_IMAGES})
                      </span>
                    </span>
                    <span className="text-xs text-gray-400 italic">
                      Max 2MB per photo
                    </span>
                  </h2>

                  <div className="mb-3 text-sm text-gray-600">
                    <p>• Upload up to 5 images (4 regular + 1 main image)</p>
                    <p>• Click the star icon to select the main image</p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative aspect-square border rounded-md overflow-hidden"
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index}`}
                          className="w-full h-full object-cover"
                        />

                        <div className="absolute inset-0 flex justify-between items-start p-2">
                          <button
                            type="button"
                            onClick={() => setMainImage(index)}
                            className={`p-1 rounded-full ${
                              formData.mainImageUrl === preview
                                ? "bg-amber-500"
                                : "bg-white/30"
                            }`}
                          >
                            <Star
                              className={`h-4 w-4 ${
                                formData.mainImageUrl === preview
                                  ? "text-white"
                                  : "text-amber-400"
                              }`}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="p-1 rounded-full bg-white/30 hover:bg-red-100 text-gray-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {formData.mainImageUrl === preview && (
                          <div className="absolute bottom-2 left-0 right-0 text-center">
                            <div className="text-xs text-white bg-amber-500 px-2 py-1 rounded inline-block">
                              Main Image
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {imagePreviews.length < MAX_IMAGES && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square border-2 border-dashed rounded-md flex flex-col items-center justify-center text-gray-500 hover:text-teal-600 hover:border-teal-400"
                      >
                        <Upload className="h-8 w-8 mb-2" />
                        <span>Upload Image</span>
                        <span className="text-xs">(max {MAX_IMAGES})</span>
                      </button>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />
                </div>
              </section>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-3 pt-6 border-t border-gray-200">
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/landlord/property/properties")}
              >
                Cancel
              </Button>
            </div>
            
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex items-center gap-1"
                >
                  <ArrowLeft className="h-4 w-4" /> Previous
                </Button>
              )}
              
              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white flex items-center gap-1"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-teal-600 to-blue-600 hover:from-teal-700 hover:to-blue-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Property..." : "Create Property"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;
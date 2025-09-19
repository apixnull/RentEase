import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Home, 
  Upload, 
  DollarSign, 
  Shield,
  Building,
  CheckCircle,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { toast } from "sonner";

// Mock amenities data
const mockAmenities = [
  { id: "a1", name: "Air Conditioning" },
  { id: "a2", name: "Parking Space" },
  { id: "a3", name: "WiFi" },
  { id: "a4", name: "Furnished" },
  { id: "a5", name: "Kitchen" },
  { id: "a6", name: "Private Bathroom" },
  { id: "a7", name: "Balcony" },
  { id: "a8", name: "Security" },
  { id: "a9", name: "Laundry" },
  { id: "a10", name: "Elevator" },
];

// Steps configuration
const steps = [
  { id: 1, title: "Basic Info", icon: Home },
  { id: 2, title: "Features", icon: Building },
  { id: 3, title: "Pricing", icon: DollarSign },
  { id: 4, title: "Screening", icon: Shield },
];

const AddUnit = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    // Basic Info
    label: "",
    description: "",
    status: "AVAILABLE",
    floorNumber: "",
    
    // Layout & Features
    maxOccupancy: 1,
    amenities: [] as string[],
    mainImageUrl: "",
    
    // Pricing
    targetPrice: "",
    securityDeposit: "",
    
    // Screening Settings
    requiresScreening: false,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleAmenityChange = (amenityId: string) => {
    setFormData(prev => {
      const amenities = prev.amenities.includes(amenityId)
        ? prev.amenities.filter(id => id !== amenityId)
        : [...prev.amenities, amenityId];
      return { ...prev, amenities };
    });
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
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
        return true;
      case 3:
        if (!formData.targetPrice || parseFloat(formData.targetPrice) <= 0) {
          toast.error("Please provide a valid monthly rent price");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would send the data to your API
      console.log("Unit data:", {
        ...formData,
        propertyId,
        floorNumber: formData.floorNumber ? parseInt(formData.floorNumber) : null,
        targetPrice: parseFloat(formData.targetPrice),
        securityDeposit: formData.securityDeposit ? parseFloat(formData.securityDeposit) : null,
      });
      
      toast.success("Unit added successfully!");
      navigate(`/landlord/properties/${propertyId}`);
    } catch (error) {
      toast.error("Failed to add unit. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render step progress bar
  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex flex-col items-center justify-center w-10 h-10 rounded-full ${
                currentStep > step.id
                  ? "bg-emerald-500 text-white"
                  : currentStep === step.id
                  ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-500"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {currentStep > step.id ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <step.icon className="h-5 w-5" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 w-12 md:w-20 ${
                  currentStep > step.id ? "bg-emerald-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2">
        {steps.map(step => (
          <div
            key={step.id}
            className={`text-xs text-center w-10 ${
              currentStep >= step.id ? "text-emerald-700 font-medium" : "text-gray-500"
            }`}
          >
            {step.title}
          </div>
        ))}
      </div>
    </div>
  );

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                <Home className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="label" className="text-sm font-medium text-gray-700">
                  Unit Label/Name *
                </label>
                <Input
                  id="label"
                  name="label"
                  value={formData.label}
                  onChange={handleInputChange}
                  placeholder="e.g., Unit 3A, Studio B"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium text-gray-700">
                  Status *
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  required
                >
                  <option value="AVAILABLE">Available</option>
                  <option value="OCCUPIED">Occupied</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="floorNumber" className="text-sm font-medium text-gray-700">
                  Floor Number
                </label>
                <Input
                  id="floorNumber"
                  name="floorNumber"
                  type="number"
                  min="0"
                  value={formData.floorNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., 3"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description *
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the unit, its features, and what makes it special..."
                  rows={4}
                  required
                />
              </div>
            </div>
          </Card>
        );
      case 2:
        return (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                <Building className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Layout & Features</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="maxOccupancy" className="text-sm font-medium text-gray-700">
                  Maximum Occupancy *
                </label>
                <Input
                  id="maxOccupancy"
                  name="maxOccupancy"
                  type="number"
                  min="1"
                  value={formData.maxOccupancy}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="mainImageUrl" className="text-sm font-medium text-gray-700">
                  Main Image URL
                </label>
                <div className="flex gap-2">
                  <Input
                    id="mainImageUrl"
                    name="mainImageUrl"
                    value={formData.mainImageUrl}
                    onChange={handleInputChange}
                    placeholder="Paste image URL here"
                  />
                  <Button type="button" variant="outline" className="whitespace-nowrap">
                    <Upload className="h-4 w-4 mr-1" />
                    Upload
                  </Button>
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Amenities
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {mockAmenities.map(amenity => (
                    <div key={amenity.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`amenity-${amenity.id}`}
                        checked={formData.amenities.includes(amenity.id)}
                        onChange={() => handleAmenityChange(amenity.id)}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`amenity-${amenity.id}`} className="text-sm text-gray-700">
                        {amenity.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        );
      case 3:
        return (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                <DollarSign className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Pricing</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="targetPrice" className="text-sm font-medium text-gray-700">
                  Monthly Rent (₱) *
                </label>
                <Input
                  id="targetPrice"
                  name="targetPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.targetPrice}
                  onChange={handleInputChange}
                  placeholder="e.g., 15000"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="securityDeposit" className="text-sm font-medium text-gray-700">
                  Security Deposit (₱)
                </label>
                <Input
                  id="securityDeposit"
                  name="securityDeposit"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.securityDeposit}
                  onChange={handleInputChange}
                  placeholder="e.g., 10000"
                />
              </div>
            </div>
          </Card>
        );
      case 4:
        return (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                <Shield className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Screening Settings</h2>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="requiresScreening"
                name="requiresScreening"
                checked={formData.requiresScreening}
                onChange={handleInputChange}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label htmlFor="requiresScreening" className="text-sm text-gray-700">
                Require tenant screening for this unit
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              When enabled, tenants will need to complete a screening process before applying for this unit.
            </p>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={`/landlord/properties/${propertyId}`}>
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-sky-100 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-medium">
            <span>Add New Unit</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-2">Add a New Unit</h1>
          <p className="text-sm text-gray-600 mt-1">Step {currentStep} of {steps.length}</p>
        </div>
      </div>

      {/* Progress Bar */}
      {renderProgressBar()}

      <form onSubmit={handleSubmit}>
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button
              type="button"
              onClick={nextStep}
              className="flex items-center gap-1 bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700"
            >
              {isSubmitting ? "Adding Unit..." : "Add Unit"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddUnit;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Save,
  FileText,
  User,
  Home,
  Calendar,
  DollarSign,
  Shield,
  Upload,
  Link,
  Search,
  Building,
  MapPin,
  Clock,
  Info,
  CheckCircle,
  AlertCircle,
  Wrench,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  createLeaseRequest,
  findTenantForLeaseRequest,
  getPropertiesWithUnitsAndTenantsRequest,
} from "@/api/landlord/leaseApi";
import { supabase } from "@/lib/supabaseClient";

// Interfaces based on API responses
interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  riskLevel: "HIGH" | "MEDIUM" | "LOW" | null;
}

interface Unit {
  id: string;
  label: string;
  unitCondition: "GOOD" | "NEED_MAINTENANCE" | "UNDER_MAINTENANCE" | "UNUSABLE";
}

interface Property {
  id: string;
  title: string;
  Unit: Unit[];
}

interface ApiPropertiesResponse {
  properties: Property[];
  suggestedTenants: Tenant[];
}

interface ApiTenantsResponse {
  tenants: Tenant[];
}

// Session storage keys
const SESSION_STORAGE_KEYS = {
  CURRENT_STEP: "createLease_currentStep",
  FORM_DATA: "createLease_formData",
  SELECTED_TENANT: "createLease_selectedTenant",
};

const CreateLease = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // API data states
  const [properties, setProperties] = useState<Property[]>([]);
  const [suggestedTenants, setSuggestedTenants] = useState<Tenant[]>([]);
  const [searchResults, setSearchResults] = useState<Tenant[]>([]);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [isSearchingTenants, setIsSearchingTenants] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: Property & Unit & Tenant
    propertyId: "",
    unitId: "",
    tenantId: "",
    leaseNickname: "",
    leaseType: "STANDARD" as "STANDARD" | "SHORT_TERM" | "LONG_TERM" | "FIXED_TERM",

    // Step 2: Dates & Financial
    startDate: "",
    leaseTermMonths: "12",
    rentAmount: "",
    securityDeposit: "",
    dueDate: "1",

    // Step 3: Documents
    leaseDocumentUrl: "",
    leaseDocumentFile: null as File | null,
    documentOption: "link" as "link" | "upload",
  });

  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
  const [leaseDurationError, setLeaseDurationError] = useState("");
  const [leaseDurationDays, setLeaseDurationDays] = useState<number | null>(null);
  const [calculatedEndDate, setCalculatedEndDate] = useState<string>("");

  // Load from session storage on component mount
  useEffect(() => {
    const savedStep = sessionStorage.getItem(SESSION_STORAGE_KEYS.CURRENT_STEP);
    const savedFormData = sessionStorage.getItem(SESSION_STORAGE_KEYS.FORM_DATA);
    const savedTenant = sessionStorage.getItem(SESSION_STORAGE_KEYS.SELECTED_TENANT);

    if (savedStep) {
      setCurrentStep(Number(savedStep));
    }
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        setFormData({
          ...parsedData,
          securityDeposit: parsedData.securityDeposit || "",
          leaseTermMonths: parsedData.leaseTermMonths || "12",
        });
      } catch (error) {
        console.error("Failed to parse saved form data:", error);
      }
    }
    if (savedTenant) {
      try {
        setSelectedTenant(JSON.parse(savedTenant));
      } catch (error) {
        console.error("Failed to parse saved tenant:", error);
      }
    }
  }, []);

  // Save to session storage whenever state changes
  useEffect(() => {
    sessionStorage.setItem(SESSION_STORAGE_KEYS.CURRENT_STEP, currentStep.toString());
  }, [currentStep]);

  useEffect(() => {
    sessionStorage.setItem(SESSION_STORAGE_KEYS.FORM_DATA, JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (selectedTenant) {
      sessionStorage.setItem(SESSION_STORAGE_KEYS.SELECTED_TENANT, JSON.stringify(selectedTenant));
    } else {
      sessionStorage.removeItem(SESSION_STORAGE_KEYS.SELECTED_TENANT);
    }
  }, [selectedTenant]);

  // Clear session storage when leaving the page
  useEffect(() => {
    return () => {
      const shouldClear = !window.location.pathname.includes("/leases/");
      if (shouldClear) {
        sessionStorage.removeItem(SESSION_STORAGE_KEYS.CURRENT_STEP);
        sessionStorage.removeItem(SESSION_STORAGE_KEYS.FORM_DATA);
        sessionStorage.removeItem(SESSION_STORAGE_KEYS.SELECTED_TENANT);
      }
    };
  }, []);

  // Fetch properties and suggested tenants on component mount
  useEffect(() => {
    const fetchPropertiesAndTenants = async () => {
      try {
        setIsLoadingProperties(true);
        const response = await getPropertiesWithUnitsAndTenantsRequest();
        const data: ApiPropertiesResponse = response.data;

        setProperties(data.properties);
        setSuggestedTenants(data.suggestedTenants);
      } catch (error) {
        console.error("Failed to fetch properties and tenants:", error);
        toast.error("Failed to load properties and tenants. Please try again.");
      } finally {
        setIsLoadingProperties(false);
      }
    };

    fetchPropertiesAndTenants();
  }, []);

  // Search tenants when search term changes (with debounce)
  useEffect(() => {
    const searchTenants = async () => {
      if (!searchTerm.trim() || selectedTenant) {
        setSearchResults([]);
        return;
      }

      try {
        setIsSearchingTenants(true);
        const response = await findTenantForLeaseRequest(searchTerm);
        const data: ApiTenantsResponse = response.data;
        setSearchResults(data.tenants);
      } catch (error) {
        console.error("Failed to search tenants:", error);
        setSearchResults([]);
      } finally {
        setIsSearchingTenants(false);
      }
    };

    const timeoutId = setTimeout(searchTenants, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedTenant]);

  // Filter units based on selected property
  useEffect(() => {
    if (formData.propertyId) {
      const selectedProperty = properties.find((p) => p.id === formData.propertyId);
      setFilteredUnits(selectedProperty?.Unit || []);
    } else {
      setFilteredUnits([]);
    }
  }, [formData.propertyId, properties]);

  // Auto-generate lease nickname when property, unit, or tenant changes
  useEffect(() => {
    const property = properties.find((p) => p.id === formData.propertyId);
    const unit = filteredUnits.find((u) => u.id === formData.unitId);
    const tenant = selectedTenant || suggestedTenants.find((t) => t.id === formData.tenantId);

    if (property && unit && tenant) {
      const nickname = `${tenant.firstName} ${tenant.lastName} - ${property.title} ${unit.label}`;
      setFormData((prev) => ({ ...prev, leaseNickname: nickname }));
    }
  }, [formData.propertyId, formData.unitId, selectedTenant, properties, filteredUnits, suggestedTenants]);

  // Calculate end date and validate lease duration based on lease type and term
  useEffect(() => {
    if (formData.startDate && formData.leaseTermMonths) {
      const startDate = new Date(formData.startDate);
      const termMonths = parseInt(formData.leaseTermMonths);

      if (isNaN(termMonths) || termMonths <= 0) {
        setLeaseDurationError("Lease term must be a positive number");
        setCalculatedEndDate("");
        setLeaseDurationDays(null);
        return;
      }

      // Maximum 12 months validation
      if (termMonths > 12) {
        setLeaseDurationError("Lease term cannot exceed 12 months");
        setCalculatedEndDate("");
        setLeaseDurationDays(null);
        return;
      }

      // Calculate end date by adding months to start date
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + termMonths);

      // Adjust for end of month (if start date is end of month, keep end date at end of month)
      if (
        startDate.getDate() !==
        new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate()
      ) {
        // Not end of month, subtract one day to make it inclusive
        endDate.setDate(endDate.getDate() - 1);
      }

      setCalculatedEndDate(endDate.toISOString().split("T")[0]);

      // Calculate duration in days
      const timeDiff = endDate.getTime() - startDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      setLeaseDurationDays(daysDiff);

      // Validate based on lease type
      let error = "";

      switch (formData.leaseType) {
        case "SHORT_TERM":
          if (termMonths > 6) {
            error = "Short term lease cannot exceed 6 months";
          } else if (termMonths < 1) {
            error = "Lease must be at least 1 month";
          }
          break;
        case "STANDARD":
          if (termMonths < 11 || termMonths > 12) {
            error = "Standard lease should be 12 months";
          }
          break;
        case "LONG_TERM":
          if (termMonths < 13) {
            error = "Long term lease must be at least 13 months (but max is 12)";
          }
          break;
        case "FIXED_TERM":
          if (termMonths < 1) {
            error = "Lease must be at least 1 month";
          }
          break;
      }

      setLeaseDurationError(error);
    } else {
      setCalculatedEndDate("");
      setLeaseDurationDays(null);
      setLeaseDurationError("");
    }
  }, [formData.startDate, formData.leaseTermMonths, formData.leaseType]);

  // Auto-adjust lease term months based on lease type
  useEffect(() => {
    if (formData.leaseType && !formData.leaseTermMonths) {
      let defaultMonths = "12";
      switch (formData.leaseType) {
        case "SHORT_TERM":
          defaultMonths = "6";
          break;
        case "STANDARD":
          defaultMonths = "12";
          break;
        case "LONG_TERM":
          defaultMonths = "12";
          break;
        case "FIXED_TERM":
          defaultMonths = "12";
          break;
      }
      setFormData((prev) => ({ ...prev, leaseTermMonths: defaultMonths }));
    }
  }, [formData.leaseType]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, leaseDocumentFile: file }));
    }
  };

  const handleTenantSelect = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setFormData((prev) => ({ ...prev, tenantId: tenant.id }));
    setSearchTerm(`${tenant.firstName} ${tenant.lastName}`);
    setSearchResults([]);
  };

  const clearTenantSelection = () => {
    setSelectedTenant(null);
    setFormData((prev) => ({ ...prev, tenantId: "" }));
    setSearchTerm("");
    setSearchResults([]);
  };

  const nextStep = () => {
    if (currentStep < 3 && isStepValid()) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const uploadLeaseDocument = async (file: File): Promise<string> => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `lease-documents/${fileName}`;

      const { error } = await supabase.storage
        .from("rentease-images")
        .upload(filePath, file);

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("rentease-images").getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error("Error uploading lease document:", error);
      throw new Error("Failed to upload lease document. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep !== 3) {
      nextStep();
      return;
    }

    if (!isStepValid()) {
      toast.error("Please complete all required fields correctly");
      return;
    }

    setShowConfirmation(true);
  };

  const confirmSubmit = async () => {
    setLoading(true);
    setShowConfirmation(false);

    try {
      let leaseDocumentUrl = formData.leaseDocumentUrl;

      if (formData.documentOption === "upload" && formData.leaseDocumentFile) {
        leaseDocumentUrl = await uploadLeaseDocument(formData.leaseDocumentFile);
      }

      const payload = {
        propertyId: formData.propertyId,
        unitId: formData.unitId,
        tenantId: formData.tenantId,
        leaseNickname: formData.leaseNickname,
        leaseType: formData.leaseType,
        startDate: formData.startDate,
        endDate: calculatedEndDate,
        rentAmount: parseFloat(formData.rentAmount),
        securityDeposit: formData.securityDeposit
          ? parseFloat(formData.securityDeposit)
          : null,
        dueDate: parseInt(formData.dueDate),
        leaseDocumentUrl: leaseDocumentUrl || null,
      };

      console.log("Creating lease with payload:", payload);

      const response = await createLeaseRequest(payload);
      const leaseId = response.data.leaseId;

      sessionStorage.removeItem(SESSION_STORAGE_KEYS.CURRENT_STEP);
      sessionStorage.removeItem(SESSION_STORAGE_KEYS.FORM_DATA);
      sessionStorage.removeItem(SESSION_STORAGE_KEYS.SELECTED_TENANT);

      toast.success(
        response.data.message || "Lease created successfully and is pending activation!"
      );
      navigate(`/landlord/leases/${leaseId}/details`);
    } catch (error: any) {
      console.error("Failed to create lease:", error);
      toast.error(
        error.response?.data?.error || error.message || "Failed to create lease. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getSelectedProperty = () => properties.find((p) => p.id === formData.propertyId);
  const getSelectedUnit = () => filteredUnits.find((u) => u.id === formData.unitId);

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (
          formData.propertyId &&
          formData.unitId &&
          formData.tenantId &&
          formData.leaseNickname.trim()
        );
      case 2:
        return (
          formData.startDate &&
          formData.leaseTermMonths &&
          !leaseDurationError &&
          formData.rentAmount
        );
      case 3:
        return true;
      default:
        return false;
    }
  };

  const getProgressPercentage = () => {
    return (currentStep / 3) * 100;
  };

  const getRiskLevelBadge = (riskLevel: string | null) => {
    if (!riskLevel) return null;

    const variants = {
      HIGH: "destructive",
      MEDIUM: "default",
      LOW: "secondary",
    } as const;

    return (
      <Badge variant={variants[riskLevel as keyof typeof variants] || "default"} className="text-xs">
        {riskLevel} RISK
      </Badge>
    );
  };

  // Unit condition configuration with icons and colors
  const getUnitConditionConfig = (condition: string) => {
    const configs = {
      GOOD: {
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        label: "Good Condition",
        description: "Ready for immediate occupancy"
      },
      NEED_MAINTENANCE: {
        icon: AlertCircle,
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        label: "Needs Maintenance",
        description: "Requires attention before leasing"
      },
      UNDER_MAINTENANCE: {
        icon: Wrench,
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        label: "Under Maintenance",
        description: "Currently being repaired"
      },
      UNUSABLE: {
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        label: "Unusable",
        description: "Not available for leasing"
      }
    };

    return configs[condition as keyof typeof configs] || configs.GOOD;
  };

  // Enhanced unit condition display component
  const UnitConditionDisplay = ({ condition }: { condition: string }) => {
    const config = getUnitConditionConfig(condition);
    const IconComponent = config.icon;

    return (
      <div className={`flex items-center gap-2 p-2 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
        <IconComponent className={`w-4 h-4 ${config.color}`} />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-gray-900">{config.label}</div>
          <div className="text-xs text-gray-600">{config.description}</div>
        </div>
      </div>
    );
  };

  // Compact unit condition badge for select items
  const UnitConditionBadge = ({ condition }: { condition: string }) => {
    const config = getUnitConditionConfig(condition);
    const IconComponent = config.icon;

    return (
      <Badge 
        variant="outline" 
        className={`text-xs flex items-center gap-1 ${config.bgColor} ${config.borderColor} ${config.color}`}
      >
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const steps = [
    {
      number: 1,
      title: "Basic Info",
      description: "Property, unit, and tenant",
      icon: Building,
    },
    {
      number: 2,
      title: "Terms & Financial",
      description: "Duration and payment details",
      icon: DollarSign,
    },
    {
      number: 3,
      title: "Documents",
      description: "Agreements and signatures",
      icon: FileText,
    },
  ];

  const calculateInitialPayment = () => {
    const rent = parseFloat(formData.rentAmount) || 0;
    const securityDeposit = parseFloat(formData.securityDeposit) || 0;
    return rent + securityDeposit;
  };

  // Format duration display
  const formatDuration = (days: number) => {
    if (days < 30) {
      return `${days} day${days !== 1 ? "s" : ""}`;
    }

    const months = Math.floor(days / 30);
    const remainingDays = days % 30;

    if (remainingDays === 0) {
      return `${months} month${months !== 1 ? "s" : ""}`;
    }

    return `${months} month${months !== 1 ? "s" : ""} and ${remainingDays} day${remainingDays !== 1 ? "s" : ""}`;
  };

  // Lease term options (1-12 months only)
  const leaseTermOptions = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-3">
      {/* Header - Ultra Compact */}
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          Create New Lease
        </h1>
        <p className="text-gray-600 text-xs">
          Set up a rental agreement in 3 simple steps
        </p>
      </div>

      {/* Progress Bar - Ultra Compact */}
      <Card className="mb-4 shadow-sm border-0">
        <CardContent className="p-3">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="font-semibold text-gray-800 text-xs">
                Step {currentStep} of 3
              </h3>
              <p className="text-gray-600 text-xs">
                {steps[currentStep - 1]?.description}
              </p>
            </div>
            <Badge
              variant="secondary"
              className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700"
            >
              {getProgressPercentage().toFixed(0)}% Complete
            </Badge>
          </div>
          <Progress value={getProgressPercentage()} className="h-1 bg-gray-200" />

          {/* Step Indicators - Ultra Compact */}
          <div className="flex justify-between mt-3">
            {steps.map((step) => {
              const IconComponent = step.icon;
              const isCompleted = step.number < currentStep;
              const isCurrent = step.number === currentStep;

              return (
                <div
                  key={step.number}
                  className="flex flex-col items-center text-center flex-1 relative"
                >
                  {step.number < 3 && (
                    <div
                      className={`absolute top-3 left-1/2 w-full h-0.5 -z-10 ${
                        isCompleted ? "bg-green-500" : "bg-gray-300"
                      }`}
                      style={{ width: "calc(100% - 1rem)" }}
                    />
                  )}

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all ${
                      isCurrent
                        ? "bg-blue-600 text-white border-blue-600 scale-110"
                        : isCompleted
                        ? "bg-green-500 text-white border-green-500"
                        : "bg-white text-gray-400 border-gray-300"
                    }`}
                  >
                    {isCompleted ? (
                      <div className="w-2 h-2">✓</div>
                    ) : (
                      <IconComponent className="w-2.5 h-2.5" />
                    )}
                  </div>

                  <div className="mt-1">
                    <p
                      className={`text-xs font-medium transition-colors ${
                        isCurrent
                          ? "text-blue-600"
                          : isCompleted
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Form - Ultra Compact */}
          <div className="lg:col-span-3">
            <Card className="shadow-md border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b p-3">
                <CardTitle className="flex items-center gap-2 text-sm text-gray-800">
                  <div
                    className={`p-1 rounded ${
                      currentStep === 1
                        ? "bg-blue-100 text-blue-600"
                        : currentStep === 2
                        ? "bg-green-100 text-green-600"
                        : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    {currentStep === 1 && <Building className="w-3 h-3" />}
                    {currentStep === 2 && <DollarSign className="w-3 h-3" />}
                    {currentStep === 3 && <FileText className="w-3 h-3" />}
                  </div>
                  <div>
                    <div className="text-xs font-semibold">
                      {steps[currentStep - 1]?.title}
                    </div>
                    <CardDescription className="text-gray-600 text-xs">
                      {steps[currentStep - 1]?.description}
                    </CardDescription>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 space-y-3">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="space-y-3">
                    {/* Property & Unit Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="propertyId" className="text-xs font-medium flex items-center gap-1">
                          <Home className="w-3 h-3 text-blue-600" />
                          Property <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.propertyId}
                          onValueChange={(value) => handleInputChange("propertyId", value)}
                          disabled={isLoadingProperties}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue
                              placeholder={isLoadingProperties ? "Loading properties..." : "Select property"}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {properties.map((property) => (
                              <SelectItem key={property.id} value={property.id}>
                                <div className="flex items-center gap-2">
                                  <Building className="w-3 h-3 text-gray-400" />
                                  <div>
                                    <div className="font-medium text-xs">{property.title}</div>
                                    <div className="text-xs text-gray-500">
                                      {property.Unit.length} unit{property.Unit.length !== 1 ? "s" : ""}
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="unitId" className="text-xs font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-green-600" />
                          Unit <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.unitId}
                          onValueChange={(value) => handleInputChange("unitId", value)}
                          disabled={!formData.propertyId || filteredUnits.length === 0}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue
                              placeholder={
                                !formData.propertyId
                                  ? "Select property first"
                                  : filteredUnits.length === 0
                                  ? "No units available"
                                  : "Select unit"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredUnits.map((unit) => (
                              <SelectItem key={unit.id} value={unit.id}>
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                                      <span className="text-xs font-medium text-green-600">#</span>
                                    </div>
                                    <span className="font-medium text-xs">{unit.label}</span>
                                  </div>
                                  <UnitConditionBadge condition={unit.unitCondition} />
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Unit Condition Display */}
                    {formData.unitId && (
                      <div className="mt-2">
                        <UnitConditionDisplay condition={getSelectedUnit()?.unitCondition || "GOOD"} />
                      </div>
                    )}

                    {/* Tenant Search Section */}
                    <div className="space-y-2">
                      <Label htmlFor="tenantSearch" className="text-xs font-medium flex items-center gap-1">
                        <User className="w-3 h-3 text-purple-600" />
                        Search Tenant <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                        <Input
                          placeholder="Search tenant by name or email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-7 h-8 text-xs"
                          disabled={!!selectedTenant}
                        />
                        {isSearchingTenants && (
                          <div className="absolute right-7 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                        {selectedTenant && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={clearTenantSelection}
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        )}
                      </div>

                      {selectedTenant && (
                        <div className="p-2 border border-green-200 bg-green-50 rounded text-xs">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                <User className="w-3 h-3 text-green-600" />
                              </div>
                              <div>
                                <div className="font-medium text-xs">
                                  {selectedTenant.firstName} {selectedTenant.lastName}
                                </div>
                                <div className="text-xs text-gray-600">{selectedTenant.email}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              {getRiskLevelBadge(selectedTenant.riskLevel)}
                              <Badge
                                variant="outline"
                                className="text-xs bg-white text-green-700 border-green-300"
                              >
                                Selected
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Suggested Tenants */}
                      {!selectedTenant && suggestedTenants.length > 0 && searchResults.length === 0 && (
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-gray-600">Suggested Tenants</Label>
                          <div className="space-y-1.5 max-h-32 overflow-y-auto">
                            {suggestedTenants.map((tenant) => (
                              <div
                                key={tenant.id}
                                className="p-2 border border-gray-200 rounded text-xs cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50"
                                onClick={() => handleTenantSelect(tenant)}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                      <User className="w-3 h-3 text-blue-600" />
                                    </div>
                                    <div>
                                      <div className="font-medium text-xs">
                                        {tenant.firstName} {tenant.lastName}
                                      </div>
                                      <div className="text-xs text-gray-500">{tenant.email}</div>
                                    </div>
                                  </div>
                                  {getRiskLevelBadge(tenant.riskLevel)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Search Results */}
                      {!selectedTenant && searchResults.length > 0 && (
                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium text-gray-600">Search Results</Label>
                          <div className="space-y-1.5 max-h-32 overflow-y-auto">
                            {searchResults.map((tenant) => (
                              <div
                                key={tenant.id}
                                className="p-2 border border-gray-200 rounded text-xs cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50"
                                onClick={() => handleTenantSelect(tenant)}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                      <User className="w-3 h-3 text-blue-600" />
                                    </div>
                                    <div>
                                      <div className="font-medium text-xs">
                                        {tenant.firstName} {tenant.lastName}
                                      </div>
                                      <div className="text-xs text-gray-500">{tenant.email}</div>
                                    </div>
                                  </div>
                                  {getRiskLevelBadge(tenant.riskLevel)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!selectedTenant && searchTerm && searchResults.length === 0 && !isSearchingTenants && (
                        <div className="text-center py-2 text-gray-500 text-xs">
                          No tenants found matching "{searchTerm}"
                        </div>
                      )}
                    </div>

                    {/* Lease Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="leaseNickname" className="text-xs font-medium">
                          Lease Nickname <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          placeholder="e.g., John's Sunset Apartment Lease"
                          value={formData.leaseNickname}
                          onChange={(e) => handleInputChange("leaseNickname", e.target.value)}
                          className="h-8 text-xs"
                          required
                        />
                        <p className="text-xs text-gray-500">
                          Auto-generated based on tenant, property, and unit
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="leaseType" className="text-xs font-medium">
                          Lease Type <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.leaseType}
                          onValueChange={(value: any) => handleInputChange("leaseType", value)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SHORT_TERM">Short Term (1-6 months)</SelectItem>
                            <SelectItem value="STANDARD">Standard (12 months)</SelectItem>
                            <SelectItem value="LONG_TERM">Long Term (12 months max)</SelectItem>
                            <SelectItem value="FIXED_TERM">Fixed Term (1-12 months)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Terms & Financial */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    {/* Dates Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="startDate" className="text-xs font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-orange-600" />
                          Start Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange("startDate", e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          className="h-8 text-xs"
                          required
                        />
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Info className="w-3 h-3" />
                          When the lease period begins
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="leaseTermMonths" className="text-xs font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-600" />
                          Lease Term <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.leaseTermMonths}
                          onValueChange={(value) => handleInputChange("leaseTermMonths", value)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select lease term" />
                          </SelectTrigger>
                          <SelectContent>
                            {leaseTermOptions.map((months) => (
                              <SelectItem key={months} value={months.toString()}>
                                {months} month{months !== 1 ? "s" : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Info className="w-3 h-3" />
                          Total duration of the lease (max 12 months)
                        </div>
                      </div>
                    </div>

                    {/* Calculated End Date Display */}
                    {calculatedEndDate && !leaseDurationError && (
                      <div className="p-2 bg-green-50 rounded border border-green-200 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-green-800 font-medium">Lease End Date:</span>
                          <span className="text-green-700 font-semibold">
                            {new Date(calculatedEndDate).toLocaleDateString()}
                          </span>
                        </div>
                        {leaseDurationDays !== null && (
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-green-800">Total Duration:</span>
                            <span className="text-green-700">
                              {formatDuration(leaseDurationDays)} ({leaseDurationDays} days)
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {leaseDurationError && (
                      <div className="p-2 border border-red-200 bg-red-50 rounded text-xs">
                        <p className="text-red-700 flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          {leaseDurationError}
                        </p>
                      </div>
                    )}

                    {/* Financial Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="rentAmount" className="text-xs font-medium flex items-center gap-1">
                          <DollarSign className="w-3 h-3 text-green-600" />
                          Monthly Rent <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                          <Input
                            type="number"
                            placeholder="0.00"
                            className="pl-6 h-8 text-xs"
                            value={formData.rentAmount}
                            onChange={(e) => handleInputChange("rentAmount", e.target.value)}
                            min="0"
                            max="100000"
                            step="0.01"
                            required
                          />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Info className="w-3 h-3" />
                          Required monthly payment
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="securityDeposit" className="text-xs font-medium flex items-center gap-1">
                          <Shield className="w-3 h-3 text-amber-600" />
                          Security Deposit
                        </Label>
                        <div className="relative">
                          <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                          <Input
                            type="number"
                            placeholder="0.00"
                            className="pl-6 h-8 text-xs"
                            value={formData.securityDeposit}
                            onChange={(e) => handleInputChange("securityDeposit", e.target.value)}
                            min="0"
                            max="100000"
                            step="0.01"
                          />
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Info className="w-3 h-3" />
                          Refundable deposit
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="dueDate" className="text-xs font-medium">
                          Due Date <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.dueDate}
                          onValueChange={(value) => handleInputChange("dueDate", value)}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                              <SelectItem key={day} value={day.toString()}>
                                {day}
                                {day === 1 && "st"}
                                {day === 2 && "nd"}
                                {day === 3 && "rd"}
                                {day > 3 && "th"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Info className="w-3 h-3" />
                          Monthly payment due date
                        </div>
                      </div>
                    </div>

                    {/* Initial Payment Summary */}
                    {formData.rentAmount && (
                      <div className="p-2 bg-amber-50 rounded border border-amber-200 text-xs">
                        <h4 className="font-medium text-amber-800 mb-1.5 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Initial Payment Summary
                        </h4>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-amber-700">First month rent:</span>
                            <span className="font-medium">
                              ${parseFloat(formData.rentAmount).toLocaleString()}
                            </span>
                          </div>
                          {formData.securityDeposit && (
                            <div className="flex justify-between">
                              <span className="text-amber-700">Security deposit:</span>
                              <span className="font-medium">
                                ${parseFloat(formData.securityDeposit).toLocaleString()}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between border-t border-amber-200 pt-1 mt-1">
                            <span className="text-amber-800 font-medium">Total initial payment:</span>
                            <span className="font-bold text-amber-800">
                              ${calculateInitialPayment().toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Documents */}
                {currentStep === 3 && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium flex items-center gap-1">
                        <FileText className="w-3 h-3 text-purple-600" />
                        Lease Document (Optional)
                      </Label>

                      <div className="flex gap-2 mb-3">
                        <Button
                          type="button"
                          variant={formData.documentOption === "link" ? "default" : "outline"}
                          onClick={() => handleInputChange("documentOption", "link")}
                          className="flex items-center gap-1 h-7 px-3 text-xs"
                        >
                          <Link className="w-3 h-3" />
                          Use Link
                        </Button>
                        <Button
                          type="button"
                          variant={formData.documentOption === "upload" ? "default" : "outline"}
                          onClick={() => handleInputChange("documentOption", "upload")}
                          className="flex items-center gap-1 h-7 px-3 text-xs"
                        >
                          <Upload className="w-3 h-3" />
                          Upload File
                        </Button>
                      </div>

                      {formData.documentOption === "link" ? (
                        <div className="space-y-1.5">
                          <Input
                            placeholder="https://example.com/lease-document.pdf"
                            value={formData.leaseDocumentUrl}
                            onChange={(e) => handleInputChange("leaseDocumentUrl", e.target.value)}
                            className="h-8 text-xs"
                          />
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Info className="w-3 h-3" />
                            Provide a link to the digital lease agreement
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <Input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange}
                            className="h-8 text-xs"
                          />
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Info className="w-3 h-3" />
                            Upload lease agreement (PDF, DOC, DOCX)
                          </div>
                          {formData.leaseDocumentFile && (
                            <div className="p-1.5 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                              Selected: {formData.leaseDocumentFile.name}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Status Notice */}
                    <div className="p-2 bg-blue-50 rounded border border-blue-200 text-xs">
                      <h4 className="font-medium text-blue-800 mb-1 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Lease Status
                      </h4>
                      <p className="text-blue-700">
                        This lease will be created with <strong>PENDING</strong> status. It will be activated once the tenant accepts it.
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-3 border-t mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="h-8 px-3 text-xs"
                  >
                    Previous
                  </Button>

                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!isStepValid()}
                      className="h-8 px-3 text-xs bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    >
                      Continue to {steps[currentStep]?.title}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!isStepValid() || loading}
                      className="h-8 px-3 text-xs bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      {loading ? "Creating..." : "Create Lease"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Ultra Compact */}
          <div className="space-y-3">
            {/* Summary Card */}
            <Card className="shadow-sm border-0 sticky top-3">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b p-2">
                <CardTitle className="text-xs">Quick Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-2 text-xs">
                {formData.propertyId && (
                  <div className="flex items-start gap-1.5 p-1.5 bg-blue-50 rounded">
                    <Home className="w-3 h-3 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">Property</p>
                      <p className="text-blue-700">{getSelectedProperty()?.title}</p>
                    </div>
                  </div>
                )}

                {formData.unitId && (
                  <div className="flex items-start gap-1.5 p-1.5 bg-green-50 rounded">
                    <MapPin className="w-3 h-3 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Unit</p>
                      <p className="text-green-700">{getSelectedUnit()?.label}</p>
                      {/* Enhanced unit condition in summary */}
                      {getSelectedUnit()?.unitCondition && (
                        <div className="mt-1">
                          <UnitConditionBadge condition={getSelectedUnit()!.unitCondition} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedTenant && (
                  <div className="flex items-start gap-1.5 p-1.5 bg-purple-50 rounded">
                    <User className="w-3 h-3 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-purple-800">Tenant</p>
                      <p className="text-purple-700">
                        {selectedTenant.firstName} {selectedTenant.lastName}
                      </p>
                    </div>
                  </div>
                )}

                {formData.leaseType && (
                  <div className="p-1.5 bg-indigo-50 rounded">
                    <p className="font-medium text-indigo-800">Lease Type</p>
                    <Badge variant="secondary" className="text-xs bg-white text-indigo-700 mt-0.5">
                      {formData.leaseType.replace("_", " ")}
                    </Badge>
                  </div>
                )}

                {formData.rentAmount && (
                  <div className="flex items-start gap-1.5 p-1.5 bg-green-50 rounded">
                    <DollarSign className="w-3 h-3 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Monthly Rent</p>
                      <p className="text-green-700 font-semibold">
                        ${parseFloat(formData.rentAmount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {leaseDurationDays !== null && !leaseDurationError && (
                  <div className="p-1.5 bg-orange-50 rounded">
                    <p className="font-medium text-orange-800">Duration</p>
                    <p className="text-orange-700">{formatDuration(leaseDurationDays)}</p>
                  </div>
                )}

                {!formData.propertyId && (
                  <div className="text-center py-3">
                    <FileText className="w-6 h-6 text-gray-300 mx-auto mb-1" />
                    <p className="text-gray-500 text-xs">Complete the steps to see summary</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="shadow-sm border-0 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader className="p-2">
                <CardTitle className="text-xs flex items-center gap-1">
                  <Shield className="w-3 h-3 text-purple-600" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 space-y-1.5 text-xs">
                <div className="flex items-center gap-1 text-purple-700">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  <span>Max lease term: 12 months</span>
                </div>
                <div className="flex items-center gap-1 text-purple-700">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  <span>End date is auto-calculated</span>
                </div>
                <div className="flex items-center gap-1 text-purple-700">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  <span>Leases start as PENDING</span>
                </div>
                <div className="flex items-center gap-1 text-purple-700">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  <span>Check unit condition before leasing</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-3">
          <Card className="w-full max-w-xs">
            <CardHeader className="p-3">
              <CardTitle className="flex items-center gap-1 text-xs">
                <Shield className="w-3 h-3 text-blue-600" />
                Confirm Lease Creation
              </CardTitle>
              <CardDescription className="text-xs">
                Are you sure you want to create this lease?
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <div className="space-y-1 text-xs">
                <p>
                  <strong>Property:</strong> {getSelectedProperty()?.title}
                </p>
                <p>
                  <strong>Unit:</strong> {getSelectedUnit()?.label}
                </p>
                <p>
                  <strong>Tenant:</strong> {selectedTenant?.firstName} {selectedTenant?.lastName}
                </p>
                <p>
                  <strong>Rent:</strong> ${formData.rentAmount}/month
                </p>
                {formData.securityDeposit && (
                  <p>
                    <strong>Security Deposit:</strong> ${formData.securityDeposit}
                  </p>
                )}
                {formData.startDate && (
                  <p>
                    <strong>Start Date:</strong> {new Date(formData.startDate).toLocaleDateString()}
                  </p>
                )}
                {calculatedEndDate && (
                  <p>
                    <strong>End Date:</strong> {new Date(calculatedEndDate).toLocaleDateString()}
                  </p>
                )}
                {leaseDurationDays && (
                  <p>
                    <strong>Duration:</strong> {formatDuration(leaseDurationDays)}
                  </p>
                )}
                <p>
                  <strong>Status:</strong>{" "}
                  <Badge variant="secondary" className="ml-1 text-xs">
                    PENDING
                  </Badge>
                </p>
              </div>
            </CardContent>
            <CardContent className="p-3 flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                className="flex-1 h-7 text-xs"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmSubmit}
                className="flex-1 h-7 bg-green-600 hover:bg-green-700 text-xs"
                disabled={loading}
              >
                {loading ? "Creating..." : "Confirm"}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CreateLease;
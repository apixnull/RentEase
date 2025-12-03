import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import {
  Save,
  FileText,
  User,
  Home,
  Calendar,
  CalendarIcon,
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
  Sparkles,
  ScrollText,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import {
  createLeaseRequest,
  findTenantForLeaseRequest,
  getPropertiesWithUnitsAndTenantsRequest,
} from "@/api/landlord/leaseApi";
import { supabase } from "@/lib/supabaseClient";
import { privateApi } from "@/api/axios";

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
    dueDateOption: "MATCH_START" as "FIRST" | "MATCH_START",

    // Step 3: Documents
    leaseDocumentUrl: "",
    leaseDocumentFile: null as File | null,
    documentOption: "link" as "link" | "upload",
  });

  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
  const [leaseDurationError, setLeaseDurationError] = useState("");
  const [leaseDurationDays, setLeaseDurationDays] = useState<number | null>(null);
  const [calculatedEndDate, setCalculatedEndDate] = useState<string>("");
  const [rentAmountError, setRentAmountError] = useState("");
  const [startDatePopoverOpen, setStartDatePopoverOpen] = useState(false);
  // Prorated amount calculation kept for future use (coming soon feature)
  const [_proratedAmount, setProratedAmount] = useState<number | null>(null);
  const [showAllSuggestedTenants, setShowAllSuggestedTenants] = useState(false);
  const [showAllSearchResults, setShowAllSearchResults] = useState(false);

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
          // Reset to MATCH_START if FIRST is selected (coming soon feature)
          dueDateOption: parsedData.dueDateOption === "FIRST" ? "MATCH_START" : (parsedData.dueDateOption || "MATCH_START"),
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
        setShowAllSearchResults(false);
        return;
      }

      try {
        setIsSearchingTenants(true);
        const response = await findTenantForLeaseRequest(searchTerm);
        const data: ApiTenantsResponse = response.data;
        setSearchResults(data.tenants);
        setShowAllSearchResults(false); // Reset when new search results come in
      } catch (error) {
        console.error("Failed to search tenants:", error);
        setSearchResults([]);
        setShowAllSearchResults(false);
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
      const nickname = `${tenant.firstName} ${tenant.lastName} - ${property.title} - ${unit.label}`;
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

      // Maximum 24 months validation
      if (termMonths > 24) {
        setLeaseDurationError("Lease term cannot exceed 24 months");
        setCalculatedEndDate("");
        setLeaseDurationDays(null);
        return;
      }

      // Calculate end date by adding months to start date
      // Industry standard: For a 3-month lease starting Dec 1, end date is Feb 28 (last day of final month)
      // Method: Add months to get the first day of the month after lease ends, then subtract 1 day
      const calculatedEnd = new Date(startDate);
      
      // Add the lease term months (setMonth handles year rollover automatically)
      calculatedEnd.setMonth(calculatedEnd.getMonth() + termMonths);
      
      // Subtract 1 day to get the last day of the final lease month
      // Example: Dec 1 + 3 months = March 1, subtract 1 = Feb 28 ✓
      calculatedEnd.setDate(calculatedEnd.getDate() - 1);

      // Format end date using local time to avoid timezone issues
      const year = calculatedEnd.getFullYear();
      const month = String(calculatedEnd.getMonth() + 1).padStart(2, '0');
      const day = String(calculatedEnd.getDate()).padStart(2, '0');
      setCalculatedEndDate(`${year}-${month}-${day}`);

      // Calculate duration in days
      const timeDiff = calculatedEnd.getTime() - startDate.getTime();
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
          if (termMonths < 13 || termMonths > 24) {
            error = "Long term lease must be between 13 and 24 months";
          }
          break;
        case "FIXED_TERM":
          if (termMonths < 1) {
            error = "Lease must be at least 1 month";
          } else if (termMonths > 24) {
            error = "Lease term cannot exceed 24 months";
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

  // Auto-update due date based on selected option
  useEffect(() => {
    if (!formData.startDate) {
      setProratedAmount(null);
      return;
    }

    const startDate = new Date(formData.startDate);
    
    if (formData.dueDateOption === "MATCH_START") {
      // Option 2: Match start date (common in small rentals/boarding houses)
      const dayOfMonth = startDate.getDate();
      const safeDay = Math.min(dayOfMonth, 28); // Cap at 28 to avoid month-end issues
      setFormData((prev) => ({ ...prev, dueDate: safeDay.toString() }));
      setProratedAmount(null); // No proration needed when due date matches start date
    } else {
      // Option 1: Always 1st (most common in apartments/condos/professional rentals)
      setFormData((prev) => ({ ...prev, dueDate: "1" }));
      
      // Calculate prorated rent if start date is not the 1st
      if (startDate.getDate() !== 1 && formData.rentAmount) {
        const rentAmount = parseFloat(formData.rentAmount);
        if (!isNaN(rentAmount) && rentAmount > 0) {
          const startDay = startDate.getDate();
          const year = startDate.getFullYear();
          const month = startDate.getMonth();
          
          // Get total days in the start month
          const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
          
          // Calculate days from start date to end of month (inclusive)
          // Example: Start on Jan 15, total days = 31, days in partial month = 31 - 15 + 1 = 17
          const daysInPartialMonth = totalDaysInMonth - startDay + 1;
          
          // Calculate prorated amount: (days in partial month / total days) * monthly rent
          // This gives the tenant's share for the partial first month
          const prorated = (daysInPartialMonth / totalDaysInMonth) * rentAmount;
          setProratedAmount(Math.round(prorated * 100) / 100); // Round to 2 decimal places
        } else {
          setProratedAmount(null);
        }
      } else {
        setProratedAmount(null); // No proration needed if start is on 1st or rent is 0
      }
    }
  }, [formData.dueDateOption, formData.startDate, formData.rentAmount]);

  // Helper function to format date as YYYY-MM-DD in local time (not UTC)
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Validate rent amount
    if (field === "rentAmount") {
      const rentValue = parseFloat(value);
      if (value && (isNaN(rentValue) || rentValue < 0)) {
        setRentAmountError("Monthly rent cannot be negative");
      } else {
        setRentAmountError("");
      }
    }
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
    setShowAllSuggestedTenants(false);
    setShowAllSearchResults(false);
  };

  const clearTenantSelection = () => {
    setSelectedTenant(null);
    setFormData((prev) => ({ ...prev, tenantId: "" }));
    setSearchTerm("");
    setSearchResults([]);
  };

  const handleExit = () => {
    navigate("/landlord/leases");
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
    // Check if using local storage (development mode or explicit flag)
    const useLocalStorage =
      import.meta.env.VITE_USE_LOCAL_STORAGE === "true" ||
      import.meta.env.MODE === "development";

    if (useLocalStorage) {
      // Local storage mode: Upload to backend endpoint
      try {
        const formData = new FormData();
        formData.append("document", file);

        const response = await privateApi.post("/upload/document", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const mockUrl = response.data.url; // e.g., "/local-images/lease_documents/uuid.pdf"

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
          error.response?.data?.error || "Failed to upload document to local storage";
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }
    } else {
      // Supabase storage mode (production)
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

      const rentAmount = parseFloat(formData.rentAmount);
      
      const payload: any = {
        propertyId: formData.propertyId,
        unitId: formData.unitId,
        tenantId: formData.tenantId,
        leaseNickname: formData.leaseNickname,
        leaseType: formData.leaseType,
        startDate: formData.startDate,
        endDate: calculatedEndDate,
        securityDeposit: formData.securityDeposit
          ? parseFloat(formData.securityDeposit)
          : null,
        dueDate: parseInt(formData.dueDate),
        leaseDocumentUrl: leaseDocumentUrl || null,
        proratedAmount: null, // Prorated rent feature coming soon
      };
      
      // Only include rentAmount if it's greater than 0
      if (rentAmount > 0) {
        payload.rentAmount = rentAmount;
      }

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
          formData.rentAmount &&
          !rentAmountError &&
          parseFloat(formData.rentAmount) >= 0
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

  const getScreeningRecordDescription = (riskLevel: string | null) => {
    if (!riskLevel) {
      return "Doesn't have screening record";
    }
    return `This tenant has a screening record of ${riskLevel.toLowerCase()} risk`;
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

  // Lease term options (1-24 months)
  const leaseTermOptions = Array.from({ length: 24 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-teal-200/80 via-cyan-200/70 to-emerald-200/80 opacity-95" />
          <div className="relative m-[1px] rounded-[18px] bg-white/85 backdrop-blur-lg border border-white/70 shadow-lg">
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -top-10 -left-12 h-40 w-40 rounded-full bg-gradient-to-br from-teal-300/50 to-cyan-400/40 blur-3xl"
              initial={{ opacity: 0.4, scale: 0.85 }}
              animate={{ opacity: 0.7, scale: 1.05 }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -bottom-14 -right-10 h-48 w-48 rounded-full bg-gradient-to-tl from-emerald-200/40 to-cyan-200/35 blur-3xl"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 3.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            />

            <div className="px-5 sm:px-7 py-5 space-y-4">
              <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: [0, -3, 3, 0] }}
                    className="relative flex-shrink-0"
                  >
                    <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-600 text-white grid place-items-center shadow-xl shadow-cyan-500/30">
                      <ScrollText className="h-6 w-6 relative z-10" />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                    </div>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 220 }}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white text-teal-600 border border-teal-100 shadow-sm grid place-items-center"
                    >
                      <ShieldCheck className="h-3 w-3" />
                    </motion.div>
                  </motion.div>

                  <div className="space-y-1.5 min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-600/80">
                      Lease Builder
                    </p>
                    <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
                      Create New Lease
                    </h1>
                    <p className="text-sm text-slate-600 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-teal-500" />
                      Guided workflow • Step {currentStep} of 3
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleExit}
                    className="h-10 px-4 border-cyan-200 text-cyan-700 bg-white/80 hover:bg-white shadow-sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Exit to Leases
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-600">
                <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
                  <p className="text-xs uppercase text-slate-500">Progress</p>
                  <p className="text-base font-semibold text-slate-900">
                    {getProgressPercentage().toFixed(0)}%
                  </p>
                  <p className="text-xs text-slate-500">{steps[currentStep - 1]?.title}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
                  <p className="text-xs uppercase text-slate-500">Property</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {getSelectedProperty()?.title ?? "Not selected"}
                  </p>
                  <p className="text-xs text-slate-500">{getSelectedUnit()?.label ?? "Choose a unit"}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
                  <p className="text-xs uppercase text-slate-500">Tenant</p>
                  <p className="text-sm font-semibold text-slate-900 truncate">
                    {selectedTenant
                      ? `${selectedTenant.firstName} ${selectedTenant.lastName}`
                      : "Search tenant"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedTenant?.email ?? "No tenant selected"}
                  </p>
                </div>
              </div>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
                style={{ originX: 0 }}
                className="h-0.5 w-full bg-gradient-to-r from-teal-400/80 via-cyan-400/80 to-emerald-400/80 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        <Card className="shadow-sm border border-white/70 bg-white/90">
          <CardContent className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Guided Flow
                </p>
                <h3 className="font-semibold text-slate-900 text-base">
                  Step {currentStep} of 3
                </h3>
                <p className="text-slate-600 text-sm">
                  {steps[currentStep - 1]?.description}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Completion
                </p>
                <p className="text-lg font-semibold text-cyan-600">
                  {getProgressPercentage().toFixed(0)}%
                </p>
              </div>
            </div>

            <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                key={currentStep}
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage()}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {steps.map((step) => {
                const IconComponent = step.icon;
                const isCompleted = step.number < currentStep;
                const isCurrent = step.number === currentStep;

                return (
                  <div
                    key={step.number}
                    className={`rounded-xl border p-3 flex items-center gap-3 ${
                      isCurrent
                        ? "border-cyan-200 bg-cyan-50"
                        : isCompleted
                        ? "border-emerald-200 bg-emerald-50/60"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div
                      className={`h-10 w-10 rounded-xl grid place-items-center ${
                        isCurrent
                          ? "bg-gradient-to-br from-cyan-500 to-emerald-500 text-white"
                          : isCompleted
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <IconComponent className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        {isCompleted ? "Completed" : isCurrent ? "In Progress" : "Pending"}
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        {step.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-100 to-emerald-100 text-cyan-700 grid place-items-center">
                              <Home className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-500">Property</p>
                              <p className="text-sm font-semibold text-slate-900">
                                {getSelectedProperty()?.title ?? "Select property"}
                              </p>
                            </div>
                          </div>
                          {formData.propertyId && (
                            <Badge variant="secondary" className="text-[10px] bg-cyan-100 text-cyan-700">
                              {properties.find((p) => p.id === formData.propertyId)?.Unit.length ?? 0} units
                            </Badge>
                          )}
                        </div>
                        <div className="mt-3">
                          <Label htmlFor="propertyId" className="sr-only">Property</Label>
                          <Select
                            value={formData.propertyId}
                            onValueChange={(value) => handleInputChange("propertyId", value)}
                            disabled={isLoadingProperties}
                          >
                            <SelectTrigger className="h-10 text-sm rounded-xl border-slate-300">
                              <SelectValue
                                placeholder={isLoadingProperties ? "Loading properties..." : "Choose property"}
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {properties.map((property) => (
                                <SelectItem key={property.id} value={property.id}>
                                  <div className="flex items-center gap-2">
                                    <Building className="w-3.5 h-3.5 text-slate-500" />
                                    <div>
                                      <div className="font-medium text-xs">{property.title}</div>
                                      <div className="text-[11px] text-slate-500">
                                        {property.Unit.length} unit{property.Unit.length !== 1 ? "s" : ""}
                                      </div>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-700 grid place-items-center">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-500">Unit</p>
                              <p className="text-sm font-semibold text-slate-900">
                                {getSelectedUnit()?.label ?? "Select unit"}
                              </p>
                            </div>
                          </div>
                          {formData.unitId && getSelectedUnit() && (
                            <UnitConditionBadge condition={getSelectedUnit()!.unitCondition} />
                          )}
                        </div>
                        <div className="mt-3">
                          <Label htmlFor="unitId" className="sr-only">Unit</Label>
                          <Select
                            value={formData.unitId}
                            onValueChange={(value) => handleInputChange("unitId", value)}
                            disabled={!formData.propertyId || filteredUnits.length === 0}
                          >
                            <SelectTrigger className="h-10 text-sm rounded-xl border-slate-300">
                              <SelectValue
                                placeholder={
                                  !formData.propertyId
                                    ? "Select property first"
                                    : filteredUnits.length === 0
                                    ? "No units available"
                                    : "Choose unit"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredUnits.map((unit) => (
                                <SelectItem key={unit.id} value={unit.id}>
                                  <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-4 h-4 bg-emerald-100 rounded-full flex items-center justify-center">
                                        <span className="text-[10px] font-semibold text-emerald-700">#</span>
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
                    </div>

                    {/* Unit Condition Display */}
                    {formData.unitId && (
                      <div className="mt-2">
                        <UnitConditionDisplay condition={getSelectedUnit()?.unitCondition || "GOOD"} />
                      </div>
                    )}

                    {/* Tenant Search Section */}
                    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-purple-50 via-slate-50 to-white p-4 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-600 grid place-items-center">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">
                              Tenant search
                            </p>
                            <p className="text-sm font-semibold text-slate-900">
                              {selectedTenant
                                ? `${selectedTenant.firstName} ${selectedTenant.lastName}`
                                : "Find a tenant"}
                            </p>
                          </div>
                        </div>
                        {selectedTenant && (
                          <Badge variant="outline" className="text-[10px] border-purple-200 text-purple-600">
                            Selected
                          </Badge>
                        )}
                      </div>

                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search tenant by name or email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-10 text-sm rounded-xl border-purple-200 focus:border-purple-400 focus:ring-purple-100"
                          disabled={!!selectedTenant}
                        />
                        {isSearchingTenants && (
                          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                          </div>
                        )}
                        {selectedTenant && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={clearTenantSelection}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 text-purple-600 hover:text-purple-800"
                          >
                            ×
                          </Button>
                        )}
                      </div>

                      {selectedTenant && (
                        <div className="p-3 border border-green-200 bg-green-50 rounded-lg text-xs space-y-2">
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
                          <div className="pt-1 border-t border-green-200">
                            <p className="text-xs text-gray-700">
                              {getScreeningRecordDescription(selectedTenant.riskLevel)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Suggested Tenants */}
                      {!selectedTenant && suggestedTenants.length > 0 && searchResults.length === 0 && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-medium text-gray-600">
                              Suggested Tenants
                            </Label>
                            <Badge variant="secondary" className="text-[10px] bg-blue-100 text-blue-700">
                              {suggestedTenants.length} {suggestedTenants.length === 1 ? 'tenant' : 'tenants'}
                            </Badge>
                          </div>
                          <div className={`space-y-1.5 ${showAllSuggestedTenants ? 'max-h-96' : 'max-h-48'} overflow-y-auto border border-gray-100 rounded-lg p-1.5 bg-gray-50/50`}>
                            {(showAllSuggestedTenants ? suggestedTenants : suggestedTenants.slice(0, 5)).map((tenant) => (
                              <div
                                key={tenant.id}
                                className="p-2.5 border border-gray-200 rounded-lg text-xs cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm space-y-1.5 bg-white"
                                onClick={() => handleTenantSelect(tenant)}
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                      <User className="w-2.5 h-2.5 text-blue-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="font-medium text-xs truncate">
                                        {tenant.firstName} {tenant.lastName}
                                      </div>
                                      <div className="text-[10px] text-gray-500 truncate">{tenant.email}</div>
                                    </div>
                                  </div>
                                  <div className="flex-shrink-0">
                                    {getRiskLevelBadge(tenant.riskLevel)}
                                  </div>
                                </div>
                                <div className="pt-1 border-t border-gray-200">
                                  <p className="text-[10px] text-gray-600 line-clamp-1">
                                    {getScreeningRecordDescription(tenant.riskLevel)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          {suggestedTenants.length > 5 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowAllSuggestedTenants(!showAllSuggestedTenants)}
                              className="w-full h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              {showAllSuggestedTenants ? (
                                <>
                                  Show Less ({suggestedTenants.length - 5} hidden)
                                </>
                              ) : (
                                <>
                                  Show All {suggestedTenants.length} Tenants ({suggestedTenants.length - 5} more)
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Search Results */}
                      {!selectedTenant && searchResults.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-medium text-gray-600">Search Results</Label>
                            <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700">
                              {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
                            </Badge>
                          </div>
                          <div className={`space-y-1.5 ${showAllSearchResults ? 'max-h-96' : 'max-h-48'} overflow-y-auto border border-gray-100 rounded-lg p-1.5 bg-gray-50/50`}>
                            {(showAllSearchResults ? searchResults : searchResults.slice(0, 5)).map((tenant) => (
                              <div
                                key={tenant.id}
                                className="p-2.5 border border-gray-200 rounded-lg text-xs cursor-pointer transition-all hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm space-y-1.5 bg-white"
                                onClick={() => handleTenantSelect(tenant)}
                              >
                                <div className="flex justify-between items-start gap-2">
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                      <User className="w-2.5 h-2.5 text-blue-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="font-medium text-xs truncate">
                                        {tenant.firstName} {tenant.lastName}
                                      </div>
                                      <div className="text-[10px] text-gray-500 truncate">{tenant.email}</div>
                                    </div>
                                  </div>
                                  <div className="flex-shrink-0">
                                    {getRiskLevelBadge(tenant.riskLevel)}
                                  </div>
                                </div>
                                <div className="pt-1 border-t border-gray-200">
                                  <p className="text-[10px] text-gray-600 line-clamp-1">
                                    {getScreeningRecordDescription(tenant.riskLevel)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                          {searchResults.length > 5 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowAllSearchResults(!showAllSearchResults)}
                              className="w-full h-7 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              {showAllSearchResults ? (
                                <>
                                  Show Less ({searchResults.length - 5} hidden)
                                </>
                              ) : (
                                <>
                                  Show All {searchResults.length} Results ({searchResults.length - 5} more)
                                </>
                              )}
                            </Button>
                          )}
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
                            <SelectItem value="LONG_TERM">Long Term (13-24 months)</SelectItem>
                            <SelectItem value="FIXED_TERM">Fixed Term (1-24 months)</SelectItem>
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
                        <Label htmlFor="startDate" className="text-xs font-medium">
                          Start Date <span className="text-red-500">*</span>
                        </Label>
                        <Popover open={startDatePopoverOpen} onOpenChange={setStartDatePopoverOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              className={`w-full h-10 text-sm rounded-xl border-slate-300 justify-start text-left font-normal ${
                                !formData.startDate ? "text-muted-foreground" : ""
                              }`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.startDate ? (
                                format(new Date(formData.startDate), "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={formData.startDate ? new Date(formData.startDate) : undefined}
                              onSelect={(date) => {
                                if (date) {
                                  // Ensure selected date is between 1-28
                                  const day = date.getDate();
                                  if (day > 28) {
                                    // Adjust to 28th of the same month
                                    const adjustedDate = new Date(date);
                                    adjustedDate.setDate(28);
                                    handleInputChange("startDate", formatDateLocal(adjustedDate));
                                  } else {
                                    handleInputChange("startDate", formatDateLocal(date));
                                  }
                                  setStartDatePopoverOpen(false);
                                }
                              }}
                              disabled={(date) => {
                                const today = new Date(new Date().setHours(0, 0, 0, 0));
                                const isPast = date < today;
                                const day = date.getDate();
                                // Disable dates 29, 30, 31
                                const isInvalidDay = day > 28;
                                return isPast || isInvalidDay;
                              }}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Info className="w-3 h-3" />
                          Start date must be between 1st and 28th of the month (due dates are limited to 1-28)
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
                          Total duration of the lease (max 24 months)
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-cyan-100 bg-cyan-50 text-xs text-cyan-700 p-2.5 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-cyan-500" />
                      End date updates automatically after you choose a start date and lease term.
                    </div>

                    {/* Calculated End Date Display */}
                    {calculatedEndDate && !leaseDurationError && (
                      <div className="p-2 bg-green-50 rounded border border-green-200 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-green-800 font-medium">Lease End Date:</span>
                          <span className="text-green-700 font-semibold">
                            {format(new Date(calculatedEndDate), "MMMM d, yyyy")}
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
                          <span className="text-green-600 font-semibold">₱</span>
                          Monthly Rent <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 font-semibold text-sm">₱</span>
                          <Input
                            type="number"
                            placeholder="0.00"
                            className={`pl-7 h-8 text-xs ${
                              rentAmountError ? "border-red-300 focus:border-red-500 focus:ring-red-200" : ""
                            }`}
                            value={formData.rentAmount}
                            onChange={(e) => handleInputChange("rentAmount", e.target.value)}
                            min="0"
                            max="100000"
                            step="0.01"
                            required
                          />
                        </div>
                        {rentAmountError && (
                          <div className="flex items-center gap-1 text-xs text-red-600">
                            <AlertCircle className="w-3 h-3" />
                            {rentAmountError}
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Info className="w-3 h-3" />
                          {parseFloat(formData.rentAmount) === 0 
                            ? "If rent is 0, it will not be included in the lease"
                            : "Required monthly payment"}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="securityDeposit" className="text-xs font-medium flex items-center gap-1">
                          <Shield className="w-3 h-3 text-amber-600" />
                          Security Deposit
                        </Label>
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 font-semibold text-sm">₱</span>
                          <Input
                            type="number"
                            placeholder="0.00"
                            className="pl-7 h-8 text-xs"
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
                        <Label className="text-xs font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-blue-600" />
                          Rent Due Date <span className="text-red-500">*</span>
                        </Label>
                        
                        {/* Two Due Date Options */}
                        <div className="space-y-2">
                          {/* Option 1: Match Start Date (Recommended) */}
                          <div
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                              formData.dueDateOption === "MATCH_START"
                                ? "border-blue-500 bg-blue-50"
                                : "border-slate-200 bg-white hover:border-slate-300"
                            }`}
                            onClick={() => handleInputChange("dueDateOption", "MATCH_START")}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                formData.dueDateOption === "MATCH_START"
                                  ? "border-blue-500 bg-blue-500"
                                  : "border-slate-300 bg-white"
                              }`}>
                                {formData.dueDateOption === "MATCH_START" && (
                                  <div className="h-2 w-2 rounded-full bg-white" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-semibold text-slate-900">
                                    Match Start Date
                                  </span>
                                  <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700">
                                    Recommended
                                  </Badge>
                                </div>
                                <p className="text-xs text-slate-600">
                                  Common for small rentals and boarding houses. Rent due on the same day each month as the start date.
                                </p>
                                {formData.dueDateOption === "MATCH_START" && formData.startDate && (
                                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                                    <span className="text-green-800 font-medium">
                                      Due date: {new Date(formData.startDate).getDate()}
                                      {new Date(formData.startDate).getDate() === 1 && "st"}
                                      {new Date(formData.startDate).getDate() === 2 && "nd"}
                                      {new Date(formData.startDate).getDate() === 3 && "rd"}
                                      {new Date(formData.startDate).getDate() > 3 && "th"} of each month
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Option 2: Always 1st (Coming Soon) - Disabled */}
                          <div
                            className={`p-3 rounded-xl border-2 transition-all opacity-60 cursor-not-allowed ${
                              formData.dueDateOption === "FIRST"
                                ? "border-slate-300 bg-slate-100"
                                : "border-slate-200 bg-slate-50"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                formData.dueDateOption === "FIRST"
                                  ? "border-slate-400 bg-slate-300"
                                  : "border-slate-300 bg-slate-100"
                              }`}>
                                {formData.dueDateOption === "FIRST" && (
                                  <div className="h-2 w-2 rounded-full bg-slate-500" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-semibold text-slate-600">
                                    Always 1st of the Month
                                  </span>
                                  <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700">
                                    Coming Soon
                                  </Badge>
                                </div>
                                <p className="text-xs text-slate-500 mb-2">
                                  Standard for apartments, condos, and professional rentals. Rent due on the 1st every month.
                                  <span className="text-amber-600 font-medium ml-1">(Prorated rent feature coming soon)</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
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

                    {/* Transparency Notice */}
                    <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200 text-xs">
                      <h4 className="font-medium text-cyan-800 mb-2 flex items-center gap-1.5">
                        <Info className="w-4 h-4" />
                        Document Transparency
                      </h4>
                      <p className="text-cyan-700 leading-relaxed">
                        The lease document you upload or link will be visible to the tenant for transparency purposes. 
                        Please ensure the document is valid, complete, and contains all necessary lease terms and conditions. 
                        The tenant will be able to review this document before accepting the lease invitation.
                      </p>
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
                          <UnitConditionBadge condition={getSelectedUnit()?.unitCondition || "GOOD"} />
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

                {formData.rentAmount && parseFloat(formData.rentAmount) > 0 && (
                  <div className="flex items-start gap-1.5 p-1.5 bg-green-50 rounded">
                    <span className="text-green-600 font-semibold text-base mt-0.5">₱</span>
                    <div>
                      <p className="font-medium text-green-800">Monthly Rent</p>
                      <p className="text-green-700 font-semibold">
                        ₱{parseFloat(formData.rentAmount).toLocaleString()}
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

          </div>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Confirm Lease Creation
              </CardTitle>
              <CardDescription className="text-xs">
                Review details before creating
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Tenant Notification */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-800">
                    The tenant <strong>({selectedTenant?.email})</strong> will be notified via email. 
                    Please communicate with them to accept the lease invitation.
                  </p>
                </div>
              </div>

              {/* Lease Details */}
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-gray-600">Property:</span>
                  <span className="text-gray-900 font-medium">{getSelectedProperty()?.title}</span>
                  
                  <span className="text-gray-600">Unit:</span>
                  <span className="text-gray-900 font-medium">{getSelectedUnit()?.label}</span>
                  
                  <span className="text-gray-600">Tenant:</span>
                  <span className="text-gray-900 font-medium">
                    {selectedTenant?.firstName} {selectedTenant?.lastName}
                  </span>
                  
                  {parseFloat(formData.rentAmount) > 0 && (
                    <>
                      <span className="text-gray-600">Rent:</span>
                      <span className="text-gray-900 font-medium">
                        ₱{parseFloat(formData.rentAmount).toLocaleString()}/month
                      </span>
                    </>
                  )}
                  
                  {formData.securityDeposit && (
                    <>
                      <span className="text-gray-600">Security Deposit:</span>
                      <span className="text-gray-900 font-medium">
                        ₱{parseFloat(formData.securityDeposit).toLocaleString()}
                      </span>
                    </>
                  )}
                  
                  {formData.startDate && (
                    <>
                      <span className="text-gray-600">Start Date:</span>
                      <span className="text-gray-900 font-medium">
                        {format(new Date(formData.startDate), "MMMM d, yyyy")}
                      </span>
                    </>
                  )}
                  
                  {calculatedEndDate && (
                    <>
                      <span className="text-gray-600">End Date:</span>
                      <span className="text-gray-900 font-medium">
                        {format(new Date(calculatedEndDate), "MMMM d, yyyy")}
                      </span>
                    </>
                  )}
                  
                  {leaseDurationDays && (
                    <>
                      <span className="text-gray-600">Duration:</span>
                      <span className="text-gray-900 font-medium">
                        {formatDuration(leaseDurationDays)}
                      </span>
                    </>
                  )}
                  
                  <span className="text-gray-600">Status:</span>
                  <Badge variant="secondary" className="w-fit text-xs">
                    PENDING
                  </Badge>
                </div>
              </div>
            </CardContent>
            <div className="p-4 pt-0 flex gap-2 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowConfirmation(false)}
                className="flex-1 h-9 text-sm"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={confirmSubmit}
                disabled={loading}
                className="flex-1 h-9 text-sm bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-md"
              >
                {loading ? "Creating..." : "Create Lease"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  </div>
  );
};

export default CreateLease;
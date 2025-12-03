import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Skeleton } from "@/components/ui/skeleton";
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
  Building,
  MapPin,
  Clock,
  Info,
  Sparkles,
  ScrollText,
  ArrowLeft,
  Edit,
  CheckCircle,
  AlertCircle,
  Wrench,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  getLeaseByIdRequest,
  updateLeaseRequest,
  getPropertiesWithUnitsRequest,
} from "@/api/landlord/leaseApi";
import { supabase } from "@/lib/supabaseClient";
import { privateApi } from "@/api/axios";

interface Lease {
  id: string;
  propertyId: string;
  unitId: string;
  tenantId: string;
  leaseNickname: string | null;
  leaseType: "STANDARD" | "SHORT_TERM" | "LONG_TERM" | "FIXED_TERM";
  startDate: string;
  endDate: string | null;
  rentAmount: number;
  securityDeposit: number | null;
  dueDate: number;
  leaseDocumentUrl: string | null;
  status: string;
  property: {
    id: string;
    title: string;
  };
  unit: {
    id: string;
    label: string;
  };
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Property {
  id: string;
  title: string;
  Unit: Unit[];
}

interface Unit {
  id: string;
  label: string;
  unitCondition?: string;
}

const EditLease = () => {
  const { leaseId } = useParams<{ leaseId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lease, setLease] = useState<Lease | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<Unit[]>([]);
  const [startDatePopoverOpen, setStartDatePopoverOpen] = useState(false);

  const [formData, setFormData] = useState({
    propertyId: "",
    unitId: "",
    leaseNickname: "",
    leaseType: "STANDARD" as "STANDARD" | "SHORT_TERM" | "LONG_TERM" | "FIXED_TERM",
    startDate: "",
    leaseTermMonths: "12",
    rentAmount: "",
    securityDeposit: "",
    dueDate: "1",
    dueDateOption: "MATCH_START" as "FIRST" | "MATCH_START",
    leaseDocumentUrl: "",
    leaseDocumentFile: null as File | null,
    documentOption: "link" as "link" | "upload",
  });

  const [calculatedEndDate, setCalculatedEndDate] = useState<string>("");
  const [leaseDurationError, setLeaseDurationError] = useState("");
  const [leaseDurationDays, setLeaseDurationDays] = useState<number | null>(null);
  const [rentAmountError, setRentAmountError] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Helper function to format date as YYYY-MM-DD in local time
  const formatDateLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Fetch lease data and properties
  useEffect(() => {
    const fetchData = async () => {
      if (!leaseId) return;

      try {
        setLoading(true);
        
        // Fetch lease details
        const leaseResponse = await getLeaseByIdRequest(leaseId);
        const leaseData = leaseResponse.data.lease;
        setLease(leaseData);

        // Fetch properties for dropdown - use financial API which doesn't filter by lease status
        const propertiesResponse = await getPropertiesWithUnitsRequest();
        const propertiesData = propertiesResponse.data.properties;
        setProperties(propertiesData);

        // Calculate lease term months from start and end date
        let termMonths = "12";
        if (leaseData.startDate && leaseData.endDate) {
          const start = new Date(leaseData.startDate);
          const end = new Date(leaseData.endDate);
          const months = Math.round(
            (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)
          );
          termMonths = months.toString();
        }

        // Filter units for selected property BEFORE setting form data
        const selectedProperty = propertiesData.find(
          (p: Property) => p.id === leaseData.propertyId
        );
        const unitsForProperty = selectedProperty?.Unit || [];
        
        // Verify unit exists in the property's units
        const unitExists = unitsForProperty.some((u: Unit) => u.id === leaseData.unitId);
        const finalUnitId = unitExists ? leaseData.unitId : "";
        
        // Set filtered units first - this ensures units are available when formData is set
        setFilteredUnits(unitsForProperty);

        // Generate lease nickname if property, unit, and tenant are available
        let generatedNickname = leaseData.leaseNickname || "";
        if (selectedProperty && unitsForProperty.length > 0 && leaseData.tenant && unitExists) {
          const selectedUnit = unitsForProperty.find((u: Unit) => u.id === leaseData.unitId);
          if (selectedUnit) {
            generatedNickname = `${leaseData.tenant.firstName} ${leaseData.tenant.lastName} - ${selectedProperty.title} - ${selectedUnit.label}`;
          }
        }

        // Determine due date option based on existing due date
        // If due date is 1, it might be "FIRST" option, otherwise it's "MATCH_START"
        // For now, default to MATCH_START since FIRST is coming soon
        const dueDateOption = leaseData.dueDate === 1 ? "FIRST" : "MATCH_START";
        // Always use MATCH_START if FIRST is selected (coming soon feature)
        const finalDueDateOption = dueDateOption === "FIRST" ? "MATCH_START" : dueDateOption;

        // Populate form with existing lease data - ensure propertyId and unitId are set correctly as strings
        setFormData({
          propertyId: String(leaseData.propertyId || ""),
          unitId: String(finalUnitId || ""),
          leaseNickname: generatedNickname,
          leaseType: leaseData.leaseType,
          startDate: leaseData.startDate ? formatDateLocal(new Date(leaseData.startDate)) : "",
          leaseTermMonths: termMonths,
          rentAmount: leaseData.rentAmount.toString(),
          securityDeposit: leaseData.securityDeposit?.toString() || "",
          dueDate: leaseData.dueDate.toString(),
          dueDateOption: finalDueDateOption,
          leaseDocumentUrl: leaseData.leaseDocumentUrl || "",
          leaseDocumentFile: null,
          documentOption: leaseData.leaseDocumentUrl ? "link" : "upload",
        });
      } catch (error: any) {
        console.error("Failed to fetch lease data:", error);
        toast.error(error?.response?.data?.error || "Failed to load lease data");
        navigate("/landlord/leases");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [leaseId, navigate]);

  // Filter units when property changes
  useEffect(() => {
    if (formData.propertyId) {
      const selectedProperty = properties.find((p) => p.id === formData.propertyId);
      const units = selectedProperty?.Unit || [];
      setFilteredUnits(units);
      
      // If current unit is not in the new property's units, clear unit selection
      if (formData.unitId && !units.find((u) => u.id === formData.unitId)) {
        setFormData((prev) => ({ ...prev, unitId: "" }));
      }
    } else {
      setFilteredUnits([]);
    }
  }, [formData.propertyId, properties]);

  // Auto-generate lease nickname when property, unit changes
  useEffect(() => {
    if (!lease) return;
    
    const property = properties.find((p) => p.id === formData.propertyId);
    const unit = filteredUnits.find((u) => u.id === formData.unitId);

    if (property && unit && lease.tenant) {
      const nickname = `${lease.tenant.firstName} ${lease.tenant.lastName} - ${property.title} - ${unit.label}`;
      setFormData((prev) => ({ ...prev, leaseNickname: nickname }));
    }
  }, [formData.propertyId, formData.unitId, properties, filteredUnits, lease]);

  // Calculate end date based on start date and term
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

      if (termMonths > 24) {
        setLeaseDurationError("Lease term cannot exceed 24 months");
        setCalculatedEndDate("");
        setLeaseDurationDays(null);
        return;
      }

      // Calculate end date
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + termMonths);
      endDate.setDate(endDate.getDate() - 1); // Make it inclusive

      const year = endDate.getFullYear();
      const month = String(endDate.getMonth() + 1).padStart(2, "0");
      const day = String(endDate.getDate()).padStart(2, "0");
      setCalculatedEndDate(`${year}-${month}-${day}`);

      // Calculate duration in days
      const timeDiff = endDate.getTime() - startDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      setLeaseDurationDays(daysDiff);
      setLeaseDurationError("");
    } else {
      setCalculatedEndDate("");
      setLeaseDurationDays(null);
      setLeaseDurationError("");
    }
  }, [formData.startDate, formData.leaseTermMonths]);

  // Auto-update due date based on selected option
  useEffect(() => {
    if (!formData.startDate) {
      return;
    }

    const startDate = new Date(formData.startDate);
    
    if (formData.dueDateOption === "MATCH_START") {
      // Option: Match start date (common in small rentals/boarding houses)
      const dayOfMonth = startDate.getDate();
      const safeDay = Math.min(dayOfMonth, 28); // Cap at 28 to avoid month-end issues
      setFormData((prev) => ({ ...prev, dueDate: safeDay.toString() }));
    } else {
      // Option: Always 1st (coming soon - disabled)
      setFormData((prev) => ({ ...prev, dueDate: "1" }));
    }
  }, [formData.dueDateOption, formData.startDate]);

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

    if (!leaseId) return;

    // Validation
    if (!formData.propertyId || !formData.unitId || !formData.startDate || !formData.rentAmount || !formData.dueDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (leaseDurationError) {
      toast.error(leaseDurationError);
      return;
    }

    // Show confirmation modal instead of submitting directly
    setShowConfirmation(true);
  };

  const confirmSubmit = async () => {
    if (!leaseId) return;

    setShowConfirmation(false);
    setSubmitting(true);

    try {
      let leaseDocumentUrl = formData.leaseDocumentUrl;

      // Upload file if provided
      if (formData.documentOption === "upload" && formData.leaseDocumentFile) {
        leaseDocumentUrl = await uploadLeaseDocument(formData.leaseDocumentFile);
      }

      const payload: any = {
        propertyId: formData.propertyId,
        unitId: formData.unitId,
        leaseNickname: formData.leaseNickname || null,
        leaseType: formData.leaseType,
        startDate: formData.startDate,
        endDate: calculatedEndDate || null,
        rentAmount: parseFloat(formData.rentAmount),
        dueDate: parseInt(formData.dueDate),
        securityDeposit: formData.securityDeposit ? parseFloat(formData.securityDeposit) : null,
        leaseDocumentUrl: leaseDocumentUrl || null,
      };

      await updateLeaseRequest(leaseId, payload);

      toast.success("Lease updated successfully!");
      navigate(`/landlord/leases/${leaseId}/details`);
    } catch (error: any) {
      console.error("Failed to update lease:", error);
      toast.error(error?.response?.data?.error || "Failed to update lease. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getSelectedProperty = () => properties.find((p) => p.id === formData.propertyId);
  const getSelectedUnit = () => filteredUnits.find((u) => u.id === formData.unitId);

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

  const leaseTermOptions = Array.from({ length: 24 }, (_, i) => i + 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto space-y-5">
          {/* Header Skeleton */}
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-amber-200/80 via-orange-200/70 to-amber-200/80 opacity-95" />
            <div className="relative m-[1px] rounded-[18px] bg-white/85 backdrop-blur-lg border border-white/70 shadow-lg">
              <div className="px-5 sm:px-7 py-5 space-y-4">
                <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <Skeleton className="h-12 w-12 rounded-2xl" />
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-7 w-48" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-32" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                  <Skeleton className="h-20 rounded-xl" />
                </div>
                <Skeleton className="h-0.5 w-full rounded-full" />
              </div>
            </div>
          </div>

          {/* Form Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3 space-y-4">
              {/* Basic Info Card Skeleton */}
              <Card className="shadow-md border-0">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b p-3">
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                  <Skeleton className="h-24 w-full rounded-2xl" />
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Skeleton className="h-32 rounded-2xl" />
                    <Skeleton className="h-32 rounded-2xl" />
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                  </div>
                </CardContent>
              </Card>

              {/* Terms & Financial Card Skeleton */}
              <Card className="shadow-md border-0">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b p-3">
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                  </div>
                  <Skeleton className="h-12 rounded-xl" />
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                    <Skeleton className="h-16" />
                  </div>
                </CardContent>
              </Card>

              {/* Documents Card Skeleton */}
              <Card className="shadow-md border-0">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b p-3">
                  <Skeleton className="h-6 w-28" />
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 rounded-lg" />
                </CardContent>
              </Card>

              {/* Buttons Skeleton */}
              <div className="flex justify-end gap-4 pt-3">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-32" />
              </div>
            </div>

            {/* Sidebar Skeleton */}
            <div className="space-y-3">
              <Card className="shadow-sm border-0 sticky top-3">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-amber-50 border-b p-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="p-2 space-y-2">
                  <Skeleton className="h-16 rounded" />
                  <Skeleton className="h-16 rounded" />
                  <Skeleton className="h-16 rounded" />
                  <Skeleton className="h-16 rounded" />
                  <Skeleton className="h-16 rounded" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!lease) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <p>Lease not found</p>
          <Button onClick={() => navigate("/landlord/leases")}>Back to Leases</Button>
        </div>
      </div>
    );
  }

  if (lease.status !== "PENDING") {
    return (
      <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-lg font-semibold mb-4">Only pending leases can be edited.</p>
              <Button onClick={() => navigate(`/landlord/leases/${leaseId}/details`)}>
                Back to Lease Details
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-5">
        {/* Header Section - Matching CreateLease design */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-amber-200/80 via-orange-200/70 to-amber-200/80 opacity-95" />
          <div className="relative m-[1px] rounded-[18px] bg-white/85 backdrop-blur-lg border border-white/70 shadow-lg">
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -top-10 -left-12 h-40 w-40 rounded-full bg-gradient-to-br from-amber-300/50 to-orange-400/40 blur-3xl"
              initial={{ opacity: 0.4, scale: 0.85 }}
              animate={{ opacity: 0.7, scale: 1.05 }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -bottom-14 -right-10 h-48 w-48 rounded-full bg-gradient-to-tl from-orange-200/40 to-amber-200/35 blur-3xl"
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
                    <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-600 via-orange-600 to-amber-600 text-white grid place-items-center shadow-xl shadow-orange-500/30">
                      <Edit className="h-6 w-6 relative z-10" />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                    </div>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 220 }}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white text-amber-600 border border-amber-100 shadow-sm grid place-items-center"
                    >
                      <ScrollText className="h-3 w-3" />
                    </motion.div>
                  </motion.div>

                  <div className="space-y-1.5 min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-orange-600/80">
                      Lease Editor
                    </p>
                    <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
                      Edit Lease Agreement
                    </h1>
                    <p className="text-sm text-slate-600 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-amber-500" />
                      Update lease details • All fields visible
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/landlord/leases/${leaseId}/details`)}
                    className="h-10 px-4 border-orange-200 text-orange-700 bg-white/80 hover:bg-white shadow-sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Details
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-slate-600">
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
                    {lease.tenant.firstName} {lease.tenant.lastName}
                  </p>
                  <p className="text-xs text-slate-500">{lease.tenant.email}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white/80 p-3">
                  <p className="text-xs uppercase text-slate-500">Status</p>
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                    {lease.status}
                  </Badge>
                </div>
              </div>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.45, ease: "easeOut", delay: 0.1 }}
                style={{ originX: 0 }}
                className="h-0.5 w-full bg-gradient-to-r from-amber-400/80 via-orange-400/80 to-amber-400/80 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Main Form */}
            <div className="lg:col-span-3 space-y-4">
              {/* Basic Info Section */}
              <Card className="shadow-md border-0">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b p-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-gray-800">
                    <div className="p-1 rounded bg-blue-100 text-blue-600">
                      <Building className="w-3 h-3" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold">Basic Information</div>
                      <CardDescription className="text-gray-600 text-xs">
                        Property, unit, and lease details
                      </CardDescription>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                  {/* Tenant Info (Read-only) */}
                  <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 via-slate-50 to-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-600 grid place-items-center">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">Tenant</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {lease.tenant.firstName} {lease.tenant.lastName}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] border-purple-200 text-purple-600">
                        Cannot be changed
                      </Badge>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      {lease.tenant.email}
                    </div>
                  </div>

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
                        >
                          <SelectTrigger className="h-10 text-sm rounded-xl border-slate-300">
                            <SelectValue placeholder="Choose property" />
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
                          <UnitConditionBadge condition={getSelectedUnit()!.unitCondition || "GOOD"} />
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
                                  <UnitConditionBadge condition={unit.unitCondition || "GOOD"} />
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

                  {/* Lease Details */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="leaseNickname" className="text-xs font-medium">
                        Lease Nickname
                      </Label>
                      <Input
                        placeholder="e.g., John's Sunset Apartment Lease"
                        value={formData.leaseNickname}
                        onChange={(e) => handleInputChange("leaseNickname", e.target.value)}
                        className="h-8 text-xs"
                      />
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
                </CardContent>
              </Card>

              {/* Terms & Financial Section */}
              <Card className="shadow-md border-0">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b p-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-gray-800">
                    <div className="p-1 rounded bg-green-100 text-green-600">
                      <DollarSign className="w-3 h-3" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold">Terms & Financial</div>
                      <CardDescription className="text-gray-600 text-xs">
                        Duration and payment details
                      </CardDescription>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
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
                                handleInputChange("startDate", formatDateLocal(date));
                                setStartDatePopoverOpen(false);
                              }
                            }}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
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
                          className={`pl-6 h-8 text-xs ${
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
                          <Info className="w-3 h-3" />
                          {rentAmountError}
                        </div>
                      )}
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
                </CardContent>
              </Card>

              {/* Documents Section */}
              <Card className="shadow-md border-0">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b p-3">
                  <CardTitle className="flex items-center gap-2 text-sm text-gray-800">
                    <div className="p-1 rounded bg-purple-100 text-purple-600">
                      <FileText className="w-3 h-3" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold">Documents</div>
                      <CardDescription className="text-gray-600 text-xs">
                        Lease agreement and signatures
                      </CardDescription>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
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

                  <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200 text-xs">
                    <h4 className="font-medium text-cyan-800 mb-2 flex items-center gap-1.5">
                      <Info className="w-4 h-4" />
                      Document Transparency
                    </h4>
                    <p className="text-cyan-700 leading-relaxed">
                      The lease document you upload or link will be visible to the tenant for transparency purposes.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-4 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/landlord/leases/${leaseId}/details`)}
                  disabled={submitting}
                  className="h-8 px-3 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-8 px-3 text-xs bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                >
                  <Save className="w-3 h-3 mr-1" />
                  {submitting ? "Updating..." : "Update Lease"}
                </Button>
              </div>
            </div>

            {/* Sidebar - Summary */}
            <div className="space-y-3">
              <Card className="shadow-sm border-0 sticky top-3">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-amber-50 border-b p-2">
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

                  <div className="flex items-start gap-1.5 p-1.5 bg-purple-50 rounded">
                    <User className="w-3 h-3 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-purple-800">Tenant</p>
                      <p className="text-purple-700">
                        {lease.tenant.firstName} {lease.tenant.lastName}
                      </p>
                    </div>
                  </div>

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
                      <DollarSign className="w-3 h-3 text-green-600 mt-0.5" />
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
                  <Shield className="w-5 h-5 text-amber-600" />
                  Confirm Lease Update
                </CardTitle>
                <CardDescription className="text-xs">
                  Review details before updating
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Update Notice */}
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-800">
                      The tenant <strong>({lease?.tenant.email})</strong> will be notified of any changes to the lease agreement.
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
                      {lease?.tenant.firstName} {lease?.tenant.lastName}
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
                      {lease?.status}
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
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={confirmSubmit}
                  disabled={submitting}
                  className="flex-1 h-9 text-sm bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md"
                >
                  {submitting ? "Updating..." : "Update Lease"}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditLease;

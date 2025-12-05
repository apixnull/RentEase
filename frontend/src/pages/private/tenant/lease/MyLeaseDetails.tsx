import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar,
  Home,
  User,
  FileText,
  CheckCircle,
  XCircle,
  MapPin,
  Building,
  Phone,
  Mail,
  Clock,
  Download,
  CreditCard,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  ToolCase,
  ScrollText,
  DollarSign,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Plus,
  X,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { getLeaseDetailsRequest, handleTenantLeaseActionRequest } from '@/api/tenant/leaseApi';
import { getAllTenantMaintenanceRequestsRequest, createMaintenanceRequestRequest, cancelMaintenanceRequestRequest } from '@/api/tenant/maintenanceApi';
import { privateApi } from '@/api/axios';
import { getLocalImageUrl, processImageUrl, getBackendBaseUrl } from '@/api/utils';
import { supabase } from '@/lib/supabaseClient';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

// Complete Color Schema for Lease Statuses
const LEASE_STATUS_THEME = {
  PENDING: {
    // Badge & Pill
    badge: "bg-amber-50 border border-amber-200 text-amber-700",
    pill: "bg-amber-100 text-amber-800",
    
    // Gradients
    gradient: "from-amber-500 to-orange-500",
    gradientLight: "from-amber-200/70 via-amber-100/50 to-amber-200/70",
    gradientButton: "from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700",
    
    // Backgrounds
    background: "bg-amber-50 border-amber-300",
    backgroundCard: "bg-gradient-to-br from-amber-50 to-orange-50",
    
    // Icon & Text
    iconBackground: "bg-amber-500",
    textColor: "text-amber-700",
    textColorDark: "text-amber-900",
    textColorLight: "text-amber-600",
    
    // Blur Effects
    blurLight: "bg-amber-200/40",
    blurDark: "bg-amber-300/40",
    
    // Borders
    border: "border-amber-200",
    borderDark: "border-amber-300",
    borderCard: "border-2 border-amber-300",
    
    // Timeline (if needed)
    timelineActive: "bg-amber-500 ring-4 ring-amber-200",
    timelineCompleted: "bg-amber-500",
    timelineLine: "bg-amber-300",
  },
  ACTIVE: {
    // Badge & Pill
    badge: "bg-emerald-50 border border-emerald-200 text-emerald-700",
    pill: "bg-emerald-100 text-emerald-800",
    
    // Gradients
    gradient: "from-emerald-500 to-teal-500",
    gradientLight: "from-emerald-200/70 via-emerald-100/50 to-emerald-200/70",
    gradientButton: "from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700",
    
    // Backgrounds
    background: "bg-emerald-50 border-emerald-300",
    backgroundCard: "bg-gradient-to-br from-emerald-50 to-teal-50",
    
    // Icon & Text
    iconBackground: "bg-emerald-500",
    textColor: "text-emerald-700",
    textColorDark: "text-emerald-900",
    textColorLight: "text-emerald-600",
    
    // Blur Effects
    blurLight: "bg-emerald-200/40",
    blurDark: "bg-emerald-300/40",
    
    // Borders
    border: "border-emerald-200",
    borderDark: "border-emerald-300",
    borderCard: "border-2 border-emerald-300",
    
    // Timeline (if needed)
    timelineActive: "bg-emerald-500 ring-4 ring-emerald-200",
    timelineCompleted: "bg-emerald-500",
    timelineLine: "bg-emerald-300",
  },
  COMPLETED: {
    // Badge & Pill
    badge: "bg-blue-50 border border-blue-200 text-blue-700",
    pill: "bg-blue-100 text-blue-800",
    
    // Gradients
    gradient: "from-blue-600 to-indigo-600",
    gradientLight: "from-blue-200/70 via-blue-100/50 to-blue-200/70",
    gradientButton: "from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700",
    
    // Backgrounds
    background: "bg-blue-50 border-blue-300",
    backgroundCard: "bg-gradient-to-br from-blue-50 to-cyan-50",
    
    // Icon & Text
    iconBackground: "bg-blue-500",
    textColor: "text-blue-700",
    textColorDark: "text-blue-900",
    textColorLight: "text-blue-600",
    
    // Blur Effects
    blurLight: "bg-blue-200/40",
    blurDark: "bg-blue-300/40",
    
    // Borders
    border: "border-blue-200",
    borderDark: "border-blue-300",
    borderCard: "border-2 border-blue-300",
    
    // Timeline (if needed)
    timelineActive: "bg-blue-500 ring-4 ring-blue-200",
    timelineCompleted: "bg-blue-500",
    timelineLine: "bg-blue-300",
  },
  TERMINATED: {
    // Badge & Pill
    badge: "bg-rose-50 border border-rose-200 text-rose-700",
    pill: "bg-rose-100 text-rose-800",
    
    // Gradients
    gradient: "from-rose-500 to-red-500",
    gradientLight: "from-rose-200/70 via-rose-100/50 to-rose-200/70",
    gradientButton: "from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700",
    
    // Backgrounds
    background: "bg-rose-50 border-rose-300",
    backgroundCard: "bg-gradient-to-br from-rose-50 to-red-50",
    
    // Icon & Text
    iconBackground: "bg-rose-500",
    textColor: "text-rose-700",
    textColorDark: "text-rose-900",
    textColorLight: "text-rose-600",
    
    // Blur Effects
    blurLight: "bg-rose-200/40",
    blurDark: "bg-rose-300/40",
    
    // Borders
    border: "border-rose-200",
    borderDark: "border-rose-300",
    borderCard: "border-2 border-rose-300",
    
    // Timeline (if needed)
    timelineActive: "bg-rose-500 ring-4 ring-rose-200",
    timelineCompleted: "bg-rose-500",
    timelineLine: "bg-rose-300",
  },
  CANCELLED: {
    // Badge & Pill
    badge: "bg-slate-50 border border-slate-200 text-slate-700",
    pill: "bg-slate-100 text-slate-700",
    
    // Gradients
    gradient: "from-slate-500 to-gray-500",
    gradientLight: "from-slate-200/70 via-slate-100/50 to-slate-200/70",
    gradientButton: "from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700",
    
    // Backgrounds
    background: "bg-slate-50 border-slate-300",
    backgroundCard: "bg-gradient-to-br from-slate-50 to-gray-50",
    
    // Icon & Text
    iconBackground: "bg-slate-500",
    textColor: "text-slate-700",
    textColorDark: "text-slate-900",
    textColorLight: "text-slate-600",
    
    // Blur Effects
    blurLight: "bg-slate-200/40",
    blurDark: "bg-slate-300/40",
    
    // Borders
    border: "border-slate-200",
    borderDark: "border-slate-300",
    borderCard: "border-2 border-slate-300",
    
    // Timeline (if needed)
    timelineActive: "bg-slate-500 ring-4 ring-slate-200",
    timelineCompleted: "bg-slate-500",
    timelineLine: "bg-slate-300",
  },
} as const;

interface LeaseDetails {
  id: string;
  leaseNickname: string;
  leaseType: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  securityDeposit: number | null;
  interval: string;
  dueDate: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  totalPaymentsMade: number;
  lastPaymentDate: string | null;
  leaseDocumentUrl: string | null;
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    gender: string;
    role: string;
    avatarUrl: string | null;
  };
  landlord: {
    id: string;
    firstName: string;
    lastName: string;
    gender: string;
    email: string;
    phoneNumber: string;
    role: string;
    avatarUrl: string | null;
  };
  property: {
    id: string;
    title: string;
    type: string;
    street: string;
    barangay: string;
    zipCode: string;
    city: {
      name: string;
    };
    municipality: null;
  };
  unit: {
    id: string;
    label: string;
  };
  payments: Array<{
    id: string;
    leaseId: string;
    amount: number;
    paidAt: string | null;
    method: string | null;
    paymentProofUrl: string | null;
    dueDate: string;
    status: string;
    timingStatus: string | null;
    type: string | null;
    note: string | null;
    reminderStage: number;
    createdAt: string;
    updatedAt: string;
  }>;
}

const MyLeaseDetails = () => {
  const { leaseId } = useParams<{ leaseId: string }>();
  const navigate = useNavigate();
  const [lease, setLease] = useState<LeaseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('lease');
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [noteModal, setNoteModal] = useState<{ isOpen: boolean; note: string | null }>({
    isOpen: false,
    note: null,
  });
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);
  const [showCreateMaintenanceModal, setShowCreateMaintenanceModal] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    description: '',
    photo: null as File | null,
    photoPreview: '',
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submittingMaintenance, setSubmittingMaintenance] = useState(false);
  const [cancelModal, setCancelModal] = useState<{ isOpen: boolean; requestId: string | null }>({
    isOpen: false,
    requestId: null,
  });
  const [cancelling, setCancelling] = useState(false);
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean; request: any | null }>({
    isOpen: false,
    request: null,
  });
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Load active tab from session storage on component mount
  useEffect(() => {
    const savedTab = sessionStorage.getItem(`lease-${leaseId}-activeTab`);
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, [leaseId]);

  // Save active tab to session storage whenever it changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    sessionStorage.setItem(`lease-${leaseId}-activeTab`, value);
  };

  const fetchLeaseDetails = async (signal?: AbortSignal, silent = false) => {
    if (!leaseId) return;
    
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      const response = await getLeaseDetailsRequest(leaseId, { signal });
      setLease(response.data.lease);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('Failed to fetch lease details');
        console.error('Error fetching lease details:', err);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  const handleRefresh = () => {
    if (!refreshing) {
      fetchLeaseDetails(undefined, true);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchLeaseDetails(controller.signal);

    return () => {
      controller.abort();
    };
  }, [leaseId]);

  // Fetch maintenance requests when lease is loaded and active
  useEffect(() => {
    if (lease && lease.status === 'ACTIVE') {
      fetchMaintenanceRequests();
    }
  }, [lease]);

  const fetchMaintenanceRequests = async () => {
    try {
      setLoadingMaintenance(true);
      const response = await getAllTenantMaintenanceRequestsRequest();
      // Filter to only show requests for this specific lease
      const leaseRequests = response.data.maintenanceRequests.filter(
        (req: any) => req.propertyId === lease?.property.id && req.unitId === lease?.unit.id
      );
      setMaintenanceRequests(leaseRequests);
    } catch (err: any) {
      console.error('Error fetching maintenance requests:', err);
    } finally {
      setLoadingMaintenance(false);
    }
  };

  // Generate UUID for file naming
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

  // Upload photo (dual-mode: local for development, Supabase for production)
  const uploadMaintenancePhoto = async (file: File): Promise<string> => {
    // Check if using local storage (development mode or explicit flag)
    const useLocalStorage =
      import.meta.env.VITE_USE_LOCAL_STORAGE === "true" ||
      import.meta.env.MODE === "development";

    if (useLocalStorage) {
      // Local storage mode: Upload to backend endpoint
      try {
        const formData = new FormData();
        formData.append("image", file);

        const response = await privateApi.post("/upload/maintenance-image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const mockUrl = response.data.url; // e.g., "/local-images/maintenance_request/uuid.jpg"

        // In development, prepend backend URL to make it accessible
        if (import.meta.env.MODE === "development") {
          return getLocalImageUrl(mockUrl);
        }

        // In production with local storage, return as-is (backend should handle full URL)
        return mockUrl;
      } catch (error: any) {
        console.error("Local upload error:", error);
        throw new Error(
          error.response?.data?.error || "Failed to upload photo to local storage"
        );
      }
    } else {
      // Supabase storage mode (production)
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${generateUUID()}.${fileExt}`;
        const filePath = `maintenance_request/${fileName}`;

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
        console.error("Error uploading maintenance photo to Supabase:", error);
        throw new Error(`Failed to upload photo: ${error}`);
      }
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setMaintenanceForm({
          ...maintenanceForm,
          photo: file,
          photoPreview: URL.createObjectURL(file),
        });
      } else {
        alert("Please select a valid image file");
      }
    }
  };

  const handleCreateMaintenanceRequest = async () => {
    if (!lease || !maintenanceForm.description.trim()) {
      alert("Please provide a description for the maintenance request");
      return;
    }
    if (!maintenanceForm.photo) {
      alert("Please upload a photo of the maintenance issue. A clear photo helps your landlord understand the problem better.");
      return;
    }

    try {
      setSubmittingMaintenance(true);
      setUploadingPhoto(true);

      let photoUrl: string | null = null;
      if (maintenanceForm.photo) {
        photoUrl = await uploadMaintenancePhoto(maintenanceForm.photo);
      }

      await createMaintenanceRequestRequest({
        propertyId: lease.property.id,
        unitId: lease.unit.id,
        description: maintenanceForm.description.trim(),
        photoUrl,
      });

      // Reset form
      setMaintenanceForm({
        description: '',
        photo: null,
        photoPreview: '',
      });
      setShowCreateMaintenanceModal(false);

      // Refresh maintenance requests
      await fetchMaintenanceRequests();
    } catch (error: any) {
      console.error("Error creating maintenance request:", error);
      alert(error?.response?.data?.error || error?.message || "Failed to create maintenance request");
    } finally {
      setSubmittingMaintenance(false);
      setUploadingPhoto(false);
    }
  };

  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'IN_PROGRESS':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'RESOLVED':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'CANCELLED':
        return 'bg-gray-50 border-gray-200 text-gray-700';
      case 'INVALID':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const handleCancelMaintenanceRequest = async () => {
    if (!cancelModal.requestId) return;

    try {
      setCancelling(true);
      await cancelMaintenanceRequestRequest(cancelModal.requestId);
      setCancelModal({ isOpen: false, requestId: null });
      await fetchMaintenanceRequests();
    } catch (error: any) {
      console.error("Error cancelling maintenance request:", error);
      alert(error?.response?.data?.error || error?.message || "Failed to cancel maintenance request");
    } finally {
      setCancelling(false);
    }
  };

  const handleLeaseActionClick = (action: 'accept' | 'reject') => {
    if (action === 'accept') {
      setShowAcceptModal(true);
    } else {
      setShowRejectModal(true);
    }
  };

  const handleLeaseAction = async (action: 'accept' | 'reject') => {
    if (!leaseId) return;

    try {
      setActionLoading(action);
      setMessage(null);
      if (action === 'accept') {
        setShowAcceptModal(false);
      } else {
        setShowRejectModal(false);
      }
      
      const response = await handleTenantLeaseActionRequest(leaseId, action);
      setMessage(response.data.message || `Lease ${action}ed successfully`);
      
      // Refetch lease details to get updated status
      await fetchLeaseDetails();
    } catch (err: any) {
      setError(`Failed to ${action} lease: ${err.response?.data?.message || err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  // Format currency for PDF (explicit PHP prefix)
  const formatCurrencyForPDF = (amount: number) => {
    return `PHP ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Get ordinal suffix helper
  const getOrdinalSuffix = (number: number) => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const value = number % 100;
    return number + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
  };

  // Get interval display helper
  const getIntervalDisplay = (interval: string) => {
    switch (interval) {
      case 'DAILY':
        return 'daily';
      case 'WEEKLY':
        return 'weekly';
      case 'MONTHLY':
        return 'monthly';
      default:
        return interval.toLowerCase();
    }
  };

  // Get lease type display helper
  const getLeaseTypeDisplay = (leaseType: string) => {
    return leaseType.replace('_', ' ');
  };

  // Generate PDF for lease
  const generateLeasePDF = () => {
    if (!lease) return;

    try {
      setGeneratingPdf(true);

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = margin;

      // RentEase Branding Header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.text('RentEase', pageWidth / 2, yPos, { align: 'center' });
      yPos += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Property Management Platform', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      // Divider line
      doc.setDrawColor(200, 200, 200);
      doc.line(14, yPos, pageWidth - 14, yPos);
      yPos += 12;

      // Lease Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      const leaseTitle = lease.leaseNickname || `${lease.property.title} - ${lease.unit.label}`;
      doc.text('Lease Agreement Details', pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(leaseTitle, pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;

      // Generated At timestamp
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      const generatedAt = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.text(`Generated at: ${generatedAt}`, pageWidth / 2, yPos, { align: 'center' });
      yPos += 8;

      // Status Badge
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`Status: ${lease.status}`, 14, yPos);
      yPos += 8;

      // Lease Information Section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Lease Information', 14, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const leaseInfo = [
        [`Lease Type:`, getLeaseTypeDisplay(lease.leaseType)],
        [`Start Date:`, formatDate(lease.startDate)],
        [`End Date:`, formatDate(lease.endDate)],
        [`Rent Amount:`, formatCurrencyForPDF(lease.rentAmount)],
        [`Security Deposit:`, lease.securityDeposit ? formatCurrencyForPDF(lease.securityDeposit) : 'None'],
        [`Payment Interval:`, getIntervalDisplay(lease.interval)],
        [`Due Date:`, `${getOrdinalSuffix(lease.dueDate)} each ${getIntervalDisplay(lease.interval)}`],
      ];

      leaseInfo.forEach(([label, value]) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.text(label, 14, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 70, yPos);
        yPos += 6;
      });

      yPos += 5;

      // Property & Unit Information
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Property & Unit', 14, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const propertyInfo = [
        [`Property:`, lease.property.title],
        [`Address:`, `${lease.property.street}, ${lease.property.barangay}, ${lease.property.city.name}, ${lease.property.zipCode || ''}`],
        [`Property Type:`, lease.property.type],
        [`Unit:`, lease.unit.label],
      ];

      propertyInfo.forEach(([label, value]) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.text(label, 14, yPos);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(value, pageWidth - 80);
        doc.text(lines, 70, yPos);
        yPos += lines.length * 6;
      });

      yPos += 5;

      // Parties Involved Section
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Parties Involved', 14, yPos);
      yPos += 8;

      // Tenant Information
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Tenant', 14, yPos);
      yPos += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const tenantInfo = [
        [`Name:`, `${lease.tenant.firstName} ${lease.tenant.lastName}`],
        [`Email:`, lease.tenant.email],
        [`Phone:`, lease.tenant.phoneNumber || 'Not provided'],
      ];

      tenantInfo.forEach(([label, value]) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.text(label, 14, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 70, yPos);
        yPos += 6;
      });

      yPos += 4;

      // Landlord Information
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Landlord', 14, yPos);
      yPos += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const landlordInfo = [
        [`Name:`, `${lease.landlord.firstName} ${lease.landlord.lastName}`],
        [`Email:`, lease.landlord.email],
        [`Phone:`, lease.landlord.phoneNumber || 'Not provided'],
      ];

      landlordInfo.forEach(([label, value]) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.text(label, 14, yPos);
        doc.setFont('helvetica', 'normal');
        doc.text(value, 70, yPos);
        yPos += 6;
      });

      // Payments Section (if not pending)
      if (lease.status !== 'PENDING' && lease.status !== 'REJECTED' && lease.payments.length > 0) {
        yPos += 5;
        if (yPos > 240) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Payment Summary', 14, yPos);
        yPos += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const paymentSummary = [
          [`Total Expected:`, formatCurrencyForPDF(totalExpected)],
          [`Total Collected:`, formatCurrencyForPDF(totalPaid)],
          [`Outstanding:`, formatCurrencyForPDF(outstandingAmount)],
          [`Overdue:`, formatCurrencyForPDF(overdueAmount)],
        ];

        paymentSummary.forEach(([label, value]) => {
          if (yPos > 250) {
            doc.addPage();
            yPos = 20;
          }
          doc.setFont('helvetica', 'bold');
          doc.text(label, 14, yPos);
          doc.setFont('helvetica', 'normal');
          doc.text(value, 70, yPos);
          yPos += 6;
        });

        // Payment Table
        if (lease.payments.length > 0) {
          yPos += 5;
          if (yPos > 200) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Payment History', 14, yPos);
          yPos += 8;

          const tableData = lease.payments.map(payment => [
            formatCurrencyForPDF(payment.amount),
            formatDate(payment.dueDate),
            payment.status,
            payment.paidAt ? formatDate(payment.paidAt) : 'N/A',
            payment.method || 'N/A',
            payment.timingStatus || 'N/A',
            payment.type || 'RENT',
          ]);

          autoTable(doc, {
            startY: yPos,
            head: [['Amount', 'Due Date', 'Status', 'Paid Date', 'Method', 'Timing', 'Type']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 8 },
            margin: { left: 14, right: 14 },
          });

          yPos = (doc as any).lastAutoTable.finalY + 10;
        }
      }

      // Add footer with RentEase credit on all pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setDrawColor(200, 200, 200);
        doc.line(14, pageHeight - 20, pageWidth - 14, pageHeight - 20);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129);
        doc.text('RentEase', pageWidth / 2, pageHeight - 12, { align: 'center' });
        
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text('Generated by RentEase - Property Management Platform', pageWidth / 2, pageHeight - 6, { align: 'center' });
        doc.setTextColor(0, 0, 0);
      }

      // Generate filename
      const leaseName = (lease.leaseNickname || `${lease.property.title}-${lease.unit.label}`).replace(/\s+/g, '-');
      const filename = `Lease-${leaseName}-${new Date().toISOString().split('T')[0]}.pdf`;

      // Save PDF
      doc.save(filename);
      
      toast.success('PDF generated successfully');
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'ACCEPTED':
        return <CheckCircle className="w-4 h-4" />;
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'COMPLETED':
        return <Calendar className="w-4 h-4" />;
      case 'TERMINATED':
      case 'REJECTED':
        return <AlertTriangle className="w-4 h-4" />;
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status === 'ACCEPTED' ? 'ACTIVE' : status === 'REJECTED' ? 'TERMINATED' : status;
    return (
      LEASE_STATUS_THEME[normalizedStatus as keyof typeof LEASE_STATUS_THEME]?.badge ??
      "bg-slate-50 border border-slate-200 text-slate-700"
    );
  };

  const getStatusGradient = (status: string) => {
    const normalizedStatus = status === 'ACCEPTED' ? 'ACTIVE' : status === 'REJECTED' ? 'TERMINATED' : status;
    return (
      LEASE_STATUS_THEME[normalizedStatus as keyof typeof LEASE_STATUS_THEME]?.gradient ??
      "from-slate-500 to-gray-500"
    );
  };

  const getCombinedHeaderGradient = (status: string) => {
    const normalizedStatus = status === 'ACCEPTED' ? 'ACTIVE' : status === 'REJECTED' ? 'TERMINATED' : status;
    
    // Combine base gradient with status gradient
    switch (normalizedStatus) {
      case 'PENDING':
        return "from-amber-200/30 via-teal-200/25 to-orange-200/30";
      case 'ACTIVE':
        return "from-emerald-200/30 via-teal-200/25 to-teal-200/30";
      case 'COMPLETED':
        return "from-blue-200/30 via-cyan-200/25 to-indigo-200/30";
      case 'TERMINATED':
        return "from-rose-200/30 via-teal-200/25 to-red-200/30";
      case 'CANCELLED':
        return "from-slate-200/30 via-teal-200/25 to-gray-200/30";
      default:
        return "from-teal-200/30 via-cyan-200/25 to-emerald-200/30";
    }
  };

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case 'PENDING': return 'secondary';
      case 'PAID': return 'default';
      case 'OVERDUE': return 'destructive';
      default: return 'outline';
    }
  };


  const downloadLeaseDocument = async () => {
    if (!lease?.leaseDocumentUrl) return;
    
    try {
      // Process the URL to ensure it's a full URL (not relative)
      let processedUrl = processImageUrl(lease.leaseDocumentUrl) || lease.leaseDocumentUrl;
      
      // If it's still a relative path, convert it to full URL
      if (processedUrl.startsWith('/')) {
        const backendBaseUrl = getBackendBaseUrl();
        processedUrl = `${backendBaseUrl}${processedUrl}`;
      }
      
      // Fetch the file and create a blob for download
      const response = await fetch(processedUrl);
      if (!response.ok) {
        throw new Error('Failed to download document');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Lease-Document-${lease.leaseNickname || 'document'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Document downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document. Please try again.');
    }
  };

  const handleNavigateToProperty = () => {
    if (lease?.property.id) {
      navigate(`/properties/${lease.property.id}?unit=${lease.unit.id}`);
    }
  };


  // Get overdue payments
  const getOverduePayments = () => {
    if (!lease?.payments) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return lease.payments
      .filter(payment => {
        if (payment.status === 'PAID') return false;
        const dueDate = new Date(payment.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  // Calculate payment statistics
  const paidPayments = lease ? lease.payments.filter(p => p.status === 'PAID') : [];
  const totalPaid = paidPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingPayments = lease ? lease.payments.filter(p => p.status === 'PENDING') : [];
  const totalExpected = lease ? lease.payments.reduce((sum, payment) => sum + payment.amount, 0) : 0;
  const outstandingAmount = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const overduePayments = getOverduePayments();
  const overdueAmount = overduePayments.reduce((sum, payment) => sum + payment.amount, 0);

  // Get upcoming payments for this month
  const getUpcomingPaymentsThisMonth = () => {
    if (!lease?.payments) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    return lease.payments
      .filter(payment => {
        if (payment.status === 'PAID') return false;
        const dueDate = new Date(payment.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate >= today && dueDate <= endOfMonth;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  // Determine if payments tab should be shown
  const showPaymentsTab = lease && lease.status !== 'PENDING' && lease.status !== 'REJECTED';
  
  // Determine if maintenance tab should be shown
  const showMaintenanceTab = lease && (lease.status === 'ACTIVE' || lease.status === 'ACCEPTED');

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!lease) {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <AlertDescription>Lease not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  const themeGradient = getStatusGradient(lease.status);
  const themeColor = getStatusColor(lease.status);
  const combinedHeaderGradient = getCombinedHeaderGradient(lease.status);

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6">
      {/* Header Section - Redesigned with Status Colors */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl"
      >
        {/* Background Gradient with Status Color */}
        <div className={`absolute inset-0 -z-10 bg-gradient-to-r ${combinedHeaderGradient} opacity-40`} />
        <div className={`relative m-[1px] rounded-[16px] bg-gradient-to-br ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.backgroundCard || 'bg-white'} backdrop-blur-lg border ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.border || 'border-gray-200'} shadow-xl`}>
          {/* Animated Status Color Blur Effects */}
          <motion.div
            aria-hidden
            className={`pointer-events-none absolute -top-12 -left-10 h-40 w-40 rounded-full bg-gradient-to-br ${themeGradient} opacity-20 blur-3xl`}
            initial={{ opacity: 0.1, scale: 0.85 }}
            animate={{ opacity: 0.25, scale: 1.05 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className={`pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-tl ${themeGradient} opacity-15 blur-3xl`}
            initial={{ opacity: 0.08 }}
            animate={{ opacity: 0.2 }}
            transition={{ duration: 3.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          />

          <div className="px-4 sm:px-6 py-5 space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4 min-w-0">
                {/* Status Icon with Gradient */}
                <motion.div
                  whileHover={{ scale: 1.05, rotate: [0, -3, 3, 0] }}
                  className="relative flex-shrink-0"
                >
                  <div className={`relative h-11 w-11 rounded-2xl bg-gradient-to-br ${themeGradient} text-white grid place-items-center shadow-xl ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.blurLight || ''}`}>
                    <ScrollText className="h-5 w-5 relative z-10" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                  </div>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 220 }}
                    className={`absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.textColor || 'text-teal-600'} ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.border || 'border-teal-100'} border shadow-sm grid place-items-center`}
                  >
                    <FileText className="h-3 w-3" />
                  </motion.div>
                  <motion.div
                    className={`absolute inset-0 rounded-2xl border-2 ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.border || 'border-cyan-400/30'}`}
                    animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>

                {/* Lease Title and Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className={`text-lg sm:text-2xl font-semibold tracking-tight ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.textColorDark || 'text-slate-900'} truncate`}>
                      {lease.leaseNickname || `${lease.property.title} - ${lease.unit.label}`}
                    </h1>
                    <motion.div
                      animate={{ rotate: [0, 8, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Sparkles className={`h-4 w-4 ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.textColor || 'text-teal-500'}`} />
                    </motion.div>
                  </div>
                  <p className={`text-sm ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.textColor || 'text-slate-600'} leading-6 flex items-center gap-1.5 mt-1`}>
                    <FileText className="h-4 w-4 text-cyan-500" />
                    Complete lease details, payments, and maintenance requests
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                {lease.status !== 'PENDING' && lease.status !== 'REJECTED' && (
                  <Button
                    variant="outline"
                    onClick={generateLeasePDF}
                    disabled={generatingPdf}
                    className="h-11 rounded-xl border-slate-200 bg-white/80 px-5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-white disabled:opacity-70"
                  >
                    {generatingPdf ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Download PDF
                      </span>
                    )}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="h-11 rounded-xl border-slate-200 bg-white/80 px-5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-white disabled:opacity-70"
                >
                  {refreshing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Refreshing
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Refresh Data
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Status Badge and Quick Info */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Badge className={`${themeColor} flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1.5 border shadow-sm font-medium`}>
                {getStatusIcon(lease.status)}
                {lease.status}
              </Badge>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm border ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.border || 'border-gray-200'} text-xs sm:text-sm ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.textColor || 'text-slate-700'}`}>
                <Building className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="truncate font-medium">{lease.property.title}</span>
              </div>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm border ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.border || 'border-gray-200'} text-xs sm:text-sm ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.textColor || 'text-slate-700'}`}>
                <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="font-semibold">{formatCurrency(lease.rentAmount)}</span>
              </div>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm border ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.border || 'border-gray-200'} text-xs sm:text-sm ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.textColor || 'text-slate-700'}`}>
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline font-medium">Created {formatDate(lease.createdAt)}</span>
                <span className="sm:hidden font-medium">{new Date(lease.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
            </div>

            {/* Status Color Progress Bar */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
              style={{ originX: 0 }}
              className="relative h-1 w-full rounded-full overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${themeGradient} opacity-50`} />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Action Alert for Pending Status */}
      {lease.status === 'PENDING' && (
        <Alert className={`${LEASE_STATUS_THEME.PENDING.background} ${LEASE_STATUS_THEME.PENDING.border}`}>
          <AlertDescription className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className={`font-semibold ${LEASE_STATUS_THEME.PENDING.textColorDark}`}>Lease Action Required</p>
              <p className={LEASE_STATUS_THEME.PENDING.textColor}>Please review the lease details and take action.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                onClick={() => handleLeaseActionClick('accept')}
                disabled={actionLoading !== null}
                className={`bg-gradient-to-r ${LEASE_STATUS_THEME.ACTIVE.gradientButton} text-white w-full sm:w-auto`}
              >
                {actionLoading === 'accept' ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Lease
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleLeaseActionClick('reject')}
                disabled={actionLoading !== null}
                className={`${LEASE_STATUS_THEME.TERMINATED.border} ${LEASE_STATUS_THEME.TERMINATED.textColor} hover:bg-rose-50 w-full sm:w-auto`}
              >
                {actionLoading === 'reject' ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Lease
                  </>
                )}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {message && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {message}
          </AlertDescription>
        </Alert>
      )}

      {/* Accept Lease Modal */}
      {lease && (
        <Dialog open={showAcceptModal} onOpenChange={setShowAcceptModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                Accept Lease Agreement
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 pt-2">
                By agreeing to this lease, you are accepting {lease.landlord.firstName} {lease.landlord.lastName}'s agreement terms and conditions.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-3">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Important:</strong> Please review all lease details carefully before accepting. If you are unsure about any terms, contact {lease.landlord.firstName} {lease.landlord.lastName} for clarification.
                </p>
              </div>
              <div className="text-sm text-gray-700 space-y-1">
                <p>• You agree to the rent amount: <strong>{formatCurrency(lease.rentAmount)}</strong></p>
                <p>• Payment due date: <strong>{lease.dueDate}th of each {lease.interval.toLowerCase()}</strong></p>
                <p>• Lease period: <strong>{formatDate(lease.startDate)}</strong> to <strong>{formatDate(lease.endDate)}</strong></p>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAcceptModal(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleLeaseAction('accept')}
                disabled={actionLoading === 'accept'}
                className={`w-full sm:w-auto bg-gradient-to-r ${LEASE_STATUS_THEME.ACTIVE.gradientButton} text-white`}
              >
                {actionLoading === 'accept' ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    I Agree, Accept Lease
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Reject Lease Modal */}
      {lease && (
        <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <XCircle className="h-5 w-5 text-rose-600" />
                Reject Lease Agreement
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 pt-2">
                You are indicating that you want to cancel this lease process overall.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-semibold">
                  ⚠️ Warning: This action is NOT reversible.
                </p>
              </div>
              <div className="text-sm text-gray-700 space-y-2">
                <p>By rejecting this lease:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>The lease agreement will be cancelled</li>
                  <li>This process cannot be undone</li>
                  <li>You will need to start a new lease application if you change your mind</li>
                </ul>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> If you have concerns about the lease terms, consider contacting {lease.landlord.firstName} {lease.landlord.lastName} first before rejecting.
                </p>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRejectModal(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleLeaseAction('reject')}
                disabled={actionLoading === 'reject'}
                variant="destructive"
                className="w-full sm:w-auto"
              >
                {actionLoading === 'reject' ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Yes, Reject Lease
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Main Tabs with Color Scheme */}
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="border-b bg-gradient-to-br from-slate-50/80 via-gray-50/60 to-slate-50/80 backdrop-blur-sm">
              <TabsList className={`w-full h-auto bg-transparent p-2 sm:p-3 gap-2 grid ${showPaymentsTab && showMaintenanceTab ? 'grid-cols-3' : showPaymentsTab || showMaintenanceTab ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <TabsTrigger 
                  value="lease" 
                  className={`relative flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-medium transition-all overflow-hidden ${
                    activeTab === 'lease' 
                      ? `bg-gradient-to-r ${themeGradient}/20 text-slate-700 border border-gray-200/50 shadow-sm backdrop-blur-sm` 
                      : 'bg-gray-50/50 hover:bg-gray-100/50 text-gray-600'
                  }`}
                >
                  {activeTab === 'lease' && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${themeGradient}/10 opacity-50`} />
                  )}
                  <FileText className={`w-4 h-4 sm:w-4 sm:h-4 relative z-10 ${activeTab === 'lease' ? 'text-slate-700' : 'text-gray-500'}`} />
                  <span className="relative z-10 hidden md:inline">Lease</span>
                </TabsTrigger>
                {showPaymentsTab && (
                  <TabsTrigger 
                    value="payments" 
                    className={`relative flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-medium transition-all overflow-hidden ${
                      activeTab === 'payments' 
                        ? `bg-gradient-to-r ${themeGradient}/20 text-slate-700 border border-gray-200/50 shadow-sm backdrop-blur-sm` 
                        : 'bg-gray-50/50 hover:bg-gray-100/50 text-gray-600'
                    }`}
                  >
                    {activeTab === 'payments' && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${themeGradient}/10 opacity-50`} />
                    )}
                    <CreditCard className={`w-4 h-4 sm:w-4 sm:h-4 relative z-10 ${activeTab === 'payments' ? 'text-slate-700' : 'text-gray-500'}`} />
                    <span className="relative z-10 hidden md:inline">Payments</span>
                    {lease && pendingPayments.length > 0 && (
                      <Badge className={`ml-1 text-xs px-1.5 py-0 relative z-10 ${
                        activeTab === 'payments' 
                          ? 'bg-amber-100 text-amber-800 border border-amber-200/50' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {pendingPayments.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                )}
                {showMaintenanceTab && (
                  <TabsTrigger 
                    value="maintenance" 
                    className={`relative flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-medium transition-all overflow-hidden ${
                      activeTab === 'maintenance' 
                        ? `bg-gradient-to-r ${themeGradient}/20 text-slate-700 border border-gray-200/50 shadow-sm backdrop-blur-sm` 
                        : 'bg-gray-50/50 hover:bg-gray-100/50 text-gray-600'
                    }`}
                  >
                    {activeTab === 'maintenance' && (
                      <div className={`absolute inset-0 bg-gradient-to-r ${themeGradient}/10 opacity-50`} />
                    )}
                    <Wrench className={`w-4 h-4 sm:w-4 sm:h-4 relative z-10 ${activeTab === 'maintenance' ? 'text-slate-700' : 'text-gray-500'}`} />
                    <span className="relative z-10 hidden md:inline">Maintenance</span>
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {/* Lease Information Tab */}
            <TabsContent value="lease" className="m-0 p-3 sm:p-4 md:p-6 space-y-6">
              {/* Lease Information - Redesigned - KEY THEME - Stand Out */}
              <Card className={`bg-gradient-to-br from-slate-50/80 via-gray-50/60 to-slate-50/80 border border-gray-200/60 shadow-xl ring-2 ring-gray-100/50 backdrop-blur-sm`}>
                <CardHeader className={`bg-gradient-to-r from-white/90 via-white/80 to-white/90 ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.border} border-b shadow-sm`}>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <div className={`p-2.5 rounded-xl ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.iconBackground} text-white shadow-md`}>
                      <FileText className="h-5 w-5" />
                    </div>
                    <span className="font-bold text-gray-900">Lease Information</span>
                  </CardTitle>
                  <CardDescription className="text-gray-600">Complete lease terms and financial details</CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Financial Details */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <DollarSign className={`h-4 w-4 ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.textColor}`} />
                        <h3 className="font-semibold text-sm text-gray-700">Financial Details</h3>
                      </div>
                      <div className="space-y-2.5">
                        <div className="p-3 bg-white/80 rounded-lg border border-gray-100/50">
                          <p className="text-xs text-gray-500 mb-1">Monthly Rent</p>
                          <p className="text-lg font-bold text-green-600/80">{formatCurrency(lease.rentAmount)}</p>
                        </div>
                        <div className="p-3 bg-white/80 rounded-lg border border-gray-100/50">
                          <p className="text-xs text-gray-500 mb-1">Security Deposit</p>
                          <p className="text-base font-semibold text-gray-700">
                            {lease.securityDeposit ? formatCurrency(lease.securityDeposit) : 'None'}
                          </p>
                        </div>
                        <div className="p-3 bg-white/80 rounded-lg border border-gray-100/50">
                          <p className="text-xs text-gray-500 mb-1">Payment Due Date</p>
                          <p className="text-base font-semibold text-gray-700">
                            {lease.dueDate}th of each {lease.interval.toLowerCase()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Lease Terms */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <ScrollText className={`h-4 w-4 ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.textColor}`} />
                        <h3 className="font-semibold text-sm text-gray-700">Lease Terms</h3>
                      </div>
                      <div className="space-y-2.5">
                        <div className="p-3 bg-white/80 rounded-lg border border-gray-100/50">
                          <p className="text-xs text-gray-500 mb-1">Lease Type</p>
                          <p className="text-base font-semibold text-gray-700">{lease.leaseType.replace('_', ' ')}</p>
                        </div>
                        <div className="p-3 bg-white/80 rounded-lg border border-gray-100/50">
                          <p className="text-xs text-gray-500 mb-1">Payment Interval</p>
                          <p className="text-base font-semibold text-gray-700 capitalize">{lease.interval.toLowerCase()}</p>
                        </div>
                        <div className="p-3 bg-white/80 rounded-lg border border-gray-100/50">
                          <p className="text-xs text-gray-500 mb-1">Status</p>
                          <Badge className={`${themeColor} text-xs px-2 py-0.5`}>
                            {getStatusIcon(lease.status)}
                            {lease.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Lease Period */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 mb-3">
                        <Calendar className={`h-4 w-4 ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.textColor}`} />
                        <h3 className="font-semibold text-sm text-gray-700">Lease Period</h3>
                      </div>
                      <div className="space-y-2.5">
                        <div className="p-3 bg-white/80 rounded-lg border border-gray-100/50">
                          <p className="text-xs text-gray-500 mb-1">Start Date</p>
                          <p className="text-sm font-semibold text-gray-700">{formatDate(lease.startDate)}</p>
                        </div>
                        <div className="p-3 bg-white/80 rounded-lg border border-gray-100/50">
                          <p className="text-xs text-gray-500 mb-1">End Date</p>
                          <p className="text-sm font-semibold text-gray-700">{formatDate(lease.endDate)}</p>
                        </div>
                        <div className="p-3 bg-white/80 rounded-lg border border-gray-100/50">
                          <p className="text-xs text-gray-500 mb-1">Duration</p>
                          <p className="text-sm font-semibold text-gray-700">
                            {Math.ceil((new Date(lease.endDate).getTime() - new Date(lease.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lease Document Section - Always Display */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-sm text-gray-700 mb-1">Lease Document</h3>
                          <p className="text-xs text-gray-500">
                            {lease.leaseDocumentUrl ? 'Download your lease agreement document' : 'Lease document will be available soon'}
                          </p>
                        </div>
                        {lease.leaseDocumentUrl && (
                          <FileText className="h-8 w-8 text-blue-500" />
                        )}
                        {!lease.leaseDocumentUrl && (
                          <FileText className="h-8 w-8 text-gray-300" />
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        {lease.leaseDocumentUrl ? (
                          <>
                            <Button 
                              onClick={downloadLeaseDocument} 
                              className={`flex-1 bg-gradient-to-r ${themeGradient} text-white hover:opacity-90`}
                              variant="default"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            <Button 
                              onClick={() => {
                                if (lease.leaseDocumentUrl) {
                                  let processedUrl = processImageUrl(lease.leaseDocumentUrl) || lease.leaseDocumentUrl;
                                  // If it's still a relative path, convert it to full URL
                                  if (processedUrl.startsWith('/')) {
                                    const backendBaseUrl = getBackendBaseUrl();
                                    processedUrl = `${backendBaseUrl}${processedUrl}`;
                                  }
                                  window.open(processedUrl, '_blank');
                                }
                              }}
                              variant="outline"
                              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Open in New Tab
                            </Button>
                          </>
                        ) : (
                          <Button 
                            disabled
                            className="flex-1 bg-gray-100 text-gray-400 cursor-not-allowed"
                            variant="outline"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Document Not Available
                          </Button>
                        )}
                        <Button
                          onClick={() => navigate('/tenant/messages')}
                          variant="outline"
                          className="flex-1 sm:flex-initial border-blue-200 text-blue-700 hover:bg-blue-50"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Contact Landlord
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Property and Unit Information - Condensed with Colors */}
              <Card className="bg-gradient-to-br from-blue-50/20 to-indigo-50/20 border border-blue-100/50">
                <CardHeader className="bg-white/90 border-b border-blue-100/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-700">
                      <div className="p-1.5 rounded-lg bg-blue-500 text-white">
                        <Home className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      Property & Unit
                    </CardTitle>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleNavigateToProperty}
                      className="w-full sm:w-auto border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                      View Details
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 bg-white/80 rounded-lg border border-blue-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Building className="h-4 w-4 text-blue-600" />
                        <p className="text-xs font-medium text-blue-700">Property</p>
                      </div>
                      <p className="font-semibold text-sm mb-1 text-gray-700">{lease.property.title}</p>
                      <p className="text-xs text-gray-600 flex items-start gap-1">
                        <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0 text-blue-500" />
                        <span className="break-words">
                          {lease.property.street}, {lease.property.barangay}, {lease.property.city.name}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Type: {lease.property.type}</p>
                    </div>
                    <div className="p-3 bg-white/80 rounded-lg border border-blue-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Building className="h-4 w-4 text-indigo-600" />
                        <p className="text-xs font-medium text-indigo-700">Unit</p>
                      </div>
                      <p className="font-semibold text-sm text-gray-700">{lease.unit.label}</p>
                      <p className="text-xs text-gray-600 mt-1">Unit included in this lease</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Parties Involved - Combined with Colors */}
              <Card className="bg-gradient-to-br from-indigo-50/20 to-blue-50/20 border border-indigo-100/50">
                <CardHeader className="bg-white/90 border-b border-indigo-100/50">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-700">
                    <div className="p-1.5 rounded-lg bg-indigo-500 text-white">
                      <User className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    Parties Involved
                  </CardTitle>
                  <CardDescription className="text-gray-600">Tenant and landlord information</CardDescription>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Tenant */}
                    <div className="p-4 bg-white/80 rounded-lg border border-indigo-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-10 w-10 border border-indigo-200">
                          <AvatarImage src={processImageUrl(lease.tenant.avatarUrl) || undefined} />
                          <AvatarFallback className="text-sm bg-indigo-100 text-indigo-700">
                            {lease.tenant.firstName[0]}{lease.tenant.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm text-gray-700">{lease.tenant.firstName} {lease.tenant.lastName}</p>
                          <Badge variant="secondary" className="text-xs mt-0.5 bg-indigo-100 text-indigo-700 border-indigo-200">Tenant</Badge>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-3 w-3 text-indigo-500" />
                          <span className="break-all">{lease.tenant.email}</span>
                        </div>
                        {lease.tenant.phoneNumber && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="h-3 w-3 text-indigo-500" />
                            <span>{lease.tenant.phoneNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Landlord */}
                    <div className="p-4 bg-white/80 rounded-lg border border-blue-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <Avatar className="h-10 w-10 border border-blue-200">
                          <AvatarImage src={processImageUrl(lease.landlord.avatarUrl) || undefined} />
                          <AvatarFallback className="text-sm bg-blue-100 text-blue-700">
                            {lease.landlord.firstName[0]}{lease.landlord.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm text-gray-700">{lease.landlord.firstName} {lease.landlord.lastName}</p>
                          <Badge variant="default" className="text-xs mt-0.5 bg-blue-500 text-white">Landlord</Badge>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-3 w-3 text-blue-500" />
                          <span className="break-all">{lease.landlord.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-3 w-3 text-blue-500" />
                          <span>{lease.landlord.phoneNumber}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab - Only shown for non-pending, non-rejected leases */}
            {showPaymentsTab && (
              <TabsContent value="payments" className="m-0 p-3 sm:p-4 md:p-6 space-y-6">
            {/* Simple Reminders */}
            {(() => {
              const overduePaymentsList = getOverduePayments();
              const upcomingPaymentsThisMonth = getUpcomingPaymentsThisMonth();
              const pendingPaymentsList = lease ? lease.payments.filter(p => p.status === 'PENDING') : [];
              
              return (
                <>
                  {overduePaymentsList.length > 0 && (
                    <Alert className="bg-red-50 border-red-200">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <span className="font-semibold">You have {overduePaymentsList.length} overdue payment{overduePaymentsList.length !== 1 ? 's' : ''}. </span>
                        <span>Please contact your landlord immediately to arrange payment. Timely payments help maintain a good relationship with your landlord.</span>
                      </AlertDescription>
                    </Alert>
                  )}
                  {upcomingPaymentsThisMonth.length > 0 && (
                    <Alert className="bg-amber-50 border-amber-200">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800">
                        <span className="font-semibold">You have {upcomingPaymentsThisMonth.length} upcoming payment{upcomingPaymentsThisMonth.length !== 1 ? 's' : ''} due this month. </span>
                        <span>Please make sure to pay your landlord on time to avoid any late fees or issues.</span>
                      </AlertDescription>
                    </Alert>
                  )}
                  {overduePaymentsList.length === 0 && upcomingPaymentsThisMonth.length === 0 && pendingPaymentsList.length > 0 && (
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertTriangle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <span>Remember to pay your landlord on time. Keeping up with your rent payments helps maintain a positive rental relationship.</span>
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              );
            })()}

            {/* Payment Statistics */}
            {lease && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-2.5">
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-sm">
                  <CardContent className="p-2.5 sm:p-3 text-center">
                    <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 mx-auto mb-1" />
                    <p className="text-[10px] sm:text-xs text-gray-600 font-medium mb-0.5">Total Expected</p>
                    <p className="text-sm sm:text-base font-bold text-blue-600 break-words">{formatCurrency(totalExpected)}</p>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 line-clamp-1">{lease.payments.length} payment{lease.payments.length !== 1 ? 's' : ''}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-0 shadow-sm">
                  <CardContent className="p-2.5 sm:p-3 text-center">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 mx-auto mb-1" />
                    <p className="text-[10px] sm:text-xs text-gray-600 font-medium mb-0.5">Collected</p>
                    <p className="text-sm sm:text-base font-bold text-green-600 break-words">{formatCurrency(totalPaid)}</p>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 line-clamp-1">{paidPayments.length} payment{paidPayments.length !== 1 ? 's' : ''}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-0 shadow-sm">
                  <CardContent className="p-2.5 sm:p-3 text-center">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600 mx-auto mb-1" />
                    <p className="text-[10px] sm:text-xs text-gray-600 font-medium mb-0.5">Outstanding</p>
                    <p className="text-sm sm:text-base font-bold text-orange-600 break-words">{formatCurrency(outstandingAmount)}</p>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 line-clamp-1 hidden sm:block">{pendingPayments.length} payment{pendingPayments.length !== 1 ? 's' : ''} awaiting</p>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 line-clamp-1 sm:hidden">{pendingPayments.length} pending</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-red-50 to-rose-50 border-0 shadow-sm">
                  <CardContent className="p-2.5 sm:p-3 text-center">
                    <AlertTriangle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 mx-auto mb-1" />
                    <p className="text-[10px] sm:text-xs text-gray-600 font-medium mb-0.5">Overdue</p>
                    <p className="text-sm sm:text-base font-bold text-red-600 break-words">{formatCurrency(overdueAmount)}</p>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 mt-0.5 line-clamp-1">{overduePayments.length} payment{overduePayments.length !== 1 ? 's' : ''}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Payments Table - Responsive */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                  Payment History
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold">Amount</TableHead>
                        <TableHead className="font-semibold">Due Date</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Paid Date</TableHead>
                        <TableHead className="font-semibold">Method</TableHead>
                        <TableHead className="font-semibold">Timing</TableHead>
                        <TableHead className="font-semibold">Type</TableHead>
                        <TableHead className="font-semibold">Reminder</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lease.payments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-gray-500 py-12">
                            <div className="flex flex-col items-center gap-3">
                              <CreditCard className="w-16 h-16 text-gray-300" />
                              <p className="text-lg font-medium text-gray-600">No payments recorded yet</p>
                              <p className="text-gray-500">Payment records will appear here once created</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        lease.payments.map((payment) => {
                          // Check if payment is overdue or upcoming
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const dueDate = new Date(payment.dueDate);
                          dueDate.setHours(0, 0, 0, 0);
                          const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                          endOfMonth.setHours(23, 59, 59, 999);
                          
                          const isOverdue = payment.status === 'PENDING' && dueDate < today;
                          const isUpcomingThisMonth = payment.status === 'PENDING' && dueDate >= today && dueDate <= endOfMonth;
                          
                          const rowClassName = isOverdue 
                            ? 'bg-red-50/60 hover:bg-red-50 border-l-4 border-red-500' 
                            : isUpcomingThisMonth 
                              ? 'bg-amber-50/60 hover:bg-amber-50 border-l-4 border-amber-500'
                              : 'hover:bg-gray-50';
                          
                          return (
                          <TableRow key={payment.id} className={`${rowClassName} transition-colors`}>
                            <TableCell className="font-semibold text-green-600">
                              {formatCurrency(payment.amount)}
                            </TableCell>
                            <TableCell className="min-w-[140px]">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-medium text-gray-900">{formatDate(payment.dueDate)}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(payment.dueDate).toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={getPaymentStatusVariant(payment.status)}
                                className={`font-medium px-2 py-1 ${
                                  payment.status === 'PAID' 
                                    ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-100' 
                                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-100'
                                }`}
                              >
                                {payment.status === 'PAID' ? (
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                ) : (
                                  <Clock className="w-3 h-3 mr-1" />
                                )}
                                {payment.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="min-w-[140px]">
                              {payment.paidAt ? (
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-medium text-gray-900">{formatDate(payment.paidAt)}</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(payment.paidAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400 italic text-sm">Not paid</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className={payment.method ? "font-medium text-gray-700" : "text-gray-400 italic"}>
                                {payment.method || 'Not specified'}
                              </span>
                            </TableCell>
                            <TableCell>
                              {payment.timingStatus ? (
                                <Badge 
                                  variant={payment.timingStatus === 'ONTIME' ? 'default' : payment.timingStatus === 'LATE' ? 'destructive' : 'outline'}
                                  className={`font-medium px-2 py-1 ${
                                    payment.timingStatus === 'ONTIME'
                                      ? 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-100'
                                      : payment.timingStatus === 'ADVANCE'
                                        ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-100'
                                        : 'bg-red-100 text-red-700 border-red-300 hover:bg-red-100'
                                  }`}
                                >
                                  {payment.timingStatus}
                                </Badge>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-medium">
                                {payment.type || 'RENT'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                className={`font-medium px-2 py-1 ${
                                  payment.reminderStage === 0
                                    ? 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-100'
                                    : payment.reminderStage === 1
                                      ? 'bg-green-100 text-green-700 border-green-300 hover:bg-green-100'
                                      : 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-100'
                                }`}
                              >
                                {payment.reminderStage === 0 
                                  ? 'No reminder' 
                                  : payment.reminderStage === 1 
                                    ? 'Pre-due sent' 
                                    : 'Due-day sent'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {payment.note && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setNoteModal({ isOpen: true, note: payment.note })}
                                  className="border-blue-200 text-blue-700 hover:bg-blue-50 h-8 px-3 text-xs"
                                >
                                  <FileText className="w-3 h-3 mr-1" />
                                  Note
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden">
                  {lease.payments.length === 0 ? (
                    <div className="text-center text-gray-500 py-12 px-4">
                      <div className="flex flex-col items-center gap-3">
                        <CreditCard className="w-16 h-16 text-gray-300" />
                        <p className="text-lg font-medium text-gray-600">No payments recorded yet</p>
                        <p className="text-sm text-gray-500">Payment records will appear here once created</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 p-4">
                      {lease.payments.map((payment) => {
                        // Check if payment is overdue or upcoming
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const dueDate = new Date(payment.dueDate);
                        dueDate.setHours(0, 0, 0, 0);
                        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                        endOfMonth.setHours(23, 59, 59, 999);
                        
                        const isOverdue = payment.status === 'PENDING' && dueDate < today;
                        const isUpcomingThisMonth = payment.status === 'PENDING' && dueDate >= today && dueDate <= endOfMonth;
                        
                        const cardBorderColor = isOverdue 
                          ? 'border-red-500 border-l-4' 
                          : isUpcomingThisMonth 
                            ? 'border-amber-500 border-l-4'
                            : 'border-gray-200';
                        const cardBgColor = isOverdue 
                          ? 'bg-red-50/60' 
                          : isUpcomingThisMonth 
                            ? 'bg-amber-50/60'
                            : '';
                        
                        return (
                        <Card key={payment.id} className={`${cardBorderColor} ${cardBgColor} shadow-sm`}>
                          <CardContent className="p-4 space-y-3">
                            {/* Amount and Status - Top Row */}
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-lg font-bold text-green-600">{formatCurrency(payment.amount)}</p>
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {payment.type || 'RENT'}
                                </Badge>
                              </div>
                              <Badge 
                                variant={getPaymentStatusVariant(payment.status)}
                                className={`font-medium px-2.5 py-1.5 ${
                                  payment.status === 'PAID' 
                                    ? 'bg-green-100 text-green-700 border-green-300' 
                                    : 'bg-gray-100 text-gray-700 border-gray-300'
                                }`}
                              >
                                {payment.status === 'PAID' ? (
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                ) : (
                                  <Clock className="w-3 h-3 mr-1" />
                                )}
                                {payment.status}
                              </Badge>
                            </div>

                            {/* Due Date */}
                            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                              <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-500">Due Date</p>
                                <p className="text-sm font-semibold text-gray-900">{formatDate(payment.dueDate)}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(payment.dueDate).toLocaleDateString('en-US', { weekday: 'long' })}
                                </p>
                              </div>
                            </div>

                            {/* Additional Info - Collapsible or always visible */}
                            <div className="pt-2 border-t border-gray-100 space-y-2">
                              {payment.paidAt && (
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500">Paid Date</p>
                                    <p className="text-sm font-medium text-gray-900">{formatDate(payment.paidAt)}</p>
                                  </div>
                                </div>
                              )}
                              {payment.method && (
                                <div className="flex items-center gap-2">
                                  <CreditCard className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500">Method</p>
                                    <p className="text-sm font-medium text-gray-900">{payment.method}</p>
                                  </div>
                                </div>
                              )}
                              {payment.timingStatus && (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500">Timing</p>
                                    <Badge 
                                      variant={payment.timingStatus === 'ONTIME' ? 'default' : payment.timingStatus === 'LATE' ? 'destructive' : 'outline'}
                                      className={`text-xs ${
                                        payment.timingStatus === 'ONTIME'
                                          ? 'bg-blue-100 text-blue-700 border-blue-300'
                                          : payment.timingStatus === 'ADVANCE'
                                            ? 'bg-green-100 text-green-700 border-green-300'
                                            : 'bg-red-100 text-red-700 border-red-300'
                                      }`}
                                    >
                                      {payment.timingStatus}
                                    </Badge>
                                  </div>
                                </div>
                              )}
                              {payment.note && (
                                <div className="pt-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setNoteModal({ isOpen: true, note: payment.note })}
                                    className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 text-xs"
                                  >
                                    <FileText className="w-3 h-3 mr-1" />
                                    View Note
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

            {/* Maintenance Tab - Only shown for active/accepted leases */}
            {showMaintenanceTab && (
              <TabsContent value="maintenance" className="m-0 p-3 sm:p-4 md:p-6 space-y-4">
                {/* Warning Alert */}
                <Alert className="bg-amber-50 border-amber-200">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <strong>Important:</strong> Only submit maintenance requests for actual issues with your unit (e.g., broken appliances, plumbing issues, electrical problems, internet connectivity issues). Requests for non-maintenance issues (e.g., personal preferences, general inquiries) may be marked as invalid by your landlord.
                  </AlertDescription>
                </Alert>

                <Card>
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Wrench className="h-5 w-5" />
                          Maintenance Requests
                        </CardTitle>
                        <CardDescription>
                          Request maintenance services for your unit
                        </CardDescription>
                      </div>
                      <Button
                        onClick={() => setShowCreateMaintenanceModal(true)}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 w-full sm:w-auto"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Submit Request
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingMaintenance ? (
                      <div className="text-center py-8">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-solid border-current border-r-transparent" />
                        <p className="mt-3 text-sm text-gray-600">Loading maintenance requests...</p>
                      </div>
                    ) : maintenanceRequests.length === 0 ? (
                      <div className="text-center py-8">
                        <ToolCase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold mb-1 text-gray-700">No Maintenance Requests</h3>
                        <p className="text-sm text-gray-500 max-w-md mx-auto">
                          You haven't submitted any maintenance requests yet.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {maintenanceRequests.map((request: any) => (
                          <Card 
                            key={request.id} 
                            className="border border-gray-200 hover:border-gray-300 transition-all shadow-sm cursor-pointer hover:shadow-md active:scale-[0.98]"
                            onClick={() => setDetailModal({ isOpen: true, request })}
                          >
                            <CardContent className="p-3 sm:p-4">
                              <div className="flex items-start gap-3">
                                {/* Photo Thumbnail */}
                                {request.photoUrl && (
                                  <div 
                                    className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-gray-200"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const processedUrl = processImageUrl(request.photoUrl) || request.photoUrl;
                                      window.open(processedUrl, '_blank');
                                    }}
                                  >
                                    <img
                                      src={processImageUrl(request.photoUrl) || ""}
                                      alt="Maintenance issue"
                                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    />
                                  </div>
                                )}
                                
                                {/* Main Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                    {/* Status Badge - More Prominent */}
                                    <div className="flex items-center gap-2">
                                      <Badge className={`${getMaintenanceStatusColor(request.status)} text-xs sm:text-sm px-2.5 py-1 font-semibold border`}>
                                        {request.status === 'OPEN' && <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />}
                                        {request.status === 'IN_PROGRESS' && <Wrench className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />}
                                        {request.status === 'RESOLVED' && <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />}
                                        {request.status === 'CANCELLED' && <XCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />}
                                        {request.status === 'INVALID' && <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />}
                                        <span className="hidden sm:inline">{request.status.replace('_', ' ')}</span>
                                        <span className="sm:hidden">{request.status.replace('_', ' ').substring(0, 8)}</span>
                                      </Badge>
                                    </div>
                                    
                                    {/* Action Button */}
                                    {request.status === 'OPEN' && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setCancelModal({ isOpen: true, requestId: request.id });
                                        }}
                                        className="border-red-200 text-red-700 hover:bg-red-50 h-7 sm:h-8 text-xs px-2 sm:px-2.5 flex-shrink-0"
                                      >
                                        <X className="h-3 w-3 mr-1" />
                                        <span className="hidden sm:inline">Cancel</span>
                                        <span className="sm:hidden">Cancel</span>
                                      </Button>
                                    )}
                                  </div>
                                  
                                  {/* Description */}
                                  <p className="text-sm sm:text-base text-gray-700 mb-2.5 line-clamp-2 break-words leading-relaxed">
                                    {request.description}
                                  </p>
                                  
                                  {/* Date Information */}
                                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                                      <span>
                                        Created: {new Date(request.createdAt).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric'
                                        })}
                                      </span>
                                    </div>
                                    {request.updatedAt && new Date(request.updatedAt).getTime() !== new Date(request.createdAt).getTime() && (
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                                        <span>
                                          Updated: {new Date(request.updatedAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                          })}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Create Maintenance Request Modal */}
            <Dialog open={showCreateMaintenanceModal} onOpenChange={setShowCreateMaintenanceModal}>
              <DialogContent className="w-[95vw] sm:w-full max-w-lg max-h-[85vh] overflow-y-auto p-4 sm:p-6 mx-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-blue-600" />
                    Submit Maintenance Request
                  </DialogTitle>
                  <DialogDescription>
                    Describe the maintenance issue you're experiencing in your unit
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
                  <Alert className="bg-blue-50 border-blue-200 p-2 sm:p-3">
                    <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-xs sm:text-sm">
                      <strong>Note:</strong> Once submitted, this request cannot be deleted and will be visible to your landlord. You can cancel it if the issue is resolved or was reported by mistake, but the cancelled request will still be visible to the landlord.
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="description" className="text-sm">Description *</Label>
                    <Textarea
                      id="description"
                      value={maintenanceForm.description}
                      onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                      placeholder="Describe the maintenance issue in detail..."
                      rows={4}
                      className="resize-none text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <Label htmlFor="photo" className="text-sm">
                      Photo <span className="text-red-500">*</span>
                    </Label>
                    <input
                      type="file"
                      id="photo"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      required
                    />
                    {maintenanceForm.photoPreview ? (
                      <div className="space-y-2">
                        <div className="relative">
                          <img
                            src={maintenanceForm.photoPreview}
                            alt="Preview"
                            className="w-full h-40 sm:h-48 object-cover rounded-lg border border-gray-200"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 bg-red-500 text-white hover:bg-red-600 h-7 w-7"
                            onClick={() => setMaintenanceForm({ ...maintenanceForm, photo: null, photoPreview: '' })}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => document.getElementById('photo')?.click()}
                          className="w-full text-sm"
                          size="sm"
                        >
                          <ImageIcon className="h-3.5 w-3.5 mr-2" />
                          Change Photo
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div
                          className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                          onClick={() => document.getElementById('photo')?.click()}
                        >
                          <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs sm:text-sm text-gray-600 font-medium">Click to upload a photo</p>
                          <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Required: Help us understand the issue better</p>
                        </div>
                        <Alert className="bg-blue-50 border-blue-200 p-2 sm:p-3">
                          <ImageIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                          <AlertDescription className="text-blue-800 text-[10px] sm:text-xs">
                            <strong>Photo Tips:</strong> Make sure the image is clear and well-lit. Take the photo in good lighting, focus on the issue, and ensure the image is not blurry. A clear photo helps your landlord understand and address the problem faster.
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                    {maintenanceForm.photoPreview && (
                      <Alert className="bg-amber-50 border-amber-200 p-2 sm:p-3">
                        <ImageIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800 text-[10px] sm:text-xs">
                          <strong>Image Quality Check:</strong> Ensure the photo is clear, well-lit, and shows the issue clearly. If the image is blurry or unclear, please take another photo before submitting.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateMaintenanceModal(false);
                      setMaintenanceForm({ description: '', photo: null, photoPreview: '' });
                    }}
                    disabled={submittingMaintenance}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateMaintenanceRequest}
                    disabled={submittingMaintenance || !maintenanceForm.description.trim() || !maintenanceForm.photo}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                  >
                    {submittingMaintenance ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                        {uploadingPhoto ? 'Uploading Photo...' : 'Submitting...'}
                      </>
                    ) : (
                      'Submit Request'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Cancel Maintenance Request Modal */}
            <Dialog open={cancelModal.isOpen} onOpenChange={(open) => setCancelModal({ isOpen: open, requestId: null })}>
              <DialogContent className="w-[90vw] sm:w-full max-w-md max-h-[90vh] overflow-y-auto p-3 sm:p-6 mx-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    Cancel Maintenance Request
                  </DialogTitle>
                  <DialogDescription>
                    Are you sure you want to cancel this maintenance request?
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-3">
                  <Alert className="bg-red-50 border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 text-sm">
                      <strong>Warning:</strong> This action is NOT reversible. The cancelled request will still be visible to your landlord.
                    </AlertDescription>
                  </Alert>
                  <p className="text-sm text-gray-700">
                    Only cancel if the issue has been resolved or if you reported it by mistake. Note that your landlord can also mark requests as invalid if they are out of context.
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCancelModal({ isOpen: false, requestId: null })}
                    disabled={cancelling}
                  >
                    Keep Request
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleCancelMaintenanceRequest}
                    disabled={cancelling}
                  >
                    {cancelling ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Yes, Cancel Request
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Tabs>
        </CardContent>
      </Card>

      {/* Maintenance Request Detail Modal */}
      <Dialog open={detailModal.isOpen} onOpenChange={(open) => setDetailModal({ isOpen: open, request: null })}>
        <DialogContent className="w-[95vw] sm:w-full max-w-2xl max-h-[85vh] overflow-y-auto p-4 sm:p-6 mx-auto">
          {detailModal.request && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-600" />
                  Maintenance Request Details
                </DialogTitle>
                <DialogDescription>
                  Complete information about your maintenance request
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* Status */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <Badge className={`${getMaintenanceStatusColor(detailModal.request.status)} text-xs px-2.5 py-1 font-semibold border`}>
                      {detailModal.request.status === 'OPEN' && <Clock className="w-3 h-3 mr-1" />}
                      {detailModal.request.status === 'IN_PROGRESS' && <Wrench className="w-3 h-3 mr-1" />}
                      {detailModal.request.status === 'RESOLVED' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {detailModal.request.status === 'CANCELLED' && <XCircle className="w-3 h-3 mr-1" />}
                      {detailModal.request.status === 'INVALID' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {detailModal.request.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  {detailModal.request.status === 'OPEN' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDetailModal({ isOpen: false, request: null });
                        setCancelModal({ isOpen: true, requestId: detailModal.request.id });
                      }}
                      className="border-red-200 text-red-700 hover:bg-red-50"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancel Request
                    </Button>
                  )}
                </div>

                {/* Photo */}
                {detailModal.request.photoUrl && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">Photo</Label>
                    <div className="relative">
                      <img
                        src={processImageUrl(detailModal.request.photoUrl) || ""}
                        alt="Maintenance issue"
                        className="w-full max-h-64 object-contain rounded-lg border border-gray-200 bg-gray-50"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const processedUrl = processImageUrl(detailModal.request.photoUrl) || detailModal.request.photoUrl;
                          window.open(processedUrl, '_blank');
                        }}
                        className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Open Full Size
                      </Button>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Description</Label>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {detailModal.request.description}
                    </p>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <Label className="text-xs font-medium text-gray-500">Created Date</Label>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(detailModal.request.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(detailModal.request.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  {detailModal.request.updatedAt && new Date(detailModal.request.updatedAt).getTime() !== new Date(detailModal.request.createdAt).getTime() && (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <Label className="text-xs font-medium text-gray-500">Last Updated</Label>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(detailModal.request.updatedAt).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(detailModal.request.updatedAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDetailModal({ isOpen: false, request: null })}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Note Modal */}
      <Dialog open={noteModal.isOpen} onOpenChange={(open) => setNoteModal({ isOpen: open, note: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Payment Note
            </DialogTitle>
            <DialogDescription>
              Additional information for this payment record
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {noteModal.note || 'No note available'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setNoteModal({ isOpen: false, note: null })}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyLeaseDetails;
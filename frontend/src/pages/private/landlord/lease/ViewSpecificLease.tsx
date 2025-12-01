import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Building,
  CreditCard,
  Receipt,
  Home,
  ScrollText,
  Sparkles,
  DollarSign,
  Ban,
  User,
  Mail,
  Phone,
  Download,
  ExternalLink,
  RotateCcw,
  Loader2,
  Settings,
  Info,
  TrendingUp,
  Wrench,
  Plus,
  Edit,
  Trash2,
  BarChart3
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/useAuthStore';
import { cancelLeaseRequest, getLeaseByIdRequest, terminateLeaseRequest, completeLeaseRequest, addLandlordNoteRequest, updateLandlordNoteRequest, deleteLandlordNoteRequest } from '@/api/landlord/leaseApi';
import { createPaymentRequest, markPaymentAsPaidRequest, updatePaymentRequest, deletePaymentRequest } from '@/api/landlord/paymentApi';
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

interface Lease {
  id: string;
  propertyId: string;
  unitId: string;
  tenantId: string;
  landlordId: string;
  leaseNickname: string | null;
  leaseType: 'STANDARD' | 'SHORT_TERM' | 'LONG_TERM' | 'FIXED_TERM';
  startDate: string;
  endDate: string | null;
  rentAmount: number;
  securityDeposit: number | null;
  interval: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  dueDate: number;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'CANCELLED';
  leaseDocumentUrl: string | null;
  createdAt: string;
  updatedAt: string;
  property: {
    id: string;
    title: string;
    street: string;
    barangay: string;
    zipCode: string;
    city: {
      name: string;
    };
    municipality: string | null;
  };
  unit: {
    id: string;
    label: string;
    unitCondition: string;
    occupiedAt: string;
  };
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    avatarUrl: string | null;
  };
  payments: Payment[];
  behaviorMetrics?: {
    paymentBehavior: 'GOOD' | 'HAS_1_LATE' | 'HAS_MULTIPLE_LATE' | 'ONTIME' | 'LATE' | 'ADVANCE' | 'MIXED' | null;
    paymentReliability: number | null;
    maintenanceRequestsCount: number;
  };
  landlordNotes?: LandlordNote[] | null;
}

interface LandlordNote {
  date: string;
  note: string;
  category: 'CLEANLINESS' | 'NOISE' | 'BEHAVIOR' | 'COMMUNICATION' | 'PROPERTY_DAMAGE' | 'OTHER';
}

interface Payment {
  id: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  method: string | null;
  status: 'PENDING' | 'PAID';
  timingStatus: 'ONTIME' | 'LATE' | 'ADVANCE' | null;
  type: string | null;
  reminderStage: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

interface MarkAsPaidForm {
  paidAt: string;
  method: string;
  type: string;
  timingStatus: string;
  manualTimingOverride: boolean;
  amount?: number;
  note?: string;
}

interface EditPaymentForm {
  amount: number;
  dueDate: string;
  type: string;
  note: string;
}

interface RecordPaymentForm {
  amount: number;
  dueDate: string;
  paidAt: string;
  method: string;
  type: string;
  status: 'PENDING' | 'PAID';
  timingStatus: string;
  manualTimingOverride: boolean;
  note: string;
}

// Date picker helper constants
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
};

// Custom Date Picker Component - Simple Design
const CustomDatePicker = ({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (date: string) => void;
}) => {
  const dateValue = value ? new Date(value) : new Date();
  const [selectedYear, setSelectedYear] = useState(dateValue.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(dateValue.getMonth());
  const [selectedDay, setSelectedDay] = useState(dateValue.getDate());

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedYear(date.getFullYear());
      setSelectedMonth(date.getMonth());
      setSelectedDay(date.getDate());
    }
  }, [value]);

  const handleDateChange = (year: number, month: number, day: number) => {
    const newDate = new Date(year, month, day);
    const dateString = newDate.toISOString().split('T')[0];
    onChange(dateString);
  };

  const maxDay = getDaysInMonth(selectedYear, selectedMonth);

  return (
    <div className="flex items-center gap-1.5">
      <Select
        value={selectedMonth.toString()}
        onValueChange={(val) => {
          const month = parseInt(val);
          setSelectedMonth(month);
          const day = Math.min(selectedDay, getDaysInMonth(selectedYear, month));
          handleDateChange(selectedYear, month, day);
        }}
      >
        <SelectTrigger className="h-10 flex-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="z-[100]">
          {MONTHS.map((month, index) => (
            <SelectItem key={month} value={index.toString()}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedDay.toString()}
        onValueChange={(val) => {
          const day = parseInt(val);
          setSelectedDay(day);
          handleDateChange(selectedYear, selectedMonth, day);
        }}
      >
        <SelectTrigger className="h-10 w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="z-[100]">
          {Array.from({ length: maxDay }, (_, i) => i + 1).map((day) => (
            <SelectItem key={day} value={day.toString()}>
              {day}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedYear.toString()}
        onValueChange={(val) => {
          const year = parseInt(val);
          setSelectedYear(year);
          const day = Math.min(selectedDay, getDaysInMonth(year, selectedMonth));
          handleDateChange(year, selectedMonth, day);
        }}
      >
        <SelectTrigger className="h-10 w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="z-[100] max-h-60">
          {getYears().map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

const ViewSpecificLease = () => {
  const { leaseId } = useParams<{ leaseId: string }>();
  const navigate = useNavigate();
  const [lease, setLease] = useState<Lease | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [markAsPaidModal, setMarkAsPaidModal] = useState<{
    isOpen: boolean;
    payment: Payment | null;
  }>({
    isOpen: false,
    payment: null,
  });
  const [recordPaymentModal, setRecordPaymentModal] = useState(false);
  const [markAsPaidForm, setMarkAsPaidForm] = useState<MarkAsPaidForm>({
    paidAt: new Date().toISOString().split('T')[0],
    method: '',
    type: 'RENT',
    timingStatus: 'ONTIME',
    manualTimingOverride: false,
    note: ''
  });
  const [editPaymentModal, setEditPaymentModal] = useState<{
    isOpen: boolean;
    payment: Payment | null;
  }>({
    isOpen: false,
    payment: null,
  });
  const [editPaymentForm, setEditPaymentForm] = useState<EditPaymentForm>({
    amount: 0,
    dueDate: '',
    type: 'RENT',
    note: '',
  });
  const [recordPaymentForm, setRecordPaymentForm] = useState<RecordPaymentForm>({
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    paidAt: new Date().toISOString().split('T')[0],
    method: '',
    type: 'RENT',
    status: 'PENDING',
    timingStatus: 'ONTIME',
    manualTimingOverride: false,
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [noteModal, setNoteModal] = useState<{ isOpen: boolean; note: string | null }>({
    isOpen: false,
    note: null,
  });
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [terminateLoading, setTerminateLoading] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [terminateConfirmation, setTerminateConfirmation] = useState('');
  const [completeConfirmation, setCompleteConfirmation] = useState('');
  const [cancelConfirmation, setCancelConfirmation] = useState('');
  const terminatePhrase = 'TERMINATE';
  const completePhrase = 'COMPLETE';
  const cancelPhrase = 'CANCEL';
  const [addNoteModal, setAddNoteModal] = useState(false);
  const [editNoteModal, setEditNoteModal] = useState<{ isOpen: boolean; noteIndex: number | null; note: LandlordNote | null }>({
    isOpen: false,
    noteIndex: null,
    note: null,
  });
  const [newNote, setNewNote] = useState({ note: '', category: 'OTHER' as LandlordNote['category'] });

  const handleSettingsModalChange = (open: boolean) => {
    setSettingsModalOpen(open);
    if (!open) {
      setTerminateConfirmation('');
      setCompleteConfirmation('');
      setCancelConfirmation('');
    }
  };

  // Initialize active tab from session storage
  useEffect(() => {
    if (leaseId) {
      const savedTab = sessionStorage.getItem(`lease-${leaseId}-activeTab`);
      if (savedTab && (savedTab === 'info' || savedTab === 'payments' || savedTab === 'behavior')) {
        setActiveTab(savedTab);
      }
    }
  }, [leaseId]);

  // Save active tab to session storage when it changes
  useEffect(() => {
    if (leaseId) {
      sessionStorage.setItem(`lease-${leaseId}-activeTab`, activeTab);
    }
  }, [activeTab, leaseId]);

  // Ensure activeTab is 'info' if lease status is PENDING
  useEffect(() => {
    if (lease && lease.status === 'PENDING' && (activeTab === 'payments' || activeTab === 'behavior')) {
      setActiveTab('info');
    }
  }, [lease, activeTab]);

  // Fetch lease data
  const fetchLeaseData = async (silent = false) => {
    if (!leaseId) return;

    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      const response = await getLeaseByIdRequest(leaseId);
      setLease(response.data.lease);
      // Set default amount for record payment form
      if (response.data.lease) {
        setRecordPaymentForm(prev => ({
          ...prev,
          amount: response.data.lease.rentAmount
        }));
      }
    } catch (error) {
      console.error('Error fetching lease data:', error);
    } finally {
      if (!silent) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchLeaseData();
  }, [leaseId]);

  const handleRefresh = () => {
    fetchLeaseData(true);
  };

  // Get upcoming payments that need reminders
  const getUpcomingPayments = () => {
    if (!lease?.payments?.length) return [];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    return lease.payments
      .filter(payment => {
        if (payment.status === 'PAID') return false;
        const dueDate = new Date(payment.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate <= sevenDaysFromNow;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  // Get overdue payments
  const getOverduePayments = () => {
    if (!lease?.payments?.length) return [];
    
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

  // Get reminder stage display text
  const getReminderStageText = (stage: number) => {
    switch (stage) {
      case 0:
        return 'No reminder sent';
      case 1:
        return 'Reminder sent (pre-due)';
      case 2:
        return 'Reminders sent twice (pre-due & due-day)';
      default:
        return 'Unknown';
    }
  };



  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'default';
      case 'PENDING':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getTimingStatusVariant = (status: string | null) => {
    switch (status) {
      case 'ONTIME':
        return 'default';
      case 'LATE':
        return 'destructive';
      case 'ADVANCE':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };


  const calculateLeaseProgress = () => {
    if (!lease) return 0;
    
    const start = new Date(lease.startDate);
    const end = lease.endDate ? new Date(lease.endDate) : new Date();
    const now = new Date();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  const calculateLeaseDuration = () => {
    if (!lease || !lease.endDate) return { days: 0, months: 0 };
    const start = new Date(lease.startDate);
    const end = new Date(lease.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    return { days, months };
  };

  const getLeaseTypeDisplay = (leaseType: string) => {
    switch (leaseType) {
      case 'SHORT_TERM':
        return 'SHORT TERM';
      case 'LONG_TERM':
        return 'LONG TERM';
      case 'STANDARD':
        return 'STANDARD';
      case 'FIXED_TERM':
        return 'FIXED TERM';
      default:
        return leaseType;
    }
  };

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

  const getOrdinalSuffix = (number: number) => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const value = number % 100;
    return number + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4" />;
      case 'COMPLETED':
        return <Calendar className="w-4 h-4" />;
      case 'TERMINATED':
        return <AlertTriangle className="w-4 h-4" />;
      case 'CANCELLED':
        return <Ban className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    return (
      LEASE_STATUS_THEME[status as keyof typeof LEASE_STATUS_THEME]?.badge ??
      "bg-slate-50 border border-slate-200 text-slate-700"
    );
  };

  const getStatusGradient = (status: string) => {
    return (
      LEASE_STATUS_THEME[status as keyof typeof LEASE_STATUS_THEME]?.gradient ??
      "from-slate-500 to-gray-500"
    );
  };

  const getCombinedHeaderGradient = (status: string) => {
    // Combine base gradient with status gradient
    switch (status) {
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

  // Calculate timing status based on due date and paid date
  const calculateTimingStatus = (dueDate: string, paidAt: string | null, paymentType?: string): 'ONTIME' | 'LATE' | 'ADVANCE' | null => {
    if (!paidAt) return null;
    
    // If payment type is PREPAYMENT or ADVANCE_PAYMENT, default to ADVANCE
    if (paymentType === 'PREPAYMENT' || paymentType === 'ADVANCE_PAYMENT') {
      return 'ADVANCE';
    }
    
    const due = new Date(dueDate);
    const paid = new Date(paidAt);
    
    if (paid < due) return 'ADVANCE';
    if (paid > due) return 'LATE';
    return 'ONTIME';
  };

  // Mark as Paid functionality
  const handleMarkAsPaid = (payment: Payment) => {
    // Only allow marking as paid if lease status is ACTIVE
    if (lease?.status !== 'ACTIVE') {
      return;
    }
    setMarkAsPaidModal({
      isOpen: true,
      payment,
    });
    const defaultTimingStatus = calculateTimingStatus(payment.dueDate, new Date().toISOString().split('T')[0], payment.type || 'RENT');
    // Get today's date in local timezone (YYYY-MM-DD format)
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    setMarkAsPaidForm({
      paidAt: todayString,
      method: '',
      type: payment.type || 'RENT', // Pre-populate with existing payment type, can be updated
      timingStatus: defaultTimingStatus || 'ONTIME',
      manualTimingOverride: false,
      note: '', // Initialize note field
      // If it's a PREPAYMENT with amount 0, allow landlord to set amount
      amount: payment.type === 'PREPAYMENT' && payment.amount === 0 ? undefined : payment.amount
    });
  };

  const handleMarkAsPaidSubmit = async () => {
    if (!markAsPaidModal.payment || !leaseId) return;

    // Calculate timing status (use manual override if set, otherwise calculate)
    // Use the form's type
    let timingStatus: 'ONTIME' | 'LATE' | 'ADVANCE' | null;
    if (markAsPaidForm.manualTimingOverride) {
      timingStatus = markAsPaidForm.timingStatus as 'ONTIME' | 'LATE' | 'ADVANCE';
    } else {
      timingStatus = calculateTimingStatus(
        markAsPaidModal.payment.dueDate,
        markAsPaidForm.paidAt,
        markAsPaidForm.type
      );
    }

    // Get the amount to display (use form amount for prepayments with amount 0, otherwise use payment amount)
    const displayAmount = (markAsPaidForm.type === 'PREPAYMENT' && markAsPaidModal.payment.amount === 0 && markAsPaidForm.amount)
      ? markAsPaidForm.amount
      : markAsPaidModal.payment.amount;

    if (!confirm(`Are you sure you want to mark this payment as paid?\nAmount: ${formatCurrency(displayAmount)}\nMethod: ${markAsPaidForm.method}\nDate: ${formatDate(markAsPaidForm.paidAt)}`)) {
      return;
    }

    try {
      setSubmitting(true);
      
      // Prepare request data - use form's type
      const requestData: {
        paidAt: string;
        method: string;
        type: string;
        timingStatus: string;
        amount?: number;
        note?: string;
      } = {
        paidAt: markAsPaidForm.paidAt,
        method: markAsPaidForm.method,
        type: markAsPaidForm.type, // Use form's type
        timingStatus: timingStatus || 'ONTIME',
        note: markAsPaidForm.note?.trim() || undefined,
      };

      // Include amount if it's a PREPAYMENT with amount 0
      if (markAsPaidForm.type === 'PREPAYMENT' && markAsPaidModal.payment.amount === 0 && markAsPaidForm.amount !== undefined) {
        requestData.amount = markAsPaidForm.amount;
      }
      
      // Call the API to mark payment as paid
      await markPaymentAsPaidRequest(
        markAsPaidModal.payment.id,
        requestData
      );

      // Refetch lease data to get updated payments
      await fetchLeaseData(true);

      setMarkAsPaidModal({ isOpen: false, payment: null });
      toast.success('Payment marked as paid successfully!');
    } catch (error: any) {
      console.error('Error updating payment:', error);
      toast.error(error?.response?.data?.error || 'Failed to mark payment as paid. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Record Payment functionality
  const handleRecordPayment = () => {
    // Only allow recording payment if lease status is ACTIVE
    if (lease?.status !== 'ACTIVE') {
      return;
    }
    setRecordPaymentModal(true);
    const defaultPaidAt = new Date().toISOString().split('T')[0];
    const defaultTimingStatus = calculateTimingStatus(
      new Date().toISOString().split('T')[0],
      defaultPaidAt,
      'RENT'
    ) || 'ONTIME';
    setRecordPaymentForm({
      amount: lease?.rentAmount || 0,
      dueDate: new Date().toISOString().split('T')[0],
      paidAt: defaultPaidAt,
      method: '',
      type: 'RENT',
      status: 'PENDING',
      timingStatus: defaultTimingStatus,
      manualTimingOverride: false,
      note: '',
    });
  };

  // Handle status change in record payment form
  useEffect(() => {
    if (recordPaymentModal) {
      if (recordPaymentForm.status === 'PAID' && !recordPaymentForm.paidAt) {
        const paidAt = new Date().toISOString().split('T')[0];
        const newTimingStatus = recordPaymentForm.manualTimingOverride
          ? recordPaymentForm.timingStatus
          : (calculateTimingStatus(recordPaymentForm.dueDate, paidAt, recordPaymentForm.type) || 'ONTIME');
        setRecordPaymentForm(prev => ({
          ...prev,
          paidAt,
          timingStatus: newTimingStatus,
        }));
      } else if (recordPaymentForm.status === 'PENDING') {
        // Clear method and paidAt when status is PENDING
        setRecordPaymentForm(prev => ({
          ...prev,
          method: '',
          paidAt: '',
          timingStatus: 'ONTIME',
          manualTimingOverride: false,
        }));
      }
    }
  }, [recordPaymentForm.status, recordPaymentModal]);

  const handleEditPaymentSubmit = async () => {
    if (!editPaymentModal.payment || !leaseId) return;

    if (!confirm(`Update this payment record?\nAmount: ${formatCurrency(editPaymentForm.amount)}\nDue Date: ${formatDate(editPaymentForm.dueDate)}\nType: ${editPaymentForm.type}`)) {
      return;
    }

    try {
      setSubmitting(true);
      
      await updatePaymentRequest(editPaymentModal.payment.id, {
        amount: editPaymentForm.amount,
        dueDate: editPaymentForm.dueDate,
        type: editPaymentForm.type,
        note: editPaymentForm.note.trim() || undefined,
      });

      await fetchLeaseData(true);

      setEditPaymentModal({ isOpen: false, payment: null });
      toast.success('Payment updated successfully!');
    } catch (error: any) {
      console.error('Error updating payment:', error);
      toast.error(error?.response?.data?.error || 'Failed to update payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePayment = async (payment: Payment) => {
    // Only allow deleting PENDING payments
    if (payment.status !== 'PENDING' || lease?.status !== 'ACTIVE') {
      return;
    }

    if (!confirm(`Are you sure you want to delete this payment?\nAmount: ${formatCurrency(payment.amount)}\nDue Date: ${formatDate(payment.dueDate)}\nType: ${payment.type || 'RENT'}\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      setSubmitting(true);
      await deletePaymentRequest(payment.id);
      await fetchLeaseData(true);
      toast.success('Payment deleted successfully!');
    } catch (error: any) {
      console.error('Error deleting payment:', error);
      toast.error(error?.response?.data?.error || 'Failed to delete payment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPaymentSubmit = async () => {
    if (!lease || !leaseId) return;

    // Calculate timing status (use manual override if set, otherwise calculate)
    let timingStatus: 'ONTIME' | 'LATE' | 'ADVANCE' | null = null;
    if (recordPaymentForm.status === 'PAID') {
      if (recordPaymentForm.manualTimingOverride) {
        timingStatus = recordPaymentForm.timingStatus as 'ONTIME' | 'LATE' | 'ADVANCE';
      } else {
        timingStatus = calculateTimingStatus(recordPaymentForm.dueDate, recordPaymentForm.paidAt, recordPaymentForm.type);
      }
    }

    if (!confirm(`Create new payment record?\nAmount: ${formatCurrency(recordPaymentForm.amount)}\nDue Date: ${formatDate(recordPaymentForm.dueDate)}\nStatus: ${recordPaymentForm.status}`)) {
      return;
    }

    try {
      setSubmitting(true);
      
      // Call the API to create the payment
      await createPaymentRequest(leaseId, {
        amount: recordPaymentForm.amount,
        dueDate: recordPaymentForm.dueDate,
        paidAt: recordPaymentForm.status === 'PAID' ? recordPaymentForm.paidAt : null,
        method: recordPaymentForm.status === 'PAID' ? recordPaymentForm.method : (undefined as any),
        type: recordPaymentForm.type,
        status: recordPaymentForm.status,
        timingStatus: timingStatus || null,
        note: recordPaymentForm.note.trim() || null,
      });

      // Refetch lease data to get updated payments
      await fetchLeaseData(true);

      setRecordPaymentModal(false);
      toast.success('Payment record created successfully!');
    } catch (error: any) {
      console.error('Error creating payment:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to create payment record. Please try again.';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelLease = async () => {
    if (!leaseId || !lease || lease.status !== 'PENDING') return;

    const nicknameOrLabel =
      lease.leaseNickname ||
      `${lease.tenant.firstName} ${lease.tenant.lastName} - ${lease.unit.label}`;

    const confirmMessage = `Cancel "${nicknameOrLabel}"?\n\n• The tenant invitation will be voided.\n• Pending payments will be removed.\n• This action cannot be undone.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setCancelLoading(true);
      await cancelLeaseRequest(leaseId);
      await fetchLeaseData(true);
      handleSettingsModalChange(false);
      alert('Lease cancelled successfully.');
    } catch (error: any) {
      console.error('Error cancelling lease:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to cancel lease. Please try again.';
      alert(errorMessage);
    } finally {
      setCancelLoading(false);
      setCancelConfirmation('');
    }
  };

  const handleCompleteLease = async () => {
    if (!leaseId || !lease) return;

    const nicknameOrLabel =
      lease.leaseNickname ||
      `${lease.tenant.firstName} ${lease.tenant.lastName} - ${lease.unit.label}`;

    const confirmMessage = `Mark "${nicknameOrLabel}" as completed?\n\n• The lease end date has passed.\n• Remaining pending payments will be locked.\n• You will no longer be able to record or edit payments for this lease.\n• This action cannot be undone.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setCompleteLoading(true);
      await completeLeaseRequest(leaseId);
      await fetchLeaseData(true);
      handleSettingsModalChange(false);
      toast.success('Lease marked as completed successfully!');
    } catch (error: any) {
      console.error('Error completing lease:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to complete lease. Please try again.';
      toast.error(errorMessage);
    } finally {
      setCompleteLoading(false);
      setCompleteConfirmation('');
    }
  };

  const handleTerminateLease = async () => {
    if (!leaseId || !lease) return;

    const nicknameOrLabel =
      lease.leaseNickname ||
      `${lease.tenant.firstName} ${lease.tenant.lastName} - ${lease.unit.label}`;

    const confirmMessage = `Terminate "${nicknameOrLabel}"?\n\n• Remaining pending payments will be locked as ended items.\n• You will no longer be able to record or edit payments for this lease.\n• This action cannot be undone.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setTerminateLoading(true);
      await terminateLeaseRequest(leaseId);
      await fetchLeaseData(true);
      handleSettingsModalChange(false);
      alert('Lease terminated successfully. Payments are now locked.');
    } catch (error: any) {
      console.error('Error terminating lease:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to terminate lease. Please try again.';
      alert(errorMessage);
    } finally {
      setTerminateLoading(false);
      setTerminateConfirmation('');
    }
  };

  const currentUser = useAuthStore((state) => state.user);

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Card className="shadow-xl border-0">
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!lease) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Lease Not Found</h3>
            <p className="text-gray-600 mb-4">The requested lease could not be found.</p>
            <Button onClick={() => navigate('/landlord/leases')}>Back to Leases</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const leaseProgress = calculateLeaseProgress();
  const leaseDuration = calculateLeaseDuration();
  const paidPayments = lease.payments.filter(p => p.status === 'PAID');
  const totalPaid = paidPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingPayments = lease.payments.filter(p => p.status === 'PENDING');
  const totalExpected = lease.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const outstandingAmount = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const overduePayments = getOverduePayments();
  const overdueAmount = overduePayments.reduce((sum, payment) => sum + payment.amount, 0);
  const leaseIsPending = lease.status === 'PENDING';
  const leaseIsActive = lease.status === 'ACTIVE';
  const leaseIsTerminated = lease.status === 'TERMINATED';
  const leaseIsCancelled = lease.status === 'CANCELLED';
  const leaseIsCompleted = lease.status === 'COMPLETED';
  const leaseCanCancel = leaseIsPending;
  
  // Check if end date has passed or is today
  const isEndDatePassed = () => {
    if (!lease.endDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = new Date(lease.endDate);
    endDate.setHours(0, 0, 0, 0);
    return endDate <= today;
  };
  
  const leaseCanComplete = leaseIsActive && isEndDatePassed();
  const leaseCanTerminate = leaseIsActive && !isEndDatePassed();
  const leaseIsClosed = leaseIsTerminated || leaseIsCancelled || leaseIsCompleted;
  const canEditLease = leaseIsPending;
  
  // Get landlord info (assuming it's available in the lease object or we need to get it from context)
  // For now, we'll assume the current user is the landlord

  const themeGradient = getStatusGradient(lease.status);
  const themeColor = getStatusColor(lease.status);
  const combinedHeaderGradient = getCombinedHeaderGradient(lease.status);

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="space-y-6">
        {/* Header Section - Similar to Leases.tsx but with Status Colors */}
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

            <div className="px-4 sm:px-6 py-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0 flex-1">
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
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className={`text-lg sm:text-2xl font-semibold tracking-tight ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.textColorDark || 'text-slate-900'} truncate`}>
                        {lease.leaseNickname || `${lease.tenant.firstName} ${lease.tenant.lastName} - ${lease.unit.label}`}
                      </h1>
                      <motion.div
                        animate={{ rotate: [0, 8, -8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Sparkles className={`h-4 w-4 ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.textColor || 'text-teal-500'}`} />
                      </motion.div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm border ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.border || 'border-gray-200'} text-xs sm:text-sm ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.textColor || 'text-slate-700'}`}>
                        <Building className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="truncate font-medium">{lease.property.title}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm border ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.border || 'border-gray-200'} text-xs sm:text-sm ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.textColor || 'text-slate-700'}`}>
                        <DollarSign className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="font-semibold">{formatCurrency(lease.rentAmount)}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm border ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.border || 'border-gray-200'} text-xs sm:text-sm ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.textColor || 'text-slate-700'}`}>
                        <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="font-medium">{lease.unit.label}</span>
                      </div>
                      {lease.endDate && (
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/60 backdrop-blur-sm border ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.border || 'border-gray-200'} text-xs sm:text-sm ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.textColor || 'text-slate-700'}`}>
                          <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline font-medium">Ends {formatDate(lease.endDate)}</span>
                          <span className="sm:hidden font-medium">{new Date(lease.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Status Badge and Refresh Button */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <Badge className={`${themeColor} flex items-center gap-1.5 text-xs sm:text-sm px-3 py-1.5 border shadow-sm font-medium`}>
                    {getStatusIcon(lease.status)}
                    {lease.status}
                  </Badge>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={() => handleSettingsModalChange(true)}
                      variant="outline"
                      size="sm"
                      className="bg-white/90 hover:bg-white border-slate-300 text-slate-700 hover:text-slate-900 shadow-sm"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                    <Button
                      onClick={handleRefresh}
                      variant="outline"
                      size="sm"
                      disabled={refreshing}
                      className="bg-white/90 hover:bg-white border-slate-300 text-slate-700 hover:text-slate-900 shadow-sm"
                    >
                      {refreshing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Refresh
                        </>
                      ) : (
                        <>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Refresh
                        </>
                      )}
                    </Button>
                  </div>
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

        {/* Main Content */}
        <Card className="shadow-xl border-0">
        <CardHeader className="bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.iconBackground || 'bg-gray-500'}`}>
              <FileText className="w-5 h-5 text-white" />
            </div>
            <CardTitle className="text-xl text-gray-900">Lease Management</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Redesigned Tabs - Similar to Leases.tsx with Status Colors */}
            <div className="border-b bg-gradient-to-br from-slate-50/80 via-gray-50/60 to-slate-50/80 backdrop-blur-sm">
              <TabsList className={`w-full h-auto bg-transparent p-2 sm:p-3 gap-2 grid ${lease.status === 'PENDING' ? 'grid-cols-1' : lease.status === 'ACTIVE' || lease.status === 'COMPLETED' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                <TabsTrigger 
                  value="info" 
                  className={`relative flex-1 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-medium transition-all ${
                    activeTab === 'info' 
                      ? `bg-gradient-to-r ${themeGradient}/20 ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.textColor || 'text-slate-700'} border ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.border || 'border-gray-200'}/50 shadow-sm backdrop-blur-sm` 
                      : `bg-gray-50/50 border border-gray-200 hover:bg-gray-100/50 text-gray-600`
                  }`}
                >
                  <FileText className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'info' ? LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.textColor || 'text-slate-700' : 'text-gray-500'}`} />
                  <span className="hidden sm:inline">Lease Information</span>
                  <span className="sm:hidden">Lease</span>
                </TabsTrigger>
                {lease.status !== 'PENDING' && (
                  <TabsTrigger 
                    value="payments" 
                    className={`relative flex-1 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-medium transition-all ${
                      activeTab === 'payments' 
                        ? `bg-gradient-to-r ${themeGradient}/20 ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.textColor || 'text-slate-700'} border ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.border || 'border-gray-200'}/50 shadow-sm backdrop-blur-sm` 
                        : `bg-gray-50/50 border border-gray-200 hover:bg-gray-100/50 text-gray-600`
                    }`}
                  >
                    <CreditCard className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'payments' ? LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.textColor || 'text-slate-700' : 'text-gray-500'}`} />
                    <span className="hidden sm:inline">Payments</span>
                    <span className="sm:hidden">Payments</span>
                    {lease.payments.length > 0 && (
                      <Badge className={`ml-1 text-xs px-1.5 py-0 ${
                        activeTab === 'payments' 
                          ? `${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.pill || 'bg-gray-100'} ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.textColor || 'text-slate-700'} border ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.border || 'border-gray-200'}/50` 
                          : `bg-gray-100 text-gray-700`
                      }`}>
                        {lease.payments.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                )}
                {(lease.status === 'ACTIVE' || lease.status === 'COMPLETED') && (
                  <TabsTrigger 
                    value="behavior" 
                    className={`relative flex-1 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-medium transition-all ${
                      activeTab === 'behavior' 
                        ? `bg-gradient-to-r ${themeGradient}/20 ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.textColor || 'text-slate-700'} border ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.border || 'border-gray-200'}/50 shadow-sm backdrop-blur-sm` 
                        : `bg-gray-50/50 border border-gray-200 hover:bg-gray-100/50 text-gray-600`
                    }`}
                  >
                    <BarChart3 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${activeTab === 'behavior' ? LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.textColor || 'text-slate-700' : 'text-gray-500'}`} />
                    <span className="hidden sm:inline">Tenant Behavior</span>
                    <span className="sm:hidden">Behavior</span>
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {/* Lease Information Tab - Redesigned */}
            <TabsContent value="info" className="m-0 p-3 sm:p-4 md:p-6 space-y-6">
              {/* PENDING Status Notice */}
              {lease.status === 'PENDING' && (
                <Card className="border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
                          <Clock className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-amber-600 text-white border-amber-700 text-sm px-3 py-1">
                            PENDING STATUS
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-amber-900 mb-2">
                          Lease Awaiting Tenant Acceptance
                        </h3>
                        <p className="text-sm text-amber-800 mb-4">
                          This lease is currently pending. Contact your tenant to accept the invitation for the lease to become effective.
                        </p>
                        <Button
                          onClick={() => navigate('/landlord/messages')}
                          className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Contact Your Tenant
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Progress Bar - Redesigned */}
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">Lease Progress</h3>
                      <p className="text-xs text-gray-500">Track your lease timeline</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.textColor || 'text-gray-700'}`}>
                        {leaseProgress.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-500">Complete</p>
                    </div>
                  </div>
                  
                  {/* Custom Progress Bar */}
                  <div className="relative">
                    <div className="h-4 w-full rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                      <div 
                        className={`h-full bg-gradient-to-r ${themeGradient} transition-all duration-700 ease-out relative`}
                        style={{ width: `${leaseProgress}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                      </div>
                    </div>
                    {/* Progress indicator dot */}
                    <div 
                      className={`absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-2 ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.borderDark || 'border-gray-300'} shadow-lg flex items-center justify-center transition-all duration-700`}
                      style={{ left: `calc(${leaseProgress}% - 12px)` }}
                    >
                      <div className={`w-2 h-2 rounded-full ${LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME]?.iconBackground || 'bg-gray-500'}`} />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-gray-500 mb-1">Start Date</span>
                      <span className="text-sm font-semibold text-gray-700">{formatDate(lease.startDate)}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-medium text-gray-500 mb-1">End Date</span>
                      <span className="text-sm font-semibold text-gray-700">
                        {lease.endDate ? formatDate(lease.endDate) : 'Ongoing'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lease Information - Combined Section */}
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
                            {getOrdinalSuffix(lease.dueDate)} each {getIntervalDisplay(lease.interval)}
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
                          <p className="text-base font-semibold text-gray-700">{getLeaseTypeDisplay(lease.leaseType)}</p>
                        </div>
                        <div className="p-3 bg-white/80 rounded-lg border border-gray-100/50">
                          <p className="text-xs text-gray-500 mb-1">Payment Interval</p>
                          <p className="text-base font-semibold text-gray-700 capitalize">{getIntervalDisplay(lease.interval)}</p>
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
                          <p className="text-sm font-semibold text-gray-700">{lease.endDate ? formatDate(lease.endDate) : 'No end date'}</p>
                        </div>
                        <div className="p-3 bg-white/80 rounded-lg border border-gray-100/50">
                          <p className="text-xs text-gray-500 mb-1">Duration</p>
                          <p className="text-sm font-semibold text-gray-700">
                            {lease.endDate ? (
                              <>
                                {leaseDuration.months > 0 && `${leaseDuration.months} month${leaseDuration.months !== 1 ? 's' : ''}, `}
                                {leaseDuration.days} day{leaseDuration.days !== 1 ? 's' : ''}
                              </>
                            ) : (
                              'Ongoing'
                            )}
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
                            {lease.leaseDocumentUrl ? 'Download or view the lease agreement document' : 'Lease document will be available soon'}
                          </p>
                        </div>
                        {lease.leaseDocumentUrl ? (
                          <FileText className="h-8 w-8 text-blue-500" />
                        ) : (
                          <FileText className="h-8 w-8 text-gray-300" />
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        {lease.leaseDocumentUrl ? (
                          <>
                            <Button 
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = lease.leaseDocumentUrl!;
                                link.download = `Lease-Document-${lease.leaseNickname || 'Lease'}.pdf`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className={`flex-1 bg-gradient-to-r ${themeGradient} text-white hover:opacity-90`}
                              variant="default"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            <Button 
                              onClick={() => lease.leaseDocumentUrl && window.open(lease.leaseDocumentUrl, '_blank')}
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
                          onClick={() => navigate('/landlord/messages')}
                          variant="outline"
                          className="flex-1 sm:flex-initial border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Contact Tenant
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Property & Unit Information */}
              <Card className="bg-gradient-to-br from-blue-50/20 to-indigo-50/20 border border-blue-100/50">
                <CardHeader className="bg-white/90 border-b border-blue-100/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-gray-700">
                      <div className="p-1.5 rounded-lg bg-blue-500 text-white">
                        <Home className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      Property & Unit
                    </CardTitle>
                    <Button
                      onClick={() => navigate(`/landlord/properties/${lease.propertyId}`)}
                      variant="outline"
                      size="sm"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
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
                      <p className="text-xs text-gray-600">
                        {lease.property.street}, {lease.property.barangay}, {lease.property.city.name}, {lease.property.zipCode}
                      </p>
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

              {/* Parties Involved - Combined Tenant and Landlord */}
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
                          <AvatarImage src={lease.tenant.avatarUrl || undefined} />
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
                          <AvatarImage src={currentUser?.avatarUrl || undefined} />
                          <AvatarFallback className="text-sm bg-blue-100 text-blue-700">
                            {currentUser?.firstName?.[0] || 'L'}{currentUser?.lastName?.[0] || 'L'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-sm text-gray-700">
                            {currentUser?.firstName && currentUser?.lastName 
                              ? `${currentUser.firstName} ${currentUser.lastName}`
                              : 'Landlord'}
                          </p>
                          <Badge variant="default" className="text-xs mt-0.5 bg-blue-500 text-white">Landlord</Badge>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs">
                        {currentUser?.email && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="h-3 w-3 text-blue-500" />
                            <span className="break-all">{currentUser.email}</span>
                          </div>
                        )}
                        {currentUser?.phoneNumber && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="h-3 w-3 text-blue-500" />
                            <span>{currentUser.phoneNumber}</span>
                          </div>
                        )}
                        {!currentUser?.email && !currentUser?.phoneNumber && (
                          <div className="flex items-center gap-2 text-gray-500">
                            <Mail className="h-3 w-3 text-blue-500" />
                            <span>Your account</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            {lease.status !== 'PENDING' && (
              <TabsContent value="payments" className="m-0 p-3 sm:p-4 md:p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Payment Management</h3>
                  <p className="text-gray-600">Track and manage all payment transactions</p>
                </div>
                {lease.status === 'ACTIVE' && (
                  <Button 
                    className="bg-green-600 hover:bg-green-700 shadow-lg"
                    onClick={handleRecordPayment}
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    Record New Payment
                  </Button>
                )}
              </div>

              {/* Payment Reminders */}
              {(() => {
                const upcomingPayments = getUpcomingPayments();
                const overduePayments = getOverduePayments();
                const allReminderPayments = [...overduePayments, ...upcomingPayments.filter(p => !overduePayments.find(op => op.id === p.id))];
                
                if (allReminderPayments.length > 0) {
                  return (
                    <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-amber-500 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
                              Payment Reminders
                              <Badge className="bg-amber-600 text-white">{allReminderPayments.length}</Badge>
                            </h4>
                            <p className="text-sm text-amber-800 mb-3">
                              The following payments are due soon or overdue and have not been paid. Reminders will be sent to the tenant.
                            </p>
                            <div className="space-y-2">
                              {allReminderPayments.map((payment) => {
                                const dueDate = new Date(payment.dueDate);
                                dueDate.setHours(0, 0, 0, 0);
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const timeDiff = dueDate.getTime() - today.getTime();
                                const daysUntilDue = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                                const isOverdue = daysUntilDue < 0;
                                
                                return (
                                  <div key={payment.id} className={`flex items-center justify-between p-3 rounded-lg border ${
                                    isOverdue 
                                      ? 'bg-red-50/80 border-red-300' 
                                      : 'bg-white/80 border-amber-200'
                                  }`}>
                                    <div className="flex items-center gap-3 flex-1">
                                      <Calendar className={`w-4 h-4 ${isOverdue ? 'text-red-600' : 'text-amber-600'}`} />
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <p className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                                          <Badge variant="outline" className="text-xs px-1.5 py-0 border-gray-300 text-gray-700">
                                            {payment.type || 'RENT'}
                                          </Badge>
                                        </div>
                                        <p className="text-xs text-gray-600">Due: {formatDate(payment.dueDate)}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                          {getReminderStageText(payment.reminderStage)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {payment.note && (
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => setNoteModal({ isOpen: true, note: payment.note })}
                                          className="border-blue-200 text-blue-700 hover:bg-blue-50 h-8 px-2"
                                        >
                                          <FileText className="w-3 h-3 mr-1" />
                                          Note
                                        </Button>
                                      )}
                                      {lease.status === 'ACTIVE' && (
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => handleMarkAsPaid(payment)}
                                          className="border-green-200 text-green-700 hover:bg-green-50 h-8 px-2"
                                        >
                                          Mark as Paid
                                        </Button>
                                      )}
                                      <Badge className={
                                        isOverdue 
                                          ? "bg-red-500 text-white" 
                                          : daysUntilDue === 0 
                                            ? "bg-red-500 text-white" 
                                            : daysUntilDue === 1 
                                              ? "bg-orange-500 text-white" 
                                              : "bg-amber-500 text-white"
                                      }>
                                        {isOverdue 
                                          ? `${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''} overdue` 
                                          : daysUntilDue === 0 
                                            ? 'Due Today' 
                                            : daysUntilDue === 1 
                                              ? 'Due Tomorrow' 
                                              : `${daysUntilDue} days left`}
                                      </Badge>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
                return null;
              })()}

              {/* Payment Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-sm">
                  <CardContent className="p-3 text-center">
                    <CreditCard className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600 font-medium mb-0.5">Total Expected</p>
                    <p className="text-base font-bold text-blue-600">{formatCurrency(totalExpected)}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{lease.payments.length} payment{lease.payments.length !== 1 ? 's' : ''}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-0 shadow-sm">
                  <CardContent className="p-3 text-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600 font-medium mb-0.5">Collected</p>
                    <p className="text-base font-bold text-green-600">{formatCurrency(totalPaid)}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{paidPayments.length} payment{paidPayments.length !== 1 ? 's' : ''}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-0 shadow-sm">
                  <CardContent className="p-3 text-center">
                    <Clock className="w-4 h-4 text-orange-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600 font-medium mb-0.5">Outstanding</p>
                    <p className="text-base font-bold text-orange-600">{formatCurrency(outstandingAmount)}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{pendingPayments.length} payment{pendingPayments.length !== 1 ? 's' : ''} awaiting confirmation</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-red-50 to-rose-50 border-0 shadow-sm">
                  <CardContent className="p-3 text-center">
                    <AlertTriangle className="w-4 h-4 text-red-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600 font-medium mb-0.5">Overdue</p>
                    <p className="text-base font-bold text-red-600">{formatCurrency(overdueAmount)}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{overduePayments.length} payment{overduePayments.length !== 1 ? 's' : ''} overdue</p>
                  </CardContent>
                </Card>
              </div>

              {/* Payments Table */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    Payment History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
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
                              <p className="text-gray-500">Start by recording your first payment</p>
                              {lease.status === 'ACTIVE' && (
                                <Button 
                                  className="mt-2 bg-green-600 hover:bg-green-700"
                                  onClick={handleRecordPayment}
                                >
                                  <Receipt className="w-4 h-4 mr-2" />
                                  Record Payment
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        lease.payments.map((payment) => (
                          <TableRow 
                            key={payment.id} 
                            className={`hover:bg-gray-50 transition-colors ${
                              payment.status === 'PENDING' && lease.status === 'ACTIVE' 
                                ? 'cursor-pointer' 
                                : ''
                            }`}
                            onClick={() => {
                              if (payment.status === 'PENDING' && lease.status === 'ACTIVE') {
                                // Open edit modal for PENDING payments
                                setEditPaymentModal({
                                  isOpen: true,
                                  payment,
                                });
                                setEditPaymentForm({
                                  amount: payment.amount,
                                  dueDate: payment.dueDate.split('T')[0],
                                  type: payment.type || 'RENT',
                                  note: payment.note || '',
                                });
                              }
                            }}
                          >
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
                                  <CheckCircle className="w-3 h-3 mr-1" />
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
                                  variant={getTimingStatusVariant(payment.timingStatus)}
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
                            <TableCell>
                              <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                {payment.note && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setNoteModal({ isOpen: true, note: payment.note })}
                                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                  >
                                    <FileText className="w-4 h-4 mr-1" />
                                    Notes Available
                                  </Button>
                                )}
                                {lease.status === 'ACTIVE' && payment.status === 'PENDING' && (
                                  <>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleMarkAsPaid(payment);
                                      }}
                                      className="border-green-200 text-green-700 hover:bg-green-50"
                                    >
                                      Mark as Paid
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeletePayment(payment);
                                      }}
                                      className="border-red-200 text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4 mr-1" />
                                      Delete
                                    </Button>
                                  </>
                                )}
                                {payment.status === 'PAID' && (
                                  <Button variant="outline" size="sm" disabled>
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Paid
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            )}

            {/* Tenant Behavior Analysis Tab */}
            {(lease.status === 'ACTIVE' || lease.status === 'COMPLETED') && (
              <TabsContent value="behavior" className="m-0 p-3 sm:p-4 md:p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">Tenant Behavior Analysis</h3>
                    <p className="text-gray-600">Track tenant payment patterns and maintenance requests</p>
                  </div>
                  <Button
                    onClick={() => fetchLeaseData(true)}
                    variant="outline"
                    size="sm"
                    disabled={refreshing}
                    className="bg-white/90 hover:bg-white border-slate-300 text-slate-700 hover:text-slate-900 shadow-sm"
                  >
                    {refreshing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Refreshing
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Refresh Metrics
                      </>
                    )}
                  </Button>
                </div>

                {(() => {
                  const behaviorMetrics = lease.behaviorMetrics;
                  const landlordNotes = lease.landlordNotes;
                  
                  // Helper functions
                  const getPaymentBehaviorColor = (behavior: string | null) => {
                    switch (behavior) {
                      case 'GOOD':
                        return 'bg-green-100 text-green-700 border-green-300';
                      case 'HAS_1_LATE':
                        return 'bg-amber-100 text-amber-700 border-amber-300';
                      case 'HAS_MULTIPLE_LATE':
                        return 'bg-red-100 text-red-700 border-red-300';
                      case 'ONTIME':
                        return 'bg-green-100 text-green-700 border-green-300';
                      case 'LATE':
                        return 'bg-red-100 text-red-700 border-red-300';
                      case 'ADVANCE':
                        return 'bg-blue-100 text-blue-700 border-blue-300';
                      default:
                        return 'bg-gray-100 text-gray-700 border-gray-300';
                    }
                  };

                  // Get payment behavior display text with details
                  const getPaymentBehaviorDisplay = (behavior: string | null) => {
                    if (!behavior || !hasPaymentData) return 'No payment data yet';
                    
                    const paidPayments = lease.payments?.filter(p => p.status === 'PAID' && p.timingStatus) || [];
                    const timingCounts = {
                      ONTIME: paidPayments.filter(p => p.timingStatus === 'ONTIME').length,
                      LATE: paidPayments.filter(p => p.timingStatus === 'LATE').length,
                      ADVANCE: paidPayments.filter(p => p.timingStatus === 'ADVANCE').length,
                    };

                    switch (behavior) {
                      case 'GOOD':
                        const parts = [];
                        if (timingCounts.ADVANCE > 0) {
                          parts.push(`${timingCounts.ADVANCE} advance`);
                        }
                        if (timingCounts.ONTIME > 0) {
                          parts.push(`${timingCounts.ONTIME} on-time`);
                        }
                        const detailText = parts.length > 0 ? parts.join(' and ') : 'all payments';
                        return `Has ${detailText} payment${paidPayments.length !== 1 ? 's' : ''}. Good payment behavior.`;
                      case 'HAS_1_LATE':
                        return `Has 1 late payment.`;
                      case 'HAS_MULTIPLE_LATE':
                        return `Has ${timingCounts.LATE} late payment${timingCounts.LATE !== 1 ? 's' : ''}. This tenant needs improvement.`;
                      default:
                        return behavior;
                    }
                  };

                  const getCategoryColor = (category: string) => {
                    switch (category) {
                      case 'CLEANLINESS':
                        return 'bg-purple-100 text-purple-700 border-purple-300';
                      case 'NOISE':
                        return 'bg-orange-100 text-orange-700 border-orange-300';
                      case 'BEHAVIOR':
                        return 'bg-red-100 text-red-700 border-red-300';
                      case 'COMMUNICATION':
                        return 'bg-blue-100 text-blue-700 border-blue-300';
                      case 'PROPERTY_DAMAGE':
                        return 'bg-rose-100 text-rose-700 border-rose-300';
                      default:
                        return 'bg-gray-100 text-gray-700 border-gray-300';
                    }
                  };

                  // Calculate payment reliability percentage
                  const paymentReliabilityPercent = behaviorMetrics?.paymentReliability !== null && behaviorMetrics?.paymentReliability !== undefined
                    ? ((behaviorMetrics.paymentReliability || 0) * 100).toFixed(1) 
                    : null;

                  // Check if there are any paid payments to calculate metrics from
                  const paidPayments = lease.payments?.filter(p => p.status === 'PAID' && p.timingStatus) || [];
                  const hasPaymentData = paidPayments.length > 0;


                  return (
                    <>
                      {/* Metrics Overview */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Payment Behavior */}
                        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-sm">
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-blue-600" />
                              <CardTitle className="text-base">Payment Behavior</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {behaviorMetrics?.paymentBehavior ? (
                              <div className="space-y-2">
                                <Badge className={`${getPaymentBehaviorColor(behaviorMetrics.paymentBehavior)} font-semibold px-3 py-1.5 text-sm`}>
                                  {(behaviorMetrics.paymentBehavior === 'GOOD' || behaviorMetrics.paymentBehavior === 'HAS_1_LATE' || behaviorMetrics.paymentBehavior === 'HAS_MULTIPLE_LATE') ? (
                                    behaviorMetrics.paymentBehavior === 'GOOD' ? 'GOOD' : 
                                    behaviorMetrics.paymentBehavior === 'HAS_1_LATE' ? 'NEEDS ATTENTION' :
                                    'POOR'
                                  ) : (
                                    behaviorMetrics.paymentBehavior
                                  )}
                                </Badge>
                                <p className="text-sm text-gray-700 mt-2">
                                  {getPaymentBehaviorDisplay(behaviorMetrics.paymentBehavior)}
                                </p>
                                {paymentReliabilityPercent !== null && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    <span className="font-semibold">{paymentReliabilityPercent}%</span> payment reliability
                                  </p>
                                )}
                              </div>
                            ) : hasPaymentData ? (
                              <div className="space-y-2">
                                <p className="text-sm text-amber-600">Calculating...</p>
                                <p className="text-xs text-gray-500">Refresh to see updated metrics</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-sm text-gray-500">No payment data yet</p>
                                <p className="text-xs text-gray-400">Metrics will appear after payments are marked as paid</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Payment Reliability */}
                        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-sm">
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <CardTitle className="text-base">Payment Reliability</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            {paymentReliabilityPercent !== null ? (
                              <div className="space-y-2">
                                <div className="flex items-baseline gap-2">
                                  <span className="text-3xl font-bold text-green-600">{paymentReliabilityPercent}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div 
                                    className={`h-2.5 rounded-full transition-all ${
                                      parseFloat(paymentReliabilityPercent) >= 80 
                                        ? 'bg-green-500' 
                                        : parseFloat(paymentReliabilityPercent) >= 60 
                                        ? 'bg-yellow-500' 
                                        : 'bg-red-500'
                                    }`}
                                    style={{ width: `${paymentReliabilityPercent}%` }}
                                  />
                                </div>
                                <p className="text-xs text-gray-600">
                                  {parseFloat(paymentReliabilityPercent) >= 80 
                                    ? 'Excellent' 
                                    : parseFloat(paymentReliabilityPercent) >= 60 
                                    ? 'Good' 
                                    : 'Needs Improvement'}
                                </p>
                              </div>
                            ) : hasPaymentData ? (
                              <div className="space-y-2">
                                <p className="text-sm text-amber-600">Calculating...</p>
                                <p className="text-xs text-gray-500">Refresh to see updated metrics</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-sm text-gray-500">No payment data yet</p>
                                <p className="text-xs text-gray-400">Metrics will appear after payments are marked as paid</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        {/* Maintenance Requests */}
                        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-0 shadow-sm">
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-2">
                              <Wrench className="w-5 h-5 text-amber-600" />
                              <CardTitle className="text-base">Maintenance Requests</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-amber-600">{behaviorMetrics?.maintenanceRequestsCount ?? 0}</span>
                                <span className="text-sm text-gray-600">requests</span>
                              </div>
                              <p className="text-xs text-gray-600">
                                {(behaviorMetrics?.maintenanceRequestsCount ?? 0) === 0 
                                  ? 'No maintenance requests' 
                                  : (behaviorMetrics?.maintenanceRequestsCount ?? 0) === 1
                                  ? '1 maintenance request recorded'
                                  : `${behaviorMetrics?.maintenanceRequestsCount ?? 0} maintenance requests recorded`}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Landlord Notes Section */}
                      <Card className="border-0 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-gray-600" />
                              <CardTitle>Landlord Notes</CardTitle>
                            </div>
                            {(lease.status === 'ACTIVE' || lease.status === 'COMPLETED') && (
                              <Button
                                onClick={() => {
                                  setNewNote({ note: '', category: 'OTHER' });
                                  setAddNoteModal(true);
                                }}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Note
                              </Button>
                            )}
                          </div>
                          <CardDescription>Private observations about tenant behavior (tenant cannot see these notes)</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          {!landlordNotes || landlordNotes.length === 0 ? (
                            <div className="p-12 text-center">
                              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                              <p className="text-gray-500 mb-1">No notes recorded yet</p>
                              <p className="text-sm text-gray-400">Add notes to track tenant behavior patterns</p>
                            </div>
                          ) : (
                            <div className="divide-y">
                              {landlordNotes?.map((note, index) => (
                                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Badge className={`${getCategoryColor(note.category)} text-xs px-2 py-0.5`}>
                                          {note.category}
                                        </Badge>
                                        <span className="text-xs text-gray-500">
                                          {new Date(note.date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.note}</p>
                                    </div>
                                    {(lease.status === 'ACTIVE' || lease.status === 'COMPLETED') && (
                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            setEditNoteModal({
                                              isOpen: true,
                                              noteIndex: index,
                                              note: note,
                                            });
                                          }}
                                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                        >
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={async () => {
                                            if (!confirm('Delete this note? This action cannot be undone.')) return;
                                            
                                            try {
                                              setSubmitting(true);
                                              await deleteLandlordNoteRequest(lease.id, index);
                                              await fetchLeaseData(true);
                                              toast.success('Note deleted successfully!');
                                            } catch (error: any) {
                                              console.error('Error deleting note:', error);
                                              toast.error(error?.response?.data?.error || 'Failed to delete note. Please try again.');
                                            } finally {
                                              setSubmitting(false);
                                            }
                                          }}
                                          disabled={submitting}
                                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  );
                })()}
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Lease Settings Modal */}
      <Dialog open={settingsModalOpen} onOpenChange={handleSettingsModalChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-700" />
              Lease Settings & Controls
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
              <Info className="w-4 h-4" />
              Manage what you can still do based on this lease status.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
              <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Badge className={`${themeColor} px-2 py-0.5 text-xs`}>{lease.status}</Badge>
                Lease editing rules
              </p>
              <p className="text-xs sm:text-sm text-slate-700">
                {leaseIsPending && 'This lease is still pending. You can edit rent amount, documents, tenants, and other details before activating it.'}
                {leaseIsActive && 'This lease is ACTIVE. Core terms can no longer be edited—only payment tracking actions remain. Terminate the lease if you need to close it early.'}
                {leaseIsClosed && !leaseIsPending && !leaseIsActive && 'This lease is already closed. No further changes or payment edits are allowed.'}
              </p>
              {canEditLease && (
                <Button
                  onClick={() => {
                    handleSettingsModalChange(false);
                    navigate(`/landlord/leases/${lease.id}/edit`);
                  }}
                  className="mt-2 w-full sm:w-auto"
                >
                  Edit Lease Details
                </Button>
              )}
            </div>

            {leaseCanCancel && (
              <div className="rounded-xl border border-orange-200 bg-orange-50/80 p-4 space-y-4">
                <div className="flex items-center gap-2 text-orange-800">
                  <AlertTriangle className="w-4 h-4" />
                  <p className="text-sm font-semibold">Cancel this pending lease</p>
                </div>
                <p className="text-xs sm:text-sm text-orange-800">
                  Use cancellation if the tenant is no longer moving forward before activation. The invitation will be voided and pending payments removed.
                </p>
                <p className="text-xs text-orange-700">
                  This cannot be undone. Type <span className="font-mono text-orange-900">{cancelPhrase}</span> to confirm.
                </p>
                <div className="space-y-1.5">
                  <Label className="text-xs text-orange-900">Confirmation</Label>
                  <Input
                    value={cancelConfirmation}
                    onChange={(e) => setCancelConfirmation(e.target.value.toUpperCase())}
                    placeholder={`Type "${cancelPhrase}" to confirm`}
                    className="bg-white/80 border-orange-200 focus-visible:ring-orange-300"
                  />
                  <p className="text-[11px] text-orange-700">
                    Enter the exact phrase to enable cancellation.
                  </p>
                </div>
              </div>
            )}

            {leaseCanComplete && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 space-y-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <CheckCircle className="w-4 h-4" />
                  <p className="text-sm font-semibold">Mark lease as completed</p>
                </div>
                <p className="text-xs sm:text-sm text-blue-800">
                  The lease end date has passed. Marking as completed will lock outstanding payments and prevent any further edits or payment updates.
                </p>
                <p className="text-xs text-blue-700">
                  This action cannot be undone. Type <span className="font-mono text-blue-900">{completePhrase}</span> to confirm.
                </p>
                <div className="space-y-1.5">
                  <Label className="text-xs text-blue-900">Confirmation</Label>
                  <Input
                    value={completeConfirmation}
                    onChange={(e) => setCompleteConfirmation(e.target.value.toUpperCase())}
                    placeholder={`Type "${completePhrase}" to confirm`}
                    className="bg-white/80 border-blue-200 focus-visible:ring-blue-300"
                  />
                  <p className="text-[11px] text-blue-700">
                    Enter the exact phrase to enable completion.
                  </p>
                </div>
              </div>
            )}

            {leaseCanTerminate && (
              <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 space-y-4">
                <div className="flex items-center gap-2 text-rose-800">
                  <AlertTriangle className="w-4 h-4" />
                  <p className="text-sm font-semibold">Terminate this lease</p>
                </div>
                <p className="text-xs sm:text-sm text-rose-800">
                  Terminating closes the lease mid-term, locks outstanding payments, and prevents any further edits or payment updates.
                </p>
                <p className="text-xs text-rose-700">
                  This action cannot be undone. Type <span className="font-mono text-rose-900">{terminatePhrase}</span> to confirm.
                </p>
                <div className="space-y-1.5">
                  <Label className="text-xs text-rose-900">Confirmation</Label>
                  <Input
                    value={terminateConfirmation}
                    onChange={(e) => setTerminateConfirmation(e.target.value.toUpperCase())}
                    placeholder={`Type "${terminatePhrase}" to confirm`}
                    className="bg-white/80 border-rose-200 focus-visible:ring-rose-300"
                  />
                  <p className="text-[11px] text-rose-700">
                    Enter the exact phrase to enable termination.
                  </p>
                </div>
              </div>
            )}

            {leaseIsClosed && !leaseCanCancel && !leaseCanTerminate && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-2">
                <p className="text-sm font-semibold text-slate-800">No actions available</p>
                <p className="text-xs text-slate-600">
                  This lease is {lease.status}. All management actions are disabled for completed, cancelled, or terminated leases.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => handleSettingsModalChange(false)}>
              Close
            </Button>
            {leaseCanCancel && (
              <Button
                variant="destructive"
                disabled={
                  cancelLoading ||
                  cancelConfirmation.trim() !== cancelPhrase
                }
                onClick={handleCancelLease}
              >
                {cancelLoading ? 'Cancelling...' : 'Cancel Lease'}
              </Button>
            )}
            {leaseCanComplete && (
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={
                  completeLoading ||
                  completeConfirmation.trim() !== completePhrase
                }
                onClick={handleCompleteLease}
              >
                {completeLoading ? 'Completing...' : 'Mark as Completed'}
              </Button>
            )}
            {leaseCanTerminate && (
              <Button
                variant="destructive"
                disabled={
                  terminateLoading ||
                  terminateConfirmation.trim() !== terminatePhrase
                }
                onClick={handleTerminateLease}
              >
                {terminateLoading ? 'Terminating...' : 'Terminate Lease'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark as Paid Modal */}
      <Dialog open={markAsPaidModal.isOpen} onOpenChange={(open) => setMarkAsPaidModal({ isOpen: open, payment: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Mark Payment as Paid
            </DialogTitle>
            <DialogDescription>
              Record payment details for {markAsPaidModal.payment && formatCurrency(markAsPaidModal.payment.amount)} due on {markAsPaidModal.payment && formatDate(markAsPaidModal.payment.dueDate)}. ({markAsPaidModal.payment?.type || 'RENT'})
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                Date Paid *
              </Label>
              <CustomDatePicker
                value={markAsPaidForm.paidAt}
                onChange={(newDate) => {
                  setMarkAsPaidForm(prev => {
                    // Recalculate timing status when date changes (unless manual override is active)
                    // Use form's type for calculation
                    const newTimingStatus = prev.manualTimingOverride 
                      ? prev.timingStatus 
                      : (calculateTimingStatus(markAsPaidModal.payment?.dueDate || '', newDate, prev.type) || 'ONTIME');
                    return { ...prev, paidAt: newDate, timingStatus: newTimingStatus };
                  });
                }}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="method">
                Payment Method *
              </Label>
              <Select 
                value={markAsPaidForm.method} 
                onValueChange={(value) => setMarkAsPaidForm({ ...markAsPaidForm, method: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="GCASH">GCash</SelectItem>
                  <SelectItem value="PAYPAL">PayPal</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">
                Payment Type *
              </Label>
              <Select 
                value={markAsPaidForm.type} 
                onValueChange={(value) => {
                  setMarkAsPaidForm(prev => {
                    // Recalculate timing status when type changes (unless manual override is active)
                    const newTimingStatus = prev.manualTimingOverride 
                      ? prev.timingStatus 
                      : (calculateTimingStatus(markAsPaidModal.payment?.dueDate || '', prev.paidAt, value) || 'ONTIME');
                    return { ...prev, type: value, timingStatus: newTimingStatus };
                  });
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  <SelectItem value="RENT">Rent</SelectItem>
                  <SelectItem value="PREPAYMENT">Prepayment</SelectItem>
                  <SelectItem value="ADVANCE_PAYMENT">Advance Payment</SelectItem>
                  <SelectItem value="PENALTY">Penalty</SelectItem>
                  <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount field for PREPAYMENT with amount 0 */}
            {markAsPaidForm.type === 'PREPAYMENT' && markAsPaidModal.payment?.amount === 0 && (
              <div className="space-y-2">
                <Label htmlFor="amount">
                  Amount * <span className="text-xs text-gray-500">(Set prorated amount for gap period)</span>
                </Label>
                <Input
                  id="amount"
                  type="number"
                  value={markAsPaidForm.amount || ''}
                  onChange={(e) => setMarkAsPaidForm({ ...markAsPaidForm, amount: Number(e.target.value) })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Enter the prorated amount for the period from lease start to first due date
                </p>
              </div>
            )}

            {/* Timing Status with Manual Override */}
            {markAsPaidModal.payment && markAsPaidForm.paidAt && (
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Timing Status</Label>
                  {!markAsPaidForm.manualTimingOverride && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-blue-600 hover:text-blue-700"
                      onClick={() => setMarkAsPaidForm(prev => ({ ...prev, manualTimingOverride: true }))}
                    >
                      Modify
                    </Button>
                  )}
                </div>
                {markAsPaidForm.manualTimingOverride ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Select
                        value={markAsPaidForm.timingStatus}
                        onValueChange={(value) => setMarkAsPaidForm(prev => ({ ...prev, timingStatus: value }))}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-[100]">
                          <SelectItem value="ONTIME">On Time</SelectItem>
                          <SelectItem value="LATE">Late</SelectItem>
                          <SelectItem value="ADVANCE">Advance</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 text-xs"
                        onClick={() => {
                          const autoStatus = calculateTimingStatus(
                            markAsPaidModal.payment?.dueDate || '',
                            markAsPaidForm.paidAt,
                            markAsPaidForm.type
                          ) || 'ONTIME';
                          setMarkAsPaidForm(prev => ({ 
                            ...prev, 
                            manualTimingOverride: false,
                            timingStatus: autoStatus
                          }));
                        }}
                      >
                        Auto
                      </Button>
                    </div>
                    <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-800">
                        Manual override active. This will change the payment timing status calculation and may affect tenant records.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {(() => {
                      const calculatedStatus = calculateTimingStatus(markAsPaidModal.payment.dueDate, markAsPaidForm.paidAt, markAsPaidForm.type);
                      return (
                        <>
                          <Badge variant={getTimingStatusVariant(calculatedStatus)}>
                            {calculatedStatus || 'Not calculated'}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {markAsPaidForm.type === 'PREPAYMENT' || markAsPaidForm.type === 'ADVANCE_PAYMENT'
                              ? 'Prepayments and advance payments default to ADVANCE status'
                              : 'Based on due date and paid date comparison'}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Note Field */}
            <div className="space-y-2 pt-2 border-t">
              <Label htmlFor="mark-paid-note">Note (Optional)</Label>
              <Textarea
                id="mark-paid-note"
                value={markAsPaidForm.note || ''}
                onChange={(e) => setMarkAsPaidForm({ ...markAsPaidForm, note: e.target.value })}
                placeholder="Add a note for this payment (e.g., reference number, special circumstances...)"
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Useful for recording reference numbers or special circumstances
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setMarkAsPaidModal({ isOpen: false, payment: null })}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleMarkAsPaidSubmit}
              disabled={
                !markAsPaidForm.method || 
                !markAsPaidForm.type ||
                submitting ||
                (markAsPaidForm.type === 'PREPAYMENT' && 
                 markAsPaidModal.payment?.amount === 0 && 
                 (!markAsPaidForm.amount || markAsPaidForm.amount <= 0))
              }
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? 'Processing...' : 'Mark as Paid'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Modal */}
      <Dialog open={recordPaymentModal} onOpenChange={setRecordPaymentModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-green-600" />
              Record New Payment
            </DialogTitle>
            <DialogDescription>
              Create a new payment record for this lease agreement.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={recordPaymentForm.amount}
                  onChange={(e) => setRecordPaymentForm({ ...recordPaymentForm, amount: Number(e.target.value) })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select 
                  value={recordPaymentForm.status} 
                  onValueChange={(value: 'PENDING' | 'PAID') => setRecordPaymentForm({ ...recordPaymentForm, status: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <CustomDatePicker
                  value={recordPaymentForm.dueDate}
                  onChange={(newDate) => {
                    setRecordPaymentForm(prev => {
                      // Recalculate timing status when date changes (unless manual override is active)
                      const newTimingStatus = prev.manualTimingOverride 
                        ? prev.timingStatus 
                        : (prev.status === 'PAID' && prev.paidAt
                          ? (calculateTimingStatus(newDate, prev.paidAt, prev.type) || 'ONTIME')
                          : prev.timingStatus);
                      return { ...prev, dueDate: newDate, timingStatus: newTimingStatus };
                    });
                  }}
                />
              </div>
              
              {recordPaymentForm.status === 'PAID' && (
                <div className="space-y-2">
                  <Label htmlFor="paidAt">Paid Date *</Label>
                  <CustomDatePicker
                    value={recordPaymentForm.paidAt}
                    onChange={(newDate) => {
                      setRecordPaymentForm(prev => {
                        // Recalculate timing status when date changes (unless manual override is active)
                        const newTimingStatus = prev.manualTimingOverride 
                          ? prev.timingStatus 
                          : (calculateTimingStatus(prev.dueDate, newDate, prev.type) || 'ONTIME');
                        return { ...prev, paidAt: newDate, timingStatus: newTimingStatus };
                      });
                    }}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {recordPaymentForm.status === 'PAID' && (
                <div className="space-y-2">
                  <Label htmlFor="method">Payment Method *</Label>
                  <Select 
                    value={recordPaymentForm.method} 
                    onValueChange={(value) => setRecordPaymentForm({ ...recordPaymentForm, method: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent className="z-[100]">
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="GCASH">GCash</SelectItem>
                      <SelectItem value="PAYPAL">PayPal</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                      <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                      <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className={`space-y-2 ${recordPaymentForm.status === 'PAID' ? '' : 'col-span-2'}`}>
                <Label htmlFor="type">Payment Type *</Label>
                <Select 
                  value={recordPaymentForm.type} 
                  onValueChange={(value) => {
                    setRecordPaymentForm(prev => {
                      // Recalculate timing status when type changes (unless manual override is active)
                      const newTimingStatus = prev.manualTimingOverride 
                        ? prev.timingStatus 
                        : (prev.status === 'PAID' && prev.paidAt
                          ? (calculateTimingStatus(prev.dueDate, prev.paidAt, value) || 'ONTIME')
                          : prev.timingStatus);
                      return { ...prev, type: value, timingStatus: newTimingStatus };
                    });
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    <SelectItem value="RENT">Rent</SelectItem>
                    <SelectItem value="PREPAYMENT">Prepayment</SelectItem>
                    <SelectItem value="ADVANCE_PAYMENT">Advance Payment</SelectItem>
                    <SelectItem value="PENALTY">Penalty</SelectItem>
                    <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Timing Status with Manual Override */}
            {recordPaymentForm.status === 'PAID' && recordPaymentForm.paidAt && (
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Timing Status</Label>
                  {!recordPaymentForm.manualTimingOverride && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-blue-600 hover:text-blue-700"
                      onClick={() => setRecordPaymentForm(prev => ({ ...prev, manualTimingOverride: true }))}
                    >
                      Modify
                    </Button>
                  )}
                </div>
                {recordPaymentForm.manualTimingOverride ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Select
                        value={recordPaymentForm.timingStatus}
                        onValueChange={(value) => setRecordPaymentForm(prev => ({ ...prev, timingStatus: value }))}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="z-[100]">
                          <SelectItem value="ONTIME">On Time</SelectItem>
                          <SelectItem value="LATE">Late</SelectItem>
                          <SelectItem value="ADVANCE">Advance</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9 text-xs"
                        onClick={() => {
                          const autoStatus = calculateTimingStatus(
                            recordPaymentForm.dueDate,
                            recordPaymentForm.paidAt,
                            recordPaymentForm.type
                          ) || 'ONTIME';
                          setRecordPaymentForm(prev => ({ 
                            ...prev, 
                            manualTimingOverride: false,
                            timingStatus: autoStatus
                          }));
                        }}
                      >
                        Auto
                      </Button>
                    </div>
                    <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-800">
                        Manual override active. This will change the payment timing status calculation and may affect tenant records.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <Badge variant={getTimingStatusVariant(calculateTimingStatus(recordPaymentForm.dueDate, recordPaymentForm.paidAt, recordPaymentForm.type))}>
                      {calculateTimingStatus(recordPaymentForm.dueDate, recordPaymentForm.paidAt, recordPaymentForm.type) || 'Not calculated'}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {recordPaymentForm.type === 'PREPAYMENT' || recordPaymentForm.type === 'ADVANCE_PAYMENT'
                        ? 'Prepayments and advance payments default to ADVANCE status'
                        : 'Based on due date and paid date comparison'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Note Field */}
            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Textarea
                id="note"
                value={recordPaymentForm.note}
                onChange={(e) => setRecordPaymentForm({ ...recordPaymentForm, note: e.target.value })}
                placeholder="Add a note for this payment (e.g., penalty reason, reference number, special circumstances...)"
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Useful for recording penalties, reference numbers, or special circumstances
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRecordPaymentModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRecordPaymentSubmit}
              disabled={
                !recordPaymentForm.type || 
                submitting ||
                (recordPaymentForm.status === 'PAID' && (!recordPaymentForm.method || !recordPaymentForm.paidAt))
              }
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? 'Creating...' : 'Create Payment Record'}
            </Button>
          </DialogFooter>
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

      {/* Edit Landlord Note Modal */}
      <Dialog open={editNoteModal.isOpen} onOpenChange={(open) => {
        if (!open) {
          setEditNoteModal({ isOpen: false, noteIndex: null, note: null });
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Edit Landlord Note
            </DialogTitle>
            <DialogDescription>
              Update your private observation about tenant behavior.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-note-category">Category *</Label>
              <Select 
                value={editNoteModal.note?.category || 'OTHER'} 
                onValueChange={(value) => {
                  if (editNoteModal.note) {
                    setEditNoteModal({
                      ...editNoteModal,
                      note: { ...editNoteModal.note, category: value as LandlordNote['category'] }
                    });
                  }
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  <SelectItem value="CLEANLINESS">Cleanliness</SelectItem>
                  <SelectItem value="NOISE">Noise</SelectItem>
                  <SelectItem value="BEHAVIOR">Behavior</SelectItem>
                  <SelectItem value="COMMUNICATION">Communication</SelectItem>
                  <SelectItem value="PROPERTY_DAMAGE">Property Damage</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-note-text">Note *</Label>
              <Textarea
                id="edit-note-text"
                value={editNoteModal.note?.note || ''}
                onChange={(e) => {
                  if (editNoteModal.note) {
                    setEditNoteModal({
                      ...editNoteModal,
                      note: { ...editNoteModal.note, note: e.target.value }
                    });
                  }
                }}
                placeholder="Enter your observation about the tenant's behavior..."
                rows={5}
                className="resize-none"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditNoteModal({ isOpen: false, noteIndex: null, note: null })}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                if (!editNoteModal.note?.note.trim() || !leaseId || editNoteModal.noteIndex === null) return;
                
                try {
                  setSubmitting(true);
                  await updateLandlordNoteRequest(leaseId, editNoteModal.noteIndex, {
                    note: editNoteModal.note.note,
                    category: editNoteModal.note.category,
                  });
                  
                  setEditNoteModal({ isOpen: false, noteIndex: null, note: null });
                  await fetchLeaseData(true);
                  toast.success('Note updated successfully!');
                } catch (error: any) {
                  console.error('Error updating note:', error);
                  toast.error(error?.response?.data?.error || 'Failed to update note. Please try again.');
                } finally {
                  setSubmitting(false);
                }
              }}
              disabled={!editNoteModal.note?.note.trim() || submitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? 'Updating...' : 'Update Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Payment Modal */}
      <Dialog open={editPaymentModal.isOpen} onOpenChange={(open) => setEditPaymentModal({ isOpen: open, payment: null })}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Edit Payment
            </DialogTitle>
            <DialogDescription>
              Update payment details for {editPaymentModal.payment && formatCurrency(editPaymentModal.payment.amount)} due on {editPaymentModal.payment && formatDate(editPaymentModal.payment.dueDate)}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Amount *</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={editPaymentForm.amount}
                  onChange={(e) => setEditPaymentForm({ ...editPaymentForm, amount: Number(e.target.value) })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-type">Payment Type *</Label>
                <Select 
                  value={editPaymentForm.type} 
                  onValueChange={(value) => setEditPaymentForm({ ...editPaymentForm, type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    <SelectItem value="RENT">Rent</SelectItem>
                    <SelectItem value="PREPAYMENT">Prepayment</SelectItem>
                    <SelectItem value="ADVANCE_PAYMENT">Advance Payment</SelectItem>
                    <SelectItem value="PENALTY">Penalty</SelectItem>
                    <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-dueDate">Due Date *</Label>
              <CustomDatePicker
                value={editPaymentForm.dueDate}
                onChange={(newDate) => setEditPaymentForm({ ...editPaymentForm, dueDate: newDate })}
              />
            </div>

            {/* Note Field */}
            <div className="space-y-2">
              <Label htmlFor="edit-note">Note (Optional)</Label>
              <Textarea
                id="edit-note"
                value={editPaymentForm.note}
                onChange={(e) => setEditPaymentForm({ ...editPaymentForm, note: e.target.value })}
                placeholder="Add a note for this payment (e.g., reference number, special circumstances...)"
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                Useful for recording reference numbers or special circumstances
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setEditPaymentModal({ isOpen: false, payment: null })}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditPaymentSubmit}
              disabled={
                !editPaymentForm.type || 
                !editPaymentForm.amount ||
                !editPaymentForm.dueDate ||
                submitting
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? 'Updating...' : 'Update Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Landlord Note Modal */}
      <Dialog open={addNoteModal} onOpenChange={setAddNoteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Add Landlord Note
            </DialogTitle>
            <DialogDescription>
              Record a private observation about tenant behavior. This note is only visible to you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="note-category">Category *</Label>
              <Select 
                value={newNote.category} 
                onValueChange={(value) => setNewNote({ ...newNote, category: value as LandlordNote['category'] })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  <SelectItem value="CLEANLINESS">Cleanliness</SelectItem>
                  <SelectItem value="NOISE">Noise</SelectItem>
                  <SelectItem value="BEHAVIOR">Behavior</SelectItem>
                  <SelectItem value="COMMUNICATION">Communication</SelectItem>
                  <SelectItem value="PROPERTY_DAMAGE">Property Damage</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="note-text">Note *</Label>
              <Textarea
                id="note-text"
                value={newNote.note}
                onChange={(e) => setNewNote({ ...newNote, note: e.target.value })}
                placeholder="Enter your observation about the tenant's behavior..."
                rows={5}
                className="resize-none"
                required
              />
              <p className="text-xs text-gray-500">
                This note will be timestamped and stored privately. The tenant cannot see this information.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setAddNoteModal(false);
                setNewNote({ note: '', category: 'OTHER' });
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                if (!newNote.note.trim() || !leaseId) return;
                
                try {
                  setSubmitting(true);
                  await addLandlordNoteRequest(leaseId, {
                    note: newNote.note,
                    category: newNote.category,
                  });
                  
                  setAddNoteModal(false);
                  setNewNote({ note: '', category: 'OTHER' });
                  await fetchLeaseData(true);
                  toast.success('Note added successfully!');
                } catch (error: any) {
                  console.error('Error adding note:', error);
                  toast.error(error?.response?.data?.error || 'Failed to add note. Please try again.');
                } finally {
                  setSubmitting(false);
                }
              }}
              disabled={!newNote.note.trim() || submitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitting ? 'Adding...' : 'Add Note'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default ViewSpecificLease;
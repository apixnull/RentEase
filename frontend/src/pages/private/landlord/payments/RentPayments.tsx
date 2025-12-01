import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertTriangle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  FileText,
  Filter,
  Loader2,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react';
import {
  getLandlordPaymentsRequest,
  markPaymentAsPaidRequest,
} from '@/api/landlord/paymentApi';

interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
}

interface PropertyInfo {
  id: string;
  title: string;
  street?: string;
  barangay?: string;
  zipCode?: string;
  type?: string;
  city?: { name: string | null } | null;
  municipality?: { name: string | null } | null;
}

interface UnitInfo {
  id: string;
  label: string;
}

interface LeaseInfo {
  id: string;
  leaseNickname: string | null;
  status: string;
  rentAmount: number;
  interval: string;
  dueDate: number;
  property: PropertyInfo | null;
  unit: UnitInfo | null;
  tenant: Tenant | null;
}

interface PaymentRecord {
  id: string;
  leaseId: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  method: string | null;
  status: 'PENDING' | 'PAID';
  timingStatus: 'ONTIME' | 'LATE' | 'ADVANCE' | null;
  type: string | null;
  reminderStage: number;
  note: string | null;
  lease: LeaseInfo | null;
}

interface PaymentsResponse {
  payments: PaymentRecord[];
  filters: {
    properties: Array<{ id: string; title: string }>;
    units: Array<{ id: string; label: string; propertyId: string | null }>;
    leases: Array<{ id: string; label: string; propertyId: string | null; tenantName?: string | null }>;
  };
  meta: {
    month: number | null;
    year: number | null;
    scope?: 'month' | 'year' | 'all';
    start?: string | null;
    end?: string | null;
  };
}

interface MarkPaidForm {
  paidAt: string;
  method: string;
  type: string;
  timingStatus: 'ONTIME' | 'LATE' | 'ADVANCE';
  manualTimingOverride: boolean;
  amount?: number;
  note?: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);
};

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
          setSelectedDay(day);
          handleDateChange(selectedYear, month, day);
        }}
      >
        <SelectTrigger className="h-10 flex-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="z-[120] max-h-64">
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
        <SelectContent className="z-[120] max-h-64">
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
          setSelectedDay(day);
          handleDateChange(year, selectedMonth, day);
        }}
      >
        <SelectTrigger className="h-10 w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="z-[120] max-h-60">
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

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(value);

const formatDisplayDate = (dateString: string | null) => {
  if (!dateString) return '—';
  return format(new Date(dateString), 'MMM dd, yyyy');
};

const calculateTimingStatus = (
  dueDate: string,
  paidAt: string | null,
  paymentType?: string | null
): 'ONTIME' | 'LATE' | 'ADVANCE' | null => {
  if (!paidAt) return null;
  if (paymentType === 'PREPAYMENT' || paymentType === 'ADVANCE_PAYMENT') return 'ADVANCE';

  const due = new Date(dueDate);
  const paid = new Date(paidAt);

  if (paid < due) return 'ADVANCE';
  if (paid > due) return 'LATE';
  return 'ONTIME';
};

const calculateStats = (records: PaymentRecord[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalDue = records.reduce((sum, payment) => sum + payment.amount, 0);
  const paidRecords = records.filter((payment) => payment.status === 'PAID');
  const collected = paidRecords.reduce((sum, payment) => sum + payment.amount, 0);
  const pendingRecords = records.filter((payment) => payment.status === 'PENDING');
  const outstanding = pendingRecords.reduce((sum, payment) => sum + payment.amount, 0);
  const overdueRecords = pendingRecords.filter(
    (payment) => new Date(payment.dueDate).setHours(0, 0, 0, 0) < today.getTime()
  );
  const overdue = overdueRecords.reduce((sum, payment) => sum + payment.amount, 0);

  return {
    totalDue,
    collected,
    outstanding,
    overdue,
    totalCount: records.length,
    paidCount: paidRecords.length,
    pendingCount: pendingRecords.length,
    overdueCount: overdueRecords.length,
  };
};

const TODAY = new Date();
const CURRENT_MONTH = TODAY.getMonth();
const CURRENT_YEAR = TODAY.getFullYear();
type FilterMode = 'SPECIFIC_MONTH' | 'THIS_YEAR' | 'ALL_TIME';

const RentPayments = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [activeMeta, setActiveMeta] = useState<PaymentsResponse['meta'] | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>('SPECIFIC_MONTH');
  const [selectedMonth, setSelectedMonth] = useState<number>(CURRENT_MONTH + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [markPaidModal, setMarkPaidModal] = useState<{ open: boolean; payment: PaymentRecord | null }>({
    open: false,
    payment: null,
  });
  const [markPaidForm, setMarkPaidForm] = useState<MarkPaidForm>({
    paidAt: format(new Date(), 'yyyy-MM-dd'),
    method: '',
    type: 'RENT',
    timingStatus: 'ONTIME',
    manualTimingOverride: false,
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(true);
  const [noteModal, setNoteModal] = useState<{ open: boolean; note: string | null }>({
    open: false,
    note: null,
  });


  const fetchPayments = async () => {
    try {
      setRefreshing(true);
      const isInitialLoad = payments.length === 0;
      if (isInitialLoad) {
        setLoading(true);
      }
      let requestParams: { month?: number; year: number; scope: 'month' | 'year' | 'all' };
      if (filterMode === 'THIS_YEAR') {
        requestParams = {
          year: CURRENT_YEAR,
          scope: 'year',
        };
      } else if (filterMode === 'ALL_TIME') {
        requestParams = {
          year: CURRENT_YEAR,
          scope: 'all',
        };
      } else {
        // SPECIFIC_MONTH
        requestParams = {
          year: selectedYear,
          month: selectedMonth,
          scope: 'month',
        };
      }
      const response = await getLandlordPaymentsRequest(requestParams);
      const data: PaymentsResponse = response.data;
      setPayments(data.payments || []);
      setActiveMeta(data.meta || null);
    } catch (error: any) {
      console.error('Failed to load payments:', error);
      toast.error(error?.response?.data?.error || 'Failed to load rent payments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterMode, selectedMonth, selectedYear]);


  // Get reminder stage display text
  const getReminderStageText = (stage: number) => {
    switch (stage) {
      case 0:
        return 'No reminder';
      case 1:
        return 'Pre-due sent';
      case 2:
        return 'Due-day sent';
      default:
        return 'Unknown';
    }
  };

  // Get payment status variant
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

  // Get timing status variant
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

  const selectorFilteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter;
      return matchesStatus;
    });
  }, [payments, statusFilter]);

  const filteredPayments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) return selectorFilteredPayments;

    return selectorFilteredPayments.filter((payment) => {
      const tenantName = payment.lease?.tenant
        ? `${payment.lease.tenant.firstName} ${payment.lease.tenant.lastName}`.toLowerCase()
        : '';
      const tenantEmail = payment.lease?.tenant?.email?.toLowerCase() || '';
      const propertyTitle = payment.lease?.property?.title.toLowerCase() || '';
      const unitLabel = payment.lease?.unit?.label.toLowerCase() || '';
      const leaseNickname = payment.lease?.leaseNickname?.toLowerCase() || '';
      const paymentType = payment.type?.toLowerCase() || '';
      const paymentMethod = payment.method?.toLowerCase() || '';
      const paymentNote = payment.note?.toLowerCase() || '';

      return (
        tenantName.includes(normalizedSearch) ||
        tenantEmail.includes(normalizedSearch) ||
        propertyTitle.includes(normalizedSearch) ||
        unitLabel.includes(normalizedSearch) ||
        leaseNickname.includes(normalizedSearch) ||
        paymentType.includes(normalizedSearch) ||
        paymentMethod.includes(normalizedSearch) ||
        paymentNote.includes(normalizedSearch)
      );
    });
  }, [selectorFilteredPayments, searchTerm]);

  const stats = useMemo(
    () => calculateStats(selectorFilteredPayments),
    [selectorFilteredPayments]
  );

  const collectionRate =
    stats.totalDue > 0 ? ((stats.collected / stats.totalDue) * 100).toFixed(1) : '0.0';

  const fallbackRangeLabel = () => {
    switch (filterMode) {
      case 'THIS_YEAR':
        return `${CURRENT_YEAR}`;
      case 'ALL_TIME':
        return 'All Time';
      default:
        const monthIndex = selectedMonth - 1;
        const safeIndex = Math.min(Math.max(monthIndex, 0), 11);
        return `${MONTHS[safeIndex]} ${selectedYear}`;
    }
  };

  const rangeLabel = useMemo(() => {
    if (!activeMeta) return fallbackRangeLabel();
    if (activeMeta.scope === 'all') {
      return 'All Time';
    }
    if (activeMeta.scope === 'year' || filterMode === 'THIS_YEAR') {
      return `${activeMeta.year}`;
    }
    const monthIndex = (activeMeta.month ?? selectedMonth) - 1;
    const safeIndex = Math.min(Math.max(monthIndex, 0), 11);
    return `${MONTHS[safeIndex]} ${activeMeta.year ?? selectedYear}`;
  }, [activeMeta, filterMode, selectedMonth, selectedYear]);

  const openMarkPaidModal = (payment: PaymentRecord) => {
    const defaultDate = format(new Date(), 'yyyy-MM-dd');
    const defaultTiming =
      calculateTimingStatus(payment.dueDate, defaultDate, payment.type || 'RENT') || 'ONTIME';

    setMarkPaidForm({
      paidAt: defaultDate,
      method: '',
      type: payment.type || 'RENT',
      timingStatus: defaultTiming,
      manualTimingOverride: false,
      note: '',
      amount:
        payment.type === 'PREPAYMENT' && payment.amount === 0 ? undefined : payment.amount,
    });
    setMarkPaidModal({ open: true, payment });
  };

  const closeMarkPaidModal = () => {
    setMarkPaidForm({
      paidAt: format(new Date(), 'yyyy-MM-dd'),
      method: '',
      type: 'RENT',
      timingStatus: 'ONTIME',
      manualTimingOverride: false,
      note: '',
      amount: undefined,
    });
    setMarkPaidModal({ open: false, payment: null });
  };

  const handleMarkPaidSubmit = async () => {
    if (!markPaidModal.payment) return;
    if (!markPaidForm.method) {
      toast.error('Please select a payment method');
      return;
    }
    if (!markPaidForm.type) {
      toast.error('Please select a payment type');
      return;
    }

    const timingStatus = markPaidForm.manualTimingOverride
      ? markPaidForm.timingStatus
      : calculateTimingStatus(
          markPaidModal.payment.dueDate,
          markPaidForm.paidAt,
          markPaidForm.type
        ) || 'ONTIME';

    try {
      setSubmitting(true);
      await markPaymentAsPaidRequest(markPaidModal.payment.id, {
        paidAt: markPaidForm.paidAt,
        method: markPaidForm.method,
        type: markPaidForm.type,
        timingStatus,
        amount:
          markPaidForm.type === 'PREPAYMENT' &&
          markPaidModal.payment.amount === 0 &&
          markPaidForm.amount !== undefined
            ? markPaidForm.amount
            : undefined,
        note: markPaidForm.note?.trim() || undefined,
      });
      toast.success('Payment marked as paid');
      closeMarkPaidModal();
      fetchPayments();
    } catch (error: any) {
      console.error('Failed to mark payment as paid:', error);
      toast.error(error?.response?.data?.error || 'Failed to mark payment as paid');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-sky-200/80 via-cyan-200/75 to-emerald-200/70 opacity-95" />
        <div className="relative m-[1px] rounded-[16px] bg-white/85 backdrop-blur-lg border border-white/60 shadow-lg">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-12 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-sky-300/50 to-cyan-400/40 blur-3xl"
            initial={{ opacity: 0.4, scale: 0.85 }}
            animate={{ opacity: 0.7, scale: 1.05 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-tl from-emerald-200/40 to-cyan-200/35 blur-3xl"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 3.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          />

          <div className="px-4 sm:px-6 py-5 space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: [0, -3, 3, 0] }}
                  className="relative flex-shrink-0"
                >
                  <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-sky-600 via-cyan-600 to-emerald-600 text-white grid place-items-center shadow-xl shadow-cyan-500/30">
                    <CreditCard className="h-5 w-5 relative z-10" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                  </div>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 220 }}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white text-sky-600 border border-sky-100 shadow-sm grid place-items-center"
                  >
                    <ShieldCheck className="h-3 w-3" />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-cyan-400/30"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 truncate">
                      Rent Payments
                    </h1>
                    <motion.div
                      animate={{ rotate: [0, 8, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      <Sparkles className="h-4 w-4 text-cyan-500" />
                    </motion.div>
                  </div>
                  <p className="text-sm text-slate-600 leading-6 flex items-center gap-1.5">
                    <Wallet className="h-4 w-4 text-emerald-500" />
                    Monitor receivables, automate reminders, and close balances faster.
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
                <div className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 shadow-sm">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Period
                  </span>
                  <Select value={filterMode} onValueChange={(value) => setFilterMode(value as FilterMode)}>
                    <SelectTrigger className="h-8 border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent className="z-[130] max-h-60">
                      <SelectItem value="SPECIFIC_MONTH">Specific Month</SelectItem>
                      <SelectItem value="THIS_YEAR">This Year</SelectItem>
                      <SelectItem value="ALL_TIME">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {filterMode === 'SPECIFIC_MONTH' && (
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 shadow-sm">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Month
                    </span>
                    <Select 
                      value={selectedMonth.toString()} 
                      onValueChange={(value) => setSelectedMonth(parseInt(value))}
                    >
                      <SelectTrigger className="h-8 border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[130] max-h-60">
                        {MONTHS.map((month, index) => (
                          <SelectItem key={month} value={(index + 1).toString()}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select 
                      value={selectedYear.toString()} 
                      onValueChange={(value) => setSelectedYear(parseInt(value))}
                    >
                      <SelectTrigger className="h-8 border-0 bg-transparent p-0 text-sm font-semibold text-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[130] max-h-60">
                        {getYears().map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button
                  onClick={fetchPayments}
                  disabled={refreshing}
                  className="h-11 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 px-5 text-sm font-semibold text-white shadow-md shadow-cyan-500/30 hover:brightness-110 disabled:opacity-70"
                >
                  {refreshing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Refreshing
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <RefreshCcw className="h-4 w-4" />
                      Refresh
                    </span>
                  )}
                </Button>
              </div>
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
              style={{ originX: 0 }}
              className="relative h-1 w-full rounded-full overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400/80 via-cyan-400/80 to-emerald-400/80" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <CardTitle className="text-base">Filters & Statistics</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFiltersExpanded(!filtersExpanded)}
              className="h-8"
            >
              {filtersExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Expand
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {filtersExpanded && (
          <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'ALL' | 'PAID' | 'PENDING')}>
                <SelectTrigger className="w-[160px] text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search tenant, property, unit, lease, payment type, method, or note"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Filter className="h-3.5 w-3.5" />
              Showing {filteredPayments.length} payment
              {filteredPayments.length === 1 ? '' : 's'} for {rangeLabel}
            </div>

            <div className="grid gap-4 pt-2 border-t md:grid-cols-2 xl:grid-cols-4">
              <Card className="shadow-sm border border-slate-200">
                <CardHeader className="pb-2">
                  <CardDescription>Total Due</CardDescription>
                  <CardTitle className="text-2xl text-slate-900">{formatCurrency(stats.totalDue)}</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-500">
                  Sum of all payments scheduled in {rangeLabel}.
                </CardContent>
              </Card>

              <Card className="shadow-sm border border-slate-200">
                <CardHeader className="pb-2">
                  <CardDescription>Collected</CardDescription>
                  <CardTitle className="text-2xl text-emerald-600">{formatCurrency(stats.collected)}</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-500">{collectionRate}% collection rate</CardContent>
              </Card>

              <Card className="shadow-sm border border-slate-200">
                <CardHeader className="pb-2">
                  <CardDescription>Outstanding</CardDescription>
                  <CardTitle className="text-2xl text-amber-600">{formatCurrency(stats.outstanding)}</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-500">
                  {stats.pendingCount} payment{stats.pendingCount === 1 ? '' : 's'} awaiting confirmation
                </CardContent>
              </Card>

              <Card className="shadow-sm border border-slate-200">
                <CardHeader className="pb-2">
                  <CardDescription>Overdue</CardDescription>
                  <CardTitle className="text-2xl text-red-600">{formatCurrency(stats.overdue)}</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-500">
                  {stats.overdueCount} payment{stats.overdueCount === 1 ? '' : 's'} overdue
                </CardContent>
              </Card>
            </div>
          </CardContent>
        )}
      </Card>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      ) : (
        <>
          {filteredPayments.length === 0 ? (
            <Card className="border border-dashed border-slate-200 bg-slate-50">
              <CardContent className="py-16 text-center space-y-2">
                <CreditCard className="h-10 w-10 text-slate-400 mx-auto" />
                <p className="text-sm text-slate-600">No payments match the current filters.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-sm border border-slate-200">
              <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg">Payment Schedule</CardTitle>
                  <CardDescription>Includes all tenant payments due in {rangeLabel}.</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  {filteredPayments.length} record{filteredPayments.length !== 1 && 's'}
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-semibold">Tenant</TableHead>
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
                    {filteredPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center text-gray-500 py-12">
                          <div className="flex flex-col items-center gap-3">
                            <CreditCard className="w-16 h-16 text-gray-300" />
                            <p className="text-lg font-medium text-gray-600">No payments match the current filters</p>
                            <p className="text-gray-500">Try adjusting your filters or select a different month</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments.map((payment) => {
                        const dueDate = new Date(payment.dueDate);
                        dueDate.setHours(0, 0, 0, 0);
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        
                        const isOverdue =
                          payment.status === 'PENDING' &&
                          daysUntilDue < 0;
                        const isDueSoon =
                          payment.status === 'PENDING' &&
                          daysUntilDue >= 0 &&
                          daysUntilDue <= 7;
                        
                        const tenantName = payment.lease?.tenant
                          ? `${payment.lease.tenant.firstName} ${payment.lease.tenant.lastName}`
                          : 'N/A';
                        
                        // Determine row background color
                        let rowClassName = '';
                        if (payment.status === 'PAID') {
                          rowClassName = 'bg-green-50/60 hover:bg-green-50 border-l-4 border-green-500'; // Green for paid
                        } else if (isOverdue) {
                          rowClassName = 'bg-red-50/60 hover:bg-red-50 border-l-4 border-red-500'; // Red for overdue
                        } else if (isDueSoon) {
                          rowClassName = 'bg-yellow-50/60 hover:bg-yellow-50 border-l-4 border-yellow-500'; // Yellow for due soon
                        }
                        
                        return (
                          <TableRow key={payment.id} className={rowClassName}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={payment.lease?.tenant?.avatarUrl || undefined} />
                                  <AvatarFallback className="text-xs">
                                    {tenantName
                                      .split(' ')
                                      .map((n) => n[0])
                                      .join('') || 'TN'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-medium text-gray-900">{tenantName}</span>
                                  <span className="text-xs text-gray-500">
                                    {payment.lease?.leaseNickname ||
                                      (payment.lease?.id ? `Lease ${payment.lease.id.slice(0, 6)}` : 'N/A')}
                                  </span>
                              {payment.lease?.tenant?.email && (
                                <span className="text-xs text-slate-500">{payment.lease.tenant.email}</span>
                              )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold text-green-600">
                              {formatCurrency(payment.amount)}
                            </TableCell>
                            <TableCell className="min-w-[140px]">
                              <div className="flex flex-col gap-0.5">
                                <span className="font-medium text-gray-900">{formatDisplayDate(payment.dueDate)}</span>
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
                                  <span className="font-medium text-gray-900">{formatDisplayDate(payment.paidAt)}</span>
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
                                {getReminderStageText(payment.reminderStage)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {payment.note && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => {
                                      setNoteModal({ open: true, note: payment.note });
                                    }}
                                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                  >
                                    <FileText className="w-4 h-4 mr-1" />
                                    Note
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                                  onClick={() => {
                                    if (payment.leaseId) {
                                      try {
                                        sessionStorage.setItem(`lease-${payment.leaseId}-activeTab`, 'payments');
                                      } catch {
                                        // ignore sessionStorage errors
                                      }
                                      navigate(`/landlord/leases/${payment.leaseId}/details`);
                                    }
                                  }}
                                >
                                  <FileText className="w-4 h-4 mr-1" />
                                  See Lease
                                </Button>
                                {payment.status === 'PENDING' ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-green-200 text-green-700 hover:bg-green-50"
                                    onClick={() => openMarkPaidModal(payment)}
                                  >
                                    Mark as Paid
                                  </Button>
                                ) : (
                                  <Button size="sm" variant="secondary" disabled>
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Paid
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <Dialog
        open={markPaidModal.open}
        onOpenChange={(open) => {
          if (!open) closeMarkPaidModal();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Mark Payment as Paid
            </DialogTitle>
            <DialogDescription>
              {markPaidModal.payment && (
                <>
                  Record payment details for {formatCurrency(markPaidModal.payment.amount)} due on{' '}
                  {formatDisplayDate(markPaidModal.payment.dueDate)}. ({markPaidModal.payment.type || 'RENT'})
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label>Date Paid *</Label>
              <CustomDatePicker
                value={markPaidForm.paidAt}
                onChange={(newDate) =>
                  setMarkPaidForm((prev) => ({
                    ...prev,
                    paidAt: newDate,
                    timingStatus: prev.manualTimingOverride
                      ? prev.timingStatus
                      : (calculateTimingStatus(
                          markPaidModal.payment?.dueDate || '',
                          newDate,
                          prev.type
                        ) || 'ONTIME'),
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Payment Method *</Label>
              <Select
                value={markPaidForm.method}
                onValueChange={(value) => setMarkPaidForm((prev) => ({ ...prev, method: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent className="z-[130]">
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="GCASH">GCash</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="PAYPAL">PayPal</SelectItem>
                  <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Payment Type *</Label>
              <Select
                value={markPaidForm.type}
                onValueChange={(value) => {
                  setMarkPaidForm((prev) => ({
                    ...prev,
                    type: value,
                    timingStatus: prev.manualTimingOverride
                      ? prev.timingStatus
                      : (calculateTimingStatus(
                          markPaidModal.payment?.dueDate || '',
                          prev.paidAt,
                          value
                        ) || 'ONTIME'),
                  }));
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent className="z-[130]">
                  <SelectItem value="RENT">Rent</SelectItem>
                  <SelectItem value="PREPAYMENT">Prepayment</SelectItem>
                  <SelectItem value="ADVANCE_PAYMENT">Advance Payment</SelectItem>
                  <SelectItem value="PENALTY">Penalty</SelectItem>
                  <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {markPaidForm.type === 'PREPAYMENT' &&
              markPaidModal.payment?.amount === 0 && (
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Amount * <span className="text-xs text-slate-500">(prorated amount)</span>
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={markPaidForm.amount ?? ''}
                    onChange={(e) =>
                      setMarkPaidForm((prev) => ({ ...prev, amount: Number(e.target.value) }))
                    }
                    placeholder="0.00"
                  />
                </div>
              )}

            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label>Timing Status</Label>
                {!markPaidForm.manualTimingOverride && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-blue-600 hover:text-blue-700"
                    onClick={() => setMarkPaidForm((prev) => ({ ...prev, manualTimingOverride: true }))}
                  >
                    Modify
                  </Button>
                )}
              </div>
              {markPaidForm.manualTimingOverride ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Select
                      value={markPaidForm.timingStatus}
                      onValueChange={(value) =>
                        setMarkPaidForm((prev) => ({
                          ...prev,
                          timingStatus: value as MarkPaidForm['timingStatus'],
                        }))
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[130]">
                        <SelectItem value="ONTIME">On Time</SelectItem>
                        <SelectItem value="LATE">Late</SelectItem>
                        <SelectItem value="ADVANCE">Advance</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 text-xs"
                      onClick={() =>
                        setMarkPaidForm((prev) => ({
                          ...prev,
                          manualTimingOverride: false,
                          timingStatus:
                            calculateTimingStatus(
                              markPaidModal.payment?.dueDate || '',
                              prev.paidAt,
                              prev.type
                            ) || 'ONTIME',
                        }))
                      }
                    >
                      Auto
                    </Button>
                  </div>
                  <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-500" />
                    Manual override active. Timing status will no longer be auto-calculated.
                  </div>
                </div>
              ) : (
                <div>
                  <Badge variant={getTimingStatusVariant(
                    calculateTimingStatus(
                      markPaidModal.payment?.dueDate || '',
                      markPaidForm.paidAt,
                      markPaidForm.type
                    )
                  )}>
                    {calculateTimingStatus(
                      markPaidModal.payment?.dueDate || '',
                      markPaidForm.paidAt,
                      markPaidForm.type
                    ) || 'Not calculated'}
                  </Badge>
                  <p className="text-xs text-slate-500 mt-1">
                    {markPaidForm.type === 'PREPAYMENT' || markPaidForm.type === 'ADVANCE_PAYMENT'
                      ? 'Prepayments and advance payments default to ADVANCE status'
                      : 'Based on due date vs paid date, unless overridden.'}
                  </p>
                </div>
              )}
            </div>

            {/* Note Field */}
            <div className="space-y-2 pt-2 border-t">
              <Label htmlFor="mark-paid-note">Note (Optional)</Label>
              <Textarea
                id="mark-paid-note"
                value={markPaidForm.note || ''}
                onChange={(e) => setMarkPaidForm({ ...markPaidForm, note: e.target.value })}
                placeholder="Add a note for this payment (e.g., reference number, special circumstances...)"
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-slate-500">
                Useful for recording reference numbers or special circumstances
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeMarkPaidModal} disabled={submitting}>
              Cancel
            </Button>
            <Button
              onClick={handleMarkPaidSubmit}
              disabled={
                submitting ||
                !markPaidForm.method ||
                !markPaidForm.type ||
                (markPaidForm.type === 'PREPAYMENT' &&
                  markPaidModal.payment?.amount === 0 &&
                  (!markPaidForm.amount || markPaidForm.amount <= 0))
              }
            >
              {submitting ? 'Saving...' : 'Mark as Paid'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Note Modal */}
      <Dialog open={noteModal.open} onOpenChange={(open) => setNoteModal({ open, note: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Payment Note
            </DialogTitle>
            <DialogDescription>
              Additional information about this payment
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">
                {noteModal.note || 'No note available'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteModal({ open: false, note: null })}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RentPayments;


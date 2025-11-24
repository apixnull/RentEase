import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, X, Clock, CheckCircle, AlertTriangle, Ban, Calendar, Eye, Users, Plus, ScrollText, Sparkles, ShieldCheck, Search, Loader2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { getAllLeasesRequest } from '@/api/landlord/leaseApi';
import { getPropertiesWithUnitsRequest } from '@/api/landlord/financialApi';
import { Skeleton } from "@/components/ui/skeleton";

// Interfaces based on API response
interface Property {
  id: string;
  title: string;
}

interface Unit {
  id: string;
  label: string;
}

interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  email: string;
}

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
  dueDate: number;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'CANCELLED';
  leaseDocumentUrl: string | null;
  createdAt: string;
  updatedAt: string;
  property: Property;
  unit: Unit;
  tenant: Tenant;
}

interface ApiLeasesResponse {
  leases: Lease[];
}

interface PropertyWithUnits {
  id: string;
  title: string;
  Unit?: Array<{
    id: string;
    label: string;
  }>;
}

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

const LeasesLoadingSkeleton = () => (
  <div className="min-h-screen p-6 space-y-5">
    <Skeleton className="h-20 w-full rounded-2xl" />
    <Card className="p-5 space-y-4">
      <Skeleton className="h-4 w-32" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(2)].map((_, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        ))}
      </div>
    </Card>
    <Card className="p-4 space-y-3">
      <Skeleton className="h-9 w-full" />
      <div className="flex gap-3">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-24" />
      </div>
    </Card>
    <Card className="p-4 space-y-3">
      <Skeleton className="h-4 w-28" />
      {[...Array(4)].map((_, idx) => (
        <div key={idx} className="grid grid-cols-4 gap-3">
          <Skeleton className="h-9 col-span-2" />
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
        </div>
      ))}
    </Card>
  </div>
);

const Leases = () => {
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [selectedLeaseType, setSelectedLeaseType] = useState('all');
  const [leaseSearch, setLeaseSearch] = useState('');
  const [showExpiringSoon, setShowExpiringSoon] = useState(false);
  const [activeTab, setActiveTab] = useState('current');
  const [leases, setLeases] = useState<Lease[]>([]);
  const [propertiesWithUnits, setPropertiesWithUnits] = useState<PropertyWithUnits[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchLeasesData = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setRefreshing(true);
      const [leasesResponse, propertiesResponse] = await Promise.all([
        getAllLeasesRequest(),
        getPropertiesWithUnitsRequest(),
      ]);

      const leasesData: ApiLeasesResponse = leasesResponse.data;
      setLeases(leasesData.leases || []);

      const propertiesData = propertiesResponse.data?.properties ?? propertiesResponse.data ?? [];
      setPropertiesWithUnits(Array.isArray(propertiesData) ? propertiesData : []);
    } catch (error: any) {
      console.error('Failed to fetch leases:', error);
      toast.error(error?.response?.data?.error || 'Failed to load leases. Please try again.');
    } finally {
      if (!silent) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  }, []);

  // Fetch leases on component mount
  useEffect(() => {
    fetchLeasesData();
  }, [fetchLeasesData]);

  // Calculate stats for current leases
  const currentLeases = leases.filter(lease => 
    lease.status === 'ACTIVE' || lease.status === 'PENDING'
  ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  // Past leases: COMPLETED, TERMINATED, CANCELLED, or leases created more than 1 week ago with terminated/cancelled status
  const pastLeases = leases.filter(lease => {
    const isPastStatus = lease.status === 'COMPLETED' || lease.status === 'TERMINATED' || lease.status === 'CANCELLED';
    const isOldTerminatedOrCancelled = (lease.status === 'TERMINATED' || lease.status === 'CANCELLED') && 
      (new Date().getTime() - new Date(lease.createdAt).getTime()) > 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
    
    return isPastStatus || isOldTerminatedOrCancelled;
  }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const isLeaseExpiringSoon = (lease: Lease) => {
    if (!lease.endDate) return false;
    const end = new Date(lease.endDate).getTime();
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    return end >= now && end - now <= thirtyDays;
  };

  // Stats for current tab
  const currentPendingCount = currentLeases.filter(lease => lease.status === 'PENDING').length;
  const currentActiveCount = currentLeases.filter(lease => lease.status === 'ACTIVE').length;

  // Stats for past tab
  const pastCompletedCount = pastLeases.filter(lease => lease.status === 'COMPLETED').length;
  const pastTerminatedCount = pastLeases.filter(lease => lease.status === 'TERMINATED').length;
  const pastCancelledCount = pastLeases.filter(lease => lease.status === 'CANCELLED').length;

  const expiringSoonCount = currentLeases.filter(isLeaseExpiringSoon).length;

  const currentStats = [
    {
      label: 'Pending Approval',
      value: currentPendingCount,
      icon: Clock,
      status: 'PENDING' as const,
    },
    {
      label: 'Active Leases',
      value: currentActiveCount,
      icon: CheckCircle,
      status: 'ACTIVE' as const,
    },
  ];

  const pastStats = [
    {
      label: 'Completed',
      value: pastCompletedCount,
      icon: Calendar,
      status: 'COMPLETED' as const,
    },
    {
      label: 'Terminated',
      value: pastTerminatedCount,
      icon: AlertTriangle,
      status: 'TERMINATED' as const,
    },
    {
      label: 'Cancelled',
      value: pastCancelledCount,
      icon: Ban,
      status: 'CANCELLED' as const,
    },
  ];

  // Get unique properties and units (prefer API data so filters include units without leases)
  const derivedPropertyOptions = Array.from(
    new Map(
      leases.map(lease => [
        lease.property.id,
        {
          id: lease.property.id,
          name: lease.property.title,
        },
      ])
    ).values()
  );

  const propertyOptions = propertiesWithUnits.length
    ? propertiesWithUnits.map(property => ({
        id: property.id,
        name: property.title,
      }))
    : derivedPropertyOptions;

  const unitsByProperty = useMemo(() => {
    const map = new Map<string, Array<{ id: string; label: string }>>();

    if (propertiesWithUnits.length) {
      propertiesWithUnits.forEach(property => {
        const normalizedUnits =
          property.Unit?.map(unit => ({
            id: unit.id,
            label: unit.label,
          })) ?? [];
        map.set(property.id, normalizedUnits);
      });
      return map;
    }

    leases.forEach(lease => {
      const existing = map.get(lease.property.id) || [];
      const alreadyIncluded = existing.some(unit => unit.id === lease.unit.id);
      if (!alreadyIncluded) {
        map.set(lease.property.id, [...existing, { id: lease.unit.id, label: lease.unit.label }]);
      }
    });

    return map;
  }, [leases, propertiesWithUnits]);

  const currentPropertyUnits =
    selectedProperty === 'all' ? null : unitsByProperty.get(selectedProperty) ?? [];

  const isUnitFilterDisabled =
    selectedProperty === 'all' || (currentPropertyUnits ? currentPropertyUnits.length === 0 : true);

  const filterLeases = (leasesToFilter: Lease[], query: string = leaseSearch) => {
    const normalizedQuery = query.trim().toLowerCase();

    return leasesToFilter.filter(lease => {
      const propertyMatch = selectedProperty === 'all' || lease.propertyId === selectedProperty;
      const unitMatch = selectedUnit === 'all' || lease.unitId === selectedUnit;
      const leaseTypeMatch = selectedLeaseType === 'all' || lease.leaseType === selectedLeaseType;
      const expiringMatch = !showExpiringSoon || isLeaseExpiringSoon(lease);

      if (!(propertyMatch && unitMatch && leaseTypeMatch && expiringMatch)) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystack = [
        lease.leaseNickname,
        lease.property.title,
        lease.unit.label,
        lease.tenant.firstName,
        lease.tenant.lastName,
        lease.tenant.email,
        lease.leaseType,
        lease.status,
        lease.startDate,
        lease.endDate ?? '',
        `${lease.rentAmount}`,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      
      return haystack.includes(normalizedQuery);
    });
  };

  const filteredCurrentLeases = filterLeases(currentLeases, leaseSearch);
  const filteredPastLeases = filterLeases(pastLeases, leaseSearch);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'COMPLETED':
        return 'outline';
      case 'TERMINATED':
        return 'destructive';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    return (
      LEASE_STATUS_THEME[status as keyof typeof LEASE_STATUS_THEME]?.badge ??
      "bg-slate-100 border-slate-300 text-slate-700"
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="w-3 h-3" />;
      case 'ACTIVE':
        return <CheckCircle className="w-3 h-3" />;
      case 'COMPLETED':
        return <Calendar className="w-3 h-3" />;
      case 'TERMINATED':
        return <AlertTriangle className="w-3 h-3" />;
      case 'CANCELLED':
        return <Ban className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getLeaseTypeDisplay = (leaseType: string) => {
    switch (leaseType) {
      case 'SHORT_TERM':
        return 'Short Term';
      case 'LONG_TERM':
        return 'Long Term';
      case 'STANDARD':
        return 'Standard';
      case 'FIXED_TERM':
        return 'Fixed Term';
      default:
        return leaseType;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDueDateDisplay = (dueDate: number) => {
    if (dueDate === 1) return '1st';
    if (dueDate === 2) return '2nd';
    if (dueDate === 3) return '3rd';
    return `${dueDate}th`;
  };

  const getAvatarUrl = (tenant: Tenant) => {
    if (tenant.avatarUrl) {
      return tenant.avatarUrl;
    }
    // Generate a placeholder avatar with initials
    const initials = `${tenant.firstName.charAt(0)}${tenant.lastName.charAt(0)}`.toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=4f46e5&color=fff&size=64`;
  };

  const getTenantFullName = (tenant: Tenant) => {
    return `${tenant.firstName} ${tenant.lastName}`;
  };

  const handleCreateLease = () => {
    navigate('/landlord/leases/create');
  };

  const handleViewLeaseDetails = (leaseId: string) => {
    navigate(`/landlord/leases/${leaseId}/details`);
  };

  const handleRefresh = () => {
    if (!refreshing) {
      fetchLeasesData({ silent: true });
    }
  };

  if (loading) {
    return <LeasesLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-teal-200/80 via-cyan-200/70 to-emerald-200/70 opacity-95" />
        <div className="relative m-[1px] rounded-[16px] bg-white/85 backdrop-blur-lg border border-white/60 shadow-lg">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-12 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-teal-300/50 to-cyan-400/40 blur-3xl"
            initial={{ opacity: 0.4, scale: 0.85 }}
            animate={{ opacity: 0.7, scale: 1.05 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-tl from-emerald-200/40 to-cyan-200/35 blur-3xl"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 3.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          />

          <div className="px-4 sm:px-6 py-5 space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: [0, -3, 3, 0] }}
                  className="relative flex-shrink-0"
                >
                  <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-600 text-white grid place-items-center shadow-xl shadow-cyan-500/30">
                    <FileText className="h-5 w-5 relative z-10" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                  </div>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 220 }}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white text-teal-600 border border-teal-100 shadow-sm grid place-items-center"
                  >
                    <ScrollText className="h-3 w-3" />
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
                      Lease Operations Hub
                    </h1>
                    <motion.div
                      animate={{ rotate: [0, 8, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Sparkles className="h-4 w-4 text-emerald-500" />
                    </motion.div>
                  </div>
                  <p className="text-sm text-slate-600 leading-6 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-cyan-500" />
                    Keep agreements, renewals, and compliance synced across properties
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
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
                <Button
                  onClick={handleCreateLease}
                  className="h-11 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 px-5 text-sm font-semibold text-white shadow-md shadow-cyan-500/30 hover:brightness-110"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Create Lease
                </Button>
              </div>
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
              style={{ originX: 0 }}
              className="relative h-1 w-full rounded-full overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400/80 via-cyan-400/80 to-emerald-400/80" />
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
      <div className="space-y-6">
          {/* Leases Table with Tabs */}
          <Card className="shadow-sm border border-gray-200">
          <CardHeader className="pb-4 border-b border-gray-200 bg-white space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Lease Management
                <Badge variant="secondary" className="ml-2 bg-blue-50 text-blue-700 text-xs">
                  {leases.length} total
                </Badge>
              </CardTitle>
              <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={leaseSearch}
                  onChange={(e) => setLeaseSearch(e.target.value)}
                  placeholder="Search tenant, property, status..."
                  className="pl-9 h-9 text-sm bg-slate-50 border-gray-200"
                />
                {leaseSearch && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setLeaseSearch('')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-2 w-full">
              <div className="flex flex-wrap gap-2 items-center">
                <Select
                  value={selectedProperty}
                  onValueChange={(value) => {
                    setSelectedProperty(value);
                    setSelectedUnit('all');
                  }}
                >
                  <SelectTrigger className="w-[170px] h-9 text-sm border-gray-300">
                    <SelectValue placeholder="All Properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {propertyOptions.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedUnit} onValueChange={setSelectedUnit} disabled={isUnitFilterDisabled}>
                  <SelectTrigger
                    className="w-[160px] h-9 text-sm border-gray-300"
                    disabled={isUnitFilterDisabled}
                  >
                    <SelectValue placeholder="Select Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Units</SelectItem>
                    {currentPropertyUnits?.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        Unit {unit.label}
                      </SelectItem>
                    )) ??
                      null}
                  </SelectContent>
                </Select>

                <Select value={selectedLeaseType} onValueChange={setSelectedLeaseType}>
                  <SelectTrigger className="w-[130px] h-8 text-xs border-gray-300">
                    <SelectValue placeholder="Lease Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="STANDARD">Standard</SelectItem>
                    <SelectItem value="SHORT_TERM">Short Term</SelectItem>
                    <SelectItem value="LONG_TERM">Long Term</SelectItem>
                    <SelectItem value="FIXED_TERM">Fixed Term</SelectItem>
                  </SelectContent>
                </Select>

                <button
                  type="button"
                  onClick={() => setShowExpiringSoon((prev) => !prev)}
                  className={`flex items-center gap-1.5 h-8 px-3 rounded-full border text-xs font-medium transition ${
                    showExpiringSoon
                      ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                      : 'bg-white text-slate-600 border-gray-300 hover:border-cyan-400'
                  }`}
                >
                  <Calendar className={`h-3.5 w-3.5 ${showExpiringSoon ? 'text-white' : 'text-cyan-600'}`} />
                  <span>Expiring 30d</span>
                  <span className={`text-[10px] ${showExpiringSoon ? 'text-white/80' : 'text-slate-500'}`}>
                    {expiringSoonCount}
                  </span>
                </button>

                {(selectedProperty !== 'all' || selectedUnit !== 'all' || selectedLeaseType !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedProperty('all');
                      setSelectedUnit('all');
                      setSelectedLeaseType('all');
                      setShowExpiringSoon(false);
                    }}
                    className="h-8 px-2 text-xs border border-gray-300"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Creative Tabs with Color Scheme - Transparent Gradients */}
              <div className="border-b bg-gradient-to-br from-slate-50/80 via-gray-50/60 to-slate-50/80 backdrop-blur-sm">
                <TabsList className="w-full h-auto bg-transparent p-2 sm:p-3 gap-2 grid grid-cols-2">
                  <TabsTrigger 
                    value="current" 
                    className={`relative flex-1 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-medium transition-all overflow-hidden ${
                      activeTab === 'current' 
                        ? `bg-gradient-to-r from-emerald-500 to-teal-500/20 text-emerald-700 border border-emerald-200/50 shadow-sm backdrop-blur-sm` 
                        : `bg-gray-50/50 border border-gray-200 text-gray-600 hover:bg-gray-100/50`
                    }`}
                  >
                    {activeTab === 'current' && (
                      <div className={`absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500/10 opacity-50`} />
                    )}
                    <CheckCircle className={`w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 ${activeTab === 'current' ? 'text-emerald-700' : 'text-gray-500'}`} />
                    <span className="relative z-10 font-medium">Current</span>
                    <Badge className={`ml-1 text-xs px-1.5 py-0 relative z-10 ${
                      activeTab === 'current' 
                        ? `bg-emerald-100 text-emerald-800 border border-emerald-200/50` 
                        : `bg-gray-100 text-gray-700`
                    }`}>
                      {currentLeases.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="past" 
                    className={`relative flex-1 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-medium transition-all overflow-hidden ${
                      activeTab === 'past' 
                        ? `bg-gradient-to-r from-emerald-500 to-teal-500/20 text-emerald-700 border border-emerald-200/50 shadow-sm backdrop-blur-sm` 
                        : `bg-gray-50/50 border border-gray-200 text-gray-600 hover:bg-gray-100/50`
                    }`}
                  >
                    {activeTab === 'past' && (
                      <div className={`absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500/10 opacity-50`} />
                    )}
                    <Calendar className={`w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 ${activeTab === 'past' ? 'text-emerald-700' : 'text-gray-500'}`} />
                    <span className="relative z-10 font-medium">History</span>
                    <Badge className={`ml-1 text-xs px-1.5 py-0 relative z-10 ${
                      activeTab === 'past' 
                        ? `bg-emerald-100 text-emerald-800 border border-emerald-200/50` 
                        : `bg-gray-100 text-gray-700`
                    }`}>
                      {pastLeases.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Current Leases Tab */}
              <TabsContent value="current" className="m-0 p-3 sm:p-4 md:p-6 space-y-5">
                {/* Stats for Current Leases */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {currentStats.map((stat) => {
                    const theme = LEASE_STATUS_THEME[stat.status];
                    return (
                      <div
                        key={stat.label}
                        className={`rounded-xl ${theme.borderCard} ${theme.backgroundCard} p-3 flex items-center gap-3 shadow-[0_2px_12px_-6px_rgba(15,23,42,0.25)]`}
                      >
                        <div className={`h-10 w-10 rounded-lg grid place-items-center ${theme.iconBackground}`}>
                          <stat.icon className={`h-4 w-4 text-white`} />
                        </div>
                        <div>
                          <p className={`text-xs uppercase tracking-wide ${theme.textColorLight}`}>{stat.label}</p>
                          <p className={`text-lg font-semibold ${theme.textColorDark}`}>{stat.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Current Leases Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-100 border-b border-gray-200">
                        <TableHead className="font-semibold text-gray-700 py-3 text-xs uppercase">Lease Details</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3 text-xs uppercase">Tenant</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3 text-xs uppercase">Property & Unit</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3 text-xs uppercase">Rent</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3 text-xs uppercase">Duration</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3 text-xs uppercase">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3 text-xs uppercase w-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCurrentLeases.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-gray-500 py-12">
                            <div className="flex flex-col items-center gap-3">
                              <div className="p-3 bg-emerald-50 rounded-full">
                                <FileText className="w-8 h-8 text-emerald-300" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-500">No current leases found</p>
                                <p className="text-sm text-gray-400 mt-1">
                                  {leases.length === 0 
                                    ? "Get started by creating your first lease agreement"
                                    : "Try adjusting your filters to see more results"
                                  }
                                </p>
                              </div>
                              {leases.length === 0 && (
                                <Button 
                                  onClick={handleCreateLease}
                                  className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-xs"
                                  size="sm"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Create Your First Lease
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredCurrentLeases.map((lease) => (
                          <TableRow 
                            key={lease.id}
                            className="group hover:bg-emerald-50/30 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium text-gray-900 text-sm">
                                  {lease.leaseNickname || `${getTenantFullName(lease.tenant)} - ${lease.property.title}`}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs bg-white border-emerald-200 text-emerald-700">
                                    {getLeaseTypeDisplay(lease.leaseType)}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    Due {getDueDateDisplay(lease.dueDate)}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <img 
                                  src={getAvatarUrl(lease.tenant)}
                                  alt={`${getTenantFullName(lease.tenant)}'s avatar`}
                                  className="w-8 h-8 rounded-full border border-white shadow-sm"
                                />
                                <div>
                                  <div className="font-medium text-gray-900 text-sm">{getTenantFullName(lease.tenant)}</div>
                                  <div className="text-xs text-gray-500 truncate max-w-[100px]">{lease.tenant.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {lease.property.title}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {lease.unit.label}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-bold text-gray-900">
                                  {formatCurrency(lease.rentAmount)}
                                </div>
                                <div className="text-xs text-gray-500">Monthly</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-gray-900">{formatDate(lease.startDate)}</div>
                                <div className="text-xs text-gray-500">
                                  {lease.endDate ? `Ends ${formatDate(lease.endDate)}` : 'Ongoing'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={getStatusVariant(lease.status)} 
                                className={`flex items-center gap-1 text-xs font-medium px-2 py-1 border ${getStatusColor(lease.status)}`}
                              >
                                {getStatusIcon(lease.status)}
                                {lease.status.charAt(0) + lease.status.slice(1).toLowerCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewLeaseDetails(lease.id)}
                                className="h-7 w-7 p-0 opacity-70 hover:opacity-100 hover:bg-emerald-100 hover:text-emerald-700 transition-all rounded"
                                title="View lease details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              {/* Past Leases Tab */}
              <TabsContent value="past" className="m-0 p-3 sm:p-4 md:p-6 space-y-5">
                {/* Stats for Past Leases */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {pastStats.map((stat) => {
                    const theme = LEASE_STATUS_THEME[stat.status];
                    return (
                      <div
                        key={stat.label}
                        className={`rounded-xl ${theme.borderCard} ${theme.backgroundCard} p-3 flex items-center gap-3 shadow-[0_2px_12px_-6px_rgba(15,23,42,0.25)]`}
                      >
                        <div className={`h-10 w-10 rounded-lg grid place-items-center ${theme.iconBackground}`}>
                          <stat.icon className={`h-4 w-4 text-white`} />
                        </div>
                        <div>
                          <p className={`text-xs uppercase tracking-wide ${theme.textColorLight}`}>{stat.label}</p>
                          <p className={`text-lg font-semibold ${theme.textColorDark}`}>{stat.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Past Leases Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-100 border-b border-gray-200">
                        <TableHead className="font-semibold text-gray-700 py-3 text-xs uppercase">Lease Details</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3 text-xs uppercase">Tenant</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3 text-xs uppercase">Property & Unit</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3 text-xs uppercase">Rent</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3 text-xs uppercase">Duration</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3 text-xs uppercase">Status</TableHead>
                        <TableHead className="font-semibold text-gray-700 py-3 text-xs uppercase w-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPastLeases.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-gray-500 py-12">
                            <div className="flex flex-col items-center gap-3">
                              <div className="p-3 bg-gray-50 rounded-full">
                                <FileText className="w-8 h-8 text-gray-300" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-500">No past leases found</p>
                                <p className="text-sm text-gray-400 mt-1">All lease history will appear here</p>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredPastLeases.map((lease) => (
                          <TableRow 
                            key={lease.id}
                            className="group hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium text-gray-900 text-sm">
                                  {lease.leaseNickname || `${getTenantFullName(lease.tenant)} - ${lease.property.title}`}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs bg-white border-gray-200 text-gray-700">
                                    {getLeaseTypeDisplay(lease.leaseType)}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    Due {getDueDateDisplay(lease.dueDate)}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <img 
                                  src={getAvatarUrl(lease.tenant)}
                                  alt={`${getTenantFullName(lease.tenant)}'s avatar`}
                                  className="w-8 h-8 rounded-full border border-white shadow-sm"
                                />
                                <div>
                                  <div className="font-medium text-gray-900 text-sm">{getTenantFullName(lease.tenant)}</div>
                                  <div className="text-xs text-gray-500 truncate max-w-[100px]">{lease.tenant.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {lease.property.title}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Unit {lease.unit.label}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-bold text-gray-900">
                                  {formatCurrency(lease.rentAmount)}
                                </div>
                                <div className="text-xs text-gray-500">Monthly</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-gray-900">{formatDate(lease.startDate)}</div>
                                <div className="text-xs text-gray-500">
                                  {lease.endDate ? `Ended ${formatDate(lease.endDate)}` : 'No end date'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={getStatusVariant(lease.status)} 
                                className={`flex items-center gap-1 text-xs font-medium px-2 py-1 border ${getStatusColor(lease.status)}`}
                              >
                                {getStatusIcon(lease.status)}
                                {lease.status.charAt(0) + lease.status.slice(1).toLowerCase()}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewLeaseDetails(lease.id)}
                                className="h-7 w-7 p-0 opacity-70 hover:opacity-100 hover:bg-gray-100 hover:text-gray-700 transition-all rounded"
                                title="View lease details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leases;
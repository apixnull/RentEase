import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  Wrench,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Building,
  Home,
  User,
  Mail,
  Phone,
  MapPin,
  Image as ImageIcon,
  Calendar,
  Search,
  Filter,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { getAllMaintenanceRequestsRequest, updateMaintenanceStatusRequest } from '@/api/landlord/maintenanceApi';
import { getPropertiesWithUnitsRequest } from '@/api/landlord/financialApi';
import { toast } from 'sonner';

// Maintenance Status Color Scheme
const MAINTENANCE_STATUS_THEME = {
  OPEN: {
    badge: "bg-amber-50 border border-amber-200 text-amber-700",
    pill: "bg-amber-100 text-amber-800",
    gradient: "from-amber-500 to-orange-500",
    gradientLight: "from-amber-200/70 via-amber-100/50 to-amber-200/70",
    gradientButton: "from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700",
    background: "bg-amber-50 border-amber-300",
    backgroundCard: "bg-gradient-to-br from-amber-50 to-orange-50",
    iconBackground: "bg-amber-500",
    textColor: "text-amber-700",
    textColorDark: "text-amber-900",
    textColorLight: "text-amber-600",
    blurLight: "bg-amber-200/40",
    blurDark: "bg-amber-300/40",
    border: "border-amber-200",
    borderDark: "border-amber-300",
    borderCard: "border-2 border-amber-300",
  },
  IN_PROGRESS: {
    badge: "bg-blue-50 border border-blue-200 text-blue-700",
    pill: "bg-blue-100 text-blue-800",
    gradient: "from-blue-500 to-indigo-500",
    gradientLight: "from-blue-200/70 via-blue-100/50 to-blue-200/70",
    gradientButton: "from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
    background: "bg-blue-50 border-blue-300",
    backgroundCard: "bg-gradient-to-br from-blue-50 to-indigo-50",
    iconBackground: "bg-blue-500",
    textColor: "text-blue-700",
    textColorDark: "text-blue-900",
    textColorLight: "text-blue-600",
    blurLight: "bg-blue-200/40",
    blurDark: "bg-blue-300/40",
    border: "border-blue-200",
    borderDark: "border-blue-300",
    borderCard: "border-2 border-blue-300",
  },
  RESOLVED: {
    badge: "bg-emerald-50 border border-emerald-200 text-emerald-700",
    pill: "bg-emerald-100 text-emerald-800",
    gradient: "from-emerald-500 to-green-500",
    gradientLight: "from-emerald-200/70 via-emerald-100/50 to-emerald-200/70",
    gradientButton: "from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700",
    background: "bg-emerald-50 border-emerald-300",
    backgroundCard: "bg-gradient-to-br from-emerald-50 to-green-50",
    iconBackground: "bg-emerald-500",
    textColor: "text-emerald-700",
    textColorDark: "text-emerald-900",
    textColorLight: "text-emerald-600",
    blurLight: "bg-emerald-200/40",
    blurDark: "bg-emerald-300/40",
    border: "border-emerald-200",
    borderDark: "border-emerald-300",
    borderCard: "border-2 border-emerald-300",
  },
  CANCELLED: {
    badge: "bg-gray-50 border border-gray-200 text-gray-700",
    pill: "bg-gray-100 text-gray-800",
    gradient: "from-gray-400 to-gray-500",
    gradientLight: "from-gray-200/70 via-gray-100/50 to-gray-200/70",
    gradientButton: "from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700",
    background: "bg-gray-50 border-gray-300",
    backgroundCard: "bg-gradient-to-br from-gray-50 to-slate-50",
    iconBackground: "bg-gray-500",
    textColor: "text-gray-700",
    textColorDark: "text-gray-900",
    textColorLight: "text-gray-600",
    blurLight: "bg-gray-200/40",
    blurDark: "bg-gray-300/40",
    border: "border-gray-200",
    borderDark: "border-gray-300",
    borderCard: "border-2 border-gray-300",
  },
  INVALID: {
    badge: "bg-rose-50 border border-rose-200 text-rose-700",
    pill: "bg-rose-100 text-rose-800",
    gradient: "from-rose-500 to-red-500",
    gradientLight: "from-rose-200/70 via-rose-100/50 to-rose-200/70",
    gradientButton: "from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700",
    background: "bg-rose-50 border-rose-300",
    backgroundCard: "bg-gradient-to-br from-rose-50 to-red-50",
    iconBackground: "bg-rose-500",
    textColor: "text-rose-700",
    textColorDark: "text-rose-900",
    textColorLight: "text-rose-600",
    blurLight: "bg-rose-200/40",
    blurDark: "bg-rose-300/40",
    border: "border-rose-200",
    borderDark: "border-rose-300",
    borderCard: "border-2 border-rose-300",
  },
} as const;

interface MaintenanceRequest {
  id: string;
  description: string;
  photoUrl: string | null;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED' | 'INVALID';
  createdAt: string;
  updatedAt: string;
  property: {
    id: string;
    title: string;
    type: string;
    street: string;
    barangay: string;
    zipCode: string;
    city: { name: string } | null;
    municipality: { name: string } | null;
  };
  unit: {
    id: string;
    label: string;
  } | null;
  reporter: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    avatarUrl: string | null;
    role: string;
  };
}

interface PropertyWithUnits {
  id: string;
  title: string;
  Unit?: Array<{
    id: string;
    label: string;
  }>;
}

const HISTORY_STATUSES: MaintenanceRequest['status'][] = ['INVALID', 'RESOLVED', 'CANCELLED'];
const HISTORY_STATUS_SET = new Set<MaintenanceRequest['status']>(HISTORY_STATUSES);

const Maintenance = () => {
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [propertiesWithUnits, setPropertiesWithUnits] = useState<PropertyWithUnits[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [sortBy, setSortBy] = useState<'latest' | 'oldest'>('latest');
  const [filterProperty, setFilterProperty] = useState<string>('all');
  const [filterUnit, setFilterUnit] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month'>('all');
  const [statsExpanded, setStatsExpanded] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'latest' | 'history'>('latest');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const fetchMaintenanceData = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setRefreshing(true);
      const [requestsResponse, propertiesResponse] = await Promise.all([
        getAllMaintenanceRequestsRequest(),
        getPropertiesWithUnitsRequest(),
      ]);

      setMaintenanceRequests(requestsResponse.data.maintenanceRequests || []);
      const propertiesData = propertiesResponse.data?.properties ?? propertiesResponse.data ?? [];
      setPropertiesWithUnits(Array.isArray(propertiesData) ? propertiesData : []);
    } catch (error: any) {
      console.error('Error fetching maintenance requests:', error);
      toast.error(error?.response?.data?.error || 'Failed to load maintenance requests');
    } finally {
      if (!silent) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMaintenanceData();
  }, [fetchMaintenanceData]);

  const handleRequestClick = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setSelectedStatus(request.status);
    setShowDetailsModal(true);
  };

  const handleRefresh = () => {
    if (!refreshing) {
      fetchMaintenanceData({ silent: true });
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedRequest || !selectedStatus || selectedStatus === selectedRequest.status) {
      return;
    }

    try {
      setUpdatingStatus(true);
      await updateMaintenanceStatusRequest(selectedRequest.id, selectedStatus as any);
      toast.success('Maintenance request status updated successfully');
      await fetchMaintenanceData({ silent: true });
      setShowDetailsModal(false);
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(error?.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusTheme = (status: string) => {
    return MAINTENANCE_STATUS_THEME[status as keyof typeof MAINTENANCE_STATUS_THEME] || MAINTENANCE_STATUS_THEME.CANCELLED;
  };

  const getStatusColor = (status: string) => {
    const theme = getStatusTheme(status);
    return theme.badge;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Clock className="w-3 h-3" />;
      case 'IN_PROGRESS':
        return <Wrench className="w-3 h-3" />;
      case 'RESOLVED':
        return <CheckCircle className="w-3 h-3" />;
      case 'CANCELLED':
        return <XCircle className="w-3 h-3" />;
      case 'INVALID':
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPropertyType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatAddress = (property: MaintenanceRequest['property']) => {
    const parts = [
      property.street,
      property.barangay,
      property.city?.name || property.municipality?.name,
      property.zipCode,
    ].filter(Boolean);
    return parts.join(', ');
  };

  // Calculate stats
  const stats = {
    total: maintenanceRequests.length,
    open: maintenanceRequests.filter(r => r.status === 'OPEN').length,
    inProgress: maintenanceRequests.filter(r => r.status === 'IN_PROGRESS').length,
    resolved: maintenanceRequests.filter(r => r.status === 'RESOLVED').length,
    cancelled: maintenanceRequests.filter(r => r.status === 'CANCELLED').length,
    invalid: maintenanceRequests.filter(r => r.status === 'INVALID').length,
  };

  const derivedProperties = useMemo(() => {
    return Array.from(
      new Map(maintenanceRequests.map(r => [r.property.id, r.property])).values()
    );
  }, [maintenanceRequests]);

  const propertyOptions = useMemo(() => {
    if (propertiesWithUnits.length) {
      return propertiesWithUnits.map(property => ({
        id: property.id,
        title: property.title,
      }));
    }
    return derivedProperties;
  }, [propertiesWithUnits, derivedProperties]);

  const unitsByProperty = useMemo(() => {
    const map = new Map<
      string,
      { units: Array<{ id: string; label: string }>; hasPropertyLevel: boolean }
    >();

    if (propertiesWithUnits.length) {
      propertiesWithUnits.forEach(property => {
        map.set(property.id, {
          units: (property.Unit ?? []).map(unit => ({ id: unit.id, label: unit.label })),
          hasPropertyLevel: false,
        });
      });
    }

    maintenanceRequests.forEach(request => {
      const existing = map.get(request.property.id) || { units: [], hasPropertyLevel: false };

      if (request.unit) {
        const alreadyExists = existing.units.some(unit => unit.id === request.unit!.id);
        if (!alreadyExists) {
          existing.units.push({ id: request.unit.id, label: request.unit.label });
        }
      } else {
        existing.hasPropertyLevel = true;
      }

      map.set(request.property.id, existing);
    });

    return map;
  }, [maintenanceRequests, propertiesWithUnits]);

  const currentPropertyUnits =
    filterProperty === 'all' ? null : unitsByProperty.get(filterProperty) || null;

  // Helper function to check if request is within date range
  const isWithinDays = (dateString: string, days: number): boolean => {
    const requestDate = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - requestDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= days;
  };

  // Helper function to check if request is within time filter
  const isWithinTimeFilter = (dateString: string): boolean => {
    if (timeFilter === 'all') return true;
    
    const requestDate = new Date(dateString);
    const now = new Date();
    
    if (timeFilter === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return requestDate >= weekAgo;
    }
    
    if (timeFilter === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return requestDate >= monthAgo;
    }
    
    return true;
  };

  const buildPageNumbers = (current: number, total: number) => {
    if (total <= 5) {
      return Array.from({ length: total }, (_, idx) => idx + 1);
    }

    if (current <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (current >= total - 2) {
      return Array.from({ length: 5 }, (_, idx) => total - 4 + idx);
    }

    return Array.from({ length: 5 }, (_, idx) => current - 2 + idx);
  };

  const filteredRequests = useMemo(() => {
    return maintenanceRequests.filter(request => {
      if (filterProperty !== 'all' && request.property.id !== filterProperty) {
        return false;
      }

      if (filterUnit !== 'all') {
        if (filterUnit === 'property-level') {
          if (request.unit) {
            return false;
          }
        } else if (request.unit?.id !== filterUnit) {
          return false;
        }
      }

      if (statusFilter && request.status !== statusFilter) {
        return false;
      }

      if (!isWithinTimeFilter(request.createdAt)) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesDescription = request.description.toLowerCase().includes(query);
        const matchesProperty = request.property.title.toLowerCase().includes(query);
        const matchesUnit = request.unit?.label.toLowerCase().includes(query) || false;
        const matchesReporter = `${request.reporter.firstName} ${request.reporter.lastName}`.toLowerCase().includes(query);
        const matchesAddress = formatAddress(request.property).toLowerCase().includes(query);
        const matchesStatus = request.status.toLowerCase().includes(query);

        if (!matchesDescription && !matchesProperty && !matchesUnit && !matchesReporter && !matchesAddress && !matchesStatus) {
          return false;
        }
      }

      return true;
    });
  }, [maintenanceRequests, filterProperty, filterUnit, statusFilter, timeFilter, searchQuery]);

  const { latestRequests, historyRequests } = useMemo(() => {
    const latest: MaintenanceRequest[] = [];
    const history: MaintenanceRequest[] = [];

    filteredRequests.forEach(request => {
      const isHistoryStatus = HISTORY_STATUS_SET.has(request.status);
      const isRecent = isWithinDays(request.createdAt, 7);

      if (isHistoryStatus) {
        if (isRecent) {
          history.push(request);
        }
        return;
      }

      latest.push(request);
    });

    return {
      latestRequests: latest,
      historyRequests: history,
    };
  }, [filteredRequests]);

  const sortRequestsForDisplay = (requests: MaintenanceRequest[]) => {
    const priorityOrder: Record<MaintenanceRequest['status'], number> = {
      OPEN: 1,
      IN_PROGRESS: 2,
      RESOLVED: 3,
      CANCELLED: 4,
      INVALID: 5,
    };

    return [...requests].sort((a, b) => {
      const aPriority = priorityOrder[a.status] ?? 99;
      const bPriority = priorityOrder[b.status] ?? 99;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      if (sortBy === 'latest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
  };

  const sortedLatestRequests = useMemo(
    () => sortRequestsForDisplay(latestRequests),
    [latestRequests, sortBy]
  );

  const sortedHistoryRequests = useMemo(
    () => sortRequestsForDisplay(historyRequests),
    [historyRequests, sortBy]
  );

  const paginateRequests = (requests: MaintenanceRequest[]) => {
    const total = requests.length;
    const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
    const safePage = Math.min(currentPage, totalPages);
    const startIdx = total === 0 ? 0 : (safePage - 1) * itemsPerPage;
    const endIdx = total === 0 ? 0 : Math.min(startIdx + itemsPerPage, total);

    return {
      total,
      totalPages,
      currentPage: safePage,
      startIndex: startIdx,
      endIndex: endIdx,
      slice: requests.slice(startIdx, startIdx + itemsPerPage),
    };
  };

  const latestPagination = useMemo(
    () => paginateRequests(sortedLatestRequests),
    [sortedLatestRequests, itemsPerPage, currentPage]
  );

  const historyPagination = useMemo(
    () => paginateRequests(sortedHistoryRequests),
    [sortedHistoryRequests, itemsPerPage, currentPage]
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, statusFilter, filterProperty, filterUnit, searchQuery, sortBy, timeFilter]);

  useEffect(() => {
    setFilterUnit('all');
  }, [filterProperty]);

  useEffect(() => {
    const activePagination =
      activeTab === 'latest' ? latestPagination : historyPagination;

    if (currentPage > activePagination.totalPages) {
      setCurrentPage(activePagination.totalPages);
    }
  }, [activeTab, currentPage, latestPagination.totalPages, historyPagination.totalPages]);

  if (loading) {
    return (
      <div className="min-h-screen space-y-6 p-4 sm:p-6">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Card className="border-slate-200 bg-white/90 shadow-sm backdrop-blur-sm">
          <CardHeader className="px-4 pb-2 pt-3">
            <div className="flex flex-1 items-center gap-2">
              <Skeleton className="h-7 w-7 rounded" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-3 w-96" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-gradient-to-r from-blue-50 to-emerald-50">
                <TableRow className="border-blue-100">
                  {[...Array(6)].map((_, i) => (
                    <TableHead key={i} className="py-2">
                      <Skeleton className="h-4 w-20" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i} className="border-b border-blue-50">
                    <TableCell className="py-2">
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-32" />
                        <Skeleton className="h-2.5 w-24" />
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-2.5 w-32" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <Skeleton className="h-3 w-40" />
                    </TableCell>
                    <TableCell className="py-2">
                      <Skeleton className="h-3 w-24" />
                    </TableCell>
                    <TableCell className="py-2">
                      <Skeleton className="ml-auto h-7 w-24" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-5 p-4 sm:p-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-sky-200/80 via-cyan-200/70 to-emerald-200/70 opacity-95" />
        <div className="relative m-[1px] rounded-[16px] border border-white/60 bg-white/85 shadow-lg backdrop-blur-lg">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-10 -left-12 h-32 w-32 rounded-full bg-gradient-to-br from-sky-300/40 to-cyan-400/30 blur-3xl"
            initial={{ opacity: 0.4, scale: 0.85 }}
            animate={{ opacity: 0.7, scale: 1.05 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-gradient-to-tl from-emerald-200/35 to-cyan-200/30 blur-3xl"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 3.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          />

          <div className="relative z-10 space-y-5 px-5 py-6 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: [0, -3, 3, 0] }}
                  className="relative flex-shrink-0"
                >
                  <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-sky-600 via-cyan-600 to-emerald-600 text-white shadow-xl shadow-cyan-500/25">
                    <Wrench className="relative z-10 h-5 w-5" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent" />
                  </div>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 220 }}
                    className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full border border-sky-100 bg-white text-sky-600 shadow-sm"
                  >
                    <Sparkles className="h-3 w-3" />
                  </motion.div>
                </motion.div>

                <div className="min-w-0 flex-1">
                  <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                    Maintenance Requests
                  </h1>
                  <p className="text-sm text-slate-600">
                    Track reported issues across your portfolio and keep repairs moving.
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="h-10 rounded-xl border-slate-200 bg-white/90 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-white disabled:opacity-70"
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

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
              style={{ originX: 0 }}
              className="relative h-1 w-full rounded-full overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400/80 via-cyan-400/80 to-emerald-400/80" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <CardTitle className="text-sm font-semibold text-gray-800">Statistics & Filters</CardTitle>
                {statusFilter && (
                  <Badge variant="secondary" className="border-gray-200 bg-gray-100 text-gray-700">
                    {statusFilter.replace('_', ' ')}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStatsExpanded(!statsExpanded)}
                className="h-7 w-7 p-0 text-gray-500"
              >
                {statsExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by description, property, unit, reporter, address, or status..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 rounded-lg pl-10 pr-10 text-sm"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 text-gray-500"
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-1 flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Filter className="h-4 w-4 text-gray-400" />
                    Filters
                  </div>
                  <Select value={timeFilter} onValueChange={(value: 'all' | 'week' | 'month') => setTimeFilter(value)}>
                    <SelectTrigger className="h-9 w-[140px] text-sm">
                      <SelectValue placeholder="Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortBy} onValueChange={(value: 'latest' | 'oldest') => setSortBy(value)}>
                    <SelectTrigger className="h-9 w-[140px] text-sm">
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">
                        <div className="flex items-center gap-2">
                          <ArrowUpDown className="h-3 w-3" />
                          Latest First
                        </div>
                      </SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filterProperty}
                    onValueChange={(value) => {
                      setFilterProperty(value);
                    }}
                  >
                    <SelectTrigger className="h-9 w-[190px] text-sm">
                      <SelectValue placeholder="Property" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Properties</SelectItem>
                    {propertyOptions.map(property => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.title}
                      </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filterUnit}
                    onValueChange={setFilterUnit}
                    disabled={
                      filterProperty === 'all' ||
                      !currentPropertyUnits ||
                      (!currentPropertyUnits.units.length && !currentPropertyUnits.hasPropertyLevel)
                    }
                  >
                    <SelectTrigger className="h-9 w-[180px] text-sm" disabled={filterProperty === 'all'}>
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Units</SelectItem>
                      {currentPropertyUnits?.hasPropertyLevel && (
                        <SelectItem value="property-level">Property-level</SelectItem>
                      )}
                      {currentPropertyUnits?.units.map(unit => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {statusFilter && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStatusFilter(null)}
                      className="h-9 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="mr-1 h-3 w-3" />
                      Clear Status
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {statsExpanded && (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                <button
                  type="button"
                  className={`rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50 px-3 py-3 text-left text-sm transition hover:shadow-sm ${
                    statusFilter === null ? 'ring-2 ring-blue-300' : ''
                  }`}
                  onClick={() => setStatusFilter(null)}
                >
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">Total</p>
                  <p className="text-xl font-bold text-blue-700">{stats.total}</p>
                </button>
                <button
                  type="button"
                  className={`rounded-xl border bg-gradient-to-br from-amber-50 to-orange-50 px-3 py-3 text-left text-sm transition hover:shadow-sm ${
                    statusFilter === 'OPEN' ? 'ring-2 ring-amber-300' : ''
                  }`}
                  onClick={() => setStatusFilter(statusFilter === 'OPEN' ? null : 'OPEN')}
                >
                  <p className="text-[11px] font-medium uppercase tracking-wide text-amber-600">Open</p>
                  <p className="text-xl font-bold text-amber-700">{stats.open}</p>
                </button>
                <button
                  type="button"
                  className={`rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50 px-3 py-3 text-left text-sm transition hover:shadow-sm ${
                    statusFilter === 'IN_PROGRESS' ? 'ring-2 ring-blue-300' : ''
                  }`}
                  onClick={() => setStatusFilter(statusFilter === 'IN_PROGRESS' ? null : 'IN_PROGRESS')}
                >
                  <p className="text-[11px] font-medium uppercase tracking-wide text-blue-600">In Progress</p>
                  <p className="text-xl font-bold text-blue-700">{stats.inProgress}</p>
                </button>
                <button
                  type="button"
                  className={`rounded-xl border bg-gradient-to-br from-emerald-50 to-green-50 px-3 py-3 text-left text-sm transition hover:shadow-sm ${
                    statusFilter === 'RESOLVED' ? 'ring-2 ring-emerald-300' : ''
                  }`}
                  onClick={() => setStatusFilter(statusFilter === 'RESOLVED' ? null : 'RESOLVED')}
                >
                  <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-600">Resolved</p>
                  <p className="text-xl font-bold text-emerald-700">{stats.resolved}</p>
                </button>
                <button
                  type="button"
                  className={`rounded-xl border bg-gradient-to-br from-gray-50 to-slate-50 px-3 py-3 text-left text-sm transition hover:shadow-sm ${
                    statusFilter === 'CANCELLED' ? 'ring-2 ring-gray-300' : ''
                  }`}
                  onClick={() => setStatusFilter(statusFilter === 'CANCELLED' ? null : 'CANCELLED')}
                >
                  <p className="text-[11px] font-medium uppercase tracking-wide text-gray-600">Cancelled</p>
                  <p className="text-xl font-bold text-gray-700">{stats.cancelled}</p>
                </button>
                <button
                  type="button"
                  className={`rounded-xl border bg-gradient-to-br from-rose-50 to-red-50 px-3 py-3 text-left text-sm transition hover:shadow-sm ${
                    statusFilter === 'INVALID' ? 'ring-2 ring-rose-300' : ''
                  }`}
                  onClick={() => setStatusFilter(statusFilter === 'INVALID' ? null : 'INVALID')}
                >
                  <p className="text-[11px] font-medium uppercase tracking-wide text-rose-600">Invalid</p>
                  <p className="text-xl font-bold text-rose-700">{stats.invalid}</p>
                </button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Maintenance Requests Table with Tabs */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'latest' | 'history')} className="w-full">
              <div className="border-b bg-gradient-to-br from-slate-50/80 via-gray-50/60 to-slate-50/80 backdrop-blur-sm">
                <TabsList className="w-full h-auto bg-transparent p-2 sm:p-3 gap-2 grid grid-cols-2">
                  <TabsTrigger
                    value="latest"
                    className={`relative flex-1 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-medium transition-all overflow-hidden ${
                      activeTab === 'latest'
                        ? `bg-gradient-to-r from-emerald-500 to-teal-500/20 text-emerald-700 border border-emerald-200/50 shadow-sm backdrop-blur-sm`
                        : `bg-gray-50/50 border border-gray-200 text-gray-600 hover:bg-gray-100/50`
                    }`}
                  >
                    {activeTab === 'latest' && (
                      <div className={`absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500/10 opacity-50`} />
                    )}
                    <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 ${activeTab === 'latest' ? 'text-emerald-700' : 'text-gray-500'}`} />
                    <span className="relative z-10 font-medium">Latest</span>
                    <span className="relative z-10 hidden sm:inline">Active &amp; recent</span>
                    <Badge className={`ml-1 text-xs px-1.5 py-0 relative z-10 ${
                      activeTab === 'latest'
                        ? `bg-emerald-100 text-emerald-800 border border-emerald-200/50`
                        : `bg-gray-100 text-gray-700`
                    }`}>
                      {latestRequests.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className={`relative flex-1 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-medium transition-all overflow-hidden ${
                      activeTab === 'history'
                        ? `bg-gradient-to-r from-emerald-500 to-teal-500/20 text-emerald-700 border border-emerald-200/50 shadow-sm backdrop-blur-sm`
                        : `bg-gray-50/50 border border-gray-200 text-gray-600 hover:bg-gray-100/50`
                    }`}
                  >
                    {activeTab === 'history' && (
                      <div className={`absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500/10 opacity-50`} />
                    )}
                    <Calendar className={`w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 ${activeTab === 'history' ? 'text-emerald-700' : 'text-gray-500'}`} />
                    <span className="relative z-10 font-medium">History</span>
                    <span className="relative z-10 hidden sm:inline">Closed / cancelled</span>
                    <Badge className={`ml-1 text-xs px-1.5 py-0 relative z-10 ${
                      activeTab === 'history'
                        ? `bg-emerald-100 text-emerald-800 border border-emerald-200/50`
                        : `bg-gray-100 text-gray-700`
                    }`}>
                      {historyRequests.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="latest" className="m-0 p-0">
                {latestPagination.slice.length === 0 ? (
                  <div className="py-12 text-center">
                    <Wrench className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                    <h3 className="mb-2 text-lg font-semibold text-gray-700">No Active Maintenance Requests</h3>
                    <p className="text-gray-500">No open or in-progress maintenance requests to display.</p>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold">Property & Unit</TableHead>
                          <TableHead className="font-semibold">Reporter</TableHead>
                          <TableHead className="font-semibold">Description</TableHead>
                          <TableHead className="font-semibold">Created</TableHead>
                          <TableHead className="font-semibold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {latestPagination.slice.map(request => {
                          const isHighlighted = request.status === 'OPEN' || request.status === 'IN_PROGRESS';
                          return (
                            <TableRow
                              key={request.id}
                              className={`cursor-pointer transition-colors ${
                                isHighlighted
                                  ? request.status === 'OPEN'
                                    ? 'bg-amber-50/50 hover:bg-amber-50 border-l-4 border-l-amber-400'
                                    : 'bg-blue-50/50 hover:bg-blue-50 border-l-4 border-l-blue-400'
                                  : 'hover:bg-gray-50'
                              }`}
                              onClick={() => handleRequestClick(request)}
                            >
                              <TableCell>
                                <Badge className={getStatusColor(request.status)}>
                                  {getStatusIcon(request.status)}
                                  <span className="ml-1">{request.status.replace('_', ' ')}</span>
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <div className="flex items-center gap-1.5">
                                    <Building className="h-3.5 w-3.5 text-gray-500" />
                                    <span className="text-sm font-medium">{request.property.title}</span>
                                  </div>
                                  {request.unit ? (
                                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                      <Home className="h-3 w-3" />
                                      <span>{request.unit.label}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5 text-xs text-amber-600">
                                      <AlertTriangle className="h-3 w-3" />
                                      <span>Property-level</span>
                                    </div>
                                  )}
                                  <div className="mt-0.5 flex items-start gap-1.5 text-xs text-gray-500">
                                    <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0" />
                                    <span className="line-clamp-1">{formatAddress(request.property)}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage src={request.reporter.avatarUrl || undefined} />
                                    <AvatarFallback className="bg-blue-100 text-xs text-blue-700">
                                      {request.reporter.firstName[0]}
                                      {request.reporter.lastName[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">
                                      {request.reporter.firstName} {request.reporter.lastName}
                                    </span>
                                    <span className="text-xs text-gray-500">{request.reporter.email}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <p className="max-w-xs text-sm text-gray-700 line-clamp-2">{request.description}</p>
                                {request.photoUrl && (
                                  <div className="mt-1 flex items-center gap-1 text-xs text-blue-600">
                                    <ImageIcon className="h-3 w-3" />
                                    <span>Has photo</span>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-xs text-gray-600">
                                    {new Date(request.createdAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(request.createdAt).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={e => {
                                    e.stopPropagation();
                                    handleRequestClick(request);
                                  }}
                                >
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>

                    {latestPagination.totalPages > 1 && (
                      <div className="border-t border-gray-200 p-4">
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Items per page:</span>
                            <Select
                              value={String(itemsPerPage)}
                              onValueChange={value => {
                                setItemsPerPage(Number(value));
                                setCurrentPage(1);
                              }}
                            >
                              <SelectTrigger className="h-8 w-[100px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-600">
                              Showing{' '}
                              <span className="font-medium">
                                {latestPagination.slice.length ? latestPagination.startIndex + 1 : 0}
                              </span>{' '}
                              to{' '}
                              <span className="font-medium">
                                {latestPagination.slice.length ? latestPagination.endIndex : 0}
                              </span>{' '}
                              of <span className="font-medium">{latestPagination.total}</span> requests
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={latestPagination.currentPage === 1}
                              className="h-8"
                            >
                              <ChevronLeft className="mr-1 h-4 w-4" />
                              Prev
                            </Button>
                            <div className="flex items-center gap-1">
                              {buildPageNumbers(latestPagination.currentPage, latestPagination.totalPages).map(pageNum => (
                                <Button
                                  key={`latest-page-${pageNum}`}
                                  variant={latestPagination.currentPage === pageNum ? 'default' : 'outline'}
                                  size="sm"
                                  className={`h-8 w-8 p-0 ${
                                    latestPagination.currentPage === pageNum ? 'bg-blue-600 hover:bg-blue-700' : ''
                                  }`}
                                  onClick={() => setCurrentPage(pageNum)}
                                >
                                  {pageNum}
                                </Button>
                              ))}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.min(latestPagination.totalPages, prev + 1))}
                              disabled={latestPagination.currentPage === latestPagination.totalPages}
                              className="h-8"
                            >
                              Next
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="history" className="m-0 p-0">
                {historyPagination.slice.length === 0 ? (
                  <div className="py-12 text-center">
                    <Calendar className="mx-auto mb-4 h-16 w-16 text-gray-300" />
                    <h3 className="mb-2 text-lg font-semibold text-gray-700">No Recently Closed Requests</h3>
                    <p className="text-gray-500">No resolved, cancelled, or invalid maintenance requests to review.</p>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader className="bg-gray-50">
                        <TableRow>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold">Property & Unit</TableHead>
                          <TableHead className="font-semibold">Reporter</TableHead>
                          <TableHead className="font-semibold">Description</TableHead>
                          <TableHead className="font-semibold">Created</TableHead>
                          <TableHead className="font-semibold text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historyPagination.slice.map(request => (
                          <TableRow
                            key={request.id}
                            className="cursor-pointer transition-colors hover:bg-gray-50"
                            onClick={() => handleRequestClick(request)}
                          >
                            <TableCell>
                              <Badge className={getStatusColor(request.status)}>
                                {getStatusIcon(request.status)}
                                <span className="ml-1">{request.status.replace('_', ' ')}</span>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5">
                                  <Building className="h-3.5 w-3.5 text-gray-500" />
                                  <span className="text-sm font-medium">{request.property.title}</span>
                                </div>
                                {request.unit ? (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                    <Home className="h-3 w-3" />
                                    <span>{request.unit.label}</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 text-xs text-amber-600">
                                    <AlertTriangle className="h-3 w-3" />
                                    <span>Property-level</span>
                                  </div>
                                )}
                                <div className="mt-0.5 flex items-start gap-1.5 text-xs text-gray-500">
                                  <MapPin className="mt-0.5 h-3 w-3 flex-shrink-0" />
                                  <span className="line-clamp-1">{formatAddress(request.property)}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={request.reporter.avatarUrl || undefined} />
                                  <AvatarFallback className="bg-blue-100 text-xs text-blue-700">
                                    {request.reporter.firstName[0]}
                                    {request.reporter.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium">
                                    {request.reporter.firstName} {request.reporter.lastName}
                                  </span>
                                  <span className="text-xs text-gray-500">{request.reporter.email}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="max-w-xs text-sm text-gray-700 line-clamp-2">{request.description}</p>
                              {request.photoUrl && (
                                <div className="mt-1 flex items-center gap-1 text-xs text-blue-600">
                                  <ImageIcon className="h-3 w-3" />
                                  <span>Has photo</span>
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-xs text-gray-600">
                                  {new Date(request.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(request.createdAt).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={e => {
                                  e.stopPropagation();
                                  handleRequestClick(request);
                                }}
                              >
                                View Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {historyPagination.totalPages > 1 && (
                      <div className="border-t border-gray-200 p-4">
                        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Items per page:</span>
                            <Select
                              value={String(itemsPerPage)}
                              onValueChange={value => {
                                setItemsPerPage(Number(value));
                                setCurrentPage(1);
                              }}
                            >
                              <SelectTrigger className="h-8 w-[100px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-gray-600">
                              Showing{' '}
                              <span className="font-medium">
                                {historyPagination.slice.length ? historyPagination.startIndex + 1 : 0}
                              </span>{' '}
                              to{' '}
                              <span className="font-medium">
                                {historyPagination.slice.length ? historyPagination.endIndex : 0}
                              </span>{' '}
                              of <span className="font-medium">{historyPagination.total}</span> requests
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={historyPagination.currentPage === 1}
                              className="h-8"
                            >
                              <ChevronLeft className="mr-1 h-4 w-4" />
                              Prev
                            </Button>
                            <div className="flex items-center gap-1">
                              {buildPageNumbers(historyPagination.currentPage, historyPagination.totalPages).map(pageNum => (
                                <Button
                                  key={`history-page-${pageNum}`}
                                  variant={historyPagination.currentPage === pageNum ? 'default' : 'outline'}
                                  size="sm"
                                  className={`h-8 w-8 p-0 ${
                                    historyPagination.currentPage === pageNum ? 'bg-blue-600 hover:bg-blue-700' : ''
                                  }`}
                                  onClick={() => setCurrentPage(pageNum)}
                                >
                                  {pageNum}
                                </Button>
                              ))}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(prev => Math.min(historyPagination.totalPages, prev + 1))}
                              disabled={historyPagination.currentPage === historyPagination.totalPages}
                              className="h-8"
                            >
                              Next
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Details Modal */}
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                Maintenance Request Details
              </DialogTitle>
              <DialogDescription>
                View and update maintenance request information
              </DialogDescription>
            </DialogHeader>

            {selectedRequest && (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/50 flex flex-col gap-1">
                  <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Request At</span>
                  <div className="flex items-center gap-2 text-sm text-blue-900">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>{formatDate(selectedRequest.createdAt)}</span>
                  </div>
                </div>

                {/* Section 1: Status Actions */}
                <div className="space-y-3 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700">Update Status</label>
                    <Badge className={getStatusColor(selectedRequest.status)}>
                      {getStatusIcon(selectedRequest.status)}
                      <span className="ml-1">Current: {selectedRequest.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                  {selectedRequest.status === 'RESOLVED' || selectedRequest.status === 'INVALID' || selectedRequest.status === 'CANCELLED' ? (
                    <div className={`p-3 rounded-lg border ${
                      selectedRequest.status === 'RESOLVED' 
                        ? 'bg-emerald-50 border-emerald-200' 
                        : selectedRequest.status === 'INVALID'
                        ? 'bg-rose-50 border-rose-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        {selectedRequest.status === 'RESOLVED' && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                        {selectedRequest.status === 'INVALID' && <AlertTriangle className="w-4 h-4 text-rose-600" />}
                        {selectedRequest.status === 'CANCELLED' && <XCircle className="w-4 h-4 text-gray-600" />}
                        <p className={`text-sm font-medium ${
                          selectedRequest.status === 'RESOLVED' 
                            ? 'text-emerald-800' 
                            : selectedRequest.status === 'INVALID'
                            ? 'text-rose-800'
                            : 'text-gray-800'
                        }`}>
                          This status cannot be changed. This is a final status.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'INVALID'].map((status) => {
                        // Status transition rules
                        const canTransitionTo = (targetStatus: string) => {
                          const current = selectedRequest.status;
                          // IN_PROGRESS cannot go back to OPEN
                          if (current === 'IN_PROGRESS' && targetStatus === 'OPEN') return false;
                          // RESOLVED cannot go back to any previous status
                          if (current === 'RESOLVED') return false;
                          // INVALID cannot go back to any previous status
                          if (current === 'INVALID') return false;
                          // CANCELLED cannot be changed
                          if (current === 'CANCELLED') return false;
                          return true;
                        };

                        const isDisabled = 
                          updatingStatus || 
                          selectedRequest.status === status || 
                          !canTransitionTo(status);

                        return (
                          <Button
                            key={status}
                            variant={selectedStatus === status ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedStatus(status)}
                            disabled={isDisabled}
                            className={`${
                              selectedStatus === status
                                ? status === 'OPEN'
                                  ? 'bg-amber-600 hover:bg-amber-700 text-white'
                                  : status === 'IN_PROGRESS'
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                  : status === 'RESOLVED'
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'bg-rose-600 hover:bg-rose-700 text-white'
                                : ''
                            } ${
                              isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            title={
                              !canTransitionTo(status) 
                                ? `Cannot change from ${selectedRequest.status.replace('_', ' ')} to ${status.replace('_', ' ')}`
                                : selectedRequest.status === status
                                ? 'Current status'
                                : ''
                            }
                          >
                            {status === 'OPEN' && <Clock className="w-3 h-3 mr-1" />}
                            {status === 'IN_PROGRESS' && <Wrench className="w-3 h-3 mr-1" />}
                            {status === 'RESOLVED' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {status === 'INVALID' && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {status.replace('_', ' ')}
                          </Button>
                        );
                      })}
                      {selectedStatus !== selectedRequest.status && (
                        <Button
                          onClick={handleStatusUpdate}
                          disabled={updatingStatus}
                          className="ml-auto bg-blue-600 hover:bg-blue-700 text-white"
                          size="sm"
                        >
                          {updatingStatus ? (
                            <>
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Update Status
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Section 2: Property/Unit & Reporter Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-blue-50/50 border-blue-200 h-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Property {selectedRequest.unit ? '& Unit' : ''} Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <span className="text-xs text-gray-500">Property Title</span>
                          <p className="font-semibold text-sm text-gray-900 mt-0.5">{selectedRequest.property.title}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Property Type</span>
                          <p className="text-sm text-gray-700 mt-0.5">{formatPropertyType(selectedRequest.property.type)}</p>
                        </div>
                      </div>
                      {selectedRequest.unit && (
                        <div>
                          <span className="text-xs text-gray-500 flex items-center gap-1.5">
                            <Home className="w-3 h-3" />
                            Unit
                          </span>
                          <p className="font-semibold text-sm text-gray-900 mt-0.5">{selectedRequest.unit.label}</p>
                        </div>
                      )}
                      {!selectedRequest.unit && (
                        <div className="p-2 bg-amber-50 border border-amber-200 rounded-md">
                          <p className="text-xs text-amber-700 flex items-center gap-1.5">
                            <AlertTriangle className="w-3 h-3" />
                            Property-level maintenance request (no specific unit)
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="text-xs text-gray-500 flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" />
                          Address
                        </span>
                        <p className="text-sm text-gray-700 mt-0.5">{formatAddress(selectedRequest.property)}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className={`${selectedRequest.reporter.role === 'LANDLORD' ? 'bg-amber-50/50 border-amber-200' : 'bg-purple-50/50 border-purple-200'} h-full`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Reporter Information
                        {selectedRequest.reporter.role === 'LANDLORD' && (
                          <Badge className="bg-amber-100 text-amber-800 text-xs ml-2">
                            Landlord Report
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-start gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={selectedRequest.reporter.avatarUrl || undefined} />
                          <AvatarFallback className={selectedRequest.reporter.role === 'LANDLORD' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}>
                            {selectedRequest.reporter.firstName[0]}{selectedRequest.reporter.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div>
                            <span className="text-xs text-gray-500">Name</span>
                            <p className="font-semibold text-sm text-gray-900">
                              {selectedRequest.reporter.firstName} {selectedRequest.reporter.lastName}
                            </p>
                            {selectedRequest.reporter.role === 'LANDLORD' && (
                              <p className="text-xs text-amber-700 mt-0.5">Reported by property owner</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Mail className="w-3.5 h-3.5 text-gray-500" />
                            <span className="break-all">{selectedRequest.reporter.email}</span>
                          </div>
                          {selectedRequest.reporter.phoneNumber && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <Phone className="w-3.5 h-3.5 text-gray-500" />
                              <span>{selectedRequest.reporter.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Section 4: Description */}
                <Card className="bg-gray-50/50 border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedRequest.description}
                    </p>
                  </CardContent>
                </Card>

                {/* Section 5: Photo */}
                {selectedRequest.photoUrl && (
                  <Card className="bg-slate-50/50 border-slate-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Photo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative group">
                        <img
                          src={selectedRequest.photoUrl}
                          alt="Maintenance issue"
                          className="w-full max-h-64 object-contain rounded-lg border border-gray-200 bg-white cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(selectedRequest.photoUrl!, '_blank')}
                        />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => window.open(selectedRequest.photoUrl!, '_blank')}
                            className="bg-white/90 hover:bg-white"
                          >
                            <Search className="w-4 h-4 mr-1" />
                            View Full Size
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-200">
                  <div>
                    <span className="text-xs text-gray-500">Created</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" />
                      <p className="text-sm text-gray-700">{formatDate(selectedRequest.createdAt)}</p>
                    </div>
                  </div>
                  {selectedRequest.updatedAt && new Date(selectedRequest.updatedAt).getTime() !== new Date(selectedRequest.createdAt).getTime() && (
                    <div>
                      <span className="text-xs text-gray-500">Last Updated</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        <p className="text-sm text-gray-700">{formatDate(selectedRequest.updatedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
                disabled={updatingStatus}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Maintenance;

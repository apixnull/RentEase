import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Users,
  Search,
  Building,
  Home,
  Mail,
  Phone,
  MapPin,
  Clock,
  CheckCircle,
  FileText,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { getAllLeasesRequest } from '@/api/landlord/leaseApi';
import { getPropertiesWithUnitsRequest } from '@/api/landlord/financialApi';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

// Interfaces
interface Property {
  id: string;
  title: string;
  type: string;
  street: string;
  barangay: string;
  zipCode: string;
  city: { name: string } | null;
  municipality: { name: string } | null;
}

interface Unit {
  id: string;
  label: string;
}

interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
}

interface Lease {
  id: string;
  propertyId: string;
  unitId: string;
  tenantId: string;
  leaseNickname: string | null;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'CANCELLED';
  startDate: string;
  endDate: string | null;
  rentAmount: number;
  property: Property;
  unit: Unit;
  tenant: Tenant;
  createdAt: string;
  updatedAt: string;
}

interface ApiLeasesResponse {
  leases: Lease[];
}

interface PropertyWithUnits {
  id: string;
  title: string;
  Unit?: Array<{ id: string; label: string }>;
}

// Lease Status Color Scheme
const LEASE_STATUS_THEME = {
  PENDING: {
    badge: "bg-amber-50 border border-amber-200 text-amber-700",
    icon: Clock,
    label: "Prospective Tenant",
  },
  ACTIVE: {
    badge: "bg-emerald-50 border border-emerald-200 text-emerald-700",
    icon: CheckCircle,
    label: "Current Active Tenant",
  },
  COMPLETED: {
    badge: "bg-blue-50 border border-blue-200 text-blue-700",
    icon: FileText,
    label: "Previous Tenant",
  },
  TERMINATED: {
    badge: "bg-red-50 border border-red-200 text-red-700",
    icon: XCircle,
    label: "Previous Tenant",
  },
  CANCELLED: {
    badge: "bg-gray-50 border border-gray-200 text-gray-700",
    icon: AlertTriangle,
    label: "Cancelled",
  },
};

const STATUS_CARD_STYLES: Record<
  string,
  {
    border: string;
    background: string;
    iconBg: string;
    iconText: string;
    chipBg: string;
    chipText: string;
  }
> = {
  all: {
    border: 'border-violet-200',
    background: 'bg-white',
    iconBg: 'bg-violet-100',
    iconText: 'text-violet-600',
    chipBg: 'bg-violet-100',
    chipText: 'text-violet-700',
  },
  PENDING: {
    border: 'border-amber-200',
    background: 'bg-amber-50/80',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-600',
    chipBg: 'bg-white',
    chipText: 'text-amber-700',
  },
  ACTIVE: {
    border: 'border-emerald-200',
    background: 'bg-emerald-50/80',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-600',
    chipBg: 'bg-white',
    chipText: 'text-emerald-700',
  },
  COMPLETED: {
    border: 'border-blue-200',
    background: 'bg-blue-50/80',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-600',
    chipBg: 'bg-white',
    chipText: 'text-blue-700',
  },
  TERMINATED: {
    border: 'border-rose-200',
    background: 'bg-rose-50/80',
    iconBg: 'bg-rose-100',
    iconText: 'text-rose-600',
    chipBg: 'bg-white',
    chipText: 'text-rose-700',
  },
  CANCELLED: {
    border: 'border-slate-200',
    background: 'bg-slate-50/80',
    iconBg: 'bg-slate-100',
    iconText: 'text-slate-600',
    chipBg: 'bg-white',
    chipText: 'text-slate-700',
  },
};

const Tenants = () => {
  const [leases, setLeases] = useState<Lease[]>([]);
  const [propertiesWithUnits, setPropertiesWithUnits] = useState<PropertyWithUnits[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('ACTIVE');
  const [statusPanelCollapsed, setStatusPanelCollapsed] = useState<boolean>(false);

  const fetchTenantsData = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
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
      console.error('Error fetching tenant data:', error);
      toast.error(error?.response?.data?.error || 'Failed to load tenant records');
    } finally {
      if (!silent) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTenantsData();
  }, [fetchTenantsData]);

  const fallbackProperties = useMemo(() => {
    const props = new Map<string, { id: string; title: string }>();
    leases.forEach(lease => {
      if (!props.has(lease.propertyId)) {
        props.set(lease.propertyId, { id: lease.propertyId, title: lease.property.title });
      }
    });
    return Array.from(props.values());
  }, [leases]);

  const propertyOptions = useMemo(() => {
    if (propertiesWithUnits.length) {
      return propertiesWithUnits.map(property => ({
        id: property.id,
        title: property.title,
      }));
    }
    return fallbackProperties;
  }, [propertiesWithUnits, fallbackProperties]);

  const unitsByProperty = useMemo(() => {
    const map = new Map<string, Array<{ id: string; label: string }>>();
    if (propertiesWithUnits.length) {
      propertiesWithUnits.forEach(property => {
        const units = property.Unit?.map(unit => ({ id: unit.id, label: unit.label })) ?? [];
        map.set(property.id, units);
      });
    } else {
      leases.forEach(lease => {
        const existing = map.get(lease.propertyId) || [];
        if (!existing.some(unit => unit.id === lease.unitId)) {
          map.set(lease.propertyId, [...existing, { id: lease.unitId, label: lease.unit.label }]);
        }
      });
    }
    return map;
  }, [propertiesWithUnits, leases]);

  const currentPropertyUnits =
    selectedProperty === 'all' ? [] : unitsByProperty.get(selectedProperty) ?? [];

  const isUnitSelectDisabled =
    selectedProperty === 'all' || currentPropertyUnits.length === 0;

  // Filter leases based on search and filters
  const filteredLeases = useMemo(() => {
    return leases.filter(lease => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        lease.tenant.firstName.toLowerCase().includes(searchLower) ||
        lease.tenant.lastName.toLowerCase().includes(searchLower) ||
        lease.tenant.email.toLowerCase().includes(searchLower) ||
        lease.property.title.toLowerCase().includes(searchLower) ||
        lease.unit.label.toLowerCase().includes(searchLower);

      // Property filter
      const matchesProperty =
        selectedProperty === 'all' || lease.propertyId === selectedProperty;

      // Unit filter
      const matchesUnit =
        selectedUnit === 'all' || lease.unitId === selectedUnit;

      // Status filter
      const matchesStatus =
        selectedStatus === 'all' || lease.status === selectedStatus;

      return matchesSearch && matchesProperty && matchesUnit && matchesStatus;
    });
  }, [leases, searchTerm, selectedProperty, selectedUnit, selectedStatus]);

  // Group filtered leases by status
  const groupedLeases = useMemo(() => {
    const groups: Record<string, Lease[]> = {
      PENDING: [],
      ACTIVE: [],
      COMPLETED: [],
      TERMINATED: [],
      CANCELLED: [],
    };

    filteredLeases.forEach(lease => {
      if (groups[lease.status]) {
        groups[lease.status].push(lease);
      }
    });

    return groups;
  }, [filteredLeases]);

  const statusCardData = useMemo(() => {
    const entries = [
      {
        key: 'all',
        label: 'All Tenants',
        subLabel: 'Every record',
        count: leases.length,
      },
      ...(['PENDING', 'ACTIVE', 'COMPLETED', 'TERMINATED', 'CANCELLED'] as const).map((statusKey) => ({
        key: statusKey,
        label: LEASE_STATUS_THEME[statusKey].label,
        subLabel: statusKey === 'ACTIVE' ? 'Current leases' : LEASE_STATUS_THEME[statusKey].label,
        count: groupedLeases[statusKey].length,
      })),
    ];
    return entries;
  }, [leases.length, groupedLeases]);

  const formatAddress = (property: Property) => {
    const parts = [
      property.street,
      property.barangay,
      property.city?.name || property.municipality?.name,
      property.zipCode,
    ].filter(Boolean);
    return parts.join(', ') || 'Address not available';
  };

  const formatPropertyType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusIcon = (status: keyof typeof LEASE_STATUS_THEME) => {
    const Icon = LEASE_STATUS_THEME[status].icon;
    return <Icon className="w-4 h-4" />;
  };

  // Reset unit filter when property changes
  useEffect(() => {
    setSelectedUnit('all');
  }, [selectedProperty]);

  const navigate = useNavigate();

  const handleRefresh = () => {
    if (!refreshing) {
      fetchTenantsData({ silent: true });
    }
  };

  return (
    <div className="min-h-screen space-y-6 p-4 sm:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-sky-200/80 via-cyan-200/75 to-emerald-200/70 opacity-95" />
        <div className="relative m-[1px] rounded-[16px] border border-white/60 bg-white/85 shadow-lg backdrop-blur-lg">
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

          <div className="relative z-10 space-y-5 px-4 py-5 sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: [0, -3, 3, 0] }}
                  className="relative flex-shrink-0"
                >
                  <div className="relative grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-600 via-cyan-600 to-emerald-600 text-white shadow-xl shadow-cyan-500/30">
                    <Users className="relative z-10 h-5 w-5" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                  </div>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 220 }}
                    className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full border border-sky-100 bg-white text-sky-600 shadow-sm"
                  >
                    <Sparkles className="h-3 w-3" />
                  </motion.div>
                  <motion.div
                    className="absolute inset-0 rounded-2xl border-2 border-cyan-400/30"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>

                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Tenant Records & Insights
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Keep a pulse on tenant relationships, leases, and contact info in one glance.
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex min-w-[160px] flex-1 items-center justify-between rounded-xl border border-slate-200/70 bg-white/85 px-4 py-2 shadow-sm">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Total Records</p>
                      <p className="text-2xl font-bold text-slate-900">{leases.length}</p>
                    </div>
                    <Badge className="border-emerald-100 bg-emerald-50 text-emerald-700">All</Badge>
                  </div>
                  <div className="flex min-w-[160px] flex-1 items-center justify-between rounded-xl border border-slate-200/70 bg-white/85 px-4 py-2 shadow-sm">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Active</p>
                      <p className="text-2xl font-bold text-emerald-600">{groupedLeases.ACTIVE.length}</p>
                    </div>
                    <Badge className="border-cyan-100 bg-cyan-50 text-cyan-700">Live</Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="h-11 rounded-xl border-slate-200 bg-white/85 px-5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-white disabled:opacity-70"
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
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
              style={{ originX: 0 }}
              className="relative h-1 w-full overflow-hidden rounded-full"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400/80 via-cyan-400/80 to-emerald-400/80" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Tenant Status & Filters</CardTitle>
              <p className="text-xs text-slate-500">Tap cards to filter tenants. {statusPanelCollapsed ? 'Expand' : 'Collapse'} to view all statuses.</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-700"
              onClick={() => setStatusPanelCollapsed(!statusPanelCollapsed)}
            >
              {statusPanelCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex flex-col gap-2 lg:flex-row lg:flex-wrap lg:items-center">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search tenants, properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 text-sm"
              />
            </div>
            <div className="flex flex-1 gap-2 flex-wrap">
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger className="h-9 text-sm w-full sm:w-48">
                  <SelectValue placeholder="Property" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {propertyOptions.map(prop => (
                    <SelectItem key={prop.id} value={prop.id}>
                      {prop.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedUnit}
                onValueChange={setSelectedUnit}
                disabled={isUnitSelectDisabled}
              >
                <SelectTrigger className="h-9 text-sm w-full sm:w-40" disabled={isUnitSelectDisabled}>
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Units</SelectItem>
                  {currentPropertyUnits.map(unit => (
                    <SelectItem key={unit.id} value={unit.id}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        {!statusPanelCollapsed && (
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {statusCardData.map((card) => {
                const isActive = selectedStatus === card.key || (card.key === 'all' && selectedStatus === 'all');
                const styles = STATUS_CARD_STYLES[card.key] || STATUS_CARD_STYLES.all;
                const iconElement =
                  card.key === 'all'
                    ? <Users className="w-4 h-4" />
                    : getStatusIcon(card.key as keyof typeof LEASE_STATUS_THEME);

                return (
                  <button
                    type="button"
                    key={card.key}
                    onClick={() => setSelectedStatus(card.key)}
                    className="text-left"
                  >
                    <div
                      className={`rounded-xl border ${styles.border} ${styles.background} p-4 flex items-center gap-3 transition-all ${
                        isActive ? 'ring-2 ring-violet-200 shadow-sm' : 'hover:border-slate-300'
                      }`}
                    >
                      <div className={`h-11 w-11 rounded-lg grid place-items-center ${styles.iconBg} ${styles.iconText}`}>
                        {iconElement}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs uppercase tracking-wide text-slate-500">{card.subLabel}</p>
                        <p className="text-xl font-semibold text-slate-900">{card.count}</p>
                      </div>
                      <Badge className={`${styles.chipBg} ${styles.chipText} text-[10px]`}>
                        {card.key === 'all' ? 'ALL' : card.key}
                      </Badge>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Loading State */}
      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : filteredLeases.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No tenant records found</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm || selectedProperty !== 'all' || selectedUnit !== 'all' || selectedStatus !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No leases have been created yet'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Group by Status */}
          {(['PENDING', 'ACTIVE', 'COMPLETED', 'TERMINATED', 'CANCELLED'] as const).map(status => {
            if (groupedLeases[status].length === 0) return null;

            return (
              <motion.div
                key={status}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(status)}
                        <CardTitle className="text-xl">
                          {LEASE_STATUS_THEME[status].label}
                        </CardTitle>
                        <Badge className={LEASE_STATUS_THEME[status].badge}>
                          {groupedLeases[status].length}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/60">
                            <TableHead className="text-[11px] uppercase tracking-wide text-slate-500">Tenant</TableHead>
                            <TableHead className="text-[11px] uppercase tracking-wide text-slate-500">Property</TableHead>
                            <TableHead className="text-[11px] uppercase tracking-wide text-slate-500">Unit</TableHead>
                            <TableHead className="text-[11px] uppercase tracking-wide text-slate-500">Lease</TableHead>
                            <TableHead className="text-[11px] uppercase tracking-wide text-slate-500">Rent</TableHead>
                            <TableHead className="text-[11px] uppercase tracking-wide text-slate-500">Status</TableHead>
                            <TableHead className="text-[11px] uppercase tracking-wide text-slate-500 text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {groupedLeases[status].map(lease => {
                            const tenantName = `${lease.tenant.firstName} ${lease.tenant.lastName}`;
                            const propertyAddress = formatAddress(lease.property);
                            return (
                            <TableRow key={lease.id} className="hover:bg-slate-50/80">
                              <TableCell className="py-3">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-9 w-9 border border-slate-100">
                                    <AvatarImage src={lease.tenant.avatarUrl || undefined} />
                                    <AvatarFallback>
                                      {lease.tenant.firstName[0]}
                                      {lease.tenant.lastName[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900 leading-tight">
                                      {tenantName}
                                    </p>
                                    <div className="mt-1 space-y-0.5 text-[11px] text-slate-500">
                                      <div className="flex items-center gap-1.5">
                                        <Mail className="w-3 h-3 text-slate-400" />
                                        <span className="truncate max-w-[160px]">{lease.tenant.email}</span>
                                      </div>
                                      {lease.tenant.phoneNumber && (
                                        <div className="flex items-center gap-1.5">
                                          <Phone className="w-3 h-3 text-slate-400" />
                                          <span>{lease.tenant.phoneNumber}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-3 align-top">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
                                    <Building className="w-4 h-4 text-violet-500" />
                                    <span className="truncate">{lease.property.title}</span>
                                  </div>
                                  <div className="flex items-start gap-1.5 text-[11px] text-slate-500">
                                    <MapPin className="w-3 h-3 text-slate-400 mt-0.5" />
                                    <span
                                      className="truncate block max-w-[200px]"
                                      title={propertyAddress}
                                    >
                                      {propertyAddress}
                                    </span>
                                  </div>
                                  <Badge variant="outline" className="text-[10px] mt-1 border-violet-200 text-violet-700">
                                    {formatPropertyType(lease.property.type)}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell className="py-3 align-top">
                                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-900">
                                  <Home className="w-4 h-4 text-slate-400" />
                                  {lease.unit.label}
                                </div>
                              </TableCell>
                              <TableCell className="py-3 align-top">
                                <div className="space-y-1 text-[12px] text-slate-600">
                                  <div>Start {formatDate(lease.startDate)}</div>
                                  <div>{lease.endDate ? `End ${formatDate(lease.endDate)}` : 'Ongoing'}</div>
                                </div>
                              </TableCell>
                              <TableCell className="py-3 align-top">
                                <div className="text-sm font-semibold text-slate-900">
                                  {formatCurrency(lease.rentAmount)}
                                </div>
                              </TableCell>
                              <TableCell className="py-3 align-top">
                                <Badge className={`${LEASE_STATUS_THEME[lease.status].badge} text-[11px]`}>
                                  {lease.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-3 align-top text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => navigate(`/landlord/leases/${lease.id}/details`)}
                                  className="h-8 px-3 text-xs border-slate-200 text-slate-700 hover:bg-slate-100"
                                >
                                  View Details
                                </Button>
                              </TableCell>
                            </TableRow>
                          )})}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Tenants;

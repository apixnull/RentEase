import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Building2,
  Home,
  Users,
  Phone,
  Clock,
  CheckCircle,
  FileText,
  XCircle,
  AlertTriangle,
  Sparkles,
  Calendar,
  Eye,
} from 'lucide-react';
import { getAllLeasesRequest } from '@/api/landlord/leaseApi';
import { getPropertiesWithUnitsRequest } from '@/api/landlord/financialApi';
import { toast } from 'sonner';

interface Tenant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
}

interface Property {
  id: string;
  title: string;
}

interface Unit {
  id: string;
  label: string;
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
}

interface PropertyWithUnits {
  id: string;
  title: string;
  Unit?: Array<{
    id: string;
    label: string;
  }>;
}

interface UnitVisualizationData {
  unitId: string;
  unitLabel: string;
  propertyId: string;
  propertyTitle: string;
  lease: Lease | null;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'CANCELLED' | 'VACANT';
}

const LEASE_STATUS_THEME = {
  PENDING: {
    badge: "bg-amber-50 border border-amber-200 text-amber-700",
    label: "Prospective Tenant",
    icon: Clock,
  },
  ACTIVE: {
    badge: "bg-emerald-50 border border-emerald-200 text-emerald-700",
    label: "Current Active Tenant",
    icon: CheckCircle,
  },
  COMPLETED: {
    badge: "bg-blue-50 border border-blue-200 text-blue-700",
    label: "Previous Tenant",
    icon: FileText,
  },
  TERMINATED: {
    badge: "bg-red-50 border border-red-200 text-red-700",
    label: "Previous Tenant",
    icon: XCircle,
  },
  CANCELLED: {
    badge: "bg-gray-50 border border-gray-200 text-gray-700",
    label: "Cancelled",
    icon: AlertTriangle,
  },
  VACANT: {
    badge: "bg-slate-50 border border-slate-200 text-slate-500",
    label: "Vacant",
    icon: Home,
  },
} as const;

const TenantsVisualization = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ACTIVE');
  const [properties, setProperties] = useState<PropertyWithUnits[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [visualizationData, setVisualizationData] = useState<UnitVisualizationData[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedPropertyId && properties.length > 0) {
      buildVisualizationData();
    }
  }, [selectedPropertyId, properties, leases, selectedStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [propertiesResponse, leasesResponse] = await Promise.all([
        getPropertiesWithUnitsRequest(),
        getAllLeasesRequest(),
      ]);

      const propertiesData = propertiesResponse.data?.properties ?? propertiesResponse.data ?? [];
      setProperties(Array.isArray(propertiesData) ? propertiesData : []);

      const leasesData = leasesResponse.data?.leases || [];
      setLeases(leasesData);

      // Auto-select first property if available
      if (propertiesData.length > 0 && !selectedPropertyId) {
        setSelectedPropertyId(propertiesData[0].id);
      }
    } catch (error: any) {
      console.error('Failed to fetch visualization data:', error);
      toast.error(error?.response?.data?.error || 'Failed to load visualization data');
    } finally {
      setLoading(false);
    }
  };

  const buildVisualizationData = () => {
    if (!selectedPropertyId) {
      setVisualizationData([]);
      return;
    }

    const selectedProperty = properties.find((p) => p.id === selectedPropertyId);
    if (!selectedProperty) {
      setVisualizationData([]);
      return;
    }

    // Get all leases for this property
    const propertyLeases = leases.filter((lease) => lease.propertyId === selectedPropertyId);

    // Create a map of unitId -> lease (prioritize ACTIVE, then PENDING, then others)
    const unitLeaseMap = new Map<string, Lease>();
    
    propertyLeases.forEach((lease) => {
      const existing = unitLeaseMap.get(lease.unitId);
      if (!existing) {
        unitLeaseMap.set(lease.unitId, lease);
      } else {
        // Prioritize: ACTIVE > PENDING > others
        const priority: Record<string, number> = {
          ACTIVE: 3,
          PENDING: 2,
          COMPLETED: 1,
          TERMINATED: 1,
          CANCELLED: 0,
        };
        if ((priority[lease.status] || 0) > (priority[existing.status] || 0)) {
          unitLeaseMap.set(lease.unitId, lease);
        }
      }
    });

    // Build visualization data for all units in the property
    const units = selectedProperty.Unit || [];
    let data: UnitVisualizationData[] = units.map((unit) => {
      const lease = unitLeaseMap.get(unit.id) || null;
      return {
        unitId: unit.id,
        unitLabel: unit.label,
        propertyId: selectedProperty.id,
        propertyTitle: selectedProperty.title,
        lease,
        status: lease ? lease.status : 'VACANT',
      };
    });

    // Filter by status if not 'all'
    if (selectedStatus !== 'all') {
      data = data.filter((unit) => unit.status === selectedStatus);
    }

    setVisualizationData(data);
  };

  const getStatusColor = (status: UnitVisualizationData['status']) => {
    switch (status) {
      case 'PENDING':
        return 'border-amber-300 bg-amber-50';
      case 'ACTIVE':
        return 'border-emerald-300 bg-emerald-50';
      case 'COMPLETED':
        return 'border-blue-300 bg-blue-50';
      case 'TERMINATED':
        return 'border-red-300 bg-red-50';
      case 'CANCELLED':
        return 'border-gray-300 bg-gray-50';
      default:
        return 'border-slate-200 bg-slate-50';
    }
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

  if (loading) {
    return (
      <div className="min-h-screen p-6 space-y-6">
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Card className="border border-slate-200">
          <CardHeader>
            <Skeleton className="h-10 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, idx) => (
                <Skeleton key={idx} className="h-40 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
        <div className="relative m-[1px] rounded-[16px] bg-white/85 backdrop-blur-lg border border-white/60 shadow-lg">
          <div className="px-4 sm:px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/landlord/tenants')}
                  className="h-9 w-9 p-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-sky-600 via-cyan-600 to-emerald-600 text-white grid place-items-center shadow-xl shadow-cyan-500/30">
                    <Users className="h-5 w-5 relative z-10" />
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900">
                      Tenants Visualization
                    </h1>
                    <p className="text-sm text-slate-600 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
                      Visual overview of units and their tenant occupancy status
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Property & Status Selector */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-cyan-600" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-2 block">Select Property</label>
              <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.title} ({property.Unit?.length || 0} units)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:w-48">
              <label className="text-xs text-slate-500 mb-2 block">Filter by Status</label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Prospective Tenant</SelectItem>
                  <SelectItem value="ACTIVE">Current Active Tenant</SelectItem>
                  <SelectItem value="COMPLETED">Previous Tenant</SelectItem>
                  <SelectItem value="TERMINATED">Previous Tenant (Terminated)</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="VACANT">Vacant</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Units Visualization */}
      {selectedPropertyId && (
        <Card className="border border-slate-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Home className="h-5 w-5 text-cyan-600" />
              Units
              {visualizationData.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {visualizationData.length} unit{visualizationData.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {visualizationData.length === 0 ? (
              <div className="py-12 text-center">
                <Home className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-medium">No units found</p>
                <p className="text-sm text-slate-400 mt-1">
                  {selectedStatus !== 'all'
                    ? `No units match the selected status filter`
                    : "This property doesn't have any units yet"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visualizationData.map((unit, unitIdx) => {
                  const StatusIcon = LEASE_STATUS_THEME[unit.status].icon;
                  return (
                    <motion.div
                      key={unit.unitId}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: unitIdx * 0.03 }}
                    >
                      <Card
                        className={`border-2 hover:border-cyan-300 transition-all shadow-md hover:shadow-lg ${getStatusColor(
                          unit.status
                        )}`}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              <Home className="w-5 h-5 text-slate-600 flex-shrink-0" />
                              <div className="min-w-0">
                                <CardTitle className="text-sm font-semibold text-slate-900 truncate">
                                  Unit {unit.unitLabel}
                                </CardTitle>
                              </div>
                            </div>
                            <StatusIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0 space-y-3">
                          {unit.lease ? (
                            <>
                              {/* Tenant Info */}
                              <div className="flex items-center gap-2 pt-2 border-t border-slate-200/50">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={unit.lease.tenant.avatarUrl || undefined} />
                                  <AvatarFallback className="text-xs bg-cyan-100 text-cyan-700">
                                    {`${unit.lease.tenant.firstName[0]}${unit.lease.tenant.lastName[0]}`.toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-slate-900 truncate">
                                    {unit.lease.tenant.firstName} {unit.lease.tenant.lastName}
                                  </p>
                                  <p className="text-xs text-slate-500 truncate">
                                    {unit.lease.tenant.email}
                                  </p>
                                </div>
                              </div>

                              {/* Status Badge */}
                              <Badge
                                variant="outline"
                                className={`text-xs font-medium w-full justify-start ${LEASE_STATUS_THEME[unit.status].badge}`}
                              >
                                <StatusIcon className="w-3 h-3 mr-1.5" />
                                {LEASE_STATUS_THEME[unit.status].label}
                              </Badge>

                              {/* Lease Info */}
                              <div className="pt-2 border-t border-slate-200/50 space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-600">Monthly Rent:</span>
                                  <span className="font-semibold text-slate-900">
                                    {formatCurrency(unit.lease.rentAmount)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="truncate">Start: {formatDate(unit.lease.startDate)}</p>
                                    {unit.lease.endDate && (
                                      <p className="truncate">End: {formatDate(unit.lease.endDate)}</p>
                                    )}
                                  </div>
                                </div>
                                {unit.lease.tenant.phoneNumber && (
                                  <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span className="truncate">{unit.lease.tenant.phoneNumber}</span>
                                  </div>
                                )}
                              </div>

                              {/* View Details Button */}
                              <div className="pt-2 border-t border-slate-200/50">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => navigate(`/landlord/leases/${unit.lease!.id}/details`)}
                                  className="w-full h-8 text-xs border-slate-200 text-slate-700 hover:bg-slate-100"
                                >
                                  <Eye className="w-3 h-3 mr-1.5" />
                                  View Details
                                </Button>
                              </div>
                            </>
                          ) : (
                            <div className="pt-2 border-t border-slate-200/50">
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Home className="w-4 h-4 text-slate-300" />
                                <span>No tenant assigned</span>
                              </div>
                              <Badge
                                variant="outline"
                                className={`text-xs font-medium w-full justify-start mt-2 ${LEASE_STATUS_THEME.VACANT.badge}`}
                              >
                                <StatusIcon className="w-3 h-3 mr-1.5" />
                                Vacant
                              </Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedPropertyId && properties.length === 0 && !loading && (
        <Card className="border-2 border-dashed border-slate-200">
          <CardContent className="py-16 text-center">
            <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">No properties found</p>
            <p className="text-sm text-slate-400 mt-1">
              Start by creating a property and adding units
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TenantsVisualization;


import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Wrench,
  Clock,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import { getAllMaintenanceRequestsRequest } from '@/api/landlord/maintenanceApi';
import { getPropertiesWithUnitsRequest } from '@/api/landlord/financialApi';
import { toast } from 'sonner';

interface MaintenanceRequest {
  id: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED' | 'INVALID';
  property: {
    id: string;
    title: string;
  };
  unit: {
    id: string;
    label: string;
  } | null;
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
  maintenanceStatus: 'OPEN' | 'IN_PROGRESS' | null;
  maintenanceCount: number;
}

const MaintenanceVisualization = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [properties, setProperties] = useState<PropertyWithUnits[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [visualizationData, setVisualizationData] = useState<UnitVisualizationData[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedPropertyId && properties.length > 0) {
      buildVisualizationData();
    }
  }, [selectedPropertyId, properties, maintenanceRequests]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [propertiesResponse, maintenanceResponse] = await Promise.all([
        getPropertiesWithUnitsRequest(),
        getAllMaintenanceRequestsRequest(),
      ]);

      const propertiesData = propertiesResponse.data?.properties ?? propertiesResponse.data ?? [];
      setProperties(Array.isArray(propertiesData) ? propertiesData : []);

      const requests = maintenanceResponse.data?.maintenanceRequests || [];
      setMaintenanceRequests(requests);

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

    // Filter maintenance requests for this property with only OPEN or IN_PROGRESS status
    const activeMaintenanceRequests = maintenanceRequests.filter(
      (req) =>
        req.property.id === selectedPropertyId &&
        (req.status === 'OPEN' || req.status === 'IN_PROGRESS') &&
        req.unit !== null // Only unit-level requests
    );

    console.log('🔍 Filtering maintenance requests:', {
      selectedPropertyId,
      totalRequests: maintenanceRequests.length,
      activeRequests: activeMaintenanceRequests.length,
      activeRequestsDetails: activeMaintenanceRequests.map(req => ({
        id: req.id,
        status: req.status,
        unitId: req.unit?.id,
        unitLabel: req.unit?.label,
        propertyId: req.property.id,
      })),
    });

    // Create a map of unitId -> maintenance status
    const unitMaintenanceMap = new Map<string, { status: 'OPEN' | 'IN_PROGRESS'; count: number }>();

    activeMaintenanceRequests.forEach((req) => {
      if (!req.unit) return;
      // Only process OPEN and IN_PROGRESS statuses
      if (req.status !== 'OPEN' && req.status !== 'IN_PROGRESS') return;

      const existing = unitMaintenanceMap.get(req.unit.id);
      if (existing) {
        // If one is OPEN and another is IN_PROGRESS, prioritize OPEN
        if (existing.status === 'IN_PROGRESS' && req.status === 'OPEN') {
          unitMaintenanceMap.set(req.unit.id, { status: 'OPEN', count: existing.count + 1 });
        } else if (existing.status === 'OPEN' && req.status === 'IN_PROGRESS') {
          unitMaintenanceMap.set(req.unit.id, { status: 'OPEN', count: existing.count + 1 });
        } else {
          unitMaintenanceMap.set(req.unit.id, { status: existing.status, count: existing.count + 1 });
        }
      } else {
        unitMaintenanceMap.set(req.unit.id, { status: req.status as 'OPEN' | 'IN_PROGRESS', count: 1 });
      }
    });

    console.log('📊 Unit maintenance map:', Array.from(unitMaintenanceMap.entries()));

    // Build visualization data for all units in the property
    const units = selectedProperty.Unit || [];
    const data: UnitVisualizationData[] = units.map((unit) => {
      const maintenance = unitMaintenanceMap.get(unit.id);
      return {
        unitId: unit.id,
        unitLabel: unit.label,
        propertyId: selectedProperty.id,
        propertyTitle: selectedProperty.title,
        maintenanceStatus: maintenance?.status || null,
        maintenanceCount: maintenance?.count || 0,
      };
    });

    setVisualizationData(data);
  };

  const getStatusColor = (status: 'OPEN' | 'IN_PROGRESS' | null) => {
    switch (status) {
      case 'OPEN':
        return 'border-amber-300 bg-amber-50';
      case 'IN_PROGRESS':
        return 'border-blue-300 bg-blue-50';
      default:
        return 'border-slate-200 bg-slate-50';
    }
  };

  const getStatusBadgeColor = (status: 'OPEN' | 'IN_PROGRESS') => {
    switch (status) {
      case 'OPEN':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusIcon = (status: 'OPEN' | 'IN_PROGRESS') => {
    switch (status) {
      case 'OPEN':
        return <Clock className="w-4 h-4" />;
      case 'IN_PROGRESS':
        return <Wrench className="w-4 h-4" />;
      default:
        return null;
    }
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
                <Skeleton key={idx} className="h-32 w-full rounded-lg" />
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
                  onClick={() => navigate('/landlord/maintenance')}
                  className="h-9 w-9 p-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-sky-600 via-cyan-600 to-emerald-600 text-white grid place-items-center shadow-xl shadow-cyan-500/30">
                    <Wrench className="h-5 w-5 relative z-10" />
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900">
                      Maintenance Visualization
                    </h1>
                    <p className="text-sm text-slate-600 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
                      Visual overview of units and their active maintenance status
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Property Selector */}
      <Card className="border border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-cyan-600" />
            Select Property
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
            <SelectTrigger className="w-full max-w-md">
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
                  This property doesn't have any units yet
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visualizationData.map((unit, unitIdx) => (
                  <motion.div
                    key={unit.unitId}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: unitIdx * 0.03 }}
                  >
                    <Card
                      className={`border-2 hover:border-cyan-300 transition-all shadow-md hover:shadow-lg ${getStatusColor(
                        unit.maintenanceStatus
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
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {unit.maintenanceStatus ? (
                          <div className="space-y-2">
                            <Badge
                              variant="outline"
                              className={`text-xs font-medium w-full justify-start ${getStatusBadgeColor(
                                unit.maintenanceStatus
                              )}`}
                            >
                              {getStatusIcon(unit.maintenanceStatus)}
                              <span className="ml-1.5">{unit.maintenanceStatus.replace('_', ' ')}</span>
                            </Badge>
                            {unit.maintenanceCount > 1 && (
                              <p className="text-xs text-slate-600">
                                {unit.maintenanceCount} active request{unit.maintenanceCount !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                            <span>No active maintenance</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
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

export default MaintenanceVisualization;


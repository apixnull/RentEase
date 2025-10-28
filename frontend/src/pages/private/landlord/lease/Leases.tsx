import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, X, Clock, CheckCircle, AlertTriangle, Ban, Calendar, Eye, Users, Loader, Plus, Download, FileCode } from 'lucide-react';
import { toast } from 'sonner';
import { getAllLeasesRequest } from '@/api/landlord/leaseApi';

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

const Leases = () => {
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [selectedLeaseType, setSelectedLeaseType] = useState('all');
  const [activeTab, setActiveTab] = useState('current');
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch leases on component mount
  useEffect(() => {
    const fetchLeases = async () => {
      try {
        setLoading(true);
        const response = await getAllLeasesRequest();
        const data: ApiLeasesResponse = response.data;
        setLeases(data.leases);
      } catch (error) {
        console.error('Failed to fetch leases:', error);
        toast.error('Failed to load leases. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeases();
  }, []);

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

  // Stats for current tab
  const currentPendingCount = currentLeases.filter(lease => lease.status === 'PENDING').length;
  const currentActiveCount = currentLeases.filter(lease => lease.status === 'ACTIVE').length;

  // Stats for past tab
  const pastCompletedCount = pastLeases.filter(lease => lease.status === 'COMPLETED').length;
  const pastTerminatedCount = pastLeases.filter(lease => lease.status === 'TERMINATED').length;
  const pastCancelledCount = pastLeases.filter(lease => lease.status === 'CANCELLED').length;

  // Get unique properties and units from leases
  const properties = Array.from(new Map(leases.map(lease => [lease.property.id, {
    id: lease.property.id,
    name: lease.property.title
  }])).values());

  const units = Array.from(new Map(leases.map(lease => [lease.unit.id, {
    id: lease.unit.id,
    number: lease.unit.label,
    propertyId: lease.propertyId
  }])).values());

  const filterLeases = (leasesToFilter: Lease[]) => {
    return leasesToFilter.filter(lease => {
      const propertyMatch = selectedProperty === 'all' || lease.propertyId === selectedProperty;
      const unitMatch = selectedUnit === 'all' || lease.unitId === selectedUnit;
      const leaseTypeMatch = selectedLeaseType === 'all' || lease.leaseType === selectedLeaseType;
      
      return propertyMatch && unitMatch && leaseTypeMatch;
    });
  };

  const filteredCurrentLeases = filterLeases(currentLeases);
  const filteredPastLeases = filterLeases(pastLeases);

  const filteredUnits = units.filter(unit => 
    selectedProperty === 'all' || unit.propertyId === selectedProperty
  );

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
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'ACTIVE':
        return 'bg-emerald-50 border-emerald-200 text-emerald-800';
      case 'COMPLETED':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'TERMINATED':
        return 'bg-rose-50 border-rose-200 text-rose-800';
      case 'CANCELLED':
        return 'bg-slate-100 border-slate-300 text-slate-700';
      default:
        return 'bg-slate-100 border-slate-300 text-slate-700';
    }
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

  const handleLeaseFormat = () => {
    navigate('/lease/format');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading lease portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Lease Portfolio
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            Professional lease management and monitoring system
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline"
            size="sm"
            className="border-gray-300 hover:bg-white text-xs"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button 
            variant="outline"
            size="sm"
            className="border-gray-300 hover:bg-white text-xs"
            onClick={handleLeaseFormat}
          >
            <FileCode className="w-4 h-4 mr-2" />
            Lease Format
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-xs"
            onClick={handleCreateLease}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Lease
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Leases Table with Tabs */}
        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="pb-3 border-b border-gray-200 bg-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Lease Management
                <Badge variant="secondary" className="ml-2 bg-blue-50 text-blue-700 text-xs">
                  {leases.length} total
                </Badge>
              </CardTitle>
              
              {/* Advanced Filters */}
              <div className="flex flex-wrap gap-2 items-center">
                <Select value={selectedProperty} onValueChange={(value) => {
                  setSelectedProperty(value);
                  setSelectedUnit('all');
                }}>
                  <SelectTrigger className="w-[140px] h-8 text-xs border-gray-300">
                    <SelectValue placeholder="All Properties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties</SelectItem>
                    {properties.map((property) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger className="w-[120px] h-8 text-xs border-gray-300">
                    <SelectValue placeholder="All Units" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Units</SelectItem>
                    {filteredUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        Unit {unit.number}
                      </SelectItem>
                    ))}
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

                {(selectedProperty !== 'all' || selectedUnit !== 'all' || selectedLeaseType !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedProperty('all');
                      setSelectedUnit('all');
                      setSelectedLeaseType('all');
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
              <TabsList className="w-full grid grid-cols-2 p-4 pb-0 bg-transparent border-b">
                <TabsTrigger 
                  value="current" 
                  className="data-[state=active]:bg-white data-[state=active]:border data-[state=active]:border-gray-200 data-[state=active]:text-gray-900 rounded-t-lg border-b-0 data-[state=active]:border-b-2 data-[state=active]:border-b-blue-600 transition-all duration-200 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Current</span>
                    <Badge variant="secondary" className="ml-1 text-xs bg-blue-50 text-blue-700">
                      {currentLeases.length}
                    </Badge>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="past" 
                  className="data-[state=active]:bg-white data-[state=active]:border data-[state=active]:border-gray-200 data-[state=active]:text-gray-900 rounded-t-lg border-b-0 data-[state=active]:border-b-2 data-[state=active]:border-b-gray-600 transition-all duration-200 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="font-medium">History</span>
                    <Badge variant="secondary" className="ml-1 text-xs bg-gray-100 text-gray-700">
                      {pastLeases.length}
                    </Badge>
                  </div>
                </TabsTrigger>
              </TabsList>

              {/* Current Leases Tab */}
              <TabsContent value="current" className="m-0 p-4">
                {/* Stats for Current Leases */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card className="border-l-3 border-l-amber-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-amber-700">Pending Approval</p>
                          <h3 className="text-xl font-bold text-gray-900 mt-1">{currentPendingCount}</h3>
                        </div>
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-3 border-l-emerald-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-emerald-700">Active & Running</p>
                          <h3 className="text-xl font-bold text-gray-900 mt-1">{currentActiveCount}</h3>
                        </div>
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-emerald-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
                              <div className="p-3 bg-blue-50 rounded-full">
                                <FileText className="w-8 h-8 text-blue-300" />
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
                                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-xs"
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
                            className="group hover:bg-blue-50/30 transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium text-gray-900 text-sm">
                                  {lease.leaseNickname || `${getTenantFullName(lease.tenant)} - ${lease.property.title}`}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs bg-white border-blue-200 text-blue-700">
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
                                className="h-7 w-7 p-0 opacity-70 hover:opacity-100 hover:bg-blue-100 hover:text-blue-700 transition-all rounded"
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
              <TabsContent value="past" className="m-0 p-4">
                {/* Stats for Past Leases */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="border-l-3 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-700">Completed</p>
                          <h3 className="text-xl font-bold text-gray-900 mt-1">{pastCompletedCount}</h3>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-3 border-l-rose-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-rose-700">Terminated</p>
                          <h3 className="text-xl font-bold text-gray-900 mt-1">{pastTerminatedCount}</h3>
                        </div>
                        <div className="p-2 bg-rose-100 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-rose-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-3 border-l-slate-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-700">Cancelled</p>
                          <h3 className="text-xl font-bold text-gray-900 mt-1">{pastCancelledCount}</h3>
                        </div>
                        <div className="p-2 bg-slate-100 rounded-lg">
                          <Ban className="w-5 h-5 text-slate-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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
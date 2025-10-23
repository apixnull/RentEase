import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Filter, X, Clock, CheckCircle, AlertTriangle, Ban, Calendar, Eye, Users, Building, Home } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface Property {
  id: string;
  name: string;
}

interface Unit {
  id: string;
  number: string;
  propertyId: string;
}

interface Lease {
  id: string;
  tenantId: string;
  tenantName: string;
  propertyId: string;
  property: string;
  unitId: string;
  unit: string;
  leaseNickname: string | null;
  leaseType: 'STANDARD' | 'SHORT_TERM' | 'LONG_TERM';
  startDate: string;
  endDate: string | null;
  rentAmount: number;
  interval: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

const Leases = () => {
  const [selectedProperty, setSelectedProperty] = useState('all');
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [selectedLeaseType, setSelectedLeaseType] = useState('all');
  const [activeTab, setActiveTab] = useState('current');
  const navigate = useNavigate();

  // Mock data based on the schema
  const properties: Property[] = [
    { id: '1', name: 'Sunset Apartments' },
    { id: '2', name: 'River View Complex' },
    { id: '3', name: 'Downtown Towers' }
  ];

  const units: Unit[] = [
    { id: '1', number: 'A101', propertyId: '1' },
    { id: '2', number: 'A102', propertyId: '1' },
    { id: '3', number: 'B201', propertyId: '2' },
    { id: '4', number: 'C301', propertyId: '3' }
  ];

  const leases: Lease[] = [
    { 
      id: '1', 
      tenantId: '1',
      tenantName: 'John Doe', 
      propertyId: '1',
      property: 'Sunset Apartments', 
      unitId: '1',
      unit: 'A101', 
      leaseNickname: 'John Sunset Lease',
      leaseType: 'STANDARD',
      startDate: '2024-01-01', 
      endDate: '2024-12-31', 
      rentAmount: 1500,
      interval: 'MONTHLY',
      status: 'ACTIVE',
      createdAt: '2024-01-01',
      updatedAt: '2024-12-01'
    },
    { 
      id: '2', 
      tenantId: '2',
      tenantName: 'Jane Smith', 
      propertyId: '2',
      property: 'River View Complex', 
      unitId: '3',
      unit: 'B201', 
      leaseNickname: 'Jane River Lease',
      leaseType: 'STANDARD',
      startDate: '2024-02-01', 
      endDate: '2025-01-31', 
      rentAmount: 1800,
      interval: 'MONTHLY',
      status: 'ACTIVE',
      createdAt: '2024-02-01',
      updatedAt: '2025-01-05'
    },
    { 
      id: '3', 
      tenantId: '3',
      tenantName: 'Mike Johnson', 
      propertyId: '3',
      property: 'Downtown Towers', 
      unitId: '4',
      unit: 'C301', 
      leaseNickname: 'Mike Downtown Lease',
      leaseType: 'LONG_TERM',
      startDate: '2024-03-01', 
      endDate: '2025-02-28', 
      rentAmount: 2200,
      interval: 'MONTHLY',
      status: 'PENDING',
      createdAt: '2024-03-01',
      updatedAt: '2024-03-01'
    },
    { 
      id: '4', 
      tenantId: '4',
      tenantName: 'Sarah Wilson', 
      propertyId: '1',
      property: 'Sunset Apartments', 
      unitId: '2',
      unit: 'A102', 
      leaseNickname: 'Sarah Apt Lease',
      leaseType: 'SHORT_TERM',
      startDate: '2024-01-15', 
      endDate: '2024-12-15', 
      rentAmount: 1400,
      interval: 'MONTHLY',
      status: 'COMPLETED',
      createdAt: '2024-01-15',
      updatedAt: '2024-11-15'
    },
    { 
      id: '5', 
      tenantId: '5',
      tenantName: 'Robert Brown', 
      propertyId: '2',
      property: 'River View Complex', 
      unitId: '3',
      unit: 'B201', 
      leaseNickname: 'Robert Terminated Lease',
      leaseType: 'STANDARD',
      startDate: '2023-06-01', 
      endDate: '2024-05-31', 
      rentAmount: 1700,
      interval: 'MONTHLY',
      status: 'TERMINATED',
      createdAt: '2023-06-01',
      updatedAt: '2024-04-15'
    },
    { 
      id: '6', 
      tenantId: '6',
      tenantName: 'Emily Davis', 
      propertyId: '3',
      property: 'Downtown Towers', 
      unitId: '4',
      unit: 'C301', 
      leaseNickname: 'Emily Cancelled Lease',
      leaseType: 'LONG_TERM',
      startDate: '2024-04-01', 
      endDate: '2025-03-31', 
      rentAmount: 2000,
      interval: 'MONTHLY',
      status: 'CANCELLED',
      createdAt: '2024-04-01',
      updatedAt: '2024-04-15'
    }
  ];

  // Calculate stats
  const pendingCount = leases.filter(lease => lease.status === 'PENDING').length;
  const activeCount = leases.filter(lease => lease.status === 'ACTIVE').length;
  const completedCount = leases.filter(lease => lease.status === 'COMPLETED').length;
  const terminatedCount = leases.filter(lease => lease.status === 'TERMINATED').length;
  const cancelledCount = leases.filter(lease => lease.status === 'CANCELLED').length;

  // Current leases: ACTIVE and PENDING (latest ones)
  const currentLeases = leases.filter(lease => 
    lease.status === 'ACTIVE' || lease.status === 'PENDING'
  ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  // Past leases: COMPLETED, TERMINATED, CANCELLED
  const pastLeases = leases.filter(lease => 
    lease.status === 'COMPLETED' || lease.status === 'TERMINATED' || lease.status === 'CANCELLED'
  ).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

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
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100';
      case 'ACTIVE':
        return 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100';
      case 'COMPLETED':
        return 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100';
      case 'TERMINATED':
        return 'bg-red-50 border-red-200 text-red-800 hover:bg-red-100';
      case 'CANCELLED':
        return 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100';
    }
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

  const getLeaseTypeDisplay = (leaseType: string) => {
    switch (leaseType) {
      case 'SHORT_TERM':
        return 'Short Term';
      case 'LONG_TERM':
        return 'Long Term';
      case 'STANDARD':
        return 'Standard';
      default:
        return leaseType;
    }
  };

  const getIntervalDisplay = (interval: string) => {
    switch (interval) {
      case 'DAILY':
        return 'Daily';
      case 'WEEKLY':
        return 'Weekly';
      case 'MONTHLY':
        return 'Monthly';
      default:
        return interval;
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

  const handleCreateLease = () => {
    navigate('/landlord/leases/create');
  };

  const handleViewLeaseDetails = (leaseId: string) => {
    navigate(`/landlord/leases/${leaseId}/details`);
  };

  const handleStatusFilter = (status: string) => {
    setActiveTab(status === 'COMPLETED' || status === 'TERMINATED' || status === 'CANCELLED' ? 'past' : 'current');
    setSelectedProperty('all');
    setSelectedUnit('all');
    setSelectedLeaseType('all');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold  bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Lease Management
          </h1>
          <p className="text-gray-600 mt-2">Manage and monitor all your property leases</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-sm shadow-lg"
            onClick={handleCreateLease}
          >
            <FileText className="w-4 h-4 mr-2" />
            Create New Lease
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card 
          className={`border-l-4 border-l-yellow-500 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${getStatusColor('PENDING')}`}
          onClick={() => handleStatusFilter('PENDING')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide">Pending</p>
                <h3 className="text-2xl font-bold mt-1">{pendingCount}</h3>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`border-l-4 border-l-green-500 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${getStatusColor('ACTIVE')}`}
          onClick={() => handleStatusFilter('ACTIVE')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide">Active</p>
                <h3 className="text-2xl font-bold mt-1">{activeCount}</h3>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`border-l-4 border-l-blue-500 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${getStatusColor('COMPLETED')}`}
          onClick={() => handleStatusFilter('COMPLETED')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide">Completed</p>
                <h3 className="text-2xl font-bold mt-1">{completedCount}</h3>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`border-l-4 border-l-red-500 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${getStatusColor('TERMINATED')}`}
          onClick={() => handleStatusFilter('TERMINATED')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide">Terminated</p>
                <h3 className="text-2xl font-bold mt-1">{terminatedCount}</h3>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`border-l-4 border-l-gray-500 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${getStatusColor('CANCELLED')}`}
          onClick={() => handleStatusFilter('CANCELLED')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide">Cancelled</p>
                <h3 className="text-2xl font-bold mt-1">{cancelledCount}</h3>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <Ban className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Filter className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-semibold">Filters</span>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-4 flex-1 flex-wrap">
              <div className="flex items-center gap-3">
                <Label className="text-sm font-medium text-gray-700 whitespace-nowrap flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  Property:
                </Label>
                <Select value={selectedProperty} onValueChange={(value) => {
                  setSelectedProperty(value);
                  setSelectedUnit('all');
                }}>
                  <SelectTrigger className="w-[180px] bg-white">
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
              </div>

              <div className="flex items-center gap-3">
                <Label className="text-sm font-medium text-gray-700 whitespace-nowrap flex items-center gap-2">
                  <Home className="w-4 h-4 text-gray-500" />
                  Unit:
                </Label>
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger className="w-[180px] bg-white">
                    <SelectValue placeholder="All Units" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Units</SelectItem>
                    {filteredUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <Label className="text-sm font-medium text-gray-700 whitespace-nowrap flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  Lease Type:
                </Label>
                <Select value={selectedLeaseType} onValueChange={setSelectedLeaseType}>
                  <SelectTrigger className="w-[180px] bg-white">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="STANDARD">Standard</SelectItem>
                    <SelectItem value="SHORT_TERM">Short Term</SelectItem>
                    <SelectItem value="LONG_TERM">Long Term</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(selectedProperty !== 'all' || selectedUnit !== 'all' || selectedLeaseType !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedProperty('all');
                  setSelectedUnit('all');
                  setSelectedLeaseType('all');
                }}
                className="flex items-center gap-2 text-sm border-gray-300"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Leases Table with Tabs */}
      <Card className="shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
          <CardTitle className="text-xl text-gray-800 flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-600" />
            Lease Portfolio
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2 p-4 bg-transparent">
              <TabsTrigger 
                value="current" 
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Current Leases
                  {currentLeases.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs bg-blue-100 text-blue-700">
                      {filteredCurrentLeases.length}
                    </Badge>
                  )}
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="past" 
                className="data-[state=active]:bg-gray-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Past Leases
                  {pastLeases.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs bg-gray-100 text-gray-700">
                      {filteredPastLeases.length}
                    </Badge>
                  )}
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="m-0">
              <div className="border-t">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="font-semibold text-gray-700">Lease Details</TableHead>
                      <TableHead className="font-semibold text-gray-700">Tenant</TableHead>
                      <TableHead className="font-semibold text-gray-700">Property & Unit</TableHead>
                      <TableHead className="font-semibold text-gray-700">Financials</TableHead>
                      <TableHead className="font-semibold text-gray-700">Duration</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCurrentLeases.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500 py-12">
                          <div className="flex flex-col items-center gap-3">
                            <FileText className="w-12 h-12 text-gray-300" />
                            <p className="text-lg font-medium text-gray-500">No current leases found</p>
                            <p className="text-sm text-gray-400">Try adjusting your filters or create a new lease</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCurrentLeases.map((lease) => (
                        <TableRow 
                          key={lease.id}
                          className="group hover:bg-blue-50 transition-all cursor-pointer border-b"
                          onClick={() => handleViewLeaseDetails(lease.id)}
                        >
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {lease.leaseNickname || `${lease.tenantName} - ${lease.unit}`}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs bg-blue-50">
                                  {getLeaseTypeDisplay(lease.leaseType)}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {getIntervalDisplay(lease.interval)}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-gray-900">{lease.tenantName}</div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm text-gray-900">{lease.property}</div>
                              <div className="text-xs text-gray-500">Unit {lease.unit}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-semibold text-green-600">
                                {formatCurrency(lease.rentAmount)}
                              </div>
                              <div className="text-xs text-gray-500">per {lease.interval.toLowerCase()}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm text-gray-900">{formatDate(lease.startDate)}</div>
                              <div className="text-xs text-gray-500">
                                {lease.endDate ? `to ${formatDate(lease.endDate)}` : 'No end date'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={getStatusVariant(lease.status)} 
                              className="flex items-center gap-1 text-xs font-medium px-2 py-1"
                            >
                              {getStatusIcon(lease.status)}
                              {lease.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewLeaseDetails(lease.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="past" className="m-0">
              <div className="border-t">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="font-semibold text-gray-700">Lease Details</TableHead>
                      <TableHead className="font-semibold text-gray-700">Tenant</TableHead>
                      <TableHead className="font-semibold text-gray-700">Property & Unit</TableHead>
                      <TableHead className="font-semibold text-gray-700">Financials</TableHead>
                      <TableHead className="font-semibold text-gray-700">Duration</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPastLeases.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500 py-12">
                          <div className="flex flex-col items-center gap-3">
                            <FileText className="w-12 h-12 text-gray-300" />
                            <p className="text-lg font-medium text-gray-500">No past leases found</p>
                            <p className="text-sm text-gray-400">Try adjusting your filters</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPastLeases.map((lease) => (
                        <TableRow 
                          key={lease.id}
                          className="group hover:bg-gray-50 transition-all cursor-pointer border-b"
                          onClick={() => handleViewLeaseDetails(lease.id)}
                        >
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {lease.leaseNickname || `${lease.tenantName} - ${lease.unit}`}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs bg-gray-50">
                                  {getLeaseTypeDisplay(lease.leaseType)}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {getIntervalDisplay(lease.interval)}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-gray-900">{lease.tenantName}</div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm text-gray-900">{lease.property}</div>
                              <div className="text-xs text-gray-500">Unit {lease.unit}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-semibold text-gray-600">
                                {formatCurrency(lease.rentAmount)}
                              </div>
                              <div className="text-xs text-gray-500">per {lease.interval.toLowerCase()}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm text-gray-900">{formatDate(lease.startDate)}</div>
                              <div className="text-xs text-gray-500">
                                {lease.endDate ? `to ${formatDate(lease.endDate)}` : 'No end date'}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={getStatusVariant(lease.status)} 
                              className="flex items-center gap-1 text-xs font-medium px-2 py-1"
                            >
                              {getStatusIcon(lease.status)}
                              {lease.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewLeaseDetails(lease.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Eye className="w-4 h-4" />
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
  );
};

export default Leases;
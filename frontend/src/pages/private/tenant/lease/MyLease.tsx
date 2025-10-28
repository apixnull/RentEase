import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Home, 
  Calendar, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  User,
  MapPin,
  Building,
  Eye,
  MessageCircle,
  History,
  Archive
} from 'lucide-react';
import { getTenantLeasesRequest } from '@/api/tenant/leaseApi';
import { useNavigate } from 'react-router-dom';

// Updated Lease interface based on actual API response
interface Lease {
  id: string;
  leaseNickname: string;
  leaseType: 'STANDARD' | 'SHORT_TERM' | 'LONG_TERM' | 'FIXED_TERM';
  interval: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  dueDate: number;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'CANCELLED';
  startDate: string;
  endDate: string | null;
  rentAmount: number;
  securityDeposit: number | null;
  createdAt: string;
  updatedAt: string;
  property: {
    id: string;
    title: string;
    street: string;
    barangay: string;
    city: {
      name: string;
    };
    municipality: string | null;
  };
  unit: {
    id: string;
    label: string;
  };
  landlord: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    avatarUrl: string | null;
  };
}

const MyLease = () => {
  const [currentLease, setCurrentLease] = useState<Lease | null>(null);
  const [pendingLeases, setPendingLeases] = useState<Lease[]>([]);
  const [pastLeases, setPastLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  const navigate = useNavigate();

  // Fetch lease data from API
  useEffect(() => {
    const fetchLeaseData = async () => {
      try {
        setLoading(true);
        
        const response = await getTenantLeasesRequest();
        const leases: Lease[] = response.data;

        // Group leases by status
        const activeLease = leases.find(lease => lease.status === 'ACTIVE') || null;
        const pending = leases.filter(lease => lease.status === 'PENDING');
        const past = leases.filter(lease => 
          ['COMPLETED', 'TERMINATED', 'CANCELLED'].includes(lease.status)
        );

        setCurrentLease(activeLease);
        setPendingLeases(pending);
        setPastLeases(past);
      } catch (error) {
        console.error('Error fetching lease data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaseData();
  }, []);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-4 h-4" />;
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'COMPLETED':
        return <Calendar className="w-4 h-4" />;
      case 'TERMINATED':
        return <AlertTriangle className="w-4 h-4" />;
      case 'CANCELLED':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
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

  const calculateLeaseProgress = (lease: Lease) => {
    const start = new Date(lease.startDate);
    const end = lease.endDate ? new Date(lease.endDate) : new Date();
    const now = new Date();
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  const handleViewLeaseDetails = (leaseId: string) => {
    navigate(`/tenant/my-lease/${leaseId}/details`);
  };

  const handleContactLandlord = (landlordId: string) => {
    // Open chat with landlord
    console.log('Contact landlord:', landlordId);
  };

  const CurrentLeaseCard = ({ lease }: { lease: Lease }) => (
    <Card className="shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-100 border-b">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-3 text-2xl text-green-800">
              <CheckCircle className="w-7 h-7 text-green-600" />
              {lease.leaseNickname || `${lease.property.title} - ${lease.unit.label}`}
            </CardTitle>
            <CardDescription className="text-green-700 mt-2">
              You are currently renting {lease.property.title} - {lease.unit.label}
            </CardDescription>
          </div>
          <Badge variant={getStatusVariant(lease.status)} className="text-sm px-3 py-2">
            {getStatusIcon(lease.status)}
            {lease.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property & Unit Information */}
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <Building className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Property</p>
                <p className="font-semibold text-lg">{lease.property.title}</p>
                <p className="text-sm text-gray-600">
                  {lease.property.street}, {lease.property.barangay}, {lease.property.city.name}
                  {lease.property.municipality && `, ${lease.property.municipality}`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Unit</p>
                <p className="font-semibold text-lg">{lease.unit.label}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Landlord</p>
                <div className="flex items-center gap-2 mb-1">
                  {lease.landlord.avatarUrl && (
                    <img 
                      src={lease.landlord.avatarUrl} 
                      alt={`${lease.landlord.firstName} ${lease.landlord.lastName}`}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <p className="font-semibold">
                    {lease.landlord.firstName} {lease.landlord.lastName}
                  </p>
                </div>
                <p className="text-sm text-gray-600">{lease.landlord.email}</p>
                <p className="text-sm text-gray-600">{lease.landlord.phoneNumber}</p>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Rent Amount</p>
                <p className="font-semibold text-2xl text-green-600">
                  {formatCurrency(lease.rentAmount)}
                </p>
                <p className="text-sm text-gray-600">
                  {lease.interval.toLowerCase()} • Due on {lease.dueDate}th
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Security Deposit</p>
                <p className="font-semibold">
                  {lease.securityDeposit ? formatCurrency(lease.securityDeposit) : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-orange-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Lease Type</p>
                <p className="font-semibold">{lease.leaseType.replace('_', ' ')}</p>
                <p className="text-sm text-gray-600">
                  Created: {formatDate(lease.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Lease Duration & Actions */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">Lease Duration</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-semibold">{formatDate(lease.startDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">End Date:</span>
                  <span className="font-semibold">{lease.endDate ? formatDate(lease.endDate) : 'Ongoing'}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">Lease Progress</p>
              <Progress value={calculateLeaseProgress(lease)} className="h-2" />
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => handleViewLeaseDetails(lease.id)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Lease Details
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => handleContactLandlord(lease.landlord.id)}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Landlord
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PendingLeaseCard = ({ lease }: { lease: Lease }) => (
    <Card key={lease.id} className="border border-amber-200">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">
                {lease.leaseNickname || `${lease.property.title} - ${lease.unit.label}`}
              </h3>
              <p className="text-gray-600">{lease.property.title} - {lease.unit.label}</p>
            </div>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              <Clock className="w-3 h-3 mr-1" />
              PENDING
            </Badge>
          </div>

          {/* Lease Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Rent Amount</p>
              <p className="font-semibold text-green-600">{formatCurrency(lease.rentAmount)}</p>
              <p className="text-xs text-gray-600">
                {lease.interval.toLowerCase()} • Due on {lease.dueDate}th
              </p>
            </div>
            <div>
              <p className="text-gray-500">Lease Type</p>
              <p className="font-semibold">{lease.leaseType.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-gray-500">Security Deposit</p>
              <p className="font-semibold">
                {lease.securityDeposit ? formatCurrency(lease.securityDeposit) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Created</p>
              <p className="font-semibold">{formatDate(lease.createdAt)}</p>
            </div>
          </div>

          {/* Property & Unit Information */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Building className="w-4 h-4 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">{lease.property.title}</p>
                <p className="text-xs text-gray-600">{lease.unit.label}</p>
                <p className="text-xs text-gray-600">
                  {lease.property.street}, {lease.property.barangay}, {lease.property.city.name}
                  {lease.property.municipality && `, ${lease.property.municipality}`}
                </p>
              </div>
            </div>
          </div>

          {/* Lease Duration */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-gray-600 mt-0.5" />
              <div className="w-full">
                <p className="text-sm font-medium">Lease Duration</p>
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Start: {formatDate(lease.startDate)}</span>
                  <span>End: {formatDate(lease.endDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Landlord Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {lease.landlord.avatarUrl && (
                <img 
                  src={lease.landlord.avatarUrl} 
                  alt={`${lease.landlord.firstName} ${lease.landlord.lastName}`}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {lease.landlord.firstName} {lease.landlord.lastName}
              </p>
              <p className="text-xs text-gray-600">Landlord • {lease.landlord.phoneNumber} • {lease.landlord.email}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              variant="outline"
              className="flex-1"
              onClick={() => handleViewLeaseDetails(lease.id)}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            <Button 
              className="flex-1"
              onClick={() => handleContactLandlord(lease.landlord.id)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Landlord
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PastLeaseCard = ({ lease }: { lease: Lease }) => (
    <Card key={lease.id} className="border border-gray-200">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">
                {lease.leaseNickname || `${lease.property.title} - ${lease.unit.label}`}
              </h3>
              <p className="text-gray-600">Unit {lease.unit.label}</p>
            </div>
            <Badge variant="outline" className="bg-gray-100 text-gray-700">
              <History className="w-3 h-3 mr-1" />
              {lease.status}
            </Badge>
          </div>

          {/* Lease Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Rent Amount</p>
              <p className="font-semibold text-green-600">{formatCurrency(lease.rentAmount)}</p>
              <p className="text-xs text-gray-600">
                {lease.interval.toLowerCase()} • Due on {lease.dueDate}th
              </p>
            </div>
            <div>
              <p className="text-gray-500">Lease Type</p>
              <p className="font-semibold">{lease.leaseType.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-gray-500">Security Deposit</p>
              <p className="font-semibold">
                {lease.securityDeposit ? formatCurrency(lease.securityDeposit) : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Created</p>
              <p className="font-semibold">{formatDate(lease.createdAt)}</p>
            </div>
          </div>

          {/* Property & Unit Information */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Building className="w-4 h-4 text-gray-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium">{lease.property.title}</p>
                <p className="text-xs text-gray-600">Unit {lease.unit.label}</p>
                <p className="text-xs text-gray-600">
                  {lease.property.street}, {lease.property.barangay}, {lease.property.city.name}
                  {lease.property.municipality && `, ${lease.property.municipality}`}
                </p>
              </div>
            </div>
          </div>

          {/* Lease Duration */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-gray-600 mt-0.5" />
              <div className="w-full">
                <p className="text-sm font-medium">Lease Duration</p>
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>Start: {formatDate(lease.startDate)}</span>
                  <span>End: {formatDate(lease.endDate)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Landlord Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {lease.landlord.avatarUrl && (
                <img 
                  src={lease.landlord.avatarUrl} 
                  alt={`${lease.landlord.firstName} ${lease.landlord.lastName}`}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {lease.landlord.firstName} {lease.landlord.lastName}
              </p>
              <p className="text-xs text-gray-600">Landlord • {lease.landlord.phoneNumber}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleViewLeaseDetails(lease.id)}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleContactLandlord(lease.landlord.id)}
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your lease information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          My Lease
        </h1>
        <p className="text-gray-600 mt-2">Manage your current lease and review pending agreements</p>
      </div>

      <div className="max-w-6xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
            <TabsTrigger value="current" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Current Lease
              {currentLease && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  1
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending
              {pendingLeases.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {pendingLeases.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              Past Leases
              {pastLeases.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
                  {pastLeases.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Current Lease Tab */}
          <TabsContent value="current" className="space-y-6">
            {currentLease ? (
              <CurrentLeaseCard lease={currentLease} />
            ) : (
              <Card className="shadow-lg border-0">
                <CardContent className="p-12 text-center">
                  <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Active Lease</h3>
                  <p className="text-gray-500 mb-6">
                    You don't have an active lease agreement at the moment.
                  </p>
                  <Button variant="outline">
                    Browse Properties
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Pending Leases Tab */}
          <TabsContent value="pending" className="space-y-6">
            {pendingLeases.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingLeases.map((lease) => (
                  <PendingLeaseCard key={lease.id} lease={lease} />
                ))}
              </div>
            ) : (
              <Card className="shadow-lg border-0">
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Pending Leases</h3>
                  <p className="text-gray-500 mb-6">
                    You don't have any pending lease agreements at the moment.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Past Leases Tab */}
          <TabsContent value="past" className="space-y-6">
            {pastLeases.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pastLeases.map((lease) => (
                  <PastLeaseCard key={lease.id} lease={lease} />
                ))}
              </div>
            ) : (
              <Card className="shadow-lg border-0">
                <CardContent className="p-12 text-center">
                  <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Past Leases</h3>
                  <p className="text-gray-500 mb-6">
                    You don't have any past lease agreements.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyLease;
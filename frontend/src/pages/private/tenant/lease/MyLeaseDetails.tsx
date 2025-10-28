import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  Home,
  User,
  FileText,
  CheckCircle,
  XCircle,
  MapPin,
  Building,
  Phone,
  Mail,
  Clock,
  Download,
  CreditCard,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  CalendarClock,
  Wrench,
  CalendarDays,
  ToolCase
} from 'lucide-react';
import { getLeaseDetailsRequest, handleTenantLeaseActionRequest } from '@/api/tenant/leaseApi';

interface LeaseDetails {
  id: string;
  leaseNickname: string;
  leaseType: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  securityDeposit: number | null;
  interval: string;
  dueDate: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  totalPaymentsMade: number;
  lastPaymentDate: string | null;
  leaseDocumentUrl: string | null;
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    gender: string;
    role: string;
    avatarUrl: string | null;
  };
  landlord: {
    id: string;
    firstName: string;
    lastName: string;
    gender: string;
    email: string;
    phoneNumber: string;
    role: string;
    avatarUrl: string | null;
  };
  property: {
    id: string;
    title: string;
    type: string;
    street: string;
    barangay: string;
    zipCode: string;
    city: {
      name: string;
    };
    municipality: null;
  };
  unit: {
    id: string;
    label: string;
  };
  payments: Array<{
    id: string;
    leaseId: string;
    amount: number;
    paidAt: string | null;
    method: string | null;
    paymentProofUrl: string | null;
    dueDate: string;
    status: string;
    timingStatus: string | null;
    type: string | null;
    note: string | null;
    reminderStage: number;
    createdAt: string;
    updatedAt: string;
  }>;
}

const MyLeaseDetails = () => {
  const { leaseId } = useParams<{ leaseId: string }>();
  const navigate = useNavigate();
  const [lease, setLease] = useState<LeaseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('lease');

  // Load active tab from session storage on component mount
  useEffect(() => {
    const savedTab = sessionStorage.getItem(`lease-${leaseId}-activeTab`);
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, [leaseId]);

  // Save active tab to session storage whenever it changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    sessionStorage.setItem(`lease-${leaseId}-activeTab`, value);
  };

  const fetchLeaseDetails = async (signal?: AbortSignal) => {
    if (!leaseId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await getLeaseDetailsRequest(leaseId, { signal });
      setLease(response.data.lease);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('Failed to fetch lease details');
        console.error('Error fetching lease details:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchLeaseDetails(controller.signal);

    return () => {
      controller.abort();
    };
  }, [leaseId]);

  const handleLeaseAction = async (action: 'accept' | 'reject') => {
    if (!leaseId) return;

    const confirmMessage = action === 'accept' 
      ? 'Are you sure you want to accept this lease? This action cannot be reverted.'
      : 'Are you sure you want to reject this lease? This action cannot be reverted.';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setActionLoading(action);
      setMessage(null);
      const response = await handleTenantLeaseActionRequest(leaseId, action);
      setMessage(response.data.message || `Lease ${action}ed successfully`);
      
      // Refetch lease details to get updated status
      await fetchLeaseDetails();
    } catch (err: any) {
      setError(`Failed to ${action} lease: ${err.response?.data?.message || err.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PENDING': return 'secondary';
      case 'ACCEPTED': return 'default';
      case 'REJECTED': return 'destructive';
      case 'ACTIVE': return 'default';
      case 'COMPLETED': return 'secondary';
      default: return 'outline';
    }
  };

  const getPaymentStatusVariant = (status: string) => {
    switch (status) {
      case 'PENDING': return 'secondary';
      case 'PAID': return 'default';
      case 'OVERDUE': return 'destructive';
      default: return 'outline';
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'PAID': return <CheckCircle2 className="h-4 w-4" />;
      case 'OVERDUE': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const downloadLeaseDocument = () => {
    if (lease?.leaseDocumentUrl) {
      const link = document.createElement('a');
      link.href = lease.leaseDocumentUrl;
      link.download = `Lease-Document-${lease.leaseNickname}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleNavigateToProperty = () => {
    if (lease?.property.id) {
      navigate(`/properties/${lease.property.id}?unit=${lease.unit.id}`);
    }
  };

  const handleViewProof = (proofUrl: string) => {
    if (proofUrl) {
      window.open(proofUrl, '_blank');
    }
  };

  // Calculate payment statistics
  const paymentStats = lease ? {
    total: lease.payments.length,
    paid: lease.payments.filter(p => p.status === 'PAID').length,
    pending: lease.payments.filter(p => p.status === 'PENDING').length,
    overdue: lease.payments.filter(p => p.status === 'OVERDUE').length,
  } : null;

  // Determine if payments tab should be shown
  const showPaymentsTab = lease && lease.status !== 'PENDING' && lease.status !== 'REJECTED';
  
  // Determine if maintenance tab should be shown
  const showMaintenanceTab = lease && (lease.status === 'ACTIVE' || lease.status === 'ACCEPTED');

  if (loading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!lease) {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <AlertDescription>Lease not found</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-6xl">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{lease.leaseNickname}</h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Badge variant={getStatusVariant(lease.status)} className="w-fit">
                {lease.status}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Created {formatDate(lease.createdAt)}
              </div>
            </div>
          </div>
        </div>
        
        {lease.leaseDocumentUrl && (
          <Button onClick={downloadLeaseDocument} variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Download Lease Document
          </Button>
        )}
      </div>

      {/* Action Alert for Pending Status */}
      {lease.status === 'PENDING' && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="font-semibold text-blue-900">Lease Action Required</p>
              <p className="text-blue-700">Please review the lease details and take action.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                onClick={() => handleLeaseAction('accept')}
                disabled={actionLoading !== null}
                className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              >
                {actionLoading === 'accept' ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept Lease
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleLeaseAction('reject')}
                disabled={actionLoading !== null}
                className="border-red-600 text-red-600 hover:bg-red-50 w-full sm:w-auto"
              >
                {actionLoading === 'reject' ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Lease
                  </>
                )}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {message && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {message}
          </AlertDescription>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className={`w-full grid ${showPaymentsTab && showMaintenanceTab ? 'grid-cols-3' : showPaymentsTab || showMaintenanceTab ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
          <TabsTrigger value="lease" className="flex items-center gap-2 text-xs sm:text-sm">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Lease</span>
          </TabsTrigger>
          {showPaymentsTab && (
            <TabsTrigger value="payments" className="flex items-center gap-2 text-xs sm:text-sm">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payments</span>
              {paymentStats && paymentStats.pending > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {paymentStats.pending}
                </Badge>
              )}
            </TabsTrigger>
          )}
          {showMaintenanceTab && (
            <TabsTrigger value="maintenance" className="flex items-center gap-2 text-xs sm:text-sm">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">Maintenance</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Lease Information Tab */}
        <TabsContent value="lease" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Lease Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="h-5 w-5" />
                  Lease Information
                </CardTitle>
                <CardDescription>Basic lease terms and conditions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium text-muted-foreground">Lease Type</span>
                    <span className="text-sm font-medium">{lease.leaseType.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium text-muted-foreground">Rent Amount</span>
                    <span className="text-sm font-medium">{formatCurrency(lease.rentAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium text-muted-foreground">Payment Interval</span>
                    <span className="text-sm font-medium capitalize">{lease.interval.toLowerCase()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium text-muted-foreground">Due Date</span>
                    <span className="text-sm font-medium">{lease.dueDate}th each {lease.interval.toLowerCase()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium text-muted-foreground">Security Deposit</span>
                    <span className="text-sm font-medium">
                      {lease.securityDeposit ? formatCurrency(lease.securityDeposit) : 'None'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lease Period */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5" />
                  Lease Period
                </CardTitle>
                <CardDescription>Start and end dates of the lease</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium text-muted-foreground">Start Date</span>
                    <span className="text-sm font-medium">{formatDate(lease.startDate)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium text-muted-foreground">End Date</span>
                    <span className="text-sm font-medium">{formatDate(lease.endDate)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium text-muted-foreground">Duration</span>
                    <span className="text-sm font-medium">
                      {Math.ceil((new Date(lease.endDate).getTime() - new Date(lease.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium text-muted-foreground">Last Updated</span>
                    <span className="text-sm font-medium">{formatDate(lease.updatedAt)}</span>
                  </div>
                </div>

                {lease.leaseDocumentUrl && (
                  <div className="pt-4">
                    <Button onClick={downloadLeaseDocument} className="w-full" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      View Lease Document
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Property and Unit Information - Combined Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                <div className="flex items-center gap-2 text-lg">
                  <Home className="h-5 w-5" />
                  Property & Unit Information
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleNavigateToProperty}
                  className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Details
                </Button>
              </CardTitle>
              <CardDescription>Details about the property and unit included in this lease</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {/* Property Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">Property</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-lg">{lease.property.title}</h4>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <MapPin className="h-4 w-4" />
                        <span className="break-words">
                          {lease.property.street}, {lease.property.barangay}, {lease.property.city.name}, {lease.property.zipCode}
                        </span>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>
                        <span className="ml-2 font-medium">{lease.property.type}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Unit Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">Unit</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-lg">{lease.unit.label}</h4>
                      <p className="text-sm text-muted-foreground mt-1">Unit included in this lease agreement</p>
                    </div>
                    
                    <Separator />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participants Information */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Tenant Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Tenant Information
                </CardTitle>
                <CardDescription>Your profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={lease.tenant.avatarUrl || undefined} />
                    <AvatarFallback className="text-lg">
                      {lease.tenant.firstName[0]}{lease.tenant.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">
                      {lease.tenant.firstName} {lease.tenant.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{lease.tenant.gender}</p>
                    <Badge variant="secondary" className="mt-1">
                      {lease.tenant.role}
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground break-all">{lease.tenant.email}</p>
                    </div>
                  </div>
                  {lease.tenant.phoneNumber && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-muted-foreground">{lease.tenant.phoneNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Landlord Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5" />
                  Landlord Information
                </CardTitle>
                <CardDescription>Property owner/manager</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={lease.landlord.avatarUrl || undefined} />
                    <AvatarFallback className="text-lg">
                      {lease.landlord.firstName[0]}{lease.landlord.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-lg">
                      {lease.landlord.firstName} {lease.landlord.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{lease.landlord.gender}</p>
                    <Badge variant="default" className="mt-1">
                      {lease.landlord.role}
                    </Badge>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-muted-foreground break-all">{lease.landlord.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-muted-foreground">{lease.landlord.phoneNumber}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payments Tab - Only shown for non-pending, non-rejected leases */}
        {showPaymentsTab && (
          <TabsContent value="payments" className="space-y-6">
            {/* Payment Statistics */}
            {paymentStats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total</p>
                        <p className="text-xl sm:text-2xl font-bold">{paymentStats.total}</p>
                      </div>
                      <CreditCard className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Paid</p>
                        <p className="text-xl sm:text-2xl font-bold text-green-600">{paymentStats.paid}</p>
                      </div>
                      <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Pending</p>
                        <p className="text-xl sm:text-2xl font-bold text-amber-600">{paymentStats.pending}</p>
                      </div>
                      <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Overdue</p>
                        <p className="text-xl sm:text-2xl font-bold text-red-600">{paymentStats.overdue}</p>
                      </div>
                      <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="h-5 w-5" />
                  Payment History
                </CardTitle>
                <CardDescription>Your payment transactions and history</CardDescription>
              </CardHeader>
              <CardContent>
                {lease.payments.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <CreditCard className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Payments Found</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-6">
                      No payment records have been created for this lease yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lease.payments.map((payment) => (
                      <div key={payment.id} className="flex flex-col p-4 border rounded-lg gap-4">
                        {/* Payment Header - Mobile Stacked, Desktop Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-base">{formatCurrency(payment.amount)}</span>
                            <Badge variant={getPaymentStatusVariant(payment.status)} className="flex items-center gap-1">
                              {getPaymentStatusIcon(payment.status)}
                              <span className="hidden sm:inline">{payment.status}</span>
                            </Badge>
                          </div>
                          
                          {payment.type && (
                            <Badge variant="outline" className="w-fit">
                              {payment.type}
                            </Badge>
                          )}
                        </div>

                        {/* Payment Details */}
                        <div className="space-y-3">
                          {/* Status and Timing */}
                          <div className="flex flex-wrap items-center gap-2">
                            {payment.timingStatus && (
                              <Badge variant="outline" className="text-xs">
                                {payment.timingStatus}
                              </Badge>
                            )}
                            {payment.method && (
                              <span className="text-xs text-muted-foreground">
                                Method: {payment.method}
                              </span>
                            )}
                          </div>

                          {/* Dates Information */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <CalendarDays className="h-4 w-4" />
                                <span>Due Date:</span>
                              </div>
                              <div className="font-medium">{formatDate(payment.dueDate)}</div>
                            </div>
                            
                            {payment.paidAt ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                  <span>Paid On:</span>
                                </div>
                                <div className="font-medium">{formatDateTime(payment.paidAt)}</div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Clock className="h-4 w-4 text-amber-600" />
                                  <span>Status:</span>
                                </div>
                                <div className="font-medium text-amber-600">Awaiting Payment</div>
                              </div>
                            )}
                          </div>

                          {/* Transaction Timeline */}
                          <div className="pt-2 border-t">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3" />
                                <span>Created: {formatDateTime(payment.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CalendarClock className="h-3 w-3" />
                                <span>Updated: {formatDateTime(payment.updatedAt)}</span>
                              </div>
                            </div>
                          </div>

                          {/* Additional Information */}
                          {payment.note && (
                            <div className="p-3 bg-muted/50 rounded-lg">
                              <p className="text-sm italic">"{payment.note}"</p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          {payment.paymentProofUrl && (
                            <div className="flex justify-end pt-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewProof(payment.paymentProofUrl!)}
                                className="flex items-center gap-2"
                              >
                                <ExternalLink className="h-4 w-4" />
                                View Payment Proof
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
          </TabsContent>
        )}

        {/* Maintenance Tab - Only shown for active/accepted leases */}
        {showMaintenanceTab && (
          <TabsContent value="maintenance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wrench className="h-5 w-5" />
                  Maintenance Requests
                </CardTitle>
                <CardDescription>
                  Request maintenance services for your unit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <ToolCase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Maintenance Portal</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    This feature is currently under development. You'll be able to submit maintenance requests and track their progress here soon.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button disabled variant="outline" className="flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Submit Request
                    </Button>
                    <Button disabled variant="outline" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      View Requests
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default MyLeaseDetails;
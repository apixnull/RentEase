import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  User, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Ban,
  Download,
  Send,
  Eye,
  Building,
  MapPin,
  CreditCard,
  Receipt
} from 'lucide-react';

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
  securityDeposit: number | null;
  advanceMonths: number;
  interval: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  dueDate: number;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'CANCELLED';
  totalPaymentsMade: number;
  lastPaymentDate: string | null;
  leaseDocumentUrl: string | null;
  landlordSignatureUrl: string | null;
  tenantSignatureUrl: string | null;
  createdAt: string;
  updatedAt: string;
  property: {
    id: string;
    title: string;
    type: string;
    street: string;
    barangay: string;
  };
  unit: {
    id: string;
    label: string;
    status: string;
  };
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
  };
  landlord: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Payment {
  id: string;
  leaseId: string;
  amount: number;
  paidAt: string | null;
  method: string | null;
  providerTxnId: string | null;
  paymentProofUrl: string | null;
  status: 'PENDING' | 'PAID';
  timingStatus: 'ONTIME' | 'LATE' | 'ADVANCE' | null;
  note: string | null;
  reminderStage: number;
  createdAt: string;
  updatedAt: string;
}

const ViewSpecificLease = () => {
  const { leaseId } = useParams<{ leaseId: string }>();
  const navigate = useNavigate();
  const [lease, setLease] = useState<Lease | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  // Mock data - Replace with actual API calls
  useEffect(() => {
    const fetchLeaseData = async () => {
      try {
        setLoading(true);
        // Mock lease data
        const mockLease: Lease = {
          id: '1',
          propertyId: '1',
          unitId: '1',
          tenantId: '1',
          landlordId: '1',
          leaseNickname: 'John Sunset Lease',
          leaseType: 'STANDARD',
          startDate: '2024-01-01T00:00:00.000Z',
          endDate: '2024-12-31T23:59:59.999Z',
          rentAmount: 1500,
          securityDeposit: 1500,
          advanceMonths: 1,
          interval: 'MONTHLY',
          dueDate: 1,
          status: 'ACTIVE',
          totalPaymentsMade: 12,
          lastPaymentDate: '2024-12-01T00:00:00.000Z',
          leaseDocumentUrl: 'https://example.com/lease.pdf',
          landlordSignatureUrl: 'https://example.com/landlord-sig.png',
          tenantSignatureUrl: 'https://example.com/tenant-sig.png',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-12-01T00:00:00.000Z',
          property: {
            id: '1',
            title: 'Sunset Apartments',
            type: 'APARTMENT',
            street: '123 Sunset Blvd',
            barangay: 'Barangay 1'
          },
          unit: {
            id: '1',
            label: 'A101',
            status: 'OCCUPIED'
          },
          tenant: {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@email.com',
            phoneNumber: '+1234567890'
          },
          landlord: {
            id: '1',
            firstName: 'Jane',
            lastName: 'Landlord',
            email: 'jane.landlord@email.com'
          }
        };

        // Mock payments data
        const mockPayments: Payment[] = [
          {
            id: '1',
            leaseId: '1',
            amount: 1500,
            paidAt: '2024-12-01T00:00:00.000Z',
            method: 'GCASH',
            providerTxnId: 'GC123456789',
            paymentProofUrl: 'https://example.com/payment1.png',
            status: 'PAID',
            timingStatus: 'ONTIME',
            note: 'December rent payment',
            reminderStage: 0,
            createdAt: '2024-12-01T00:00:00.000Z',
            updatedAt: '2024-12-01T00:00:00.000Z'
          },
          {
            id: '2',
            leaseId: '1',
            amount: 1500,
            paidAt: '2024-11-01T00:00:00.000Z',
            method: 'BANK_TRANSFER',
            providerTxnId: 'BT987654321',
            paymentProofUrl: 'https://example.com/payment2.png',
            status: 'PAID',
            timingStatus: 'ONTIME',
            note: 'November rent payment',
            reminderStage: 0,
            createdAt: '2024-11-01T00:00:00.000Z',
            updatedAt: '2024-11-01T00:00:00.000Z'
          },
          {
            id: '3',
            leaseId: '1',
            amount: 1500,
            paidAt: null,
            method: null,
            providerTxnId: null,
            paymentProofUrl: null,
            status: 'PENDING',
            timingStatus: null,
            note: 'January rent - due soon',
            reminderStage: 1,
            createdAt: '2024-12-15T00:00:00.000Z',
            updatedAt: '2024-12-15T00:00:00.000Z'
          }
        ];

        setLease(mockLease);
        setPayments(mockPayments);
      } catch (error) {
        console.error('Error fetching lease data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaseData();
  }, [leaseId]);

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
        return <Ban className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateLeaseProgress = () => {
    if (!lease) return 0;
    
    const start = new Date(lease.startDate);
    const end = lease.endDate ? new Date(lease.endDate) : new Date();
    const now = new Date();
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lease details...</p>
        </div>
      </div>
    );
  }

  if (!lease) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Lease Not Found</h3>
            <p className="text-gray-600 mb-4">The requested lease could not be found.</p>
            <Button onClick={() => navigate('/landlord/leases')}>Back to Leases</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const leaseProgress = calculateLeaseProgress();
  const paidPayments = payments.filter(p => p.status === 'PAID');
  const totalPaid = paidPayments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            {lease.leaseNickname || `${lease.tenant.firstName} ${lease.tenant.lastName} - ${lease.unit.label}`}
          </h1>
          <p className="text-gray-600 mt-1">Lease Agreement Details</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button size="sm" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <Send className="w-4 h-4" />
            Send Reminder
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <Card className="mb-6 shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <Badge variant={getStatusVariant(lease.status)} className="text-sm px-3 py-2">
                {getStatusIcon(lease.status)}
                {lease.status}
              </Badge>
              <div>
                <p className="text-sm text-gray-600">Lease Type</p>
                <p className="font-semibold">{getLeaseTypeDisplay(lease.leaseType)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-semibold">
                  {formatDate(lease.startDate)} - {lease.endDate ? formatDate(lease.endDate) : 'Ongoing'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Paid</p>
                <p className="font-bold text-green-600 text-lg">{formatCurrency(totalPaid)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Payments Made</p>
                <p className="font-bold text-blue-600 text-lg">{lease.totalPaymentsMade}</p>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Lease Progress</span>
              <span>{leaseProgress.toFixed(1)}%</span>
            </div>
            <Progress value={leaseProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content - 3/4 width */}
        <div className="lg:col-span-3">
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <CardTitle className="text-xl">Lease Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-2 p-6 bg-transparent border-b">
                  <TabsTrigger 
                    value="info" 
                    className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Lease Information
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="payments" 
                    className="data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Payments History
                      {payments.length > 0 && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {payments.length}
                        </Badge>
                      )}
                    </div>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="p-6 space-y-8">
                  {/* Property & Unit Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Building className="w-5 h-5 text-blue-600" />
                          Property Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Property Name</p>
                          <p className="font-semibold">{lease.property.title}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Property Type</p>
                          <p className="font-semibold">{lease.property.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="font-semibold">
                            {lease.property.street}, {lease.property.barangay}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <MapPin className="w-5 h-5 text-green-600" />
                          Unit Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Unit Number</p>
                          <p className="font-semibold">{lease.unit.label}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Unit Status</p>
                          <Badge variant="outline">{lease.unit.status}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tenant & Financial Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <User className="w-5 h-5 text-purple-600" />
                          Tenant Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Full Name</p>
                          <p className="font-semibold">
                            {lease.tenant.firstName} {lease.tenant.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-semibold">{lease.tenant.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-semibold">{lease.tenant.phoneNumber || 'N/A'}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <DollarSign className="w-5 h-5 text-green-600" />
                          Financial Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-500">Monthly Rent</p>
                          <p className="font-semibold text-green-600">
                            {formatCurrency(lease.rentAmount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Security Deposit</p>
                          <p className="font-semibold">
                            {lease.securityDeposit ? formatCurrency(lease.securityDeposit) : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Advance Months</p>
                          <p className="font-semibold">{lease.advanceMonths} month(s)</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Payment Due Date</p>
                          <p className="font-semibold">{lease.dueDate} of each month</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Lease Terms Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Calendar className="w-5 h-5 text-orange-600" />
                        Lease Terms
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Lease Type</p>
                          <p className="font-semibold">{getLeaseTypeDisplay(lease.leaseType)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Payment Interval</p>
                          <p className="font-semibold">{getIntervalDisplay(lease.interval)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total Payments Made</p>
                          <p className="font-semibold">{lease.totalPaymentsMade}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Start Date</p>
                          <p className="font-semibold">{formatDate(lease.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">End Date</p>
                          <p className="font-semibold">{lease.endDate ? formatDate(lease.endDate) : 'No end date'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Documents Section */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {lease.leaseDocumentUrl && (
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <FileText className="w-5 h-5 text-blue-500" />
                              <div>
                                <p className="font-medium">Lease Agreement</p>
                                <p className="text-sm text-gray-500">Signed lease document</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </div>
                        )}
                        
                        {lease.landlordSignatureUrl && (
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <User className="w-5 h-5 text-green-500" />
                              <div>
                                <p className="font-medium">Landlord Signature</p>
                                <p className="text-sm text-gray-500">Digital signature</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </div>
                        )}
                        
                        {lease.tenantSignatureUrl && (
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center gap-3">
                              <User className="w-5 h-5 text-purple-500" />
                              <div>
                                <p className="font-medium">Tenant Signature</p>
                                <p className="text-sm text-gray-500">Digital signature</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="payments" className="p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">Payment History</h3>
                      <p className="text-gray-600">All transactions for this lease</p>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Receipt className="w-4 h-4 mr-2" />
                      Record Payment
                    </Button>
                  </div>

                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Payment Method</TableHead>
                          <TableHead>Timing</TableHead>
                          <TableHead>Date Paid</TableHead>
                          <TableHead>Notes</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                              <div className="flex flex-col items-center gap-2">
                                <CreditCard className="w-12 h-12 text-gray-300" />
                                <p>No payments recorded yet</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          payments.map((payment) => (
                            <TableRow key={payment.id}>
                              <TableCell className="font-semibold">
                                {formatCurrency(payment.amount)}
                              </TableCell>
                              <TableCell>
                                <Badge variant={getPaymentStatusVariant(payment.status)}>
                                  {payment.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {payment.method || 'Not specified'}
                              </TableCell>
                              <TableCell>
                                {payment.timingStatus && (
                                  <Badge variant={getTimingStatusVariant(payment.timingStatus)}>
                                    {payment.timingStatus}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {payment.paidAt ? formatDateTime(payment.paidAt) : 'Pending'}
                              </TableCell>
                              <TableCell>
                                {payment.note || '-'}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  {payment.paymentProofUrl && (
                                    <Button variant="outline" size="sm">
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Payment Summary */}
                  {payments.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Payment Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Total Payments</p>
                            <p className="text-2xl font-bold text-blue-600">{payments.length}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Paid Amount</p>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500">Pending Payments</p>
                            <p className="text-2xl font-bold text-orange-600">
                              {payments.filter(p => p.status === 'PENDING').length}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-500">On Time Rate</p>
                            <p className="text-2xl font-bold text-green-600">
                              {paidPayments.length > 0 
                                ? Math.round((paidPayments.filter(p => p.timingStatus === 'ONTIME').length / paidPayments.length) * 100) 
                                : 0}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1/4 width */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Send className="w-4 h-4 mr-2" />
                Send Payment Reminder
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download Documents
              </Button>
              {lease.status === 'ACTIVE' && (
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700" size="sm">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Terminate Lease
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Lease Timeline */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg">Lease Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-sm">Lease Created</p>
                    <p className="text-xs text-gray-500">{formatDateTime(lease.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-sm">Lease Started</p>
                    <p className="text-xs text-gray-500">{formatDateTime(lease.startDate)}</p>
                  </div>
                </div>
                
                {lease.lastPaymentDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-sm">Last Payment</p>
                      <p className="text-xs text-gray-500">{formatDateTime(lease.lastPaymentDate)}</p>
                    </div>
                  </div>
                )}
                
                {lease.endDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-sm">Lease Ends</p>
                      <p className="text-xs text-gray-500">{formatDateTime(lease.endDate)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Tenant</p>
                <p className="text-sm">{lease.tenant.firstName} {lease.tenant.lastName}</p>
                <p className="text-xs text-gray-500">{lease.tenant.email}</p>
                {lease.tenant.phoneNumber && (
                  <p className="text-xs text-gray-500">{lease.tenant.phoneNumber}</p>
                )}
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm font-medium text-gray-500">Landlord</p>
                <p className="text-sm">{lease.landlord.firstName} {lease.landlord.lastName}</p>
                <p className="text-xs text-gray-500">{lease.landlord.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViewSpecificLease;
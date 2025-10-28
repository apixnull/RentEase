import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Building,
  CreditCard,
  Receipt,
  Home,
  Circle
} from 'lucide-react';
import { getLeaseByIdRequest } from '@/api/landlord/leaseApi';
import { markPaymentAsPaidRequest } from '@/api/landlord/paymentApi';

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
  interval: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  dueDate: number;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'CANCELLED';
  leaseDocumentUrl: string | null;
  createdAt: string;
  updatedAt: string;
  property: {
    id: string;
    title: string;
    street: string;
    barangay: string;
    zipCode: string;
    city: {
      name: string;
    };
    municipality: string | null;
  };
  unit: {
    id: string;
    label: string;
    unitCondition: string;
    occupiedAt: string;
  };
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
    avatarUrl: string | null;
  };
  payments: Payment[];
}

interface Payment {
  id: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  method: string | null;
  status: 'PENDING' | 'PAID';
  timingStatus: 'ONTIME' | 'LATE' | 'ADVANCE' | null;
  type: string | null;
  reminderStage: number;
  createdAt: string;
  updatedAt: string;
}

interface MarkAsPaidForm {
  paidAt: string;
  method: string;
  type: string;
  timingStatus: string;
}

interface RecordPaymentForm {
  amount: number;
  dueDate: string;
  paidAt: string;
  method: string;
  type: string;
  status: 'PENDING' | 'PAID';
}

const ViewSpecificLease = () => {
  const { leaseId } = useParams<{ leaseId: string }>();
  const navigate = useNavigate();
  const [lease, setLease] = useState<Lease | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [markAsPaidModal, setMarkAsPaidModal] = useState<{
    isOpen: boolean;
    payment: Payment | null;
  }>({
    isOpen: false,
    payment: null,
  });
  const [recordPaymentModal, setRecordPaymentModal] = useState(false);
  const [markAsPaidForm, setMarkAsPaidForm] = useState<MarkAsPaidForm>({
    paidAt: new Date().toISOString().split('T')[0],
    method: '',
    type: 'RENT',
    timingStatus: 'ONTIME'
  });
  const [recordPaymentForm, setRecordPaymentForm] = useState<RecordPaymentForm>({
    amount: 0,
    dueDate: new Date().toISOString().split('T')[0],
    paidAt: new Date().toISOString().split('T')[0],
    method: '',
    type: 'RENT',
    status: 'PENDING',
  });
  const [submitting, setSubmitting] = useState(false);

  // Initialize active tab from session storage
  useEffect(() => {
    if (leaseId) {
      const savedTab = sessionStorage.getItem(`lease-${leaseId}-activeTab`);
      if (savedTab && (savedTab === 'info' || savedTab === 'payments')) {
        setActiveTab(savedTab);
      }
    }
  }, [leaseId]);

  // Save active tab to session storage when it changes
  useEffect(() => {
    if (leaseId) {
      sessionStorage.setItem(`lease-${leaseId}-activeTab`, activeTab);
    }
  }, [activeTab, leaseId]);

  // Fetch lease data
  useEffect(() => {
    const fetchLeaseData = async () => {
      if (!leaseId) return;

      try {
        setLoading(true);
        const response = await getLeaseByIdRequest(leaseId);
        setLease(response.data.lease);
        // Set default amount for record payment form
        if (response.data.lease) {
          setRecordPaymentForm(prev => ({
            ...prev,
            amount: response.data.lease.rentAmount
          }));
        }
      } catch (error) {
        console.error('Error fetching lease data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaseData();
  }, [leaseId]);

  // Get the latest pending payment
  const getLatestPendingPayment = () => {
    if (!lease?.payments?.length) return null;

    const pendingPayments = lease.payments
      .filter(payment => payment.status === 'PENDING')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return pendingPayments[0] || null;
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
    return new Intl.NumberFormat('en-PH', {
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


  const calculateLeaseProgress = () => {
    if (!lease) return 0;
    
    const start = new Date(lease.startDate);
    const end = lease.endDate ? new Date(lease.endDate) : new Date();
    const now = new Date();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  const calculateLeaseDuration = () => {
    if (!lease || !lease.endDate) return 0;
    const start = new Date(lease.startDate);
    const end = new Date(lease.endDate);
    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return duration;
  };

  const getLeaseTypeDisplay = (leaseType: string) => {
    switch (leaseType) {
      case 'SHORT_TERM':
        return 'SHORT TERM';
      case 'LONG_TERM':
        return 'LONG TERM';
      case 'STANDARD':
        return 'STANDARD';
      case 'FIXED_TERM':
        return 'FIXED TERM';
      default:
        return leaseType;
    }
  };

  const getIntervalDisplay = (interval: string) => {
    switch (interval) {
      case 'DAILY':
        return 'daily';
      case 'WEEKLY':
        return 'weekly';
      case 'MONTHLY':
        return 'monthly';
      default:
        return interval.toLowerCase();
    }
  };

  const getOrdinalSuffix = (number: number) => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const value = number % 100;
    return number + (suffixes[(value - 20) % 10] || suffixes[value] || suffixes[0]);
  };

  // Calculate timing status based on due date and paid date
  const calculateTimingStatus = (dueDate: string, paidAt: string | null): 'ONTIME' | 'LATE' | 'ADVANCE' | null => {
    if (!paidAt) return null;
    
    const due = new Date(dueDate);
    const paid = new Date(paidAt);
    
    if (paid < due) return 'ADVANCE';
    if (paid > due) return 'LATE';
    return 'ONTIME';
  };

  // Mark as Paid functionality
  const handleMarkAsPaid = (payment: Payment) => {
    setMarkAsPaidModal({
      isOpen: true,
      payment,
    });
    const timingStatus = calculateTimingStatus(payment.dueDate, new Date().toISOString().split('T')[0]);
    setMarkAsPaidForm({
      paidAt: new Date().toISOString().split('T')[0],
      method: '',
      type: 'RENT',
      timingStatus: timingStatus || 'ONTIME'
    });
  };

  const handleMarkAsPaidSubmit = async () => {
    if (!markAsPaidModal.payment || !leaseId) return;

    // Calculate timing status
    const timingStatus = calculateTimingStatus(
      markAsPaidModal.payment.dueDate,
      markAsPaidForm.paidAt
    );

    if (!confirm(`Are you sure you want to mark this payment as paid?\nAmount: ${formatCurrency(markAsPaidModal.payment.amount)}\nMethod: ${markAsPaidForm.method}\nDate: ${formatDate(markAsPaidForm.paidAt)}`)) {
      return;
    }

    try {
      setSubmitting(true);
      
      // Call the API to mark payment as paid
      await markPaymentAsPaidRequest(
        markAsPaidModal.payment.id,
        {
          paidAt: markAsPaidForm.paidAt,
          method: markAsPaidForm.method,
          type: markAsPaidForm.type,
          timingStatus: timingStatus || 'ONTIME',
        }
      );

      // Refetch lease data to get updated payments
      const response = await getLeaseByIdRequest(leaseId);
      setLease(response.data.lease);

      setMarkAsPaidModal({ isOpen: false, payment: null });
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('Failed to mark payment as paid. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Record Payment functionality
  const handleRecordPayment = () => {
    setRecordPaymentModal(true);
    setRecordPaymentForm({
      amount: lease?.rentAmount || 0,
      dueDate: new Date().toISOString().split('T')[0],
      paidAt: new Date().toISOString().split('T')[0],
      method: '',
      type: 'RENT',
      status: 'PENDING',
    });
  };

  const handleRecordPaymentSubmit = async () => {
    if (!lease) return;

    // Calculate timing status if payment is marked as paid
    const timingStatus = recordPaymentForm.status === 'PAID' 
      ? calculateTimingStatus(recordPaymentForm.dueDate, recordPaymentForm.paidAt)
      : null;

    if (!confirm(`Create new payment record?\nAmount: ${formatCurrency(recordPaymentForm.amount)}\nDue Date: ${formatDate(recordPaymentForm.dueDate)}\nStatus: ${recordPaymentForm.status}`)) {
      return;
    }

    try {
      setSubmitting(true);
      
      // Here you would call your API to create the payment
      // await createPaymentRequest({
      //   leaseId: lease.id,
      //   amount: recordPaymentForm.amount,
      //   dueDate: recordPaymentForm.dueDate,
      //   paidAt: recordPaymentForm.status === 'PAID' ? recordPaymentForm.paidAt : null,
      //   method: recordPaymentForm.method,
      //   type: recordPaymentForm.type,
      //   status: recordPaymentForm.status,
      //   timingStatus,
      // });

      // For now, we'll update locally
      const newPayment: Payment = {
        id: `temp-${Date.now()}`,
        amount: recordPaymentForm.amount,
        dueDate: recordPaymentForm.dueDate,
        paidAt: recordPaymentForm.status === 'PAID' ? recordPaymentForm.paidAt : null,
        method: recordPaymentForm.method,
        type: recordPaymentForm.type,
        status: recordPaymentForm.status,
        timingStatus,
        reminderStage: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setLease({
        ...lease,
        payments: [...lease.payments, newPayment],
        updatedAt: new Date().toISOString(),
      });

      setRecordPaymentModal(false);
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Failed to create payment record. Please try again.');
    } finally {
      setSubmitting(false);
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
  const leaseDuration = calculateLeaseDuration();
  const paidPayments = lease.payments.filter(p => p.status === 'PAID');
  const totalPaid = paidPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const latestPendingPayment = getLatestPendingPayment();

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
      </div>

      {/* Main Content */}
      <Card className="shadow-xl border-0">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <CardTitle className="text-xl">Lease Management</CardTitle>
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
                  {lease.payments.length > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {lease.payments.length}
                    </Badge>
                  )}
                </div>
              </TabsTrigger>
            </TabsList>

            {/* Lease Information Tab */}
            <TabsContent value="info" className="p-6 space-y-8">
              {/* Progress Bar */}
              <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Lease Progress</span>
                    <span className="text-sm font-bold text-blue-600">{leaseProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={leaseProgress} className="h-3 bg-blue-100" />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>{formatDate(lease.startDate)}</span>
                    <span>{lease.endDate ? formatDate(lease.endDate) : 'Present'}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Basic Lease Terms */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Basic lease terms and conditions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-gray-600">Lease Type</span>
                      <span className="font-semibold">{getLeaseTypeDisplay(lease.leaseType)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-gray-600">Rent Amount</span>
                      <span className="font-semibold text-green-600">{formatCurrency(lease.rentAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-gray-600">Payment Interval</span>
                      <span className="font-semibold capitalize">{getIntervalDisplay(lease.interval)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-gray-600">Due Date</span>
                      <span className="font-semibold">{getOrdinalSuffix(lease.dueDate)} each {getIntervalDisplay(lease.interval)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Security Deposit</span>
                      <span className="font-semibold">{lease.securityDeposit ? formatCurrency(lease.securityDeposit) : 'None'}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Lease Period */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Lease Period</CardTitle>
                    <p className="text-sm text-gray-600">Start and end dates of the lease</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-gray-600">Start Date</span>
                      <span className="font-semibold">{formatDate(lease.startDate)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-gray-600">End Date</span>
                      <span className="font-semibold">{lease.endDate ? formatDate(lease.endDate) : 'No end date'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-sm text-gray-600">Duration</span>
                      <span className="font-semibold">{leaseDuration} days</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-sm text-gray-600">Last Updated</span>
                      <span className="font-semibold">{formatDate(lease.updatedAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Property & Unit Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Property & Unit Information</CardTitle>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">Details about the property and unit included in this lease</p>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Property Section */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-blue-600" />
                        <h4 className="font-semibold text-gray-800">Property</h4>
                      </div>
                      <div className="space-y-2 pl-6">
                        <p className="font-medium">{lease.property.title}</p>
                        <p className="text-sm text-gray-600">
                          {lease.property.street}, {lease.property.barangay}, {lease.property.city.name}, {lease.property.zipCode}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            CONDOMINIUM
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Unit Section */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-green-600" />
                        <h4 className="font-semibold text-gray-800">Unit</h4>
                      </div>
                      <div className="space-y-2 pl-6">
                        <p className="font-medium">{lease.unit.label}</p>
                        <p className="text-sm text-gray-600">
                          Unit included in this lease agreement
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tenant Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-semibold">Tenant Information</CardTitle>
                    <p className="text-sm text-gray-600">Your profile information</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-blue-600 text-lg">
                          {lease.tenant.firstName.charAt(0)}{lease.tenant.lastName.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {lease.tenant.firstName} {lease.tenant.lastName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            <Circle className="w-2 h-2 mr-1 fill-current" />
                            Male
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            TENANT
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600 block mb-1">Email</label>
                        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <span className="text-gray-900">{lease.tenant.email}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Payment Management</h3>
                  <p className="text-gray-600">Track and manage all payment transactions</p>
                </div>
                <Button 
                  className="bg-green-600 hover:bg-green-700 shadow-lg"
                  onClick={handleRecordPayment}
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Record New Payment
                </Button>
              </div>

              {/* Payment Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0 shadow-md">
                  <CardContent className="p-6 text-center">
                    <CreditCard className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 font-medium">Total Payments</p>
                    <p className="text-2xl font-bold text-blue-600">{lease.payments.length}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-0 shadow-md">
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 font-medium">Paid Amount</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPaid)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-0 shadow-md">
                  <CardContent className="p-6 text-center">
                    <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 font-medium">Pending</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {lease.payments.filter(p => p.status === 'PENDING').length}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-0 shadow-md">
                  <CardContent className="p-6 text-center">
                    <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 font-medium">On Time Rate</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {paidPayments.length > 0 
                        ? Math.round((paidPayments.filter(p => p.timingStatus === 'ONTIME').length / paidPayments.length) * 100) 
                        : 0}%
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Payments Table */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-gray-600" />
                    Payment History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="font-semibold">Amount</TableHead>
                        <TableHead className="font-semibold">Due Date</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Method</TableHead>
                        <TableHead className="font-semibold">Timing</TableHead>
                        <TableHead className="font-semibold">Date Paid</TableHead>
                        <TableHead className="font-semibold">Type</TableHead>
                        <TableHead className="font-semibold text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lease.payments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-gray-500 py-12">
                            <div className="flex flex-col items-center gap-3">
                              <CreditCard className="w-16 h-16 text-gray-300" />
                              <p className="text-lg font-medium text-gray-600">No payments recorded yet</p>
                              <p className="text-gray-500">Start by recording your first payment</p>
                              <Button 
                                className="mt-2 bg-green-600 hover:bg-green-700"
                                onClick={handleRecordPayment}
                              >
                                <Receipt className="w-4 h-4 mr-2" />
                                Record Payment
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        lease.payments.map((payment) => (
                          <TableRow key={payment.id} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="font-semibold text-green-600">
                              {formatCurrency(payment.amount)}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{formatDate(payment.dueDate)}</span>
                                <span className="text-xs text-gray-500">
                                  Due {new Date(payment.dueDate).toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={getPaymentStatusVariant(payment.status)}
                                className="font-medium px-2 py-1"
                              >
                                {payment.status === 'PAID' ? (
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                ) : (
                                  <Clock className="w-3 h-3 mr-1" />
                                )}
                                {payment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className={payment.method ? "font-medium" : "text-gray-400"}>
                                {payment.method || 'Not specified'}
                              </span>
                            </TableCell>
                            <TableCell>
                              {payment.timingStatus && (
                                <Badge 
                                  variant={getTimingStatusVariant(payment.timingStatus)}
                                  className="font-medium px-2 py-1"
                                >
                                  {payment.timingStatus}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {payment.paidAt ? (
                                <div className="flex flex-col">
                                  <span className="font-medium">{formatDate(payment.paidAt)}</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(payment.paidAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-400">Pending</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-medium">
                                {payment.type || 'RENT'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex justify-end gap-2">
                                {payment.status === 'PENDING' && payment.id === latestPendingPayment?.id && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => handleMarkAsPaid(payment)}
                                    className="border-green-200 text-green-700 hover:bg-green-50"
                                  >
                                    Mark as Paid
                                  </Button>
                                )}
                                {payment.status === 'PAID' && (
                                  <Button variant="outline" size="sm" disabled>
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Paid
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Mark as Paid Modal */}
      <Dialog open={markAsPaidModal.isOpen} onOpenChange={(open) => setMarkAsPaidModal({ isOpen: open, payment: null })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Mark Payment as Paid
            </DialogTitle>
            <DialogDescription>
              Record payment details for {markAsPaidModal.payment && formatCurrency(markAsPaidModal.payment.amount)} due on {markAsPaidModal.payment && formatDate(markAsPaidModal.payment.dueDate)}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paidAt" className="text-right">
                Date Paid *
              </Label>
              <Input
                id="paidAt"
                type="date"
                value={markAsPaidForm.paidAt}
                onChange={(e) => setMarkAsPaidForm({ ...markAsPaidForm, paidAt: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="method" className="text-right">
                Method *
              </Label>
              <Select 
                value={markAsPaidForm.method} 
                onValueChange={(value) => setMarkAsPaidForm({ ...markAsPaidForm, method: value })}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="GCASH">GCash</SelectItem>
                  <SelectItem value="PAYPAL">PayPal</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                  <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type *
              </Label>
              <Select 
                value={markAsPaidForm.type} 
                onValueChange={(value) => setMarkAsPaidForm({ ...markAsPaidForm, type: value })}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select payment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RENT">Rent</SelectItem>
                  <SelectItem value="ADVANCE_PAYMENT">Advance Payment</SelectItem>
                  <SelectItem value="PENALTY">Penalty</SelectItem>
                  <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Timing Status Preview */}
            {markAsPaidModal.payment && markAsPaidForm.paidAt && (
              <div className="grid grid-cols-4 items-center gap-4 pt-2 border-t">
                <Label className="text-right text-sm">Timing Status</Label>
                <div className="col-span-3">
                  <Badge variant={getTimingStatusVariant(calculateTimingStatus(markAsPaidModal.payment.dueDate, markAsPaidForm.paidAt))}>
                    {calculateTimingStatus(markAsPaidModal.payment.dueDate, markAsPaidForm.paidAt) || 'Not calculated'}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    Based on due date and paid date comparison
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setMarkAsPaidModal({ isOpen: false, payment: null })}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleMarkAsPaidSubmit}
              disabled={!markAsPaidForm.method || submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? 'Processing...' : 'Mark as Paid'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Payment Modal */}
      <Dialog open={recordPaymentModal} onOpenChange={setRecordPaymentModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-green-600" />
              Record New Payment
            </DialogTitle>
            <DialogDescription>
              Create a new payment record for this lease agreement.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={recordPaymentForm.amount}
                  onChange={(e) => setRecordPaymentForm({ ...recordPaymentForm, amount: Number(e.target.value) })}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select 
                  value={recordPaymentForm.status} 
                  onValueChange={(value: 'PENDING' | 'PAID') => setRecordPaymentForm({ ...recordPaymentForm, status: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={recordPaymentForm.dueDate}
                  onChange={(e) => setRecordPaymentForm({ ...recordPaymentForm, dueDate: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paidAt">
                  Paid Date {recordPaymentForm.status === 'PAID' && '*'}
                </Label>
                <Input
                  id="paidAt"
                  type="date"
                  value={recordPaymentForm.paidAt}
                  onChange={(e) => setRecordPaymentForm({ ...recordPaymentForm, paidAt: e.target.value })}
                  disabled={recordPaymentForm.status === 'PENDING'}
                  required={recordPaymentForm.status === 'PAID'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="method">Payment Method *</Label>
                <Select 
                  value={recordPaymentForm.method} 
                  onValueChange={(value) => setRecordPaymentForm({ ...recordPaymentForm, method: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="GCASH">GCash</SelectItem>
                    <SelectItem value="PAYPAL">PayPal</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                    <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Payment Type *</Label>
                <Select 
                  value={recordPaymentForm.type} 
                  onValueChange={(value) => setRecordPaymentForm({ ...recordPaymentForm, type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RENT">Rent</SelectItem>
                    <SelectItem value="ADVANCE_PAYMENT">Advance Payment</SelectItem>
                    <SelectItem value="PENALTY">Penalty</SelectItem>
                    <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Timing Status Preview for Paid payments */}
            {recordPaymentForm.status === 'PAID' && recordPaymentForm.paidAt && (
              <div className="p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <Label className="text-sm font-medium">Timing Status:</Label>
                  <Badge variant={getTimingStatusVariant(calculateTimingStatus(recordPaymentForm.dueDate, recordPaymentForm.paidAt))}>
                    {calculateTimingStatus(recordPaymentForm.dueDate, recordPaymentForm.paidAt) || 'Not calculated'}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This will be automatically calculated based on due date and paid date
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRecordPaymentModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRecordPaymentSubmit}
              disabled={!recordPaymentForm.method || !recordPaymentForm.type || submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? 'Creating...' : 'Create Payment Record'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ViewSpecificLease;
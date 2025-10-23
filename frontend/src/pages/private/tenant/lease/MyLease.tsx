import { useState, useEffect, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
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
  Download,
  MessageCircle,
  PenTool,
  Signature,
  History,
  Archive
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
  };
  landlord: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
  };
}

const MyLease = () => {
  const [currentLease, setCurrentLease] = useState<Lease | null>(null);
  const [pendingLeases, setPendingLeases] = useState<Lease[]>([]);
  const [pastLeases, setPastLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const [activeTab, setActiveTab] = useState('current');

  const sigCanvas = useRef<SignatureCanvas>(null);

  // Mock data - Replace with actual API calls
  useEffect(() => {
    const fetchLeaseData = async () => {
      try {
        setLoading(true);
        
        // Mock current active lease
        const mockCurrentLease: Lease = {
          id: '1',
          propertyId: '1',
          unitId: '1',
          tenantId: '1',
          landlordId: '1',
          leaseNickname: 'My Sunset Apartment',
          leaseType: 'STANDARD',
          startDate: '2024-01-01T00:00:00.000Z',
          endDate: '2024-12-31T23:59:59.999Z',
          rentAmount: 1500,
          securityDeposit: 1500,
          advanceMonths: 1,
          interval: 'MONTHLY',
          dueDate: 5,
          status: 'ACTIVE',
          totalPaymentsMade: 11,
          lastPaymentDate: '2024-11-05T00:00:00.000Z',
          leaseDocumentUrl: 'https://example.com/lease.pdf',
          landlordSignatureUrl: 'https://example.com/landlord-sig.png',
          tenantSignatureUrl: 'https://example.com/tenant-sig.png',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-11-05T00:00:00.000Z',
          property: {
            id: '1',
            title: 'Sunset Apartments',
            type: 'APARTMENT',
            street: '123 Sunset Blvd',
            barangay: 'Barangay 1'
          },
          unit: {
            id: '1',
            label: 'A101'
          },
          landlord: {
            id: '1',
            firstName: 'Jane',
            lastName: 'Landlord',
            email: 'jane.landlord@email.com',
            phoneNumber: '+1234567890'
          }
        };

        // Mock pending lease invitations
        const mockPendingLeases: Lease[] = [
          {
            id: '2',
            propertyId: '2',
            unitId: '3',
            tenantId: '1',
            landlordId: '2',
            leaseNickname: null,
            leaseType: 'SHORT_TERM',
            startDate: '2024-12-15T00:00:00.000Z',
            endDate: '2025-03-15T23:59:59.999Z',
            rentAmount: 1200,
            securityDeposit: 1200,
            advanceMonths: 1,
            interval: 'MONTHLY',
            dueDate: 1,
            status: 'PENDING',
            totalPaymentsMade: 0,
            lastPaymentDate: null,
            leaseDocumentUrl: 'https://example.com/lease-pending.pdf',
            landlordSignatureUrl: 'https://example.com/landlord-sig.png',
            tenantSignatureUrl: null,
            createdAt: '2024-11-20T00:00:00.000Z',
            updatedAt: '2024-11-20T00:00:00.000Z',
            property: {
              id: '2',
              title: 'River View Complex',
              type: 'CONDOMINIUM',
              street: '456 River Street',
              barangay: 'Barangay 2'
            },
            unit: {
              id: '3',
              label: 'B201'
            },
            landlord: {
              id: '2',
              firstName: 'Mike',
              lastName: 'PropertyOwner',
              email: 'mike.owner@email.com',
              phoneNumber: '+1234567891'
            }
          }
        ];

        // Mock past leases
        const mockPastLeases: Lease[] = [
          {
            id: '3',
            propertyId: '3',
            unitId: '2',
            tenantId: '1',
            landlordId: '3',
            leaseNickname: 'Downtown Studio',
            leaseType: 'STANDARD',
            startDate: '2023-01-01T00:00:00.000Z',
            endDate: '2023-12-31T23:59:59.999Z',
            rentAmount: 1400,
            securityDeposit: 1400,
            advanceMonths: 1,
            interval: 'MONTHLY',
            dueDate: 1,
            status: 'COMPLETED',
            totalPaymentsMade: 12,
            lastPaymentDate: '2023-12-01T00:00:00.000Z',
            leaseDocumentUrl: 'https://example.com/lease-past.pdf',
            landlordSignatureUrl: 'https://example.com/landlord-sig.png',
            tenantSignatureUrl: 'https://example.com/tenant-sig.png',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-12-31T00:00:00.000Z',
            property: {
              id: '3',
              title: 'Downtown Towers',
              type: 'CONDOMINIUM',
              street: '789 Downtown Ave',
              barangay: 'Barangay 3'
            },
            unit: {
              id: '2',
              label: 'C301'
            },
            landlord: {
              id: '3',
              firstName: 'Sarah',
              lastName: 'BuildingManager',
              email: 'sarah.manager@email.com',
              phoneNumber: '+1234567892'
            }
          },
          {
            id: '4',
            propertyId: '4',
            unitId: '5',
            tenantId: '1',
            landlordId: '4',
            leaseNickname: 'Garden View Unit',
            leaseType: 'SHORT_TERM',
            startDate: '2022-06-01T00:00:00.000Z',
            endDate: '2022-08-31T23:59:59.999Z',
            rentAmount: 1100,
            securityDeposit: 1100,
            advanceMonths: 1,
            interval: 'MONTHLY',
            dueDate: 1,
            status: 'COMPLETED',
            totalPaymentsMade: 3,
            lastPaymentDate: '2022-08-01T00:00:00.000Z',
            leaseDocumentUrl: 'https://example.com/lease-garden.pdf',
            landlordSignatureUrl: 'https://example.com/landlord-sig.png',
            tenantSignatureUrl: 'https://example.com/tenant-sig.png',
            createdAt: '2022-06-01T00:00:00.000Z',
            updatedAt: '2022-08-31T00:00:00.000Z',
            property: {
              id: '4',
              title: 'Garden Apartments',
              type: 'APARTMENT',
              street: '321 Garden Street',
              barangay: 'Barangay 4'
            },
            unit: {
              id: '5',
              label: 'D101'
            },
            landlord: {
              id: '4',
              firstName: 'Robert',
              lastName: 'Green',
              email: 'robert.green@email.com',
              phoneNumber: '+1234567893'
            }
          }
        ];

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setCurrentLease(mockCurrentLease);
        setPendingLeases(mockPendingLeases);
        setPastLeases(mockPastLeases);
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

  const calculateLeaseProgress = (lease: Lease) => {
    const start = new Date(lease.startDate);
    const end = lease.endDate ? new Date(lease.endDate) : new Date();
    const now = new Date();
    
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  const getDaysUntilStart = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleViewLeaseDetails = (lease: Lease) => {
    // Navigate to lease details page or open modal
    console.log('View lease details:', lease.id);
  };

  const handleDownloadDocument = (leaseId: string) => {
    // Handle document download
    console.log('Download document for lease:', leaseId);
  };

  const handleContactLandlord = (landlordId: string) => {
    // Open chat with landlord
    console.log('Contact landlord:', landlordId);
  };

  const handleSignLease = (lease: Lease) => {
    setSelectedLease(lease);
    setShowSignatureModal(true);
  };

  const handleClearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };

  const handleSaveSignature = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty() && selectedLease) {
      const signatureData = sigCanvas.current.toDataURL();
      
      // Submit digital signature to backend
      console.log('Submitting digital signature for lease:', selectedLease.id);
      
      // Simulate API call
      setTimeout(() => {
        // Update local state to reflect signed lease
        const updatedPendingLeases = pendingLeases.map(lease => 
          lease.id === selectedLease.id 
            ? { ...lease, tenantSignatureUrl: signatureData, status: 'ACTIVE' as const }
            : lease
        );
        
        // Move signed lease to current lease if it's the first one
        if (!currentLease) {
          setCurrentLease({
            ...selectedLease,
            tenantSignatureUrl: signatureData,
            status: 'ACTIVE'
          });
        }
        
        setPendingLeases(updatedPendingLeases.filter(lease => lease.id !== selectedLease.id));
        setShowSignatureModal(false);
        setSelectedLease(null);
      }, 1000);
    }
  };

  const SignatureModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Signature className="w-6 h-6 text-blue-600" />
              Sign Lease Agreement
            </CardTitle>
            <CardDescription>
              Please provide your digital signature to accept the lease agreement for {selectedLease?.property.title} - {selectedLease?.unit.label}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                By signing this document, you agree to all terms and conditions outlined in the lease agreement.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Your Digital Signature</label>
              <div className="border-2 border-gray-300 rounded-lg bg-white">
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor="black"
                  canvasProps={{
                    width: 500,
                    height: 200,
                    className: 'w-full h-48 border-0 rounded-lg'
                  }}
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  Draw your signature in the box above
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleClearSignature}
                >
                  Clear Signature
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleSaveSignature}
                disabled={sigCanvas.current?.isEmpty()}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <PenTool className="w-4 h-4 mr-2" />
                Sign & Accept Lease
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowSignatureModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const CurrentLeaseCard = ({ lease }: { lease: Lease }) => (
    <Card className="shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-100 border-b">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <CardTitle className="flex items-center gap-3 text-2xl text-green-800">
              <CheckCircle className="w-7 h-7 text-green-600" />
              Current Active Lease
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
          {/* Property Information */}
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <Building className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Property</p>
                <p className="font-semibold text-lg">{lease.property.title}</p>
                <p className="text-sm text-gray-600">
                  {lease.property.street}, {lease.property.barangay}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Unit</p>
                <p className="font-semibold text-lg">{lease.unit.label}</p>
                <p className="text-sm text-gray-600">{lease.property.type}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-purple-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Landlord</p>
                <p className="font-semibold">
                  {lease.landlord.firstName} {lease.landlord.lastName}
                </p>
                <p className="text-sm text-gray-600">{lease.landlord.email}</p>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-6">
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-green-600 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Monthly Rent</p>
                <p className="font-semibold text-2xl text-green-600">
                  {formatCurrency(lease.rentAmount)}
                </p>
                <p className="text-sm text-gray-600">Due on {lease.dueDate}th of each month</p>
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
                <p className="text-sm text-gray-500">Payments Made</p>
                <p className="font-semibold">{lease.totalPaymentsMade} payments</p>
                <p className="text-sm text-gray-600">
                  Last payment: {lease.lastPaymentDate ? formatDate(lease.lastPaymentDate) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Lease Progress & Actions */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">Lease Progress</p>
              <Progress value={calculateLeaseProgress(lease)} className="h-2" />
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>{formatDate(lease.startDate)}</span>
                <span>{lease.endDate ? formatDate(lease.endDate) : 'Ongoing'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => handleViewLeaseDetails(lease)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Lease Details
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
              <h3 className="font-semibold text-lg">{lease.property.title}</h3>
              <p className="text-gray-600">Unit {lease.unit.label}</p>
            </div>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              <Clock className="w-3 h-3 mr-1" />
              Awaiting Signature
            </Badge>
          </div>

          {/* Lease Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Rent</p>
              <p className="font-semibold text-green-600">{formatCurrency(lease.rentAmount)}/mo</p>
            </div>
            <div>
              <p className="text-gray-500">Lease Type</p>
              <p className="font-semibold">{lease.leaseType.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-gray-500">Start Date</p>
              <p className="font-semibold">{formatDate(lease.startDate)}</p>
            </div>
            <div>
              <p className="text-gray-500">Duration</p>
              <p className="font-semibold">
                {lease.endDate ? `${getDaysUntilStart(lease.startDate)} days` : 'Flexible'}
              </p>
            </div>
          </div>

          {/* Landlord Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <User className="w-4 h-4 text-gray-600" />
            <div>
              <p className="text-sm font-medium">
                {lease.landlord.firstName} {lease.landlord.lastName}
              </p>
              <p className="text-xs text-gray-600">Landlord</p>
            </div>
          </div>

          {/* Signature Status */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <Signature className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700">Digital Signature Required</span>
              </div>
              {lease.landlordSignatureUrl ? (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Landlord Signed
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-50 text-amber-700">
                  Waiting Landlord
                </Badge>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              variant="outline"
              className="flex-1"
              onClick={() => handleViewLeaseDetails(lease)}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            <Button 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              onClick={() => handleSignLease(lease)}
            >
              <PenTool className="w-4 h-4 mr-2" />
              Sign Now
            </Button>
          </div>

          {/* Additional Actions */}
          <div className="flex gap-2">
            {lease.leaseDocumentUrl && (
              <Button 
                variant="ghost" 
                size="sm"
                className="flex-1"
                onClick={() => handleDownloadDocument(lease.id)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              className="flex-1"
              onClick={() => handleContactLandlord(lease.landlord.id)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact
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
              <h3 className="font-semibold text-lg">{lease.property.title}</h3>
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
              <p className="text-gray-500">Rent</p>
              <p className="font-semibold text-green-600">{formatCurrency(lease.rentAmount)}/mo</p>
            </div>
            <div>
              <p className="text-gray-500">Lease Type</p>
              <p className="font-semibold">{lease.leaseType.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-gray-500">Duration</p>
              <p className="font-semibold">
                {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Payments Made</p>
              <p className="font-semibold">{lease.totalPaymentsMade}</p>
            </div>
          </div>

          {/* Landlord Info */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <User className="w-4 h-4 text-gray-600" />
            <div>
              <p className="text-sm font-medium">
                {lease.landlord.firstName} {lease.landlord.lastName}
              </p>
              <p className="text-xs text-gray-600">Landlord</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleViewLeaseDetails(lease)}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            {lease.leaseDocumentUrl && (
              <Button 
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleDownloadDocument(lease.id)}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
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
      {/* Signature Modal */}
      {showSignatureModal && <SignatureModal />}

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
                  <Button variant="outline">
                    Browse Properties
                  </Button>
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
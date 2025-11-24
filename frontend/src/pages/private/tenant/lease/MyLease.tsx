  import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, 
  Home, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  User,
  MapPin,
  Building,
  Eye,
  MessageCircle,
  History,
  Archive,
  ScrollText,
  Sparkles,
  ShieldCheck
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

// Complete Color Schema for Lease Statuses
const LEASE_STATUS_THEME = {
  PENDING: {
    // Badge & Pill
    badge: "bg-amber-50 border border-amber-200 text-amber-700",
    pill: "bg-amber-100 text-amber-800",
    
    // Gradients
    gradient: "from-amber-500 to-orange-500",
    gradientLight: "from-amber-200/70 via-amber-100/50 to-amber-200/70",
    gradientButton: "from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700",
    
    // Backgrounds
    background: "bg-amber-50 border-amber-300",
    backgroundCard: "bg-gradient-to-br from-amber-50 to-orange-50",
    
    // Icon & Text
    iconBackground: "bg-amber-500",
    textColor: "text-amber-700",
    textColorDark: "text-amber-900",
    textColorLight: "text-amber-600",
    
    // Blur Effects
    blurLight: "bg-amber-200/40",
    blurDark: "bg-amber-300/40",
    
    // Borders
    border: "border-amber-200",
    borderDark: "border-amber-300",
    borderCard: "border-2 border-amber-300",
    
    // Timeline (if needed)
    timelineActive: "bg-amber-500 ring-4 ring-amber-200",
    timelineCompleted: "bg-amber-500",
    timelineLine: "bg-amber-300",
  },
  ACTIVE: {
    // Badge & Pill
    badge: "bg-emerald-50 border border-emerald-200 text-emerald-700",
    pill: "bg-emerald-100 text-emerald-800",
    
    // Gradients
    gradient: "from-emerald-500 to-teal-500",
    gradientLight: "from-emerald-200/70 via-emerald-100/50 to-emerald-200/70",
    gradientButton: "from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700",
    
    // Backgrounds
    background: "bg-emerald-50 border-emerald-300",
    backgroundCard: "bg-gradient-to-br from-emerald-50 to-teal-50",
    
    // Icon & Text
    iconBackground: "bg-emerald-500",
    textColor: "text-emerald-700",
    textColorDark: "text-emerald-900",
    textColorLight: "text-emerald-600",
    
    // Blur Effects
    blurLight: "bg-emerald-200/40",
    blurDark: "bg-emerald-300/40",
    
    // Borders
    border: "border-emerald-200",
    borderDark: "border-emerald-300",
    borderCard: "border-2 border-emerald-300",
    
    // Timeline (if needed)
    timelineActive: "bg-emerald-500 ring-4 ring-emerald-200",
    timelineCompleted: "bg-emerald-500",
    timelineLine: "bg-emerald-300",
  },
  COMPLETED: {
    // Badge & Pill
    badge: "bg-blue-50 border border-blue-200 text-blue-700",
    pill: "bg-blue-100 text-blue-800",
    
    // Gradients
    gradient: "from-blue-600 to-indigo-600",
    gradientLight: "from-blue-200/70 via-blue-100/50 to-blue-200/70",
    gradientButton: "from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700",
    
    // Backgrounds
    background: "bg-blue-50 border-blue-300",
    backgroundCard: "bg-gradient-to-br from-blue-50 to-cyan-50",
    
    // Icon & Text
    iconBackground: "bg-blue-500",
    textColor: "text-blue-700",
    textColorDark: "text-blue-900",
    textColorLight: "text-blue-600",
    
    // Blur Effects
    blurLight: "bg-blue-200/40",
    blurDark: "bg-blue-300/40",
    
    // Borders
    border: "border-blue-200",
    borderDark: "border-blue-300",
    borderCard: "border-2 border-blue-300",
    
    // Timeline (if needed)
    timelineActive: "bg-blue-500 ring-4 ring-blue-200",
    timelineCompleted: "bg-blue-500",
    timelineLine: "bg-blue-300",
  },
  TERMINATED: {
    // Badge & Pill
    badge: "bg-rose-50 border border-rose-200 text-rose-700",
    pill: "bg-rose-100 text-rose-800",
    
    // Gradients
    gradient: "from-rose-500 to-red-500",
    gradientLight: "from-rose-200/70 via-rose-100/50 to-rose-200/70",
    gradientButton: "from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700",
    
    // Backgrounds
    background: "bg-rose-50 border-rose-300",
    backgroundCard: "bg-gradient-to-br from-rose-50 to-red-50",
    
    // Icon & Text
    iconBackground: "bg-rose-500",
    textColor: "text-rose-700",
    textColorDark: "text-rose-900",
    textColorLight: "text-rose-600",
    
    // Blur Effects
    blurLight: "bg-rose-200/40",
    blurDark: "bg-rose-300/40",
    
    // Borders
    border: "border-rose-200",
    borderDark: "border-rose-300",
    borderCard: "border-2 border-rose-300",
    
    // Timeline (if needed)
    timelineActive: "bg-rose-500 ring-4 ring-rose-200",
    timelineCompleted: "bg-rose-500",
    timelineLine: "bg-rose-300",
  },
  CANCELLED: {
    // Badge & Pill
    badge: "bg-slate-50 border border-slate-200 text-slate-700",
    pill: "bg-slate-100 text-slate-700",
    
    // Gradients
    gradient: "from-slate-500 to-gray-500",
    gradientLight: "from-slate-200/70 via-slate-100/50 to-slate-200/70",
    gradientButton: "from-slate-600 to-gray-600 hover:from-slate-700 hover:to-gray-700",
    
    // Backgrounds
    background: "bg-slate-50 border-slate-300",
    backgroundCard: "bg-gradient-to-br from-slate-50 to-gray-50",
    
    // Icon & Text
    iconBackground: "bg-slate-500",
    textColor: "text-slate-700",
    textColorDark: "text-slate-900",
    textColorLight: "text-slate-600",
    
    // Blur Effects
    blurLight: "bg-slate-200/40",
    blurDark: "bg-slate-300/40",
    
    // Borders
    border: "border-slate-200",
    borderDark: "border-slate-300",
    borderCard: "border-2 border-slate-300",
    
    // Timeline (if needed)
    timelineActive: "bg-slate-500 ring-4 ring-slate-200",
    timelineCompleted: "bg-slate-500",
    timelineLine: "bg-slate-300",
  },
} as const;

const MyLease = () => {
  const [currentLeases, setCurrentLeases] = useState<Lease[]>([]);
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
        const active = leases.filter(lease => lease.status === 'ACTIVE');
        const pending = leases.filter(lease => lease.status === 'PENDING');
        const past = leases.filter(lease => 
          ['COMPLETED', 'TERMINATED', 'CANCELLED'].includes(lease.status)
        );

        setCurrentLeases(active);
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

  const calculateLeaseDuration = (startDate: string, endDate: string | null) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Calculate months
    const months = Math.floor(diffDays / 30);
    const remainingDays = diffDays % 30;
    
    if (months > 0) {
      if (remainingDays === 0) {
        return `${months} ${months === 1 ? 'month' : 'months'}`;
      }
      return `${months} ${months === 1 ? 'month' : 'months'} ${remainingDays} ${remainingDays === 1 ? 'day' : 'days'}`;
    }
    
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'}`;
  };

  const handleViewLeaseDetails = (leaseId: string) => {
    navigate(`/tenant/my-lease/${leaseId}/details`);
  };

  const handleContactLandlord = () => {
    navigate('/tenant/messages');
  };

  const CurrentLeaseCard = ({ lease }: { lease: Lease }) => {
    const theme = LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME] || LEASE_STATUS_THEME.ACTIVE;
    
    return (
    <Card className={`shadow-lg ${theme.borderCard} overflow-hidden backdrop-blur-sm ${theme.backgroundCard}`}>
      <CardHeader className={`relative bg-gradient-to-r ${theme.gradient}/10 ${theme.border} border-b p-4 sm:p-5 overflow-hidden`}>
        <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient}/5 opacity-60`} />
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className={`flex items-center gap-2 sm:gap-3 text-lg sm:text-xl ${theme.textColorDark}`}>
              <div className={`p-1.5 rounded-lg ${theme.iconBackground} text-white border ${theme.border}`}>
                {getStatusIcon(lease.status)}
              </div>
              <span className="truncate">{lease.leaseNickname || `${lease.property.title} - ${lease.unit.label}`}</span>
            </CardTitle>
            <CardDescription className={`${theme.textColorLight} mt-1.5 text-xs sm:text-sm`}>
              {lease.property.title} - {lease.unit.label}
            </CardDescription>
          </div>
          <Badge 
            className={`${theme.badge} text-xs sm:text-sm px-2 sm:px-3 py-1 flex items-center gap-1 font-semibold flex-shrink-0 border shadow-sm`}
          >
            {getStatusIcon(lease.status)}
            {lease.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Property & Unit Information */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <Building className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-500">Property</p>
                <p className="font-semibold text-base sm:text-lg truncate">{lease.property.title}</p>
                <p className="text-xs sm:text-sm text-gray-600 break-words">
                  {lease.property.street}, {lease.property.barangay}, {lease.property.city.name}
                  {lease.property.municipality && `, ${lease.property.municipality}`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-1 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-500">Unit</p>
                <p className="font-semibold text-base sm:text-lg">{lease.unit.label}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mt-1 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-500">Landlord</p>
                <div className="flex items-center gap-2 mb-1">
                  {lease.landlord.avatarUrl && (
                    <img 
                      src={lease.landlord.avatarUrl} 
                      alt={`${lease.landlord.firstName} ${lease.landlord.lastName}`}
                      className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0"
                    />
                  )}
                  <p className="font-semibold text-sm sm:text-base truncate">
                    {lease.landlord.firstName} {lease.landlord.lastName}
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 truncate">{lease.landlord.email}</p>
                <p className="text-xs sm:text-sm text-gray-600">{lease.landlord.phoneNumber}</p>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-1 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-500">Rent Amount</p>
                <p className="font-semibold text-xl sm:text-2xl text-green-600">
                  {formatCurrency(lease.rentAmount)}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  {lease.interval.toLowerCase()} • Due on {lease.dueDate}th
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-500">Security Deposit</p>
                <p className="font-semibold text-sm sm:text-base">
                  {lease.securityDeposit ? formatCurrency(lease.securityDeposit) : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mt-1 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-500">Lease Type</p>
                <p className="font-semibold text-sm sm:text-base">{lease.leaseType.replace('_', ' ')}</p>
                <p className="text-xs sm:text-sm text-gray-600">
                  Created: {formatDate(lease.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Lease Duration & Actions */}
          <div className="space-y-4 sm:space-y-6">
            <div>
              <p className="text-xs sm:text-sm text-gray-500 mb-2">Lease Duration</p>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex justify-between items-center text-xs sm:text-sm gap-2">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-semibold text-right break-words">{formatDate(lease.startDate)}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm gap-2">
                  <span className="text-gray-600">End Date:</span>
                  <span className="font-semibold text-right break-words">{lease.endDate ? formatDate(lease.endDate) : 'Ongoing'}</span>
                </div>
                <div className="flex justify-between items-center text-xs sm:text-sm pt-1 border-t border-gray-200 gap-2">
                  <span className="text-gray-600">Total Duration:</span>
                  <span className="font-semibold text-teal-600 text-right">
                    {calculateLeaseDuration(lease.startDate, lease.endDate)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs sm:text-sm text-gray-500 mb-2">Lease Progress</p>
              <Progress value={calculateLeaseProgress(lease)} className="h-1.5 sm:h-2" />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <Button 
                className={`w-full bg-gradient-to-r ${theme.gradientButton} text-white shadow-md shadow-blue-500/20 text-sm sm:text-base backdrop-blur-sm border border-white/20 transition-opacity`}
                onClick={() => handleViewLeaseDetails(lease.id)}
              >
                <Eye className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">View Lease Details</span>
                <span className="sm:hidden">View Details</span>
              </Button>
              <Button 
                variant="outline"
                className="w-full border-amber-200 text-amber-700 hover:bg-amber-50/80 hover:border-amber-300 hover:text-amber-800 text-sm sm:text-base bg-amber-50/30 backdrop-blur-sm"
                onClick={handleContactLandlord}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Contact Landlord</span>
                <span className="sm:hidden">Contact</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    );
  };

  const PendingLeaseCard = ({ lease }: { lease: Lease }) => {
    const theme = LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME] || LEASE_STATUS_THEME.PENDING;
    
    return (
    <Card className={`overflow-hidden ${theme.borderCard} shadow-md backdrop-blur-sm ${theme.backgroundCard}`}>
      <div className={`relative bg-gradient-to-r ${theme.gradient}/10 ${theme.border} border-b p-3 sm:p-4 overflow-hidden`}>
        <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient}/5 opacity-60`} />
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className={`p-1 rounded-lg ${theme.iconBackground} text-white border ${theme.border}`}>
              {getStatusIcon(lease.status)}
            </div>
            <h3 className={`font-semibold text-sm sm:text-base ${theme.textColorDark} truncate`}>
              {lease.leaseNickname || `${lease.property.title} - ${lease.unit.label}`}
            </h3>
          </div>
          <Badge className={`${theme.badge} text-xs px-2 py-0.5 font-semibold flex-shrink-0 border shadow-sm`}>
            {getStatusIcon(lease.status)}
            {lease.status}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-2 sm:gap-0">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg truncate">
                {lease.leaseNickname || `${lease.property.title} - ${lease.unit.label}`}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base truncate">{lease.property.title} - {lease.unit.label}</p>
            </div>
          </div>

          {/* Lease Details */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
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
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <span className="text-xs font-semibold text-teal-600">
                    {calculateLeaseDuration(lease.startDate, lease.endDate)}
                  </span>
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
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button 
              variant="outline"
              className="flex-1 border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300 text-sm sm:text-base"
              onClick={() => handleViewLeaseDetails(lease.id)}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            <Button 
              variant="outline"
              className="flex-1 border-amber-200 text-amber-700 hover:bg-amber-50/80 hover:border-amber-300 hover:text-amber-800 text-sm sm:text-base bg-amber-50/30 backdrop-blur-sm"
              onClick={handleContactLandlord}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Contact Landlord</span>
              <span className="sm:hidden">Contact</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    );
  };

  const PastLeaseCard = ({ lease }: { lease: Lease }) => {
    const theme = LEASE_STATUS_THEME[lease.status as keyof typeof LEASE_STATUS_THEME] || LEASE_STATUS_THEME.CANCELLED;
    
    return (
    <Card className={`overflow-hidden ${theme.borderCard} shadow-md backdrop-blur-sm ${theme.backgroundCard}`}>
      <div className={`relative bg-gradient-to-r ${theme.gradient}/10 ${theme.border} border-b p-3 sm:p-4 overflow-hidden`}>
        <div className={`absolute inset-0 bg-gradient-to-r ${theme.gradient}/5 opacity-60`} />
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className={`p-1 rounded-lg ${theme.iconBackground} text-white border ${theme.border}`}>
              {getStatusIcon(lease.status)}
            </div>
            <h3 className={`font-semibold text-sm sm:text-base ${theme.textColorDark} truncate`}>
              {lease.leaseNickname || `${lease.property.title} - ${lease.unit.label}`}
            </h3>
          </div>
          <Badge className={`${theme.badge} text-xs px-2 py-0.5 font-semibold flex-shrink-0 border shadow-sm`}>
            {getStatusIcon(lease.status)}
            {lease.status}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-2 sm:gap-0">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg truncate">
                {lease.leaseNickname || `${lease.property.title} - ${lease.unit.label}`}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">Unit {lease.unit.label}</p>
            </div>
          </div>

          {/* Lease Details */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
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
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <span className="text-xs font-semibold text-teal-600">
                    {calculateLeaseDuration(lease.startDate, lease.endDate)}
                  </span>
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
              className="flex-1 border-teal-200 text-teal-700 hover:bg-teal-50 hover:border-teal-300 text-sm sm:text-base"
              onClick={() => handleViewLeaseDetails(lease.id)}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-slate-300 text-slate-700 hover:bg-slate-100/80 hover:border-slate-400 hover:text-slate-800 bg-slate-50/40 backdrop-blur-sm sm:flex-shrink-0"
              onClick={handleContactLandlord}
            >
              <MessageCircle className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Contact</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-teal-200/80 via-cyan-200/70 to-emerald-200/70 opacity-95" />
            <div className="relative m-[1px] rounded-[16px] bg-white/85 backdrop-blur-lg border border-white/60 shadow-lg p-5">
              <div className="flex items-center gap-4">
                <Skeleton className="h-11 w-11 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-7 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
              <Skeleton className="h-1 w-full rounded-full mt-4" />
            </div>
          </div>

          {/* Main Content Skeleton */}
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="p-4">
              {/* Tabs Skeleton */}
              <div className="flex gap-2 mb-6">
                <Skeleton className="h-10 w-32 rounded-xl" />
                <Skeleton className="h-10 w-32 rounded-xl" />
                <Skeleton className="h-10 w-32 rounded-xl" />
              </div>

              {/* Content Skeleton */}
              <div className="space-y-4">
                <Skeleton className="h-64 w-full rounded-lg" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <Skeleton className="h-32 rounded-lg" />
                  <Skeleton className="h-32 rounded-lg" />
                  <Skeleton className="h-32 rounded-lg" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-teal-200/80 via-cyan-200/70 to-emerald-200/70 opacity-95" />
          <div className="relative m-[1px] rounded-[16px] bg-white/85 backdrop-blur-lg border border-white/60 shadow-lg">
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -top-12 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-teal-300/50 to-cyan-400/40 blur-3xl"
              initial={{ opacity: 0.4, scale: 0.85 }}
              animate={{ opacity: 0.7, scale: 1.05 }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-tl from-emerald-200/40 to-cyan-200/35 blur-3xl"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 3.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            />

            <div className="px-4 sm:px-6 py-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: [0, -3, 3, 0] }}
                    className="relative flex-shrink-0"
                  >
                    <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-600 text-white grid place-items-center shadow-xl shadow-cyan-500/30">
                      <ScrollText className="h-5 w-5 relative z-10" />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                    </div>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 220 }}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white text-teal-600 border border-teal-100 shadow-sm grid place-items-center"
                    >
                      <ShieldCheck className="h-3 w-3" />
                    </motion.div>
                    <motion.div
                      className="absolute inset-0 rounded-2xl border-2 border-cyan-400/30"
                      animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 truncate">
                        My Lease
                      </h1>
                      <motion.div
                        animate={{ rotate: [0, 8, -8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Sparkles className="h-4 w-4 text-teal-500" />
                      </motion.div>
                    </div>
                    <p className="text-sm text-slate-600 leading-6 flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-cyan-500" />
                      Manage your current lease and review pending agreements
                    </p>
                  </div>
                </div>
              </div>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
                style={{ originX: 0 }}
                className="relative h-1 w-full rounded-full overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400/80 via-cyan-400/80 to-emerald-400/80" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Creative Tabs with Color Scheme - Transparent Gradients */}
              <div className="border-b bg-gradient-to-br from-slate-50/80 via-gray-50/60 to-slate-50/80 backdrop-blur-sm">
                <TabsList className="w-full h-auto bg-transparent p-2 sm:p-3 gap-2 grid grid-cols-3">
                  <TabsTrigger 
                    value="current" 
                    className={`relative flex-1 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-medium transition-all overflow-hidden ${
                      activeTab === 'current' 
                        ? `bg-gradient-to-r from-emerald-500 to-teal-500/20 text-emerald-700 border border-emerald-200/50 shadow-sm backdrop-blur-sm` 
                        : `bg-gray-50/50 border border-gray-200 text-gray-600 hover:bg-gray-100/50`
                    }`}
                  >
                    {activeTab === 'current' && (
                      <div className={`absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500/10 opacity-50`} />
                    )}
                    <CheckCircle className={`w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 ${activeTab === 'current' ? 'text-emerald-700' : 'text-gray-500'}`} />
                    <span className="relative z-10 hidden sm:inline">Current</span>
                    <span className="relative z-10 sm:hidden">Current</span>
                    {currentLeases.length > 0 && (
                      <Badge className={`ml-1 text-xs px-1.5 py-0 relative z-10 ${
                        activeTab === 'current' 
                          ? `bg-emerald-100 text-emerald-800 border border-emerald-200/50` 
                          : `bg-gray-100 text-gray-700`
                      }`}>
                        {currentLeases.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="pending" 
                    className={`relative flex-1 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-medium transition-all overflow-hidden ${
                      activeTab === 'pending' 
                        ? `bg-gradient-to-r from-emerald-500 to-teal-500/20 text-emerald-700 border border-emerald-200/50 shadow-sm backdrop-blur-sm` 
                        : `bg-gray-50/50 border border-gray-200 text-gray-600 hover:bg-gray-100/50`
                    }`}
                  >
                    {activeTab === 'pending' && (
                      <div className={`absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500/10 opacity-50`} />
                    )}
                    <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 ${activeTab === 'pending' ? 'text-emerald-700' : 'text-gray-500'}`} />
                    <span className="relative z-10">Pending</span>
                    {pendingLeases.length > 0 && (
                      <Badge className={`ml-1 text-xs px-1.5 py-0 relative z-10 ${
                        activeTab === 'pending' 
                          ? `bg-emerald-100 text-emerald-800 border border-emerald-200/50` 
                          : `bg-gray-100 text-gray-700`
                      }`}>
                        {pendingLeases.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="past" 
                    className={`relative flex-1 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-medium transition-all overflow-hidden ${
                      activeTab === 'past' 
                        ? `bg-gradient-to-r from-emerald-500 to-teal-500/20 text-emerald-700 border border-emerald-200/50 shadow-sm backdrop-blur-sm` 
                        : `bg-gray-50/50 border border-gray-200 text-gray-600 hover:bg-gray-100/50`
                    }`}
                  >
                    {activeTab === 'past' && (
                      <div className={`absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500/10 opacity-50`} />
                    )}
                    <Archive className={`w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 ${activeTab === 'past' ? 'text-emerald-700' : 'text-gray-500'}`} />
                    <span className="relative z-10">Past</span>
                    {pastLeases.length > 0 && (
                      <Badge className={`ml-1 text-xs px-1.5 py-0 relative z-10 ${
                        activeTab === 'past' 
                          ? `bg-emerald-100 text-emerald-800 border border-emerald-200/50` 
                          : `bg-gray-100 text-gray-700`
                      }`}>
                        {pastLeases.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Current Lease Tab */}
              <TabsContent value="current" className="m-0 p-3 sm:p-4">
                {currentLeases.length > 0 ? (
                  <div className="space-y-4 sm:space-y-6">
                    {currentLeases.map((lease) => (
                      <CurrentLeaseCard key={lease.id} lease={lease} />
                    ))}
                  </div>
                ) : (
                  <Card className="border-0 shadow-none">
                    <CardContent className="p-6 sm:p-8 text-center">
                      <Home className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                      <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">No Active Lease</h3>
                      <p className="text-sm text-gray-500 mb-4 sm:mb-6">
                        You don't have an active lease agreement at the moment.
                      </p>
                      <Button variant="outline" size="sm">
                        Browse Properties
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Pending Leases Tab */}
              <TabsContent value="pending" className="m-0 p-3 sm:p-4">
                {pendingLeases.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {pendingLeases.map((lease) => (
                      <PendingLeaseCard key={lease.id} lease={lease} />
                    ))}
                  </div>
                ) : (
                  <Card className="border-0 shadow-none">
                    <CardContent className="p-6 sm:p-8 text-center">
                      <FileText className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                      <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">No Pending Leases</h3>
                      <p className="text-sm text-gray-500">
                        You don't have any pending lease agreements at the moment.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Past Leases Tab */}
              <TabsContent value="past" className="m-0 p-3 sm:p-4">
                {pastLeases.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {pastLeases.map((lease) => (
                      <PastLeaseCard key={lease.id} lease={lease} />
                    ))}
                  </div>
                ) : (
                  <Card className="border-0 shadow-none">
                    <CardContent className="p-6 sm:p-8 text-center">
                      <History className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                      <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">No Past Leases</h3>
                      <p className="text-sm text-gray-500">
                        You don't have any past lease agreements.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyLease;
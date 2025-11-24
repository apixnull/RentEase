import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, CheckCircle, XCircle, Clock, User, AlertCircle, ArrowRight, Archive, ChevronUp, ChevronDown } from 'lucide-react';
import { getTenantScreeningInvitationsRequest } from '@/api/tenant/screeningApi';
import ScreeningHeader from '@/components/ScreeningHeader';
import { Skeleton } from '@/components/ui/skeleton';

// Types based on API response
interface Landlord {
  id: string;
  name: string;
  email: string;
  role?: string | null;
  avatarUrl: string | null;
}

interface ScreeningInvitation {
  id: string;
  landlord: Landlord;
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'; 
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
}

// Complete Color Schema for Screening Statuses
const SCREENING_STATUS_THEME = {
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
  SUBMITTED: {
    // Badge & Pill
    badge: "bg-indigo-50 border border-indigo-200 text-indigo-700",
    pill: "bg-indigo-100 text-indigo-800",
    
    // Gradients
    gradient: "from-indigo-600 to-blue-600",
    gradientLight: "from-indigo-200/70 via-indigo-100/50 to-indigo-200/70",
    gradientButton: "from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700",
    
    // Backgrounds
    background: "bg-indigo-50 border-indigo-300",
    backgroundCard: "bg-gradient-to-br from-indigo-50 to-blue-50",
    
    // Icon & Text
    iconBackground: "bg-indigo-500",
    textColor: "text-indigo-700",
    textColorDark: "text-indigo-900",
    textColorLight: "text-indigo-600",
    
    // Blur Effects
    blurLight: "bg-indigo-200/40",
    blurDark: "bg-indigo-300/40",
    
    // Borders
    border: "border-indigo-200",
    borderDark: "border-indigo-300",
    borderCard: "border-2 border-indigo-300",
    
    // Timeline (if needed)
    timelineActive: "bg-indigo-500 ring-4 ring-indigo-200",
    timelineCompleted: "bg-indigo-500",
    timelineLine: "bg-indigo-300",
  },
  APPROVED: {
    // Badge & Pill
    badge: "bg-emerald-50 border border-emerald-200 text-emerald-700",
    pill: "bg-emerald-100 text-emerald-800",
    
    // Gradients
    gradient: "from-emerald-500 to-green-500",
    gradientLight: "from-emerald-200/70 via-emerald-100/50 to-emerald-200/70",
    gradientButton: "from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700",
    
    // Backgrounds
    background: "bg-emerald-50 border-emerald-300",
    backgroundCard: "bg-gradient-to-br from-emerald-50 to-green-50",
    
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
  REJECTED: {
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
} as const;

const TenantScreeningTenant = () => {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<ScreeningInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [invitationToAccept, setInvitationToAccept] = useState<ScreeningInvitation | null>(null);
  const [activeTab, setActiveTab] = useState('current');
  const [statsExpanded, setStatsExpanded] = useState(true);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTenantScreeningInvitationsRequest();
      setInvitations(response.data.data);
    } catch (err) {
      setError('Failed to fetch screening invitations');
      console.error('Error fetching invitations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = (invitation: ScreeningInvitation) => {
    setAcceptDialogOpen(false);
    setInvitationToAccept(null);
    navigate(`/tenant/screening/${invitation.id}/fill`);
  };

  const handleOpenAcceptDialog = (invitation: ScreeningInvitation) => {
    setInvitationToAccept(invitation);
    setAcceptDialogOpen(true);
  };

  const handleViewDetails = (invitation: ScreeningInvitation) => {
    navigate(`/tenant/screening/${invitation.id}/details`);
  };

  const isOlderThanOneWeek = (dateString: string) => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return new Date(dateString) < oneWeekAgo;
  };

  // Separate invitations into current and past
  const currentInvitations = invitations.filter(inv => !isOlderThanOneWeek(inv.createdAt));
  const pastInvitations = invitations.filter(inv => isOlderThanOneWeek(inv.createdAt));

  // Stats for the cards
  const stats = {
    pending: invitations.filter(inv => inv.status === 'PENDING').length,
    submitted: invitations.filter(inv => inv.status === 'SUBMITTED').length,
    approved: invitations.filter(inv => inv.status === 'APPROVED').length,
    rejected: invitations.filter(inv => inv.status === 'REJECTED').length,
    total: invitations.length
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* Header Skeleton */}
          <div className="relative overflow-hidden rounded-2xl">
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-3">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-10" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {/* Tabs Skeleton */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <Skeleton className="h-8 w-16 rounded" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <Card className="w-full max-w-md mx-2 sm:mx-auto">
          <CardContent className="p-4 sm:p-6 text-center">
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-500 mx-auto mb-2 sm:mb-3" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">Error Loading Invitations</h3>
            <p className="text-gray-600 text-xs sm:text-sm mb-4">{error}</p>
            <Button onClick={fetchInvitations} size="sm" className="text-xs sm:text-sm">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header - same style as landlord screening but without actions */}
        <ScreeningHeader
          title="Tenant Screening"
          description="Manage your screening invitations from landlords"
        />

        {/* Stats Cards - shrinkable and responsive */}
        <Card className="shadow-sm border border-gray-200">
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900">Screening Statistics</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatsExpanded(!statsExpanded)}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              {statsExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </Button>
          </div>
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              statsExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="p-3 sm:p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                {/* PENDING Status Card */}
                <Card className={`${SCREENING_STATUS_THEME.PENDING.backgroundCard} ${SCREENING_STATUS_THEME.PENDING.border} hover:border-amber-300 transition-colors duration-200 cursor-default`}>
                  <CardContent className="p-2 sm:p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className={`text-[9px] sm:text-[10px] font-medium ${SCREENING_STATUS_THEME.PENDING.textColor} uppercase tracking-wide truncate`}>Pending</p>
                        <h3 className={`text-base sm:text-lg font-bold ${SCREENING_STATUS_THEME.PENDING.textColorDark} mt-0.5 truncate`}>{stats.pending}</h3>
                      </div>
                      <div className={`${SCREENING_STATUS_THEME.PENDING.iconBackground} text-white p-1 sm:p-1.5 rounded-lg flex-shrink-0`}>
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* SUBMITTED Status Card */}
                <Card className={`${SCREENING_STATUS_THEME.SUBMITTED.backgroundCard} ${SCREENING_STATUS_THEME.SUBMITTED.border} hover:border-indigo-300 transition-colors duration-200 cursor-default`}>
                  <CardContent className="p-2 sm:p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className={`text-[9px] sm:text-[10px] font-medium ${SCREENING_STATUS_THEME.SUBMITTED.textColor} uppercase tracking-wide truncate`}>Submitted</p>
                        <h3 className={`text-base sm:text-lg font-bold ${SCREENING_STATUS_THEME.SUBMITTED.textColorDark} mt-0.5 truncate`}>{stats.submitted}</h3>
                      </div>
                      <div className={`${SCREENING_STATUS_THEME.SUBMITTED.iconBackground} text-white p-1 sm:p-1.5 rounded-lg flex-shrink-0`}>
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* APPROVED Status Card */}
                <Card className={`${SCREENING_STATUS_THEME.APPROVED.backgroundCard} ${SCREENING_STATUS_THEME.APPROVED.border} hover:border-emerald-300 transition-colors duration-200 cursor-default`}>
                  <CardContent className="p-2 sm:p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className={`text-[9px] sm:text-[10px] font-medium ${SCREENING_STATUS_THEME.APPROVED.textColor} uppercase tracking-wide truncate`}>Approved</p>
                        <h3 className={`text-base sm:text-lg font-bold ${SCREENING_STATUS_THEME.APPROVED.textColorDark} mt-0.5 truncate`}>{stats.approved}</h3>
                      </div>
                      <div className={`${SCREENING_STATUS_THEME.APPROVED.iconBackground} text-white p-1 sm:p-1.5 rounded-lg flex-shrink-0`}>
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* REJECTED Status Card */}
                <Card className={`${SCREENING_STATUS_THEME.REJECTED.backgroundCard} ${SCREENING_STATUS_THEME.REJECTED.border} hover:border-rose-300 transition-colors duration-200 cursor-default`}>
                  <CardContent className="p-2 sm:p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className={`text-[9px] sm:text-[10px] font-medium ${SCREENING_STATUS_THEME.REJECTED.textColor} uppercase tracking-wide truncate`}>Rejected</p>
                        <h3 className={`text-base sm:text-lg font-bold ${SCREENING_STATUS_THEME.REJECTED.textColorDark} mt-0.5 truncate`}>{stats.rejected}</h3>
                      </div>
                      <div className={`${SCREENING_STATUS_THEME.REJECTED.iconBackground} text-white p-1 sm:p-1.5 rounded-lg flex-shrink-0`}>
                        <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs for Current and Past Invitations */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              {/* Creative Tabs with Color Scheme - Transparent Gradients */}
              <div className="border-b bg-gradient-to-br from-slate-50/80 via-gray-50/60 to-slate-50/80 backdrop-blur-sm">
                <TabsList className="w-full h-auto bg-transparent p-2 sm:p-3 gap-2 grid grid-cols-2">
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
                    <FileText className={`w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 ${activeTab === 'current' ? 'text-emerald-700' : 'text-gray-500'}`} />
                    <span className="relative z-10 hidden sm:inline">Current</span>
                    <span className="relative z-10 sm:hidden">Current</span>
                    {currentInvitations.length > 0 && (
                      <Badge className={`ml-1 text-xs px-1.5 py-0 relative z-10 ${
                        activeTab === 'current' 
                          ? `bg-emerald-100 text-emerald-800 border border-emerald-200/50` 
                          : `bg-gray-100 text-gray-700`
                      }`}>
                        {currentInvitations.length}
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
                    {pastInvitations.length > 0 && (
                      <Badge className={`ml-1 text-xs px-1.5 py-0 relative z-10 ${
                        activeTab === 'past' 
                          ? `bg-emerald-100 text-emerald-800 border border-emerald-200/50` 
                          : `bg-gray-100 text-gray-700`
                      }`}>
                        {pastInvitations.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Current Invitations Tab */}
              <TabsContent value="current" className="m-0 p-3 sm:p-4">
                {currentInvitations.length === 0 ? (
                  <Card className="border-0 shadow-none">
                    <CardContent className="p-6 sm:p-8 text-center">
                      <User className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                      <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">No Current Invitations</h3>
                      <p className="text-sm text-gray-500">
                        You don't have any screening invitations from the last 7 days.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {currentInvitations.map((invitation) => (
                      <ScreeningCard 
                        key={invitation.id}
                        invitation={invitation}
                        onAccept={() => handleOpenAcceptDialog(invitation)}
                        onViewDetails={() => handleViewDetails(invitation)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Past Invitations Tab */}
              <TabsContent value="past" className="m-0 p-3 sm:p-4">
                {pastInvitations.length === 0 ? (
                  <Card className="border-0 shadow-none">
                    <CardContent className="p-6 sm:p-8 text-center">
                      <Archive className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                      <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-2">No Past Invitations</h3>
                      <p className="text-sm text-gray-500">
                        You don't have any screening invitations older than 7 days.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {pastInvitations.map((invitation) => (
                      <ScreeningCard 
                        key={invitation.id}
                        invitation={invitation}
                        onAccept={() => handleOpenAcceptDialog(invitation)}
                        onViewDetails={() => handleViewDetails(invitation)}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Accept Invitation Dialog */}
        <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
          <DialogContent className="sm:max-w-md max-w-[95vw] mx-2 sm:mx-auto">
            <DialogHeader>
              <DialogTitle className="text-base sm:text-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                Accept Screening Invitation
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm">
                You are about to start the screening process with {invitationToAccept?.landlord.name}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-3 py-2 sm:py-3">
              <div className="bg-blue-50 p-2.5 sm:p-3 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-1 text-xs sm:text-sm">About the Screening Process</h4>
                <p className="text-blue-700 text-xs sm:text-sm">
                  Complete your background information to meet rental criteria.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-800 text-xs sm:text-sm">What to expect:</h4>
                <ul className="text-gray-600 text-xs sm:text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>Questions about employment, income, and rental history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>Takes 10-15 minutes to complete</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>Information securely processed by landlord</span>
                  </li>
                </ul>
              </div>
            </div>

            <DialogFooter className="flex gap-2 sm:justify-end">
              <Button 
                variant="outline" 
                onClick={() => setAcceptDialogOpen(false)}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => invitationToAccept && handleAcceptInvitation(invitationToAccept)}
                size="sm"
                className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
              >
                Continue
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Separate component for screening card
interface ScreeningCardProps {
  invitation: ScreeningInvitation;
  onAccept: () => void;
  onViewDetails: () => void;
}

const ScreeningCard = ({ invitation, onAccept, onViewDetails }: ScreeningCardProps) => {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatRole = (role?: string | null) => {
    if (!role) return 'Landlord';
    return role
      .toLowerCase()
      .split(/[\s_]+/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-3 h-3" />;
      case 'PENDING':
        return <Clock className="w-3 h-3" />;
      case 'SUBMITTED':
        return <FileText className="w-3 h-3" />;
      case 'REJECTED':
        return <XCircle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusTheme = (status: string) => {
    return SCREENING_STATUS_THEME[status as keyof typeof SCREENING_STATUS_THEME] || SCREENING_STATUS_THEME.PENDING;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusMessage = (status: string, landlordName: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <>
            You have been invited by <span className="font-semibold">{landlordName}</span> to tenant screening
          </>
        );
      case 'SUBMITTED':
        return (
          <>
            You have submitted your screening application to <span className="font-semibold">{landlordName}</span>
          </>
        );
      case 'APPROVED':
        return (
          <>
            Your screening has been <span className="font-semibold">approved</span> by <span className="font-semibold">{landlordName}</span>
          </>
        );
      case 'REJECTED':
        return (
          <>
            Your screening has been <span className="font-semibold">rejected</span> by <span className="font-semibold">{landlordName}</span>
          </>
        );
      default:
        return (
          <>
            Screening invitation from <span className="font-semibold">{landlordName}</span>
          </>
        );
    }
  };

  const theme = getStatusTheme(invitation.status);
  
  // Get hover border class based on status
  const getHoverBorder = (status: string) => {
    switch (status) {
      case 'PENDING': return 'hover:border-amber-300';
      case 'SUBMITTED': return 'hover:border-indigo-300';
      case 'APPROVED': return 'hover:border-emerald-300';
      case 'REJECTED': return 'hover:border-rose-300';
      default: return 'hover:border-gray-300';
    }
  };

  // Get View Details button classes based on status
  const getViewDetailsButtonClasses = (status: string) => {
    const baseClasses = "text-xs sm:text-sm font-medium h-9 sm:h-10 px-4 sm:px-5 gap-2 transition-all duration-200 rounded-lg shadow-sm hover:shadow-md";
    
    switch (status) {
      case 'SUBMITTED':
        return `${baseClasses} border-indigo-300 text-indigo-700 hover:text-indigo-900 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-blue-50`;
      case 'APPROVED':
        return `${baseClasses} border-emerald-300 text-emerald-700 hover:text-emerald-900 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-green-50`;
      case 'REJECTED':
        return `${baseClasses} border-rose-300 text-rose-700 hover:text-rose-900 hover:bg-gradient-to-br hover:from-rose-50 hover:to-red-50`;
      default:
        return `${baseClasses} border-gray-300 text-gray-700 hover:text-gray-900 hover:bg-gray-50`;
    }
  };

  return (
    <Card className={`hover:shadow-md transition-all duration-200 ${theme.borderCard} ${theme.backgroundCard} ${getHoverBorder(invitation.status)}`}>
      <CardContent className="p-2 sm:p-2.5">
        {/* Invitation Message - Compact */}
        <div className={`mb-1.5 pb-1.5 border-b ${theme.border}`}>
          <p className={`${theme.textColor} text-xs sm:text-sm font-medium leading-tight`}>
            {getStatusMessage(invitation.status, invitation.landlord.name)}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
            <Avatar className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 border border-slate-200">
              {invitation.landlord.avatarUrl ? (
                <AvatarImage src={invitation.landlord.avatarUrl} />
              ) : null}
              <AvatarFallback className="bg-blue-50 text-blue-600 text-xs sm:text-sm font-semibold">
                {getInitials(invitation.landlord.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                <Badge
                  className={`flex items-center gap-1 text-[10px] sm:text-xs border transition-colors duration-200 ${theme.badge} ${getHoverBorder(invitation.status)}`}
                >
                  <div className={`${theme.iconBackground} text-white p-0.5 rounded`}>
                    {getStatusIcon(invitation.status)}
                  </div>
                  <span className="hidden sm:inline">{invitation.status}</span>
                  <span className="sm:hidden">{invitation.status.slice(0, 3)}</span>
                </Badge>
                <span className="text-[10px] sm:text-xs text-gray-500">
                  {formatDate(invitation.createdAt)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                  {invitation.landlord.name}
                </h3>
                <Badge
                  variant="outline"
                  className="text-[10px] sm:text-xs uppercase tracking-wide border-blue-200 text-blue-700 bg-blue-50/60"
                >
                  {formatRole(invitation.landlord.role)}
                </Badge>
              </div>

              <p className="text-gray-600 text-[11px] sm:text-sm truncate mt-0.5">{invitation.landlord.email}</p>
            </div>
          </div>

          <div className="flex-shrink-0">
            {invitation.status === 'PENDING' ? (
              <Button
                onClick={onAccept}
                size="sm"
                className={`bg-gradient-to-r ${SCREENING_STATUS_THEME.APPROVED.gradientButton} text-white text-xs sm:text-sm font-semibold h-9 sm:h-10 px-4 sm:px-5 shadow-md shadow-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/40 transition-all duration-200 rounded-lg gap-2`}
              >
                <CheckCircle className="w-4 h-4" />
                Accept
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={onViewDetails}
                size="sm"
                className={getViewDetailsButtonClasses(invitation.status)}
              >
                View Details
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TenantScreeningTenant;
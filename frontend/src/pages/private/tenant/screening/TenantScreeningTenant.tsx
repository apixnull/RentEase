import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, CheckCircle, XCircle, Clock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { getTenantScreeningInvitationsRequest } from '@/api/tenant/screeningApi';

// Types based on API response
interface Landlord {
  id: string;
  name: string;
  email: string;
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

const TenantScreeningTenant = () => {
  const navigate = useNavigate();
  const [invitations, setInvitations] = useState<ScreeningInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [invitationToAccept, setInvitationToAccept] = useState<ScreeningInvitation | null>(null);

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600 text-sm">Loading screening invitations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Invitations</h3>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <Button onClick={fetchInvitations} size="sm">Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Tenant Screening</h1>
          <p className="text-gray-600 text-sm">Manage your screening invitations from landlords</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="bg-white border-l-3 border-l-blue-500">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Total</p>
                  <p className="text-lg font-bold text-gray-800">{stats.total}</p>
                </div>
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-3 border-l-yellow-500">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Pending</p>
                  <p className="text-lg font-bold text-gray-800">{stats.pending}</p>
                </div>
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-3 border-l-green-500">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Approved</p>
                  <p className="text-lg font-bold text-gray-800">{stats.approved}</p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-l-3 border-l-red-500">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Rejected</p>
                  <p className="text-lg font-bold text-gray-800">{stats.rejected}</p>
                </div>
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Current and Past Invitations */}
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="current" className="text-sm">
              Current
              {currentInvitations.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {currentInvitations.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="past" className="text-sm">
              Past
              {pastInvitations.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {pastInvitations.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            {currentInvitations.length === 0 ? (
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="p-6 text-center">
                  <User className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-gray-800 mb-1">No Current Invitations</h3>
                  <p className="text-gray-600 text-sm">
                    You don't have any screening invitations from the last 7 days.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
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

          <TabsContent value="past">
            {pastInvitations.length === 0 ? (
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="p-6 text-center">
                  <User className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-gray-800 mb-1">No Past Invitations</h3>
                  <p className="text-gray-600 text-sm">
                    You don't have any screening invitations older than 7 days.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
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

        {/* Accept Invitation Dialog */}
        <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Accept Screening Invitation
              </DialogTitle>
              <DialogDescription className="text-sm">
                You are about to start the screening process with {invitationToAccept?.landlord.name}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-3 py-3">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-1 text-sm">About the Screening Process</h4>
                <p className="text-blue-700 text-sm">
                  Complete your background information to meet rental criteria.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-gray-800 text-sm">What to expect:</h4>
                <ul className="text-gray-600 text-sm space-y-2">
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'SUBMITTED':
        return 'outline';
      case 'REJECTED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-l-3 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Avatar className="w-10 h-10 flex-shrink-0">
              {invitation.landlord.avatarUrl ? (
                <AvatarImage src={invitation.landlord.avatarUrl} />
              ) : null}
              <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                {getInitials(invitation.landlord.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant={getStatusVariant(invitation.status)} 
                  className="flex items-center gap-1 text-xs"
                >
                  {getStatusIcon(invitation.status)}
                  {invitation.status}
                </Badge>
                <span className="text-xs text-gray-500">
                  {formatDate(invitation.createdAt)}
                </span>
              </div>
              
              <h3 className="font-semibold text-gray-800 text-sm mb-1 truncate">
                {invitation.landlord.name}
              </h3>
              <p className="text-gray-600 text-xs truncate">{invitation.landlord.email}</p>
              
              {invitation.status === 'PENDING' && (
                <p className="text-blue-600 text-xs mt-1">
                  Complete screening to move forward
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-shrink-0">
            {invitation.status === 'PENDING' ? (
              <Button 
                onClick={onAccept} 
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-xs h-8 px-3"
              >
                Accept
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                onClick={onViewDetails}
                size="sm"
                className="text-xs h-8 px-3 gap-1"
              >
                View
                <ArrowRight className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TenantScreeningTenant;
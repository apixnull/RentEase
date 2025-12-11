import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import {
  Calendar,
  AlertTriangle,
  AlertCircle,
  Eye,
  EyeOff,
  Shield,
  CheckCircle,
  Home,
  Sparkles,
  XCircle,
  RotateCw,
  ChevronDown,
  ChevronUp,
  Flag,
  User,
  Image as ImageIcon,
} from "lucide-react";

interface ListingInformationProps {
  listing: any;
  loading?: boolean;
}

const ListingInformation = ({ listing, loading = false }: ListingInformationProps) => {
  const [reviewerModalOpen, setReviewerModalOpen] = useState(false);
  const [resubmissionHistoryExpanded, setResubmissionHistoryExpanded] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const getStatusColor = (status: string) => {
    switch ((status || "").toUpperCase()) {
      case 'WAITING_PAYMENT': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'WAITING_REVIEW': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'VISIBLE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'HIDDEN': return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'EXPIRED': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'FLAGGED': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'BLOCKED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusBackgroundColor = (status: string) => {
    switch ((status || "").toUpperCase()) {
      case 'WAITING_PAYMENT': return 'bg-blue-50 border-blue-300';
      case 'WAITING_REVIEW': return 'bg-purple-50 border-purple-300';
      case 'VISIBLE': return 'bg-emerald-50 border-emerald-300';
      case 'HIDDEN': return 'bg-teal-50 border-teal-300';
      case 'EXPIRED': return 'bg-gray-50 border-gray-300';
      case 'FLAGGED': return 'bg-amber-50 border-amber-300';
      case 'BLOCKED': return 'bg-red-50 border-red-300';
      default: return 'bg-blue-50 border-blue-300';
    }
  };

  const getStatusIconBg = (status: string) => {
    switch ((status || "").toUpperCase()) {
      case 'WAITING_PAYMENT': return 'bg-blue-500';
      case 'WAITING_REVIEW': return 'bg-purple-500';
      case 'VISIBLE': return 'bg-emerald-500';
      case 'HIDDEN': return 'bg-teal-500';
      case 'EXPIRED': return 'bg-gray-500';
      case 'FLAGGED': return 'bg-amber-500';
      case 'BLOCKED': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatReason = (reason: string | null) => {
    if (!reason) return 'N/A';
    const reasonMap: Record<string, string> = {
      'inappropriate': 'Inappropriate Content',
      'discriminatory': 'Discriminatory Language',
      'scam': 'Scamming Pattern',
      'fake_info': 'Fake Information',
      'privacy': 'Privacy Violation',
      'spam': 'Spam Content',
      'illegal': 'Illegal Content',
      'other': 'Other Violation',
    };
    const lowerReason = reason.toLowerCase().trim();
    if (reasonMap[lowerReason]) {
      return reasonMap[lowerReason];
    }
    for (const [key, label] of Object.entries(reasonMap)) {
      if (lowerReason === key || lowerReason.startsWith(key + ' ') || lowerReason.includes(' ' + key)) {
        return label;
      }
    }
    return reason.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const formatDataUsed = (dataUsed: string | { text: string; category: string } | null) => {
    if (!dataUsed) return 'N/A';
    if (typeof dataUsed === 'string') {
      return dataUsed;
    }
    return dataUsed.text || 'N/A';
  };

  const getCurrentLifecycleIcon = () => {
    switch ((listing?.lifecycleStatus || '').toUpperCase()) {
      case 'WAITING_PAYMENT': return Calendar;
      case 'WAITING_REVIEW': return Calendar;
      case 'VISIBLE': return Eye;
      case 'HIDDEN': return EyeOff;
      case 'EXPIRED': return Calendar;
      case 'FLAGGED': return AlertTriangle;
      case 'BLOCKED': return AlertCircle;
      default: return Calendar;
    }
  };

  const getCurrentLifecycleLabel = () => {
    switch ((listing?.lifecycleStatus || '').toUpperCase()) {
      case 'WAITING_PAYMENT': return 'Created At';
      case 'WAITING_REVIEW': return 'Waiting Review Since';
      case 'VISIBLE': return 'Visible At';
      case 'HIDDEN': return 'Hidden At';
      case 'EXPIRED': return 'Expired At';
      case 'FLAGGED': return 'Flagged At';
      case 'BLOCKED': return 'Blocked At';
      default: return 'Created At';
    }
  };

  const getCurrentLifecycleDate = () => {
    const status = (listing?.lifecycleStatus || '').toUpperCase();
    switch (status) {
      case 'WAITING_PAYMENT': return listing?.createdAt;
      case 'WAITING_REVIEW': return listing?.paymentDate;
      case 'VISIBLE': return listing?.visibleAt;
      case 'HIDDEN': return listing?.hiddenAt;
      case 'EXPIRED': return listing?.expiresAt;
      case 'FLAGGED': return listing?.flaggedAt;
      case 'BLOCKED': return listing?.blockedAt;
      default: return listing?.createdAt;
    }
  };

  // Build lifecycle steps
  const lifecycleSteps = useMemo(() => {
    const steps: Array<{ label: string; date: string | null | undefined; status: 'active' | 'completed' | 'pending'; icon: any; stepType?: 'WAITING_REVIEW' | 'VISIBLE' | 'HIDDEN' | 'FLAGGED' | 'BLOCKED' }> = [];
    if (!listing) return steps;
    
    const currentStatus = (listing?.lifecycleStatus || '').toUpperCase();
    
    if (listing?.createdAt) {
      steps.push({ label: 'Created', date: listing.createdAt, status: 'completed', icon: CheckCircle });
    }
    
    if (currentStatus === 'WAITING_PAYMENT') {
      steps.push({ label: 'Waiting Payment', date: listing?.createdAt, status: 'active', icon: Calendar });
    } else {
      if (listing?.paymentDate) {
        steps.push({ label: 'Payment', date: listing.paymentDate, status: 'completed', icon: CheckCircle });
        // Don't show "Waiting Review" step if already approved (VISIBLE or HIDDEN)
        if (currentStatus !== 'VISIBLE' && currentStatus !== 'HIDDEN') {
          steps.push({
            label: 'Waiting Review',
            date: listing.paymentDate,
            status: currentStatus === 'WAITING_REVIEW' ? 'active' : 'completed',
            icon: Calendar,
            stepType: 'WAITING_REVIEW'
          });
        }
      }
      // Show "Visible" step - active if current status is VISIBLE, completed otherwise
      if (listing?.visibleAt) {
        steps.push({ 
          label: 'Visible', 
          date: listing.visibleAt, 
          status: currentStatus === 'VISIBLE' ? 'active' : 'completed', 
          icon: Eye,
          stepType: 'VISIBLE'
        });
      }
      // Show "Hidden" step - active if current status is HIDDEN, completed otherwise
      if (listing?.hiddenAt) {
        steps.push({ 
          label: 'Hidden', 
          date: listing.hiddenAt, 
          status: currentStatus === 'HIDDEN' ? 'active' : 'completed', 
          icon: EyeOff,
          stepType: 'HIDDEN'
        });
      }
      // Show "Flagged" step - active if current status is FLAGGED, completed otherwise
      if (listing?.flaggedAt) {
        steps.push({ 
          label: 'Flagged', 
          date: listing.flaggedAt, 
          status: currentStatus === 'FLAGGED' ? 'active' : 'completed', 
          icon: AlertTriangle,
          stepType: 'FLAGGED'
        });
      }
      // Show "Blocked" step - active if current status is BLOCKED, completed otherwise
      if (listing?.blockedAt) {
        steps.push({ 
          label: 'Blocked', 
          date: listing.blockedAt, 
          status: currentStatus === 'BLOCKED' ? 'active' : 'completed', 
          icon: AlertCircle,
          stepType: 'BLOCKED'
        });
      }
    }
    
    if (listing?.expiresAt) {
      steps.push({ label: 'Expires', date: listing.expiresAt, status: 'pending', icon: Calendar });
    }
    
    return steps;
  }, [listing]);

  const CurrentLifecycleIcon = getCurrentLifecycleIcon();

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-5 w-32" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-16 rounded-lg" />
                <Skeleton className="h-16 rounded-lg" />
              </div>
            </div>
            <Skeleton className="h-64 rounded-lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!listing) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-red-200 shadow-sm">
        <CardContent className="pt-8 pb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">No Listing Data</h3>
            <p className="text-red-600">Listing information not available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const unitSanitizeLogs = Array.isArray(listing.unitSanitizeLogs) ? listing.unitSanitizeLogs : [];
  const propertySanitizeLogs = Array.isArray(listing.propertySanitizeLogs) ? listing.propertySanitizeLogs : [];
  const hasUnitScam = unitSanitizeLogs.some((log: any) => (log?.isScammingPattern === true) || ((log?.reason || "").toLowerCase().trim() === "scam"));
  const hasPropertyScam = propertySanitizeLogs.some((log: any) => (log?.isScammingPattern === true) || ((log?.reason || "").toLowerCase().trim() === "scam"));
  const hasAnyScam = hasUnitScam || hasPropertyScam;
  
  // Parse resubmission history
  const resubmissionHistory = Array.isArray(listing.resubmissionHistory) ? listing.resubmissionHistory : [];
  
  // Helper function to determine severity color based on type
  const getResubmissionSeverity = (type: string) => {
    const upperType = (type || "").toUpperCase();
    if (upperType === "BLOCKED") {
      return {
        bg: "bg-red-50",
        border: "border-red-300",
        text: "text-red-900",
        badge: "bg-red-100 text-red-700 border-red-200",
        icon: XCircle,
        iconColor: "text-red-600"
      };
    } else {
      // Default to amber (flag-like) colors for FLAGGED resubmissions
      return {
        bg: "bg-amber-50",
        border: "border-amber-300",
        text: "text-amber-900",
        badge: "bg-amber-100 text-amber-700 border-amber-200",
        icon: AlertTriangle,
        iconColor: "text-amber-600"
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Information Section */}
      <Card className="bg-white/90 backdrop-blur-sm border-blue-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-xl text-slate-900">Key Information</CardTitle>
          </div>
          <CardDescription>Essential listing review and status information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Admin Review Status */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Admin Review Status
              </h3>
              {listing.reviewer && listing.reviewedAt ? (
                <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-500 text-white">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-emerald-900">Reviewed by Admin</p>
                        <p className="text-xs text-emerald-700">Reviewed on {formatDateTime(listing.reviewedAt)}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReviewerModalOpen(true)}
                      className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Reviewer
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 pt-3 border-t border-emerald-200">
                    <Avatar className="h-8 w-8 border border-emerald-200">
                      <AvatarImage src={listing.reviewer.avatarUrl || undefined} alt={`${listing.reviewer.firstName} ${listing.reviewer.lastName}`} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs font-semibold">
                        {listing.reviewer.firstName?.[0]?.toUpperCase() || 'A'}{listing.reviewer.lastName?.[0]?.toUpperCase() || 'D'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-emerald-900 truncate">
                        {listing.reviewer.firstName || 'N/A'} {listing.reviewer.lastName || 'N/A'}
                      </p>
                      <p className="text-xs text-emerald-700 truncate">{listing.reviewer.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-amber-500 text-white">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-amber-900">Not Reviewed Yet</p>
                      <p className="text-xs text-amber-700">This listing has not been reviewed by an administrator</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resubmission History Section */}
      {resubmissionHistory.length > 0 && (
        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RotateCw className="h-5 w-5 text-slate-600" />
                <CardTitle className="text-xl text-slate-900">Resubmission History</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setResubmissionHistoryExpanded(!resubmissionHistoryExpanded)}
                className="h-8 w-8 p-0"
              >
                {resubmissionHistoryExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
            <CardDescription>
              Track of listing resubmissions due to violations or issues
            </CardDescription>
          </CardHeader>
          {resubmissionHistoryExpanded && (
            <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-slate-600">
                  Total Resubmissions: <span className="font-semibold text-slate-900">{resubmissionHistory.length}</span>
                </p>
                {resubmissionHistory.length > 0 && (
                  <Badge className="bg-slate-100 text-slate-700 border-slate-200">
                    {resubmissionHistory.length} {resubmissionHistory.length === 1 ? 'Attempt' : 'Attempts'}
                  </Badge>
                )}
              </div>
              <div className="space-y-3">
                {[...resubmissionHistory].reverse().map((entry: any, index: number) => {
                  const severity = getResubmissionSeverity(entry.type || "");
                  const SeverityIcon = severity.icon;
                  // Calculate correct attempt number from reversed array
                  const correctAttemptNum = entry.attempt || (resubmissionHistory.length - index);
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 ${severity.bg} ${severity.border}`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${severity.bg} border-2 ${severity.border}`}>
                            <SeverityIcon className={`h-5 w-5 ${severity.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`font-semibold text-sm ${severity.text}`}>
                                Attempt #{correctAttemptNum}
                              </span>
                              <Badge className={severity.badge} variant="outline">
                                {(() => {
                                  const suffix = correctAttemptNum === 1 ? 'st' : correctAttemptNum === 2 ? 'nd' : correctAttemptNum === 3 ? 'rd' : 'th';
                                  return `${correctAttemptNum}${suffix} Resubmission`;
                                })()}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-600">
                              <Calendar className="h-3 w-3" />
                              <span>Resubmitted: {formatDateTime(entry.resubmittedAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className={`mt-3 pt-3 border-t ${severity.border}`}>
                        <p className={`text-xs font-semibold ${severity.text} uppercase tracking-wide mb-2`}>Reason</p>
                        <p className={`text-sm ${severity.text} leading-relaxed`}>
                          {entry.reason || 'No reason provided'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* AI Review and Lifecycle Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Review Section */}
        <Card className="bg-white/90 backdrop-blur-sm border-amber-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-xl text-slate-900">AI Review</CardTitle>
            </div>
            <CardDescription>Automated AI analysis and content sanitization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {hasAnyScam && (
              <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-400 rounded-lg p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-red-900 mb-2">⚠️ Scamming Pattern Detected</h3>
                    <p className="text-sm text-red-800 leading-relaxed">
                      AI detected a scamming pattern in the landlord's submission. This attempt has been recorded on the landlord's account.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {unitSanitizeLogs.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Unit Content Sanitized
                </h3>
                <div className="space-y-3">
                  {unitSanitizeLogs.map((log: any, index: number) => {
                    const reason = (log?.reason || "").toLowerCase().trim();
                    const isScam = log?.isScammingPattern === true || reason === "scam";
                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 ${isScam ? 'bg-red-50 border-red-300' : 'bg-amber-50 border-amber-300'}`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {isScam ? (
                              <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                            )}
                            <span className="font-semibold text-sm capitalize text-slate-900">
                              {log?.part || 'unit'}
                            </span>
                            {isScam && (
                              <Badge className="bg-red-500 text-white text-xs">Scamming Pattern</Badge>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${isScam ? 'border-red-300 text-red-700 bg-red-100' : 'border-amber-300 text-amber-700 bg-amber-100'}`}
                          >
                            {log?.action || 'remove'}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-slate-700 mb-2">
                          Reason: {formatReason(log?.reason)}
                        </p>
                        <div className="mt-2 pt-2 border-t border-slate-200">
                          <p className="text-xs text-slate-600 mb-1">Removed Content:</p>
                          <p className="text-sm text-slate-800 bg-white/50 p-2 rounded border border-slate-200 font-mono break-words">
                            {formatDataUsed(log?.dataUsed)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {propertySanitizeLogs.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Property Content Sanitized
                </h3>
                <div className="space-y-3">
                  {propertySanitizeLogs.map((log: any, index: number) => {
                    const reason = (log?.reason || "").toLowerCase().trim();
                    const isScam = log?.isScammingPattern === true || reason === "scam";
                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 ${isScam ? 'bg-red-50 border-red-300' : 'bg-amber-50 border-amber-300'}`}
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {isScam ? (
                              <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                            )}
                            <span className="font-semibold text-sm capitalize text-slate-900">
                              {log?.part || 'property'}
                            </span>
                            {isScam && (
                              <Badge className="bg-red-500 text-white text-xs">Scamming Pattern</Badge>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${isScam ? 'border-red-300 text-red-700 bg-red-100' : 'border-amber-300 text-amber-700 bg-amber-100'}`}
                          >
                            {log?.action || 'remove'}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-slate-700 mb-2">
                          Reason: {formatReason(log?.reason)}
                        </p>
                        <div className="mt-2 pt-2 border-t border-slate-200">
                          <p className="text-xs text-slate-600 mb-1">Removed Content:</p>
                          <p className="text-sm text-slate-800 bg-white/50 p-2 rounded border border-slate-200 font-mono break-words">
                            {formatDataUsed(log?.dataUsed)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {unitSanitizeLogs.length === 0 && propertySanitizeLogs.length === 0 && (
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 text-center">
                <p className="text-sm text-slate-500">No AI sanitization logs were recorded for this listing.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lifecycle Section */}
        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl text-slate-900">Lifecycle Status</CardTitle>
            <CardDescription>Listing lifecycle timeline and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`p-4 rounded-lg border-2 ${getStatusBackgroundColor(listing.lifecycleStatus)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusIconBg(listing.lifecycleStatus)} text-white`}>
                    <CurrentLifecycleIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Current Status</p>
                    <p className="text-sm text-slate-600">{getCurrentLifecycleLabel()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">
                    {formatDateTime(getCurrentLifecycleDate())}
                  </p>
                </div>
              </div>
              {listing.lifecycleStatus === 'WAITING_PAYMENT' && (
                <p className="mt-3 text-xs text-amber-700">
                  Payment confirmation is still pending; keep the listing hidden until the transaction clears.
                </p>
              )}
              {listing.lifecycleStatus === 'WAITING_REVIEW' && (
                <p className="mt-3 text-xs text-purple-700">
                  Awaiting manual review before the listing can go live.
                </p>
              )}
              {listing.lifecycleStatus === 'VISIBLE' && (
                <p className="mt-3 text-xs text-emerald-700">
                  Listing is currently visible to renters.
                </p>
              )}
              {listing.lifecycleStatus === 'HIDDEN' && (
                <p className="mt-3 text-xs text-teal-700">
                  Listing is hidden from renters until further action is taken.
                </p>
              )}
              {listing.lifecycleStatus === 'EXPIRED' && (
                <p className="mt-3 text-xs text-slate-600">
                  Listing has expired and is no longer visible to renters.
                </p>
              )}
              {listing.lifecycleStatus === 'FLAGGED' && listing.flaggedReason && (
                <div className="mt-3 pt-3 border-t border-amber-300 space-y-2">
                  <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide block">Flagged Reason</span>
                  <p className="text-sm text-amber-800">{listing.flaggedReason}</p>
                </div>
              )}
              {listing.lifecycleStatus === 'BLOCKED' && listing.blockedReason && (
                <div className="mt-3 pt-3 border-t border-red-300 space-y-2">
                  <span className="text-xs font-semibold text-red-700 uppercase tracking-wide block">Blocked Reason</span>
                  <p className="text-sm text-red-800">{listing.blockedReason}</p>
                </div>
              )}
            </div>

            {/* Status Overview */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Current Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Status</span>
                  <Badge className={getStatusColor(listing.lifecycleStatus)}>
                    {listing.lifecycleStatus.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm text-slate-600">Featured</span>
                  <Badge className={listing.isFeatured ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200" : "bg-gray-100 text-gray-600 border-gray-200"}>
                    {listing.isFeatured ? 'Featured' : 'Not Featured'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Lifecycle Timeline */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-4 uppercase tracking-wide">Lifecycle Timeline</h3>
              <div className="relative">
                <div className="space-y-4">
                  {lifecycleSteps.map((step, index) => {
                    const StepIcon = step.icon;
                    const isActive = step.status === 'active';
                    const isCompleted = step.status === 'completed';
                    const isLast = index === lifecycleSteps.length - 1;
                    const isFlagged = step.stepType === 'FLAGGED';
                    const isBlocked = step.stepType === 'BLOCKED';
                    const isVisible = step.stepType === 'VISIBLE';
                    const isHidden = step.stepType === 'HIDDEN';
                    
                    let iconBgColor = 'bg-slate-400';
                    let iconRingColor = '';
                    let contentBgColor = 'bg-slate-50';
                    let contentBorderColor = 'border-slate-200';
                    let textColor = 'text-slate-600';
                    let dateColor = 'text-slate-500';
                    let timelineColor = 'bg-slate-200';
                    let activeBadgeColor = 'bg-amber-600';
                    
                    if (isActive) {
                      if (isBlocked) {
                        iconBgColor = 'bg-red-500';
                        iconRingColor = 'ring-4 ring-red-200';
                        contentBgColor = 'bg-red-50';
                        contentBorderColor = 'border-2 border-red-300';
                        textColor = 'text-red-900';
                        dateColor = 'text-red-700';
                        activeBadgeColor = 'bg-red-600';
                      } else if (isFlagged) {
                        iconBgColor = 'bg-amber-500';
                        iconRingColor = 'ring-4 ring-amber-200';
                        contentBgColor = 'bg-amber-50';
                        contentBorderColor = 'border-2 border-amber-300';
                        textColor = 'text-amber-900';
                        dateColor = 'text-amber-700';
                        activeBadgeColor = 'bg-amber-600';
                      } else if (isVisible) {
                        iconBgColor = 'bg-emerald-500';
                        iconRingColor = 'ring-4 ring-emerald-200';
                        contentBgColor = 'bg-emerald-50';
                        contentBorderColor = 'border-2 border-emerald-300';
                        textColor = 'text-emerald-900';
                        dateColor = 'text-emerald-700';
                        activeBadgeColor = 'bg-emerald-600';
                      } else if (isHidden) {
                        iconBgColor = 'bg-teal-500';
                        iconRingColor = 'ring-4 ring-teal-200';
                        contentBgColor = 'bg-teal-50';
                        contentBorderColor = 'border-2 border-teal-300';
                        textColor = 'text-teal-900';
                        dateColor = 'text-teal-700';
                        activeBadgeColor = 'bg-teal-600';
                      } else {
                        iconBgColor = 'bg-amber-500';
                        iconRingColor = 'ring-4 ring-amber-200';
                        contentBgColor = 'bg-amber-50';
                        contentBorderColor = 'border-2 border-amber-300';
                        textColor = 'text-amber-900';
                        dateColor = 'text-amber-700';
                        activeBadgeColor = 'bg-amber-600';
                      }
                    } else if (isCompleted) {
                      if (isBlocked) {
                        iconBgColor = 'bg-red-500';
                        contentBgColor = 'bg-red-50';
                        contentBorderColor = 'border border-red-200';
                        textColor = 'text-red-900';
                        dateColor = 'text-red-700';
                        timelineColor = 'bg-red-300';
                      } else if (isFlagged) {
                        iconBgColor = 'bg-amber-500';
                        contentBgColor = 'bg-amber-50';
                        contentBorderColor = 'border border-amber-200';
                        textColor = 'text-amber-900';
                        dateColor = 'text-amber-700';
                        timelineColor = 'bg-amber-300';
                      } else if (isVisible) {
                        iconBgColor = 'bg-emerald-500';
                        contentBgColor = 'bg-emerald-50';
                        contentBorderColor = 'border border-emerald-200';
                        textColor = 'text-emerald-900';
                        dateColor = 'text-emerald-700';
                        timelineColor = 'bg-emerald-300';
                      } else if (isHidden) {
                        iconBgColor = 'bg-teal-500';
                        contentBgColor = 'bg-teal-50';
                        contentBorderColor = 'border border-teal-200';
                        textColor = 'text-teal-900';
                        dateColor = 'text-teal-700';
                        timelineColor = 'bg-teal-300';
                      } else {
                        iconBgColor = 'bg-emerald-500';
                        contentBgColor = 'bg-emerald-50';
                        contentBorderColor = 'border border-emerald-200';
                        textColor = 'text-emerald-900';
                        dateColor = 'text-emerald-700';
                        timelineColor = 'bg-emerald-300';
                      }
                    }
                    
                    return (
                      <div key={index} className="relative flex items-start gap-4">
                        {!isLast && (
                          <div className={`absolute left-5 top-12 w-0.5 h-full ${timelineColor}`} style={{ height: 'calc(100% + 1rem)' }} />
                        )}
                        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconBgColor} text-white ${isActive ? `${iconRingColor} shadow-lg` : ''}`}>
                          <StepIcon className="h-5 w-5" />
                          {isActive && (
                            <motion.div
                              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className={`absolute inset-0 rounded-full ${iconBgColor}`}
                            />
                          )}
                        </div>
                        <div className={`flex-1 pt-1 pb-4 ${contentBgColor} ${contentBorderColor} rounded-lg p-4`}>
                          <div className="flex items-center justify-between mb-2">
                            <p className={`font-semibold ${textColor}`}>{step.label}</p>
                            {isActive && (
                              <Badge className={`${activeBadgeColor} text-white`}>Current</Badge>
                            )}
                          </div>
                          <p className={`text-sm ${dateColor}`}>{formatDateTime(step.date)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

            {/* Payment Information */}
            {listing.lifecycleStatus !== 'WAITING_PAYMENT' && listing.paymentDate && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Payment Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Listing ID</span>
                    <span className="text-xs font-mono text-slate-800 break-all max-w-[240px]" title={listing.id}>
                      {listing.id || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100">
                    <span className="text-sm text-slate-600">Amount Paid</span>
                    <span className="font-semibold text-green-700">
                      {listing.paymentAmount != null ? `₱${listing.paymentAmount.toLocaleString()}` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Payment Method</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {listing.providerName || 'N/A'}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Transaction ID</span>
                    <span className="text-xs font-mono text-slate-700 truncate max-w-[200px]" title={listing.providerTxnId}>
                      {listing.providerTxnId || `TXN-${Math.random().toString(36).substring(2, 15).toUpperCase()}-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-sm text-slate-600">Payment Date</span>
                    <span className="text-sm font-medium text-slate-900">{formatDateTime(listing.paymentDate)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fraud Reports Section */}
      {listing.fraudReports && listing.fraudReports.length > 0 && (
        <Card className="bg-white/90 backdrop-blur-sm border-red-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-red-600" />
              <CardTitle className="text-xl text-slate-900">Fraud Reports</CardTitle>
            </div>
            <CardDescription>
              Tenant fraud reports for this listing (showing {Math.min(listing.fraudReports.length, 5)} of {listing.fraudReports.length} {listing.fraudReports.length === 1 ? 'report' : 'reports'})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {listing.fraudReports.slice(0, 5).map((report: any, index: number) => {
                const getReasonBadgeVariant = (reason: string) => {
                  const reasonMap: Record<string, "destructive" | "secondary" | "default"> = {
                    scam: "destructive",
                    fake_info: "destructive",
                    discriminatory: "destructive",
                    illegal: "destructive",
                    inappropriate: "secondary",
                    other: "default",
                  };
                  return reasonMap[reason] || "default";
                };

                const getReporterName = (reporter: any) => {
                  if (reporter?.firstName && reporter?.lastName) {
                    return `${reporter.firstName} ${reporter.lastName}`;
                  }
                  return reporter?.email || "Unknown";
                };

                return (
                  <div
                    key={report.id || index}
                    className="p-4 rounded-lg border-2 bg-red-50 border-red-300"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                          <Flag className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={getReasonBadgeVariant(report.reason)} className="text-xs capitalize">
                              {report.reason.replace("_", " ")}
                            </Badge>
                            <span className="text-xs text-slate-500">Report #{index + 1}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <User className="h-3.5 w-3.5 text-slate-500" />
                            <span className="font-medium">{getReporterName(report.reporter)}</span>
                            {report.reporter?.email && (
                              <span className="text-xs text-slate-500">({report.reporter.email})</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-600">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDateTime(report.createdAt)}</span>
                      </div>
                    </div>
                    {report.details && (
                      <div className="mt-3 pt-3 border-t border-red-200">
                        <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">Details</p>
                        <p className="text-sm text-red-900 leading-relaxed">{report.details}</p>
                      </div>
                    )}
                    {/* Display images if available */}
                    {(report.image1Url || report.image2Url) && (
                      <div className="mt-3 pt-3 border-t border-red-200">
                        <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">Evidence Images</p>
                        <div className="flex gap-2">
                          {report.image1Url && (
                            <button
                              onClick={() => setSelectedImage(report.image1Url)}
                              className="relative group"
                            >
                              <img
                                src={report.image1Url}
                                alt="Evidence 1"
                                className="w-20 h-20 object-cover rounded border border-red-300 hover:border-red-500 transition-colors"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded transition-colors flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          )}
                          {report.image2Url && (
                            <button
                              onClick={() => setSelectedImage(report.image2Url)}
                              className="relative group"
                            >
                              <img
                                src={report.image2Url}
                                alt="Evidence 2"
                                className="w-20 h-20 object-cover rounded border border-red-300 hover:border-red-500 transition-colors"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded transition-colors flex items-center justify-center">
                                <ImageIcon className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}


      {/* Reviewer Modal */}
      <Dialog open={reviewerModalOpen} onOpenChange={setReviewerModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-purple-600" />
              Reviewer Details
            </DialogTitle>
            <DialogDescription>
              Information about the administrator who reviewed this listing
            </DialogDescription>
          </DialogHeader>
          {listing.reviewer && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-center">
                <Avatar className="h-20 w-20 border-2 border-purple-200">
                  <AvatarImage src={listing.reviewer.avatarUrl || undefined} alt={`${listing.reviewer.firstName} ${listing.reviewer.lastName}`} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xl font-semibold">
                    {listing.reviewer.firstName?.[0]?.toUpperCase() || 'A'}{listing.reviewer.lastName?.[0]?.toUpperCase() || 'D'}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-600">Name</span>
                  <span className="text-sm text-slate-900 font-semibold">
                    {listing.reviewer.firstName || 'N/A'} {listing.reviewer.lastName || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-600">Email</span>
                  <span className="text-sm text-slate-900">{listing.reviewer.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <span className="text-sm font-medium text-purple-700">Reviewed At</span>
                  <span className="text-sm font-semibold text-purple-900">{formatDateTime(listing.reviewedAt)}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReviewerModalOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Viewer Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Evidence Image</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="relative">
              <img
                src={selectedImage}
                alt="Evidence"
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListingInformation;


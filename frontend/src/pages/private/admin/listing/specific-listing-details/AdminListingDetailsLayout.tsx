import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSpecificListingAdminRequest, getListingUnitAndPropertyRequest, updateListingStatusRequest } from "@/api/admin/listingApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  Sparkles, 
  Shield,
  Ban,
  CheckCircle2
} from "lucide-react";
import ListingInformation from "./ListingInformationSection";
import PropertyUnitSection from "./PropertyUnitSection";

interface ListingDetailsResponse {
  listing: any;
}

const AdminListingDetails = () => {
  const { listingId } = useParams();
  const [data, setData] = useState<any | null>(null);
  const [unitPropertyData, setUnitPropertyData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [unitPropertyLoading, setUnitPropertyLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = sessionStorage.getItem(`adminListingTab_${listingId}`);
    return saved || "listing";
  });

  useEffect(() => {
    if (!listingId) return;
    const abort = new AbortController();
    
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await getSpecificListingAdminRequest(listingId as string, { signal: abort.signal });
        const body: ListingDetailsResponse = res.data;
        setData(body.listing ?? null);
      } catch (err: any) {
        if (err?.name === "CanceledError") return;
        setError("Failed to load listing details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    load();
    return () => abort.abort();
  }, [listingId]);

  useEffect(() => {
    if (!listingId) return;
    const abort = new AbortController();
    
    async function loadUnitProperty() {
      try {
        setUnitPropertyLoading(true);
        const res = await getListingUnitAndPropertyRequest(listingId as string, { signal: abort.signal });
        setUnitPropertyData(res.data);
      } catch (err: any) {
        if (err?.name === "CanceledError") return;
        console.error("Failed to load unit and property data", err);
      } finally {
        setUnitPropertyLoading(false);
      }
    }
    
    loadUnitProperty();
    return () => abort.abort();
  }, [listingId]);

  useEffect(() => {
    if (listingId && activeTab) {
      sessionStorage.setItem(`adminListingTab_${listingId}`, activeTab);
    }
  }, [activeTab, listingId]);


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

  const getStatusGradient = (status: string) => {
    switch ((status || "").toUpperCase()) {
      case 'WAITING_PAYMENT': return 'from-blue-200/70 via-blue-100/50 to-blue-200/70';
      case 'WAITING_REVIEW': return 'from-purple-200/70 via-purple-100/50 to-indigo-200/70';
      case 'VISIBLE': return 'from-emerald-200/70 via-emerald-100/50 to-emerald-200/70';
      case 'HIDDEN': return 'from-teal-200/70 via-teal-100/50 to-teal-200/70';
      case 'EXPIRED': return 'from-gray-200/70 via-gray-100/50 to-gray-200/70';
      case 'FLAGGED': return 'from-amber-200/70 via-amber-100/50 to-amber-200/70';
      case 'BLOCKED': return 'from-red-200/70 via-red-100/50 to-red-200/70';
      default: return 'from-gray-200/70 via-gray-100/50 to-gray-200/70';
    }
  };

  const getStatusBlurColor = (status: string, variant: 'light' | 'dark' = 'light') => {
    const colors: Record<string, { light: string; dark: string }> = {
      WAITING_PAYMENT: { light: 'bg-blue-200/40', dark: 'bg-blue-300/40' },
      WAITING_REVIEW: { light: 'bg-purple-200/40', dark: 'bg-purple-300/40' },
      VISIBLE: { light: 'bg-emerald-200/40', dark: 'bg-emerald-300/40' },
      HIDDEN: { light: 'bg-teal-200/40', dark: 'bg-teal-300/40' },
      EXPIRED: { light: 'bg-gray-200/40', dark: 'bg-gray-300/40' },
      FLAGGED: { light: 'bg-amber-200/40', dark: 'bg-amber-300/40' },
      BLOCKED: { light: 'bg-red-200/40', dark: 'bg-red-300/40' },
    };
    const statusKey = (status || "").toUpperCase();
    return colors[statusKey]?.[variant] || colors.WAITING_PAYMENT[variant];
  };

  const handleApprove = async () => {
    if (!listingId) return;
    try {
      setActionLoading(true);
      await updateListingStatusRequest(listingId as string, {
        action: "approve",
      });
      setApproveModalOpen(false);
      // Reload data after approval
      const res = await getSpecificListingAdminRequest(listingId);
      setData(res.data.listing);
    } catch (err: any) {
      console.error("Failed to approve listing", err);
      alert("Failed to approve listing. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFlag = async () => {
    if (!listingId || !flagReason.trim()) {
      alert("Please provide a reason for flagging");
      return;
    }
    try {
      setActionLoading(true);
      await updateListingStatusRequest(listingId as string, {
        action: "flag",
        reason: flagReason.trim(),
      });
      setFlagModalOpen(false);
      setFlagReason("");
      // Reload data after flagging
      const res = await getSpecificListingAdminRequest(listingId);
      setData(res.data.listing);
    } catch (err: any) {
      console.error("Failed to flag listing", err);
      const errorMessage = err?.response?.data?.error || "Failed to flag listing. Please try again.";
      alert(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlock = async () => {
    if (!listingId || !blockReason.trim()) {
      alert("Please provide a reason for blocking");
      return;
    }
    try {
      setActionLoading(true);
      await updateListingStatusRequest(listingId as string, {
        action: "block",
        reason: blockReason.trim(),
      });
      setBlockModalOpen(false);
      setBlockReason("");
      // Reload data after blocking
      const res = await getSpecificListingAdminRequest(listingId);
      setData(res.data.listing);
    } catch (err: any) {
      console.error("Failed to block listing", err);
      const errorMessage = err?.response?.data?.error || "Failed to block listing. Please try again.";
      alert(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-white/90 backdrop-blur-sm shadow-lg">
            <CardContent className="pt-8 pb-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Listing</h3>
                <p className="text-red-600">{error || 'Listing not found'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const listing = data;
  // Extract unit, property, and landlord from the API response
  // The API returns: { unit, property, landlord }
  const unitFromApi = unitPropertyData?.unit || null;
  const propertyFromApi = unitPropertyData?.property || null;
  const landlordFromApi = unitPropertyData?.landlord || null;
  
  // Construct unitProperty object (unit with nested property) for PropertyUnitSection
  const unitProperty = unitFromApi && propertyFromApi 
    ? { ...unitFromApi, property: propertyFromApi }
    : null;
  const landlordInfo = landlordFromApi || null;
  
  // Fallback to listing data for display in header if unitProperty data is not available
  const unit = unitProperty || listing?.unit;
  const property = unitProperty?.property || listing?.unit?.property;

  // Moderation Actions Component (reusable)
  const ModerationActions = () => {
    const status = (listing.lifecycleStatus || "").toUpperCase();
    
    // Don't show any actions if listing is EXPIRED (it's done/final)
    if (status === "EXPIRED") {
      return null;
    }
    
    // Determine which buttons to show based on status
    const showApprove = status !== "VISIBLE" && status !== "HIDDEN" && status !== "EXPIRED";
    const showFlag = status !== "EXPIRED"; // Allow flagging even if already FLAGGED
    const showBlock = status !== "BLOCKED" && status !== "EXPIRED";
    
    // Don't render the card if no actions are available
    if (!showApprove && !showFlag && !showBlock) {
      return null;
    }
    
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-slate-900">Moderation Actions</CardTitle>
          <CardDescription>Manage listing status and moderation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {showApprove && (
              <Button 
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
                onClick={() => setApproveModalOpen(true)}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve Listing
              </Button>
            )}
            {showFlag && (
              <Button 
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                onClick={() => setFlagModalOpen(true)}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Flag Listing
              </Button>
            )}
            {showBlock && (
              <Button 
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white"
                onClick={() => setBlockModalOpen(true)}
              >
                <Ban className="h-4 w-4 mr-2" />
                Block Listing
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Custom Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl"
        >
          <div className={`absolute inset-0 -z-10 bg-gradient-to-r ${getStatusGradient(listing.lifecycleStatus)} opacity-90`} />
          <div className="relative m-[1px] rounded-[15px] bg-white/70 backdrop-blur-md border border-white/50">
            <motion.div
              aria-hidden
              className={`pointer-events-none absolute -top-10 -left-10 h-40 w-40 rounded-full ${getStatusBlurColor(listing.lifecycleStatus, 'light')} blur-3xl`}
              initial={{ opacity: 0.5, scale: 0.9 }}
              animate={{ opacity: 0.8, scale: 1 }}
              transition={{ duration: 2.2, repeat: Infinity, repeatType: "mirror" }}
            />
            <motion.div
              aria-hidden
              className={`pointer-events-none absolute -bottom-10 -right-10 h-48 w-48 rounded-full ${getStatusBlurColor(listing.lifecycleStatus, 'dark')} blur-3xl`}
              initial={{ opacity: 0.4, scale: 1 }}
              animate={{ opacity: 0.75, scale: 1.1 }}
              transition={{ duration: 2.8, repeat: Infinity, repeatType: "mirror" }}
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-300/60 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />
            
            <div className="px-4 sm:px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 260, damping: 18 }}
                    className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 text-white grid place-items-center shadow-md"
                  >
                    <Shield className="h-5 w-5" />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-gray-900 truncate">
                        Admin Listing Details
                      </h1>
                      <Sparkles className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-sm text-gray-600 leading-5 truncate">
                      {unit?.label} • {property?.title}
                    </p>
                    {property && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {[property.street, property.barangay, property.zipCode, property.city?.name, property.municipality?.name]
                          .filter(Boolean)
                          .join(', ') || 'N/A'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getStatusColor(listing.lifecycleStatus) + " text-sm py-1.5 px-3"}>
                    {listing.lifecycleStatus.replace(/_/g, ' ')}
                  </Badge>
                  <Badge className={listing.isFeatured ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200 text-sm py-1.5 px-3 flex items-center gap-1" : "bg-gray-100 text-gray-600 border-gray-200 text-sm py-1.5 px-3 flex items-center gap-1"}>
                    <Sparkles className="h-3 w-3" />
                    {listing.isFeatured ? 'Featured' : 'Not Featured'}
                  </Badge>
                </div>
              </div>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                style={{ originX: 0 }}
                className="mt-3 h-0.5 w-full bg-gradient-to-r from-emerald-400/70 via-emerald-300/70 to-sky-400/70 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="listing" className="min-w-[120px]">Listing Information</TabsTrigger>
            <TabsTrigger value="property" className="min-w-[120px]">Property & Unit</TabsTrigger>
          </TabsList>

          {/* Listing Information Tab */}
          <TabsContent value="listing" className="mt-4 space-y-6">
            <ModerationActions />
            <ListingInformation listing={listing} loading={loading} />
          </TabsContent>

          {/* Property & Unit Tab */}
          <TabsContent value="property" className="mt-4 space-y-6">
            <ModerationActions />
            <PropertyUnitSection unitProperty={unitProperty} landlordInfo={landlordInfo} loading={unitPropertyLoading} />
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {/* Approve Listing Modal */}
        <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                Approve Listing
              </DialogTitle>
              <DialogDescription>
                Approve this listing to make it visible to users.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setApproveModalOpen(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {actionLoading ? 'Approving...' : 'Approve Listing'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Flag Listing Modal */}
        <Dialog open={flagModalOpen} onOpenChange={setFlagModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                Flag Listing
              </DialogTitle>
              <DialogDescription>
                Flag this listing for review. Please provide a reason for flagging.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-amber-800 mb-2 block">
                  Flagged Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border border-amber-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                  rows={4}
                  placeholder="Enter the reason for flagging this listing..."
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setFlagModalOpen(false);
                  setFlagReason("");
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                onClick={handleFlag}
                disabled={actionLoading}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                {actionLoading ? 'Flagging...' : 'Flag Listing'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Block Listing Modal */}
        <Dialog open={blockModalOpen} onOpenChange={setBlockModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5 text-red-600" />
                Block Listing
              </DialogTitle>
              <DialogDescription>
                Block this listing immediately. This action will hide the listing from users. Please provide a reason.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-red-800 mb-2 block">
                  Blocked Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border border-red-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-200"
                  rows={4}
                  placeholder="Enter the reason for blocking this listing..."
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setBlockModalOpen(false);
                  setBlockReason("");
                }}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white"
                onClick={handleBlock}
                disabled={actionLoading}
              >
                <Ban className="h-4 w-4 mr-2" />
                {actionLoading ? 'Blocking...' : 'Block Listing'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminListingDetails;

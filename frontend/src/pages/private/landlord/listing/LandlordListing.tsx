import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, Calendar, Building, Eye, EyeOff, Clock, Ban, Star, TrendingUp, CheckCircle2, Flag, Info, ChevronDown, ChevronUp, FileSearch, RefreshCcw, Loader2, Sparkles, X, ArrowUpRight } from 'lucide-react';
import { getLandlordListingsRequest, getEligibleUnitsForListingRequest } from '@/api/landlord/listingApi';
import { getPropertiesWithUnitsRequest } from '@/api/landlord/financialApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Address {
  street: string;
  barangay: string;
  zipCode: string;
  city: string;
  municipality: string | null;
}

interface Property {
  id: string; 
  title: string;
  type: string;
}

interface Unit {
  id: string;
  label: string;
}

interface EligibleProperty {
  id: string;
  title: string;
  type: string;
  address: Address;
  units: {
    id: string;
    label: string;
    createdAt: string;
    updatedAt: string;
  }[];
}


interface Payment {
  providerName: string | null;
  amount: number | null;
  date: string | null;
}

interface Listing {
  id: string;
  lifecycleStatus: 'WAITING_REVIEW' | 'VISIBLE' | 'HIDDEN' | 'EXPIRED' | 'BLOCKED' | 'FLAGGED';
  isFeatured: boolean;
  expiresAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  payment: Payment;
  unit: Unit;
  property: Property;
}

const LandlordListing = () => {
  const navigate = useNavigate();
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState<{id: string, title: string}[]>([]);
  const [isActiveExpanded, setIsActiveExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpToPage, setJumpToPage] = useState('');
  const itemsPerPage = 10;

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [eligibleProperties, setEligibleProperties] = useState<EligibleProperty[]>([]);
  const [selectedEligibleProperty, setSelectedEligibleProperty] = useState<string>('');
  const [selectedEligibleUnit, setSelectedEligibleUnit] = useState<string>('');
  const [loadingEligible, setLoadingEligible] = useState(false);
  const [eligibleError, setEligibleError] = useState<string | null>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(true);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const statusConfig = {
    WAITING_REVIEW: {
      title: 'Waiting Review',
      icon: FileSearch,
      count: 0,
      color: 'bg-gradient-to-r from-purple-600 to-indigo-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      description: 'Payment complete, waiting admin review'
    },
    VISIBLE: {
      title: 'Visible',
      icon: Eye,
      count: 0,
      color: 'bg-gradient-to-r from-emerald-400 to-emerald-500',
      bgColor: 'bg-emerald-100',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700',
      description: 'Active and visible to tenants'
    },
    HIDDEN: {
      title: 'Hidden',
      icon: EyeOff,
      count: 0,
      color: 'bg-gradient-to-r from-teal-400 to-teal-500',
      bgColor: 'bg-teal-100',
      borderColor: 'border-teal-200',
      textColor: 'text-teal-700',
      description: 'Temporarily hidden from search'
    },
    EXPIRED: {
      title: 'Expired',
      icon: Clock,
      count: 0,
      color: 'bg-gradient-to-r from-gray-400 to-gray-500',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-200',
      textColor: 'text-gray-700',
      description: 'Listings that have reached expiry date'
    },
    BLOCKED: {
      title: 'Blocked',
      icon: Ban,
      count: 0,
      color: 'bg-gradient-to-r from-red-600 to-rose-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200',
      textColor: 'text-red-700',
      description: 'Suspended by administration'
    },
    FLAGGED: {
      title: 'Flagged',
      icon: Flag,
      count: 0,
      color: 'bg-gradient-to-r from-amber-600 to-orange-600',
      bgColor: 'bg-amber-100',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-700',
      description: 'Flagged for review'
    }
  };

  const sortListings = (listings: Listing[], order: 'newest' | 'oldest') => {
    return [...listings].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return order === 'newest' ? dateB - dateA : dateA - dateB;
    });
  };

  // Helper function to check if listing is more than 1 week old based on createdAt
  const isMoreThanOneWeekOld = (dateString: string): boolean => {
    const date = new Date(dateString);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return date < oneWeekAgo;
  };

  // Separate listings into current and history
  // History: EXPIRED or BLOCKED listings that are more than 1 week old (based on createdAt)
  // Current: Everything else (including EXPIRED/BLOCKED that are less than 1 week old)
  const getHistoryListings = (listings: Listing[]): Listing[] => {
    return listings.filter(listing => {
      const status = listing.lifecycleStatus;
      if (status === 'EXPIRED' || status === 'BLOCKED') {
        // Check if it's more than 1 week old based on createdAt
        return isMoreThanOneWeekOld(listing.createdAt);
      }
      return false;
    });
  };

  const getCurrentListings = (listings: Listing[]): Listing[] => {
    // Get history listings first
    const historyListings = getHistoryListings(listings);
    const historyIds = new Set(historyListings.map(l => l.id));
    
    // Current listings are all listings that are NOT in history
    return listings.filter(listing => !historyIds.has(listing.id));
  };

  const applyFilters = (propertyId: string, status: string, query: string, listingsToFilter?: Listing[]) => {
    const listings = listingsToFilter || allListings;
    
    // First, filter by tab (current or history)
    let filtered = activeTab === 'current' 
      ? getCurrentListings(listings)
      : getHistoryListings(listings);

    // Filter by property
    if (propertyId !== 'all') {
      filtered = filtered.filter(listing => listing.property.id === propertyId);
    }

    // Filter by status (only for current tab, history tab shows all EXPIRED/BLOCKED)
    if (status !== 'all' && activeTab === 'current') {
      if (status === 'active') {
        // Active includes both VISIBLE and HIDDEN
        filtered = filtered.filter(listing => 
          listing.lifecycleStatus === 'VISIBLE' || listing.lifecycleStatus === 'HIDDEN'
        );
      } else {
        filtered = filtered.filter(listing => listing.lifecycleStatus === status);
      }
    }

    // Filter by search query (use debounced query)
    if (query) {
      filtered = filtered.filter(listing => 
        listing.unit.label.toLowerCase().includes(query.toLowerCase()) ||
        listing.property.title.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply sorting (always newest first)
    filtered = sortListings(filtered, 'newest');

    setFilteredListings(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const fetchListings = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setRefreshing(true);
      setError(null);
      
      const [listingsRes, propertiesRes] = await Promise.all([
        getLandlordListingsRequest(),
        getPropertiesWithUnitsRequest(),
      ]);
      
      const listingsData: Listing[] = listingsRes.data.listings;
      
      // Sort by latest first initially (don't filter out expired - they'll be in history tab)
      const sortedListings = sortListings(listingsData, 'newest');
      setAllListings(sortedListings);
      
      // Get all properties from the properties API (not just from listings)
      const allProperties = propertiesRes.data.properties || [];
      setProperties(allProperties.map((prop: any) => ({
        id: prop.id,
        title: prop.title
      })));

      // Apply initial filter
      applyFilters('all', 'all', '', sortedListings);
    } catch (err) {
      setError('Failed to fetch listings');
      console.error('Error fetching listings:', err);
    } finally {
      if (!silent) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  }, []);

  const fetchEligibleUnits = async () => {
    try {
      setLoadingEligible(true);
      setEligibleError(null);
      const response = await getEligibleUnitsForListingRequest();
      // Filter out properties that don't have any units
      const propertiesWithUnits = response.data.properties.filter(
        (property: EligibleProperty) => property.units && property.units.length > 0
      );
      setEligibleProperties(propertiesWithUnits);
    } catch (err) {
      setEligibleError('Failed to load eligible units');
      console.error('Error fetching eligible units:', err);
    } finally {
      setLoadingEligible(false);
    }
  };

  const handleStatusClick = (status: string) => {
    if (status === 'active') {
      setIsActiveExpanded(!isActiveExpanded);
      setSelectedStatus(status);
      applyFilters(selectedProperty, status, searchQuery);
    } else {
      setIsActiveExpanded(false);
      setSelectedStatus(status);
      applyFilters(selectedProperty, status, searchQuery);
    }
  };


  const handlePropertyFilterChange = (propertyId: string) => {
    setSelectedProperty(propertyId);
    applyFilters(propertyId, selectedStatus, searchQuery);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    applyFilters(selectedProperty, selectedStatus, query);
  };

  const handleClearFilters = () => {
    setSelectedProperty('all');
    setSelectedStatus('all');
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setIsActiveExpanded(false);
    applyFilters('all', 'all', '');
  };

  const handleRemoveStatusFilter = () => {
    setSelectedStatus('all');
    applyFilters(selectedProperty, 'all', debouncedSearchQuery);
  };

  const handleRemovePropertyFilter = () => {
    setSelectedProperty('all');
    applyFilters('all', selectedStatus, debouncedSearchQuery);
  };

  const handleRemoveSearchFilter = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
    applyFilters(selectedProperty, selectedStatus, '');
  };

  const handleCreateListing = () => {
    setIsCreateModalOpen(true);
    fetchEligibleUnits();
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setSelectedEligibleProperty('');
    setSelectedEligibleUnit('');
    setEligibleError(null);
  };

  // Reset selections when modal opens
  useEffect(() => {
    if (isCreateModalOpen) {
      setSelectedEligibleProperty('');
      setSelectedEligibleUnit('');
    }
  }, [isCreateModalOpen]);

  const handleContinueToReview = () => {
    if (selectedEligibleUnit) {
      handleCloseModal();
      navigate(`/landlord/listing/${selectedEligibleUnit}/review`);
    }
  };

  const handleViewDetails = (listingId: string) => {
    navigate(`/landlord/listing/${listingId}/details`);
  };

  const handleJumpToPage = () => {
    const page = parseInt(jumpToPage);
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setJumpToPage('');
    }
  };


  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge 
        className={`${config.bgColor} ${config.textColor} border ${config.borderColor} font-medium px-3 py-1.5`}
        variant="outline"
      >
        <config.icon className="h-3.5 w-3.5 mr-1.5" />
        {config.title}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatRelativeDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}mo ago`;
    return formatDate(dateString);
  };

  const getPaymentStatus = (listing: Listing) => {
    if (listing.payment.providerName && listing.payment.date) {
      return { status: `Paid (${listing.payment.providerName})`, color: 'text-emerald-700 bg-emerald-100 border-emerald-200' };
    }
    return { status: 'No Payment', color: 'text-gray-700 bg-gray-100 border-gray-200' };
  };

  // Calculate current and history listings
  const currentListings = getCurrentListings(allListings);
  const historyListings = getHistoryListings(allListings);

  // Calculate counts for each status (only for current listings)
  const statusCounts = currentListings.reduce((acc, listing) => {
    acc[listing.lifecycleStatus] = (acc[listing.lifecycleStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate active listings (VISIBLE + HIDDEN) from current listings
  const activeListings = currentListings.filter(
    listing => listing.lifecycleStatus === 'VISIBLE' || listing.lifecycleStatus === 'HIDDEN'
  ).length;

  // Pagination calculations
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedListings = filteredListings.slice(startIndex, endIndex);

  const selectedPropertyData = eligibleProperties.find(p => p.id === selectedEligibleProperty);
  const availableUnits = selectedPropertyData?.units || [];

  const handleRefresh = () => {
    if (!refreshing) {
      fetchListings({ silent: true });
    }
  };

  // Add useEffect to fetch listings on component mount
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Re-apply filters when tab changes or debounced search changes
  useEffect(() => {
    applyFilters(selectedProperty, selectedStatus, debouncedSearchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, debouncedSearchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Listing Lifecycle Management Dashboard Skeleton */}
          <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
            <CardHeader className="pb-2 pt-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  <Skeleton className="h-7 w-7 rounded" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-3 w-96" />
                  </div>
                </div>
                <Skeleton className="h-9 w-32" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-3">
              {/* Lifecycle Stages Skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="p-3 rounded-lg border-2 border-slate-200 bg-white">
                    <div className="flex items-start gap-2.5">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-2.5 w-16" />
                        <Skeleton className="h-5 w-8" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Filters Skeleton */}
          <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
            <CardContent className="p-3">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-8 flex-1 min-w-[200px]" />
                <Skeleton className="h-8 w-[160px]" />
                <Skeleton className="h-8 w-[120px]" />
                <Skeleton className="h-8 w-20" />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </CardContent>
          </Card>

          {/* Listings Table Skeleton */}
          <Card className="bg-white/80 backdrop-blur-sm border-blue-100 overflow-hidden">
            <CardHeader className="pb-2 pt-3 px-4 bg-gradient-to-r from-blue-50 to-transparent">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-12 rounded-full" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border-0">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-blue-50 to-emerald-50">
                    <TableRow className="hover:bg-transparent border-blue-100">
                      {[...Array(9)].map((_, i) => (
                        <TableHead key={i} className="py-2">
                          <Skeleton className="h-4 w-20" />
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...Array(5)].map((_, i) => (
                      <TableRow key={i} className="border-b border-blue-50">
                        <TableCell className="py-2">
                          <div className="flex items-start space-x-2">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <div className="space-y-1 flex-1">
                              <Skeleton className="h-3 w-24" />
                              <Skeleton className="h-2.5 w-32" />
                              <Skeleton className="h-2.5 w-20" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <Skeleton className="h-3 w-40" />
                        </TableCell>
                        <TableCell className="py-2">
                          <Skeleton className="h-6 w-20 rounded-full" />
                        </TableCell>
                        <TableCell className="py-2">
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </TableCell>
                        <TableCell className="py-2">
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </TableCell>
                        <TableCell className="py-2">
                          <Skeleton className="h-3 w-24" />
                        </TableCell>
                        <TableCell className="py-2">
                          <Skeleton className="h-3 w-24" />
                        </TableCell>
                        <TableCell className="py-2">
                          <Skeleton className="h-3 w-24" />
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-1.5 justify-end">
                            <Skeleton className="h-7 w-7 rounded" />
                            <Skeleton className="h-7 w-7 rounded" />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 p-4">
        <div className="max-w-7xl mx-auto">
          <Card className="border-red-200 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-red-800 mb-4">{error}</p>
                <Button onClick={() => fetchListings()} variant="destructive">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-sky-200/80 via-cyan-200/75 to-emerald-200/70 opacity-95" />
          <div className="relative m-[1px] rounded-[16px] bg-white/85 backdrop-blur-lg border border-white/60 shadow-lg">
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -top-12 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-sky-300/50 to-cyan-400/40 blur-3xl"
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

            <div className="px-4 sm:px-6 py-5 space-y-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: [0, -3, 3, 0] }}
                    className="relative flex-shrink-0"
                  >
                    <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-sky-600 via-cyan-600 to-emerald-600 text-white grid place-items-center shadow-xl shadow-cyan-500/30">
                      <Building className="h-5 w-5 relative z-10" />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                    </div>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 220 }}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white text-sky-600 border border-sky-100 shadow-sm grid place-items-center"
                    >
                      <Sparkles className="h-3 w-3" />
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
                        Listing Management
                      </h1>
                      <motion.div
                        animate={{ rotate: [0, 8, -8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Sparkles className="h-4 w-4 text-cyan-500" />
                      </motion.div>
                    </div>
                    <p className="text-sm text-slate-600 leading-6 flex items-center gap-1.5">
                      <Building className="h-4 w-4 text-emerald-500" />
                      Manage your unit listings and status
                    </p>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                  <Button
                    onClick={() => handleRefresh()}
                    disabled={refreshing}
                    className="h-11 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 px-5 text-sm font-semibold text-white shadow-md shadow-cyan-500/30 hover:brightness-110 disabled:opacity-70"
                  >
                    {refreshing ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Refreshing
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <RefreshCcw className="h-4 w-4" />
                        Refresh
                      </span>
                    )}
                  </Button>
                  <Button 
                    onClick={handleCreateListing} 
                    className="h-11 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 px-5 text-sm font-semibold text-white shadow-md shadow-blue-500/30 hover:brightness-110"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Listing
                  </Button>
                </div>
              </div>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
                style={{ originX: 0 }}
                className="relative h-1 w-full rounded-full overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400/80 via-cyan-400/80 to-emerald-400/80" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Tabs Section */}
        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={(value) => {
              setActiveTab(value as 'current' | 'history');
              setSelectedStatus('all'); // Reset status filter when switching tabs
            }} className="w-full">
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
                    <Building className={`w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 ${activeTab === 'current' ? 'text-emerald-700' : 'text-gray-500'}`} />
                    <span className="relative z-10">Current</span>
                    {currentListings.length > 0 && (
                      <Badge className={`relative z-10 ml-1.5 text-[10px] px-1.5 py-0 ${activeTab === 'current' ? 'bg-emerald-600 text-white' : 'bg-gray-300 text-gray-700'}`}>
                        {currentListings.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="history" 
                    className={`relative flex-1 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-medium transition-all overflow-hidden ${
                      activeTab === 'history' 
                        ? `bg-gradient-to-r from-gray-500 to-slate-500/20 text-gray-700 border border-gray-200/50 shadow-sm backdrop-blur-sm` 
                        : `bg-gray-50/50 border border-gray-200 text-gray-600 hover:bg-gray-100/50`
                    }`}
                  >
                    {activeTab === 'history' && (
                      <div className={`absolute inset-0 bg-gradient-to-r from-gray-500 to-slate-500/10 opacity-50`} />
                    )}
                    <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 relative z-10 ${activeTab === 'history' ? 'text-gray-700' : 'text-gray-500'}`} />
                    <span className="relative z-10">History</span>
                    {getHistoryListings(allListings).length > 0 && (
                      <Badge className={`relative z-10 ml-1.5 text-[10px] px-1.5 py-0 ${activeTab === 'history' ? 'bg-gray-600 text-white' : 'bg-gray-300 text-gray-700'}`}>
                        {getHistoryListings(allListings).length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Current Tab Content */}
              <TabsContent value="current" className="mt-0 space-y-4">
                {/* Combined Search, Filters & Status Overview Section */}
                <div className="px-4 pt-4 pb-4 border-b border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                        className="h-7 w-7 p-0 hover:bg-slate-100"
                        title={isSearchExpanded ? "Collapse" : "Expand"}
                      >
                        {isSearchExpanded ? (
                          <ChevronUp className="h-4 w-4 text-slate-600" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-600" />
                        )}
                      </Button>
                      <CardTitle className="text-sm font-semibold text-slate-900">Search, Filters & Status Overview</CardTitle>
                    </div>
                  </div>
                  {isSearchExpanded && (
                    <>
                      {/* Search & Filters */}
                      <div className="mb-4 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Search - Compact design */}
                          <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                              <Input
                                placeholder="Search by unit or property..."
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-9 pr-9 h-8 text-xs border-slate-200 focus:border-slate-400"
                              />
                              {searchQuery !== debouncedSearchQuery && (
                                <Loader2 className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400 animate-spin" />
                              )}
                            </div>
                          </div>

                          {/* Property Filter */}
                          <Select value={selectedProperty} onValueChange={handlePropertyFilterChange}>
                            <SelectTrigger className="h-8 w-[160px] text-xs border-slate-200">
                              <SelectValue placeholder="All Properties" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Properties</SelectItem>
                              {properties.map(property => (
                                <SelectItem key={property.id} value={property.id}>
                                  {property.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Clear Filters */}
                          <Button 
                            variant="outline" 
                            onClick={handleClearFilters}
                            className="h-8 text-xs border-slate-200 text-slate-700 hover:bg-slate-50 px-3"
                          >
                            Clear
                          </Button>
                        </div>

                        {/* Active Filters Summary */}
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          <span className="font-medium text-gray-700">
                            {filteredListings.length} of {currentListings.length} listings
                          </span>
                          {selectedStatus === 'active' && (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 flex items-center gap-1.5 px-2 py-0.5">
                              Active Listings
                              <button
                                onClick={handleRemoveStatusFilter}
                                className="ml-1 hover:bg-emerald-200 rounded-full p-0.5 transition-colors"
                                aria-label="Remove active filter"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          )}
                          {selectedStatus !== 'all' && selectedStatus !== 'active' && (
                            <Badge variant="secondary" className={`${statusConfig[selectedStatus as keyof typeof statusConfig]?.bgColor} ${statusConfig[selectedStatus as keyof typeof statusConfig]?.textColor} flex items-center gap-1.5 px-2 py-0.5`}>
                              {statusConfig[selectedStatus as keyof typeof statusConfig]?.title}
                              <button
                                onClick={handleRemoveStatusFilter}
                                className="ml-1 hover:opacity-70 rounded-full p-0.5 transition-opacity"
                                aria-label={`Remove ${statusConfig[selectedStatus as keyof typeof statusConfig]?.title} filter`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          )}
                          {selectedProperty !== 'all' && (
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 flex items-center gap-1.5 px-2 py-0.5">
                              {properties.find(p => p.id === selectedProperty)?.title}
                              <button
                                onClick={handleRemovePropertyFilter}
                                className="ml-1 hover:bg-emerald-200 rounded-full p-0.5 transition-colors"
                                aria-label="Remove property filter"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          )}
                          {searchQuery && (
                            <Badge variant="secondary" className="bg-amber-100 text-amber-800 flex items-center gap-1.5 px-2 py-0.5">
                              "{searchQuery}"
                              <button
                                onClick={handleRemoveSearchFilter}
                                className="ml-1 hover:bg-amber-200 rounded-full p-0.5 transition-colors"
                                aria-label="Remove search filter"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Status Overview Cards */}
                      <div className="pt-3 border-t border-slate-200">
                        <div className="mb-3">
                          <CardTitle className="text-xs font-semibold text-slate-700">Status Overview</CardTitle>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {/* Stage 1: Waiting Review */}
                <motion.button
                  type="button"
                  onClick={() => handleStatusClick('WAITING_REVIEW')}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative rounded-xl border-2 p-3 flex items-center gap-3 shadow-[0_2px_12px_-6px_rgba(15,23,42,0.25)] transition-all group ${
                    selectedStatus === 'WAITING_REVIEW'
                      ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-400 shadow-md'
                      : 'bg-white border-purple-200 hover:border-purple-300 hover:shadow-md'
                  }`}
                  title={statusConfig.WAITING_REVIEW.description}
                >
                  <motion.div 
                    className="h-10 w-10 rounded-lg bg-purple-500 grid place-items-center"
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.3 }}
                  >
                    <FileSearch className="h-4 w-4 text-white" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wide text-purple-600 font-medium">Waiting Review</p>
                    <motion.p 
                      className="text-lg font-semibold text-purple-900"
                      key={statusCounts['WAITING_REVIEW'] || 0}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {statusCounts['WAITING_REVIEW'] || 0}
                    </motion.p>
                  </div>
                  {(statusCounts['WAITING_REVIEW'] || 0) === 0 && (
                    <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-purple-300 opacity-50" />
                  )}
                </motion.button>

                {/* Stage 2: Active (with VISIBLE/HIDDEN inside) */}
                <motion.button
                  type="button"
                  onClick={() => handleStatusClick('active')}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative rounded-xl border-2 p-3 flex items-center gap-3 shadow-[0_2px_12px_-6px_rgba(15,23,42,0.25)] transition-all group ${
                    selectedStatus === 'active' || selectedStatus === 'VISIBLE' || selectedStatus === 'HIDDEN'
                      ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400 shadow-md'
                      : 'bg-white border-emerald-200 hover:border-emerald-300 hover:shadow-md'
                  }`}
                  title="Active listings (Visible + Hidden)"
                >
                  <motion.div 
                    className="h-10 w-10 rounded-lg bg-emerald-500 grid place-items-center"
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.3 }}
                  >
                    <TrendingUp className="h-4 w-4 text-white" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wide text-emerald-600 font-medium">Active</p>
                    <motion.p 
                      className="text-lg font-semibold text-emerald-900"
                      key={activeListings}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {activeListings}
                    </motion.p>
                  </div>
                  {activeListings === 0 && (
                    <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-300 opacity-50" />
                  )}
                </motion.button>

                {/* Stage 3: Flagged */}
                <motion.button
                  type="button"
                  onClick={() => handleStatusClick('FLAGGED')}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative rounded-xl border-2 p-3 flex items-center gap-3 shadow-[0_2px_12px_-6px_rgba(15,23,42,0.25)] transition-all group ${
                    selectedStatus === 'FLAGGED'
                      ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400 shadow-md'
                      : 'bg-white border-amber-200 hover:border-amber-300 hover:shadow-md'
                  }`}
                  title={statusConfig.FLAGGED.description}
                >
                  <motion.div 
                    className="h-10 w-10 rounded-lg bg-amber-500 grid place-items-center"
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.3 }}
                  >
                    <Flag className="h-4 w-4 text-white" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wide text-amber-600 font-medium">Flagged</p>
                    <motion.p 
                      className="text-lg font-semibold text-amber-900"
                      key={statusCounts['FLAGGED'] || 0}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {statusCounts['FLAGGED'] || 0}
                    </motion.p>
                  </div>
                  {(statusCounts['FLAGGED'] || 0) === 0 && (
                    <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-amber-300 opacity-50" />
                  )}
                </motion.button>

                {/* Stage 4: Blocked */}
                <motion.button
                  type="button"
                  onClick={() => handleStatusClick('BLOCKED')}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative rounded-xl border-2 p-3 flex items-center gap-3 shadow-[0_2px_12px_-6px_rgba(15,23,42,0.25)] transition-all group ${
                    selectedStatus === 'BLOCKED'
                      ? 'bg-red-50 border-red-300 ring-2 ring-red-400 shadow-md'
                      : 'bg-white border-red-200 hover:border-red-300 hover:shadow-md'
                  }`}
                  title={statusConfig.BLOCKED.description}
                >
                  <motion.div 
                    className="h-10 w-10 rounded-lg bg-red-500 grid place-items-center"
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.3 }}
                  >
                    <Ban className="h-4 w-4 text-white" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wide text-red-600 font-medium">Blocked</p>
                    <motion.p 
                      className="text-lg font-semibold text-red-900"
                      key={statusCounts['BLOCKED'] || 0}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {statusCounts['BLOCKED'] || 0}
                    </motion.p>
                  </div>
                  {(statusCounts['BLOCKED'] || 0) === 0 && (
                    <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-300 opacity-50" />
                  )}
                </motion.button>

                {/* Stage 5: Expired */}
                <motion.button
                  type="button"
                  onClick={() => handleStatusClick('EXPIRED')}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative rounded-xl border-2 p-3 flex items-center gap-3 shadow-[0_2px_12px_-6px_rgba(15,23,42,0.25)] transition-all group ${
                    selectedStatus === 'EXPIRED'
                      ? 'bg-gray-50 border-gray-300 ring-2 ring-gray-400 shadow-md'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                  title={statusConfig.EXPIRED.description}
                >
                  <motion.div 
                    className="h-10 w-10 rounded-lg bg-gray-500 grid place-items-center"
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.3 }}
                  >
                    <Clock className="h-4 w-4 text-white" />
                  </motion.div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs uppercase tracking-wide text-gray-600 font-medium">Expired</p>
                    <motion.p 
                      className="text-lg font-semibold text-gray-900"
                      key={statusCounts['EXPIRED'] || 0}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {statusCounts['EXPIRED'] || 0}
                    </motion.p>
                  </div>
                  {(statusCounts['EXPIRED'] || 0) === 0 && (
                    <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-gray-300 opacity-50" />
                  )}
                </motion.button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>

              {/* History Tab Content */}
              <TabsContent value="history" className="mt-0 space-y-4">
                {/* Filters Section - Above Table */}
                <div className="px-4 pt-4 pb-2 border-b border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                        className="h-7 w-7 p-0 hover:bg-slate-100"
                        title={isSearchExpanded ? "Collapse" : "Expand"}
                      >
                        {isSearchExpanded ? (
                          <ChevronUp className="h-4 w-4 text-slate-600" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-slate-600" />
                        )}
                      </Button>
                      <CardTitle className="text-sm font-semibold text-slate-900">Search & Filters</CardTitle>
                    </div>
                  </div>
                  {isSearchExpanded && (
                    <>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {/* Search */}
                        <div className="flex-1 min-w-[200px]">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                            <Input
                              placeholder="Search by unit or property..."
                              value={searchQuery}
                              onChange={(e) => handleSearchChange(e.target.value)}
                              className="pl-9 pr-9 h-8 text-xs border-slate-200 focus:border-slate-400"
                            />
                            {searchQuery !== debouncedSearchQuery && (
                              <Loader2 className="absolute right-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400 animate-spin" />
                            )}
                          </div>
                        </div>

                        {/* Property Filter */}
                        <Select value={selectedProperty} onValueChange={handlePropertyFilterChange}>
                          <SelectTrigger className="h-8 w-[160px] text-xs border-slate-200">
                            <SelectValue placeholder="All Properties" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Properties</SelectItem>
                            {properties.map(property => (
                              <SelectItem key={property.id} value={property.id}>
                                {property.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {/* Clear Filters */}
                        <Button 
                          variant="outline" 
                          onClick={handleClearFilters}
                          className="h-8 text-xs border-slate-200 text-slate-700 hover:bg-slate-50 px-3"
                        >
                          Clear
                        </Button>
                      </div>

                      {/* Active Filters Summary */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="font-medium text-gray-700">
                          {filteredListings.length} of {historyListings.length} listings
                        </span>
                        {selectedStatus !== 'all' && (
                          <Badge variant="secondary" className={`${statusConfig[selectedStatus as keyof typeof statusConfig]?.bgColor} ${statusConfig[selectedStatus as keyof typeof statusConfig]?.textColor} flex items-center gap-1.5 px-2 py-0.5`}>
                            {statusConfig[selectedStatus as keyof typeof statusConfig]?.title}
                            <button
                              onClick={handleRemoveStatusFilter}
                              className="ml-1 hover:opacity-70 rounded-full p-0.5 transition-opacity"
                              aria-label={`Remove ${statusConfig[selectedStatus as keyof typeof statusConfig]?.title} filter`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )}
                        {selectedProperty !== 'all' && (
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 flex items-center gap-1.5 px-2 py-0.5">
                            {properties.find(p => p.id === selectedProperty)?.title}
                            <button
                              onClick={handleRemovePropertyFilter}
                              className="ml-1 hover:bg-emerald-200 rounded-full p-0.5 transition-colors"
                              aria-label="Remove property filter"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )}
                        {searchQuery && (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800 flex items-center gap-1.5 px-2 py-0.5">
                            "{searchQuery}"
                            <button
                              onClick={handleRemoveSearchFilter}
                              className="ml-1 hover:bg-amber-200 rounded-full p-0.5 transition-colors"
                              aria-label="Remove search filter"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Listings Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 overflow-hidden">
          <CardHeader className="pb-2 pt-3 px-4 bg-gradient-to-r from-blue-50 to-transparent">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-900">
              {selectedStatus === 'all' 
                ? 'All Listings' 
                : selectedStatus === 'active'
                ? 'Active Listings'
                : statusConfig[selectedStatus as keyof typeof statusConfig]?.title}
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 text-xs">
                {filteredListings.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredListings.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 text-muted-foreground"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Building className="h-16 w-16 mx-auto mb-4 text-blue-200" />
                </motion.div>
                <p className="text-lg font-medium text-gray-600 mb-2">No listings found</p>
                <p className="text-sm text-gray-500 mb-6">
                  {selectedStatus === 'all' 
                    ? 'Create your first listing to get started'
                    : `No ${statusConfig[selectedStatus as keyof typeof statusConfig]?.title?.toLowerCase()} listings`
                  }
                </p>
                <div className="flex items-center justify-center gap-3">
                  {selectedStatus !== 'all' && (
                    <Button 
                      variant="outline" 
                      onClick={() => handleStatusClick('all')}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      View All Listings
                    </Button>
                  )}
                  {(selectedProperty !== 'all' || searchQuery) && (
                    <Button 
                      variant="outline" 
                      onClick={handleClearFilters}
                      className="border-slate-200 text-slate-700 hover:bg-slate-50"
                    >
                      Clear Filters
                    </Button>
                  )}
                  {selectedStatus === 'all' && (
                    <Button 
                      onClick={handleCreateListing}
                      className="bg-gradient-to-r from-blue-500 to-emerald-500 text-white hover:brightness-110"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Listing
                    </Button>
                  )}
                </div>
              </motion.div>
            ) : (
              <>
                <div className="border-0">
                  <Table>
                    <TableHeader className="bg-gradient-to-r from-blue-50 to-emerald-50">
                      <TableRow className="hover:bg-transparent border-blue-100">
                        <TableHead className="font-semibold text-blue-900 py-2 text-xs">Unit</TableHead>
                        <TableHead className="font-semibold text-blue-900 py-2 text-xs">Property</TableHead>
                        <TableHead className="font-semibold text-blue-900 py-2 text-xs">Status</TableHead>
                        <TableHead className="font-semibold text-blue-900 py-2 text-xs">Featured</TableHead>
                        <TableHead className="font-semibold text-blue-900 py-2 text-xs">Payment</TableHead>
                        <TableHead className="font-semibold text-blue-900 py-2 text-xs">Expires</TableHead>
                        <TableHead className="font-semibold text-blue-900 py-2 text-xs">Reviewed</TableHead>
                        <TableHead className="font-semibold text-blue-900 py-2 text-xs">Created</TableHead>
                        <TableHead className="font-semibold text-blue-900 py-2 text-xs text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedListings.map((listing) => {
                      const paymentStatus = getPaymentStatus(listing);
                      return (
                        <TableRow 
                          key={listing.id} 
                          className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-emerald-50/50 border-b border-blue-50 transition-all duration-200 cursor-pointer"
                          onClick={() => handleViewDetails(listing.id)}
                        >
                          <TableCell className="py-2">
                            <div className="flex items-start space-x-2">
                              <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-lg flex items-center justify-center">
                                <Building className="h-4 w-4 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-gray-900 text-xs truncate">
                                  {listing.unit.label}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 text-xs truncate">
                                {listing.property.title}
                              </div>
                              <div className="text-[10px] text-gray-500 capitalize mt-0.5">
                                {listing.property.type.toLowerCase().replace('_', ' ')}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            {getStatusBadge(listing.lifecycleStatus)}
                          </TableCell>
                          <TableCell className="py-2">
                            {listing.isFeatured ? (
                              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-2 py-0.5 text-[10px]">
                                <Star className="h-2.5 w-2.5 mr-1 fill-current" />
                                Featured
                              </Badge>
                            ) : (
                              <span className="text-gray-400 text-xs">—</span>
                            )}
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge 
                              variant="outline" 
                              className={`${paymentStatus.color} font-medium px-2 py-0.5 text-[10px]`}
                            >
                              {paymentStatus.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="text-xs text-gray-600">
                              {listing.expiresAt ? (
                                <div className="flex items-center gap-1.5 group/date" title={formatDate(listing.expiresAt)}>
                                  <Clock className="h-3 w-3 text-gray-500" />
                                  <span className="text-[10px]">{formatRelativeDate(listing.expiresAt)}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">—</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="text-xs text-gray-600">
                              {listing.reviewedAt ? (
                                <div className="flex items-center gap-1.5 group/date" title={formatDate(listing.reviewedAt)}>
                                  <CheckCircle2 className="h-3 w-3 text-purple-500" />
                                  <span className="text-[10px]">{formatRelativeDate(listing.reviewedAt)}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">—</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="text-xs text-gray-600">
                              <div className="flex items-center gap-1.5 group/date" title={formatDate(listing.createdAt)}>
                                <Calendar className="h-3 w-3 text-blue-500" />
                                <span className="text-[10px]">{formatRelativeDate(listing.createdAt)}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="flex items-center justify-end">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(listing.id);
                                }}
                                className="h-8 px-3 gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300 transition-colors text-xs font-medium group-hover:border-blue-400"
                              >
                                <Info className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">View Details</span>
                                <ArrowUpRight className="h-3.5 w-3.5 sm:hidden" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200">
                    <div className="text-xs text-gray-600">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredListings.length)} of {filteredListings.length} listings
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="h-8 px-3 text-xs"
                      >
                        <ChevronLeft className="h-3.5 w-3.5 mr-1" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                          if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          ) {
                            return (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className={`h-8 w-8 p-0 text-xs ${currentPage === page ? 'bg-blue-600 text-white' : ''}`}
                              >
                                {page}
                              </Button>
                            );
                          } else if (page === currentPage - 2 || page === currentPage + 2) {
                            return <span key={page} className="text-gray-400">...</span>;
                          }
                          return null;
                        })}
                      </div>
                      {totalPages > 5 && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-gray-500">Go to:</span>
                          <Input
                            type="number"
                            min="1"
                            max={totalPages}
                            value={jumpToPage}
                            onChange={(e) => setJumpToPage(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleJumpToPage();
                              }
                            }}
                            placeholder="Page"
                            className="h-8 w-16 text-xs text-center"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleJumpToPage}
                            disabled={!jumpToPage || parseInt(jumpToPage) < 1 || parseInt(jumpToPage) > totalPages}
                            className="h-8 px-2 text-xs"
                          >
                            Go
                          </Button>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="h-8 px-3 text-xs"
                      >
                        Next
                        <ChevronRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Create Listing Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-lg bg-white border border-slate-300 shadow-2xl">
            <DialogHeader className="space-y-1 pb-4">
              <DialogTitle className="text-xl font-semibold text-slate-900">
                Create New Listing
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-600">
                Select a property and unit to create a new listing
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {loadingEligible ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-3">Loading eligible units...</p>
                </div>
              ) : eligibleError ? (
                <div className="text-center py-6">
                  <p className="text-red-600 mb-4 text-sm">{eligibleError}</p>
                  <Button 
                    onClick={fetchEligibleUnits} 
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    Try Again
                  </Button>
                </div>
              ) : eligibleProperties.length === 0 ? (
                <div className="text-center py-6">
                  <Building className="h-12 w-12 text-blue-200 mx-auto mb-3" />
                  <p className="text-gray-700 font-medium">No properties available for listing</p>
                  <p className="text-sm text-gray-500 mt-1">
                    You need to have properties with available units to create listings
                  </p>
                </div>
              ) : (
                <>
                  {/* Property Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">Select Property</label>
                    <Select 
                      value={selectedEligibleProperty || undefined} 
                      onValueChange={(value) => {
                        setSelectedEligibleProperty(value);
                        setSelectedEligibleUnit(''); // Reset unit when property changes
                      }}
                    >
                      <SelectTrigger className="h-10 w-full border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                        <SelectValue placeholder="Choose a property" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] !z-[110]" position="popper">
                        {eligibleProperties.map(property => (
                          <SelectItem 
                            key={property.id} 
                            value={property.id}
                          >
                            {property.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Unit Selection - Only show when property is selected */}
                  {selectedEligibleProperty && (
                    <>
                      {/* Property Preview Card - Show when property is selected */}
                      {selectedPropertyData && (
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-lg border-2 border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-bold text-slate-900 text-base">{selectedPropertyData.title}</div>
                            <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 bg-white">
                              {selectedPropertyData.type.toLowerCase().replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="pt-2 border-t border-blue-200">
                            <p className="text-xs text-blue-700 font-semibold">
                              {availableUnits.length} unit{availableUnits.length !== 1 ? 's' : ''} available in this property
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Unit Selection */}
                      {availableUnits.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-900">Select Unit</label>
                          <Select 
                            value={selectedEligibleUnit || undefined} 
                            onValueChange={setSelectedEligibleUnit}
                          >
                            <SelectTrigger className="h-10 w-full border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20">
                              <SelectValue placeholder="Choose a unit" />
                            </SelectTrigger>
                            <SelectContent className="!z-[110]" position="popper">
                              {availableUnits.map(unit => (
                                <SelectItem key={unit.id} value={unit.id}>
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </>
                  )}

                  {/* Continue Button */}
                  <Button
                    onClick={handleContinueToReview}
                    disabled={!selectedEligibleUnit}
                    className="w-full h-11 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    Continue to Review
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default LandlordListing;
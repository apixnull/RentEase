import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Calendar, Building, Eye, EyeOff, Clock, Ban, CreditCard, MapPin, Star, TrendingUp, ArrowRight, CheckCircle2, Flag, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { getLandlordListingsRequest, getEligibleUnitsForListingRequest } from '@/api/landlord/listingApi';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

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
  address: Address;
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
  lifecycleStatus: 'WAITING_PAYMENT' | 'VISIBLE' | 'HIDDEN' | 'EXPIRED' | 'BLOCKED';
  isFeatured: boolean;
  expiresAt: string | null;
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
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [properties, setProperties] = useState<{id: string, title: string}[]>([]);
  const [isActiveExpanded, setIsActiveExpanded] = useState(false);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [eligibleProperties, setEligibleProperties] = useState<EligibleProperty[]>([]);
  const [selectedEligibleProperty, setSelectedEligibleProperty] = useState<string>('');
  const [selectedEligibleUnit, setSelectedEligibleUnit] = useState<string>('');
  const [loadingEligible, setLoadingEligible] = useState(false);
  const [eligibleError, setEligibleError] = useState<string | null>(null);
  const [isLifecycleExpanded, setIsLifecycleExpanded] = useState(true);

  const statusConfig = {
    WAITING_PAYMENT: {
      title: 'Waiting Payment',
      icon: CreditCard,
      count: 0,
      color: 'bg-gradient-to-r from-blue-600 to-cyan-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      description: 'Listings pending payment confirmation'
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

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLandlordListingsRequest();
      const listingsData: Listing[] = response.data.listings;
      
      // Filter out expired listings from the main display
      const activeListings = listingsData.filter(listing => listing.lifecycleStatus !== 'EXPIRED');
      
      // Sort by latest first initially
      const sortedListings = sortListings(activeListings, 'newest');
      setAllListings(sortedListings);
      
      // Extract unique properties
      const uniqueProperties = Array.from(
        new Map(
          sortedListings.map(listing => [listing.property.id, {
            id: listing.property.id,
            title: listing.property.title
          }])
        ).values()
      );
      setProperties(uniqueProperties);

      // Apply initial filter
      applyFilters('all', 'all', '', sortedListings);
    } catch (err) {
      setError('Failed to fetch listings');
      console.error('Error fetching listings:', err);
    } finally {
      setLoading(false);
    }
  };

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

  const sortListings = (listings: Listing[], order: 'newest' | 'oldest') => {
    return [...listings].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return order === 'newest' ? dateB - dateA : dateA - dateB;
    });
  };

  const applyFilters = (propertyId: string, status: string, query: string, listingsToFilter?: Listing[]) => {
    const listings = listingsToFilter || allListings;
    
    let filtered = listings;

    // Filter by property
    if (propertyId !== 'all') {
      filtered = filtered.filter(listing => listing.property.id === propertyId);
    }

    // Filter by status
    if (status !== 'all') {
      if (status === 'active') {
        // Active includes both VISIBLE and HIDDEN
        filtered = filtered.filter(listing => 
          listing.lifecycleStatus === 'VISIBLE' || listing.lifecycleStatus === 'HIDDEN'
        );
      } else {
        filtered = filtered.filter(listing => listing.lifecycleStatus === status);
      }
    }

    // Filter by search query
    if (query) {
      filtered = filtered.filter(listing => 
        listing.unit.label.toLowerCase().includes(query.toLowerCase()) ||
        listing.property.title.toLowerCase().includes(query.toLowerCase()) ||
        listing.property.address.street.toLowerCase().includes(query.toLowerCase()) ||
        listing.property.address.barangay.toLowerCase().includes(query.toLowerCase()) ||
        listing.property.address.city.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply sorting
    filtered = sortListings(filtered, sortOrder);

    setFilteredListings(filtered);
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

  const handleActiveSubStatusClick = (subStatus: 'VISIBLE' | 'HIDDEN') => {
    setSelectedStatus(subStatus);
    setIsActiveExpanded(false);
    applyFilters(selectedProperty, subStatus, searchQuery);
  };

  const handlePropertyFilterChange = (propertyId: string) => {
    setSelectedProperty(propertyId);
    applyFilters(propertyId, selectedStatus, searchQuery);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    applyFilters(selectedProperty, selectedStatus, query);
  };

  const handleSortChange = (order: 'newest' | 'oldest') => {
    setSortOrder(order);
    const sortedListings = sortListings(filteredListings, order);
    setFilteredListings(sortedListings);
  };

  const handleClearFilters = () => {
    setSelectedProperty('all');
    setSelectedStatus('all');
    setSearchQuery('');
    setSortOrder('newest');
    setIsActiveExpanded(false);
    applyFilters('all', 'all', '');
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

  const formatAddress = (address: Address) => {
    return `${address.street}, ${address.barangay}, ${address.city}, ${address.zipCode}`;
  };

  const handleViewDetails = (listingId: string) => {
    navigate(`/landlord/listing/${listingId}/details`);
  };

  const handleSetVisible = (listingId: string) => {
    // TODO: Implement set visible functionality
    console.log('Set visible for listing:', listingId);
  };

  const handleSetHidden = (listingId: string) => {
    // TODO: Implement set hidden functionality
    console.log('Set hidden for listing:', listingId);
  };

  const handlePayNow = (listingId: string) => {
    // TODO: Implement pay now functionality
    console.log('Pay now for listing:', listingId);
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

  const getPaymentStatus = (listing: Listing) => {
    if (listing.lifecycleStatus === 'WAITING_PAYMENT') {
      return { status: 'Pending', color: 'text-blue-700 bg-blue-100 border-blue-200' };
    }
    if (listing.payment.providerName && listing.payment.date) {
      return { status: `Paid (${listing.payment.providerName})`, color: 'text-emerald-700 bg-emerald-100 border-emerald-200' };
    }
    return { status: 'No Payment', color: 'text-gray-700 bg-gray-100 border-gray-200' };
  };

  // Calculate counts for each status
  const statusCounts = allListings.reduce((acc, listing) => {
    acc[listing.lifecycleStatus] = (acc[listing.lifecycleStatus] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate active listings (VISIBLE + HIDDEN)
  const activeListings = allListings.filter(
    listing => listing.lifecycleStatus === 'VISIBLE' || listing.lifecycleStatus === 'HIDDEN'
  ).length;

  const selectedPropertyData = eligibleProperties.find(p => p.id === selectedEligibleProperty);
  const availableUnits = selectedPropertyData?.units || [];

  // Add useEffect to fetch listings on component mount
  useEffect(() => {
    fetchListings();
  }, []);

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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {[...Array(5)].map((_, i) => (
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
                      {[...Array(8)].map((_, i) => (
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
                <Button onClick={fetchListings} variant="destructive">
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <PageHeader
          title="Listing Management"
          description="Manage your unit listings and status"
        />

        {/* Listing Lifecycle Management Dashboard */}
        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLifecycleExpanded(!isLifecycleExpanded)}
                  className="h-7 w-7 p-0 hover:bg-slate-100"
                  title={isLifecycleExpanded ? "Collapse" : "Expand"}
                >
                  {isLifecycleExpanded ? (
                    <ChevronUp className="h-4 w-4 text-slate-600" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-600" />
                  )}
                </Button>
                <div>
                  <CardTitle className="text-sm font-semibold text-slate-900">Listing Lifecycle Management</CardTitle>
                  <p className="text-xs text-slate-600 mt-0.5">Monitor and manage your listings through their lifecycle stages</p>
                </div>
              </div>
              <Button 
                onClick={handleCreateListing} 
                size="sm" 
                className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white shadow-md shadow-blue-500/25 h-9 text-sm px-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Listing
              </Button>
            </div>
          </CardHeader>
          {isLifecycleExpanded && (
            <CardContent className="px-4 pb-4 space-y-3">
              {/* Lifecycle Stages */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {/* Stage 1: Waiting Payment */}
                <div 
                  className={`relative p-3 rounded-lg border-2 transition-all cursor-pointer group ${
                    selectedStatus === 'WAITING_PAYMENT'
                      ? 'bg-blue-50 border-blue-300 shadow-lg'
                      : 'bg-white border-blue-200 hover:border-blue-300 hover:shadow-md'
                  }`}
                  onClick={() => handleStatusClick('WAITING_PAYMENT')}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900">Payment Pending</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">Awaiting payment</p>
                      <p className="text-base font-bold text-blue-700 mt-1.5">{statusCounts['WAITING_PAYMENT'] || 0}</p>
                    </div>
                  </div>
                  {selectedStatus === 'WAITING_PAYMENT' && (
                    <div className="absolute top-1.5 right-1.5">
                      <CheckCircle2 className="h-3 w-3 text-blue-600" />
                    </div>
                  )}
                </div>

                {/* Stage 2: Active (with VISIBLE/HIDDEN inside) */}
                <div 
                  className={`relative p-3 rounded-lg border-2 transition-all cursor-pointer group ${
                    selectedStatus === 'active' || selectedStatus === 'VISIBLE' || selectedStatus === 'HIDDEN'
                      ? 'bg-emerald-50 border-emerald-400 shadow-lg'
                      : 'bg-white border-emerald-200 hover:border-emerald-300 hover:shadow-md'
                  }`}
                  onClick={() => handleStatusClick('active')}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900">Active</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">Live listings</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <p className="text-base font-bold text-emerald-700">{activeListings}</p>
                        <div className="flex items-center gap-1.5">
                          <div 
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium cursor-pointer transition-colors ${
                              selectedStatus === 'VISIBLE'
                                ? 'bg-emerald-200 text-emerald-800'
                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActiveSubStatusClick('VISIBLE');
                            }}
                          >
                            <Eye className="h-2.5 w-2.5 inline mr-0.5" />
                            {statusCounts['VISIBLE'] || 0}
                          </div>
                          <div 
                            className={`px-1.5 py-0.5 rounded text-[10px] font-medium cursor-pointer transition-colors ${
                              selectedStatus === 'HIDDEN'
                                ? 'bg-teal-200 text-teal-800'
                                : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActiveSubStatusClick('HIDDEN');
                            }}
                          >
                            <EyeOff className="h-2.5 w-2.5 inline mr-0.5" />
                            {statusCounts['HIDDEN'] || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {(selectedStatus === 'active' || selectedStatus === 'VISIBLE' || selectedStatus === 'HIDDEN') && (
                    <div className="absolute top-1.5 right-1.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    </div>
                  )}
                </div>

                {/* Stage 3: Flagged */}
                <div 
                  className={`relative p-3 rounded-lg border-2 transition-all cursor-pointer group ${
                    selectedStatus === 'FLAGGED'
                      ? 'bg-amber-50 border-amber-300 shadow-lg'
                      : 'bg-white border-amber-200 hover:border-amber-300 hover:shadow-md'
                  }`}
                  onClick={() => handleStatusClick('FLAGGED')}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center group-hover:bg-amber-600 transition-colors">
                      <Flag className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900">Flagged</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">Under review</p>
                      <p className="text-base font-bold text-amber-700 mt-1.5">{statusCounts['FLAGGED'] || 0}</p>
                    </div>
                  </div>
                  {selectedStatus === 'FLAGGED' && (
                    <div className="absolute top-1.5 right-1.5">
                      <CheckCircle2 className="h-3 w-3 text-amber-600" />
                    </div>
                  )}
                </div>

                {/* Stage 4: Expired */}
                <div 
                  className={`relative p-3 rounded-lg border-2 transition-all cursor-pointer group ${
                    selectedStatus === 'EXPIRED'
                      ? 'bg-gray-50 border-gray-300 shadow-lg'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                  onClick={() => handleStatusClick('EXPIRED')}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-500 flex items-center justify-center group-hover:bg-gray-600 transition-colors">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900">Expired</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">Expired listings</p>
                      <p className="text-base font-bold text-gray-700 mt-1.5">{statusCounts['EXPIRED'] || 0}</p>
                    </div>
                  </div>
                  {selectedStatus === 'EXPIRED' && (
                    <div className="absolute top-1.5 right-1.5">
                      <CheckCircle2 className="h-3 w-3 text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Stage 5: Blocked */}
                <div 
                  className={`relative p-3 rounded-lg border-2 transition-all cursor-pointer group ${
                    selectedStatus === 'BLOCKED'
                      ? 'bg-red-50 border-red-300 shadow-lg'
                      : 'bg-white border-red-200 hover:border-red-300 hover:shadow-md'
                  }`}
                  onClick={() => handleStatusClick('BLOCKED')}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                      <Ban className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900">Blocked</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">Suspended</p>
                      <p className="text-base font-bold text-red-700 mt-1.5">{statusCounts['BLOCKED'] || 0}</p>
                    </div>
                  </div>
                  {selectedStatus === 'BLOCKED' && (
                    <div className="absolute top-1.5 right-1.5">
                      <CheckCircle2 className="h-3 w-3 text-red-600" />
                    </div>
                  )}
                </div>
              </div>

              {/* Lifecycle Flow Arrows (Visual) */}
              <div className="hidden lg:flex items-center justify-between px-2 -mt-1">
                <ArrowRight className="h-3 w-3 text-slate-400" />
                <ArrowRight className="h-3 w-3 text-slate-400" />
                <ArrowRight className="h-3 w-3 text-slate-400" />
                <ArrowRight className="h-3 w-3 text-slate-400" />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
          <CardContent className="p-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Search - Compact design */}
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-9 h-8 text-xs border-blue-200 focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Property Filter */}
              <Select value={selectedProperty} onValueChange={handlePropertyFilterChange}>
                <SelectTrigger className="h-8 w-[160px] text-xs border-blue-200">
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

              {/* Sort Order */}
              <Select value={sortOrder} onValueChange={(value: 'newest' | 'oldest') => handleSortChange(value)}>
                <SelectTrigger className="h-8 w-[120px] text-xs border-blue-200">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              <Button 
                variant="outline" 
                onClick={handleClearFilters}
                className="h-8 text-xs border-blue-200 text-blue-700 hover:bg-blue-50 px-3"
              >
                Clear
              </Button>
            </div>

            {/* Active Filters Summary */}
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="font-medium text-gray-700">
                {filteredListings.length} of {allListings.length} listings
              </span>
              {selectedStatus === 'active' && (
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                  Active Listings
                </Badge>
              )}
              {selectedStatus !== 'all' && selectedStatus !== 'active' && (
                <Badge variant="secondary" className={`${statusConfig[selectedStatus as keyof typeof statusConfig]?.bgColor} ${statusConfig[selectedStatus as keyof typeof statusConfig]?.textColor}`}>
                  {statusConfig[selectedStatus as keyof typeof statusConfig]?.title}
                </Badge>
              )}
              {selectedProperty !== 'all' && (
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                  {properties.find(p => p.id === selectedProperty)?.title}
                </Badge>
              )}
              {searchQuery && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  "{searchQuery}"
                </Badge>
              )}
              <Badge variant="outline" className="border-blue-200 text-blue-700">
                {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
              </Badge>
            </div>
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
              <div className="text-center py-16 text-muted-foreground">
                <Building className="h-16 w-16 mx-auto mb-4 text-blue-200" />
                <p className="text-lg font-medium text-gray-600">No listings found</p>
                <p className="text-sm mt-2 text-gray-500">
                  {selectedStatus === 'all' 
                    ? 'Create your first listing to get started'
                    : `No ${statusConfig[selectedStatus as keyof typeof statusConfig]?.title?.toLowerCase()} listings`
                  }
                </p>
                {selectedStatus !== 'all' && (
                  <Button 
                    variant="outline" 
                    onClick={() => handleStatusClick('all')}
                    className="mt-4 border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    View All Listings
                  </Button>
                )}
              </div>
            ) : (
              <div className="border-0">
                <Table>
                  <TableHeader className="bg-gradient-to-r from-blue-50 to-emerald-50">
                    <TableRow className="hover:bg-transparent border-blue-100">
                      <TableHead className="font-semibold text-blue-900 py-2 text-xs">Unit & Property</TableHead>
                      <TableHead className="font-semibold text-blue-900 py-2 text-xs">Location</TableHead>
                      <TableHead className="font-semibold text-blue-900 py-2 text-xs">Status</TableHead>
                      <TableHead className="font-semibold text-blue-900 py-2 text-xs">Featured</TableHead>
                      <TableHead className="font-semibold text-blue-900 py-2 text-xs">Payment</TableHead>
                      <TableHead className="font-semibold text-blue-900 py-2 text-xs">Expires</TableHead>
                      <TableHead className="font-semibold text-blue-900 py-2 text-xs">Created</TableHead>
                      <TableHead className="font-semibold text-blue-900 py-2 text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredListings.map((listing) => {
                      const paymentStatus = getPaymentStatus(listing);
                      const locationText = formatAddress(listing.property.address);
                      return (
                        <TableRow 
                          key={listing.id} 
                          className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-emerald-50/50 border-b border-blue-50 transition-all duration-200"
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
                                <div className="text-[10px] text-gray-600 mt-0.5 truncate">
                                  {listing.property.title}
                                </div>
                                <div className="text-[10px] text-gray-500 capitalize mt-0.5">
                                  {listing.property.type.toLowerCase().replace('_', ' ')}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="max-w-[200px]">
                              <div className="flex items-start gap-1.5" title={locationText}>
                                <MapPin className="h-3 w-3 mt-0.5 text-blue-500 flex-shrink-0" />
                                <span className="text-xs text-gray-700 leading-relaxed truncate block max-w-[180px]">
                                  {locationText.length > 40 ? `${locationText.substring(0, 40)}...` : locationText}
                                </span>
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
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-3 w-3 text-gray-500" />
                                  <span className="text-[10px]">{formatDate(listing.expiresAt)}</span>
                                </div>
                              ) : (
                                <span className="text-gray-400 text-xs">—</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="text-xs text-gray-600">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3 w-3 text-blue-500" />
                                <span className="text-[10px]">{formatDate(listing.createdAt)}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="flex items-center gap-1.5 justify-end">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewDetails(listing.id)}
                                className="h-7 w-7 p-0 border border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 transition-colors"
                                title="View Details"
                              >
                                <Info className="h-3.5 w-3.5" />
                              </Button>
                              
                              {/* Status-specific actions */}
                              {listing.lifecycleStatus === 'HIDDEN' && (
                                <Button 
                                  size="sm"
                                  onClick={() => handleSetVisible(listing.id)}
                                  className="h-7 w-7 p-0 bg-emerald-500 hover:bg-emerald-600 text-white"
                                  title="Set Visible"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              
                              {listing.lifecycleStatus === 'VISIBLE' && (
                                <Button 
                                  size="sm"
                                  onClick={() => handleSetHidden(listing.id)}
                                  className="h-7 w-7 p-0 bg-teal-500 hover:bg-teal-600 text-white"
                                  title="Set Hidden"
                                >
                                  <EyeOff className="h-3.5 w-3.5" />
                                </Button>
                              )}
                              
                              {listing.lifecycleStatus === 'WAITING_PAYMENT' && (
                                <Button 
                                  size="sm"
                                  onClick={() => handlePayNow(listing.id)}
                                  className="h-7 w-7 p-0 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                                  title="Pay Now"
                                >
                                  <CreditCard className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
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
                          <div className="text-sm text-slate-700 flex items-start gap-2 mb-3">
                            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-blue-600" />
                            <span className="flex-1 font-medium">{formatAddress(selectedPropertyData.address)}</span>
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
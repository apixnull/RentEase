import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Calendar, Building, Eye, EyeOff, Clock, Ban, CreditCard, MapPin, Star, TrendingUp } from 'lucide-react';
import { getLandlordListingsRequest, getEligibleUnitsForListingRequest } from '@/api/landlord/listingApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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
  createdAt: string;
  updatedAt: string;
}

interface EligibleProperty {
  id: string;
  title: string;
  type: string;
  address: Address;
  units: Unit[];
}

interface Payment {
  providerName: string | null;
  amount: number;
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
  blockedAt: string | null;
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

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [eligibleProperties, setEligibleProperties] = useState<EligibleProperty[]>([]);
  const [selectedEligibleProperty, setSelectedEligibleProperty] = useState<string>('');
  const [selectedEligibleUnit, setSelectedEligibleUnit] = useState<string>('');
  const [loadingEligible, setLoadingEligible] = useState(false);
  const [eligibleError, setEligibleError] = useState<string | null>(null);

  const statusConfig = {
    WAITING_PAYMENT: {
      title: 'Waiting Payment',
      icon: CreditCard,
      count: 0,
      color: 'bg-gradient-to-r from-amber-400 to-amber-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-800',
      description: 'Listings pending payment confirmation'
    },
    VISIBLE: {
      title: 'Visible',
      icon: Eye,
      count: 0,
      color: 'bg-gradient-to-r from-emerald-400 to-green-500',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-800',
      description: 'Active and visible to tenants'
    },
    HIDDEN: {
      title: 'Hidden',
      icon: EyeOff,
      count: 0,
      color: 'bg-gradient-to-r from-blue-400 to-cyan-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-800',
      description: 'Temporarily hidden from search'
    },
    EXPIRED: {
      title: 'Expired',
      icon: Clock,
      count: 0,
      color: 'bg-gradient-to-r from-orange-400 to-amber-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-800',
      description: 'Listings that have reached expiry date'
    },
    BLOCKED: {
      title: 'Blocked',
      icon: Ban,
      count: 0,
      color: 'bg-gradient-to-r from-rose-400 to-red-500',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      textColor: 'text-rose-800',
      description: 'Suspended by administration'
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
      filtered = filtered.filter(listing => listing.lifecycleStatus === status);
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
    setSelectedStatus(status);
    applyFilters(selectedProperty, status, searchQuery);
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

  const handleBoostNow = (listingId: string) => {
    // TODO: Implement boost now functionality
    console.log('Boost now for listing:', listingId);
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

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPaymentStatus = (listing: Listing) => {
    if (listing.lifecycleStatus === 'WAITING_PAYMENT') {
      return { status: 'Pending', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    }
    if (listing.payment.providerName && listing.payment.date) {
      return { status: `Paid (${listing.payment.providerName})`, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    }
    return { status: 'No Payment', color: 'text-gray-600 bg-gray-50 border-gray-200' };
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

  const featuredListings = allListings.filter(listing => listing.isFeatured).length;

  const selectedPropertyData = eligibleProperties.find(p => p.id === selectedEligibleProperty);
  const availableUnits = selectedPropertyData?.units || [];

  // Add useEffect to fetch listings on component mount
  useEffect(() => {
    fetchListings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-4 h-24"></div>
              ))}
            </div>
          </div>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              Listing Management
            </h1>
            <p className="text-gray-600 text-sm mt-1">Manage your unit listings and status</p>
          </div>
          
          <Button 
            onClick={handleCreateListing} 
            size="sm" 
            className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white shadow-lg shadow-blue-500/25"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Listing
          </Button>
        </div>

        {/* Stats Cards - Smaller size and Active Listings instead of Total */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Active Listings Card */}
          <Card 
            className={`cursor-pointer border-2 transition-all duration-300 hover:shadow-lg ${
              selectedStatus === 'all' 
                ? 'border-blue-300 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50' 
                : 'border-gray-200 hover:border-blue-200 bg-white'
            }`}
            onClick={() => handleStatusClick('all')}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">Active Listing</p>
                  <p className="text-lg font-bold text-gray-900">{activeListings}</p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Cards */}
          {Object.entries(statusConfig).map(([status, config]) => {
            const Icon = config.icon;
            const count = statusCounts[status] || 0;
            return (
              <Card 
                key={status}
                className={`cursor-pointer border-2 transition-all duration-300 hover:shadow-lg ${
                  selectedStatus === status 
                    ? `${config.borderColor} shadow-lg ${config.bgColor}` 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => handleStatusClick(status)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-600">{config.title}</p>
                      <p className={`text-lg font-bold ${config.textColor}`}>{count}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${config.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search units, properties, or addresses..."
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10 border-blue-200 focus:border-blue-400"
                    />
                  </div>
                </div>

                {/* Property Filter */}
                <div className="w-full sm:w-48">
                  <Select value={selectedProperty} onValueChange={handlePropertyFilterChange}>
                    <SelectTrigger className="border-blue-200">
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
                </div>

                {/* Sort Order */}
                <div className="w-full sm:w-40">
                  <Select value={sortOrder} onValueChange={(value: 'newest' | 'oldest') => handleSortChange(value)}>
                    <SelectTrigger className="border-blue-200">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Clear Filters */}
                <Button 
                  variant="outline" 
                  onClick={handleClearFilters}
                  className="whitespace-nowrap border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  Clear All
                </Button>
              </div>
            </div>

            {/* Active Filters Summary */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium text-gray-700">
                {filteredListings.length} of {allListings.length} listings
              </span>
              {selectedStatus !== 'all' && (
                <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-800">
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
          <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-transparent">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
              {selectedStatus === 'all' ? 'All Listings' : statusConfig[selectedStatus as keyof typeof statusConfig]?.title}
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800">
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
                      <TableHead className="font-semibold text-blue-900 py-4">Unit & Property</TableHead>
                      <TableHead className="font-semibold text-blue-900 py-4">Location</TableHead>
                      <TableHead className="font-semibold text-blue-900 py-4">Status</TableHead>
                      <TableHead className="font-semibold text-blue-900 py-4">Featured</TableHead>
                      <TableHead className="font-semibold text-blue-900 py-4">Payment</TableHead>
                      <TableHead className="font-semibold text-blue-900 py-4">Expires</TableHead>
                      <TableHead className="font-semibold text-blue-900 py-4">Created</TableHead>
                      <TableHead className="font-semibold text-blue-900 py-4 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredListings.map((listing) => {
                      const paymentStatus = getPaymentStatus(listing);
                      return (
                        <TableRow 
                          key={listing.id} 
                          className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-emerald-50/50 border-b border-blue-50 transition-all duration-200"
                        >
                          <TableCell className="py-4">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-lg flex items-center justify-center">
                                <Building className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="font-semibold text-gray-900 text-base truncate">
                                  {listing.unit.label}
                                </div>
                                <div className="text-sm text-gray-600 mt-1 truncate">
                                  {listing.property.title}
                                </div>
                                <div className="text-xs text-gray-500 capitalize mt-0.5">
                                  {listing.property.type.toLowerCase().replace('_', ' ')}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="max-w-xs">
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 mt-0.5 text-blue-500 flex-shrink-0" />
                                <span className="text-sm text-gray-700 leading-relaxed">
                                  {formatAddress(listing.property.address)}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            {getStatusBadge(listing.lifecycleStatus)}
                          </TableCell>
                          <TableCell className="py-4">
                            {listing.isFeatured ? (
                              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-3 py-1.5">
                                <Star className="h-3.5 w-3.5 mr-1.5 fill-current" />
                                Featured
                              </Badge>
                            ) : (
                              <span className="text-gray-400 text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell className="py-4">
                            <Badge 
                              variant="outline" 
                              className={`${paymentStatus.color} font-medium px-3 py-1.5 text-xs`}
                            >
                              {paymentStatus.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-sm text-gray-600">
                              {listing.expiresAt ? (
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-orange-500" />
                                  {formatDate(listing.expiresAt)}
                                </div>
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-500" />
                                {formatDate(listing.createdAt)}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex flex-col sm:flex-row gap-2 justify-end">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewDetails(listing.id)}
                                className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 transition-colors"
                              >
                                View Details
                              </Button>
                              
                              {/* Status-specific actions */}
                              {listing.lifecycleStatus === 'HIDDEN' && (
                                <Button 
                                  size="sm"
                                  onClick={() => handleSetVisible(listing.id)}
                                  className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white"
                                >
                                  Set Visible
                                </Button>
                              )}
                              
                              {listing.lifecycleStatus === 'VISIBLE' && (
                                <Button 
                                  size="sm"
                                  onClick={() => handleSetHidden(listing.id)}
                                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                                >
                                  Set Hidden
                                </Button>
                              )}
                              
                              {listing.lifecycleStatus === 'WAITING_PAYMENT' && (
                                <Button 
                                  size="sm"
                                  onClick={() => handlePayNow(listing.id)}
                                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                                >
                                  Pay Now
                                </Button>
                              )}
                              
                              {/* Boost action for non-featured listings */}
                              {!listing.isFeatured && (
                                <Button 
                                  size="sm"
                                  onClick={() => handleBoostNow(listing.id)}
                                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                                >
                                  Boost Now
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
          <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-blue-50/30 border-blue-100">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-xl bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                Create New Listing
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Select a property and unit to create a new listing
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {loadingEligible ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Loading eligible units...</p>
                </div>
              ) : eligibleError ? (
                <div className="text-center py-4">
                  <p className="text-red-600 mb-4">{eligibleError}</p>
                  <Button 
                    onClick={fetchEligibleUnits} 
                    variant="outline"
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    Try Again
                  </Button>
                </div>
              ) : eligibleProperties.length === 0 ? (
                <div className="text-center py-4">
                  <Building className="h-12 w-12 text-blue-200 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No properties available for listing</p>
                  <p className="text-sm text-gray-500 mt-1">
                    You need to have properties with available units to create listings
                  </p>
                </div>
              ) : (
                <>
                  {/* Property Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Select Property</label>
                    <Select value={selectedEligibleProperty} onValueChange={setSelectedEligibleProperty}>
                      <SelectTrigger className="border-blue-200 focus:border-blue-400">
                        <SelectValue placeholder="Choose a property" />
                      </SelectTrigger>
                      <SelectContent>
                        {eligibleProperties.map(property => (
                          <SelectItem key={property.id} value={property.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{property.title}</span>
                              <span className="text-xs text-gray-500">
                                {property.units.length} unit{property.units.length !== 1 ? 's' : ''} available
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Unit Selection */}
                  {selectedEligibleProperty && (
                    <div className="space-y-3">
                      <label className="text-sm font-medium text-gray-700">Select Unit</label>
                      <Select value={selectedEligibleUnit} onValueChange={setSelectedEligibleUnit}>
                        <SelectTrigger className="border-blue-200 focus:border-blue-400">
                          <SelectValue placeholder="Choose a unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUnits.map(unit => (
                            <SelectItem key={unit.id} value={unit.id}>
                              <div className="font-medium">{unit.label}</div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedPropertyData && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="font-semibold text-blue-900 text-sm">{selectedPropertyData.title}</div>
                          <div className="text-xs text-blue-700 mt-1 flex items-start gap-1">
                            <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            {formatAddress(selectedPropertyData.address)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Continue Button */}
                  <Button
                    onClick={handleContinueToReview}
                    disabled={!selectedEligibleUnit}
                    className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
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
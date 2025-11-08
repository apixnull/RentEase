import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllListingsForAdminRequest } from "@/api/admin/listingApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AdminPageHeader from "@/components/AdminPageHeader";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, MapPin, Calendar, Info, Eye, Flag, Clock, Ban, CheckCircle2, Search, ChevronDown, ChevronUp } from "lucide-react";

type AdminListingItem = {
  id: string;
  lifecycleStatus: string;
  isFeatured: boolean;
  expiresAt: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  flaggedReason: string | null;
  blockedReason: string | null;
  createdAt: string;
  updatedAt: string;
  unit: {
    id: string;
    label: string;
    property: {
      id: string;
      title: string;
      type: string;
      street: string;
      barangay: string;
      zipCode: string;
      city: { name: string } | null;
      municipality: { name: string } | null | null;
    };
  };
  landlord: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
};

type AdminListingsResponse = { listings: AdminListingItem[] };

const AdminListing = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<AdminListingItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'VISIBLE' | 'HIDDEN' | 'FLAGGED' | 'EXPIRED' | 'BLOCKED'>('all');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'reviewed' | 'unreviewed'>('all');
  const [searchUnit, setSearchUnit] = useState('');
  const [searchProperty, setSearchProperty] = useState('');
  const [searchLandlord, setSearchLandlord] = useState('');
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [lifecycleOpen, setLifecycleOpen] = useState(true);
  const [timeRange, setTimeRange] = useState<'all' | 'day' | 'week' | 'month'>('all');

  useEffect(() => {
    const abort = new AbortController();
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await getAllListingsForAdminRequest({ signal: abort.signal });
        const body: AdminListingsResponse = res.data;
        setData(body.listings ?? []);
      } catch (err: any) {
        if (err?.name === "CanceledError") return;
        setError("Failed to load listings");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => abort.abort();
  }, []);

  const getSortTimestamp = (item: AdminListingItem) => {
    const updated = new Date(item.updatedAt).getTime();
    const created = new Date(item.createdAt).getTime();
    return Math.max(updated || 0, created || 0);
  };

  const isNeedsReview = (status: string) => {
    if (!status) return false;
    const upper = status.toUpperCase();
    return upper.includes('REVIEW') || upper === 'FLAGGED';
  };

  const filtered = useMemo(() => {
    if (!data) return [] as AdminListingItem[];
    let list = [...data];
    if (selectedStatus !== 'all') {
      if (selectedStatus === 'active') {
        list = list.filter(l => l.lifecycleStatus === 'VISIBLE' || l.lifecycleStatus === 'HIDDEN');
      } else {
        list = list.filter(l => l.lifecycleStatus === selectedStatus);
      }
    }
    if (reviewFilter === 'reviewed') {
      list = list.filter(l => !isNeedsReview(l.lifecycleStatus));
    } else if (reviewFilter === 'unreviewed') {
      list = list.filter(l => isNeedsReview(l.lifecycleStatus));
    }
    if (searchUnit.trim()) {
      const q = searchUnit.toLowerCase().trim();
      list = list.filter(l => l.unit.label.toLowerCase().includes(q));
    }
    if (searchProperty.trim()) {
      const q = searchProperty.toLowerCase().trim();
      list = list.filter(l => l.unit.property.title.toLowerCase().includes(q));
    }
    if (searchLandlord.trim()) {
      const q = searchLandlord.toLowerCase().trim();
      list = list.filter(l => `${(l.landlord.firstName||'').trim()} ${(l.landlord.lastName||'').trim()}`.toLowerCase().includes(q) || (l.landlord.email||'').toLowerCase().includes(q));
    }
    // Time range filter
    if (timeRange !== 'all') {
      const now = Date.now();
      const windows: Record<string, number> = {
        day: 24*60*60*1000,
        week: 7*24*60*60*1000,
        month: 30*24*60*60*1000,
      };
      const windowMs = windows[timeRange] ?? 0;
      if (windowMs > 0) {
        list = list.filter(l => now - getSortTimestamp(l) <= windowMs);
      }
    }

    // Prioritize waiting-for-review items, then sort by date
    list.sort((a, b) => {
      const aNeed = isNeedsReview(a.lifecycleStatus) ? 0 : 1;
      const bNeed = isNeedsReview(b.lifecycleStatus) ? 0 : 1;
      if (aNeed !== bNeed) return aNeed - bNeed;
      return sortOrder === 'latest' ? getSortTimestamp(b) - getSortTimestamp(a) : getSortTimestamp(a) - getSortTimestamp(b);
    });
    return list;
  }, [data, selectedStatus, reviewFilter, searchUnit, searchProperty, searchLandlord, sortOrder, timeRange]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const formatDateTime = (iso: string) => new Date(iso).toLocaleString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric', hour: 'numeric', minute: '2-digit'
  });

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'VISIBLE':
        return {
          badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          bg: 'bg-emerald-50 border-emerald-300',
          gradient: 'from-emerald-200/70 via-emerald-100/50 to-emerald-200/70',
          iconBg: 'bg-emerald-500',
        };
      case 'HIDDEN':
        return {
          badge: 'bg-teal-100 text-teal-700 border-teal-200',
          bg: 'bg-teal-50 border-teal-300',
          gradient: 'from-teal-200/70 via-teal-100/50 to-teal-200/70',
          iconBg: 'bg-teal-500',
        };
      case 'EXPIRED':
        return {
          badge: 'bg-gray-100 text-gray-700 border-gray-200',
          bg: 'bg-gray-50 border-gray-300',
          gradient: 'from-gray-200/70 via-gray-100/50 to-gray-200/70',
          iconBg: 'bg-gray-500',
        };
      case 'FLAGGED':
        return {
          badge: 'bg-amber-100 text-amber-700 border-amber-200',
          bg: 'bg-amber-50 border-amber-300',
          gradient: 'from-amber-200/70 via-amber-100/50 to-amber-200/70',
          iconBg: 'bg-amber-500',
        };
      case 'BLOCKED':
        return {
          badge: 'bg-red-100 text-red-700 border-red-200',
          bg: 'bg-red-50 border-red-300',
          gradient: 'from-red-200/70 via-red-100/50 to-red-200/70',
          iconBg: 'bg-red-500',
        };
      default:
        return {
          badge: 'bg-slate-100 text-slate-700 border-slate-200',
          bg: 'bg-slate-50 border-slate-200',
          gradient: 'from-slate-200/70 via-slate-100/50 to-slate-200/70',
          iconBg: 'bg-slate-500',
        };
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-8 w-64 mb-4" />
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-96" />
                <Skeleton className="h-4 w-80" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <Card className="border-red-200">
            <CardContent className="p-6 text-red-700">{error}</CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Do not early-return when there are no results; keep filters visible and show empty state in table


  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminPageHeader
          title="Admin Listing Management"
          description="Moderate listings, review statuses, and act on risks"
        />

        {/* Listing Lifecycle Management */}
        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <div>
                  <CardTitle className="text-sm font-semibold text-slate-900">Listing Lifecycle Management</CardTitle>
                  <p className="text-xs text-slate-600 mt-0.5">Monitor and manage listings through their lifecycle stages</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 border-slate-200 text-slate-700 hover:bg-slate-50"
                onClick={() => setLifecycleOpen(o=>!o)}
                aria-expanded={lifecycleOpen}
                aria-controls="lifecycle-section"
              >
                {lifecycleOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {lifecycleOpen && (
          <CardContent id="lifecycle-section" className="px-4 pb-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {/* Unreviewed */}
              <div 
                className={`relative p-3 rounded-lg border-2 transition-all cursor-pointer group ${reviewFilter === 'unreviewed' ? 'bg-blue-50 border-blue-300 shadow-lg' : 'bg-white border-blue-200 hover:border-blue-300 hover:shadow-md'}`}
                onClick={() => { setSelectedStatus('all'); setReviewFilter('unreviewed'); setPage(1); }}
              >
                <div className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <Info className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900">Unreviewed</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">Needs admin review</p>
                    <p className="text-base font-bold text-blue-700 mt-1.5">{(data||[]).filter(l=>isNeedsReview(l.lifecycleStatus)).length}</p>
                  </div>
                </div>
                {reviewFilter === 'unreviewed' && (
                  <div className="absolute top-1.5 right-1.5"><CheckCircle2 className="h-3 w-3 text-blue-600" /></div>
                )}
              </div>
              {/* Active (Visible + Hidden) */}
              <div 
                className={`relative p-3 rounded-lg border-2 transition-all cursor-pointer group ${selectedStatus === 'active' ? 'bg-emerald-50 border-emerald-400 shadow-lg' : 'bg-white border-emerald-200 hover:border-emerald-300 hover:shadow-md'}`}
                onClick={() => { setSelectedStatus('active'); setPage(1); }}
              >
                <div className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                    <Eye className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900">Active</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px] text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">Vis: {(data||[]).filter(l=>l.lifecycleStatus==='VISIBLE').length}</span>
                      <span className="text-[10px] text-teal-800 bg-teal-100 px-1.5 py-0.5 rounded">Hid: {(data||[]).filter(l=>l.lifecycleStatus==='HIDDEN').length}</span>
                    </div>
                    <p className="text-base font-bold text-emerald-700 mt-1.5">{(data||[]).filter(l=>l.lifecycleStatus==='VISIBLE'||l.lifecycleStatus==='HIDDEN').length}</p>
                  </div>
                </div>
                {selectedStatus === 'active' && (
                  <div className="absolute top-1.5 right-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-600" /></div>
                )}
              </div>
              {/* Flagged */}
              <div 
                className={`relative p-3 rounded-lg border-2 transition-all cursor-pointer group ${selectedStatus === 'FLAGGED' ? 'bg-amber-50 border-amber-300 shadow-lg' : 'bg-white border-amber-200 hover:border-amber-300 hover:shadow-md'}`}
                onClick={() => { setSelectedStatus('FLAGGED'); setPage(1); }}
              >
                <div className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center group-hover:bg-amber-600 transition-colors">
                    <Flag className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900">Flagged</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">Under review</p>
                    <p className="text-base font-bold text-amber-700 mt-1.5">{(data||[]).filter(l=>l.lifecycleStatus==='FLAGGED').length}</p>
                  </div>
                </div>
                {selectedStatus === 'FLAGGED' && (
                  <div className="absolute top-1.5 right-1.5"><CheckCircle2 className="h-3 w-3 text-amber-600" /></div>
                )}
              </div>
              {/* Expired */}
              <div 
                className={`relative p-3 rounded-lg border-2 transition-all cursor-pointer group ${selectedStatus === 'EXPIRED' ? 'bg-gray-50 border-gray-300 shadow-lg' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'}`}
                onClick={() => { setSelectedStatus('EXPIRED'); setPage(1); }}
              >
                <div className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-500 flex items-center justify-center group-hover:bg-gray-600 transition-colors">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900">Expired</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">Expired listings</p>
                    <p className="text-base font-bold text-gray-700 mt-1.5">{(data||[]).filter(l=>l.lifecycleStatus==='EXPIRED').length}</p>
                  </div>
                </div>
                {selectedStatus === 'EXPIRED' && (
                  <div className="absolute top-1.5 right-1.5"><CheckCircle2 className="h-3 w-3 text-gray-600" /></div>
                )}
              </div>
              {/* Blocked */}
              <div 
                className={`relative p-3 rounded-lg border-2 transition-all cursor-pointer group ${selectedStatus === 'BLOCKED' ? 'bg-red-50 border-red-300 shadow-lg' : 'bg-white border-red-200 hover:border-red-300 hover:shadow-md'}`}
                onClick={() => { setSelectedStatus('BLOCKED'); setPage(1); }}
              >
                <div className="flex items-start gap-2.5">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                    <Ban className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900">Blocked</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">Suspended</p>
                    <p className="text-base font-bold text-red-700 mt-1.5">{(data||[]).filter(l=>l.lifecycleStatus==='BLOCKED').length}</p>
                  </div>
                </div>
                {selectedStatus === 'BLOCKED' && (
                  <div className="absolute top-1.5 right-1.5"><CheckCircle2 className="h-3 w-3 text-red-600" /></div>
                )}
              </div>
            </div>
          </CardContent>
          )}
        </Card>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100">
          <CardContent className="p-3 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input value={searchUnit} onChange={e=>{ setSearchUnit(e.target.value); setPage(1); }} placeholder="Search unit" className="pl-8 h-8 text-xs border-blue-200 focus:border-blue-400" />
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input value={searchProperty} onChange={e=>{ setSearchProperty(e.target.value); setPage(1); }} placeholder="Search property" className="pl-8 h-8 text-xs border-blue-200 focus:border-blue-400" />
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <Input value={searchLandlord} onChange={e=>{ setSearchLandlord(e.target.value); setPage(1); }} placeholder="Search landlord (name or email)" className="pl-8 h-8 text-xs border-blue-200 focus:border-blue-400 min-w-[220px]" />
              </div>
              <Select value={timeRange} onValueChange={(v: 'all'|'day'|'week'|'month')=>{ setTimeRange(v); setPage(1); }}>
                <SelectTrigger className="h-8 w-[140px] text-xs border-blue-200">
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="day">Past day</SelectItem>
                  <SelectItem value="week">Past week</SelectItem>
                  <SelectItem value="month">Past month</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortOrder} onValueChange={(v: 'latest'|'oldest')=>{ setSortOrder(v); setPage(1); }}>
                <SelectTrigger className="h-8 w-[130px] text-xs border-blue-200">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={()=>{ setSelectedStatus('all'); setReviewFilter('all'); setSearchUnit(''); setSearchProperty(''); setSearchLandlord(''); setSortOrder('latest'); setTimeRange('all'); setPage(1); }}
                className="h-8 text-xs border-blue-200 text-blue-700 hover:bg-blue-50 px-3"
              >
                Clear
              </Button>
            </div>
            <div className="text-xs text-slate-600">
              Showing {(filtered.length === 0) ? 0 : ((page - 1) * pageSize + 1)} - {Math.min(page * pageSize, filtered.length)} of {filtered.length}
            </div>
          </CardContent>
        </Card>

        {/* Listings management table */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-100 overflow-hidden">
          <CardHeader className="pb-2 pt-3 px-4 bg-gradient-to-r from-purple-50 to-transparent">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-900">
              All Listings
              <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-800 text-xs">
                {filtered.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-0">
              <Table>
                <TableHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                  <TableRow className="hover:bg-transparent border-blue-100">
                    <TableHead className="font-semibold text-blue-900 py-2 text-xs">Landlord</TableHead>
                    <TableHead className="font-semibold text-blue-900 py-2 text-xs">Unit & Property</TableHead>
                    <TableHead className="font-semibold text-blue-900 py-2 text-xs">Location</TableHead>
                    <TableHead className="font-semibold text-blue-900 py-2 text-xs">Status</TableHead>
                    <TableHead className="font-semibold text-blue-900 py-2 text-xs">Featured</TableHead>
                    {/* AI Risk column removed based on backend response */}
                    <TableHead className="font-semibold text-blue-900 py-2 text-xs">Reviewed</TableHead>
                    <TableHead className="font-semibold text-blue-900 py-2 text-xs">Created</TableHead>
                    <TableHead className="font-semibold text-blue-900 py-2 text-xs">Updated</TableHead>
                    <TableHead className="font-semibold text-blue-900 py-2 text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="py-10 text-center text-slate-500">No listings match your filters.</TableCell>
                    </TableRow>
                  ) : paginated.map((item) => {
                    const cls = getStatusStyles(item.lifecycleStatus);
                    const prop = item.unit.property;
                    const addr = [prop.street, prop.barangay, prop.zipCode, prop.city?.name ?? prop.municipality?.name]
                      .filter(Boolean)
                      .join(', ');
                    return (
                      <TableRow key={item.id} className="group hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-blue-50/50 border-b border-blue-50 transition-all duration-200">
                        <TableCell className="py-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              {item.landlord.avatarUrl ? (
                                <img src={item.landlord.avatarUrl} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                              ) : null}
                              <div className="font-semibold text-gray-900 text-xs truncate">{`${(item.landlord.firstName||'').trim()} ${(item.landlord.lastName||'').trim()}`}</div>
                            </div>
                            <div className="text-[10px] text-gray-600 mt-0.5 truncate">{item.landlord.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex items-start space-x-2">
                            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                              <Building className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-semibold text-gray-900 text-xs truncate">{item.unit.label}</div>
                              <div className="text-[10px] text-gray-600 mt-0.5 truncate">{prop.title}</div>
                              <div className="text-[10px] text-gray-500 capitalize mt-0.5">{prop.type.toLowerCase().replace('_', ' ')}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="max-w-[220px]">
                            <div className="flex items-start gap-1.5" title={addr}>
                              <MapPin className="h-3 w-3 mt-0.5 text-blue-500 flex-shrink-0" />
                              <span className="text-xs text-gray-700 leading-relaxed truncate block max-w-[200px]">
                                {addr.length > 48 ? `${addr.substring(0, 48)}...` : addr}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border whitespace-nowrap ${cls.badge}`}
                            title={item.blockedReason || item.flaggedReason || undefined}
                          >
                            {item.lifecycleStatus}
                          </span>
                        </TableCell>
                        <TableCell className="py-2">
                          {item.isFeatured ? (
                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-2 py-0.5 text-[10px]">Featured</Badge>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </TableCell>
                        {/* AI Risk cell removed */}
                        <TableCell className="py-2">
                          <span
                            className="text-xs text-slate-700"
                            title={item.reviewedBy && item.reviewedAt ? `Reviewed by ${item.reviewedBy} on ${formatDateTime(item.reviewedAt)}` : undefined}
                          >
                            {item.reviewedBy ? 'Yes' : 'No'}
                          </span>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="text-xs text-gray-600 flex items-center gap-1.5" title={formatDateTime(item.createdAt)}>
                            <Calendar className="h-3 w-3 text-blue-500" />
                            <span className="text-[10px]">{formatDateTime(item.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="text-xs text-gray-600 flex items-center gap-1.5" title={formatDateTime(item.updatedAt)}>
                            <Calendar className="h-3 w-3 text-blue-500" />
                            <span className="text-[10px]">{formatDateTime(item.updatedAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-1.5 justify-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-7 px-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                              onClick={() => navigate(`/admin/listing/${item.id}/details`)}
                            >
                              <Info className="h-3.5 w-3.5 mr-1" /> Details
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-slate-600">Page {currentPage} of {totalPages}</div>
          <div className="flex items-center gap-2">
            <Select value={String(pageSize)} onValueChange={(v)=>{ setPageSize(Number(v)); setPage(1); }}>
              <SelectTrigger className="h-8 w-[100px] text-xs border-blue-200">
                <SelectValue placeholder="Rows" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="h-8 text-xs" disabled={currentPage<=1} onClick={()=>setPage(p=>Math.max(1, p-1))}>Prev</Button>
            <Button variant="outline" className="h-8 text-xs" disabled={currentPage>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages, p+1))}>Next</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminListing
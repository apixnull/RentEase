import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllListingsForAdminRequest } from "@/api/admin/listingApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Calendar, Info, Eye, Flag, Clock, Ban, CheckCircle2, Search, ChevronDown, ChevronUp, RefreshCcw, Loader2, Sparkles, FileSearch } from "lucide-react";
import { motion } from "framer-motion";

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
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [lifecycleOpen, setLifecycleOpen] = useState(true);
  const [timeRange, setTimeRange] = useState<'all' | 'day' | 'week' | 'month'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetchListings = async ({ silent = false }: { silent?: boolean } = {}) => {
    const abort = new AbortController();
    try {
      if (!silent) {
        setLoading(true);
      }
      setRefreshing(true);
      setError(null);
      const res = await getAllListingsForAdminRequest({ signal: abort.signal });
      const body: AdminListingsResponse = res.data;
      setData(body.listings ?? []);
    } catch (err: any) {
      if (err?.name === "CanceledError") return;
      setError("Failed to load listings");
      console.error(err);
    } finally {
      if (!silent) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleRefresh = () => {
    if (!refreshing) {
      fetchListings({ silent: true });
    }
  };

  const handleClearFilters = () => {
    setSelectedStatus('all');
    setReviewFilter('all');
    setTimeRange('all');
    setSearchQuery('');
    setPage(1);
  };

  const hasActiveFilters =
    selectedStatus !== 'all' ||
    reviewFilter !== 'all' ||
    timeRange !== 'all' ||
    searchQuery.trim().length > 0;

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
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((l) => {
        const landlordName = `${(l.landlord.firstName || '').trim()} ${(l.landlord.lastName || '').trim()}`.toLowerCase();
        const landlordEmail = (l.landlord.email || '').toLowerCase();
        const propertyTitle = l.unit.property.title.toLowerCase();
        return (
          l.unit.label.toLowerCase().includes(q) ||
          propertyTitle.includes(q) ||
          landlordName.includes(q) ||
          landlordEmail.includes(q)
        );
      });
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
      return getSortTimestamp(b) - getSortTimestamp(a);
    });
    return list;
  }, [data, selectedStatus, reviewFilter, searchQuery, timeRange]);

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
      case 'WAITING_REVIEW':
        return {
          badge: 'bg-purple-100 text-purple-700 border-purple-200',
          bg: 'bg-purple-50 border-purple-300',
          gradient: 'from-purple-200/70 via-purple-100/50 to-purple-200/70',
          iconBg: 'bg-purple-500',
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
    <div className="min-h-screen p-6">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-200/80 via-indigo-200/75 to-blue-200/70 opacity-95" />
          <div className="relative m-[1px] rounded-[16px] bg-white/85 backdrop-blur-lg border border-white/60 shadow-lg">
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -top-12 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-purple-300/50 to-indigo-400/40 blur-3xl"
              initial={{ opacity: 0.4, scale: 0.85 }}
              animate={{ opacity: 0.7, scale: 1.05 }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-tl from-blue-200/40 to-indigo-200/35 blur-3xl"
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
                    <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white grid place-items-center shadow-xl shadow-indigo-500/30">
                      <Building className="h-5 w-5 relative z-10" />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                    </div>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 220 }}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white text-purple-600 border border-purple-100 shadow-sm grid place-items-center"
                    >
                      <Sparkles className="h-3 w-3" />
                    </motion.div>
                    <motion.div
                      className="absolute inset-0 rounded-2xl border-2 border-indigo-400/30"
                      animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 truncate">
                        Admin Listing Management
                      </h1>
                      <motion.div
                        animate={{ rotate: [0, 8, -8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Sparkles className="h-4 w-4 text-indigo-500" />
                      </motion.div>
                    </div>
                    <p className="text-sm text-slate-600 leading-6 flex items-center gap-1.5">
                      <Building className="h-4 w-4 text-purple-500" />
                      Moderate listings, review statuses, and act on risks
                    </p>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                  <Button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="h-11 rounded-xl bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 px-5 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 hover:brightness-110 disabled:opacity-70"
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
                </div>
              </div>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
                style={{ originX: 0 }}
                className="relative h-1 w-full rounded-full overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/80 via-indigo-400/80 to-blue-400/80" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Combined Listing Lifecycle Management & Filters */}
        <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
          <CardHeader className="pb-2 pt-3 px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1">
                <div>
                  <CardTitle className="text-sm font-semibold text-slate-900">Listing Lifecycle Management & Filters</CardTitle>
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
            {/* Filters Section */}
            <div className="pb-3 border-b border-slate-200">
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search by unit, property, landlord name, or email"
                    className="pl-9 h-10 text-sm border-blue-200 focus:border-blue-400"
                  />
                </div>
                <Select value={timeRange} onValueChange={(v: 'all'|'day'|'week'|'month')=>{ setTimeRange(v); setPage(1); }}>
                  <SelectTrigger className="h-10 w-[160px] text-sm border-blue-200">
                    <SelectValue placeholder="Time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="day">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
                {hasActiveFilters && (
                  <Button 
                    variant="outline" 
                    onClick={handleClearFilters}
                    className="h-10 text-sm border-blue-200 text-blue-700 hover:bg-blue-50 px-4"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <div className="text-xs text-slate-600 mt-2">
                Showing {(filtered.length === 0) ? 0 : ((page - 1) * pageSize + 1)} - {Math.min(page * pageSize, filtered.length)} of {filtered.length}
              </div>
            </div>

            {/* Status Cards - Smaller */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {/* Unreviewed - Purple color scheme */}
              <div 
                className={`relative p-2 rounded-lg border-2 transition-all cursor-pointer group ${reviewFilter === 'unreviewed' ? 'bg-purple-50 border-purple-300 shadow-lg' : 'bg-white border-purple-200 hover:border-purple-300 hover:shadow-md'}`}
                onClick={() => { setSelectedStatus('all'); setReviewFilter('unreviewed'); setPage(1); }}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-purple-500 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                    <FileSearch className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-slate-900">Unreviewed</p>
                    <p className="text-[9px] text-slate-600 mt-0.5">Needs review</p>
                    <p className="text-sm font-bold text-purple-700 mt-1">{(data||[]).filter(l=>isNeedsReview(l.lifecycleStatus)).length}</p>
                  </div>
                </div>
                {reviewFilter === 'unreviewed' && (
                  <div className="absolute top-1 right-1"><CheckCircle2 className="h-3 w-3 text-purple-600" /></div>
                )}
              </div>
              {/* Active (Visible + Hidden) */}
              <div 
                className={`relative p-2 rounded-lg border-2 transition-all cursor-pointer group ${selectedStatus === 'active' ? 'bg-emerald-50 border-emerald-400 shadow-lg' : 'bg-white border-emerald-200 hover:border-emerald-300 hover:shadow-md'}`}
                onClick={() => { setSelectedStatus('active'); setPage(1); }}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                    <Eye className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-slate-900">Active</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[9px] text-emerald-800 bg-emerald-100 px-1 py-0.5 rounded">Vis: {(data||[]).filter(l=>l.lifecycleStatus==='VISIBLE').length}</span>
                      <span className="text-[9px] text-teal-800 bg-teal-100 px-1 py-0.5 rounded">Hid: {(data||[]).filter(l=>l.lifecycleStatus==='HIDDEN').length}</span>
                    </div>
                    <p className="text-sm font-bold text-emerald-700 mt-1">{(data||[]).filter(l=>l.lifecycleStatus==='VISIBLE'||l.lifecycleStatus==='HIDDEN').length}</p>
                  </div>
                </div>
                {selectedStatus === 'active' && (
                  <div className="absolute top-1 right-1"><CheckCircle2 className="h-3 w-3 text-emerald-600" /></div>
                )}
              </div>
              {/* Flagged */}
              <div 
                className={`relative p-2 rounded-lg border-2 transition-all cursor-pointer group ${selectedStatus === 'FLAGGED' ? 'bg-amber-50 border-amber-300 shadow-lg' : 'bg-white border-amber-200 hover:border-amber-300 hover:shadow-md'}`}
                onClick={() => { setSelectedStatus('FLAGGED'); setPage(1); }}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center group-hover:bg-amber-600 transition-colors">
                    <Flag className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-slate-900">Flagged</p>
                    <p className="text-[9px] text-slate-600 mt-0.5">Under review</p>
                    <p className="text-sm font-bold text-amber-700 mt-1">{(data||[]).filter(l=>l.lifecycleStatus==='FLAGGED').length}</p>
                  </div>
                </div>
                {selectedStatus === 'FLAGGED' && (
                  <div className="absolute top-1 right-1"><CheckCircle2 className="h-3 w-3 text-amber-600" /></div>
                )}
              </div>
              {/* Expired */}
              <div 
                className={`relative p-2 rounded-lg border-2 transition-all cursor-pointer group ${selectedStatus === 'EXPIRED' ? 'bg-gray-50 border-gray-300 shadow-lg' : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'}`}
                onClick={() => { setSelectedStatus('EXPIRED'); setPage(1); }}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gray-500 flex items-center justify-center group-hover:bg-gray-600 transition-colors">
                    <Clock className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-slate-900">Expired</p>
                    <p className="text-[9px] text-slate-600 mt-0.5">Expired listings</p>
                    <p className="text-sm font-bold text-gray-700 mt-1">{(data||[]).filter(l=>l.lifecycleStatus==='EXPIRED').length}</p>
                  </div>
                </div>
                {selectedStatus === 'EXPIRED' && (
                  <div className="absolute top-1 right-1"><CheckCircle2 className="h-3 w-3 text-gray-600" /></div>
                )}
              </div>
              {/* Blocked */}
              <div 
                className={`relative p-2 rounded-lg border-2 transition-all cursor-pointer group ${selectedStatus === 'BLOCKED' ? 'bg-red-50 border-red-300 shadow-lg' : 'bg-white border-red-200 hover:border-red-300 hover:shadow-md'}`}
                onClick={() => { setSelectedStatus('BLOCKED'); setPage(1); }}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-red-500 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                    <Ban className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-slate-900">Blocked</p>
                    <p className="text-[9px] text-slate-600 mt-0.5">Suspended</p>
                    <p className="text-sm font-bold text-red-700 mt-1">{(data||[]).filter(l=>l.lifecycleStatus==='BLOCKED').length}</p>
                  </div>
                </div>
                {selectedStatus === 'BLOCKED' && (
                  <div className="absolute top-1 right-1"><CheckCircle2 className="h-3 w-3 text-red-600" /></div>
                )}
              </div>
            </div>
          </CardContent>
          )}
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
                    <TableHead className="font-semibold text-blue-900 py-2 text-xs">Unit</TableHead>
                    <TableHead className="font-semibold text-blue-900 py-2 text-xs">Property</TableHead>
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
                              <div className="text-[10px] text-gray-500 mt-0.5">Unit ID: {item.unit.id.slice(0, 6)}...</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 text-xs truncate">{prop.title}</div>
                            <div className="text-[10px] text-gray-500 capitalize mt-0.5">{prop.type.toLowerCase().replace('_', ' ')}</div>
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
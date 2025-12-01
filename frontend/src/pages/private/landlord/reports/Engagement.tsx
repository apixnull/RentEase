import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { CartesianGrid, XAxis, YAxis, BarChart, Bar, AreaChart, Area } from 'recharts';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import {
  Eye,
  Star,
  Loader2,
  BarChart3,
  Sparkles,
  Calendar,
  Filter,
  X,
  RotateCcw,
} from 'lucide-react';
import { getEngagementDataRequest } from '@/api/landlord/engagementApi';
import { getPropertiesWithUnitsRequest } from '@/api/landlord/financialApi';

interface PropertySummary {
  id: string;
  title: string;
  Unit: Array<{ id: string; label: string }>;
}

interface EngagementData {
  summary: {
    totalViews: number;
    totalReviews: number;
    averageRating: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
  units: Array<{
    unitId: string;
    unitLabel: string;
    propertyTitle: string;
    viewCount: number;
    reviewCount: number;
    averageRating: number;
    listingStatus: 'ACTIVE' | 'NOT_LISTED';
  }>;
  rawViews: Array<{
    id: string;
    unitId: string;
    viewedAt: string;
  }>;
  rawReviews: Array<{
    id: string;
    unitId: string;
    rating: number;
    createdAt: string;
  }>;
}

type DateRangePreset = 'THIS_MONTH' | 'THIS_YEAR' | 'ALL_TIME';
type ChartType = 'bar' | 'area';

const chartConfig = {
  views: {
    label: "Views",
    color: "#60a5fa",
  },
  reviews: {
    label: "Reviews",
    color: "#4ade80",
  },
} satisfies ChartConfig;

const Engagement = () => {
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [engagementData, setEngagementData] = useState<EngagementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('ALL');
  const [selectedUnitIdForChart, setSelectedUnitIdForChart] = useState<string>('ALL');
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>('ALL_TIME');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [activeChart, setActiveChart] = useState<'views' | 'reviews' | 'both'>('both');
  const [showFilters, setShowFilters] = useState(true);
  const [selectedUnitForModal, setSelectedUnitForModal] = useState<{
    unitId: string;
    unitLabel: string;
    propertyTitle: string;
  } | null>(null);

  const fetchProperties = async (signal?: AbortSignal) => {
    try {
      const res = await getPropertiesWithUnitsRequest({ signal });
      setProperties(res.data?.properties || []);
    } catch (error: any) {
      if (error?.name === 'CanceledError') return;
      console.error('Error loading properties:', error);
    }
  };

  const getDateRange = (preset: DateRangePreset) => {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (preset) {
      case 'THIS_MONTH':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'THIS_YEAR':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      case 'ALL_TIME':
        // Use a very old date for all time
        start = new Date('1970-01-01');
        end = now;
        break;
      default:
        start = startOfMonth(now);
        end = endOfMonth(now);
    }

    return { start, end };
  };

  const fetchEngagementData = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      
      const { start, end } = getDateRange(dateRangePreset);
      const startDate = start.toISOString();
      const endDate = end.toISOString();

      const params: any = {
        propertyId: selectedPropertyId !== 'ALL' ? selectedPropertyId : undefined,
        range: dateRangePreset === 'ALL_TIME' ? 'RANGE' : dateRangePreset === 'THIS_MONTH' ? 'MONTH' : 'YEAR',
        startDate: dateRangePreset === 'ALL_TIME' ? startDate : undefined,
        endDate: dateRangePreset === 'ALL_TIME' ? endDate : undefined,
        signal,
      };

      const res = await getEngagementDataRequest(params);
      setEngagementData(res.data || null);
    } catch (error: any) {
      if (error?.name === 'CanceledError') return;
      console.error('Error loading engagement data:', error);
      toast.error(error?.response?.data?.error || 'Failed to load engagement data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchProperties(controller.signal);
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchEngagementData(controller.signal);
    return () => controller.abort();
  }, [selectedPropertyId, dateRangePreset]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEngagementData();
  };

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  const availableUnits = selectedPropertyId === 'ALL' 
    ? (properties || []).flatMap(p => (p?.Unit || []).map(u => ({ ...u, propertyTitle: p.title })))
    : (selectedProperty?.Unit || []).map(u => ({ ...u, propertyTitle: selectedProperty?.title || '' })) || [];



  // Format chart data with client-side unit filtering
  const chartData = useMemo(() => {
    if (!engagementData) return [];
    
    const rawViews = Array.isArray(engagementData.rawViews) ? engagementData.rawViews : [];
    const rawReviews = Array.isArray(engagementData.rawReviews) ? engagementData.rawReviews : [];
    
    const filteredViews = selectedUnitIdForChart !== 'ALL'
      ? rawViews.filter(v => v && v.unitId === selectedUnitIdForChart)
      : rawViews;
    
    const filteredReviews = selectedUnitIdForChart !== 'ALL'
      ? rawReviews.filter(r => r && r.unitId === selectedUnitIdForChart)
      : rawReviews;

    // Use the date range from filters
    const { start, end } = getDateRange(dateRangePreset);
    const now = new Date();
    const currentYear = now.getFullYear();

    if (dateRangePreset === 'THIS_YEAR') {
      // Group by months (Jan, Feb, ..., Dec)
      const monthlyViewsMap = new Map<string, number>();
      const monthlyReviewsMap = new Map<string, number>();
      
      if (Array.isArray(filteredViews)) {
        filteredViews.forEach((view) => {
          if (view && view.viewedAt) {
            const viewDate = new Date(view.viewedAt);
            const monthKey = `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}`;
            monthlyViewsMap.set(monthKey, (monthlyViewsMap.get(monthKey) || 0) + 1);
          }
        });
      }

      if (Array.isArray(filteredReviews)) {
        filteredReviews.forEach((review) => {
          if (review && review.createdAt) {
            const reviewDate = new Date(review.createdAt);
            const monthKey = `${reviewDate.getFullYear()}-${String(reviewDate.getMonth() + 1).padStart(2, '0')}`;
            monthlyReviewsMap.set(monthKey, (monthlyReviewsMap.get(monthKey) || 0) + 1);
          }
        });
      }

      // Generate data for all 12 months
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthlyData = [];
      
      for (let month = 0; month < 12; month++) {
        const monthKey = `${currentYear}-${String(month + 1).padStart(2, '0')}`;
        monthlyData.push({
          date: monthKey,
          label: monthNames[month],
          views: monthlyViewsMap.get(monthKey) || 0,
          reviews: monthlyReviewsMap.get(monthKey) || 0,
        });
      }
      
      return monthlyData;
    } else if (dateRangePreset === 'ALL_TIME') {
      // Group by years, with current year last
      const yearlyViewsMap = new Map<number, number>();
      const yearlyReviewsMap = new Map<number, number>();
      
      if (Array.isArray(filteredViews)) {
        filteredViews.forEach((view) => {
          if (view && view.viewedAt) {
            const viewDate = new Date(view.viewedAt);
            const year = viewDate.getFullYear();
            yearlyViewsMap.set(year, (yearlyViewsMap.get(year) || 0) + 1);
          }
        });
      }

      if (Array.isArray(filteredReviews)) {
        filteredReviews.forEach((review) => {
          if (review && review.createdAt) {
            const reviewDate = new Date(review.createdAt);
            const year = reviewDate.getFullYear();
            yearlyReviewsMap.set(year, (yearlyReviewsMap.get(year) || 0) + 1);
          }
        });
      }

      // Always show years from 2022 to current year, even if no data exists
      const startYear = 2022;
      const allYears: number[] = [];
      
      // Generate all years from 2022 to current year
      for (let year = startYear; year <= currentYear; year++) {
        allYears.push(year);
      }

      const yearlyData = allYears.map(year => ({
        date: `${year}`,
        label: `${year}`,
        views: yearlyViewsMap.get(year) || 0,
        reviews: yearlyReviewsMap.get(year) || 0,
      }));
      
      return yearlyData;
    } else {
      // THIS_MONTH - show daily data
      const dailyViewsMap = new Map();
      const dailyReviewsMap = new Map();
      
      if (Array.isArray(filteredViews)) {
        filteredViews.forEach((view) => {
          if (view && view.viewedAt) {
            const dateKey = new Date(view.viewedAt).toISOString().split("T")[0];
            dailyViewsMap.set(dateKey, (dailyViewsMap.get(dateKey) || 0) + 1);
          }
        });
      }

      if (Array.isArray(filteredReviews)) {
        filteredReviews.forEach((review) => {
          if (review && review.createdAt) {
            const dateKey = new Date(review.createdAt).toISOString().split("T")[0];
            dailyReviewsMap.set(dateKey, (dailyReviewsMap.get(dateKey) || 0) + 1);
          }
        });
      }

      const dailyData = [];
      const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;
        
        dailyData.push({
          date: dateKey,
          label: format(currentDate, 'MMM d'), // Format as "Dec 1" instead of "12/01"
          views: dailyViewsMap.get(dateKey) || 0,
          reviews: dailyReviewsMap.get(dateKey) || 0,
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return dailyData;
    }
  }, [engagementData, selectedUnitIdForChart, dateRangePreset]);

  const totalViews = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.views, 0);
  }, [chartData]);

  const totalReviews = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.reviews, 0);
  }, [chartData]);


  // Per-unit rating distribution
  const unitRatingDistributions = useMemo(() => {
    if (!engagementData || !Array.isArray(engagementData.rawReviews)) {
      return new Map();
    }
    
    const distributions = new Map<string, { 5: number; 4: number; 3: number; 2: number; 1: number }>();
    
    engagementData.rawReviews.forEach(review => {
      if (review && review.unitId && review.rating >= 1 && review.rating <= 5) {
        if (!distributions.has(review.unitId)) {
          distributions.set(review.unitId, { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
        }
        const dist = distributions.get(review.unitId)!;
        dist[review.rating as keyof typeof dist]++;
      }
    });
    
    return distributions;
  }, [engagementData]);

  const getListingStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
      ACTIVE: { label: "Active", variant: "default", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      NOT_LISTED: { label: "Not Listed", variant: "outline", className: "bg-slate-50 text-slate-600 border-slate-200" },
    };
    const config = statusConfig[status] || statusConfig.NOT_LISTED;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };


  const { start, end } = getDateRange(dateRangePreset);

  return (
    <div className="space-y-6 p-4 sm:p-6">
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

          <div className="px-4 sm:px-6 py-5 space-y-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: [0, -3, 3, 0] }}
                  className="relative flex-shrink-0"
                >
                  <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-600 text-white grid place-items-center shadow-xl shadow-cyan-500/30">
                    <Eye className="h-5 w-5 relative z-10" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                  </div>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 220 }}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white text-teal-600 border border-teal-100 shadow-sm grid place-items-center"
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
                      Engagement Analytics
                    </h1>
                    <motion.div
                      animate={{ rotate: [0, 8, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Sparkles className="h-4 w-4 text-emerald-500" />
                    </motion.div>
                  </div>
                  <p className="text-sm text-slate-600 leading-6 flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-cyan-500" />
                    Track unit views, reviews, and performance metrics
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="h-11 rounded-xl border-slate-200 bg-white/80 px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-white"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="h-11 rounded-xl border-slate-200 bg-white/80 px-5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-white disabled:opacity-70"
                >
                  {refreshing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Refreshing
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4" />
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

      {/* Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters & Date Range
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedPropertyId('ALL');
                      setDateRangePreset('ALL_TIME');
                    }}
                    className="h-8 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Property Filter */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Property</label>
                    <Select 
                      value={selectedPropertyId} 
                      onValueChange={(value) => {
                        setSelectedPropertyId(value);
                        setSelectedUnitIdForChart('ALL');
                      }}
                    >
                      <SelectTrigger className="w-full h-10 text-sm border-slate-200">
                        <SelectValue placeholder="All Properties" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Properties</SelectItem>
                        {(properties || []).map(property => (
                          <SelectItem key={property.id} value={property.id}>
                            {property.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Range Preset */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Date Range</label>
                    <Select 
                      value={dateRangePreset} 
                      onValueChange={(value) => setDateRangePreset(value as DateRangePreset)}
                    >
                      <SelectTrigger className="w-full h-10 text-sm border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="THIS_MONTH">This Month</SelectItem>
                        <SelectItem value="THIS_YEAR">This Year</SelectItem>
                        <SelectItem value="ALL_TIME">All Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Date Range Display */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-xs text-slate-600">
                    {dateRangePreset === 'ALL_TIME' 
                      ? 'All Time' 
                      : `${format(start, 'MMM dd, yyyy')} - ${format(end, 'MMM dd, yyyy')}`}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full" />
          ))}
        </div>
      ) : engagementData ? (
        <>
          {/* Chart */}
          <Card className="shadow-sm border border-slate-200">
            <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
              <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <CardTitle>Engagement Trend</CardTitle>
                  <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
                    <SelectTrigger className="w-[120px] h-8 text-xs border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="area">Area Chart</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select 
                    value={selectedUnitIdForChart} 
                    onValueChange={setSelectedUnitIdForChart}
                    disabled={!availableUnits || availableUnits.length === 0}
                  >
                    <SelectTrigger 
                      className="w-[180px] h-8 text-xs border-slate-200"
                      disabled={!availableUnits || availableUnits.length === 0}
                    >
                      <SelectValue placeholder="All Units" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Units</SelectItem>
                      {(availableUnits || []).map(unit => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.label} {selectedPropertyId !== 'ALL' ? '' : `(${unit.propertyTitle})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <CardDescription className="flex flex-wrap items-center gap-2">
                  {(() => {
                    const { start, end } = getDateRange(dateRangePreset);
                    return (
                      <>
                        <span>
                          {dateRangePreset === 'ALL_TIME' 
                            ? 'All Time' 
                            : `${format(start, 'MMM dd, yyyy')} - ${format(end, 'MMM dd, yyyy')}`}
                        </span>
                        {selectedPropertyId !== 'ALL' && (
                          <span className="text-slate-500">
                            • {(properties || []).find(p => p.id === selectedPropertyId)?.title || 'Property'}
                          </span>
                        )}
                        {selectedUnitIdForChart !== 'ALL' && (
                          <span className="text-slate-500">
                            • {(availableUnits || []).find(u => u.id === selectedUnitIdForChart)?.label || 'Unit'}
                          </span>
                        )}
                      </>
                    );
                  })()}
                </CardDescription>
              </div>
              <div className="flex">
                {(['views', 'reviews'] as const).map((key) => (
                  <button
                    key={key}
                    data-active={activeChart === key || activeChart === 'both'}
                    className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6 hover:bg-slate-50/50 transition-colors"
                    onClick={() => setActiveChart(activeChart === key ? 'both' : key)}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: chartConfig[key].color }}
                      />
                      <span className="text-muted-foreground text-xs font-medium">
                        {chartConfig[key].label}
                      </span>
                    </div>
                    <span className="text-lg leading-none font-bold sm:text-3xl">
                      {key === 'views' ? totalViews.toLocaleString() : totalReviews.toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
              <ChartContainer
                config={chartConfig}
                className="aspect-auto h-[300px] w-full"
                style={{
                  '--color-views': chartConfig.views.color,
                  '--color-reviews': chartConfig.reviews.color,
                } as React.CSSProperties}
              >
                {chartType === 'bar' ? (
                  <BarChart data={chartData} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={dateRangePreset === 'ALL_TIME' ? 40 : dateRangePreset === 'THIS_YEAR' ? 20 : 32}
                      tickFormatter={(value) => {
                        if (dateRangePreset === 'ALL_TIME') {
                          // For years, just return the year
                          return value;
                        } else if (dateRangePreset === 'THIS_YEAR') {
                          // For months, find the label from chartData
                          const dataPoint = chartData.find(d => d.date === value);
                          return dataPoint?.label || value;
                        } else {
                          // For THIS_MONTH, show date
                          const dataPoint = chartData.find(d => d.date === value);
                          return dataPoint?.label || value;
                        }
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          className="w-[150px]"
                          labelFormatter={(value) => {
                            if (dateRangePreset === 'ALL_TIME') {
                              return `Year ${value}`;
                            } else if (dateRangePreset === 'THIS_YEAR') {
                              const dataPoint = chartData.find(d => d.date === value);
                              return dataPoint?.label ? `${dataPoint.label} ${new Date().getFullYear()}` : value;
                            } else {
                              // value is the dateKey in YYYY-MM-DD format, format it properly
                              return format(new Date(value), 'MMM d, yyyy');
                            }
                          }}
                        />
                      }
                    />
                    {(activeChart === 'views' || activeChart === 'both') && (
                      <Bar dataKey="views" fill={chartConfig.views.color} radius={[4, 4, 0, 0]} />
                    )}
                    {(activeChart === 'reviews' || activeChart === 'both') && (
                      <Bar dataKey="reviews" fill={chartConfig.reviews.color} radius={[4, 4, 0, 0]} />
                    )}
                  </BarChart>
                ) : (
                  <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={dateRangePreset === 'ALL_TIME' ? 40 : dateRangePreset === 'THIS_YEAR' ? 20 : 32}
                      tickFormatter={(value) => {
                        if (dateRangePreset === 'ALL_TIME') {
                          // For years, just return the year
                          return value;
                        } else if (dateRangePreset === 'THIS_YEAR') {
                          // For months, find the label from chartData
                          const dataPoint = chartData.find(d => d.date === value);
                          return dataPoint?.label || value;
                        } else {
                          // For THIS_MONTH, show date
                          const dataPoint = chartData.find(d => d.date === value);
                          return dataPoint?.label || value;
                        }
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          className="w-[150px]"
                          labelFormatter={(value) => {
                            if (dateRangePreset === 'ALL_TIME') {
                              return `Year ${value}`;
                            } else if (dateRangePreset === 'THIS_YEAR') {
                              const dataPoint = chartData.find(d => d.date === value);
                              return dataPoint?.label ? `${dataPoint.label} ${new Date().getFullYear()}` : value;
                            } else {
                              // value is the dateKey in YYYY-MM-DD format, format it properly
                              return format(new Date(value), 'MMM d, yyyy');
                            }
                          }}
                        />
                      }
                    />
                    {(activeChart === 'views' || activeChart === 'both') && (
                      <Area
                        dataKey="views"
                        type="monotone"
                        fill={chartConfig.views.color}
                        fillOpacity={0.6}
                        stroke={chartConfig.views.color}
                        strokeWidth={2}
                      />
                    )}
                    {(activeChart === 'reviews' || activeChart === 'both') && (
                      <Area
                        dataKey="reviews"
                        type="monotone"
                        fill={chartConfig.reviews.color}
                        fillOpacity={0.6}
                        stroke={chartConfig.reviews.color}
                        strokeWidth={2}
                      />
                    )}
                  </AreaChart>
                )}
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Unit Performance */}
          <Card className="shadow-sm border border-slate-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-slate-500" />
                  <CardTitle className="text-base">Unit Performance</CardTitle>
                </div>
                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                  {Array.isArray(engagementData.units) ? engagementData.units.length : 0} units
                </Badge>
              </div>
              <CardDescription>All units sorted by engagement (highest to lowest)</CardDescription>
            </CardHeader>
            <CardContent>
              {!engagementData.units || engagementData.units.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                  No data available for selected filters.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold">Unit</TableHead>
                        <TableHead className="font-semibold">Listing Status</TableHead>
                        <TableHead className="text-right font-semibold">Views</TableHead>
                        <TableHead className="text-right font-semibold">Reviews</TableHead>
                        <TableHead className="text-right font-semibold">Rating</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(engagementData.units || []).map((unit) => {
                        return (
                          <TableRow 
                            key={unit.unitId} 
                            className="hover:bg-slate-50/50 cursor-pointer"
                            onClick={() => {
                              setSelectedUnitForModal({
                                unitId: unit.unitId,
                                unitLabel: unit.unitLabel,
                                propertyTitle: unit.propertyTitle,
                              });
                            }}
                          >
                            <TableCell>
                              <div>
                                <div className="font-medium text-sm">{unit.unitLabel}</div>
                                <div className="text-xs text-slate-500">{unit.propertyTitle}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getListingStatusBadge(unit.listingStatus)}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="font-medium">{unit.viewCount.toLocaleString()}</span>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="font-medium">{unit.reviewCount.toLocaleString()}</span>
                            </TableCell>
                            <TableCell className="text-right">
                              {unit.averageRating > 0 ? (
                                <div className="flex items-center justify-end gap-1">
                                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                  <span className="font-medium">{unit.averageRating.toFixed(1)}</span>
                                </div>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
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
        </>
      ) : (
        <Card className="border border-dashed border-slate-300 bg-slate-50/60">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <Eye className="h-10 w-10 text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-800">No engagement data</h3>
            <p className="max-w-md text-sm text-slate-500">
              No views or reviews found for the selected filters. Try adjusting your filters or check back later.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Rating Distribution Modal */}
      <Dialog open={!!selectedUnitForModal} onOpenChange={(open) => {
        if (!open) setSelectedUnitForModal(null);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rating Distribution</DialogTitle>
            <DialogDescription>
              {selectedUnitForModal && (
                <>
                  {selectedUnitForModal.unitLabel} - {selectedUnitForModal.propertyTitle}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedUnitForModal && (() => {
            const unitDistribution = unitRatingDistributions.get(selectedUnitForModal.unitId) || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            const totalUnitReviews: number = (Object.values(unitDistribution) as number[]).reduce((sum: number, count: number) => sum + count, 0);
            
            return (
              <div className="space-y-4 py-4">
                {totalUnitReviews === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Star className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                    <p className="text-sm">No reviews yet for this unit.</p>
                  </div>
                ) : null}
                <div className="space-y-3">
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count = unitDistribution[rating as keyof typeof unitDistribution];
                    const percentage = totalUnitReviews > 0 
                      ? (count / totalUnitReviews) * 100 
                      : 0;
                    return (
                      <div key={rating} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="font-medium text-gray-700">{rating} Star{rating !== 1 ? 's' : ''}</span>
                          </div>
                          <span className="text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                        </div>
                        <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-400 to-yellow-400 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                {totalUnitReviews > 0 && (
                  <div className="pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">Total Reviews</span>
                      <span className="text-gray-600 font-semibold">{totalUnitReviews}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default Engagement;

"use client";

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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { CartesianGrid, Line, LineChart, XAxis, YAxis, BarChart, Bar, AreaChart, Area } from 'recharts';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, parseISO } from 'date-fns';
import {
  Eye,
  Star,
  Loader2,
  RefreshCcw,
  BarChart3,
  Sparkles,
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
    performanceScore: number;
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

type DateRangeType = 'MONTH' | 'YEAR' | 'RANGE';
type ChartType = 'line' | 'bar' | 'area';

const chartConfig = {
  views: {
    label: "Views",
    color: "#60a5fa", // Light Blue
  },
  reviews: {
    label: "Reviews",
    color: "#4ade80", // Light Green
  },
} satisfies ChartConfig;

const Engagement = () => {
  const [properties, setProperties] = useState<PropertySummary[]>([]);
  const [engagementData, setEngagementData] = useState<EngagementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('ALL');
  const [selectedUnitIdForChart, setSelectedUnitIdForChart] = useState<string>('ALL');
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('MONTH');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [customMonthRange, setCustomMonthRange] = useState<number>(1);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [activeChart, setActiveChart] = useState<'views' | 'reviews' | 'both'>('both');

  const fetchProperties = async (signal?: AbortSignal) => {
    try {
      const res = await getPropertiesWithUnitsRequest({ signal });
      setProperties(res.data?.properties || []);
    } catch (error: any) {
      if (error?.name === 'CanceledError') return;
      console.error('Error loading properties:', error);
    }
  };

  const fetchEngagementData = async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      
      let startDate: string | undefined;
      let endDate: string | undefined;
      let range: DateRangeType = dateRangeType;

      if (dateRangeType === 'MONTH') {
        const now = new Date();
        startDate = startOfMonth(now).toISOString();
        endDate = endOfMonth(now).toISOString();
      } else if (dateRangeType === 'YEAR') {
        const now = new Date();
        startDate = startOfYear(now).toISOString();
        endDate = endOfYear(now).toISOString();
      } else if (dateRangeType === 'RANGE') {
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate).toISOString();
          endDate = new Date(customEndDate).toISOString();
        } else if (customMonthRange) {
          const end = new Date();
          const start = subMonths(end, customMonthRange - 1);
          startDate = startOfMonth(start).toISOString();
          endDate = endOfMonth(end).toISOString();
        }
      }

      const params: any = {
        propertyId: selectedPropertyId !== 'ALL' ? selectedPropertyId : undefined,
        range,
        signal,
      };

      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

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
  }, [selectedPropertyId, dateRangeType, customStartDate, customEndDate, customMonthRange]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEngagementData();
  };

  const selectedProperty = properties.find(p => p.id === selectedPropertyId);
  const availableUnits = selectedPropertyId === 'ALL' 
    ? (properties || []).flatMap(p => (p?.Unit || []).map(u => ({ ...u, propertyTitle: p.title })))
    : (selectedProperty?.Unit || []).map(u => ({ ...u, propertyTitle: selectedProperty?.title || '' })) || [];

  // Calculate filtered summary based on selected unit
  const filteredSummary = useMemo(() => {
    if (!engagementData) {
      return {
        totalViews: 0,
        totalReviews: 0,
        averageRating: 0,
      };
    }

    // Filter views and reviews by selected unit
    const rawViews = engagementData.rawViews || [];
    const rawReviews = engagementData.rawReviews || [];
    
    const filteredViews = selectedUnitIdForChart !== 'ALL'
      ? rawViews.filter(v => v.unitId === selectedUnitIdForChart)
      : rawViews;
    
    const filteredReviews = selectedUnitIdForChart !== 'ALL'
      ? rawReviews.filter(r => r.unitId === selectedUnitIdForChart)
      : rawReviews;

    const totalViews = filteredViews.length;
    const totalReviews = filteredReviews.length;
    const averageRating = filteredReviews.length > 0
      ? filteredReviews.reduce((sum, r) => sum + r.rating, 0) / filteredReviews.length
      : 0;

    return {
      totalViews,
      totalReviews,
      averageRating: Number(averageRating.toFixed(1)),
    };
  }, [engagementData, selectedUnitIdForChart]);

  // Format chart data with client-side unit filtering
  const chartData = useMemo(() => {
    if (!engagementData) return [];
    
    const rawViews = engagementData.rawViews || [];
    const rawReviews = engagementData.rawReviews || [];
    
    // Filter views and reviews by selected unit
    const filteredViews = selectedUnitIdForChart !== 'ALL'
      ? rawViews.filter(v => v.unitId === selectedUnitIdForChart)
      : rawViews;
    
    const filteredReviews = selectedUnitIdForChart !== 'ALL'
      ? rawReviews.filter(r => r.unitId === selectedUnitIdForChart)
      : rawReviews;

    // Calculate daily views and reviews
    const dailyViewsMap = new Map();
    const dailyReviewsMap = new Map();
    
    filteredViews.forEach((view) => {
      const dateKey = new Date(view.viewedAt).toISOString().split("T")[0];
      dailyViewsMap.set(dateKey, (dailyViewsMap.get(dateKey) || 0) + 1);
    });

    filteredReviews.forEach((review) => {
      const dateKey = new Date(review.createdAt).toISOString().split("T")[0];
      dailyReviewsMap.set(dateKey, (dailyReviewsMap.get(dateKey) || 0) + 1);
    });

    // Generate all dates in range for complete chart
    if (!engagementData.summary?.dateRange?.start || !engagementData.summary?.dateRange?.end) return [];
    
    const dateStart = new Date(engagementData.summary.dateRange.start);
    const dateEnd = new Date(engagementData.summary.dateRange.end);
    const dailyData = [];
    const currentDate = new Date(dateStart);
    
    while (currentDate <= dateEnd) {
      const dateKey = currentDate.toISOString().split("T")[0];
      dailyData.push({
        date: dateKey,
        views: dailyViewsMap.get(dateKey) || 0,
        reviews: dailyReviewsMap.get(dateKey) || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dailyData;
  }, [engagementData, selectedUnitIdForChart]);

  const totalViews = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.views, 0);
  }, [chartData]);

  const totalReviews = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.reviews, 0);
  }, [chartData]);

  const getListingStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
      ACTIVE: { label: "Active", variant: "default", className: "bg-green-50 text-green-700 border-green-200" },
      NOT_LISTED: { label: "Not Listed", variant: "outline", className: "bg-slate-50 text-slate-600 border-slate-200" },
    };
    const config = statusConfig[status] || statusConfig.NOT_LISTED;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

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
                      <RefreshCcw className="h-4 w-4" />
                      Refresh Data
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
      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Property</label>
              <Select value={selectedPropertyId} onValueChange={(value) => {
                setSelectedPropertyId(value);
                setSelectedUnitIdForChart('ALL'); // Reset unit filter when property changes
              }}>
                <SelectTrigger className="w-full text-sm">
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

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Date Range</label>
              <Select value={dateRangeType} onValueChange={(value) => setDateRangeType(value as DateRangeType)}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTH">This Month</SelectItem>
                  <SelectItem value="YEAR">This Year</SelectItem>
                  <SelectItem value="RANGE">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRangeType === 'RANGE' && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Month Range</label>
                <Select value={customMonthRange.toString()} onValueChange={(value) => setCustomMonthRange(parseInt(value))}>
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? 'Month' : 'Months'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {dateRangeType === 'RANGE' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium uppercase tracking-wide text-slate-500">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full" />
          ))}
        </div>
      ) : engagementData ? (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="shadow-sm border border-slate-200">
              <CardHeader className="pb-2">
                <CardDescription>Total Views</CardDescription>
                <CardTitle className="text-2xl">{filteredSummary.totalViews.toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>
                    {selectedUnitIdForChart !== 'ALL' 
                      ? `${(availableUnits || []).find(u => u.id === selectedUnitIdForChart)?.label || 'Selected unit'} views`
                      : 'Unit views in selected period'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-slate-200">
              <CardHeader className="pb-2">
                <CardDescription>Total Reviews</CardDescription>
                <CardTitle className="text-2xl">{filteredSummary.totalReviews.toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span>
                    {selectedUnitIdForChart !== 'ALL' 
                      ? `${(availableUnits || []).find(u => u.id === selectedUnitIdForChart)?.label || 'Selected unit'} reviews`
                      : 'Reviews received'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-slate-200">
              <CardHeader className="pb-2">
                <CardDescription>Average Review Rating</CardDescription>
                <CardTitle className="text-2xl">
                  {filteredSummary.averageRating > 0 
                    ? filteredSummary.averageRating.toFixed(1)
                    : '—'}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>Out of 5.0 stars</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card className="shadow-sm border border-slate-200">
            <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
              <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <CardTitle>Engagement Trend</CardTitle>
                  <Select value={chartType} onValueChange={(value) => setChartType(value as ChartType)}>
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="area">Area Chart</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select 
                    value={selectedUnitIdForChart} 
                    onValueChange={setSelectedUnitIdForChart}
                    disabled={!availableUnits || availableUnits.length === 0}
                  >
                    <SelectTrigger className="w-[180px] h-8 text-xs">
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
                  {engagementData.summary?.dateRange?.start && engagementData.summary?.dateRange?.end && (
                    <>
                      <span>
                        {format(parseISO(engagementData.summary.dateRange.start), 'MMM dd, yyyy')} - {format(parseISO(engagementData.summary.dateRange.end), 'MMM dd, yyyy')}
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
                  )}
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
                className="aspect-auto h-[250px] w-full"
                style={{
                  '--color-views': chartConfig.views.color,
                  '--color-reviews': chartConfig.reviews.color,
                } as React.CSSProperties}
              >
                {chartType === 'line' ? (
                  <LineChart
                    accessibilityLayer
                    data={chartData}
                    margin={{ left: 12, right: 12 }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={32}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
                            return new Date(value).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            });
                          }}
                        />
                      }
                    />
                    {(activeChart === 'views' || activeChart === 'both') && (
                      <Line
                        dataKey="views"
                        type="monotone"
                        stroke={chartConfig.views.color}
                        strokeWidth={2}
                        dot={false}
                      />
                    )}
                    {(activeChart === 'reviews' || activeChart === 'both') && (
                      <Line
                        dataKey="reviews"
                        type="monotone"
                        stroke={chartConfig.reviews.color}
                        strokeWidth={2}
                        dot={false}
                      />
                    )}
                  </LineChart>
                ) : chartType === 'bar' ? (
                  <BarChart data={chartData} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={32}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
                            return new Date(value).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            });
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
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={32}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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
                            return new Date(value).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            });
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
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-slate-500" />
                <CardTitle className="text-base">Unit Performance</CardTitle>
              </div>
              <CardDescription>All units sorted by engagement (highest to lowest)</CardDescription>
            </CardHeader>
            <CardContent>
              {!engagementData.units || engagementData.units.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                  No data available for selected filters.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Unit</TableHead>
                      <TableHead>Listing Status</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                      <TableHead className="text-right">Reviews</TableHead>
                      <TableHead className="text-right">Rating</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(engagementData.units || []).map((unit) => (
                      <TableRow key={unit.unitId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{unit.unitLabel}</div>
                            <div className="text-xs text-slate-500">{unit.propertyTitle}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getListingStatusBadge(unit.listingStatus)}
                        </TableCell>
                        <TableCell className="text-right">{unit.viewCount}</TableCell>
                        <TableCell className="text-right">{unit.reviewCount}</TableCell>
                        <TableCell className="text-right">
                          {unit.averageRating > 0 ? (
                            <div className="flex items-center justify-end gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{unit.averageRating.toFixed(1)}</span>
                            </div>
                          ) : (
                            '—'
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            {unit.performanceScore.toFixed(0)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
    </div>
  );
};

export default Engagement;


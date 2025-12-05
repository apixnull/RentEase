import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { 
  Loader2, 
  RotateCcw, 
  Wrench,
  BarChart3,
  Download,
  XCircle,
  Building2,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { getMaintenanceAnalyticsRequest, type MaintenanceAnalyticsResponse } from '@/api/landlord/maintenanceAnalyticsApi';
import { getPropertiesWithUnitsRequest } from '@/api/landlord/financialApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const maintenanceChartConfig = {
  requests: {
    label: 'Maintenance Requests',
    color: 'hsl(25, 95%, 53%)', // Orange-500
  },
} satisfies ChartConfig;


type TimeFilter = 'THIS_MONTH' | 'THIS_YEAR' | 'ALL_TIME';

const MaintenanceAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<{
    thisMonth: MaintenanceAnalyticsResponse | null;
    thisYear: MaintenanceAnalyticsResponse | null;
    allTime: MaintenanceAnalyticsResponse | null;
  }>({
    thisMonth: null,
    thisYear: null,
    allTime: null,
  });
  const [allPropertiesWithUnits, setAllPropertiesWithUnits] = useState<Array<{
    id: string;
    title: string;
    Unit: Array<{ id: string; label: string }>;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('THIS_MONTH');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('ALL');

  const fetchAllAnalyticsData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const currentMonth = format(now, 'yyyy-MM');
      
      const [thisMonthRes, thisYearRes, allTimeRes, propertiesRes] = await Promise.all([
        getMaintenanceAnalyticsRequest({ period: 'THIS_MONTH' }),
        getMaintenanceAnalyticsRequest({ period: 'THIS_YEAR' }),
        getMaintenanceAnalyticsRequest({ 
          period: 'CUSTOM',
          startMonth: '2000-01',
          endMonth: currentMonth,
        }),
        getPropertiesWithUnitsRequest(),
      ]);
      
      setAnalyticsData({
        thisMonth: thisMonthRes.data,
        thisYear: thisYearRes.data,
        allTime: allTimeRes.data,
      });
      setAllPropertiesWithUnits(propertiesRes.data.properties || []);
    } catch (error: any) {
      console.error('Failed to fetch maintenance analytics:', error);
      toast.error(error?.response?.data?.error || 'Failed to load maintenance analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllAnalyticsData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllAnalyticsData();
    toast.success('Maintenance analytics refreshed');
  };

  // Get current data based on filter
  const currentData = useMemo(() => {
    if (timeFilter === 'THIS_MONTH') return analyticsData.thisMonth;
    if (timeFilter === 'THIS_YEAR') return analyticsData.thisYear;
    return analyticsData.allTime;
  }, [analyticsData, timeFilter]);

  // Filter maintenance breakdown by created date and property
  const filteredBreakdown = useMemo(() => {
    if (!currentData?.maintenanceBreakdown) return [];
    
    const now = new Date();
    const monthEnd = endOfMonth(now);
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);
    
    let breakdown = currentData.maintenanceBreakdown;
    
    // Filter by created date based on timeFilter
    breakdown = breakdown.filter(item => {
      const createdAt = new Date(item.createdAt);
      
      if (timeFilter === 'THIS_MONTH') {
        return createdAt >= startOfMonth(now) && createdAt <= monthEnd;
      } else if (timeFilter === 'THIS_YEAR') {
        return createdAt >= yearStart && createdAt <= yearEnd;
      }
      // ALL_TIME - no date filter
      return true;
    });
    
    // Filter by property
    if (selectedPropertyId !== 'ALL') {
      breakdown = breakdown.filter(item => item.propertyId === selectedPropertyId);
    }
    
    return breakdown;
  }, [currentData, timeFilter, selectedPropertyId]);

  // Calculate stats for This Month (excluding invalid and cancelled)
  const thisMonthStats = useMemo(() => {
    if (timeFilter !== 'THIS_MONTH') return { total: 0, invalidCancelled: 0 };
    
    const total = filteredBreakdown.filter(
      item => item.status !== 'INVALID' && item.status !== 'CANCELLED'
    ).length;
    
    const invalidCancelled = filteredBreakdown.filter(
      item => item.status === 'INVALID' || item.status === 'CANCELLED'
    ).length;
    
    return { total, invalidCancelled };
  }, [filteredBreakdown, timeFilter]);

  // Maintenance Requests Over Time Data (similar to paymentCountsData in LeaseAnalytics)
  const maintenanceRequestsOverTimeData = useMemo(() => {
    const now = new Date();
    const requests = filteredBreakdown;
    
    if (timeFilter === 'THIS_MONTH') {
      // Group by day for current month
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      const dailyMap = new Map<string, number>();
      
      requests.forEach(request => {
        if (!request || !request.createdAt) return;
        try {
          const date = new Date(request.createdAt);
          if (date >= start && date <= end) {
            const dateKey = format(date, 'yyyy-MM-dd');
            const current = dailyMap.get(dateKey) || 0;
            dailyMap.set(dateKey, current + 1);
          }
        } catch (error) {
          console.error('Error parsing date:', request.createdAt);
        }
      });
      
      // Fill in all days of the month
      const dailyData: Array<{ date: string; count: number }> = [];
      const currentDate = new Date(start);
      while (currentDate <= end) {
        const dateKey = format(currentDate, 'yyyy-MM-dd');
        dailyData.push({
          date: dateKey,
          count: dailyMap.get(dateKey) || 0,
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return dailyData;
    } else if (timeFilter === 'THIS_YEAR') {
      // Group by month for current year
      const start = startOfYear(now);
      const end = endOfYear(now);
      const monthlyMap = new Map<string, number>();
      
      requests.forEach(request => {
        if (!request || !request.createdAt) return;
        try {
          const date = new Date(request.createdAt);
          if (date >= start && date <= end) {
            const monthKey = format(date, 'yyyy-MM');
            const current = monthlyMap.get(monthKey) || 0;
            monthlyMap.set(monthKey, current + 1);
          }
        } catch (error) {
          console.error('Error parsing date:', request.createdAt);
        }
      });
      
      // Fill in all months of the year
      const monthlyData: Array<{ date: string; count: number }> = [];
      for (let month = 0; month < 12; month++) {
        const date = new Date(now.getFullYear(), month, 1);
        const monthKey = format(date, 'yyyy-MM');
        monthlyData.push({
          date: monthKey + '-01',
          count: monthlyMap.get(monthKey) || 0,
        });
      }
      
      return monthlyData;
    } else {
      // ALL_TIME - Group by year (last 5 years)
      const currentYear = now.getFullYear();
      const startYear = currentYear - 4;
      const yearlyMap = new Map<string, number>();
      
      requests.forEach(request => {
        if (!request || !request.createdAt) return;
        try {
          const date = new Date(request.createdAt);
          const year = date.getFullYear();
          if (year >= startYear && year <= currentYear) {
            const yearKey = `${year}-01-01`;
            const current = yearlyMap.get(yearKey) || 0;
            yearlyMap.set(yearKey, current + 1);
          }
        } catch (error) {
          console.error('Error parsing date:', request.createdAt);
        }
      });
      
      // Fill in all 5 years
      const yearlyData: Array<{ date: string; count: number }> = [];
      for (let year = startYear; year <= currentYear; year++) {
        const yearKey = `${year}-01-01`;
        yearlyData.push({
          date: yearKey,
          count: yearlyMap.get(yearKey) || 0,
        });
      }
      
      return yearlyData;
    }
  }, [filteredBreakdown, timeFilter]);

  // Top Units with Maintenance Requests
  const topUnits = useMemo(() => {
    const unitMap = new Map<string, { unitLabel: string; propertyTitle: string; count: number }>();
    
    filteredBreakdown.forEach(item => {
      const key = `${item.propertyId}-${item.unitId}`;
      const existing = unitMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        unitMap.set(key, {
          unitLabel: item.unitLabel || 'Unknown',
          propertyTitle: item.propertyTitle || 'Unknown',
          count: 1,
        });
      }
    });
    
    return Array.from(unitMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10
  }, [filteredBreakdown]);

  // Top Users with Maintenance Requests
  const topUsers = useMemo(() => {
    const userMap = new Map<string, { name: string; email: string; count: number }>();
    
    filteredBreakdown.forEach(item => {
      const key = item.reporterEmail || item.reporterName || 'unknown';
      const existing = userMap.get(key);
      if (existing) {
        existing.count++;
      } else {
        userMap.set(key, {
          name: item.reporterName || 'Unknown',
          email: item.reporterEmail || 'Unknown',
          count: 1,
        });
      }
    });
    
    return Array.from(userMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10
  }, [filteredBreakdown]);

  // Get period label
  const periodLabel = useMemo(() => {
    if (timeFilter === 'THIS_MONTH') return 'this month';
    if (timeFilter === 'THIS_YEAR') return 'this year';
    return 'all time';
  }, [timeFilter]);

  // Get chart title
  const chartTitle = useMemo(() => {
    if (timeFilter === 'THIS_MONTH') return 'Daily Maintenance Requests';
    if (timeFilter === 'THIS_YEAR') return 'Monthly Maintenance Requests';
    return 'Yearly Maintenance Requests';
  }, [timeFilter]);

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      OPEN: { label: 'Open', variant: 'default' },
      IN_PROGRESS: { label: 'In Progress', variant: 'secondary' },
      RESOLVED: { label: 'Resolved', variant: 'outline' },
      CANCELLED: { label: 'Cancelled', variant: 'secondary' },
      INVALID: { label: 'Invalid', variant: 'destructive' },
    };
    
    const statusInfo = statusMap[status.toUpperCase()] || { label: status, variant: 'outline' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  // Generate PDF
  const handleDownloadReport = () => {
    if (!currentData) {
      toast.error('No data available to download');
      return;
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text('RentEase', pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Property Management Platform', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    
    doc.setDrawColor(200, 200, 200);
    doc.line(14, yPos, pageWidth - 14, yPos);
    yPos += 10;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Maintenance Analytics Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Period info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Period: ${periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1)}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy')}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 14, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Requests: ${filteredBreakdown.length}`, 14, yPos);
    yPos += 15;

    // Maintenance Requests Table
    if (filteredBreakdown.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Maintenance Requests', 14, yPos);
      yPos += 8;

      const tableData = filteredBreakdown.map(item => [
        item.propertyTitle || 'N/A',
        item.unitLabel || 'N/A',
        item.reporterName || 'N/A',
        item.reporterEmail || 'N/A',
        item.status,
        format(new Date(item.createdAt), 'MMM dd, yyyy'),
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Property', 'Unit', 'Tenant Name', 'Email', 'Status', 'Created']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    }

    // Save PDF
    doc.save(`maintenance-analytics-${periodLabel}-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    toast.success('Report downloaded successfully');
  };

  if (loading && !analyticsData.thisMonth) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  // Get all properties for filter (even if no maintenance requests)
  const allProperties = allPropertiesWithUnits.map(prop => ({
    id: prop.id,
    title: prop.title,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 via-amber-50/30 to-yellow-50/50" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-100/20 to-amber-100/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-yellow-100/20 to-orange-100/20 rounded-full blur-3xl" />
        
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-600 shadow-lg flex-shrink-0"
                >
                  <BarChart3 className="h-7 w-7 text-white" />
                </motion.div>
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold text-gray-900">Maintenance Analytics</h1>
                  <p className="text-sm text-gray-600">Track maintenance requests, status trends, and tenant information</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="h-10 px-4 border-gray-300 hover:bg-gray-50"
                >
                  {refreshing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RotateCcw className="h-4 w-4 mr-2" />
                  )}
                  Refresh
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleDownloadReport}
                  className="h-10 px-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <Calendar className="h-3.5 w-3.5 text-orange-600" />
                  Maintenance Created
                </label>
                <Select 
                  value={timeFilter} 
                  onValueChange={(value) => setTimeFilter(value as TimeFilter)}
                >
                  <SelectTrigger className="w-full h-11 text-sm border-gray-300 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="THIS_MONTH">This Month</SelectItem>
                    <SelectItem value="THIS_YEAR">This Year</SelectItem>
                    <SelectItem value="ALL_TIME">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <Building2 className="h-3.5 w-3.5 text-orange-600" />
                  Property
                </label>
                <Select 
                  value={selectedPropertyId} 
                  onValueChange={setSelectedPropertyId}
                >
                  <SelectTrigger className="w-full h-11 text-sm border-gray-300 bg-white">
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Properties</SelectItem>
                    {allProperties.map(prop => (
                      <SelectItem key={prop.id} value={prop.id}>
                        {prop.title || 'Unknown Property'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards - Only show for THIS_MONTH */}
      {timeFilter === 'THIS_MONTH' && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-orange-500 flex items-center justify-center">
                  <Wrench className="h-3 w-3 text-white" />
                </div>
                Total Requests This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-bold text-orange-700">
                {thisMonthStats.total}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Excluding invalid and cancelled
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-gray-500 flex items-center justify-center">
                  <XCircle className="h-3 w-3 text-white" />
                </div>
                Invalid / Cancelled
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-bold text-gray-700">
                {thisMonthStats.invalidCancelled}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Invalid and cancelled requests
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Maintenance Requests Over Time Chart - Standalone */}
      <Card>
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>{chartTitle}</CardTitle>
            <CardDescription>
              Showing maintenance request count for {timeFilter === 'THIS_MONTH' ? 'this month' : timeFilter === 'THIS_YEAR' ? 'this year' : 'all time'}
              {(() => {
                const totalCount = maintenanceRequestsOverTimeData.reduce((sum, item) => sum + (item.count || 0), 0);
                return totalCount > 0 ? (
                  <span className="ml-1">
                    • Total: <span className="font-bold text-primary text-lg">{totalCount.toLocaleString()}</span>
                  </span>
                ) : (
                  <span className="ml-1">
                    • Total: <span className="font-bold text-muted-foreground text-lg">0</span>
                  </span>
                );
              })()}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={maintenanceChartConfig} className="aspect-auto h-[250px] w-full">
            <BarChart data={maintenanceRequestsOverTimeData}>
              <CartesianGrid vertical={false} stroke="hsl(var(--muted))" strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }}
                minTickGap={timeFilter === 'ALL_TIME' ? 90 : timeFilter === 'THIS_YEAR' ? 60 : 40}
                interval={0}
                tickFormatter={(value: string) => {
                  const date = new Date(value);
                  if (timeFilter === 'ALL_TIME') {
                    return date.getFullYear().toString();
                  } else if (timeFilter === 'THIS_YEAR') {
                    return date.toLocaleDateString('en-US', { month: 'short' });
                  } else {
                    // For month: show day numbers
                    const day = date.getDate();
                    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
                    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
                    
                    // Show: 1, 3, 6, 9, 12, 15, 18, 21, 24, 27, and last day
                    const showDays = [1, 3, 6, 9, 12, 15, 18, 21, 24, 27];
                    
                    if (showDays.includes(day)) {
                      return `${monthName} ${day}`;
                    } else if (day === daysInMonth && !showDays.includes(day)) {
                      return `${monthName} ${day}`;
                    }
                    return '';
                  }
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                allowDecimals={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => Math.round(value).toString()}
              />
              <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      const date = new Date(value);
                      if (timeFilter === 'ALL_TIME') {
                        return date.getFullYear().toString();
                      } else if (timeFilter === 'THIS_YEAR') {
                        return date.toLocaleDateString('en-US', { 
                          month: 'long',
                          year: 'numeric'
                        });
                      }
                      return date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });
                    }}
                    indicator="line"
                  />
                }
              />
              <Bar
                dataKey="count"
                fill="hsl(25, 95%, 53%)"
                radius={[4, 4, 0, 0]}
              />
              <ChartLegend content={<ChartLegendContent />} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Top Units and Users Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Units with Maintenance Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Top Units with Maintenance Requests</CardTitle>
            <CardDescription>
              Units with the most maintenance requests {periodLabel}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topUnits.length > 0 ? (
              <div className="space-y-3">
                {topUnits.map((unit, index) => (
                  <div key={`${unit.propertyTitle}-${unit.unitLabel}-${index}`} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-700 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{unit.unitLabel}</div>
                        <div className="text-xs text-gray-500">{unit.propertyTitle}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-orange-600">{unit.count}</div>
                      <div className="text-xs text-gray-500">request{unit.count !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-500">
                No maintenance requests found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Users with Maintenance Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Users with Most Maintenance Requests</CardTitle>
            <CardDescription>
              Users who submitted the most maintenance requests {periodLabel}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topUsers.length > 0 ? (
              <div className="space-y-3">
                {topUsers.map((user, index) => (
                  <div key={`${user.email}-${index}`} className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-amber-600">{user.count}</div>
                      <div className="text-xs text-gray-500">request{user.count !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-500">
                No maintenance requests found
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Requests</CardTitle>
          <CardDescription>
            Detailed list of maintenance requests with tenant information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredBreakdown.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Tenant Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBreakdown.map((item) => (
                    <TableRow key={item.requestId}>
                      <TableCell className="font-medium">{item.propertyTitle}</TableCell>
                      <TableCell>{item.unitLabel}</TableCell>
                      <TableCell>{item.reporterName}</TableCell>
                      <TableCell>{item.reporterEmail}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                      <TableCell>{format(new Date(item.createdAt), 'MMM dd, yyyy')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              No maintenance requests found for the selected filters
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceAnalytics;

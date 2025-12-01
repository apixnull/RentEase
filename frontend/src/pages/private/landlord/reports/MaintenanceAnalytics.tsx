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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell } from 'recharts';
import { 
  Loader2, 
  RefreshCcw, 
  Wrench,
  Sparkles,
  BarChart3,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  XCircle,
  Ban,
  Building2,
  Home,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { getMaintenanceAnalyticsRequest, type MaintenanceAnalyticsResponse } from '@/api/landlord/maintenanceAnalyticsApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const maintenanceChartConfig = {
  requests: {
    label: 'Maintenance Requests',
    color: 'hsl(25, 95%, 53%)', // Orange-500
  },
} satisfies ChartConfig;

const statusChartConfig = {
  open: { label: 'Open', color: 'hsl(217, 91%, 60%)' }, // Blue
  in_progress: { label: 'In Progress', color: 'hsl(45, 93%, 47%)' }, // Yellow/Amber
  resolved: { label: 'Resolved', color: 'hsl(142, 76%, 36%)' }, // Green
  cancelled: { label: 'Cancelled', color: 'hsl(0, 0%, 45%)' }, // Gray
  invalid: { label: 'Invalid', color: 'hsl(0, 84%, 60%)' }, // Red
} satisfies ChartConfig;

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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState<'month' | 'year' | 'all'>('month');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('ALL');

  const fetchAllAnalyticsData = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const currentMonth = format(now, 'yyyy-MM');
      
      const [thisMonthRes, thisYearRes, allTimeRes] = await Promise.all([
        getMaintenanceAnalyticsRequest({ period: 'THIS_MONTH' }),
        getMaintenanceAnalyticsRequest({ period: 'THIS_YEAR' }),
        getMaintenanceAnalyticsRequest({ 
          period: 'CUSTOM',
          startMonth: '2000-01',
          endMonth: currentMonth,
        }),
      ]);
      
      setAnalyticsData({
        thisMonth: thisMonthRes.data,
        thisYear: thisYearRes.data,
        allTime: allTimeRes.data,
      });
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
    if (timeFilter === 'month') return analyticsData.thisMonth;
    if (timeFilter === 'year') return analyticsData.thisYear;
    return analyticsData.allTime;
  }, [analyticsData, timeFilter]);

  // Process chart data based on time filter
  const processedChartData = useMemo(() => {
    const dailyRequests = currentData?.dailyMaintenanceRequests || [];
    if (!dailyRequests.length) return [];

    const now = new Date();

    if (timeFilter === 'month') {
      // Current month - group by day
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      const filtered = dailyRequests.filter((item: any) => {
        const dateStr = item.date;
        const [year, month] = dateStr.split('-').map(Number);
        return year === currentYear && month - 1 === currentMonth;
      });
      
      const dailyMap = new Map<string, number>();
      filtered.forEach((item: any) => {
        const dateStr = item.date;
        const current = dailyMap.get(dateStr) || 0;
        dailyMap.set(dateStr, current + (item.count || 0));
      });
      
      const dailyData: Array<{ date: string; count: number }> = [];
      const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
      
      for (let day = 1; day <= lastDay; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateKey = `${year}-${month}-${dayStr}`;
        
        dailyData.push({
          date: dateKey,
          count: dailyMap.get(dateKey) || 0,
        });
      }
      
      return dailyData;
    } else if (timeFilter === 'year') {
      // Current year - group by month
      const currentYear = now.getFullYear();
      const monthlyMap = new Map<string, number>();
      
      dailyRequests.forEach((item: any) => {
        const date = new Date(item.date);
        if (date.getFullYear() === currentYear) {
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
          const current = monthlyMap.get(monthKey) || 0;
          monthlyMap.set(monthKey, current + (item.count || 0));
        }
      });
      
      const monthlyData: Array<{ date: string; count: number }> = [];
      for (let month = 0; month < 12; month++) {
        const monthKey = `${currentYear}-${String(month + 1).padStart(2, '0')}-01`;
        monthlyData.push({
          date: monthKey,
          count: monthlyMap.get(monthKey) || 0,
        });
      }
      
      return monthlyData;
    } else {
      // All time - group by year
      const yearlyMap = new Map<string, number>();
      const currentYear = now.getFullYear();
      const startYear = currentYear - 4;
      
      dailyRequests.forEach((item: any) => {
        const date = new Date(item.date);
        const year = date.getFullYear();
        if (year >= startYear && year <= currentYear) {
          const yearKey = `${year}-01-01`;
          const current = yearlyMap.get(yearKey) || 0;
          yearlyMap.set(yearKey, current + (item.count || 0));
        }
      });
      
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
  }, [currentData, timeFilter]);

  // Status distribution data for pie chart
  const statusDistributionData = useMemo(() => {
    if (!currentData?.summary?.statusCounts) return [];
    
    const { statusCounts } = currentData.summary;
    return [
      { name: 'Open', value: statusCounts.open, color: 'hsl(217, 91%, 60%)' },
      { name: 'In Progress', value: statusCounts.in_progress, color: 'hsl(45, 93%, 47%)' },
      { name: 'Resolved', value: statusCounts.resolved, color: 'hsl(142, 76%, 36%)' },
      { name: 'Cancelled', value: statusCounts.cancelled, color: 'hsl(0, 0%, 45%)' },
      { name: 'Invalid', value: statusCounts.invalid, color: 'hsl(0, 84%, 60%)' },
    ].filter(item => item.value > 0);
  }, [currentData]);

  // Filtered maintenance breakdown
  const filteredBreakdown = useMemo(() => {
    if (!currentData?.maintenanceBreakdown) return [];
    
    let breakdown = currentData.maintenanceBreakdown;
    
    if (selectedPropertyId !== 'ALL') {
      breakdown = breakdown.filter(item => item.propertyId === selectedPropertyId);
    }
    
    return breakdown;
  }, [currentData, selectedPropertyId]);

  // Get period label
  const periodLabel = useMemo(() => {
    if (timeFilter === 'month') return 'this month';
    if (timeFilter === 'year') return 'this year';
    return 'all time';
  }, [timeFilter]);

  // Get chart title
  const chartTitle = useMemo(() => {
    if (timeFilter === 'month') return 'Daily Maintenance Requests';
    if (timeFilter === 'year') return 'Monthly Maintenance Requests';
    return 'Yearly Maintenance Requests';
  }, [timeFilter]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (timeFilter === 'month') {
        return format(date, 'MMM d');
      } else if (timeFilter === 'year') {
        return format(date, 'MMM yyyy');
      } else {
        return format(date, 'yyyy');
      }
    } catch {
      return dateStr;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      OPEN: { label: 'Open', variant: 'default' },
      IN_PROGRESS: { label: 'In Progress', variant: 'secondary' },
      RESOLVED: { label: 'Resolved', variant: 'outline' },
      CANCELLED: { label: 'Cancelled', variant: 'secondary' },
      INVALID: { label: 'Invalid', variant: 'destructive' },
    };
    
    const statusInfo = statusMap[status] || { label: status, variant: 'outline' as const };
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
    const summary = currentData.summary;
    doc.text(`Total Requests: ${summary.totalRequests}`, 14, yPos);
    yPos += 6;
    doc.text(`Open: ${summary.statusCounts.open}`, 14, yPos);
    yPos += 6;
    doc.text(`In Progress: ${summary.statusCounts.in_progress}`, 14, yPos);
    yPos += 6;
    doc.text(`Resolved: ${summary.statusCounts.resolved}`, 14, yPos);
    yPos += 6;
    doc.text(`Cancelled: ${summary.statusCounts.cancelled}`, 14, yPos);
    yPos += 6;
    doc.text(`Invalid: ${summary.statusCounts.invalid}`, 14, yPos);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Maintenance Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">Comprehensive insights into maintenance requests</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="shadow-sm border border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-5 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-24 mb-2" />
                <Skeleton className="h-3 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const summary = currentData?.summary || {
    totalRequests: 0,
    statusCounts: {
      open: 0,
      in_progress: 0,
      resolved: 0,
      cancelled: 0,
      invalid: 0,
    },
    totalProperties: 0,
    totalUnits: 0,
  };

  const propertiesList = currentData?.propertiesList || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Comprehensive insights into maintenance requests</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-10"
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
          </Button>
          <Button
            onClick={handleDownloadReport}
            className="h-10"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Wrench className="h-5 w-5 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary.totalRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">For {periodLabel}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <AlertCircle className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{summary.statusCounts.open}</div>
            <p className="text-xs text-muted-foreground mt-1">Pending resolution</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{summary.statusCounts.in_progress}</div>
            <p className="text-xs text-muted-foreground mt-1">Being worked on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{summary.statusCounts.resolved}</div>
            <p className="text-xs text-muted-foreground mt-1">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled/Invalid</CardTitle>
            <XCircle className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-600">
              {summary.statusCounts.cancelled + summary.statusCounts.invalid}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Cancelled or invalid</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={timeFilter} onValueChange={(value: 'month' | 'year' | 'all') => setTimeFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by property" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Properties</SelectItem>
            {propertiesList.map(property => (
              <SelectItem key={property.id} value={property.id}>
                {property.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Maintenance Requests Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{chartTitle}</CardTitle>
            <CardDescription>
              Showing maintenance requests for {periodLabel}. Total: <span className="font-bold text-primary text-lg">{summary.totalRequests}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={maintenanceChartConfig} className="aspect-auto h-[300px] w-full">
              <BarChart data={processedChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={formatDate}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(25, 95%, 53%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>
              Breakdown of maintenance request statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {statusDistributionData.length > 0 ? (
              <ChartContainer config={statusChartConfig} className="aspect-auto h-[300px] w-full">
                <PieChart>
                  <Pie
                    data={statusDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No data available
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


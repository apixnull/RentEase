import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
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
  RefreshCcw, 
  AlertTriangle,
  Sparkles,
  BarChart3,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { getFraudReportsAnalyticsRequest } from '@/api/admin/reportAnalyticsApi';

const reportsChartConfig = {
  reports: {
    label: 'Reports Created',
    color: 'hsl(0, 84%, 60%)', // Red-500
  },
} satisfies ChartConfig;

const FraudReportAnalytics = () => {
  const [reportsData, setReportsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const now = new Date();
  const [timeFilter, setTimeFilter] = useState<'month' | 'year' | 'all'>('month');

  // Fetch reports analytics when filter changes
  useEffect(() => {
    const controller = new AbortController();
    const fetchAnalytics = async ({ silent = false } = {}) => {
      try {
        if (!silent) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
        const params: any = {};
        if (timeFilter === 'month') {
          params.month = now.getMonth() + 1;
          params.year = now.getFullYear();
        } else if (timeFilter === 'year') {
          params.year = now.getFullYear();
        } else if (timeFilter === 'all') {
          params.period = 'all_time';
        }
        
        const analytics = await getFraudReportsAnalyticsRequest(params);
        setReportsData(analytics.data);
      } catch (error: any) {
        if (error?.name === 'CanceledError') return;
        console.error('Error fetching reports analytics:', error);
        toast.error(error?.response?.data?.message || error?.response?.data?.error || 'Failed to load analytics');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
    
    fetchAnalytics();
    return () => controller.abort();
  }, [timeFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    const fetchAnalytics = async () => {
      try {
        const params: any = {};
        if (timeFilter === 'month') {
          params.month = now.getMonth() + 1;
          params.year = now.getFullYear();
        } else if (timeFilter === 'year') {
          params.year = now.getFullYear();
        } else if (timeFilter === 'all') {
          params.period = 'all_time';
        }
        const analytics = await getFraudReportsAnalyticsRequest(params);
        setReportsData(analytics.data);
      } catch (error: any) {
        if (error?.name === 'CanceledError') return;
        console.error('Error refreshing data:', error);
        toast.error(error?.response?.data?.message || error?.response?.data?.error || 'Failed to refresh data');
      } finally {
        setRefreshing(false);
      }
    };
    fetchAnalytics();
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    if (reportsData) {
      return {
        totalReports: reportsData.totalFraudReports || 0,
      };
    }
    return {
      totalReports: 0,
    };
  }, [reportsData]);

  // Process reports data based on filter
  // Backend already returns filtered dailyFraudReports, but we need to aggregate for year/all time views
  const processedReportsData = useMemo(() => {
    const dailyReports = reportsData?.dailyFraudReports || [];
    if (!dailyReports.length) return [];

    if (timeFilter === 'month') {
      // Current month - filter and normalize dates to avoid timezone issues
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      // Filter to only current month - normalize dates to avoid timezone issues
      const filtered = dailyReports.filter((item: any) => {
        const dateStr = item.date; // YYYY-MM-DD format
        const [year, month] = dateStr.split('-').map(Number);
        // Create date in local timezone
        const itemYear = year;
        const itemMonth = month - 1; // JavaScript months are 0-indexed
        
        // Only include if it's in the current month and year
        return itemYear === currentYear && itemMonth === currentMonth;
      });
      
      // Group by day using the date string directly (YYYY-MM-DD format)
      const dailyMap = new Map<string, number>();
      filtered.forEach((item: any) => {
        const dateStr = item.date; // Already in YYYY-MM-DD format
        const current = dailyMap.get(dateStr) || 0;
        dailyMap.set(dateStr, current + (item.count || 0));
      });
      
      // Fill in missing days with 0 - use local date formatting to avoid timezone issues
      const dailyData: Array<{ date: string; count: number }> = [];
      const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
      
      for (let day = 1; day <= lastDay; day++) {
        const date = new Date(currentYear, currentMonth, day);
        // Format as YYYY-MM-DD using local date
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
      
      // Group by month
      const monthlyMap = new Map<string, number>();
      dailyReports.forEach((item: any) => {
        const date = new Date(item.date);
        if (date.getFullYear() === currentYear) {
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
          const current = monthlyMap.get(monthKey) || 0;
          monthlyMap.set(monthKey, current + (item.count || 0));
        }
      });
      
      // Fill in missing months with 0
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
      dailyReports.forEach((item: any) => {
        const date = new Date(item.date);
        const year = date.getFullYear();
        const yearKey = `${year}-01-01`;
        const current = yearlyMap.get(yearKey) || 0;
        yearlyMap.set(yearKey, current + (item.count || 0));
      });
      
      // Show from current year - 4 to current year (5 years total including current year)
      const currentYear = now.getFullYear();
      const startYear = currentYear - 4;
      
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
  }, [reportsData?.dailyFraudReports, timeFilter]);

  // Calculate total reports created in period
  const totalReportsCreated = useMemo(() => {
    return processedReportsData.reduce((sum: number, day: any) => sum + day.count, 0);
  }, [processedReportsData]);

  // Get period label based on filter
  const periodLabel = useMemo(() => {
    if (timeFilter === 'month') return 'this month';
    if (timeFilter === 'year') return 'this year';
    return 'all time';
  }, [timeFilter]);

  // Get chart title based on filter
  const reportsChartTitle = useMemo(() => {
    if (timeFilter === 'month') return 'Daily Reports';
    if (timeFilter === 'year') return 'Monthly Reports';
    return 'Yearly Reports';
  }, [timeFilter]);

  // Download report function
  const handleDownloadReport = () => {
    // Create PDF in landscape orientation for better table display
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = margin;
    
    // RentEase Branding Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129); // emerald-500 color (RentEase brand)
    doc.text('RentEase', pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Property Management Platform', pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    
    // Divider line
    doc.setDrawColor(200, 200, 200);
    doc.line(14, yPos, pageWidth - 14, yPos);
    yPos += 10;
    
    // Report Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Fraud Reports Analytics Report', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    
    // Report period and generated date
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Period: ${periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1)}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;
    
    // Summary Metrics Section
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Summary Metrics (${periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1)})`, margin, yPos);
    yPos += 8;
    
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Reports', metrics.totalReports.toString()],
      [`Reports Created (${periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1)})`, totalReportsCreated.toString()],
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [summaryData[0]],
      body: summaryData.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10 },
      margin: { left: margin, right: margin },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (yPos > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      yPos = margin;
    }
    
    // Reports Created Data Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(reportsChartTitle, margin, yPos);
    yPos += 8;
    
    const reportsTableData = processedReportsData.map((item: any) => {
      const date = new Date(item.date);
      let dateLabel = '';
      if (timeFilter === 'all') {
        dateLabel = date.getFullYear().toString();
      } else if (timeFilter === 'year') {
        dateLabel = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      } else {
        dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return [dateLabel, (item.count || 0).toString()];
    });
    
    const reportsTotal = totalReportsCreated;
    
    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Count']],
      body: reportsTableData,
      foot: [['Total', reportsTotal.toString()]],
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      footStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9 },
      margin: { left: margin, right: margin },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (yPos > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      yPos = margin;
    }
    
    // Fraud Reports Breakdown Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Fraud Reports Breakdown', margin, yPos);
    yPos += 8;
    
    if (filteredReports.length > 0) {
      const breakdownData = filteredReports.slice(0, 50).map((report: any) => {
        const dateStr = report.createdAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        
        return [
          report.id.substring(0, 8) + '...',
          dateStr,
          report.propertyTitle || 'N/A',
          report.reporterName || 'N/A',
          report.reason.replace(/_/g, ' '),
        ];
      });
      
      // Calculate available width (landscape A4 is 297mm wide, minus margins)
      const availableWidth = pageWidth - 28; // 14mm left + 14mm right margin
      
      autoTable(doc, {
        startY: yPos,
        head: [['Report ID', 'Report Date', 'Property', 'Reporter', 'Reason']],
        body: breakdownData,
        theme: 'striped',
        headStyles: { 
          fillColor: [16, 185, 129], 
          textColor: 255, 
          fontStyle: 'bold',
          fontSize: 9,
        },
        bodyStyles: { fontSize: 8 },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        columnStyles: {
          0: { cellWidth: 35, halign: 'left' },
          1: { cellWidth: 45 },
          2: { cellWidth: 60 },
          3: { cellWidth: 50 },
          4: { cellWidth: 50 },
        },
        margin: { left: margin, right: margin },
        styles: { 
          overflow: 'linebreak', 
          cellPadding: 2,
          fontSize: 8,
          lineWidth: 0.1,
        },
        tableWidth: availableWidth,
        showHead: 'everyPage',
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 10;
      
      if (filteredReports.length > 50) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text(`Showing first 50 of ${filteredReports.length} reports`, margin, yPos);
        yPos += 10;
      }
    } else {
      doc.setFontSize(11);
      doc.text('No reports found for the selected period.', margin, yPos);
      yPos += 10;
    }
    
    // Add footer with RentEase credit on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer line
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setDrawColor(200, 200, 200);
      doc.line(14, pageHeight - 20, pageWidth - 14, pageHeight - 20);
      
      // RentEase branding
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129); // emerald-500
      doc.text(
        'RentEase',
        pageWidth / 2,
        pageHeight - 12,
        { align: 'center' }
      );
      
      // Generated by text
      doc.setFontSize(7);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text(
        'Generated by RentEase - Property Management Platform',
        pageWidth / 2,
        pageHeight - 6,
        { align: 'center' }
      );
      doc.setTextColor(0, 0, 0);
    }
    
    // Save PDF
    const fileName = `fraud-reports-analytics-report-${periodLabel.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    toast.success('PDF report downloaded successfully');
  };

  // Prepare filtered reports for breakdown table
  const filteredReports = useMemo(() => {
    if (!reportsData?.reports) return [];
    
    // The reports are already filtered by the backend based on timeFilter
    // Just format and sort them
    return reportsData.reports
      .map((report: any) => ({
        id: report.id,
        listingId: report.listingId,
        reason: report.reason,
        createdAt: new Date(report.createdAt),
        propertyTitle: report.propertyTitle,
        reporterName: report.reporterName,
        reporterEmail: report.reporterEmail,
      }))
      .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by newest first
  }, [reportsData]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-200/80 via-indigo-200/75 to-blue-200/70 opacity-95" />
        <div className="relative m-[1px] rounded-[16px] bg-white/85 backdrop-blur-lg border border-white/60 shadow-lg">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-12 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-purple-300/50 to-indigo-400/40 blur-3xl"
            initial={{ opacity: 0.4, scale: 0.85 }}
            animate={{ opacity: 0.7, scale: 1.05 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-tl from-blue-200/40 to-indigo-200/35 blur-3xl"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 3.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          />

          <div className="px-4 sm:px-6 py-5 space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <motion.div whileHover={{ scale: 1.05 }} className="relative flex-shrink-0">
                  <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white grid place-items-center shadow-xl shadow-indigo-500/30">
                    <AlertTriangle className="h-5 w-5 relative z-10" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                  </div>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 220 }}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white text-purple-600 border border-purple-100 shadow-sm grid place-items-center"
                  >
                    <Sparkles className="h-3 w-3" />
                  </motion.div>
                </motion.div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 truncate">
                      Fraud Reports Analytics
                    </h1>
                  </div>
                  <p className="text-sm text-slate-600 leading-6 flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-indigo-500" />
                    Comprehensive fraud reports insights and analytics
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select 
                  value={timeFilter} 
                  onValueChange={(value: 'month' | 'year' | 'all') => setTimeFilter(value)}
                >
                  <SelectTrigger className="w-[140px] rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="month" className="rounded-lg">
                      This Month
                    </SelectItem>
                    <SelectItem value="year" className="rounded-lg">
                      This Year
                    </SelectItem>
                    <SelectItem value="all" className="rounded-lg">
                      All Time
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleDownloadReport}
                  className="h-11 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-5 text-sm font-semibold text-white shadow-md shadow-teal-500/30 hover:brightness-110"
                >
                  <span className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download Report
                  </span>
                </Button>
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
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
              style={{ originX: 0 }}
              className="relative h-1 w-full rounded-full overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/80 via-indigo-400/80 to-blue-400/80" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
        <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Total Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{metrics.totalReports}</div>
            <p className="text-xs text-red-600 mt-1">All fraud reports</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Created Chart */}
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>{reportsChartTitle}</CardTitle>
            <CardDescription>
              Showing new reports created for {periodLabel}. Total: <span className="font-bold text-primary text-lg">{totalReportsCreated}</span>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={reportsChartConfig} className="aspect-auto h-[300px] w-full">
            <BarChart data={processedReportsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={0}
                tickFormatter={(value: string) => {
                  const date = new Date(value);
                  if (timeFilter === 'all') {
                    return date.getFullYear().toString();
                  } else if (timeFilter === 'year') {
                    return date.toLocaleDateString('en-US', { month: 'short' });
                  } else {
                    // Month view - show day with month name
                    const day = date.getDate();
                    const month = date.toLocaleDateString('en-US', { month: 'short' });
                    // Show specific days: 1, 3, 6, 9, 12, 15, 18, 21, 24, 27, and last day
                    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
                    const showDays = [1, 3, 6, 9, 12, 15, 18, 21, 24, 27];
                    if (day === lastDay && !showDays.includes(day)) {
                      showDays.push(lastDay);
                    }
                    if (showDays.includes(day)) {
                      return `${month} ${day}`;
                    }
                    return '';
                  }
                }}
                style={{
                  fontSize: '12px',
                  fill: 'hsl(var(--foreground))',
                  fontWeight: 500,
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
                      if (timeFilter === 'all') {
                        return date.getFullYear().toString();
                      } else if (timeFilter === 'year') {
                        return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                      } else {
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                      }
                    }}
                    indicator="line"
                  />
                }
              />
              <Bar
                dataKey="count"
                fill="var(--color-reports)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Reports Breakdown Table */}
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Fraud Reports Breakdown</CardTitle>
            <CardDescription>
              Detailed breakdown of all fraud reports for {periodLabel}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          {filteredReports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reports found for {periodLabel}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Report ID</TableHead>
                  <TableHead>Report Date</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report: any) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-mono text-xs">
                      {report.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {report.createdAt.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell className="font-medium">
                      {report.propertyTitle}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{report.reporterName}</span>
                        <span className="text-xs text-muted-foreground">{report.reporterEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{report.reason.replace(/_/g, ' ')}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {filteredReports.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} for {periodLabel}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FraudReportAnalytics;


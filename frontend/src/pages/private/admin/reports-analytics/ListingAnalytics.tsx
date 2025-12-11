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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from 'recharts';
import { 
  Loader2, 
  RefreshCcw, 
  FileText,
  Sparkles,
  BarChart3,
  Home,
  Download,
  Clock,
  AlertTriangle,
  Ban,
  DollarSign,
  Star,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { getListingAnalyticsRequest } from '@/api/admin/reportAnalyticsApi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
 
const listingsChartConfig = {
  listings: {
    label: 'Listings Created',
    color: 'hsl(199, 89%, 48%)', // Blue-600
  },
} satisfies ChartConfig;

const comparisonChartConfig = {
  featured: {
    label: 'Featured',
    color: 'hsl(45, 93%, 47%)', // Yellow-600
  },
  standard: {
    label: 'Standard',
    color: 'hsl(221, 83%, 53%)', // Blue-600
  },
} satisfies ChartConfig;

const ListingAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [allTimeAnalyticsData, setAllTimeAnalyticsData] = useState<any>(null);
  const [listingsData, setListingsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const now = new Date();
  const [timeFilter, setTimeFilter] = useState<'month' | 'year' | 'all'>('month');

  // Fetch all-time analytics once on mount for Total Listings card
  useEffect(() => {
    const controller = new AbortController();
    const fetchInitialData = async () => {
      try {
        // Fetch all-time analytics for Total Listings card
        const allTimeAnalytics = await getListingAnalyticsRequest({ period: 'all_time', signal: controller.signal });
        setAllTimeAnalyticsData(allTimeAnalytics.data);
      } catch (error: any) {
        if (error?.name === 'CanceledError') return;
        console.error('Error fetching initial data:', error);
        toast.error(error?.response?.data?.message || error?.response?.data?.error || 'Failed to load data');
      }
    };
    
    fetchInitialData();
    return () => controller.abort();
  }, []);


  // Fetch analytics and listings when filter changes
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
          // Current month
          params.month = now.getMonth() + 1;
          params.year = now.getFullYear();
        } else if (timeFilter === 'year') {
          // Current year
          params.year = now.getFullYear();
        } else if (timeFilter === 'all') {
          // All time
          params.period = 'all_time';
        }
        
        // Fetch listings data with the filter
        const listings = await getListingAnalyticsRequest(params);
        
        setListingsData(listings.data);
        setAnalyticsData(listings.data); // Use same data for dailyListings
      } catch (error: any) {
        if (error?.name === 'CanceledError') return;
        console.error('Error fetching analytics:', error);
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
        // Fetch listings data with the filter
        const listings = await getListingAnalyticsRequest(params);
        
        setListingsData(listings.data);
        setAnalyticsData(listings.data); // Use same data for dailyListings
        
        // Also refresh all-time data for Total Listings card
        const allTimeAnalytics = await getListingAnalyticsRequest({ period: 'all_time' });
        setAllTimeAnalyticsData(allTimeAnalytics.data);
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
    // Use metrics from API if available
    if (listingsData?.metrics) {
      // Calculate total listings from all-time data
      const allTimeDailyListings = allTimeAnalyticsData?.dailyListings || [];
      const totalListingsAllTime = allTimeDailyListings.reduce((sum: number, item: any) => sum + (item.count || 0), 0);

      return {
        ...listingsData.metrics,
        totalListingsAllTime,
      };
    }

    // Fallback to empty metrics
    return {
      totalListings: 0,
      totalListingsAllTime: 0,
      waitingReview: 0,
      visible: 0,
      hidden: 0,
      activeListings: 0,
      expired: 0,
      flagged: 0,
      blocked: 0,
      totalEarnings: 0,
      featuredListings: 0,
      standardListings: 0,
      landlordsWithFeatured: 0,
      landlordsWithStandard: 0,
    };
  }, [listingsData, allTimeAnalyticsData]);

  // Process listings data based on filter
  const processedListingsData = useMemo(() => {
    const dailyListings = analyticsData?.dailyListings || [];
    if (!dailyListings.length) return [];

    if (timeFilter === 'month') {
      // Current month - group by day
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      // Filter to only current month - normalize dates to avoid timezone issues
      const filtered = dailyListings.filter((item: any) => {
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
      const start = new Date(currentYear, 0, 1);
      const end = new Date(currentYear, 11, 31, 23, 59, 59, 999);
      
      // Filter to only current year
      const filtered = dailyListings.filter((item: any) => {
        const date = new Date(item.date);
        return date >= start && date <= end && date.getFullYear() === currentYear;
      });
      
      // Group by month
      const monthlyMap = new Map<string, number>();
      filtered.forEach((item: any) => {
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
        const current = monthlyMap.get(monthKey) || 0;
        monthlyMap.set(monthKey, current + (item.count || 0));
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
      dailyListings.forEach((item: any) => {
        const date = new Date(item.date);
        const year = date.getFullYear();
        const yearKey = `${year}-01-01`;
        const current = yearlyMap.get(yearKey) || 0;
        yearlyMap.set(yearKey, current + (item.count || 0));
      });
      
      // Show last 5 years including current year (e.g., 2021-2025 if current year is 2025)
      const currentYear = now.getFullYear();
      const startYear = currentYear - 4; // 5 years total: currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear
      
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
  }, [analyticsData, timeFilter]);

  // Calculate total listings created in period
  const totalListingsCreated = useMemo(() => {
    return processedListingsData.reduce((sum, day) => sum + day.count, 0);
  }, [processedListingsData]);

  // Prepare featured vs standard comparison data
  // Featured: paymentAmount = 150 AND isFeatured = true
  // Standard: paymentAmount = 100 AND isFeatured = false
  // Prepare filtered listings for breakdown table
  const filteredListings = useMemo(() => {
    if (!listingsData?.listings) return [];
    
    // The listings are already filtered by the backend based on timeFilter
    // Just format and sort them
    return listingsData.listings
      .map((listing: any) => {
        const paymentAmount = listing.paymentAmount || 0;
        const isFeatured = listing.isFeatured && paymentAmount === 150;
        const isStandard = !listing.isFeatured && paymentAmount === 100;
        
        return {
          id: listing.id,
          paymentAmount,
          createdAt: new Date(listing.createdAt),
          status: listing.status,
          type: isFeatured ? 'Featured' : isStandard ? 'Standard' : 'Unknown',
          isFeatured,
          isStandard,
          unitLabel: listing.unitLabel,
          propertyTitle: listing.propertyTitle,
          ownerName: listing.ownerName,
          ownerEmail: listing.ownerEmail,
        };
      })
      .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by newest first
  }, [listingsData]);

  // Calculate featured and standard metrics for current filter
  const featuredMetrics = useMemo(() => {
    const featured = filteredListings.filter((l: any) => l.isFeatured);
    const count = featured.length;
    const earnings = featured.reduce((sum: number, l: any) => sum + (l.paymentAmount || 0), 0);
    return { count, earnings };
  }, [filteredListings]);

  const standardMetrics = useMemo(() => {
    const standard = filteredListings.filter((l: any) => l.isStandard);
    const count = standard.length;
    const earnings = standard.reduce((sum: number, l: any) => sum + (l.paymentAmount || 0), 0);
    return { count, earnings };
  }, [filteredListings]);

  // Prepare comparison chart data
  const comparisonChartData = useMemo(() => {
    return [
      {
        name: 'Featured',
        count: featuredMetrics.count,
        earnings: featuredMetrics.earnings,
      },
      {
        name: 'Standard',
        count: standardMetrics.count,
        earnings: standardMetrics.earnings,
      },
    ];
  }, [featuredMetrics, standardMetrics]);

  // Get period label based on filter
  const periodLabel = useMemo(() => {
    if (timeFilter === 'month') return 'this month';
    if (timeFilter === 'year') return 'this year';
    return 'all time';
  }, [timeFilter]);

  // Get chart title based on filter
  const listingsChartTitle = useMemo(() => {
    if (timeFilter === 'month') return 'Daily Listings';
    if (timeFilter === 'year') return 'Monthly Listings';
    return 'Yearly Listings';
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
    doc.text('Listing & Advertisement Analytics Report', pageWidth / 2, yPos, { align: 'center' });
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
    yPos += 8;
    
    // Total Earnings - Simple and Formal
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Total Earnings', pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    const earningsText = `PHP ${metrics.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    doc.text(earningsText, pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;
    
    // Summary Metrics Section
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Metrics', margin, yPos);
    yPos += 5;
    
    const periodLabelFormatted = `(${periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1)})`;
    
    const summaryData = [
      ['Metric', 'Value'],
      [`Total Listings ${periodLabelFormatted}`, metrics.totalListings.toString()],
      [`Waiting Review ${periodLabelFormatted}`, metrics.waitingReview.toString()],
      [`Active Listings ${periodLabelFormatted}`, metrics.activeListings.toString()],
      [`Expired ${periodLabelFormatted}`, metrics.expired.toString()],
      [`Flagged ${periodLabelFormatted}`, metrics.flagged.toString()],
      [`Blocked ${periodLabelFormatted}`, metrics.blocked.toString()],
      [`Featured Listings ${periodLabelFormatted}`, featuredMetrics.count.toString()],
      [`Featured Earnings ${periodLabelFormatted}`, `PHP ${featuredMetrics.earnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      [`Standard Listings ${periodLabelFormatted}`, standardMetrics.count.toString()],
      [`Standard Earnings ${periodLabelFormatted}`, `PHP ${standardMetrics.earnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [summaryData[0]],
      body: summaryData.slice(1),
      theme: 'plain',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold', lineWidth: 0, lineColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { lineWidth: 0, lineColor: [255, 255, 255], fontSize: 8 },
      styles: { fontSize: 8, lineWidth: 0, lineColor: [255, 255, 255], cellPadding: 2 },
      margin: { left: margin, right: margin },
      tableLineWidth: 0,
      tableLineColor: [255, 255, 255],
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 10;
    
    // Check if we need a new page
    if (yPos > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      yPos = margin;
    }
    
    // Listings Created Data Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(listingsChartTitle, margin, yPos);
    yPos += 8;
    
    const listingsTableData = processedListingsData.map((item: any) => {
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
    
    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Count']],
      body: listingsTableData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9 },
      margin: { left: margin, right: margin },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (yPos > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      yPos = margin;
    }
    
    // Listing Transactions Breakdown Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Listing Transactions Breakdown', margin, yPos);
    yPos += 8;
    
    if (filteredListings.length > 0) {
      const breakdownData = filteredListings.map((listing: any) => {
        const dateStr = listing.createdAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        
        const propertyAndUnit = `${listing.propertyTitle || 'N/A'} - ${listing.unitLabel || 'N/A'}`;
        const owner = `${listing.ownerName || 'N/A'}\n${listing.ownerEmail || 'N/A'}`;
        
        return [
          listing.id.substring(0, 8) + '...',
          dateStr,
          propertyAndUnit,
          owner,
          `PHP ${listing.paymentAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          listing.type,
          listing.status.replace(/_/g, ' '),
        ];
      });
      
      // Calculate available width (landscape A4 is 297mm wide, minus margins)
      const availableWidth = pageWidth - 28; // 14mm left + 14mm right margin
      
      autoTable(doc, {
        startY: yPos,
        head: [['Listing ID', 'Payment Date', 'Property & Unit', 'Owner', 'Payment Amount', 'Type', 'Status']],
        body: breakdownData,
        theme: 'striped',
        headStyles: { 
          fillColor: [16, 185, 129], 
          textColor: 255, 
          fontStyle: 'bold',
          fontSize: 7,
        },
        bodyStyles: { fontSize: 6 },
        alternateRowStyles: { fillColor: [249, 250, 251] },
        columnStyles: {
          0: { cellWidth: 28, halign: 'left' },
          1: { cellWidth: 42 },
          2: { cellWidth: 50 },
          3: { cellWidth: 50 },
          4: { cellWidth: 32, halign: 'right' },
          5: { cellWidth: 28, halign: 'center' },
          6: { cellWidth: 30, halign: 'center' },
        },
        margin: { left: margin, right: margin },
        styles: { 
          overflow: 'linebreak', 
          cellPadding: 1.5,
          fontSize: 6,
          lineWidth: 0.1,
        },
        tableWidth: availableWidth,
        showHead: 'everyPage',
      });
      
      yPos = (doc as any).lastAutoTable.finalY + 10;
      
      // Add summary text
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Total Transactions: ${filteredListings.length}`, margin, yPos);
    } else {
      doc.setFontSize(11);
      doc.text('No transactions found for the selected period.', margin, yPos);
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
    const fileName = `listing-analytics-report-${periodLabel.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    toast.success('PDF report downloaded successfully');
  };

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
                    <Home className="h-5 w-5 relative z-10" />
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
                      Listing Analytics
                    </h1>
                  </div>
                  <p className="text-sm text-slate-600 leading-6 flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-indigo-500" />
                    Comprehensive listing insights and performance metrics
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total Listings</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{metrics.totalListings}</div>
            <p className="text-xs text-blue-600 mt-1">For {periodLabel}</p>
            <div className="mt-3 space-y-1.5 pt-3 border-t border-blue-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-700">Waiting Review:</span>
                <span className="font-semibold text-blue-900">{metrics.waitingReview}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-700">Active:</span>
                <span className="font-semibold text-blue-900">{metrics.activeListings}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-700">Expired:</span>
                <span className="font-semibold text-blue-900">{metrics.expired}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-700">Flagged:</span>
                <span className="font-semibold text-blue-900">{metrics.flagged}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-blue-700">Blocked:</span>
                <span className="font-semibold text-blue-900">{metrics.blocked}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">PHP {metrics.totalEarnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <p className="text-xs text-emerald-600 mt-1">For {periodLabel}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Featured</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{featuredMetrics.count}</div>
            <p className="text-xs text-yellow-600 mt-1">Listings for {periodLabel}</p>
            <p className="text-xs text-yellow-700 mt-2 font-semibold">
              Earnings: PHP {featuredMetrics.earnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-700">Standard</CardTitle>
            <FileText className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-900">{standardMetrics.count}</div>
            <p className="text-xs text-indigo-600 mt-1">Listings for {periodLabel}</p>
            <p className="text-xs text-indigo-700 mt-2 font-semibold">
              Earnings: PHP {standardMetrics.earnings.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Listings Created Chart */}
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>{listingsChartTitle}</CardTitle>
            <CardDescription>
              Showing new listings created for {periodLabel}. Total: <span className="font-bold text-primary text-lg">{totalListingsCreated}</span>
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={listingsChartConfig} className="aspect-auto h-[300px] w-full">
            <BarChart data={processedListingsData}>
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
                style={{
                  fontSize: '12px',
                  fill: 'hsl(var(--muted-foreground))',
                }}
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
                fill="var(--color-listings)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Featured vs Standard Comparison Chart */}
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Featured vs Standard Comparison</CardTitle>
            <CardDescription>
              Comparison of featured and standard listings for {periodLabel}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={comparisonChartConfig} className="aspect-auto h-[350px] w-full">
            <BarChart data={comparisonChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
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
                tickFormatter={(value) => {
                  if (value >= 1000000) return `₱${(value / 1000000).toFixed(0)}M`;
                  if (value >= 1000) return `₱${(value / 1000).toFixed(0)}K`;
                  return `₱${value}`;
                }}
                style={{
                  fontSize: '12px',
                  fill: 'hsl(var(--muted-foreground))',
                }}
              />
              <ChartTooltip
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid gap-2">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Count:</span>
                            <span className="font-medium">{data.count}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-muted-foreground">Earnings:</span>
                            <span className="font-medium">
                              PHP {Number(data.earnings).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="earnings"
                radius={[8, 8, 0, 0]}
              >
                {comparisonChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.name === 'Featured'
                        ? 'hsl(45, 93%, 47%)'
                        : 'hsl(221, 83%, 53%)'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>

          {/* Summary Stats */}
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-700">Featured Listings</p>
                  <p className="text-2xl font-bold text-yellow-900">{featuredMetrics.count}</p>
                  <p className="text-xs text-yellow-600 mt-1">
                    PHP {featuredMetrics.earnings.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Standard Listings</p>
                  <p className="text-2xl font-bold text-blue-900">{standardMetrics.count}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    PHP {standardMetrics.earnings.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Listing Transactions Breakdown */}
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Listing Transactions Breakdown</CardTitle>
            <CardDescription>
              Detailed breakdown of all listing transactions and payments for {periodLabel}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          {filteredListings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No listing transactions found for {periodLabel}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[70px]">Listing ID</TableHead>
                  <TableHead className="w-[130px]">Payment Date</TableHead>
                  <TableHead className="w-[150px]">Property & Unit</TableHead>
                  <TableHead className="w-[150px]">Owner</TableHead>
                  <TableHead className="w-[110px] text-right">Payment Amount</TableHead>
                  <TableHead className="w-[90px]">Type</TableHead>
                  <TableHead className="w-[110px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredListings.map((listing: any) => (
                  <TableRow key={listing.id}>
                    <TableCell className="font-mono text-xs">
                      {listing.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="text-xs">
                      {listing.createdAt.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex flex-col">
                        <span className="font-medium">{listing.propertyTitle}</span>
                        <span className="text-xs text-muted-foreground">{listing.unitLabel}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex flex-col">
                        <span className="font-medium">{listing.ownerName}</span>
                        <span className="text-xs text-muted-foreground">{listing.ownerEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-sm">
                      PHP {listing.paymentAmount.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                          listing.type === 'Featured'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : listing.type === 'Standard'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}
                      >
                        {listing.type === 'Featured' && <Star className="h-3 w-3" />}
                        {listing.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                          listing.status === 'VISIBLE'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : listing.status === 'WAITING_REVIEW'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : listing.status === 'HIDDEN'
                            ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                            : listing.status === 'EXPIRED'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
                            : listing.status === 'FLAGGED'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : listing.status === 'BLOCKED'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                        }`}
                      >
                        {listing.status === 'WAITING_REVIEW' && <Clock className="h-3 w-3" />}
                        {listing.status === 'VISIBLE' && <TrendingUp className="h-3 w-3" />}
                        {listing.status === 'FLAGGED' && <AlertTriangle className="h-3 w-3" />}
                        {listing.status === 'BLOCKED' && <Ban className="h-3 w-3" />}
                        {listing.status.replace(/_/g, ' ')}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {filteredListings.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredListings.length} transaction{filteredListings.length !== 1 ? 's' : ''} for {periodLabel}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ListingAnalytics;


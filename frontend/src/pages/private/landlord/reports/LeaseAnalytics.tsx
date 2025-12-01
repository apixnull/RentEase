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
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import {
  DollarSign,
  RotateCcw,
  Loader2,
  Building2,
  Home,
  Calendar,
  FileText,
  Download,
} from 'lucide-react';
import { getLeaseAnalyticsRequest, type LeaseAnalyticsResponse } from '@/api/landlord/leaseAnalyticsApi';
import { getPropertiesWithUnitsRequest } from '@/api/landlord/financialApi';

type FilterType = 'ALL' | 'PROPERTY' | 'UNIT';
type DateRangePreset = 'THIS_MONTH' | 'THIS_YEAR' | 'ALL_TIME';

const LeaseAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<{
    thisMonth: LeaseAnalyticsResponse | null;
    thisYear: LeaseAnalyticsResponse | null;
    allTime: LeaseAnalyticsResponse | null;
  }>({
    thisMonth: null,
    thisYear: null,
    allTime: null,
  });
  const [filterType, setFilterType] = useState<FilterType>('ALL');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>('THIS_MONTH');
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  
  // PDF filter states (separate from main filters)
  const [pdfFilterType, setPdfFilterType] = useState<FilterType>('ALL');
  const [pdfSelectedPropertyId, setPdfSelectedPropertyId] = useState<string>('');
  const [pdfSelectedUnitId, setPdfSelectedUnitId] = useState<string>('');
  const [pdfDateRangePreset, setPdfDateRangePreset] = useState<DateRangePreset>('THIS_MONTH');
  const [allPropertiesWithUnits, setAllPropertiesWithUnits] = useState<Array<{
    id: string;
    title: string;
    Unit: Array<{
      id: string;
      label: string;
    }>;
  }>>([]);

  const fetchAllAnalyticsData = async () => {
    try {
      setLoading(true);
      // For "all time", use a custom date range from 2000-01 to current month
      const now = new Date();
      const currentMonth = format(now, 'yyyy-MM');
      
      const [thisMonthRes, thisYearRes, allTimeRes] = await Promise.all([
        getLeaseAnalyticsRequest({ period: 'THIS_MONTH' }),
        getLeaseAnalyticsRequest({ period: 'THIS_YEAR' }),
        getLeaseAnalyticsRequest({ 
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
      console.error('Failed to fetch lease analytics:', error);
      toast.error(error?.response?.data?.error || 'Failed to load lease analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllAnalyticsData();
    // Fetch all properties with units to show all units in filter
    const fetchAllProperties = async () => {
      try {
        const response = await getPropertiesWithUnitsRequest();
        setAllPropertiesWithUnits(response.data.properties || []);
      } catch (error: any) {
        console.error('Error fetching all properties:', error);
      }
    };
    fetchAllProperties();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllAnalyticsData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get available properties and units
  const propertiesList = useMemo(() => {
    return analyticsData.allTime?.propertiesList || [];
  }, [analyticsData.allTime]);

  const availableUnits = useMemo(() => {
    if (filterType !== 'UNIT') return [];
    
    // Get all units from all properties (not just from analytics data)
    const allUnits = allPropertiesWithUnits.flatMap(property => 
      (property.Unit || []).map(unit => ({
        unitId: unit.id,
        unitLabel: unit.label,
        propertyId: property.id,
        propertyTitle: property.title,
      }))
    );
    
    return allUnits; // Show all units regardless of whether they have payments
  }, [allPropertiesWithUnits, filterType]);

  // Calculate earnings for each period
  const calculateEarnings = (data: LeaseAnalyticsResponse | null) => {
    if (!data || !data.paymentBreakdown) return 0;
    
    let payments = Array.isArray(data.paymentBreakdown) ? data.paymentBreakdown : [];
    
    if (filterType === 'PROPERTY' && selectedPropertyId) {
      payments = payments.filter(p => p && p.propertyId === selectedPropertyId);
    } else if (filterType === 'UNIT' && selectedUnitId) {
      payments = payments.filter(p => p && p.unitId === selectedUnitId);
    }
    // If filterType is 'ALL', show all payments (no filtering)
    
    return payments.reduce((sum, p) => sum + (p?.amount || 0), 0);
  };

  const thisMonthEarnings = useMemo(() => calculateEarnings(analyticsData.thisMonth), [analyticsData.thisMonth, filterType, selectedPropertyId, selectedUnitId]);
  const thisYearEarnings = useMemo(() => calculateEarnings(analyticsData.thisYear), [analyticsData.thisYear, filterType, selectedPropertyId, selectedUnitId]);
  const allTimeEarnings = useMemo(() => calculateEarnings(analyticsData.allTime), [analyticsData.allTime, filterType, selectedPropertyId, selectedUnitId]);

  // Get filtered payments for charts and table (based on selected time period)
  const filteredPayments = useMemo(() => {
    let data: LeaseAnalyticsResponse | null = null;
    
    if (dateRangePreset === 'THIS_MONTH') {
      data = analyticsData.thisMonth;
    } else if (dateRangePreset === 'THIS_YEAR') {
      data = analyticsData.thisYear;
    } else {
      data = analyticsData.allTime;
    }
    
    if (!data || !data.paymentBreakdown) return [];
    
    let payments = Array.isArray(data.paymentBreakdown) 
      ? data.paymentBreakdown 
      : [];
    
    if (filterType === 'PROPERTY' && selectedPropertyId) {
      payments = payments.filter(p => p && p.propertyId === selectedPropertyId);
    } else if (filterType === 'UNIT' && selectedUnitId) {
      payments = payments.filter(p => p && p.unitId === selectedUnitId);
    }
    // If filterType is 'ALL', show all payments (no filtering)
    
    return payments;
  }, [analyticsData, dateRangePreset, filterType, selectedPropertyId, selectedUnitId]);

  // Payment Status Distribution Data
  const paymentStatusData = useMemo(() => {
    if (!Array.isArray(filteredPayments) || filteredPayments.length === 0) return [];
    
    const onTime = filteredPayments.filter(p => p && p.timingStatus === 'ONTIME').length;
    const late = filteredPayments.filter(p => p && p.timingStatus === 'LATE').length;
    const advance = filteredPayments.filter(p => p && p.timingStatus === 'ADVANCE').length;
    
    return [
      { name: 'On Time', value: onTime, color: 'hsl(142, 76%, 36%)' },
      { name: 'Late', value: late, color: 'hsl(0, 84%, 60%)' },
      { name: 'Advance', value: advance, color: 'hsl(217, 91%, 60%)' },
    ].filter(item => item.value > 0);
  }, [filteredPayments]);

  // Payment Counts Over Time Data (varies by time period)
  const paymentCountsData = useMemo(() => {
    const now = new Date();
    const payments = Array.isArray(filteredPayments) ? filteredPayments : [];
    
    if (dateRangePreset === 'THIS_MONTH') {
      // Group by day for current month
      const start = startOfMonth(now);
      const end = endOfMonth(now);
      const dailyMap = new Map<string, number>();
      
      payments.forEach(payment => {
        if (!payment || !payment.paidAt) return;
        try {
          const date = new Date(payment.paidAt);
          if (date >= start && date <= end) {
            const dateKey = format(date, 'yyyy-MM-dd');
            const current = dailyMap.get(dateKey) || 0;
            dailyMap.set(dateKey, current + 1);
          }
        } catch (error) {
          console.error('Error parsing date:', payment.paidAt);
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
    } else if (dateRangePreset === 'THIS_YEAR') {
      // Group by month for current year
      const start = startOfYear(now);
      const end = endOfYear(now);
      const monthlyMap = new Map<string, number>();
      
      payments.forEach(payment => {
        if (!payment || !payment.paidAt) return;
        try {
          const date = new Date(payment.paidAt);
          if (date >= start && date <= end) {
            const monthKey = format(date, 'yyyy-MM');
            const current = monthlyMap.get(monthKey) || 0;
            monthlyMap.set(monthKey, current + 1);
          }
        } catch (error) {
          console.error('Error parsing date:', payment.paidAt);
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
      
      payments.forEach(payment => {
        if (!payment || !payment.paidAt) return;
        try {
          const date = new Date(payment.paidAt);
          const year = date.getFullYear();
          if (year >= startYear && year <= currentYear) {
            const yearKey = `${year}-01-01`;
            const current = yearlyMap.get(yearKey) || 0;
            yearlyMap.set(yearKey, current + 1);
          }
        } catch (error) {
          console.error('Error parsing date:', payment.paidAt);
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
  }, [filteredPayments, dateRangePreset]);

  // Get chart title based on time period
  const paymentCountsChartTitle = useMemo(() => {
    if (dateRangePreset === 'THIS_MONTH') return 'Daily Payments';
    if (dateRangePreset === 'THIS_YEAR') return 'Monthly Payments';
    return 'Yearly Payments';
  }, [dateRangePreset]);

  // Chart configurations
  const paymentStatusChartConfig: ChartConfig = {
    onTime: { label: 'On Time', color: 'hsl(142, 76%, 36%)' },
    late: { label: 'Late', color: 'hsl(0, 84%, 60%)' },
    advance: { label: 'Advance', color: 'hsl(217, 91%, 60%)' },
  };

  const paymentCountsChartConfig: ChartConfig = {
    payments: { label: 'Payments', color: 'hsl(199, 89%, 48%)' },
  };

  // Get selected property/unit name
  const selectedName = useMemo(() => {
    if (filterType === 'ALL') {
      return 'All Properties';
    } else if (filterType === 'PROPERTY' && selectedPropertyId) {
      const property = propertiesList.find(p => p && p.id === selectedPropertyId);
      return property?.title || 'Selected Property';
    } else if (filterType === 'UNIT' && selectedUnitId) {
      const unit = availableUnits.find(u => u && u.unitId === selectedUnitId);
      return unit ? `${unit.unitLabel} (${unit.propertyTitle})` : 'Selected Unit';
    }
    return null;
  }, [filterType, selectedPropertyId, selectedUnitId, propertiesList, availableUnits]);

  // Format currency for PDF
  const formatCurrencyForPDF = (amount: number) => {
    const formatted = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `PHP ${formatted}`;
  };

  // Generate PDF Report
  const generatePDF = async () => {
    try {
      setGeneratingPdf(true);

      // Fetch data with PDF filters
      const now = new Date();
      const currentMonth = format(now, 'yyyy-MM');
      
      let pdfData: LeaseAnalyticsResponse;
      if (pdfDateRangePreset === 'THIS_MONTH') {
        const response = await getLeaseAnalyticsRequest({ period: 'THIS_MONTH' });
        pdfData = response.data;
      } else if (pdfDateRangePreset === 'THIS_YEAR') {
        const response = await getLeaseAnalyticsRequest({ period: 'THIS_YEAR' });
        pdfData = response.data;
      } else {
        const response = await getLeaseAnalyticsRequest({ 
          period: 'CUSTOM',
          startMonth: '2000-01',
          endMonth: currentMonth,
        });
        pdfData = response.data;
      }

      // Filter payments based on PDF filters
      let pdfPayments = Array.isArray(pdfData?.paymentBreakdown) 
        ? pdfData.paymentBreakdown 
        : [];
      
      if (pdfFilterType === 'PROPERTY' && pdfSelectedPropertyId) {
        pdfPayments = pdfPayments.filter(p => p && p.propertyId === pdfSelectedPropertyId);
      } else if (pdfFilterType === 'UNIT' && pdfSelectedUnitId) {
        pdfPayments = pdfPayments.filter(p => p && p.unitId === pdfSelectedUnitId);
      }

      const pdfTotalIncome = pdfPayments.reduce((sum, p) => sum + (p?.amount || 0), 0);
      
      // Filter to only paid payments with timingStatus for reliability calculation
      const paidPaymentsWithTiming = pdfPayments.filter(p => p && p.timingStatus !== null && p.timingStatus !== undefined);
      const onTimePayments = paidPaymentsWithTiming.filter(p => p.timingStatus === 'ONTIME').length;
      const latePayments = paidPaymentsWithTiming.filter(p => p.timingStatus === 'LATE').length;
      const advancePayments = paidPaymentsWithTiming.filter(p => p.timingStatus === 'ADVANCE').length;

      // Get filter label
      let filterLabel = 'All Properties';
      if (pdfFilterType === 'PROPERTY' && pdfSelectedPropertyId) {
        const propertiesList = Array.isArray(pdfData?.propertiesList) ? pdfData.propertiesList : [];
        filterLabel = propertiesList.find(p => p && p.id === pdfSelectedPropertyId)?.title || 'All Properties';
      } else if (pdfFilterType === 'UNIT' && pdfSelectedUnitId) {
        // Find unit from allPropertiesWithUnits (not from analytics data)
        const unit = allPropertiesWithUnits
          .flatMap(property => (property.Unit || []).map(u => ({ ...u, propertyTitle: property.title })))
          .find(u => u.id === pdfSelectedUnitId);
        filterLabel = unit ? `${unit.label} - ${unit.propertyTitle}` : 'All Properties';
      }

      // Generate PDF
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      let yPosition = 20;

      // RentEase Branding Header
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(16, 185, 129); // emerald-500 color
      doc.text('RentEase', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 6;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Property Management Platform', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;
      
      // Divider line
      doc.setDrawColor(200, 200, 200);
      doc.line(14, yPosition, pageWidth - 14, yPosition);
      yPosition += 10;

      // Report Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('Rent Earnings Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Report Info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      let reportInfo = `View: ${filterLabel}`;

      // Add date range info
      let dateRangeText = '';
      if (pdfDateRangePreset === 'THIS_MONTH') {
        dateRangeText = ` - ${format(new Date(), 'MMMM yyyy')}`;
      } else if (pdfDateRangePreset === 'THIS_YEAR') {
        dateRangeText = ` - Year ${new Date().getFullYear()}`;
      } else {
        dateRangeText = ' - All Time';
      }

      doc.text(reportInfo + dateRangeText, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 8;

      // Generated date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text(`Generated on: ${format(new Date(), 'MMMM dd, yyyy')}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Summary section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Summary', 14, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Income Collected: ${formatCurrencyForPDF(pdfTotalIncome)}`, 14, yPosition);
      yPosition += 6;
        doc.text(`Total Payments: ${pdfPayments.length}`, 14, yPosition);
        yPosition += 6;
        
        if (pdfPayments.length > 0) {
          doc.text(`On-Time Payments: ${onTimePayments}`, 14, yPosition);
          yPosition += 6;
          doc.text(`Late Payments: ${latePayments}`, 14, yPosition);
          yPosition += 6;
          doc.text(`Advance Payments: ${advancePayments}`, 14, yPosition);
          yPosition += 6;
          
          // Payment reliability percentage - calculated like in ViewSpecificLease
          // Reliability = (ONTIME + ADVANCE) / total paid payments with timingStatus
          // Only late payments reduce reliability
          const goodPayments = onTimePayments + advancePayments;
          const reliabilityRate = paidPaymentsWithTiming.length > 0 
            ? ((goodPayments / paidPaymentsWithTiming.length) * 100).toFixed(1)
            : '0.0';
          doc.setFont('helvetica', 'bold');
          const reliabilityColor = parseFloat(reliabilityRate) >= 80 ? [0, 150, 0] : parseFloat(reliabilityRate) >= 50 ? [200, 150, 0] : [200, 0, 0];
          doc.setTextColor(reliabilityColor[0], reliabilityColor[1], reliabilityColor[2]);
          doc.text(`Payment Reliability: ${reliabilityRate}%`, 14, yPosition);
          doc.setTextColor(0, 0, 0);
          yPosition += 6;
          doc.setFont('helvetica', 'normal');
        }
      
      yPosition += 4;
      
      // Currency note
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('Note: All amounts are in Philippine Peso (PHP)', 14, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 10;

      // Payment Breakdown Table
      if (pdfPayments.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Payment Breakdown', 14, yPosition);
        yPosition += 8;

        const tableData = pdfPayments
          .filter(payment => payment && payment.paidAt)
          .map(payment => {
            const tenantName = (payment.tenantName || 'Unknown').length > 20 
              ? (payment.tenantName || 'Unknown').substring(0, 17) + '...' 
              : (payment.tenantName || 'Unknown');
            const propertyTitle = (payment.propertyTitle || 'Unknown').length > 25
              ? (payment.propertyTitle || 'Unknown').substring(0, 22) + '...'
              : (payment.propertyTitle || 'Unknown');
            const unitLabel = (payment.unitLabel || 'Unknown').length > 15
              ? (payment.unitLabel || 'Unknown').substring(0, 12) + '...'
              : (payment.unitLabel || 'Unknown');
            
            return [
              format(new Date(payment.paidAt), 'MMM dd, yyyy'),
              tenantName,
              propertyTitle,
              unitLabel,
              formatCurrencyForPDF(payment.amount || 0),
              payment.method || '-',
              payment.timingStatus || '-',
            ];
          });

        const availableWidth = pageWidth - 28;

        autoTable(doc, {
          startY: yPosition,
          head: [['Date', 'Tenant', 'Property', 'Unit', 'Amount (PHP)', 'Method', 'Status']],
          body: tableData,
          theme: 'striped',
          headStyles: { 
            fillColor: [16, 185, 129], // emerald-500
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9,
          },
          bodyStyles: { fontSize: 8 },
          alternateRowStyles: { fillColor: [249, 250, 251] },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 35 },
            2: { cellWidth: 40 },
            3: { cellWidth: 28 },
            4: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
            5: { cellWidth: 25, halign: 'center' },
            6: { cellWidth: 25, halign: 'center' },
          },
          margin: { left: 14, right: 14 },
          styles: { 
            overflow: 'linebreak', 
            cellPadding: 2,
            fontSize: 8,
            lineWidth: 0.1,
          },
          tableWidth: availableWidth,
          showHead: 'everyPage',
        });
      } else {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text('No payments found for the selected filters.', 14, yPosition);
      }

      // Add footer with RentEase credit on all pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setDrawColor(200, 200, 200);
        doc.line(14, pageHeight - 20, pageWidth - 14, pageHeight - 20);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129);
        doc.text('RentEase', pageWidth / 2, pageHeight - 12, { align: 'center' });
        
        doc.setFontSize(7);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text('Generated by RentEase - Property Management Platform', pageWidth / 2, pageHeight - 6, { align: 'center' });
        doc.setTextColor(0, 0, 0);
      }

      // Generate filename
      const filterSlug = filterLabel.replace(/\s+/g, '-');
      let dateSuffix = '';
      if (pdfDateRangePreset === 'THIS_MONTH') {
        dateSuffix = `-${format(new Date(), 'yyyy-MM')}`;
      } else if (pdfDateRangePreset === 'THIS_YEAR') {
        dateSuffix = `-${new Date().getFullYear()}`;
      } else {
        dateSuffix = '-all-time';
      }
      
      const filename = `Rent-Earnings-Report-${filterSlug}${dateSuffix}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;

      doc.save(filename);
      toast.success('PDF generated successfully');
      setShowDownloadModal(false);
      setPdfFilterType('ALL');
      setPdfSelectedPropertyId('');
      setPdfSelectedUnitId('');
      setPdfDateRangePreset('THIS_MONTH');
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  if (loading && !analyticsData.allTime) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 via-blue-50/30 to-indigo-50/50" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-100/20 to-blue-100/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-indigo-100/20 to-cyan-100/20 rounded-full blur-3xl" />
        
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 shadow-lg flex-shrink-0"
                >
                  <DollarSign className="h-7 w-7 text-white" />
                </motion.div>
                <div className="space-y-1">
                  <h1 className="text-3xl font-bold text-gray-900">Rent Earnings Report</h1>
                  <p className="text-sm text-gray-600">Track earnings and payment analytics for properties and units</p>
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
                  onClick={() => {
                    setPdfFilterType(filterType);
                    setPdfSelectedPropertyId(selectedPropertyId);
                    setPdfSelectedUnitId(selectedUnitId);
                    setPdfDateRangePreset(dateRangePreset);
                    setShowDownloadModal(true);
                  }}
                  className="h-10 px-4 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-md"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                  <Calendar className="h-3.5 w-3.5 text-cyan-600" />
                  Time Period
                </label>
                <Select 
                  value={dateRangePreset} 
                  onValueChange={(value) => setDateRangePreset(value as DateRangePreset)}
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
                  <Building2 className="h-3.5 w-3.5 text-cyan-600" />
                  View Type
                </label>
                <Select 
                  value={filterType} 
                  onValueChange={(value) => {
                    setFilterType(value as FilterType);
                    setSelectedPropertyId('');
                    setSelectedUnitId('');
                  }}
                >
                  <SelectTrigger className="w-full h-11 text-sm border-gray-300 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Properties</SelectItem>
                    <SelectItem value="PROPERTY">Specific Property</SelectItem>
                    <SelectItem value="UNIT">Specific Unit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filterType === 'PROPERTY' && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                    <Building2 className="h-3.5 w-3.5 text-indigo-600" />
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
                      {propertiesList.map(prop => (
                        prop && (
                          <SelectItem key={prop.id} value={prop.id}>
                            {prop.title || 'Unknown Property'}
                          </SelectItem>
                        )
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {filterType === 'UNIT' && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                    <Home className="h-3.5 w-3.5 text-purple-600" />
                    Unit
                  </label>
                  <Select 
                    value={selectedUnitId} 
                    onValueChange={setSelectedUnitId}
                  >
                    <SelectTrigger className="w-full h-11 text-sm border-gray-300 bg-white">
                      <SelectValue placeholder="Select a unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUnits.map(unit => (
                        <SelectItem key={unit.unitId} value={unit.unitId}>
                          {unit.unitLabel} ({unit.propertyTitle})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Earnings Card - Show only the card matching the selected time period */}
      {analyticsData.allTime && (
        <div className="grid gap-4">
          {dateRangePreset === 'THIS_MONTH' && (
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  This Month
                </CardTitle>
                <CardDescription className="text-xs">
                  {selectedName || 'All Properties'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-700">
                  {formatCurrency(thisMonthEarnings)}
                </div>
              </CardContent>
            </Card>
          )}

          {dateRangePreset === 'THIS_YEAR' && (
            <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                  This Year
                </CardTitle>
                <CardDescription className="text-xs">
                  {selectedName || 'All Properties'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-700">
                  {formatCurrency(thisYearEarnings)}
                </div>
              </CardContent>
            </Card>
          )}

          {dateRangePreset === 'ALL_TIME' && (
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-purple-500 flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-white" />
                  </div>
                  All Time
                </CardTitle>
                <CardDescription className="text-xs">
                  {selectedName || 'All Properties'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-700">
                  {formatCurrency(allTimeEarnings)}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Charts Section */}
      {analyticsData.allTime && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Payment Status Distribution Chart */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Payment Status Distribution</CardTitle>
              <CardDescription className="text-xs">
                Breakdown of payments by timing status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paymentStatusData.length > 0 ? (
                <ChartContainer config={paymentStatusChartConfig} className="h-[200px] w-full">
                  <PieChart>
                    <Pie
                      data={paymentStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={70}
                      innerRadius={30}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {paymentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip 
                      content={
                        <ChartTooltipContent
                          formatter={(value: any) => [`${value} payments`, '']}
                        />
                      }
                    />
                  </PieChart>
                </ChartContainer>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-sm text-gray-500">
                  No payment status data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payments Over Time Chart */}
          <Card>
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
              <div className="grid flex-1 gap-1">
                <CardTitle>{paymentCountsChartTitle}</CardTitle>
                <CardDescription>
                  Showing payment count for {dateRangePreset === 'THIS_MONTH' ? 'this month' : dateRangePreset === 'THIS_YEAR' ? 'this year' : 'all time'}
                  {(() => {
                    const totalCount = paymentCountsData.reduce((sum, item) => sum + (item.count || 0), 0);
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
              <ChartContainer config={paymentCountsChartConfig} className="aspect-auto h-[250px] w-full">
                <BarChart data={paymentCountsData}>
                  <CartesianGrid vertical={false} stroke="hsl(var(--muted))" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }}
                    minTickGap={dateRangePreset === 'ALL_TIME' ? 90 : dateRangePreset === 'THIS_YEAR' ? 60 : 40}
                    interval={0}
                    tickFormatter={(value: string) => {
                      const date = new Date(value);
                      if (dateRangePreset === 'ALL_TIME') {
                        return date.getFullYear().toString();
                      } else if (dateRangePreset === 'THIS_YEAR') {
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
                          if (dateRangePreset === 'ALL_TIME') {
                            return date.getFullYear().toString();
                          } else if (dateRangePreset === 'THIS_YEAR') {
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
                    fill="var(--color-payments)"
                    radius={[4, 4, 0, 0]}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Breakdown Table */}
      {analyticsData.allTime && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Breakdown</CardTitle>
            <CardDescription>
              Detailed list of all payments for {selectedName || 'All Properties'} ({dateRangePreset === 'THIS_MONTH' ? 'This Month' : dateRangePreset === 'THIS_YEAR' ? 'This Year' : 'All Time'})
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredPayments.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">No payments found for the selected filters.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.paymentId}>
                        <TableCell className="font-medium">
                          {format(new Date(payment.paidAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.tenantName}</div>
                            <div className="text-xs text-gray-500">{payment.tenantEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>{payment.propertyTitle}</TableCell>
                        <TableCell>{payment.unitLabel}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          {payment.method ? (
                            <Badge variant="outline">{payment.method}</Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {payment.timingStatus === 'ONTIME' && (
                            <Badge className="bg-green-100 text-green-800">On Time</Badge>
                          )}
                          {payment.timingStatus === 'LATE' && (
                            <Badge className="bg-red-100 text-red-800">Late</Badge>
                          )}
                          {payment.timingStatus === 'ADVANCE' && (
                            <Badge className="bg-blue-100 text-blue-800">Advance</Badge>
                          )}
                          {!payment.timingStatus && (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Download PDF Modal */}
      <Dialog open={showDownloadModal} onOpenChange={setShowDownloadModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Download Rent Earnings Report</DialogTitle>
            <DialogDescription>
              Select the filters you want to include in the PDF report.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>View Type</Label>
              <Select
                value={pdfFilterType}
                onValueChange={(value: FilterType) => {
                  setPdfFilterType(value);
                  if (value === 'ALL') {
                    setPdfSelectedPropertyId('');
                    setPdfSelectedUnitId('');
                  } else if (value === 'PROPERTY') {
                    setPdfSelectedUnitId('');
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select view type" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="ALL">All Properties</SelectItem>
                  <SelectItem value="PROPERTY">Specific Property</SelectItem>
                  <SelectItem value="UNIT">Specific Unit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {pdfFilterType === 'PROPERTY' && analyticsData.allTime && (
              <div className="space-y-2">
                <Label>Property *</Label>
                <Select
                  value={pdfSelectedPropertyId}
                  onValueChange={setPdfSelectedPropertyId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    {(Array.isArray(analyticsData.allTime.propertiesList) ? analyticsData.allTime.propertiesList : []).map(prop => (
                      prop && (
                        <SelectItem key={prop.id} value={prop.id}>
                          {prop.title || 'Unknown Property'}
                        </SelectItem>
                      )
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {pdfFilterType === 'UNIT' && (
              <div className="space-y-2">
                <Label>Unit *</Label>
                <Select
                  value={pdfSelectedUnitId}
                  onValueChange={setPdfSelectedUnitId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    {allPropertiesWithUnits.flatMap(property => 
                      (property.Unit || []).map(unit => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.label} ({property.title})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Time Period</Label>
              <Select
                value={pdfDateRangePreset}
                onValueChange={(value: DateRangePreset) => {
                  setPdfDateRangePreset(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent className="z-[9999]">
                  <SelectItem value="THIS_MONTH">This Month</SelectItem>
                  <SelectItem value="THIS_YEAR">This Year</SelectItem>
                  <SelectItem value="ALL_TIME">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg space-y-1">
              <p className="text-sm font-semibold text-slate-700">Report will include:</p>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                {pdfDateRangePreset === 'ALL_TIME' ? (
                  <li>All time payment data</li>
                ) : pdfDateRangePreset === 'THIS_MONTH' ? (
                  <li>Payments for this month</li>
                ) : pdfDateRangePreset === 'THIS_YEAR' ? (
                  <li>Payments for this year</li>
                ) : null}
                {pdfFilterType === 'ALL' ? (
                  <li>All properties and units</li>
                ) : pdfFilterType === 'PROPERTY' ? (
                  <li>Selected property only</li>
                ) : (
                  <li>Selected unit only</li>
                )}
                <li>Summary statistics (Total Income, Payment Count, Reliability)</li>
                <li>Detailed payment breakdown table</li>
                <li>All amounts in Philippine Peso (₱)</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDownloadModal(false);
                setPdfFilterType('ALL');
                setPdfSelectedPropertyId('');
                setPdfSelectedUnitId('');
                setPdfDateRangePreset('THIS_MONTH');
              }}
              disabled={generatingPdf}
            >
              Cancel
            </Button>
            <Button 
              onClick={generatePDF}
              disabled={
                generatingPdf || 
                (pdfFilterType === 'PROPERTY' && !pdfSelectedPropertyId) ||
                (pdfFilterType === 'UNIT' && !pdfSelectedUnitId)
              }
              className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600"
            >
              {generatingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate PDF
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaseAnalytics;

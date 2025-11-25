import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { format } from 'date-fns';
import { Loader2, RefreshCcw, Sparkles, Wallet, Download } from 'lucide-react';
import { toast } from 'sonner';
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
import { getAdminEarningsRequest } from '@/api/admin/earningsApi';
import type {
  EarningsRange,
  EarningsRecord,
  EarningsSummaryResponse,
} from '@/api/admin/earningsApi';

const timelineChartConfig = {
  earnings: {
    label: 'Total earnings',
    color: 'var(--chart-1)',
  },
  listings: {
    label: 'Listings count',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

const paymentChartConfig = {
  total: {
    label: 'Revenue',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig;

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

const AdminEarnings = () => {
  const currentYear = new Date().getFullYear();
  const [range, setRange] = useState<EarningsRange>('this_month');
  const [year, setYear] = useState<number>(currentYear);
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'FEATURED' | 'STANDARD'>('ALL');
  const [data, setData] = useState<EarningsSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tablePage, setTablePage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const fetchData = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      const response = await getAdminEarningsRequest({
        range,
        year: range === 'year' ? year : undefined,
      });
      setData(response.data);
    } catch (error: any) {
      if (error?.name === 'CanceledError') return;
      console.error('Error fetching earnings:', error);
      toast.error(error?.response?.data?.error || 'Failed to load earnings data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchData();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, year]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData({ silent: true });
  };

  const formatCurrencyForPDF = (amount: number) => {
    const formatted = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return `PHP ${formatted}`;
  };

  const generatePDF = async () => {
    try {
      setGeneratingPdf(true);

      // Use current filtered data
      const pdfRecords = filteredRecords;

      // Calculate totals
      const totalEarnings = pdfRecords.reduce((sum, record) => sum + Number(record.amount || 0), 0);
      const featuredCount = pdfRecords.filter((r) => Math.round(r.amount) === 150).length;
      const standardCount = pdfRecords.filter((r) => Math.round(r.amount) === 100).length;
      const featuredTotal = pdfRecords
        .filter((r) => Math.round(r.amount) === 150)
        .reduce((sum, record) => sum + Number(record.amount || 0), 0);
      const standardTotal = pdfRecords
        .filter((r) => Math.round(r.amount) === 100)
        .reduce((sum, record) => sum + Number(record.amount || 0), 0);

      // Create PDF in landscape orientation
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
      doc.setTextColor(99, 102, 241); // indigo-600
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
      doc.text('Platform Earnings Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 10;

      // Report period
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const periodText = summary?.range
        ? `${summary.range.label} • ${format(new Date(summary.range.start), 'MMM d, yyyy')} - ${format(new Date(summary.range.end), 'MMM d, yyyy')}`
        : 'Selected period';
      doc.text(periodText, pageWidth / 2, yPosition, { align: 'center' });
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
      doc.text(`Total Earnings: ${formatCurrencyForPDF(totalEarnings)}`, 14, yPosition);
      yPosition += 6;
      doc.text(`Total Listings: ${pdfRecords.length}`, 14, yPosition);
      yPosition += 6;
      doc.text(`Featured Listings (₱150): ${featuredCount} - ${formatCurrencyForPDF(featuredTotal)}`, 14, yPosition);
      yPosition += 6;
      doc.text(`Standard Listings (₱100): ${standardCount} - ${formatCurrencyForPDF(standardTotal)}`, 14, yPosition);
      yPosition += 6;
      doc.text(`Average per Listing: ${formatCurrencyForPDF(pdfRecords.length ? totalEarnings / pdfRecords.length : 0)}`, 14, yPosition);
      yPosition += 8;

      // Currency note
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('Note: All amounts are in Philippine Peso (PHP)', 14, yPosition);
      doc.setTextColor(0, 0, 0);
      yPosition += 10;

      // Earnings table
      if (pdfRecords.length > 0) {
        const tableData = pdfRecords.map((record) => [
          record.propertyTitle.length > 30
            ? record.propertyTitle.substring(0, 27) + '...'
            : record.propertyTitle,
          record.unitLabel.length > 15 ? record.unitLabel.substring(0, 12) + '...' : record.unitLabel,
          record.providerName || 'N/A',
          record.paymentDate
            ? format(new Date(record.paymentDate), 'MMM dd, yyyy')
            : '—',
          formatCurrencyForPDF(record.amount),
        ]);

        const availableWidth = pageWidth - 28;
        autoTable(doc, {
          startY: yPosition,
          head: [['Property', 'Unit', 'Provider', 'Payment Date', 'Amount (PHP)']],
          body: tableData,
          theme: 'striped',
          headStyles: {
            fillColor: [99, 102, 241], // indigo-600
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 9,
          },
          bodyStyles: { fontSize: 8 },
          alternateRowStyles: { fillColor: [249, 250, 251] },
          columnStyles: {
            0: { cellWidth: 60 },
            1: { cellWidth: 30 },
            2: { cellWidth: 35 },
            3: { cellWidth: 40 },
            4: { cellWidth: 50, halign: 'right', fontStyle: 'bold' },
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
        doc.text('No earnings recorded for this range.', 14, yPosition);
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
        doc.setTextColor(99, 102, 241);
        doc.text('RentEase', pageWidth / 2, pageHeight - 12, { align: 'center' });

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

      // Generate filename
      const rangeLabel = summary?.range.label.replace(/\s+/g, '-') || 'Earnings';
      const filename = `Earnings-Report-${rangeLabel}-${format(new Date(), 'yyyy-MM-dd')}.pdf`;

      doc.save(filename);
      toast.success('PDF generated successfully');
      setShowDownloadModal(false);
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const tableData: EarningsRecord[] = data?.records || [];

  const filteredRecords = useMemo(() => {
    if (paymentFilter === 'FEATURED') {
      return tableData.filter((record) => Math.round(record.amount) === 150);
    }
    if (paymentFilter === 'STANDARD') {
      return tableData.filter((record) => Math.round(record.amount) === 100);
    }
    return tableData;
  }, [tableData, paymentFilter]);

  const filteredSummary = useMemo(() => {
    const total = filteredRecords.reduce((sum, record) => sum + Number(record.amount || 0), 0);
    return {
      total,
      count: filteredRecords.length,
    };
  }, [filteredRecords]);

  // Use backend timeline data directly, but transform it for chart display
  const timelineData = useMemo(() => {
    if (!data?.timeline) return [];

    let processedTimeline = data.timeline;

    // For this_month range, sample the timeline to show every few days (every 4-5 days)
    if (range === 'this_month') {
      // Sample every 4-5 days to reduce clutter (e.g., Apr 3, Apr 7, Apr 12, Apr 17, etc.)
      const sampledTimeline: typeof data.timeline = [];
      const sampleInterval = 4; // Sample every 4 days
      for (let i = 0; i < processedTimeline.length; i += sampleInterval) {
        sampledTimeline.push(processedTimeline[i]);
      }
      // Always include the last point
      if (processedTimeline.length > 0 && sampledTimeline[sampledTimeline.length - 1] !== processedTimeline[processedTimeline.length - 1]) {
        sampledTimeline.push(processedTimeline[processedTimeline.length - 1]);
      }
      processedTimeline = sampledTimeline;
    }

    // For year range with current year, ensure we have all months (Jan-Dec)
    if (range === 'year' && year === currentYear) {
      // The backend should already provide all months, but we ensure proper formatting
      // This is mainly handled by the XAxis formatter below
    }

    return processedTimeline.map((point) => {
      // Count listings for this point
      const listingsCount = filteredRecords.filter((record) => {
        if (!record.paymentDate) return false;
        const paymentDate = new Date(record.paymentDate);
        if (range === 'this_month' && point.date) {
          return paymentDate.toISOString().split('T')[0] === point.date;
        } else if (range !== 'this_month') {
          const monthKey = `${paymentDate.getFullYear()}-${paymentDate.getMonth() + 1}`;
          const pointDate = point.date ? new Date(point.date) : null;
          if (pointDate) {
            const pointMonthKey = `${pointDate.getFullYear()}-${pointDate.getMonth() + 1}`;
            return monthKey === pointMonthKey;
          }
        }
        return false;
      }).length;

      return {
        label: point.label,
        earnings: point.total,
        listings: listingsCount,
        date: point.date || point.label,
      };
    });
  }, [data?.timeline, filteredRecords, range, year, currentYear]);

  const summary = data?.summary;

  const filterRanges: Array<{ label: string; value: EarningsRange }> = [
    { label: 'This Month', value: 'this_month' },
    { label: 'This Year', value: 'this_year' },
    { label: 'Specific Year', value: 'year' },
  ];

  const selectableYears = Array.from({ length: 6 }, (_, idx) => currentYear - idx);

  const featuredMetrics = useMemo(() => {
    const featuredRecords = tableData.filter((record) => Math.round(record.amount) === 150);
    const total = featuredRecords.reduce((sum, record) => sum + Number(record.amount || 0), 0);
    return { count: featuredRecords.length, total };
  }, [tableData]);

  const standardMetrics = useMemo(() => {
    const standardRecords = tableData.filter((record) => Math.round(record.amount) === 100);
    const total = standardRecords.reduce((sum, record) => sum + Number(record.amount || 0), 0);
    return { count: standardRecords.length, total };
  }, [tableData]);

  const paymentTypeChartData = useMemo(
    () => [
      { label: 'Featured', total: featuredMetrics.total },
      { label: 'Standard', total: standardMetrics.total },
    ],
    [featuredMetrics.total, standardMetrics.total]
  );

  const timelineTotals = useMemo(() => {
    const totals = {
      earnings: timelineData.reduce((sum, point) => sum + point.earnings, 0),
      listings: filteredRecords.length, // Use filtered records count
    };
    return totals as Record<keyof typeof timelineChartConfig, number>;
  }, [timelineData, filteredRecords.length]);

  const [activeTimelineMetric, setActiveTimelineMetric] = useState<
    keyof typeof timelineChartConfig
  >('earnings');

  useEffect(() => {
    setTablePage(1);
  }, [rowsPerPage, tableData.length, range, year]);

  const totalTablePages = Math.max(1, Math.ceil(tableData.length / rowsPerPage));
  const paginatedTableData = useMemo(() => {
    const start = (tablePage - 1) * rowsPerPage;
    return tableData.slice(start, start + rowsPerPage);
  }, [tableData, tablePage, rowsPerPage]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-200/80 via-sky-200/75 to-cyan-200/60 opacity-95" />
        <div className="relative m-[1px] rounded-[16px] bg-white/85 backdrop-blur-lg border border-white/60 shadow-lg">
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -top-12 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-300/50 to-sky-400/40 blur-3xl"
            initial={{ opacity: 0.4, scale: 0.85 }}
            animate={{ opacity: 0.7, scale: 1.05 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-tl from-cyan-200/40 to-indigo-200/35 blur-3xl"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 0.6 }}
            transition={{ duration: 3.5, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
          />

          <div className="px-4 sm:px-6 py-5 space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <motion.div whileHover={{ scale: 1.05 }} className="relative flex-shrink-0">
                  <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-600 text-white grid place-items-center shadow-xl shadow-indigo-500/30">
                    <Wallet className="h-5 w-5 relative z-10" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                  </div>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 220 }}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white text-indigo-600 border border-indigo-100 shadow-sm grid place-items-center"
                  >
                    <Sparkles className="h-3 w-3" />
                  </motion.div>
                </motion.div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 truncate">
                      Platform Earnings
                    </h1>
                  </div>
                  <p className="text-sm text-slate-600 leading-6 flex items-center gap-1.5">
                    Monitor paid listing revenue across time windows
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Select value={range} onValueChange={(value: EarningsRange) => setRange(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterRanges.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {range === 'year' && (
                  <Select value={String(year)} onValueChange={(value) => setYear(Number(value))}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectableYears.map((yr) => (
                        <SelectItem key={yr} value={String(yr)}>
                          {yr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Button
                  variant="outline"
                  onClick={() => setShowDownloadModal(true)}
                  className="h-10"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="h-10 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 px-4 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 hover:brightness-110 disabled:opacity-70"
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
          </div>
        </div>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.15 }}
          style={{ originX: 0 }}
          className="h-1 w-full bg-gradient-to-r from-indigo-400/80 via-sky-400/80 to-cyan-400/80"
        />
      </motion.div>

      <Card className="border bg-white shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-700">Overview</CardTitle>
          <CardDescription>
            {summary?.range ? summary.range.label : 'Filtered range'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-4">
          <button
            type="button"
            onClick={() => {
              setPaymentFilter('ALL');
              setTablePage(1);
            }}
            className={`rounded-lg border px-3 py-2 text-left text-xs ${
              paymentFilter === 'ALL' ? 'border-indigo-200 bg-indigo-50 shadow-sm' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Total earnings</p>
            <p className="text-lg font-semibold text-slate-900">
              {currencyFormatter.format(filteredSummary.total)}
            </p>
            <p className="text-[11px] text-slate-500">Based on current filter</p>
          </button>
          <button
            type="button"
            onClick={() => {
              setPaymentFilter('ALL');
              setTablePage(1);
            }}
            className={`rounded-lg border px-3 py-2 text-left text-xs ${
              paymentFilter === 'ALL' ? 'border-indigo-200 bg-indigo-50 shadow-sm' : 'border-slate-200 bg-slate-50'
            }`}
          >
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Total listings</p>
            <p className="text-lg font-semibold text-slate-900">{filteredSummary.count}</p>
            <p className="text-[11px] text-slate-500">
              {summary?.range
                ? `${format(new Date(summary.range.start), 'MMM d')} - ${format(new Date(summary.range.end), 'MMM d')}`
                : ''}
            </p>
          </button>
          <button
            type="button"
            onClick={() => {
              setPaymentFilter('FEATURED');
              setTablePage(1);
            }}
            className={`rounded-lg border px-3 py-2 text-left text-xs ${
              paymentFilter === 'FEATURED'
                ? 'border-amber-300 bg-amber-50 shadow-sm'
                : 'border-amber-100 bg-amber-50/60'
            }`}
          >
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Featured (₱150)</p>
            <p className="text-lg font-semibold text-slate-900">{featuredMetrics.count}</p>
            <p className="text-[11px] text-slate-500">
              {currencyFormatter.format(featuredMetrics.total)} earned
            </p>
          </button>
          <button
            type="button"
            onClick={() => {
              setPaymentFilter('STANDARD');
              setTablePage(1);
            }}
            className={`rounded-lg border px-3 py-2 text-left text-xs ${
              paymentFilter === 'STANDARD'
                ? 'border-emerald-300 bg-emerald-50 shadow-sm'
                : 'border-emerald-100 bg-emerald-50/70'
            }`}
          >
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Standard (₱100)</p>
            <p className="text-lg font-semibold text-slate-900">{standardMetrics.count}</p>
            <p className="text-[11px] text-slate-500">
              {currencyFormatter.format(standardMetrics.total)} earned
            </p>
          </button>
        </CardContent>
      </Card>

      <Card className="py-0 bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
            <CardTitle>Earnings timeline</CardTitle>
            <CardDescription>
              {summary?.range
                ? `${summary.range.label} • ${format(new Date(summary.range.start), 'MMM d, yyyy')} - ${format(new Date(summary.range.end), 'MMM d, yyyy')}`
                : 'Select a range to view timeline'}
            </CardDescription>
          </div>
          <div className="flex">
            {(Object.keys(timelineChartConfig) as Array<keyof typeof timelineChartConfig>).map(
              (metric) => {
                const total = timelineTotals[metric];
                const formatted =
                  metric === 'earnings'
                    ? currencyFormatter.format(total)
                    : total.toLocaleString();
                return (
                  <button
                    key={metric}
                    data-active={activeTimelineMetric === metric}
                    className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left text-xs even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                    onClick={() => setActiveTimelineMetric(metric)}
                  >
                    <span className="text-muted-foreground text-xs">
                      {timelineChartConfig[metric].label}
                    </span>
                    <span className="text-lg leading-none font-bold sm:text-3xl">
                      {formatted}
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <ChartContainer
            config={timelineChartConfig}
            className="aspect-auto h-[300px] w-full"
          >
            <BarChart
              data={timelineData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey={range === 'this_month' ? 'label' : 'date'}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={range === 'this_month' ? 8 : 24}
                tickFormatter={(value) => {
                  if (range === 'this_month') {
                    // For this_month, value is already formatted as "M/D" from backend
                    // But we want to show it as "MMM D" format (e.g., "Apr 3")
                    try {
                      // Try to parse the label if it contains date info
                      const point = timelineData.find(p => p.label === value || p.date === value);
                      if (point?.date) {
                        const date = new Date(point.date);
                        return format(date, 'MMM d');
                      }
                      // If label is in "M/D" format, try to parse it
                      const parts = value.split('/');
                      if (parts.length === 2) {
                        const month = parseInt(parts[0], 10);
                        const day = parseInt(parts[1], 10);
                        const date = new Date(new Date().getFullYear(), month - 1, day);
                        return format(date, 'MMM d');
                      }
                      return value;
                    } catch {
                      return value;
                    }
                  }
                  // For other ranges, parse the date
                  try {
                    const date = new Date(value);
                    if (range === 'this_year' || range === 'year') {
                      // For year range, show month abbreviation (Jan, Feb, etc.)
                      return date.toLocaleDateString('en-US', {
                        month: 'short',
                      });
                    }
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    });
                  } catch {
                    return value;
                  }
                }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[160px]"
                    nameKey={timelineChartConfig[activeTimelineMetric].label}
                    labelFormatter={(value) => {
                      if (range === 'this_month') {
                        // For this_month, show full date
                        const date = data?.timeline.find(p => p.label === value || p.date === value);
                        if (date?.date) {
                          return new Date(date.date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          });
                        }
                        return value;
                      }
                      return new Date(value).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      });
                    }}
                    formatter={(value) =>
                      activeTimelineMetric === 'earnings'
                        ? currencyFormatter.format(Number(value))
                        : Number(value).toLocaleString()
                    }
                  />
                }
              />
              <Bar
                dataKey={activeTimelineMetric}
                fill={`var(--color-${activeTimelineMetric})`}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Featured vs Standard revenue</CardTitle>
          <CardDescription>Total earnings grouped by payment tier</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={paymentChartConfig} className="h-[280px] w-full">
            <BarChart data={paymentTypeChartData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis
                tickFormatter={(value) => currencyFormatter.format(value).replace('PHP', '₱')}
                tickLine={false}
                axisLine={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(label) => label}
                    formatter={(value) => currencyFormatter.format(Number(value))}
                  />
                }
              />
              <Bar dataKey="total" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Paid listing breakdown</CardTitle>
          <CardDescription>Property, unit, payment source, and amount</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-500">
                      No earnings recorded for this range.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTableData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">{record.propertyTitle}</span>
                          <span className="text-xs text-slate-500">{record.unitLabel}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.providerName ? (
                          <Badge variant="outline" className="text-xs">
                            {record.providerName}
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-500">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {record.paymentDate ? format(new Date(record.paymentDate), 'MMM d, yyyy') : '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {Math.round(record.amount) === 150 ? (
                          <Badge variant="default" className="bg-amber-500 text-white text-xs">
                            150 featured
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-500">not</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-slate-900">
                        {currencyFormatter.format(record.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span>Rows per page:</span>
              <Select value={String(rowsPerPage)} onValueChange={(value) => setRowsPerPage(Number(value))}>
                <SelectTrigger className="h-8 w-[100px]">
                  <SelectValue placeholder="Rows" />
                </SelectTrigger>
                <SelectContent>
                  {[5, 8, 12, 20].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Button
                variant="outline"
                size="sm"
                disabled={tablePage <= 1}
                onClick={() => setTablePage((prev) => Math.max(1, prev - 1))}
              >
                Prev
              </Button>
              <span>
                Page {tablePage} of {totalTablePages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={tablePage >= totalTablePages}
                onClick={() => setTablePage((prev) => Math.min(totalTablePages, prev + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download PDF Modal */}
      <Dialog open={showDownloadModal} onOpenChange={setShowDownloadModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Download Earnings Report</DialogTitle>
            <DialogDescription>
              Generate a PDF report of platform earnings for the selected period.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-lg space-y-1">
              <p className="text-sm font-semibold text-slate-700">Report will include:</p>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                <li>
                  Period: {summary?.range ? `${summary.range.label} (${format(new Date(summary.range.start), 'MMM d')} - ${format(new Date(summary.range.end), 'MMM d, yyyy')})` : 'Selected range'}
                </li>
                <li>Total earnings summary</li>
                <li>Featured vs Standard breakdown</li>
                <li>Detailed listing payment records</li>
                <li>All amounts in Philippine Peso (₱)</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDownloadModal(false)}
              disabled={generatingPdf}
            >
              Cancel
            </Button>
            <Button
              onClick={generatePDF}
              disabled={generatingPdf}
              className="bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 text-white hover:brightness-110"
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

export default AdminEarnings;


import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  RotateCcw,
  Loader2,
  Building2,
  Home,
  Calendar,
  FileText,
  Download,
  BarChart3,
} from 'lucide-react';
import { getLeaseAnalyticsRequest, type LeaseAnalyticsResponse } from '@/api/landlord/leaseAnalyticsApi';
import { getPropertiesWithUnitsRequest } from '@/api/landlord/financialApi';
import { getLandlordPaymentsRequest } from '@/api/landlord/paymentApi';

type FilterType = 'ALL' | 'PROPERTY' | 'UNIT';
type DateRangePreset = 'THIS_MONTH' | 'THIS_YEAR' | 'ALL_TIME';

const LeaseAnalytics = () => {
  const navigate = useNavigate();
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
  const [monthlyPayments, setMonthlyPayments] = useState<Array<{
    id: string;
    leaseId: string;
    amount: number;
    dueDate: string;
    paidAt: string | null;
    status: 'PENDING' | 'PAID';
    timingStatus: 'ONTIME' | 'LATE' | 'ADVANCE' | null;
    lease: {
      id: string;
      property: { id: string; title: string } | null;
      unit: { id: string; label: string } | null;
      tenant: { id: string; firstName: string; lastName: string; email: string } | null;
    } | null;
  }>>([]);
  const [allTimePayments, setAllTimePayments] = useState<Array<{
    id: string;
    leaseId: string;
    amount: number;
    dueDate: string;
    paidAt: string | null;
    status: 'PENDING' | 'PAID';
    timingStatus: 'ONTIME' | 'LATE' | 'ADVANCE' | null;
    lease: {
      id: string;
      property: { id: string; title: string } | null;
      unit: { id: string; label: string } | null;
      tenant: { id: string; firstName: string; lastName: string; email: string } | null;
    } | null;
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
    
    // Fetch monthly payments for this month (to get expected vs collected)
    const fetchMonthlyPayments = async () => {
      try {
        const now = new Date();
        const response = await getLandlordPaymentsRequest({
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          scope: 'month',
        });
        setMonthlyPayments(response.data.payments || []);
      } catch (error: any) {
        console.error('Error fetching monthly payments:', error);
      }
    };
    fetchMonthlyPayments();
    
    // Fetch all payments for all time (to get expected vs collected for ALL_TIME)
    const fetchAllTimePayments = async () => {
      try {
        const now = new Date();
        const response = await getLandlordPaymentsRequest({
          year: now.getFullYear(),
          scope: 'all',
        });
        setAllTimePayments(response.data.payments || []);
      } catch (error: any) {
        console.error('Error fetching all time payments:', error);
      }
    };
    fetchAllTimePayments();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllAnalyticsData();
    // Also refresh monthly payments
    try {
      const now = new Date();
      const [monthlyResponse, allTimeResponse] = await Promise.all([
        getLandlordPaymentsRequest({
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          scope: 'month',
        }),
        getLandlordPaymentsRequest({
          year: now.getFullYear(),
          scope: 'all',
        }),
      ]);
      setMonthlyPayments(monthlyResponse.data.payments || []);
      setAllTimePayments(allTimeResponse.data.payments || []);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
    }
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

  // Get all payments including unpaid for Payment Breakdown table
  const allPaymentsForTable = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    // If viewing THIS_MONTH, combine paid payments from analytics with unpaid from monthlyPayments
    if (dateRangePreset === 'THIS_MONTH') {
      // Get paid payments from filteredPayments
      const paidPayments = filteredPayments.map(p => ({
        paymentId: p.paymentId,
        amount: p.amount,
        paidAt: p.paidAt,
        dueDate: p.paidAt, // Use paidAt as dueDate for paid payments
        method: p.method,
        timingStatus: p.timingStatus,
        status: 'PAID' as const,
        propertyId: p.propertyId,
        propertyTitle: p.propertyTitle,
        unitId: p.unitId,
        unitLabel: p.unitLabel,
        tenantId: p.tenantId,
        tenantName: p.tenantName,
        tenantEmail: p.tenantEmail,
        leaseId: p.leaseId,
      }));

      // Get unpaid payments from monthlyPayments
      let unpaidPayments = monthlyPayments.filter(p => {
        if (p.status !== 'PENDING') return false;
        if (!p.dueDate) return false;
        const dueDate = new Date(p.dueDate);
        return dueDate >= monthStart && dueDate <= monthEnd;
      });

      // Apply filters
      if (filterType === 'PROPERTY' && selectedPropertyId) {
        unpaidPayments = unpaidPayments.filter(p => 
          p.lease?.property?.id === selectedPropertyId
        );
      } else if (filterType === 'UNIT' && selectedUnitId) {
        unpaidPayments = unpaidPayments.filter(p => 
          p.lease?.unit?.id === selectedUnitId
        );
      }

      // Convert unpaid payments to table format
      const unpaidForTable = unpaidPayments.map(p => ({
        paymentId: p.id,
        amount: p.amount,
        paidAt: null,
        dueDate: p.dueDate,
        method: null,
        timingStatus: null,
        status: 'PENDING' as const,
        propertyId: p.lease?.property?.id || '',
        propertyTitle: p.lease?.property?.title || 'Unknown',
        unitId: p.lease?.unit?.id || '',
        unitLabel: p.lease?.unit?.label || 'Unknown',
        tenantId: p.lease?.tenant?.id || '',
        tenantName: p.lease?.tenant ? `${p.lease.tenant.firstName} ${p.lease.tenant.lastName}` : 'Unknown',
        tenantEmail: p.lease?.tenant?.email || 'Unknown',
        leaseId: p.leaseId || p.lease?.id || '',
      }));

      // Combine and sort by date (dueDate for unpaid, paidAt for paid)
      const combined = [...paidPayments, ...unpaidForTable].sort((a, b) => {
        const dateA = a.paidAt ? new Date(a.paidAt) : new Date(a.dueDate);
        const dateB = b.paidAt ? new Date(b.paidAt) : new Date(b.dueDate);
        return dateB.getTime() - dateA.getTime();
      });

      return combined;
    }

    // If viewing THIS_YEAR, combine paid payments from analytics with unpaid from monthlyPayments
    if (dateRangePreset === 'THIS_YEAR') {
      const now = new Date();
      const yearStart = startOfYear(now);
      const yearEnd = endOfYear(now);
      
      // Get paid payments from filteredPayments
      const paidPayments = filteredPayments.map(p => ({
        paymentId: p.paymentId,
        amount: p.amount,
        paidAt: p.paidAt,
        dueDate: p.paidAt,
        method: p.method,
        timingStatus: p.timingStatus,
        status: 'PAID' as const,
        propertyId: p.propertyId,
        propertyTitle: p.propertyTitle,
        unitId: p.unitId,
        unitLabel: p.unitLabel,
        tenantId: p.tenantId,
        tenantName: p.tenantName,
        tenantEmail: p.tenantEmail,
        leaseId: p.leaseId,
      }));

      // Get unpaid payments from monthlyPayments
      let unpaidPayments = monthlyPayments.filter(p => {
        if (p.status !== 'PENDING') return false;
        if (!p.dueDate) return false;
        const dueDate = new Date(p.dueDate);
        return dueDate >= yearStart && dueDate <= yearEnd;
      });

      // Apply filters
      if (filterType === 'PROPERTY' && selectedPropertyId) {
        unpaidPayments = unpaidPayments.filter(p => 
          p.lease?.property?.id === selectedPropertyId
        );
      } else if (filterType === 'UNIT' && selectedUnitId) {
        unpaidPayments = unpaidPayments.filter(p => 
          p.lease?.unit?.id === selectedUnitId
        );
      }

      // Convert unpaid payments to table format
      const unpaidForTable = unpaidPayments.map(p => ({
        paymentId: p.id,
        amount: p.amount,
        paidAt: null,
        dueDate: p.dueDate,
        method: null,
        timingStatus: null,
        status: 'PENDING' as const,
        propertyId: p.lease?.property?.id || '',
        propertyTitle: p.lease?.property?.title || 'Unknown',
        unitId: p.lease?.unit?.id || '',
        unitLabel: p.lease?.unit?.label || 'Unknown',
        tenantId: p.lease?.tenant?.id || '',
        tenantName: p.lease?.tenant ? `${p.lease.tenant.firstName} ${p.lease.tenant.lastName}` : 'Unknown',
        tenantEmail: p.lease?.tenant?.email || 'Unknown',
        leaseId: p.leaseId || p.lease?.id || '',
      }));

      // Combine and sort by date
      const combined = [...paidPayments, ...unpaidForTable].sort((a, b) => {
        const dateA = a.paidAt ? new Date(a.paidAt) : new Date(a.dueDate);
        const dateB = b.paidAt ? new Date(b.paidAt) : new Date(b.dueDate);
        return dateB.getTime() - dateA.getTime();
      });

      return combined;
    }

    // If viewing ALL_TIME, combine paid payments from analytics with unpaid from allTimePayments
    if (dateRangePreset === 'ALL_TIME') {
      // Get paid payments from filteredPayments
      const paidPayments = filteredPayments.map(p => ({
        paymentId: p.paymentId,
        amount: p.amount,
        paidAt: p.paidAt,
        dueDate: p.paidAt,
        method: p.method,
        timingStatus: p.timingStatus,
        status: 'PAID' as const,
        propertyId: p.propertyId,
        propertyTitle: p.propertyTitle,
        unitId: p.unitId,
        unitLabel: p.unitLabel,
        tenantId: p.tenantId,
        tenantName: p.tenantName,
        tenantEmail: p.tenantEmail,
        leaseId: p.leaseId,
      }));

      // Get unpaid payments from allTimePayments
      let unpaidPayments = allTimePayments.filter(p => p.status === 'PENDING');

      // Apply filters
      if (filterType === 'PROPERTY' && selectedPropertyId) {
        unpaidPayments = unpaidPayments.filter(p => 
          p.lease?.property?.id === selectedPropertyId
        );
      } else if (filterType === 'UNIT' && selectedUnitId) {
        unpaidPayments = unpaidPayments.filter(p => 
          p.lease?.unit?.id === selectedUnitId
        );
      }

      // Convert unpaid payments to table format
      const unpaidForTable = unpaidPayments.map(p => ({
        paymentId: p.id,
        amount: p.amount,
        paidAt: null,
        dueDate: p.dueDate,
        method: null,
        timingStatus: null,
        status: 'PENDING' as const,
        propertyId: p.lease?.property?.id || '',
        propertyTitle: p.lease?.property?.title || 'Unknown',
        unitId: p.lease?.unit?.id || '',
        unitLabel: p.lease?.unit?.label || 'Unknown',
        tenantId: p.lease?.tenant?.id || '',
        tenantName: p.lease?.tenant ? `${p.lease.tenant.firstName} ${p.lease.tenant.lastName}` : 'Unknown',
        tenantEmail: p.lease?.tenant?.email || 'Unknown',
        leaseId: p.leaseId || p.lease?.id || '',
      }));

      // Combine and sort by date
      const combined = [...paidPayments, ...unpaidForTable].sort((a, b) => {
        const dateA = a.paidAt ? new Date(a.paidAt) : new Date(a.dueDate);
        const dateB = b.paidAt ? new Date(b.paidAt) : new Date(b.dueDate);
        return dateB.getTime() - dateA.getTime();
      });

      return combined;
    }

    // For other periods, only show paid payments (from analytics)
    return filteredPayments.map(p => ({
      paymentId: p.paymentId,
      amount: p.amount,
      paidAt: p.paidAt,
      dueDate: p.paidAt,
      method: p.method,
      timingStatus: p.timingStatus,
      status: 'PAID' as const,
      propertyId: p.propertyId,
      propertyTitle: p.propertyTitle,
      unitId: p.unitId,
      unitLabel: p.unitLabel,
      tenantId: p.tenantId,
      tenantName: p.tenantName,
      tenantEmail: p.tenantEmail,
      leaseId: p.leaseId,
    }));
  }, [filteredPayments, monthlyPayments, allTimePayments, dateRangePreset, filterType, selectedPropertyId, selectedUnitId]);

  // Payment Status Distribution Data - includes unpaid for THIS_MONTH, THIS_YEAR, and ALL_TIME
  const paymentStatusData = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);
    
    // Get paid payments from filteredPayments
    let paidPayments = filteredPayments;
    
    // Get unpaid payments if viewing THIS_MONTH, THIS_YEAR, or ALL_TIME
    let unpaidCount = 0;
    if (dateRangePreset === 'THIS_MONTH' || dateRangePreset === 'THIS_YEAR') {
      let filteredUnpaid = monthlyPayments.filter(p => {
        if (p.status !== 'PENDING') return false;
        if (!p.dueDate) return false;
        const dueDate = new Date(p.dueDate);
        
        if (dateRangePreset === 'THIS_MONTH') {
          return dueDate >= monthStart && dueDate <= monthEnd;
        } else {
          return dueDate >= yearStart && dueDate <= yearEnd;
        }
      });
      
      // Apply filters
      if (filterType === 'PROPERTY' && selectedPropertyId) {
        filteredUnpaid = filteredUnpaid.filter(p => 
          p.lease?.property?.id === selectedPropertyId
        );
      } else if (filterType === 'UNIT' && selectedUnitId) {
        filteredUnpaid = filteredUnpaid.filter(p => 
          p.lease?.unit?.id === selectedUnitId
        );
      }
      
      unpaidCount = filteredUnpaid.length;
    } else if (dateRangePreset === 'ALL_TIME') {
      // For ALL_TIME, get unpaid payments from allTimePayments
      let filteredUnpaid = allTimePayments.filter(p => p.status === 'PENDING');
      
      // Apply filters
      if (filterType === 'PROPERTY' && selectedPropertyId) {
        filteredUnpaid = filteredUnpaid.filter(p => 
          p.lease?.property?.id === selectedPropertyId
        );
      } else if (filterType === 'UNIT' && selectedUnitId) {
        filteredUnpaid = filteredUnpaid.filter(p => 
          p.lease?.unit?.id === selectedUnitId
        );
      }
      
      unpaidCount = filteredUnpaid.length;
    }
    
    const onTime = paidPayments.filter(p => p && p.timingStatus === 'ONTIME').length;
    const late = paidPayments.filter(p => p && p.timingStatus === 'LATE').length;
    const advance = paidPayments.filter(p => p && p.timingStatus === 'ADVANCE').length;
    
    const result = [
      { name: 'On Time', value: onTime, color: 'hsl(142, 76%, 36%)' },
      { name: 'Late', value: late, color: 'hsl(0, 84%, 60%)' },
      { name: 'Advance', value: advance, color: 'hsl(217, 91%, 60%)' },
    ];
    
    // Add unpaid if viewing THIS_MONTH, THIS_YEAR, or ALL_TIME
    if ((dateRangePreset === 'THIS_MONTH' || dateRangePreset === 'THIS_YEAR' || dateRangePreset === 'ALL_TIME') && unpaidCount > 0) {
      result.push({ name: 'Pending', value: unpaidCount, color: 'hsl(45, 93%, 47%)' });
    }
    
    return result.filter(item => item.value > 0);
  }, [filteredPayments, monthlyPayments, allTimePayments, dateRangePreset, filterType, selectedPropertyId, selectedUnitId]);

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
    pending: { label: 'Pending', color: 'hsl(45, 93%, 47%)' },
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

  // Calculate collected vs expected this month
  const monthlyStats = useMemo(() => {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    // Filter payments based on current filters
    let filteredPayments = monthlyPayments;
    
    if (filterType === 'PROPERTY' && selectedPropertyId) {
      filteredPayments = filteredPayments.filter(p => 
        p.lease?.property?.id === selectedPropertyId
      );
    } else if (filterType === 'UNIT' && selectedUnitId) {
      filteredPayments = filteredPayments.filter(p => 
        p.lease?.unit?.id === selectedUnitId
      );
    }
    
    // Filter to only payments due this month
    const thisMonthPayments = filteredPayments.filter(p => {
      if (!p.dueDate) return false;
      const dueDate = new Date(p.dueDate);
      return dueDate >= monthStart && dueDate <= monthEnd;
    });
    
    // Calculate collected (paid payments)
    const paidPayments = thisMonthPayments.filter(p => p.status === 'PAID');
    const collected = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    // Calculate expected (all payments due this month)
    const expected = thisMonthPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    // Breakdown by status
    const paidOnTime = paidPayments.filter(p => p.timingStatus === 'ONTIME').length;
    const paidLate = paidPayments.filter(p => p.timingStatus === 'LATE').length;
    const paidAdvance = paidPayments.filter(p => p.timingStatus === 'ADVANCE').length;
    const paidNoTiming = paidPayments.filter(p => !p.timingStatus || p.timingStatus === null).length;
    const unpaid = thisMonthPayments.filter(p => p.status === 'PENDING').length;
    const unpaidAmount = thisMonthPayments
      .filter(p => p.status === 'PENDING')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    return {
      collected,
      expected,
      unpaidAmount,
      breakdown: {
        paidOnTime,
        paidLate,
        paidAdvance,
        paidNoTiming,
        unpaid,
      },
    };
  }, [monthlyPayments, filterType, selectedPropertyId, selectedUnitId]);

  // Calculate collected vs expected this year
  const yearlyStats = useMemo(() => {
    const now = new Date();
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);
    
    // Filter payments based on current filters
    let filteredPayments = monthlyPayments;
    
    if (filterType === 'PROPERTY' && selectedPropertyId) {
      filteredPayments = filteredPayments.filter(p => 
        p.lease?.property?.id === selectedPropertyId
      );
    } else if (filterType === 'UNIT' && selectedUnitId) {
      filteredPayments = filteredPayments.filter(p => 
        p.lease?.unit?.id === selectedUnitId
      );
    }
    
    // Filter to only payments due this year
    const thisYearPayments = filteredPayments.filter(p => {
      if (!p.dueDate) return false;
      const dueDate = new Date(p.dueDate);
      return dueDate >= yearStart && dueDate <= yearEnd;
    });
    
    // Calculate collected (paid payments)
    const paidPayments = thisYearPayments.filter(p => p.status === 'PAID');
    const collected = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    // Calculate expected (all payments due this year)
    const expected = thisYearPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    // Breakdown by status
    const paidOnTime = paidPayments.filter(p => p.timingStatus === 'ONTIME').length;
    const paidLate = paidPayments.filter(p => p.timingStatus === 'LATE').length;
    const paidAdvance = paidPayments.filter(p => p.timingStatus === 'ADVANCE').length;
    const paidNoTiming = paidPayments.filter(p => !p.timingStatus || p.timingStatus === null).length;
    const unpaid = thisYearPayments.filter(p => p.status === 'PENDING').length;
    const unpaidAmount = thisYearPayments
      .filter(p => p.status === 'PENDING')
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    
    return {
      collected,
      expected,
      unpaidAmount,
      breakdown: {
        paidOnTime,
        paidLate,
        paidAdvance,
        paidNoTiming,
        unpaid,
      },
    };
  }, [monthlyPayments, filterType, selectedPropertyId, selectedUnitId]);

  // Calculate collected vs expected all time
  const allTimeStats = useMemo(() => {
    // Get all time payments from analytics data (paid)
    const allTimeData = analyticsData.allTime;
    let paidPayments: any[] = [];
    if (allTimeData && allTimeData.paymentBreakdown) {
      paidPayments = Array.isArray(allTimeData.paymentBreakdown) 
        ? allTimeData.paymentBreakdown 
        : [];
      
      // Apply filters
      if (filterType === 'PROPERTY' && selectedPropertyId) {
        paidPayments = paidPayments.filter(p => p && p.propertyId === selectedPropertyId);
      } else if (filterType === 'UNIT' && selectedUnitId) {
        paidPayments = paidPayments.filter(p => p && p.unitId === selectedUnitId);
      }
    }
    
    // Get unpaid payments from allTimePayments
    let unpaidPayments = allTimePayments.filter(p => p.status === 'PENDING');
    
    // Apply filters to unpaid payments
    if (filterType === 'PROPERTY' && selectedPropertyId) {
      unpaidPayments = unpaidPayments.filter(p => 
        p.lease?.property?.id === selectedPropertyId
      );
    } else if (filterType === 'UNIT' && selectedUnitId) {
      unpaidPayments = unpaidPayments.filter(p => 
        p.lease?.unit?.id === selectedUnitId
      );
    }
    
    // Calculate collected (paid payments)
    const collected = paidPayments.reduce((sum, p) => sum + (p?.amount || 0), 0);
    
    // Calculate expected (all payments: paid + unpaid)
    const expected = collected + unpaidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    // Breakdown by status
    const paidOnTime = paidPayments.filter(p => p && p.timingStatus === 'ONTIME').length;
    const paidLate = paidPayments.filter(p => p && p.timingStatus === 'LATE').length;
    const paidAdvance = paidPayments.filter(p => p && p.timingStatus === 'ADVANCE').length;
    const paidNoTiming = paidPayments.filter(p => p && (!p.timingStatus || p.timingStatus === null)).length;
    const unpaid = unpaidPayments.length;
    const unpaidAmount = unpaidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    return {
      collected,
      expected,
      unpaidAmount,
      breakdown: {
        paidOnTime,
        paidLate,
        paidAdvance,
        paidNoTiming,
        unpaid,
      },
    };
  }, [analyticsData.allTime, allTimePayments, filterType, selectedPropertyId, selectedUnitId]);

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

      // Get unpaid payments for THIS_MONTH, THIS_YEAR, and ALL_TIME
      let pdfUnpaidPayments: Array<{
        paymentId: string;
        amount: number;
        paidAt: string | null;
        dueDate: string;
        method: string | null;
        timingStatus: string | null;
        status: 'PENDING';
        propertyId: string;
        propertyTitle: string;
        unitId: string;
        unitLabel: string;
        tenantId: string;
        tenantName: string;
        tenantEmail: string;
        leaseId: string;
      }> = [];

      if (pdfDateRangePreset === 'THIS_MONTH' || pdfDateRangePreset === 'THIS_YEAR' || pdfDateRangePreset === 'ALL_TIME') {
        let filteredUnpaid: typeof monthlyPayments = [];
        
        if (pdfDateRangePreset === 'ALL_TIME') {
          filteredUnpaid = allTimePayments.filter(p => p.status === 'PENDING');
        } else {
          const now = new Date();
          const monthStart = startOfMonth(now);
          const monthEnd = endOfMonth(now);
          const yearStart = startOfYear(now);
          const yearEnd = endOfYear(now);
          
          filteredUnpaid = monthlyPayments.filter(p => {
            if (p.status !== 'PENDING') return false;
            if (!p.dueDate) return false;
            const dueDate = new Date(p.dueDate);
            
            if (pdfDateRangePreset === 'THIS_MONTH') {
              return dueDate >= monthStart && dueDate <= monthEnd;
            } else {
              return dueDate >= yearStart && dueDate <= yearEnd;
            }
          });
        }
        
        // Apply filters
        if (pdfFilterType === 'PROPERTY' && pdfSelectedPropertyId) {
          filteredUnpaid = filteredUnpaid.filter(p => 
            p.lease?.property?.id === pdfSelectedPropertyId
          );
        } else if (pdfFilterType === 'UNIT' && pdfSelectedUnitId) {
          filteredUnpaid = filteredUnpaid.filter(p => 
            p.lease?.unit?.id === pdfSelectedUnitId
          );
        }
        
        // Convert to table format
        pdfUnpaidPayments = filteredUnpaid.map(p => ({
          paymentId: p.id,
          amount: p.amount,
          paidAt: null,
          dueDate: p.dueDate,
          method: null,
          timingStatus: null,
          status: 'PENDING' as const,
          propertyId: p.lease?.property?.id || '',
          propertyTitle: p.lease?.property?.title || 'Unknown',
          unitId: p.lease?.unit?.id || '',
          unitLabel: p.lease?.unit?.label || 'Unknown',
          tenantId: p.lease?.tenant?.id || '',
          tenantName: p.lease?.tenant ? `${p.lease.tenant.firstName} ${p.lease.tenant.lastName}` : 'Unknown',
          tenantEmail: p.lease?.tenant?.email || 'Unknown',
          leaseId: p.leaseId || p.lease?.id || '',
        }));
      }

      // Combine paid and unpaid payments for PDF table
      const pdfAllPayments = [
        ...pdfPayments.map(p => ({
          paymentId: p.paymentId,
          amount: p.amount,
          paidAt: p.paidAt,
          dueDate: p.paidAt,
          method: p.method,
          timingStatus: p.timingStatus,
          status: 'PAID' as const,
          propertyId: p.propertyId,
          propertyTitle: p.propertyTitle,
          unitId: p.unitId,
          unitLabel: p.unitLabel,
          tenantId: p.tenantId,
          tenantName: p.tenantName,
          tenantEmail: p.tenantEmail,
          leaseId: p.leaseId,
        })),
        ...pdfUnpaidPayments,
      ].sort((a, b) => {
        const dateA = a.paidAt ? new Date(a.paidAt) : new Date(a.dueDate);
        const dateB = b.paidAt ? new Date(b.paidAt) : new Date(b.dueDate);
        return dateB.getTime() - dateA.getTime();
      });

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
      doc.text(`Total Payments: ${pdfAllPayments.length} (${pdfPayments.length} paid, ${pdfUnpaidPayments.length} pending)`, 14, yPosition);
      yPosition += 6;
      
      // Add collected vs expected for THIS_MONTH, THIS_YEAR, and ALL_TIME
      if (pdfDateRangePreset === 'THIS_MONTH' || pdfDateRangePreset === 'THIS_YEAR' || pdfDateRangePreset === 'ALL_TIME') {
        const now = new Date();
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        const yearStart = startOfYear(now);
        const yearEnd = endOfYear(now);
        
        let pdfCollected = 0;
        let pdfExpected = 0;
        let pdfUnpaidAmount = 0;
        let periodLabel = '';
        
        if (pdfDateRangePreset === 'ALL_TIME') {
          // Get paid payments from analytics
          let paidPayments = pdfPayments;
          pdfCollected = paidPayments.reduce((sum, p) => sum + (p?.amount || 0), 0);
          
          // Get unpaid payments from allTimePayments
          let unpaidPayments = allTimePayments.filter(p => p.status === 'PENDING');
          
          // Apply filters
          if (pdfFilterType === 'PROPERTY' && pdfSelectedPropertyId) {
            unpaidPayments = unpaidPayments.filter(p => 
              p.lease?.property?.id === pdfSelectedPropertyId
            );
          } else if (pdfFilterType === 'UNIT' && pdfSelectedUnitId) {
            unpaidPayments = unpaidPayments.filter(p => 
              p.lease?.unit?.id === pdfSelectedUnitId
            );
          }
          
          pdfUnpaidAmount = unpaidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
          pdfExpected = pdfCollected + pdfUnpaidAmount;
          periodLabel = 'All Time';
        } else {
          let pdfMonthlyPayments = monthlyPayments;
          if (pdfFilterType === 'PROPERTY' && pdfSelectedPropertyId) {
            pdfMonthlyPayments = pdfMonthlyPayments.filter(p => 
              p.lease?.property?.id === pdfSelectedPropertyId
            );
          } else if (pdfFilterType === 'UNIT' && pdfSelectedUnitId) {
            pdfMonthlyPayments = pdfMonthlyPayments.filter(p => 
              p.lease?.unit?.id === pdfSelectedUnitId
            );
          }
          
          const periodPayments = pdfMonthlyPayments.filter(p => {
            if (!p.dueDate) return false;
            const dueDate = new Date(p.dueDate);
            if (pdfDateRangePreset === 'THIS_MONTH') {
              return dueDate >= monthStart && dueDate <= monthEnd;
            } else {
              return dueDate >= yearStart && dueDate <= yearEnd;
            }
          });
          
          const paidPayments = periodPayments.filter(p => p.status === 'PAID');
          pdfCollected = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
          pdfExpected = periodPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
          pdfUnpaidAmount = periodPayments
            .filter(p => p.status === 'PENDING')
            .reduce((sum, p) => sum + (p.amount || 0), 0);
          
          periodLabel = pdfDateRangePreset === 'THIS_MONTH' ? 'This Month' : 'This Year';
        }
        
        doc.text(`Collected ${periodLabel}: ${formatCurrencyForPDF(pdfCollected)}`, 14, yPosition);
        yPosition += 6;
        doc.text(`Expected ${periodLabel}: ${formatCurrencyForPDF(pdfExpected)}`, 14, yPosition);
        yPosition += 6;
        if (pdfExpected > 0) {
          const collectionRate = ((pdfCollected / pdfExpected) * 100).toFixed(1);
          doc.text(`Collection Rate: ${collectionRate}%`, 14, yPosition);
          yPosition += 6;
        }
        if (pdfUnpaidAmount > 0) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(200, 0, 0);
          doc.text(`Outstanding: ${formatCurrencyForPDF(pdfUnpaidAmount)}`, 14, yPosition);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'normal');
          yPosition += 6;
        }
      }
        
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

      // Payment Breakdown Table - includes unpaid payments
      if (pdfAllPayments.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Payment Breakdown', 14, yPosition);
        yPosition += 8;

        const tableData = pdfAllPayments.map(payment => {
          const tenantName = (payment.tenantName || 'Unknown').length > 20 
            ? (payment.tenantName || 'Unknown').substring(0, 17) + '...' 
            : (payment.tenantName || 'Unknown');
          const propertyTitle = (payment.propertyTitle || 'Unknown').length > 25
            ? (payment.propertyTitle || 'Unknown').substring(0, 22) + '...'
            : (payment.propertyTitle || 'Unknown');
          const unitLabel = (payment.unitLabel || 'Unknown').length > 15
            ? (payment.unitLabel || 'Unknown').substring(0, 12) + '...'
            : (payment.unitLabel || 'Unknown');
          
          const dateStr = payment.paidAt 
            ? format(new Date(payment.paidAt), 'MMM dd, yyyy')
            : payment.dueDate 
              ? format(new Date(payment.dueDate), 'MMM dd, yyyy')
              : '-';
          
          let statusStr = '-';
          if (payment.status === 'PENDING') {
            statusStr = 'Pending';
          } else if (payment.timingStatus === 'ONTIME') {
            statusStr = 'On Time';
          } else if (payment.timingStatus === 'LATE') {
            statusStr = 'Late';
          } else if (payment.timingStatus === 'ADVANCE') {
            statusStr = 'Advance';
          } else if (payment.status === 'PAID') {
            statusStr = 'Paid';
          }
          
          return [
            dateStr,
            tenantName,
            propertyTitle,
            unitLabel,
            formatCurrencyForPDF(payment.amount || 0),
            statusStr,
          ];
        });

        const availableWidth = pageWidth - 28;

        autoTable(doc, {
          startY: yPosition,
          head: [['Date', 'Tenant', 'Property', 'Unit', 'Amount (PHP)', 'Status']],
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
            0: { cellWidth: 30 },
            1: { cellWidth: 40 },
            2: { cellWidth: 45 },
            3: { cellWidth: 32 },
            4: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
            5: { cellWidth: 30, halign: 'center' },
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
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-500 to-indigo-600 shadow-lg flex-shrink-0"
                >
                  <BarChart3 className="h-7 w-7 text-white" />
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
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-blue-500 flex items-center justify-center">
                    <Calendar className="h-3 w-3 text-white" />
                  </div>
                  This Month • {selectedName || 'All Properties'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">Collected</p>
                    <p className="text-xl font-bold text-green-700">
                      {formatCurrency(monthlyStats.collected)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600 mb-0.5">Expected</p>
                    <p className="text-xl font-bold text-amber-700">
                      {formatCurrency(monthlyStats.expected)}
                    </p>
                  </div>
                </div>
                {monthlyStats.expected > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-gray-600">Collection Rate</span>
                      <span className="text-xs font-bold text-blue-700">
                        {((monthlyStats.collected / monthlyStats.expected) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full transition-all"
                        style={{
                          width: `${Math.min((monthlyStats.collected / monthlyStats.expected) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    {monthlyStats.unpaidAmount > 0 && (
                      <div className="mt-1.5 text-xs text-red-600">
                        Outstanding: {formatCurrency(monthlyStats.unpaidAmount)}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {dateRangePreset === 'THIS_YEAR' && (
            <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-emerald-500 flex items-center justify-center">
                    <Calendar className="h-3 w-3 text-white" />
                  </div>
                  This Year • {selectedName || 'All Properties'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">Collected</p>
                    <p className="text-xl font-bold text-green-700">
                      {formatCurrency(yearlyStats.collected)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600 mb-0.5">Expected</p>
                    <p className="text-xl font-bold text-amber-700">
                      {formatCurrency(yearlyStats.expected)}
                    </p>
                  </div>
                </div>
                {yearlyStats.expected > 0 && (
                  <div className="mt-3 pt-3 border-t border-emerald-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-gray-600">Collection Rate</span>
                      <span className="text-xs font-bold text-blue-700">
                        {((yearlyStats.collected / yearlyStats.expected) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full transition-all"
                        style={{
                          width: `${Math.min((yearlyStats.collected / yearlyStats.expected) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    {yearlyStats.unpaidAmount > 0 && (
                      <div className="mt-1.5 text-xs text-red-600">
                        Outstanding: {formatCurrency(yearlyStats.unpaidAmount)}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {dateRangePreset === 'ALL_TIME' && (
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-purple-500 flex items-center justify-center">
                    <Calendar className="h-3 w-3 text-white" />
                  </div>
                  All Time • {selectedName || 'All Properties'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">Collected</p>
                    <p className="text-xl font-bold text-green-700">
                      {formatCurrency(allTimeStats.collected)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-600 mb-0.5">Expected</p>
                    <p className="text-xl font-bold text-amber-700">
                      {formatCurrency(allTimeStats.expected)}
                    </p>
                  </div>
                </div>
                {allTimeStats.expected > 0 && (
                  <div className="mt-3 pt-3 border-t border-purple-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-gray-600">Collection Rate</span>
                      <span className="text-xs font-bold text-blue-700">
                        {((allTimeStats.collected / allTimeStats.expected) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-1.5 rounded-full transition-all"
                        style={{
                          width: `${Math.min((allTimeStats.collected / allTimeStats.expected) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    {allTimeStats.unpaidAmount > 0 && (
                      <div className="mt-1.5 text-xs text-red-600">
                        Outstanding: {formatCurrency(allTimeStats.unpaidAmount)}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Charts Section */}
      {analyticsData.allTime && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Collected vs Expected Comparison - Show for THIS_MONTH, THIS_YEAR, and ALL_TIME */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {dateRangePreset === 'THIS_MONTH' && 'Collected vs Expected This Month'}
                  {dateRangePreset === 'THIS_YEAR' && 'Collected vs Expected This Year'}
                  {dateRangePreset === 'ALL_TIME' && 'Total Collected (All Time)'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {dateRangePreset === 'THIS_MONTH' && `Comparison of collected and expected payments for ${format(new Date(), 'MMMM yyyy')}`}
                  {dateRangePreset === 'THIS_YEAR' && `Comparison of collected and expected payments for ${new Date().getFullYear()}`}
                  {dateRangePreset === 'ALL_TIME' && 'Total collected payments across all time'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                      <p className="text-xs font-medium text-gray-600 mb-1">Collected</p>
                      <p className="text-2xl font-bold text-green-700">
                        {formatCurrency(
                          dateRangePreset === 'THIS_MONTH' ? monthlyStats.collected :
                          dateRangePreset === 'THIS_YEAR' ? yearlyStats.collected :
                          allTimeStats.collected
                        )}
                      </p>
                      {(dateRangePreset === 'THIS_MONTH' ? monthlyStats.expected :
                        dateRangePreset === 'THIS_YEAR' ? yearlyStats.expected :
                        allTimeStats.expected) > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {(((dateRangePreset === 'THIS_MONTH' ? monthlyStats.collected :
                            dateRangePreset === 'THIS_YEAR' ? yearlyStats.collected :
                            allTimeStats.collected) / (dateRangePreset === 'THIS_MONTH' ? monthlyStats.expected :
                            dateRangePreset === 'THIS_YEAR' ? yearlyStats.expected :
                            allTimeStats.expected)) * 100).toFixed(1)}% of expected
                        </p>
                      )}
                    </div>
                    <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                      <p className="text-xs font-medium text-gray-600 mb-1">Expected</p>
                      <p className="text-2xl font-bold text-amber-700">
                        {formatCurrency(
                          dateRangePreset === 'THIS_MONTH' ? monthlyStats.expected :
                          dateRangePreset === 'THIS_YEAR' ? yearlyStats.expected :
                          allTimeStats.expected
                        )}
                      </p>
                      {(dateRangePreset === 'THIS_MONTH' ? monthlyStats.unpaidAmount :
                        dateRangePreset === 'THIS_YEAR' ? yearlyStats.unpaidAmount :
                        allTimeStats.unpaidAmount) > 0 && (
                        <p className="text-xs text-red-600 mt-1">
                          {formatCurrency(
                            dateRangePreset === 'THIS_MONTH' ? monthlyStats.unpaidAmount :
                            dateRangePreset === 'THIS_YEAR' ? yearlyStats.unpaidAmount :
                            allTimeStats.unpaidAmount
                          )} outstanding
                        </p>
                      )}
                    </div>
                  </div>
                  {(dateRangePreset === 'THIS_MONTH' ? monthlyStats.expected :
                    dateRangePreset === 'THIS_YEAR' ? yearlyStats.expected :
                    allTimeStats.expected) > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-gray-600">Collection Progress</span>
                        <span className="font-bold text-blue-700">
                          {(((dateRangePreset === 'THIS_MONTH' ? monthlyStats.collected :
                            dateRangePreset === 'THIS_YEAR' ? yearlyStats.collected :
                            allTimeStats.collected) / (dateRangePreset === 'THIS_MONTH' ? monthlyStats.expected :
                            dateRangePreset === 'THIS_YEAR' ? yearlyStats.expected :
                            allTimeStats.expected)) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all"
                          style={{
                            width: `${Math.min(((dateRangePreset === 'THIS_MONTH' ? monthlyStats.collected :
                              dateRangePreset === 'THIS_YEAR' ? yearlyStats.collected :
                              allTimeStats.collected) / (dateRangePreset === 'THIS_MONTH' ? monthlyStats.expected :
                              dateRangePreset === 'THIS_YEAR' ? yearlyStats.expected :
                              allTimeStats.expected)) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {dateRangePreset === 'ALL_TIME' && (allTimeStats.breakdown.paidOnTime + allTimeStats.breakdown.paidLate + allTimeStats.breakdown.paidAdvance + allTimeStats.breakdown.paidNoTiming + allTimeStats.breakdown.unpaid) > 0 && (
                    <div className="space-y-2 pt-2 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {allTimeStats.breakdown.paidOnTime > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">On Time:</span>
                            <span className="font-semibold text-green-700">{allTimeStats.breakdown.paidOnTime}</span>
                          </div>
                        )}
                        {allTimeStats.breakdown.paidAdvance > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Advance:</span>
                            <span className="font-semibold text-blue-700">{allTimeStats.breakdown.paidAdvance}</span>
                          </div>
                        )}
                        {allTimeStats.breakdown.paidLate > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Late:</span>
                            <span className="font-semibold text-red-700">{allTimeStats.breakdown.paidLate}</span>
                          </div>
                        )}
                        {allTimeStats.breakdown.paidNoTiming > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">No Status:</span>
                            <span className="font-semibold text-gray-700">{allTimeStats.breakdown.paidNoTiming}</span>
                          </div>
                        )}
                        {allTimeStats.breakdown.unpaid > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Pending:</span>
                            <span className="font-semibold text-yellow-700">{allTimeStats.breakdown.unpaid}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Status Distribution Chart - Always show */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Payment Status Distribution</CardTitle>
                <CardDescription className="text-xs">
                  Breakdown of payments by timing status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paymentStatusData.length > 0 ? (
                  <ChartContainer config={paymentStatusChartConfig} className="h-[250px] w-full">
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
                  <div className="flex items-center justify-center h-[250px] text-sm text-gray-500">
                    No payment status data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payments Over Time Chart - Standalone */}
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
        </>
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
            {allPaymentsForTable.length === 0 ? (
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
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allPaymentsForTable.map((payment) => (
                      <TableRow 
                        key={payment.paymentId}
                        className="cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          if (payment.leaseId) {
                            navigate(`/landlord/leases/${payment.leaseId}/details`);
                          }
                        }}
                      >
                        <TableCell className="font-medium">
                          {payment.paidAt 
                            ? format(new Date(payment.paidAt), 'MMM dd, yyyy')
                            : payment.dueDate 
                              ? format(new Date(payment.dueDate), 'MMM dd, yyyy')
                              : '-'}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{payment.tenantName}</div>
                            <div className="text-xs text-gray-500">{payment.tenantEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>{payment.propertyTitle}</TableCell>
                        <TableCell>{payment.unitLabel}</TableCell>
                        <TableCell className={`font-semibold ${payment.status === 'PAID' ? 'text-green-600' : 'text-gray-600'}`}>
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          {payment.status === 'PENDING' ? (
                            <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                          ) : payment.timingStatus === 'ONTIME' ? (
                            <Badge className="bg-green-100 text-green-800">On Time</Badge>
                          ) : payment.timingStatus === 'LATE' ? (
                            <Badge className="bg-red-100 text-red-800">Late</Badge>
                          ) : payment.timingStatus === 'ADVANCE' ? (
                            <Badge className="bg-blue-100 text-blue-800">Advance</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">Paid</Badge>
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

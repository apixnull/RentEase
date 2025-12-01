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
  RefreshCcw, 
  Users, 
  LogIn, 
  Sparkles,
  BarChart3,
  Building2,
  Home,
  Ban,
  ShieldCheck,
  ShieldX,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { getUserAnalyticsRequest } from '@/api/admin/reportAnalyticsApi';

const loginsChartConfig = {
  logins: {
    label: 'Logins',
    color: 'hsl(199, 89%, 48%)', // Blue-600 - easier on the eyes
  },
} satisfies ChartConfig;

const usersCreatedChartConfig = {
  usersCreated: {
    label: 'Users Created',
    color: 'hsl(142, 71%, 45%)', // Green-600 - easier on the eyes
  },
} satisfies ChartConfig;

const UserAnalytics = () => {
  const [usersData, setUsersData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const now = new Date();
  const [timeFilter, setTimeFilter] = useState<'month' | 'year' | 'all'>('month');
  const [showAllLogins, setShowAllLogins] = useState(false);
  const [showAllUsers, setShowAllUsers] = useState(false);

  // Reset showAll states when time filter changes
  useEffect(() => {
    setShowAllLogins(false);
    setShowAllUsers(false);
  }, [timeFilter]);

  // Fetch users analytics once (not dependent on period) - fetch all time for total metrics
  useEffect(() => {
    const controller = new AbortController();
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // Fetch users analytics for all time to get total metrics
        const usersResponse = await getUserAnalyticsRequest({ period: 'all_time', signal: controller.signal });
        
        if (usersResponse?.data) {
          setUsersData(usersResponse.data);
        }
      } catch (error: any) {
        if (error?.name === 'CanceledError') return;
        console.error('Error fetching initial data:', error);
        toast.error(error?.response?.data?.message || error?.response?.data?.error || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
    return () => controller.abort();
  }, []);

  // Fetch users analytics when filter changes
  useEffect(() => {
    const controller = new AbortController();
    const fetchAnalytics = async ({ silent = false } = {}) => {
      try {
        if (!silent) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
        const params: any = { signal: controller.signal };
        if (timeFilter === 'month') {
          params.month = now.getMonth() + 1;
          params.year = now.getFullYear();
        } else if (timeFilter === 'year') {
          params.year = now.getFullYear();
        } else if (timeFilter === 'all') {
          params.period = 'all_time';
        }
        const usersResponse = await getUserAnalyticsRequest(params);
        if (usersResponse?.data) {
          setUsersData(usersResponse.data);
        }
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
        const usersResponse = await getUserAnalyticsRequest(params);
        if (usersResponse?.data) {
          setUsersData(usersResponse.data);
        }
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

  // Calculate filtered metrics based on timeFilter
  const filteredMetrics = useMemo(() => {
    if (!usersData?.users) {
      return {
        totalUsers: 0,
        tenants: 0,
        landlords: 0,
        blocked: 0,
        verified: 0,
        notVerified: 0,
        totalLogins: usersData?.metrics?.totalLogins || 0,
        registeredThisMonth: 0,
        tenantsRegisteredThisMonth: 0,
        landlordsRegisteredThisMonth: 0,
      };
    }

    const users = usersData.users;
    let start: Date, end: Date;

    if (timeFilter === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (timeFilter === 'year') {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else {
      // All time - no date filter
      start = null as any;
      end = null as any;
    }

    // Filter users based on timeFilter
    const filteredUsers = start && end
      ? users.filter((u: any) => {
          const createdAt = new Date(u.createdAt);
          return createdAt >= start && createdAt <= end;
        })
      : users;

    // Calculate metrics from filtered users
    const tenants = filteredUsers.filter((u: any) => u.role === 'TENANT').length;
    const landlords = filteredUsers.filter((u: any) => u.role === 'LANDLORD').length;
    const totalUsers = tenants + landlords;
    const blocked = filteredUsers.filter((u: any) => u.isDisabled === true).length;
    const verified = filteredUsers.filter((u: any) => u.isVerified === true).length;
    const notVerified = filteredUsers.filter((u: any) => u.isVerified === false).length;

    // Calculate registered this month (always current month regardless of filter)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    const registeredThisMonth = users.filter((u: any) => {
      const createdAt = new Date(u.createdAt);
      return createdAt >= monthStart && createdAt <= monthEnd;
    }).length;
    const tenantsRegisteredThisMonth = users.filter((u: any) => {
      const createdAt = new Date(u.createdAt);
      return u.role === 'TENANT' && createdAt >= monthStart && createdAt <= monthEnd;
    }).length;
    const landlordsRegisteredThisMonth = users.filter((u: any) => {
      const createdAt = new Date(u.createdAt);
      return u.role === 'LANDLORD' && createdAt >= monthStart && createdAt <= monthEnd;
    }).length;

    return {
      totalUsers,
      tenants,
      landlords,
      blocked,
      verified,
      notVerified,
      totalLogins: usersData?.metrics?.totalLogins || 0,
      registeredThisMonth,
      tenantsRegisteredThisMonth,
      landlordsRegisteredThisMonth,
    };
  }, [usersData, timeFilter, now]);

  // Keep all-time metrics for PDF
  const allTimeMetrics = useMemo(() => {
    if (!usersData?.metrics) {
      return {
        totalUsers: 0,
        tenants: 0,
        landlords: 0,
        blocked: 0,
        verified: 0,
        notVerified: 0,
        totalLogins: 0,
      };
    }
    return usersData.metrics;
  }, [usersData]);

  // Calculate users created chart data (by day/month/year based on filter)
  const dailyUsersCreated = useMemo(() => {
    if (!usersData?.users) return [];
    
    const users = usersData.users; // API already excludes admins
    let start: Date, end: Date;
    
    // Filter users for the period
    const usersInPeriod = users;
    
    if (timeFilter === 'month') {
      // Current month - group by day
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      
      // Filter users to only include those created in the current month (not previous month's last day)
      const filteredUsers = usersInPeriod.filter((u: any) => {
        const createdAt = new Date(u.createdAt);
        // Only include if it's within the current month boundaries
        return createdAt >= start && createdAt <= end && 
               createdAt.getMonth() === now.getMonth() && 
               createdAt.getFullYear() === now.getFullYear();
      });
      
      // Group by day
      const dailyMap = new Map<string, number>();
      filteredUsers.forEach((u: any) => {
        const dateKey = new Date(u.createdAt).toISOString().split('T')[0];
        const current = dailyMap.get(dateKey) || 0;
        dailyMap.set(dateKey, current + 1);
      });
      
      // Fill in missing days with 0 (strictly within current month)
      const dailyData: Array<{ date: string; count: number }> = [];
      const currentDate = new Date(start);
      const currentMonthForUsers = now.getMonth();
      const currentYearForUsers = now.getFullYear();
      
      while (currentDate <= end) {
        // Double-check we're still in the current month
        const dateMonth = currentDate.getMonth();
        const dateYear = currentDate.getFullYear();
        if (dateMonth === currentMonthForUsers && dateYear === currentYearForUsers) {
          const dateKey = currentDate.toISOString().split('T')[0];
          dailyData.push({
            date: dateKey,
            count: dailyMap.get(dateKey) || 0,
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
        // Safety check: if we've moved to next month, break
        if (currentDate.getMonth() !== currentMonthForUsers || currentDate.getFullYear() !== currentYearForUsers) {
          break;
        }
      }
      
      // Final filter to ensure no dates outside current month
      return dailyData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === currentMonthForUsers && itemDate.getFullYear() === currentYearForUsers;
      });
    } else if (timeFilter === 'year') {
      // Current year - group by month
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      
      const filteredUsers = usersInPeriod.filter((u: any) => {
        const createdAt = new Date(u.createdAt);
        return createdAt >= start && createdAt <= end;
      });
      
      // Group by month (YYYY-MM format)
      const monthlyMap = new Map<string, number>();
      filteredUsers.forEach((u: any) => {
        const date = new Date(u.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
        const current = monthlyMap.get(monthKey) || 0;
        monthlyMap.set(monthKey, current + 1);
      });
      
      // Fill in missing months with 0
      const monthlyData: Array<{ date: string; count: number }> = [];
      for (let month = 0; month < 12; month++) {
        const date = new Date(now.getFullYear(), month, 1);
        const monthKey = `${date.getFullYear()}-${String(month + 1).padStart(2, '0')}-01`;
        monthlyData.push({
          date: monthKey,
          count: monthlyMap.get(monthKey) || 0,
        });
      }
      
      return monthlyData;
    } else {
      // All time - show exactly 5 years: current year and 4 years before
      const currentYear = now.getFullYear();
      const startYear = currentYear - 4; // 5 years total: startYear to currentYear
      
      // Group by year
      const yearlyMap = new Map<string, number>();
      usersInPeriod.forEach((u: any) => {
        const year = new Date(u.createdAt).getFullYear();
        // Only include years in our 5-year range
        if (year >= startYear && year <= currentYear) {
          const yearKey = `${year}-01-01`;
          const current = yearlyMap.get(yearKey) || 0;
          yearlyMap.set(yearKey, current + 1);
        }
      });
      
      // Fill in all 5 years with 0 if no data
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
  }, [usersData, timeFilter]);

  // Calculate total users created in period
  const totalUsersCreated = useMemo(() => {
    return dailyUsersCreated.reduce((sum, day) => sum + day.count, 0);
  }, [dailyUsersCreated]);

  // Get period label based on filter
  const periodLabel = useMemo(() => {
    if (timeFilter === 'month') return 'this month';
    if (timeFilter === 'year') return 'this year';
    return 'all time';
  }, [timeFilter]);

  // Get chart title based on filter
  const loginsChartTitle = useMemo(() => {
    if (timeFilter === 'month') return 'Daily Logins';
    if (timeFilter === 'year') return 'Monthly Logins';
    return 'Yearly Logins';
  }, [timeFilter]);

  // Download report function
  const handleDownloadReport = () => {
    const filteredTotal = processedLoginsData.reduce((sum: number, item: any) => sum + (item.count || 0), 0);
    
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
    doc.text('User Analytics Report', pageWidth / 2, yPos, { align: 'center' });
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
    doc.text('Summary Metrics', margin, yPos);
    yPos += 8;
    
    const summaryData = [
      ['Metric', 'Value'],
      [`Total Users (${periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1)})`, filteredMetrics.totalUsers.toString()],
      [`Total Tenants (${periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1)})`, filteredMetrics.tenants.toString()],
      [`Total Landlords (${periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1)})`, filteredMetrics.landlords.toString()],
      ['Total Logins (All Time)', allTimeMetrics.totalLogins.toString()],
      [`Total Logins (${periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1)})`, filteredTotal.toString()],
      [`Verified Users (${periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1)})`, filteredMetrics.verified.toString()],
      [`Not Verified Users (${periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1)})`, filteredMetrics.notVerified.toString()],
      [`Blocked Users (${periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1)})`, filteredMetrics.blocked.toString()],
      ['Registered This Month', filteredMetrics.registeredThisMonth.toString()],
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
    
    // User Type Breakdown
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('User Type Breakdown', margin, yPos);
    yPos += 8;
    
    const tenantPercentage = filteredMetrics.totalUsers > 0 ? ((filteredMetrics.tenants / filteredMetrics.totalUsers) * 100).toFixed(1) : '0.0';
    const landlordPercentage = filteredMetrics.totalUsers > 0 ? ((filteredMetrics.landlords / filteredMetrics.totalUsers) * 100).toFixed(1) : '0.0';
    
    const userTypeBreakdown = [
      ['User Type', 'Count', 'Percentage'],
      ['Tenants', filteredMetrics.tenants.toString(), `${tenantPercentage}%`],
      ['Landlords', filteredMetrics.landlords.toString(), `${landlordPercentage}%`],
      ['Total', filteredMetrics.totalUsers.toString(), '100.0%'],
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [userTypeBreakdown[0]],
      body: userTypeBreakdown.slice(1, -1),
      foot: [userTypeBreakdown[userTypeBreakdown.length - 1]],
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      footStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10 },
      margin: { left: margin, right: margin },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (yPos > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      yPos = margin;
    }
    
    // User Status Breakdown
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('User Status Breakdown', margin, yPos);
    yPos += 8;
    
    const verifiedPercentage = filteredMetrics.totalUsers > 0 ? ((filteredMetrics.verified / filteredMetrics.totalUsers) * 100).toFixed(1) : '0.0';
    const notVerifiedPercentage = filteredMetrics.totalUsers > 0 ? ((filteredMetrics.notVerified / filteredMetrics.totalUsers) * 100).toFixed(1) : '0.0';
    const blockedPercentage = filteredMetrics.totalUsers > 0 ? ((filteredMetrics.blocked / filteredMetrics.totalUsers) * 100).toFixed(1) : '0.0';
    
    const userStatusBreakdown = [
      ['Status', 'Count', 'Percentage'],
      ['Verified', filteredMetrics.verified.toString(), `${verifiedPercentage}%`],
      ['Not Verified', filteredMetrics.notVerified.toString(), `${notVerifiedPercentage}%`],
      ['Blocked', filteredMetrics.blocked.toString(), `${blockedPercentage}%`],
      ['Total', filteredMetrics.totalUsers.toString(), '100.0%'],
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [userStatusBreakdown[0]],
      body: userStatusBreakdown.slice(1, -1),
      foot: [userStatusBreakdown[userStatusBreakdown.length - 1]],
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      footStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10 },
      margin: { left: margin, right: margin },
    });
    
    yPos = (doc as any).lastAutoTable.finalY + 15;
    
    // Check if we need a new page
    if (yPos > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      yPos = margin;
    }
    
    // Logins Data Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(loginsChartTitle, margin, yPos);
    yPos += 8;
    
    const loginsTableData = processedLoginsData.map((item: any) => {
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
    
    // Calculate totals and averages for logins
    const loginsTotal = filteredTotal;
    const loginsAverage = processedLoginsData.length > 0 ? (loginsTotal / processedLoginsData.length).toFixed(1) : '0.0';
    const loginsMax = processedLoginsData.length > 0 ? Math.max(...processedLoginsData.map((item: any) => item.count || 0)) : 0;
    
    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Count']],
      body: loginsTableData,
      foot: [['Total', loginsTotal.toString()]],
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
    
    // Users Created Data Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Users Created', margin, yPos);
    yPos += 8;
    
    const usersTableData = dailyUsersCreated.map((item: any) => {
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
    
    // Calculate totals and averages for users created
    const usersTotal = totalUsersCreated;
    const usersAverage = dailyUsersCreated.length > 0 ? (usersTotal / dailyUsersCreated.length).toFixed(1) : '0.0';
    const usersMax = dailyUsersCreated.length > 0 ? Math.max(...dailyUsersCreated.map((item: any) => item.count || 0)) : 0;
    
    autoTable(doc, {
      startY: yPos,
      head: [['Date', 'Count']],
      body: usersTableData,
      foot: [['Total', usersTotal.toString()]],
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
    
    // Summary Statistics Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Summary Statistics', margin, yPos);
    yPos += 8;
    
    const summaryStats = [
      ['Statistic', 'Value'],
      ['Total Logins (All Time)', allTimeMetrics.totalLogins.toString()],
      [`Total Logins (${periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1)})`, filteredTotal.toString()],
      [`Total Users (${periodLabel.charAt(0).toUpperCase() + periodLabel.slice(1)})`, filteredMetrics.totalUsers.toString()],
      ['Total Users Created (Period)', usersTotal.toString()],
      ['Registered This Month', filteredMetrics.registeredThisMonth.toString()],
      [`Average ${loginsChartTitle.toLowerCase()}`, loginsAverage],
      ['Average Users Created per Period', usersAverage],
      ['Peak Logins (Period)', loginsMax.toString()],
      ['Peak Users Created (Period)', usersMax.toString()],
    ];
    
    autoTable(doc, {
      startY: yPos,
      head: [summaryStats[0]],
      body: summaryStats.slice(1),
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
    
    // User Logins Breakdown Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('User Logins Breakdown', margin, yPos);
    yPos += 8;
    
    if (filteredLoginEvents.length > 0) {
      const loginBreakdownData = filteredLoginEvents.slice(0, 50).map((event: any) => {
        const fullName = `${event.user?.firstName || ''} ${event.user?.lastName || ''}`.trim() || 'N/A';
        const dateStr = event.loggedInAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        
        return [
          event.id.substring(0, 8) + '...',
          event.user?.email || 'N/A',
          fullName,
          event.user?.role || 'N/A',
          dateStr,
        ];
      });
      
      // Calculate available width (landscape A4 is 297mm wide, minus margins)
      const availableWidth = pageWidth - 28; // 14mm left + 14mm right margin
      
      autoTable(doc, {
        startY: yPos,
        head: [['Login ID', 'User Email', 'User Name', 'Role', 'Login Date & Time']],
        body: loginBreakdownData,
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
          1: { cellWidth: 50 },
          2: { cellWidth: 40 },
          3: { cellWidth: 30, halign: 'center' },
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
      
      // Add summary text
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      if (filteredLoginEvents.length > 50) {
        doc.text(`Total Login Events: ${filteredLoginEvents.length} (Showing first 50)`, margin, yPos);
      } else {
        doc.text(`Total Login Events: ${filteredLoginEvents.length}`, margin, yPos);
      }
      yPos += 10;
    } else {
      doc.setFontSize(11);
      doc.text('No login events found for the selected period.', margin, yPos);
      yPos += 10;
    }
    
    yPos += 10;
    
    // Check if we need a new page
    if (yPos > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      yPos = margin;
    }
    
    // Created Users Breakdown Section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Created Users Breakdown', margin, yPos);
    yPos += 8;
    
    if (filteredUsersForBreakdown.length > 0) {
      const usersBreakdownData = filteredUsersForBreakdown.slice(0, 50).map((user: any) => {
        const dateStr = user.createdAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        const status = [];
        if (user.isVerified) status.push('Verified');
        if (!user.isVerified) status.push('Not Verified');
        if (user.isDisabled) status.push('Blocked');
        
        return [
          user.id.substring(0, 8) + '...',
          user.email,
          user.role,
          status.join(', '),
          dateStr,
        ];
      });
      
      // Calculate available width (landscape A4 is 297mm wide, minus margins)
      const availableWidth = pageWidth - 28; // 14mm left + 14mm right margin
      
      autoTable(doc, {
        startY: yPos,
        head: [['User ID', 'Email', 'Role', 'Status', 'Created Date']],
        body: usersBreakdownData,
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
          1: { cellWidth: 50 },
          2: { cellWidth: 30, halign: 'center' },
          3: { cellWidth: 40, halign: 'center' },
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
      
      if (filteredUsersForBreakdown.length > 50) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 100, 100);
        doc.text(`Showing first 50 of ${filteredUsersForBreakdown.length} users`, margin, yPos);
        yPos += 10;
      }
    } else {
      doc.setFontSize(11);
      doc.text('No users created for the selected period.', margin, yPos);
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
    const fileName = `user-analytics-report-${periodLabel.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    toast.success('PDF report downloaded successfully');
  };

  // Prepare filtered login events for breakdown table
  const filteredLoginEvents = useMemo(() => {
    if (!usersData?.loginEvents) return [];
    
    const loginEvents = usersData.loginEvents;
    let start: Date, end: Date;

    if (timeFilter === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (timeFilter === 'year') {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else {
      // All time - no date filter
      return loginEvents.map((event: any) => ({
        id: event.id,
        loggedInAt: new Date(event.loggedInAt),
        user: event.user,
      })).sort((a: any, b: any) => b.loggedInAt.getTime() - a.loggedInAt.getTime());
    }

    // Filter login events based on timeFilter
    return loginEvents
      .filter((event: any) => {
        const loggedInAt = new Date(event.loggedInAt);
        return loggedInAt >= start && loggedInAt <= end;
      })
      .map((event: any) => ({
        id: event.id,
        loggedInAt: new Date(event.loggedInAt),
        user: event.user,
      }))
      .sort((a: any, b: any) => b.loggedInAt.getTime() - a.loggedInAt.getTime());
  }, [usersData, timeFilter, now]);

  // Prepare filtered users for breakdown table
  const filteredUsersForBreakdown = useMemo(() => {
    if (!usersData?.users) return [];
    
    const users = usersData.users;
    let start: Date, end: Date;

    if (timeFilter === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (timeFilter === 'year') {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else {
      // All time - return all users
      return users.map((user: any) => ({
        id: user.id,
        email: user.email || 'N/A',
        role: user.role,
        isVerified: user.isVerified,
        isDisabled: user.isDisabled,
        createdAt: new Date(user.createdAt),
      })).sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    // Filter users based on timeFilter
    return users
      .filter((user: any) => {
        const createdAt = new Date(user.createdAt);
        return createdAt >= start && createdAt <= end;
      })
      .map((user: any) => ({
        id: user.id,
        email: user.email || 'N/A',
        role: user.role,
        isVerified: user.isVerified,
        isDisabled: user.isDisabled,
        createdAt: new Date(user.createdAt),
      }))
      .sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [usersData, timeFilter, now]);

  // Process logins data based on filter
  const processedLoginsData = useMemo(() => {
    const dailyLogins = usersData?.dailyLogins || [];
    if (!dailyLogins.length) return [];

    if (timeFilter === 'month') {
      // Ensure all days of the month are included (handles 28/29/30/31 and leap years)
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const start = new Date(currentYear, currentMonth, 1);
      const end = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
      
      // Create a map from the API data, only for dates in current month
      const dailyMap = new Map<string, number>();
      dailyLogins.forEach((item: any) => {
        // Only include dates that are within the current month (strict check)
        const itemDate = new Date(item.date);
        if (itemDate >= start && itemDate <= end && 
            itemDate.getMonth() === currentMonth && 
            itemDate.getFullYear() === currentYear) {
          dailyMap.set(item.date, item.count || 0);
        }
      });
      
      // Fill in all days of the month (strictly within current month)
      const completeDailyData: Array<{ date: string; count: number }> = [];
      const currentDate = new Date(start);
      
      while (currentDate <= end) {
        // Double-check we're still in the current month
        const dateMonth = currentDate.getMonth();
        const dateYear = currentDate.getFullYear();
        if (dateMonth === currentMonth && dateYear === currentYear) {
          const dateKey = currentDate.toISOString().split('T')[0];
          completeDailyData.push({
            date: dateKey,
            count: dailyMap.get(dateKey) || 0,
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
        // Safety check: if we've moved to next month, break
        if (currentDate.getMonth() !== currentMonth || currentDate.getFullYear() !== currentYear) {
          break;
        }
      }
      
      // Final filter to ensure no dates outside current month
      return completeDailyData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
      });
    } else if (timeFilter === 'year') {
      // Aggregate by month
      const monthlyMap = new Map<string, number>();
      dailyLogins.forEach((item: any) => {
        const date = new Date(item.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
        const current = monthlyMap.get(monthKey) || 0;
        monthlyMap.set(monthKey, current + (item.count || 0));
      });

      // Fill in missing months with 0
      const monthlyData: Array<{ date: string; count: number }> = [];
      const currentYear = now.getFullYear();
      for (let month = 0; month < 12; month++) {
        const date = new Date(currentYear, month, 1);
        const monthKey = `${date.getFullYear()}-${String(month + 1).padStart(2, '0')}-01`;
        monthlyData.push({
          date: monthKey,
          count: monthlyMap.get(monthKey) || 0,
        });
      }
      return monthlyData;
    } else {
      // All time - aggregate by year
      const yearlyMap = new Map<string, number>();
      dailyLogins.forEach((item: any) => {
        const date = new Date(item.date);
        const year = date.getFullYear();
        const yearKey = `${year}-01-01`;
        const current = yearlyMap.get(yearKey) || 0;
        yearlyMap.set(yearKey, current + (item.count || 0));
      });

      // Show exactly 5 years: current year and 4 years before
      const currentYear = now.getFullYear();
      const startYear = currentYear - 4; // 5 years total: startYear to currentYear

      // Fill in all 5 years with 0 if no data
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
  }, [usersData?.dailyLogins, timeFilter]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
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
                    <Users className="h-5 w-5 relative z-10" />
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
                      User Analytics
                    </h1>
                  </div>
                  <p className="text-sm text-slate-600 leading-6 flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-indigo-500" />
                    User engagement and login insights
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
                  variant="outline"
                  className="h-11 rounded-xl border-2"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
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
        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Total Users {timeFilter === 'month' ? '(This Month)' : timeFilter === 'year' ? '(This Year)' : '(All Time)'}
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{filteredMetrics.totalUsers}</div>
            <div className="mt-3 space-y-1.5 pt-2 border-t border-purple-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-purple-600">Verified:</span>
                <span className="font-semibold text-purple-900">{filteredMetrics.verified}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-purple-600">Not Verified:</span>
                <span className="font-semibold text-purple-900">{filteredMetrics.notVerified}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-purple-600">Blocked:</span>
                <span className="font-semibold text-purple-900">{filteredMetrics.blocked}</span>
              </div>
            </div>
            <p className="text-xs text-purple-600 mt-2">
              Registered this month: <span className="font-semibold">{filteredMetrics.registeredThisMonth}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">
              Total Tenants {timeFilter === 'month' ? '(This Month)' : timeFilter === 'year' ? '(This Year)' : '(All Time)'}
            </CardTitle>
            <Home className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">{filteredMetrics.tenants}</div>
            <p className="text-xs text-emerald-600 mt-1">
              {timeFilter === 'month' ? 'Registered this month' : timeFilter === 'year' ? 'Registered this year' : 'All registered tenants'}
            </p>
            <p className="text-xs text-emerald-600 mt-1">
              Registered this month: <span className="font-semibold">{filteredMetrics.tenantsRegisteredThisMonth}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              Total Landlords {timeFilter === 'month' ? '(This Month)' : timeFilter === 'year' ? '(This Year)' : '(All Time)'}
            </CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{filteredMetrics.landlords}</div>
            <p className="text-xs text-blue-600 mt-1">
              {timeFilter === 'month' ? 'Registered this month' : timeFilter === 'year' ? 'Registered this year' : 'All registered landlords'}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Registered this month: <span className="font-semibold">{filteredMetrics.landlordsRegisteredThisMonth}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-700">Total Logins</CardTitle>
            <LogIn className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">{filteredMetrics.totalLogins}</div>
            <p className="text-xs text-amber-600 mt-1">
              {timeFilter === 'month' ? 'Logins this month' : timeFilter === 'year' ? 'Logins this year' : 'Total login events all time'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-4">
        {/* Daily Logins Area Chart */}
        <Card className="pt-0">
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1">
              <CardTitle>{loginsChartTitle}</CardTitle>
              <CardDescription>
                Showing total logins for {periodLabel}
                {(() => {
                  const filteredTotal = processedLoginsData.reduce((sum: number, item: any) => sum + (item.count || 0), 0);
                  return filteredTotal > 0 ? (
                    <span className="ml-1">
                      • Total: <span className="font-bold text-primary text-lg">{filteredTotal.toLocaleString()}</span>
                    </span>
                  ) : null;
                })()}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <ChartContainer config={loginsChartConfig} className="aspect-auto h-[250px] w-full">
              <BarChart data={processedLoginsData}>
                <CartesianGrid vertical={false} stroke="hsl(var(--muted))" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }}
                  minTickGap={timeFilter === 'all' ? 90 : timeFilter === 'year' ? 60 : 40}
                  interval={0}
                  tickFormatter={(value: string) => {
                    const date = new Date(value);
                    if (timeFilter === 'all') {
                      // Show all years: 2021, 2022, 2023, 2024, 2025
                      return date.getFullYear().toString();
                    } else if (timeFilter === 'year') {
                      // Show all months: Jan, Feb, Mar... Dec
                      return date.toLocaleDateString('en-US', { month: 'short' });
                    } else {
                      // For month: show Nov 1, Nov 3, Nov 6, Nov 9... and last day (with month name on each)
                      const day = date.getDate();
                      const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
                      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
                      
                      // Show: 1, 3, 6, 9, 12, 15, 18, 21, 24, 27, and last day
                      const showDays = [1, 3, 6, 9, 12, 15, 18, 21, 24, 27];
                      
                      // Show if it's in the list (always with month name)
                      if (showDays.includes(day)) {
                        return `${monthName} ${day}`;
                      } 
                      // Show last day only if it's not already in showDays
                      else if (day === daysInMonth && !showDays.includes(day)) {
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
                        if (timeFilter === 'all') {
                          return date.getFullYear().toString();
                        } else if (timeFilter === 'year') {
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
                  fill="var(--color-logins)"
                  radius={[4, 4, 0, 0]}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Daily Users Created Area Chart */}
        <Card className="pt-0">
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1">
              <CardTitle>Users Created</CardTitle>
              <CardDescription>
                Showing new users created for {periodLabel}
                {totalUsersCreated !== undefined && totalUsersCreated > 0 && (
                  <span className="ml-1">
                    • Total: <span className="font-bold text-primary text-lg">{totalUsersCreated.toLocaleString()}</span>
                  </span>
                )}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <ChartContainer config={usersCreatedChartConfig} className="aspect-auto h-[250px] w-full">
              <BarChart data={dailyUsersCreated}>
                <CartesianGrid vertical={false} stroke="hsl(var(--muted))" strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }}
                  minTickGap={timeFilter === 'all' ? 90 : timeFilter === 'year' ? 60 : 40}
                  interval={0}
                  tickFormatter={(value: string) => {
                    const date = new Date(value);
                    if (timeFilter === 'all') {
                      // Show all years: 2021, 2022, 2023, 2024, 2025
                      return date.getFullYear().toString();
                    } else if (timeFilter === 'year') {
                      // Show all months: Jan, Feb, Mar... Dec
                      return date.toLocaleDateString('en-US', { month: 'short' });
                    } else {
                      // For month: show Nov 1, Nov 3, Nov 6, Nov 9... and last day (with month name on each)
                      const day = date.getDate();
                      const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
                      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
                      
                      // Show: 1, 3, 6, 9, 12, 15, 18, 21, 24, 27, and last day
                      const showDays = [1, 3, 6, 9, 12, 15, 18, 21, 24, 27];
                      
                      // Show if it's in the list (always with month name)
                      if (showDays.includes(day)) {
                        return `${monthName} ${day}`;
                      } 
                      // Show last day only if it's not already in showDays (e.g., if month has 28, 29, 30, or 31 days)
                      else if (day === daysInMonth && !showDays.includes(day)) {
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
                        if (timeFilter === 'all') {
                          return date.getFullYear().toString();
                        } else if (timeFilter === 'year') {
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
                  fill="var(--color-usersCreated)"
                  radius={[4, 4, 0, 0]}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* User Logins Breakdown */}
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>User Logins Breakdown</CardTitle>
            <CardDescription>
              Detailed breakdown of all user login events for {periodLabel}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          {filteredLoginEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No login events found for {periodLabel}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Login ID</TableHead>
                    <TableHead>User Email</TableHead>
                    <TableHead>User Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Login Date & Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(showAllLogins ? filteredLoginEvents : filteredLoginEvents.slice(0, 5)).map((event: any) => {
                    const fullName = `${event.user?.firstName || ''} ${event.user?.lastName || ''}`.trim() || 'N/A';
                    const roleColors: Record<string, string> = {
                      ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
                      LANDLORD: 'bg-blue-100 text-blue-700 border-blue-200',
                      TENANT: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                    };
                    return (
                      <TableRow key={event.id}>
                        <TableCell className="font-mono text-xs">
                          {event.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="font-medium">
                          {event.user?.email || 'N/A'}
                        </TableCell>
                        <TableCell>{fullName}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              roleColors[event.user?.role] || 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {event.user?.role || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {event.loggedInAt.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {filteredLoginEvents.length > 5 && !showAllLogins && (
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllLogins(true)}
                  >
                    View More ({filteredLoginEvents.length - 5} more)
                  </Button>
                </div>
              )}
              {showAllLogins && filteredLoginEvents.length > 5 && (
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllLogins(false)}
                  >
                    View Less
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Created Users Breakdown */}
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Created Users Breakdown</CardTitle>
            <CardDescription>
              Detailed breakdown of all users created for {periodLabel}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          {filteredUsersForBreakdown.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users created for {periodLabel}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">User ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(showAllUsers ? filteredUsersForBreakdown : filteredUsersForBreakdown.slice(0, 5)).map((user: any) => {
                    const roleColors: Record<string, string> = {
                      ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
                      LANDLORD: 'bg-blue-100 text-blue-700 border-blue-200',
                      TENANT: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                    };
                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-xs">
                          {user.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="font-medium">{user.email || 'N/A'}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              roleColors[user.role] || 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {user.isVerified ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                <ShieldCheck className="h-3 w-3" />
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                                <ShieldX className="h-3 w-3" />
                                Not Verified
                              </span>
                            )}
                            {user.isDisabled && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                <Ban className="h-3 w-3" />
                                Blocked
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.createdAt.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {filteredUsersForBreakdown.length > 5 && !showAllUsers && (
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllUsers(true)}
                  >
                    View More ({filteredUsersForBreakdown.length - 5} more)
                  </Button>
                </div>
              )}
              {showAllUsers && filteredUsersForBreakdown.length > 5 && (
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllUsers(false)}
                  >
                    View Less
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAnalytics;


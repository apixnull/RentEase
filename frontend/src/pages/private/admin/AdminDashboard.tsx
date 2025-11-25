import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, Sun, Moon, Sunset, Sparkles, RefreshCcw, TrendingUp, DollarSign, FileText, Users, BarChart3, Eye, ArrowRight, Shield, Settings, ListChecks, Flag, UserPlus, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAdminAnalyticsRequest } from '@/api/admin/analyticsApi';
import { getAdminEarningsRequest } from '@/api/admin/earningsApi';
import { getFraudReportsRequest } from '@/api/admin/fraudReportApi';
import { getAllListingsForAdminRequest } from '@/api/admin/listingApi';
import { getAllUsersRequest } from '@/api/admin/userApi';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';

const AdminDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  // Get personalized greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = user?.firstName || 'Admin';
    
    if (hour >= 5 && hour < 12) {
      return `Good morning, ${firstName}!`;
    } else if (hour >= 12 && hour < 17) {
      return `Good afternoon, ${firstName}!`;
    } else if (hour >= 17 && hour < 21) {
      return `Good evening, ${firstName}!`;
    } else {
      return `Welcome back, ${firstName}!`;
    }
  };

  // Get greeting icon based on time of day
  const getGreetingIcon = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return <Sun className="h-4 w-4" />;
    } else if (hour >= 12 && hour < 17) {
      return <Sun className="h-4 w-4" />;
    } else if (hour >= 17 && hour < 21) {
      return <Sunset className="h-4 w-4" />;
    } else {
      return <Moon className="h-4 w-4" />;
    }
  };

  // Format current date nicely
  const currentDate = format(new Date(), 'EEEE, MMMM d');
  const currentYear = format(new Date(), 'yyyy');

  // State
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [earningsLoading, setEarningsLoading] = useState(true);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [fraudReportsLoading, setFraudReportsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [earningsData, setEarningsData] = useState<any>(null);
  const [listingsData, setListingsData] = useState<any>(null);
  const [fraudReportsData, setFraudReportsData] = useState<any>(null);
  const [usersData, setUsersData] = useState<any>(null);

  // Fetch Analytics
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        const response = await getAdminAnalyticsRequest('this_month');
        setAnalyticsData(response.data);
      } catch (error: any) {
        console.error('Failed to fetch analytics:', error);
        toast.error(error?.response?.data?.error || 'Failed to load analytics');
      } finally {
        setAnalyticsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Fetch Earnings
  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setEarningsLoading(true);
        const response = await getAdminEarningsRequest({ range: 'this_month' });
        setEarningsData(response.data);
      } catch (error: any) {
        console.error('Failed to fetch earnings:', error);
        toast.error(error?.response?.data?.error || 'Failed to load earnings');
      } finally {
        setEarningsLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  // Fetch Listings
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setListingsLoading(true);
        const response = await getAllListingsForAdminRequest();
        setListingsData(response.data);
      } catch (error: any) {
        console.error('Failed to fetch listings:', error);
        toast.error(error?.response?.data?.error || 'Failed to load listings');
      } finally {
        setListingsLoading(false);
      }
    };
    fetchListings();
  }, []);

  // Fetch Fraud Reports
  useEffect(() => {
    const fetchFraudReports = async () => {
      try {
        setFraudReportsLoading(true);
        const response = await getFraudReportsRequest();
        setFraudReportsData(response.data);
      } catch (error: any) {
        console.error('Failed to fetch fraud reports:', error);
        toast.error(error?.response?.data?.error || 'Failed to load fraud reports');
      } finally {
        setFraudReportsLoading(false);
      }
    };
    fetchFraudReports();
  }, []);

  // Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setUsersLoading(true);
        const response = await getAllUsersRequest();
        setUsersData(response);
      } catch (error: any) {
        console.error('Failed to fetch users:', error);
        toast.error(error?.response?.data?.error || 'Failed to load users');
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Calculate listing statistics
  const listingStats = useMemo(() => {
    if (!listingsData?.listings) return { total: 0, visible: 0, hidden: 0, blocked: 0, flagged: 0, pendingReview: 0 };
    
    const listings = listingsData.listings;
    return {
      total: listings.length,
      visible: listings.filter((l: any) => l.lifecycleStatus === 'VISIBLE').length,
      hidden: listings.filter((l: any) => l.lifecycleStatus === 'HIDDEN').length,
      blocked: listings.filter((l: any) => l.blockedReason).length,
      flagged: listings.filter((l: any) => l.flaggedReason).length,
      pendingReview: listings.filter((l: any) => l.lifecycleStatus === 'WAITING_REVIEW').length,
    };
  }, [listingsData]);

  // Chart configuration
  const loginChartConfig: ChartConfig = {
    logins: {
      label: "Daily Logins",
      color: "hsl(221, 83%, 53%)", // indigo-600
    },
  };

  const currencyFormatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  });

  // Get recently created users (limit 4)
  const recentUsers = useMemo(() => {
    if (!usersData?.users) return [];
    return usersData.users
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [usersData]);

  // Refresh all data
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      toast.loading('Refreshing dashboard...', { id: 'refresh' });

      const [analyticsRes, earningsRes, listingsRes, fraudRes, usersRes] = await Promise.all([
        getAdminAnalyticsRequest('this_month'),
        getAdminEarningsRequest({ range: 'this_month' }),
        getAllListingsForAdminRequest(),
        getFraudReportsRequest(),
        getAllUsersRequest(),
      ]);

      setAnalyticsData(analyticsRes.data);
      setEarningsData(earningsRes.data);
      setListingsData(listingsRes.data);
      setFraudReportsData(fraudRes.data);
      setUsersData(usersRes);

      toast.success('Dashboard refreshed successfully', { id: 'refresh' });
    } catch (error: any) {
      console.error('Failed to refresh dashboard:', error);
      toast.error(error?.response?.data?.error || 'Failed to refresh dashboard', { id: 'refresh' });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Welcome Header Section */}
      <div className="relative">
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 relative"
          >
            {/* Gradient border line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-300/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-indigo-200/40 via-blue-200/50 to-purple-200/40" />
            
            {/* Left side - Icon, Greeting and Title */}
            <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
              {/* Floating Icon Group */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
                whileHover={{ 
                  scale: 1.05, 
                  rotate: -5,
                  transition: { type: "tween", duration: 0.3 }
                }}
                className="relative flex-shrink-0"
              >
                <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 text-white grid place-items-center shadow-2xl shadow-indigo-500/40">
                  <Shield className="h-6 w-6 relative z-10" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
                </div>
                {/* Floating greeting icon badge */}
                <motion.div
                  initial={{ scale: 0, rotate: -180, x: -5, y: -5 }}
                  animate={{ scale: 1, rotate: 0, x: 0, y: 0 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 15 }}
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white text-indigo-600 border-2 border-indigo-200 shadow-lg grid place-items-center backdrop-blur-sm"
                >
                  {getGreetingIcon()}
                </motion.div>
              </motion.div>

              {/* Greeting Text */}
              <div className="min-w-0 flex-1 space-y-1.5">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="flex items-center gap-2.5 flex-wrap"
                >
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
                    {getGreeting()}
                  </h1>
                  <motion.div
                    animate={{ rotate: [0, 10], scale: [1, 1.1] }}
                    transition={{ 
                      duration: 1, 
                      repeat: Infinity, 
                      repeatType: "reverse",
                      ease: "easeInOut" 
                    }}
                  >
                    <Sparkles className="h-5 w-5 text-indigo-500 drop-shadow-sm" />
                  </motion.div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <span className="font-semibold text-indigo-600">Admin Dashboard</span>
                  <span className="h-1 w-1 rounded-full bg-indigo-400" />
                  <span className="text-blue-600">Platform management hub</span>
                </motion.div>
              </div>
            </div>

            {/* Right side - Refresh Button and Date Badge */}
            <div className="flex items-center gap-3">
              {/* Refresh Button */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors"
                >
                  <RefreshCcw 
                    className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} 
                  />
                  <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                </Button>
              </motion.div>

              {/* Floating Date Badge */}
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/60 shadow-xl shadow-indigo-500/10 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all"
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-500 text-white grid place-items-center shadow-lg">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-indigo-700 leading-tight">
                    {currentDate}
                  </span>
                  <span className="text-xs text-blue-600 leading-tight font-medium">
                    {currentYear}
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {/* Total Users Logged In */}
        <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-4 w-4 text-indigo-600" />
              <Eye className="h-3 w-3 text-slate-400" />
            </div>
            <p className="text-[10px] text-slate-600 mb-1">Active Users</p>
            {analyticsLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <p className="text-xl font-bold text-slate-900">
                {analyticsData?.usersLoggedInThisMonth || 0}
              </p>
            )}
            <p className="text-[10px] text-slate-500 mt-1">This month</p>
          </CardContent>
        </Card>

        {/* Total Earnings */}
        <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <Eye className="h-3 w-3 text-slate-400" />
            </div>
            <p className="text-[10px] text-slate-600 mb-1">Total Earnings</p>
            {earningsLoading ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              <p className="text-xl font-bold text-emerald-700">
                {earningsData?.summary ? currencyFormatter.format(earningsData.summary.totalEarnings) : '₱0'}
              </p>
            )}
            <p className="text-[10px] text-slate-500 mt-1">This month</p>
          </CardContent>
        </Card>

        {/* Total Listings */}
        <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-4 w-4 text-cyan-600" />
              <Eye className="h-3 w-3 text-slate-400" />
            </div>
            <p className="text-[10px] text-slate-600 mb-1">Total Listings</p>
            {listingsLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <p className="text-xl font-bold text-cyan-700">{listingStats.total}</p>
            )}
            <p className="text-[10px] text-slate-500 mt-1">All time</p>
          </CardContent>
        </Card>

        {/* Fraud Reports */}
        <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Flag className="h-4 w-4 text-rose-600" />
              <Eye className="h-3 w-3 text-slate-400" />
            </div>
            <p className="text-[10px] text-slate-600 mb-1">Fraud Reports</p>
            {fraudReportsLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <p className="text-xl font-bold text-rose-700">
                {analyticsData?.totalFraudReports || fraudReportsData?.reports?.length || 0}
              </p>
            )}
            <p className="text-[10px] text-slate-500 mt-1">This month</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Analytics & Earnings Section - Side by Side */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {/* Analytics Section - Daily Logins */}
        <div className="space-y-4">
          <div className="relative">
            <div className="flex items-center gap-3 pb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-500 text-white grid place-items-center shadow-lg shadow-indigo-500/20">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">Daily Login Analytics</h2>
                <p className="text-xs text-slate-500 mt-0.5">User login activity this month</p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-200/50 to-transparent" />
          </div>

          <Card className="border border-slate-200 shadow-md shadow-slate-200/50 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              {analyticsLoading ? (
                <Skeleton className="h-[200px] rounded-lg" />
              ) : analyticsData?.dailyLogins?.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200">
                      <p className="text-[10px] text-indigo-700 mb-1">Unique Users</p>
                      <p className="text-lg font-bold text-indigo-900">
                        {analyticsData.usersLoggedInThisMonth || 0}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200">
                      <p className="text-[10px] text-blue-700 mb-1">Total Logins</p>
                      <p className="text-lg font-bold text-blue-900">
                        {analyticsData.totalLogins || 0}
                      </p>
                    </div>
                  </div>
                  <ChartContainer config={loginChartConfig} className="h-[200px]">
                    <LineChart data={analyticsData.dailyLogins}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis 
                        dataKey="label" 
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        axisLine={{ stroke: '#cbd5e1' }}
                      />
                      <YAxis 
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        axisLine={{ stroke: '#cbd5e1' }}
                      />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#4f46e5" 
                        strokeWidth={2}
                        dot={{ fill: '#4f46e5', r: 3 }}
                      />
                    </LineChart>
                  </ChartContainer>
                </div>
              ) : (
                <div className="text-center py-6">
                  <BarChart3 className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No login data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Earnings Section */}
        <div className="space-y-4">
          <div className="relative">
            <div className="flex items-center gap-3 pb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white grid place-items-center shadow-lg shadow-emerald-500/20">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">Platform Earnings</h2>
                <p className="text-xs text-slate-500 mt-0.5">Revenue from paid listings</p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-200/50 to-transparent" />
          </div>

          <Card className="border border-slate-200 shadow-md shadow-slate-200/50 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              {earningsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 rounded-lg" />
                  <Skeleton className="h-20 rounded-lg" />
                </div>
              ) : earningsData?.summary ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                      <p className="text-[10px] text-emerald-700 mb-1">Total Earnings</p>
                      <p className="text-lg font-bold text-emerald-900">
                        {currencyFormatter.format(earningsData.summary.totalEarnings)}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-teal-50 border border-teal-200">
                      <p className="text-[10px] text-teal-700 mb-1">Listings Paid</p>
                      <p className="text-lg font-bold text-teal-900">
                        {earningsData.summary.listingCount}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-[10px] text-slate-700 mb-1">Average per Listing</p>
                    <p className="text-base font-bold text-slate-900">
                      {currencyFormatter.format(earningsData.summary.averagePerListing)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs hover:bg-slate-50 hover:border-slate-300 transition-colors"
                    onClick={() => navigate('/admin/earnings')}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      View Detailed Earnings
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <TrendingUp className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No earnings data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Listings & Fraud Reports Section - Side by Side */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {/* Listings Section */}
        <div className="space-y-4">
          <div className="relative">
            <div className="flex items-center gap-3 pb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500 text-white grid place-items-center shadow-lg shadow-purple-500/20">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">Listings Overview</h2>
                <p className="text-xs text-slate-500 mt-0.5">Listing status and statistics</p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-200/50 to-transparent" />
          </div>

          <Card className="border border-slate-200 shadow-md shadow-slate-200/50 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              {listingsLoading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-12 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                      <p className="text-[10px] text-emerald-700 mb-1">Visible</p>
                      <p className="text-lg font-bold text-emerald-900">{listingStats.visible}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                      <p className="text-[10px] text-slate-700 mb-1">Hidden</p>
                      <p className="text-lg font-bold text-slate-900">{listingStats.hidden}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200">
                      <p className="text-[10px] text-amber-700 mb-1">Pending Review</p>
                      <p className="text-lg font-bold text-amber-900">{listingStats.pendingReview}</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                      <p className="text-[10px] text-rose-700 mb-1">Blocked</p>
                      <p className="text-lg font-bold text-rose-900">{listingStats.blocked}</p>
                    </div>
                  </div>
                  {listingStats.flagged > 0 && (
                    <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200">
                      <p className="text-[10px] text-orange-700 mb-1">Flagged</p>
                      <p className="text-lg font-bold text-orange-900">{listingStats.flagged}</p>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs hover:bg-slate-50 hover:border-slate-300 transition-colors"
                    onClick={() => navigate('/admin/listing')}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      View All Listings
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Fraud Reports Section */}
        <div className="space-y-4">
          <div className="relative">
            <div className="flex items-center gap-3 pb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-500 via-rose-500 to-orange-500 text-white grid place-items-center shadow-lg shadow-red-500/20">
                <Flag className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">Recent Fraud Reports</h2>
                <p className="text-xs text-slate-500 mt-0.5">Latest tenant fraud reports</p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-200/50 to-transparent" />
          </div>

          <Card className="border border-slate-200 shadow-md shadow-slate-200/50 hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              {fraudReportsLoading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                  ))}
                </div>
              ) : analyticsData?.recentFraudReports?.length > 0 ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {analyticsData.recentFraudReports.slice(0, 4).map((report: any) => (
                      <div
                        key={report.id}
                        className="p-2.5 rounded-lg border-l-4 border-rose-500 bg-rose-50/50 hover:bg-rose-50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/admin/listing/${report.listingId}/details`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">
                              {report.propertyTitle}
                            </p>
                            <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                              {report.reporterName}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1 capitalize">
                              {report.reason.replace('_', ' ')}
                            </p>
                          </div>
                          <Badge variant="destructive" className="text-[10px] ml-2">
                            {format(new Date(report.createdAt), 'MMM d')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs hover:bg-slate-50 hover:border-slate-300 transition-colors"
                    onClick={() => navigate('/admin/reports/fraud')}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      View All Fraud Reports
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Flag className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No fraud reports</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Recently Created Users Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        className="space-y-4"
      >
        <div className="relative">
          <div className="flex items-center gap-3 pb-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 text-white grid place-items-center shadow-lg shadow-teal-500/20">
              <UserPlus className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900">Recently Created Users</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest user registrations</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-200/50 to-transparent" />
        </div>

        <Card className="border border-slate-200 shadow-md shadow-slate-200/50 hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            {usersLoading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
            ) : recentUsers.length > 0 ? (
              <div className="space-y-3">
                <div className="space-y-2">
                  {recentUsers.map((user: any) => {
                    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'No Name';
                    const initials = fullName
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2);
                    
                    const roleColors: Record<string, string> = {
                      ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
                      LANDLORD: 'bg-blue-100 text-blue-700 border-blue-200',
                      TENANT: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                    };

                    return (
                      <div
                        key={user.id}
                        className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.avatarUrl || undefined} />
                            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-xs font-semibold text-slate-900 truncate">
                                {fullName}
                              </p>
                              <Badge 
                                variant="outline" 
                                className={`text-[10px] ${roleColors[user.role] || 'bg-slate-100 text-slate-700 border-slate-200'}`}
                              >
                                {user.role}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{user.email}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">
                              Joined: {format(new Date(user.createdAt), 'MMM d, yyyy')}
                            </p>
                          </div>
                          {user.isDisabled && (
                            <Badge variant="destructive" className="text-[10px]">
                              Blocked
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs hover:bg-slate-50 hover:border-slate-300 transition-colors"
                  onClick={() => navigate('/admin/users')}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    View All Users
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <UserPlus className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No users found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Links Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="space-y-4"
      >
        <div className="relative">
          <div className="flex items-center gap-3 pb-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-500 via-gray-500 to-zinc-500 text-white grid place-items-center shadow-lg shadow-slate-500/20">
              <Settings className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900">Quick Links</h2>
              <p className="text-xs text-slate-500 mt-0.5">Quick access to admin features</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200/50 to-transparent" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card 
            className="border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-indigo-300"
            onClick={() => navigate('/admin/listing')}
          >
            <CardContent className="p-4 text-center">
              <FileText className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-900">Listings</p>
              <p className="text-[10px] text-slate-500 mt-1">Manage listings</p>
            </CardContent>
          </Card>

          <Card 
            className="border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-emerald-300"
            onClick={() => navigate('/admin/earnings')}
          >
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-900">Earnings</p>
              <p className="text-[10px] text-slate-500 mt-1">View revenue</p>
            </CardContent>
          </Card>

          <Card 
            className="border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
            onClick={() => navigate('/admin/analytics')}
          >
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-900">Analytics</p>
              <p className="text-[10px] text-slate-500 mt-1">View insights</p>
            </CardContent>
          </Card>

          <Card 
            className="border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-rose-300"
            onClick={() => navigate('/admin/reports/fraud')}
          >
            <CardContent className="p-4 text-center">
              <Flag className="h-6 w-6 text-rose-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-900">Fraud Reports</p>
              <p className="text-[10px] text-slate-500 mt-1">Review reports</p>
            </CardContent>
          </Card>

          <Card 
            className="border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-purple-300"
            onClick={() => navigate('/admin/users')}
          >
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-900">Users</p>
              <p className="text-[10px] text-slate-500 mt-1">Manage users</p>
            </CardContent>
          </Card>

          <Card 
            className="border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-cyan-300"
            onClick={() => navigate('/admin/analytics')}
          >
            <CardContent className="p-4 text-center">
              <ListChecks className="h-6 w-6 text-cyan-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-900">Platform Stats</p>
              <p className="text-[10px] text-slate-500 mt-1">View statistics</p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;

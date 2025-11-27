import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, Sun, Moon, Sunset, Sparkles, LayoutDashboard, Home, Building2, FileText, CheckCircle, XCircle, Eye, CreditCard, AlertCircle, Clock, ArrowRight, FileCheck, UserCheck, Wrench, Megaphone, DollarSign, RefreshCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { getDashboardMetricsRequest, getDashboardPaymentsRequest, getDashboardLeasesRequest, getDashboardScreeningsRequest, getDashboardMaintenanceRequest, getDashboardListingsRequest, getDashboardFinancialRequest } from '@/api/landlord/dashboardApi';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';

const LandlordDashboard = () => {
  const user = useAuthStore((state) => state.user);
  
  // Get personalized greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    const firstName = user?.firstName || 'there';
    
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

  // Key Metrics State
  const [metrics, setMetrics] = useState({
    totalProperties: 0,
    totalUnits: 0,
    advertisedUnits: 0,
    blockedUnits: 0,
    flaggedListings: 0,
    waitingReview: 0,
    occupiedUnits: 0,
    vacantUnits: 0,
    underMaintenance: 0,
  });
  const [details, setDetails] = useState({
    properties: [],
    allUnits: [],
    occupiedUnits: [],
    vacantUnits: [],
    advertisedUnits: [],
  });
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [overduePayments, setOverduePayments] = useState<any[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<any[]>([]);
  const [leasesLoading, setLeasesLoading] = useState(true);
  const [pendingLeases, setPendingLeases] = useState<any[]>([]);
  const [completingLeases, setCompletingLeases] = useState<any[]>([]);
  const [screeningsLoading, setScreeningsLoading] = useState(true);
  const [pendingScreenings, setPendingScreenings] = useState<any[]>([]);
  const [submittedScreenings, setSubmittedScreenings] = useState<any[]>([]);
  const [maintenanceLoading, setMaintenanceLoading] = useState(true);
  const [openMaintenance, setOpenMaintenance] = useState<any[]>([]);
  const [inProgressMaintenance, setInProgressMaintenance] = useState<any[]>([]);
  const [listingsLoading, setListingsLoading] = useState(true);
  const [pendingReview, setPendingReview] = useState<any[]>([]);
  const [expiringListings, setExpiringListings] = useState<any[]>([]);
  const [blockedListings, setBlockedListings] = useState<any[]>([]);
  const [flaggedListings, setFlaggedListings] = useState<any[]>([]);
  const [financialLoading, setFinancialLoading] = useState(true);
  const [financialData, setFinancialData] = useState({
    monthlyIncome: 0,
    monthlyExpenses: 0,
    netRevenue: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  // Fetch metrics data
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const response = await getDashboardMetricsRequest();
        const metricsData = response.data?.metrics;

        if (metricsData) {
          setMetrics({
            totalProperties: metricsData.totalProperties || 0,
            totalUnits: metricsData.totalUnits || 0,
            advertisedUnits: metricsData.advertisedUnits || 0,
            blockedUnits: metricsData.blockedUnits || 0,
            flaggedListings: metricsData.flaggedListings || 0,
            waitingReview: metricsData.waitingReview || 0,
            occupiedUnits: metricsData.occupiedUnits || 0,
            vacantUnits: metricsData.vacantUnits || 0,
            underMaintenance: metricsData.underMaintenance || 0,
          });
        }

        if (response.data?.details) {
          setDetails(response.data.details);
        }
      } catch (error: any) {
        console.error('Failed to fetch metrics:', error);
        toast.error(error?.response?.data?.error || 'Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  // Fetch payments data
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setPaymentsLoading(true);
        const response = await getDashboardPaymentsRequest();
        if (response.data) {
          // Filter out payments from ended/completed/terminated/cancelled leases
          const endedLeaseStatuses = ['ENDED', 'COMPLETED', 'TERMINATED', 'CANCELLED'];
          const overdue = (response.data.overduePayments || []).filter((payment: any) => {
            // If lease status is available, filter it out
            if (payment.lease?.status) {
              return !endedLeaseStatuses.includes(payment.lease.status);
            }
            // If status not available, include it (backend should have filtered already)
            return true;
          });
          const upcoming = (response.data.upcomingPayments || []).filter((payment: any) => {
            // If lease status is available, filter it out
            if (payment.lease?.status) {
              return !endedLeaseStatuses.includes(payment.lease.status);
            }
            // If status not available, include it (backend should have filtered already)
            return true;
          });
          setOverduePayments(overdue);
          setUpcomingPayments(upcoming);
        }
      } catch (error: any) {
        console.error('Failed to fetch payments:', error);
        toast.error(error?.response?.data?.error || 'Failed to load payment data');
      } finally {
        setPaymentsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Fetch leases data
  useEffect(() => {
    const fetchLeases = async () => {
      try {
        setLeasesLoading(true);
        const response = await getDashboardLeasesRequest();
        if (response.data) {
          setPendingLeases(response.data.pendingLeases || []);
          setCompletingLeases(response.data.completingLeases || []);
        }
      } catch (error: any) {
        console.error('Failed to fetch leases:', error);
        toast.error(error?.response?.data?.error || 'Failed to load lease data');
      } finally {
        setLeasesLoading(false);
      }
    };

    fetchLeases();
  }, []);

  // Fetch screenings data
  useEffect(() => {
    const fetchScreenings = async () => {
      try {
        setScreeningsLoading(true);
        const response = await getDashboardScreeningsRequest();
        if (response.data) {
          setPendingScreenings(response.data.pendingScreenings || []);
          setSubmittedScreenings(response.data.submittedScreenings || []);
        }
      } catch (error: any) {
        console.error('Failed to fetch screenings:', error);
        toast.error(error?.response?.data?.error || 'Failed to load screening data');
      } finally {
        setScreeningsLoading(false);
      }
    };

    fetchScreenings();
  }, []);

  // Fetch maintenance data
  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        setMaintenanceLoading(true);
        const response = await getDashboardMaintenanceRequest();
        if (response.data) {
          setOpenMaintenance(response.data.openMaintenance || []);
          setInProgressMaintenance(response.data.inProgressMaintenance || []);
        }
      } catch (error: any) {
        console.error('Failed to fetch maintenance:', error);
        toast.error(error?.response?.data?.error || 'Failed to load maintenance data');
      } finally {
        setMaintenanceLoading(false);
      }
    };

    fetchMaintenance();
  }, []);

  // Fetch listings data
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setListingsLoading(true);
        const response = await getDashboardListingsRequest();
        if (response.data) {
          setPendingReview(response.data.pendingReview || []);
          setExpiringListings(response.data.expiringListings || []);
          setBlockedListings(response.data.blockedListings || []);
          setFlaggedListings(response.data.flaggedListings || []);
        }
      } catch (error: any) {
        console.error('Failed to fetch listings:', error);
        toast.error(error?.response?.data?.error || 'Failed to load listings data');
      } finally {
        setListingsLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Fetch financial data
  useEffect(() => {
    const fetchFinancial = async () => {
      try {
        setFinancialLoading(true);
        const response = await getDashboardFinancialRequest();
        if (response.data) {
          setFinancialData({
            monthlyIncome: response.data.monthlyIncome || 0,
            monthlyExpenses: response.data.monthlyExpenses || 0,
            netRevenue: response.data.netRevenue || 0,
          });
        }
      } catch (error: any) {
        console.error('Failed to fetch financial data:', error);
        toast.error(error?.response?.data?.error || 'Failed to load financial data');
      } finally {
        setFinancialLoading(false);
      }
    };

    fetchFinancial();
  }, []);

  // Chart configuration for income vs expense comparison
  const financialChartConfig: ChartConfig = {
    income: {
      label: "Income",
      color: "hsl(142, 76%, 36%)", // emerald-600
    },
    expense: {
      label: "Expense",
      color: "hsl(0, 84%, 60%)", // red-500
    },
  };

  // Prepare chart data
  const chartData = [
    {
      name: "This Month",
      income: financialData.monthlyIncome,
      expense: financialData.monthlyExpenses,
    },
  ];

  // Helper function to ensure at least 4 items are displayed
  const ensureMinItems = <T,>(items: T[], minCount: number = 4): (T | null)[] => {
    const sliced = items.slice(0, minCount);
    const placeholders = Array(Math.max(0, minCount - sliced.length)).fill(null);
    return [...sliced, ...placeholders];
  };

  // Refresh all dashboard data
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      toast.loading('Refreshing dashboard...', { id: 'refresh' });

      // Fetch all data in parallel
      const [
        metricsResponse,
        paymentsResponse,
        leasesResponse,
        screeningsResponse,
        maintenanceResponse,
        listingsResponse,
        financialResponse,
      ] = await Promise.all([
        getDashboardMetricsRequest(),
        getDashboardPaymentsRequest(),
        getDashboardLeasesRequest(),
        getDashboardScreeningsRequest(),
        getDashboardMaintenanceRequest(),
        getDashboardListingsRequest(),
        getDashboardFinancialRequest(),
      ]);

      // Update metrics
      if (metricsResponse.data?.metrics) {
        const metricsData = metricsResponse.data.metrics;
        setMetrics({
          totalProperties: metricsData.totalProperties || 0,
          totalUnits: metricsData.totalUnits || 0,
          advertisedUnits: metricsData.advertisedUnits || 0,
          blockedUnits: metricsData.blockedUnits || 0,
          flaggedListings: metricsData.flaggedListings || 0,
          waitingReview: metricsData.waitingReview || 0,
          occupiedUnits: metricsData.occupiedUnits || 0,
          vacantUnits: metricsData.vacantUnits || 0,
          underMaintenance: metricsData.underMaintenance || 0,
        });
      }
      if (metricsResponse.data?.details) {
        setDetails(metricsResponse.data.details);
      }

      // Update payments
      if (paymentsResponse.data) {
        // Filter out payments from ended/completed/terminated/cancelled leases
        const endedLeaseStatuses = ['ENDED', 'COMPLETED', 'TERMINATED', 'CANCELLED'];
        const overdue = (paymentsResponse.data.overduePayments || []).filter((payment: any) => {
          // If lease status is available, filter it out
          if (payment.lease?.status) {
            return !endedLeaseStatuses.includes(payment.lease.status);
          }
          // If status not available, include it (backend should have filtered already)
          return true;
        });
        const upcoming = (paymentsResponse.data.upcomingPayments || []).filter((payment: any) => {
          // If lease status is available, filter it out
          if (payment.lease?.status) {
            return !endedLeaseStatuses.includes(payment.lease.status);
          }
          // If status not available, include it (backend should have filtered already)
          return true;
        });
        setOverduePayments(overdue);
        setUpcomingPayments(upcoming);
      }

      // Update leases
      if (leasesResponse.data) {
        setPendingLeases(leasesResponse.data.pendingLeases || []);
        setCompletingLeases(leasesResponse.data.completingLeases || []);
      }

      // Update screenings
      if (screeningsResponse.data) {
        setPendingScreenings(screeningsResponse.data.pendingScreenings || []);
        setSubmittedScreenings(screeningsResponse.data.submittedScreenings || []);
      }

      // Update maintenance
      if (maintenanceResponse.data) {
        setOpenMaintenance(maintenanceResponse.data.openRequests || []);
        setInProgressMaintenance(maintenanceResponse.data.inProgressRequests || []);
      }

      // Update listings
      if (listingsResponse.data) {
        setPendingReview(listingsResponse.data.pendingReview || []);
        setExpiringListings(listingsResponse.data.expiringListings || []);
        setBlockedListings(listingsResponse.data.blockedListings || []);
        setFlaggedListings(listingsResponse.data.flaggedListings || []);
      }

      // Update financial
      if (financialResponse.data) {
        setFinancialData({
          monthlyIncome: financialResponse.data.monthlyIncome || 0,
          monthlyExpenses: financialResponse.data.monthlyExpenses || 0,
          netRevenue: financialResponse.data.netRevenue || 0,
        });
      }

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
      {/* Welcome Header Section - Open Creative Design */}
      <div className="relative">
        {/* Main Content - Floating Elements */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 relative"
          >
            {/* Gradient border line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-300/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-teal-200/40 via-cyan-200/50 to-emerald-200/40" />
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
                <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-600 text-white grid place-items-center shadow-2xl shadow-cyan-500/40">
                  <LayoutDashboard className="h-6 w-6 relative z-10" />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
                </div>
                {/* Floating greeting icon badge */}
                <motion.div
                  initial={{ scale: 0, rotate: -180, x: -5, y: -5 }}
                  animate={{ scale: 1, rotate: 0, x: 0, y: 0 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 15 }}
                  whileHover={{ scale: 1.1, rotate: 15 }}
                  className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white text-teal-600 border-2 border-teal-200 shadow-lg grid place-items-center backdrop-blur-sm"
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
                    <Sparkles className="h-5 w-5 text-emerald-500 drop-shadow-sm" />
                  </motion.div>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="flex items-center gap-2 text-sm"
                >
                  <span className="font-semibold text-teal-600">Landlord Dashboard</span>
                  <span className="h-1 w-1 rounded-full bg-teal-400" />
                  <span className="text-cyan-600">Property management hub</span>
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
                  className="flex items-center gap-2 hover:bg-teal-50 hover:border-teal-300 hover:text-teal-700 transition-colors"
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
              className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/60 shadow-xl shadow-cyan-500/10 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 via-cyan-500 to-emerald-500 text-white grid place-items-center shadow-lg">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-teal-700 leading-tight">
                  {currentDate}
                </span>
                <span className="text-xs text-cyan-600 leading-tight font-medium">
                  {currentYear}
                </span>
              </div>
            </motion.div>
          </div>
          </motion.div>
        </div>
      </div>

      {/* Property & Units Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="space-y-4"
      >
        {/* Section Header */}
        <div className="relative">
          <div className="flex items-center gap-3 pb-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 via-cyan-500 to-emerald-500 text-white grid place-items-center shadow-lg shadow-teal-500/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-slate-900">Property & Units</h2>
              <p className="text-xs text-slate-500 mt-0.5">Overview of your properties and unit statistics</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-200/50 to-transparent" />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {/* Total Properties */}
                <Card 
                  className="border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-teal-300"
                  onClick={() => setOpenModal('properties')}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <Home className="h-3.5 w-3.5 text-teal-600" />
                      <Eye className="h-3 w-3 text-slate-400" />
                    </div>
                    <p className="text-[10px] text-slate-600 mb-0.5">Total Properties</p>
                    <p className="text-lg font-bold text-slate-900">{metrics.totalProperties}</p>
                  </CardContent>
                </Card>

                {/* Total Units */}
                <Card 
                  className="border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-teal-300"
                  onClick={() => setOpenModal('allUnits')}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <Building2 className="h-3.5 w-3.5 text-teal-600" />
                      <Eye className="h-3 w-3 text-slate-400" />
                    </div>
                    <p className="text-[10px] text-slate-600 mb-0.5">Total Units</p>
                    <p className="text-lg font-bold text-teal-700">{metrics.totalUnits}</p>
                  </CardContent>
                </Card>

                {/* Vacant Units */}
                <Card 
                  className="border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-slate-300"
                  onClick={() => setOpenModal('vacantUnits')}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <XCircle className="h-3.5 w-3.5 text-slate-500" />
                      <Eye className="h-3 w-3 text-slate-400" />
                    </div>
                    <p className="text-[10px] text-slate-600 mb-0.5">Vacant Units</p>
                    <p className="text-lg font-bold text-slate-700">{metrics.vacantUnits}</p>
                  </CardContent>
                </Card>

                {/* Occupied Units */}
                <Card 
                  className="border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-emerald-300"
                  onClick={() => setOpenModal('occupiedUnits')}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
                      <Eye className="h-3 w-3 text-slate-400" />
                    </div>
                    <p className="text-[10px] text-slate-600 mb-0.5">Occupied Units</p>
                    <p className="text-lg font-bold text-emerald-700">{metrics.occupiedUnits}</p>
                  </CardContent>
                </Card>

                {/* Advertised Units */}
                <Card 
                  className="border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-cyan-300"
                  onClick={() => setOpenModal('advertisedUnits')}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <FileText className="h-3.5 w-3.5 text-cyan-600" />
                      <Eye className="h-3 w-3 text-slate-400" />
                    </div>
                    <p className="text-[10px] text-slate-600 mb-0.5">Advertised Units</p>
                    <p className="text-lg font-bold text-cyan-700">{metrics.advertisedUnits}</p>
                  </CardContent>
                </Card>
          </div>
        )}
      </motion.div>

      {/* Rent Payment & Lease Sections - Side by Side */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {/* Rent Payment Section - 50% */}
        <div className="space-y-4">
          {/* Section Header */}
          <div className="relative">
            <div className="flex items-center gap-3 pb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white grid place-items-center shadow-lg shadow-amber-500/20">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">Rent Payments</h2>
                <p className="text-xs text-slate-500 mt-0.5">Track overdue and upcoming rent payments</p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-200/50 to-transparent" />
          </div>

          <Card className="border border-slate-200 shadow-md shadow-slate-200/50 hover:shadow-lg hover:shadow-slate-200/60 transition-shadow">
            <CardContent className="p-4">
              {paymentsLoading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                  ))}
                </div>
              ) : overduePayments.length === 0 && upcomingPayments.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No payments to display</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Overdue Payments */}
                  {overduePayments.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                        <h3 className="text-xs font-semibold text-slate-700">Overdue</h3>
                        <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                          {overduePayments.length}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {ensureMinItems(overduePayments, 4).map((payment: any, index: number) => 
                          payment ? (
                            <div
                              key={payment.id}
                              className="p-2.5 rounded-lg border-l-4 border-rose-500 bg-rose-50/50 hover:bg-rose-50 transition-colors cursor-pointer"
                              onClick={() => navigate('/landlord/payments')}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-slate-900 truncate">
                                    {payment.lease?.tenant?.firstName} {payment.lease?.tenant?.lastName}
                                  </p>
                                  <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                                    {payment.lease?.unit?.label} - {payment.lease?.property?.title}
                                  </p>
                                  <p className="text-[10px] text-slate-500 mt-1">
                                    Due: {format(new Date(payment.dueDate), 'MMM d, yyyy')}
                                  </p>
                                </div>
                                <div className="text-right ml-2">
                                  <p className="text-xs font-bold text-rose-700">
                                    ₱{payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div key={`placeholder-overdue-${index}`} className="p-2.5 rounded-lg border-l-4 border-transparent bg-transparent" style={{ minHeight: '64px' }} />
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Upcoming Payments */}
                  {upcomingPayments.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                        <h3 className="text-xs font-semibold text-slate-700">Upcoming</h3>
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                          Next 7 days
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                          {upcomingPayments.length}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {ensureMinItems(upcomingPayments, 4).map((payment: any, index: number) => 
                          payment ? (
                            <div
                              key={payment.id}
                              className="p-2.5 rounded-lg border-l-4 border-amber-500 bg-amber-50/50 hover:bg-amber-50 transition-colors cursor-pointer"
                              onClick={() => navigate('/landlord/payments')}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-slate-900 truncate">
                                    {payment.lease?.tenant?.firstName} {payment.lease?.tenant?.lastName}
                                  </p>
                                  <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                                    {payment.lease?.unit?.label} - {payment.lease?.property?.title}
                                  </p>
                                  <p className="text-[10px] text-slate-500 mt-1">
                                    Due: {format(new Date(payment.dueDate), 'MMM d, yyyy')}
                                  </p>
                                </div>
                                <div className="text-right ml-2">
                                  <p className="text-xs font-bold text-amber-700">
                                    ₱{payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div key={`placeholder-upcoming-${index}`} className="p-2.5 rounded-lg border-l-4 border-transparent bg-transparent" style={{ minHeight: '64px' }} />
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* View All Payments Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 text-xs hover:bg-slate-50 hover:border-slate-300 transition-colors"
                    onClick={() => navigate('/landlord/payments')}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      View All Rent Payments
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Lease Section - 50% */}
        <div className="space-y-4">
          {/* Section Header */}
          <div className="relative">
            <div className="flex items-center gap-3 pb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white grid place-items-center shadow-lg shadow-blue-500/20">
                <FileCheck className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">Leases</h2>
                <p className="text-xs text-slate-500 mt-0.5">Monitor pending and expiring leases</p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200/50 to-transparent" />
          </div>

          <Card className="border border-slate-200 shadow-md shadow-slate-200/50 hover:shadow-lg hover:shadow-slate-200/60 transition-shadow">
            <CardContent className="p-4">
              {leasesLoading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                  ))}
                </div>
              ) : pendingLeases.length === 0 && completingLeases.length === 0 ? (
                <div className="text-center py-6">
                  <FileCheck className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No leases to display</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Pending Leases */}
                  {pendingLeases.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-3.5 w-3.5 text-blue-600" />
                        <h3 className="text-xs font-semibold text-slate-700">Pending</h3>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                          {pendingLeases.length}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {ensureMinItems(pendingLeases, 4).map((lease: any, index: number) => 
                          lease ? (
                            <div
                              key={lease.id}
                              className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                              onClick={() => navigate(`/landlord/leases/${lease.id}/details`)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-slate-900 truncate">
                                    {lease.tenant?.firstName} {lease.tenant?.lastName}
                                  </p>
                                  <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                                    {lease.unit?.label} - {lease.property?.title}
                                  </p>
                                  <p className="text-[10px] text-slate-500 mt-1">
                                    {lease.leaseNickname || 'Standard Lease'}
                                  </p>
                                </div>
                                <div className="text-right ml-2">
                                  <Badge variant="outline" className="text-[10px]">
                                    PENDING
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div key={`placeholder-pending-lease-${index}`} className="p-2.5 rounded-lg border border-transparent bg-transparent" style={{ minHeight: '64px' }} />
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Completing Leases (30 days) */}
                  {completingLeases.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-3.5 w-3.5 text-orange-600" />
                        <h3 className="text-xs font-semibold text-slate-700">Completing in 30 days</h3>
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                          {completingLeases.length}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {ensureMinItems(completingLeases, 4).map((lease: any, index: number) => 
                          lease ? (
                            <div
                              key={lease.id}
                              className="p-2.5 rounded-lg border-l-4 border-orange-500 bg-orange-50/50 hover:bg-orange-50 transition-colors cursor-pointer"
                              onClick={() => navigate(`/landlord/leases/${lease.id}/details`)}
                            >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-900 truncate">
                                  {lease.tenant?.firstName} {lease.tenant?.lastName}
                                </p>
                                <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                                  {lease.unit?.label} - {lease.property?.title}
                                </p>
                                <p className="text-[10px] text-slate-500 mt-1">
                                  Ends: {lease.endDate ? format(new Date(lease.endDate), 'MMM d, yyyy') : 'N/A'}
                                </p>
                              </div>
                              <div className="text-right ml-2">
                                <Badge variant="outline" className="text-[10px] border-orange-300 text-orange-700">
                                  COMPLETING
                                </Badge>
                              </div>
                            </div>
                          </div>
                          ) : (
                            <div key={`placeholder-completing-lease-${index}`} className="p-2.5 rounded-lg border-l-4 border-transparent bg-transparent" style={{ minHeight: '64px' }} />
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* View All Leases Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 text-xs hover:bg-slate-50 hover:border-slate-300 transition-colors"
                    onClick={() => navigate('/landlord/leases')}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      View All Leases
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Tenant Screening & Maintenance Sections - Side by Side */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {/* Tenant Screening Section - 50% */}
        <div className="space-y-4">
          {/* Section Header */}
          <div className="relative">
            <div className="flex items-center gap-3 pb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 text-white grid place-items-center shadow-lg shadow-purple-500/20">
                <UserCheck className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">Tenant Screening</h2>
                <p className="text-xs text-slate-500 mt-0.5">Review pending and submitted screenings</p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-200/50 to-transparent" />
          </div>

          <Card className="border border-slate-200 shadow-md shadow-slate-200/50 hover:shadow-lg hover:shadow-slate-200/60 transition-shadow">
            <CardContent className="p-4">
              {screeningsLoading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                  ))}
                </div>
              ) : pendingScreenings.length === 0 && submittedScreenings.length === 0 ? (
                <div className="text-center py-6">
                  <UserCheck className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No screenings to display</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Pending Screenings */}
                  {pendingScreenings.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                        <h3 className="text-xs font-semibold text-slate-700">Pending</h3>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                          {pendingScreenings.length}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {ensureMinItems(pendingScreenings, 4).map((screening: any, index: number) => 
                          screening ? (
                            <div
                              key={screening.id}
                              className="p-2.5 rounded-lg border-l-4 border-amber-500 bg-amber-50/50 hover:bg-amber-50 transition-colors cursor-pointer"
                              onClick={() => navigate(`/landlord/screening/${screening.id}/details`)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-slate-900 truncate">
                                    {screening.fullName || `${screening.tenant?.firstName} ${screening.tenant?.lastName}`}
                                  </p>
                                  <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                                    {screening.tenant?.email}
                                  </p>
                                  <p className="text-[10px] text-slate-500 mt-1">
                                    Created: {format(new Date(screening.createdAt), 'MMM d, yyyy')}
                                  </p>
                                </div>
                                <div className="text-right ml-2">
                                  <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700">
                                    PENDING
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div key={`placeholder-pending-screening-${index}`} className="p-2.5 rounded-lg border-l-4 border-transparent bg-transparent" style={{ minHeight: '64px' }} />
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Submitted Screenings */}
                  {submittedScreenings.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileCheck className="h-3.5 w-3.5 text-indigo-600" />
                        <h3 className="text-xs font-semibold text-slate-700">Submitted</h3>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                          {submittedScreenings.length}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {ensureMinItems(submittedScreenings, 4).map((screening: any, index: number) => 
                          screening ? (
                            <div
                              key={screening.id}
                              className="p-2.5 rounded-lg border-l-4 border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50 transition-colors cursor-pointer"
                              onClick={() => navigate(`/landlord/screening/${screening.id}/details`)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-slate-900 truncate">
                                    {screening.fullName || `${screening.tenant?.firstName} ${screening.tenant?.lastName}`}
                                  </p>
                                  <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                                    {screening.tenant?.email}
                                  </p>
                                  <p className="text-[10px] text-slate-500 mt-1">
                                    Submitted: {screening.submitted ? format(new Date(screening.submitted), 'MMM d, yyyy') : 'N/A'}
                                  </p>
                                </div>
                                <div className="text-right ml-2">
                                  <Badge variant="outline" className="text-[10px] border-indigo-300 text-indigo-700">
                                    SUBMITTED
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div key={`placeholder-submitted-screening-${index}`} className="p-2.5 rounded-lg border-l-4 border-transparent bg-transparent" style={{ minHeight: '64px' }} />
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* View All Screenings Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 text-xs hover:bg-slate-50 hover:border-slate-300 transition-colors"
                    onClick={() => navigate('/landlord/screening')}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      View All Screenings
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Maintenance Section - 50% */}
        <div className="space-y-4">
          {/* Section Header */}
          <div className="relative">
            <div className="flex items-center gap-3 pb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 via-red-500 to-rose-500 text-white grid place-items-center shadow-lg shadow-orange-500/20">
                <Wrench className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">Maintenance</h2>
                <p className="text-xs text-slate-500 mt-0.5">Track open and in-progress requests</p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-200/50 to-transparent" />
          </div>

          <Card className="border border-slate-200 shadow-md shadow-slate-200/50 hover:shadow-lg hover:shadow-slate-200/60 transition-shadow">
            <CardContent className="p-4">
              {maintenanceLoading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                  ))}
                </div>
              ) : openMaintenance.length === 0 && inProgressMaintenance.length === 0 ? (
                <div className="text-center py-6">
                  <Wrench className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No maintenance requests to display</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Open Maintenance */}
                  {openMaintenance.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                        <h3 className="text-xs font-semibold text-slate-700">Open</h3>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                          {openMaintenance.length}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {ensureMinItems(openMaintenance, 4).map((maintenance: any, index: number) => 
                          maintenance ? (
                            <div
                              key={maintenance.id}
                              className="p-2.5 rounded-lg border-l-4 border-amber-500 bg-amber-50/50 hover:bg-amber-50 transition-colors cursor-pointer"
                              onClick={() => navigate('/landlord/maintenance')}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-slate-900 truncate">
                                    {maintenance.reporter?.firstName} {maintenance.reporter?.lastName}
                                  </p>
                                  <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                                    {maintenance.unit?.label} - {maintenance.property?.title}
                                  </p>
                                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                                    {maintenance.description}
                                  </p>
                                </div>
                                <div className="text-right ml-2">
                                  <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700">
                                    OPEN
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div key={`placeholder-open-maintenance-${index}`} className="p-2.5 rounded-lg border-l-4 border-transparent bg-transparent" style={{ minHeight: '64px' }} />
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* In-Progress Maintenance */}
                  {inProgressMaintenance.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-3.5 w-3.5 text-blue-600" />
                        <h3 className="text-xs font-semibold text-slate-700">In-Progress</h3>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                          {inProgressMaintenance.length}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {ensureMinItems(inProgressMaintenance, 4).map((maintenance: any, index: number) => 
                          maintenance ? (
                            <div
                              key={maintenance.id}
                              className="p-2.5 rounded-lg border-l-4 border-blue-500 bg-blue-50/50 hover:bg-blue-50 transition-colors cursor-pointer"
                              onClick={() => navigate('/landlord/maintenance')}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-slate-900 truncate">
                                    {maintenance.reporter?.firstName} {maintenance.reporter?.lastName}
                                  </p>
                                  <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                                    {maintenance.unit?.label} - {maintenance.property?.title}
                                  </p>
                                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                                    {maintenance.description}
                                  </p>
                                </div>
                                <div className="text-right ml-2">
                                  <Badge variant="outline" className="text-[10px] border-blue-300 text-blue-700">
                                    IN PROGRESS
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div key={`placeholder-inprogress-maintenance-${index}`} className="p-2.5 rounded-lg border-l-4 border-transparent bg-transparent" style={{ minHeight: '64px' }} />
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* View All Maintenance Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 text-xs hover:bg-slate-50 hover:border-slate-300 transition-colors"
                    onClick={() => navigate('/landlord/maintenance')}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      View All Maintenance
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Listings & Financial Sections - Side by Side */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {/* Listings Section - 50% */}
        <div className="space-y-4">
          {/* Section Header */}
          <div className="relative">
            <div className="flex items-center gap-3 pb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500 text-white grid place-items-center shadow-lg shadow-purple-500/20">
                <Megaphone className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">Listings / Advertising</h2>
                <p className="text-xs text-slate-500 mt-0.5">Monitor listing status and issues</p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-200/50 to-transparent" />
          </div>

          <Card className="border border-slate-200 shadow-md shadow-slate-200/50 hover:shadow-lg hover:shadow-slate-200/60 transition-shadow">
            <CardContent className="p-4">
              {listingsLoading ? (
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                  ))}
                </div>
              ) : pendingReview.length === 0 && expiringListings.length === 0 && blockedListings.length === 0 && flaggedListings.length === 0 ? (
                <div className="text-center py-6">
                  <Megaphone className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No listings to display</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Pending Review */}
                  {pendingReview.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-3.5 w-3.5 text-purple-600" />
                        <h3 className="text-xs font-semibold text-slate-700">Pending Review</h3>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                          {pendingReview.length}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {ensureMinItems(pendingReview, 4).map((listing: any, index: number) => 
                          listing ? (
                            <div
                              key={listing.id}
                              className="p-2.5 rounded-lg border-l-4 border-purple-500 bg-purple-50/50 hover:bg-purple-50 transition-colors cursor-pointer"
                              onClick={() => navigate(`/landlord/listing/${listing.id}/details`)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-slate-900 truncate">
                                    {listing.unit?.label} - {listing.property?.title}
                                  </p>
                                  <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                                    {listing.property?.address}
                                  </p>
                                </div>
                                <div className="text-right ml-2">
                                  <Badge variant="outline" className="text-[10px] border-purple-300 text-purple-700">
                                    WAITING_REVIEW
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div key={`placeholder-pending-review-${index}`} className="p-2.5 rounded-lg border-l-4 border-transparent bg-transparent" style={{ minHeight: '64px' }} />
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Expiring in 30 days */}
                  {expiringListings.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-3.5 w-3.5 text-orange-600" />
                        <h3 className="text-xs font-semibold text-slate-700">Expiring in 30 days</h3>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                          {expiringListings.length}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {ensureMinItems(expiringListings, 4).map((listing: any, index: number) => 
                          listing ? (
                            <div
                              key={listing.id}
                              className="p-2.5 rounded-lg border-l-4 border-orange-500 bg-orange-50/50 hover:bg-orange-50 transition-colors cursor-pointer"
                              onClick={() => navigate(`/landlord/listing/${listing.id}/details`)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-slate-900 truncate">
                                    {listing.unit?.label} - {listing.property?.title}
                                  </p>
                                  <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                                    Expires: {listing.expiresAt ? format(new Date(listing.expiresAt), 'MMM d, yyyy') : 'N/A'}
                                  </p>
                                </div>
                                <div className="text-right ml-2">
                                  <Badge variant="outline" className="text-[10px] border-orange-300 text-orange-700">
                                    {listing.lifecycleStatus}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div key={`placeholder-expiring-${index}`} className="p-2.5 rounded-lg border-l-4 border-transparent bg-transparent" style={{ minHeight: '64px' }} />
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Blocked this month */}
                  {blockedListings.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="h-3.5 w-3.5 text-rose-600" />
                        <h3 className="text-xs font-semibold text-slate-700">Blocked this month</h3>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                          {blockedListings.length}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {ensureMinItems(blockedListings, 4).map((listing: any, index: number) => 
                          listing ? (
                            <div
                              key={listing.id}
                              className="p-2.5 rounded-lg border-l-4 border-rose-500 bg-rose-50/50 hover:bg-rose-50 transition-colors cursor-pointer"
                              onClick={() => navigate(`/landlord/listing/${listing.id}/details`)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-slate-900 truncate">
                                    {listing.unit?.label} - {listing.property?.title}
                                  </p>
                                  <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                                    Blocked: {listing.blockedAt ? format(new Date(listing.blockedAt), 'MMM d, yyyy') : 'N/A'}
                                  </p>
                                </div>
                                <div className="text-right ml-2">
                                  <Badge variant="destructive" className="text-[10px]">
                                    BLOCKED
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div key={`placeholder-blocked-${index}`} className="p-2.5 rounded-lg border-l-4 border-transparent bg-transparent" style={{ minHeight: '64px' }} />
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Flagged Listings */}
                  {flaggedListings.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                        <h3 className="text-xs font-semibold text-slate-700">Flagged</h3>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                          {flaggedListings.length}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {ensureMinItems(flaggedListings, 4).map((listing: any, index: number) => 
                          listing ? (
                            <div
                              key={listing.id}
                              className="p-2.5 rounded-lg border-l-4 border-amber-500 bg-amber-50/50 hover:bg-amber-50 transition-colors cursor-pointer"
                              onClick={() => navigate(`/landlord/listing/${listing.id}/details`)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-slate-900 truncate">
                                    {listing.unit?.label} - {listing.property?.title}
                                  </p>
                                  <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                                    Flagged: {listing.flaggedAt ? format(new Date(listing.flaggedAt), 'MMM d, yyyy') : 'N/A'}
                                  </p>
                                </div>
                                <div className="text-right ml-2">
                                  <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700">
                                    FLAGGED
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div key={`placeholder-flagged-${index}`} className="p-2.5 rounded-lg border-l-4 border-transparent bg-transparent" style={{ minHeight: '64px' }} />
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* View All Listings Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 text-xs hover:bg-slate-50 hover:border-slate-300 transition-colors"
                    onClick={() => navigate('/landlord/listing')}
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

        {/* Financial Activity Section - 50% */}
        <div className="space-y-4">
          {/* Section Header */}
          <div className="relative">
            <div className="flex items-center gap-3 pb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white grid place-items-center shadow-lg shadow-emerald-500/20">
                <DollarSign className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">Financial Activity</h2>
                <p className="text-xs text-slate-500 mt-0.5">Income, expenses, and revenue overview</p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-200/50 to-transparent" />
          </div>

          <Card className="border border-slate-200 shadow-md shadow-slate-200/50 hover:shadow-lg hover:shadow-slate-200/60 transition-shadow">
            <CardContent className="p-4">
              {financialLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-32 rounded-lg" />
                  <Skeleton className="h-32 rounded-lg" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                      <p className="text-[10px] text-emerald-700 mb-1">Income</p>
                      <p className="text-sm font-bold text-emerald-900">
                        ₱{financialData.monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                      <p className="text-[10px] text-rose-700 mb-1">Expenses</p>
                      <p className="text-sm font-bold text-rose-900">
                        ₱{financialData.monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className={`p-2.5 rounded-lg border ${financialData.netRevenue >= 0 ? 'bg-teal-50 border-teal-200' : 'bg-red-50 border-red-200'}`}>
                      <p className={`text-[10px] mb-1 ${financialData.netRevenue >= 0 ? 'text-teal-700' : 'text-red-700'}`}>Net Revenue</p>
                      <p className={`text-sm font-bold ${financialData.netRevenue >= 0 ? 'text-teal-900' : 'text-red-900'}`}>
                        ₱{financialData.netRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Income vs Expense Comparison Chart */}
                  {(financialData.monthlyIncome > 0 || financialData.monthlyExpenses > 0) ? (
                    <div>
                      <h3 className="text-xs font-semibold text-slate-700 mb-2">This Month Comparison</h3>
                      <ChartContainer config={financialChartConfig} className="h-[200px]">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            axisLine={{ stroke: '#cbd5e1' }}
                          />
                          <YAxis 
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            axisLine={{ stroke: '#cbd5e1' }}
                            tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                          />
                          <ChartTooltip 
                            content={<ChartTooltipContent />}
                            formatter={(value: number) => `₱${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                          />
                          <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
                          <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expense" />
                        </BarChart>
                      </ChartContainer>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <DollarSign className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">No financial data for this month</p>
                    </div>
                  )}

                  {/* View All Financials Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 text-xs hover:bg-slate-50 hover:border-slate-300 transition-colors"
                    onClick={() => navigate('/landlord/financials')}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      View All Financials
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Modals */}
      {/* Properties Modal */}
      <Dialog open={openModal === 'properties'} onOpenChange={(open) => !open && setOpenModal(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>All Properties</DialogTitle>
            <DialogDescription>
              List of all your properties with their addresses
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            {details.properties.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No properties found</p>
            ) : (
              <div className="space-y-2">
                {details.properties.map((property: any) => (
                  <div
                    key={property.id}
                    className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setOpenModal(null);
                      navigate(`/landlord/property/${property.id}`);
                    }}
                  >
                    <p className="text-sm font-semibold text-slate-900">{property.title}</p>
                    <p className="text-xs text-slate-600 mt-1">{property.address}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* All Units Modal */}
      <Dialog open={openModal === 'allUnits'} onOpenChange={(open) => !open && setOpenModal(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>All Units</DialogTitle>
            <DialogDescription>
              List of all units with their property information
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            {details.allUnits.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No units found</p>
            ) : (
              <div className="space-y-2">
                {details.allUnits.map((unit: any) => (
                  <div
                    key={unit.id}
                    className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setOpenModal(null);
                      navigate(`/landlord/unit/${unit.id}`);
                    }}
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {unit.label} - {unit.propertyTitle}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">{unit.propertyAddress}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Vacant Units Modal */}
      <Dialog open={openModal === 'vacantUnits'} onOpenChange={(open) => !open && setOpenModal(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Vacant Units</DialogTitle>
            <DialogDescription>
              Units that are currently not occupied
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            {details.vacantUnits.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No vacant units</p>
            ) : (
              <div className="space-y-2">
                {details.vacantUnits.map((unit: any) => (
                  <div
                    key={unit.id}
                    className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setOpenModal(null);
                      navigate(`/landlord/unit/${unit.id}`);
                    }}
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {unit.label} - {unit.propertyTitle}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">{unit.propertyAddress}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Occupied Units Modal */}
      <Dialog open={openModal === 'occupiedUnits'} onOpenChange={(open) => !open && setOpenModal(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Occupied Units</DialogTitle>
            <DialogDescription>
              Units that currently have active leases
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            {details.occupiedUnits.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No occupied units</p>
            ) : (
              <div className="space-y-2">
                {details.occupiedUnits.map((unit: any) => (
                  <div
                    key={unit.id}
                    className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setOpenModal(null);
                      navigate(`/landlord/unit/${unit.id}`);
                    }}
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {unit.label} - {unit.propertyTitle}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">{unit.propertyAddress}</p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Advertised Units Modal */}
      <Dialog open={openModal === 'advertisedUnits'} onOpenChange={(open) => !open && setOpenModal(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Advertised Units</DialogTitle>
            <DialogDescription>
              Units with active listings (VISIBLE or HIDDEN status)
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 pr-4">
            {details.advertisedUnits.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No advertised units</p>
            ) : (
              <div className="space-y-2">
                {details.advertisedUnits.map((unit: any) => (
                  <div
                    key={unit.id}
                    className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setOpenModal(null);
                      navigate('/landlord/listing');
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">
                          {unit.label} - {unit.propertyTitle}
                        </p>
                        <p className="text-xs text-slate-600 mt-1">{unit.propertyAddress}</p>
                      </div>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {unit.listingStatus}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandlordDashboard;
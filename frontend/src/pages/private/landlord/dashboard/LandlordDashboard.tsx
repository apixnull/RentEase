import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  Calendar, 
  Sun, 
  Moon, 
  Sunset, 
  Sparkles, 
  RefreshCcw, 
  Home, 
  Building2, 
  FileCheck, 
  Loader2,
  CreditCard,
  AlertCircle,
  Clock,
  UserCheck,
  Wrench,
  Megaphone,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getDashboardPaymentsRequest, getDashboardLeasesRequest, getDashboardScreeningsRequest, getDashboardMaintenanceRequest, getDashboardListingsRequest } from '@/api/landlord/dashboardApi';

const LandlordDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  // Helper function to safely format dates
  const formatDate = (dateValue: any, formatString: string = 'MMM d, yyyy'): string => {
    if (!dateValue) return 'N/A';
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'N/A';
    try {
      return format(date, formatString);
    } catch (error) {
      return 'N/A';
    }
  };

  // Helper function to get the most recent date (updatedAt if more recent than createdAt, otherwise createdAt)
  const getMostRecentDate = (item: any): number => {
    const createdAt = item.createdAt ? new Date(item.createdAt).getTime() : 0;
    const updatedAt = item.updatedAt ? new Date(item.updatedAt).getTime() : 0;
    if (isNaN(createdAt) && isNaN(updatedAt)) return 0;
    if (isNaN(createdAt)) return updatedAt;
    if (isNaN(updatedAt)) return createdAt;
    return Math.max(createdAt, updatedAt);
  };

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

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Rent Payments
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [overduePayments, setOverduePayments] = useState<any[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<any[]>([]);
  const [dueTodayPayments, setDueTodayPayments] = useState<any[]>([]);
  
  // Leases
  const [leasesLoading, setLeasesLoading] = useState(true);
  const [recentLeases, setRecentLeases] = useState<any[]>([]);
  
  // Listings
  const [listingsLoading, setListingsLoading] = useState(true);
  const [recentListings, setRecentListings] = useState<any[]>([]);
  
  // Maintenance
  const [maintenanceLoading, setMaintenanceLoading] = useState(true);
  const [recentMaintenance, setRecentMaintenance] = useState<any[]>([]);
  
  // Tenant Screening
  const [screeningsLoading, setScreeningsLoading] = useState(true);
  const [recentScreenings, setRecentScreenings] = useState<any[]>([]);

  // Fetch all dashboard data
  const fetchDashboard = async ({ silent = false }: { silent?: boolean } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
        setPaymentsLoading(true);
        setLeasesLoading(true);
        setListingsLoading(true);
        setMaintenanceLoading(true);
        setScreeningsLoading(true);
      } else {
        setRefreshing(true);
      }

      // Fetch all data in parallel
      const [
        paymentsResponse,
        leasesResponse,
        listingsResponse,
        maintenanceResponse,
        screeningsResponse,
      ] = await Promise.all([
        getDashboardPaymentsRequest(),
        getDashboardLeasesRequest(),
        getDashboardListingsRequest(),
        getDashboardMaintenanceRequest(),
        getDashboardScreeningsRequest(),
      ]);

      // Update payments
      if (paymentsResponse.data) {
        const endedLeaseStatuses = ['ENDED', 'COMPLETED', 'TERMINATED', 'CANCELLED'];
        const allPayments = [...(paymentsResponse.data.overduePayments || []), ...(paymentsResponse.data.upcomingPayments || [])];
        
        const overdue = allPayments.filter((payment: any) => {
          if (payment.lease?.status && endedLeaseStatuses.includes(payment.lease.status)) return false;
          if (!payment.dueDate) return false;
          const dueDate = new Date(payment.dueDate);
          if (isNaN(dueDate.getTime())) return false;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return dueDate < today;
        });
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const dueToday = allPayments.filter((payment: any) => {
          if (payment.lease?.status && endedLeaseStatuses.includes(payment.lease.status)) return false;
          if (!payment.dueDate) return false;
          const dueDate = new Date(payment.dueDate);
          if (isNaN(dueDate.getTime())) return false;
          dueDate.setHours(0, 0, 0, 0);
          return dueDate.getTime() === today.getTime();
        });
        
        const upcoming = allPayments.filter((payment: any) => {
          if (payment.lease?.status && endedLeaseStatuses.includes(payment.lease.status)) return false;
          if (!payment.dueDate) return false;
          const dueDate = new Date(payment.dueDate);
          if (isNaN(dueDate.getTime())) return false;
          dueDate.setHours(0, 0, 0, 0);
          return dueDate >= tomorrow;
        });
        
        setOverduePayments(overdue.slice(0, 5));
        setDueTodayPayments(dueToday.slice(0, 5));
        setUpcomingPayments(upcoming.slice(0, 5));
      }

      // Update leases - combine all and sort by most recent
      if (leasesResponse.data) {
        const allLeases = [
          ...(leasesResponse.data.pendingLeases || []),
          ...(leasesResponse.data.completingLeases || []),
          ...(leasesResponse.data.recentLeases || []),
        ];
        // Remove duplicates by id
        const uniqueLeases = Array.from(new Map(allLeases.map((lease: any) => [lease.id, lease])).values());
        // Sort by most recent date (updatedAt if more recent than createdAt)
        const sortedLeases = uniqueLeases.sort((a: any, b: any) => {
          return getMostRecentDate(b) - getMostRecentDate(a);
        });
        setRecentLeases(sortedLeases.slice(0, 5));
      }

      // Update listings - get recent listings from API
      if (listingsResponse.data) {
        setRecentListings(listingsResponse.data.recentListings || []);
      }

      // Update maintenance - combine all and sort by most recent
      if (maintenanceResponse.data) {
        const allMaintenance = [
          ...(maintenanceResponse.data.openMaintenance || []),
          ...(maintenanceResponse.data.recentMaintenance || []),
        ];
        // Remove duplicates by id
        const uniqueMaintenance = Array.from(new Map(allMaintenance.map((m: any) => [m.id, m])).values());
        // Sort by most recent date (updatedAt if more recent than createdAt)
        const sortedMaintenance = uniqueMaintenance.sort((a: any, b: any) => {
          return getMostRecentDate(b) - getMostRecentDate(a);
        });
        setRecentMaintenance(sortedMaintenance.slice(0, 5));
      }

      // Update screenings - combine all and sort by most recent
      if (screeningsResponse.data) {
        const allScreenings = [
          ...(screeningsResponse.data.pendingScreenings || []),
          ...(screeningsResponse.data.submittedScreenings || []),
          ...(screeningsResponse.data.recentScreenings || []),
        ];
        // Remove duplicates by id
        const uniqueScreenings = Array.from(new Map(allScreenings.map((s: any) => [s.id, s])).values());
        // Sort by most recent date (updatedAt if more recent than createdAt)
        const sortedScreenings = uniqueScreenings.sort((a: any, b: any) => {
          return getMostRecentDate(b) - getMostRecentDate(a);
        });
        setRecentScreenings(sortedScreenings.slice(0, 5));
      }

    } catch (error: any) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      if (!silent) {
        setLoading(false);
        setPaymentsLoading(false);
        setLeasesLoading(false);
        setListingsLoading(false);
        setMaintenanceLoading(false);
        setScreeningsLoading(false);
      }
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Refresh all data
  const handleRefresh = () => {
    fetchDashboard({ silent: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative overflow-hidden rounded-2xl"
        >
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-teal-200/80 via-cyan-200/75 to-emerald-200/70 opacity-95" />
          <div className="relative m-[1px] rounded-[16px] bg-white/85 backdrop-blur-lg border border-white/60 shadow-lg">
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -top-12 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-teal-300/50 to-cyan-400/40 blur-3xl"
              initial={{ opacity: 0.4, scale: 0.85 }}
              animate={{ opacity: 0.7, scale: 1.05 }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-tl from-emerald-200/40 to-cyan-200/35 blur-3xl"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 3.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            />

            <div className="px-4 sm:px-6 py-5 space-y-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <motion.div
                    whileHover={{ scale: 1.05, rotate: [0, -3, 3, 0] }}
                    className="relative flex-shrink-0"
                  >
                    <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-600 text-white grid place-items-center shadow-xl shadow-cyan-500/30">
                      <Home className="h-5 w-5 relative z-10" />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                    </div>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 220 }}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white text-teal-600 border border-teal-100 shadow-sm grid place-items-center"
                    >
                      {getGreetingIcon()}
                    </motion.div>
                    <motion.div
                      className="absolute inset-0 rounded-2xl border-2 border-cyan-400/30"
                      animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-lg sm:text-2xl font-semibold tracking-tight text-slate-900 truncate">
                        {getGreeting()}
                      </h1>
                      <motion.div
                        animate={{ rotate: [0, 8, -8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Sparkles className="h-4 w-4 text-emerald-500" />
                      </motion.div>
                    </div>
                    <p className="text-sm text-slate-600 leading-6 flex items-center gap-1.5">
                      <Building2 className="h-4 w-4 text-teal-500" />
                      Property management hub
                    </p>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
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
                  <Button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="h-11 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 px-5 text-sm font-semibold text-white shadow-md shadow-cyan-500/30 hover:brightness-110 disabled:opacity-70"
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
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
                style={{ originX: 0 }}
                className="relative h-1 w-full rounded-full overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-teal-400/80 via-cyan-400/80 to-emerald-400/80" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rent Payments Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="space-y-4"
          >
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white grid place-items-center shadow-lg">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Rent Payments</CardTitle>
                      <CardDescription>Track overdue, due today, and upcoming payments</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/landlord/payments')}
                    className="h-8"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                {paymentsLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 rounded-lg" />
                    ))}
                  </div>
                ) : overduePayments.length === 0 && dueTodayPayments.length === 0 && upcomingPayments.length === 0 ? (
                  <div className="text-center py-6">
                    <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No payments to display</p>
                  </div>
                ) : (
                  <div className="space-y-4">
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
                          {overduePayments.map((payment: any) => (
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
                                    Due: {formatDate(payment.dueDate)}
                                  </p>
                                </div>
                                <div className="text-right ml-2">
                                  <p className="text-xs font-bold text-rose-700">
                                    ₱{payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Due Today Payments */}
                    {dueTodayPayments.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-3.5 w-3.5 text-orange-600" />
                          <h3 className="text-xs font-semibold text-slate-700">Due Today</h3>
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-orange-300 text-orange-700">
                            {dueTodayPayments.length}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {dueTodayPayments.map((payment: any) => (
                            <div
                              key={payment.id}
                              className="p-2.5 rounded-lg border-l-4 border-orange-500 bg-orange-50/50 hover:bg-orange-50 transition-colors cursor-pointer"
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
                                    Due: {formatDate(payment.dueDate)}
                                  </p>
                                </div>
                                <div className="text-right ml-2">
                                  <p className="text-xs font-bold text-orange-700">
                                    ₱{payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upcoming Payments */}
                    {upcomingPayments.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-3.5 w-3.5 text-blue-600" />
                          <h3 className="text-xs font-semibold text-slate-700">Upcoming</h3>
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                            Next 7 days
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                            {upcomingPayments.length}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {upcomingPayments.map((payment: any) => (
                            <div
                              key={payment.id}
                              className="p-2.5 rounded-lg border-l-4 border-blue-500 bg-blue-50/50 hover:bg-blue-50 transition-colors cursor-pointer"
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
                                    Due: {formatDate(payment.dueDate)}
                                  </p>
                                </div>
                                <div className="text-right ml-2">
                                  <p className="text-xs font-bold text-blue-700">
                                    ₱{payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Leases Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="space-y-4"
          >
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white grid place-items-center shadow-lg">
                      <FileCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Leases</CardTitle>
                      <CardDescription>Recent lease activity</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/landlord/leases')}
                    className="h-8"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                {leasesLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 rounded-lg" />
                    ))}
                  </div>
                ) : recentLeases.length === 0 ? (
                  <div className="text-center py-6">
                    <FileCheck className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No leases to display</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentLeases.map((lease: any) => {
                      const statusColors: Record<string, string> = {
                        PENDING: 'border-amber-500 bg-amber-50/50',
                        ACTIVE: 'border-emerald-500 bg-emerald-50/50',
                        COMPLETED: 'border-blue-500 bg-blue-50/50',
                        TERMINATED: 'border-red-500 bg-red-50/50',
                        CANCELLED: 'border-gray-500 bg-gray-50/50',
                      };
                      const statusTextColors: Record<string, string> = {
                        PENDING: 'text-amber-700',
                        ACTIVE: 'text-emerald-700',
                        COMPLETED: 'text-blue-700',
                        TERMINATED: 'text-red-700',
                        CANCELLED: 'text-gray-700',
                      };
                      return (
                              <div
                                key={lease.id}
                                className={`p-2.5 rounded-lg border-l-4 ${statusColors[lease.status] || 'border-slate-500 bg-slate-50/50'} hover:opacity-80 transition-colors cursor-pointer`}
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
                                      {lease.updatedAt && new Date(lease.updatedAt).getTime() > (lease.createdAt ? new Date(lease.createdAt).getTime() : 0)
                                        ? `Updated: ${formatDate(lease.updatedAt)}`
                                        : `Created: ${formatDate(lease.createdAt)}`}
                                    </p>
                                  </div>
                                  <div className="text-right ml-2">
                                    <Badge variant="outline" className={`text-[10px] ${statusTextColors[lease.status] || 'text-slate-700'}`}>
                                      {lease.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Listings / Advertising Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            className="space-y-4"
          >
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 text-white grid place-items-center shadow-lg">
                      <Megaphone className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Recent Listings</CardTitle>
                      <CardDescription>Your recent listing activity</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/landlord/listing')}
                    className="h-8"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                {listingsLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 rounded-lg" />
                    ))}
                  </div>
                ) : recentListings.length === 0 ? (
                  <div className="text-center py-6">
                    <Megaphone className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No recent listings</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentListings.map((listing: any) => {
                      const statusColors: Record<string, string> = {
                        VISIBLE: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                        HIDDEN: 'bg-teal-100 text-teal-700 border-teal-200',
                        FLAGGED: 'bg-amber-100 text-amber-700 border-amber-200',
                        BLOCKED: 'bg-red-100 text-red-700 border-red-200',
                        WAITING_REVIEW: 'bg-purple-100 text-purple-700 border-purple-200',
                        EXPIRED: 'bg-gray-100 text-gray-700 border-gray-200',
                      };
                      return (
                        <div
                          key={listing.id}
                          className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/landlord/listing/${listing.id}/details`)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-900 truncate">
                                {listing.unit?.label} - {listing.property?.title}
                              </p>
                              <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                                {listing.property?.address || 'Address not available'}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <Badge className={`text-[10px] ${statusColors[listing.lifecycleStatus] || 'bg-slate-100 text-slate-700'}`}>
                                {listing.lifecycleStatus?.replace(/_/g, ' ')}
                              </Badge>
                              {listing.isFeatured && (
                                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] border-0">
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-2">
                            {formatDate(listing.createdAt || listing.updatedAt)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Maintenance Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            className="space-y-4"
          >
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 via-red-500 to-rose-500 text-white grid place-items-center shadow-lg">
                      <Wrench className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Maintenance</CardTitle>
                      <CardDescription>Recent maintenance requests</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/landlord/maintenance')}
                    className="h-8"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                {maintenanceLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 rounded-lg" />
                    ))}
                  </div>
                ) : recentMaintenance.length === 0 ? (
                  <div className="text-center py-6">
                    <Wrench className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No maintenance requests</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentMaintenance.map((maintenance: any) => {
                      const statusColors: Record<string, string> = {
                        OPEN: 'border-amber-500 bg-amber-50/50',
                        IN_PROGRESS: 'border-blue-500 bg-blue-50/50',
                        COMPLETED: 'border-emerald-500 bg-emerald-50/50',
                        CANCELLED: 'border-gray-500 bg-gray-50/50',
                      };
                      const statusTextColors: Record<string, string> = {
                        OPEN: 'text-amber-700',
                        IN_PROGRESS: 'text-blue-700',
                        COMPLETED: 'text-emerald-700',
                        CANCELLED: 'text-gray-700',
                      };
                      return (
                        <div
                          key={maintenance.id}
                          className={`p-2.5 rounded-lg border-l-4 ${statusColors[maintenance.status] || 'border-slate-500 bg-slate-50/50'} hover:opacity-80 transition-colors cursor-pointer`}
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
                              <p className="text-[10px] text-slate-500 mt-1">
                                {maintenance.updatedAt && new Date(maintenance.updatedAt).getTime() > (maintenance.createdAt ? new Date(maintenance.createdAt).getTime() : 0)
                                  ? `Updated: ${formatDate(maintenance.updatedAt)}`
                                  : `Created: ${formatDate(maintenance.createdAt)}`}
                              </p>
                            </div>
                            <div className="text-right ml-2">
                              <Badge variant="outline" className={`text-[10px] ${statusTextColors[maintenance.status] || 'text-slate-700'}`}>
                                {maintenance.status || 'RECENT'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Tenant Screening Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.9 }}
            className="space-y-4"
          >
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 text-white grid place-items-center shadow-lg">
                      <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Tenant Screening</CardTitle>
                      <CardDescription>Recent screening activity</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/landlord/screening')}
                    className="h-8"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                {screeningsLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 rounded-lg" />
                    ))}
                  </div>
                ) : recentScreenings.length === 0 ? (
                  <div className="text-center py-6">
                    <UserCheck className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No screenings to display</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentScreenings.map((screening: any) => {
                      const statusColors: Record<string, string> = {
                        PENDING: 'border-amber-500 bg-amber-50/50',
                        SUBMITTED: 'border-indigo-500 bg-indigo-50/50',
                        APPROVED: 'border-emerald-500 bg-emerald-50/50',
                        REJECTED: 'border-red-500 bg-red-50/50',
                      };
                      const statusTextColors: Record<string, string> = {
                        PENDING: 'text-amber-700',
                        SUBMITTED: 'text-indigo-700',
                        APPROVED: 'text-emerald-700',
                        REJECTED: 'text-red-700',
                      };
                      return (
                              <div
                                key={screening.id}
                                className={`p-2.5 rounded-lg border-l-4 ${statusColors[screening.status] || 'border-slate-500 bg-slate-50/50'} hover:opacity-80 transition-colors cursor-pointer`}
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
                                      {screening.updatedAt && new Date(screening.updatedAt).getTime() > (screening.createdAt ? new Date(screening.createdAt).getTime() : 0)
                                        ? `Updated: ${formatDate(screening.updatedAt)}`
                                        : `Created: ${formatDate(screening.createdAt)}`}
                                    </p>
                                  </div>
                                  <div className="text-right ml-2">
                                    <Badge variant="outline" className={`text-[10px] ${statusTextColors[screening.status] || 'text-slate-700'}`}>
                                      {screening.status}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LandlordDashboard;

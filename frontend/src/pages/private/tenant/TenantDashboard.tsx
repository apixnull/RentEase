import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, Sun, Moon, Sunset, Sparkles, LayoutDashboard, RefreshCcw, CreditCard, AlertTriangle, UserCheck, Clock, ArrowRight, Wrench, CheckCircle, FileCheck, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getTenantLeasesRequest } from '@/api/tenant/leaseApi';
import { getTenantScreeningInvitationsRequest } from '@/api/tenant/screeningApi';
import { getAllTenantMaintenanceRequestsRequest } from '@/api/tenant/maintenanceApi';
import { getLeaseDetailsRequest } from '@/api/tenant/leaseApi';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const TenantDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

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
  const [leasesLoading, setLeasesLoading] = useState(true);
  const [screeningsLoading, setScreeningsLoading] = useState(true);
  const [maintenanceLoading, setMaintenanceLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [leases, setLeases] = useState<any[]>([]);
  const [screenings, setScreenings] = useState<any[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [paymentsData, setPaymentsData] = useState<{
    overduePayments: any[];
    upcomingPayments: any[];
  }>({ overduePayments: [], upcomingPayments: [] });

  // Fetch Leases
  useEffect(() => {
    const fetchLeases = async () => {
      try {
        setLeasesLoading(true);
        const response = await getTenantLeasesRequest();
        setLeases(response.data || []);
      } catch (error: any) {
        console.error('Failed to fetch leases:', error);
        toast.error(error?.response?.data?.error || 'Failed to load leases');
      } finally {
        setLeasesLoading(false);
      }
    };
    fetchLeases();
  }, []);

  // Fetch Screenings
  useEffect(() => {
    const fetchScreenings = async () => {
      try {
        setScreeningsLoading(true);
        const response = await getTenantScreeningInvitationsRequest();
        setScreenings(response.data?.data || []);
      } catch (error: any) {
        console.error('Failed to fetch screenings:', error);
        toast.error(error?.response?.data?.error || 'Failed to load screenings');
      } finally {
        setScreeningsLoading(false);
      }
    };
    fetchScreenings();
  }, []);

  // Fetch Maintenance Requests
  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        setMaintenanceLoading(true);
        const response = await getAllTenantMaintenanceRequestsRequest();
        setMaintenanceRequests(response.data?.maintenanceRequests || []);
      } catch (error: any) {
        console.error('Failed to fetch maintenance:', error);
        toast.error(error?.response?.data?.error || 'Failed to load maintenance requests');
      } finally {
        setMaintenanceLoading(false);
      }
    };
    fetchMaintenance();
  }, []);

  // Fetch Payments from active leases
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setPaymentsLoading(true);
        const activeLeases = leases.filter(l => l.status === 'ACTIVE' || l.status === 'ACCEPTED');
        
        if (activeLeases.length === 0) {
          setPaymentsData({ overduePayments: [], upcomingPayments: [] });
          return;
        }

        // Fetch details for all active leases to get payments
        const leaseDetailsPromises = activeLeases.map(lease => 
          getLeaseDetailsRequest(lease.id).catch(err => {
            console.error(`Failed to fetch lease ${lease.id}:`, err);
            return null;
          })
        );

        const leaseDetailsResults = await Promise.all(leaseDetailsPromises);
        
        const allPayments: any[] = [];
        leaseDetailsResults.forEach((result, index) => {
          if (result?.data?.lease?.payments) {
            const leasePayments = result.data.lease.payments.map((p: any) => ({
              ...p,
              lease: activeLeases[index],
            }));
            allPayments.push(...leasePayments);
          }
        });

        // Calculate overdue and upcoming payments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sevenDaysFromNow = new Date(today);
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        const overdue = allPayments
          .filter(payment => {
            if (payment.status === 'PAID') return false;
            const dueDate = new Date(payment.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate < today;
          })
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        const upcoming = allPayments
          .filter(payment => {
            if (payment.status === 'PAID') return false;
            const dueDate = new Date(payment.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate >= today && dueDate <= sevenDaysFromNow;
          })
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        setPaymentsData({ overduePayments: overdue, upcomingPayments: upcoming });
      } catch (error: any) {
        console.error('Failed to fetch payments:', error);
        toast.error(error?.response?.data?.error || 'Failed to load payments');
      } finally {
        setPaymentsLoading(false);
      }
    };

    if (leases.length > 0) {
      fetchPayments();
    }
  }, [leases]);

  // Calculate statistics
  const pendingLeases = useMemo(() => {
    return leases.filter(l => l.status === 'PENDING');
  }, [leases]);

  const activeLeases = useMemo(() => {
    return leases.filter(l => l.status === 'ACTIVE' || l.status === 'ACCEPTED');
  }, [leases]);

  const pendingScreenings = useMemo(() => {
    return screenings.filter((s: any) => s.status === 'PENDING');
  }, [screenings]);

  const submittedScreenings = useMemo(() => {
    return screenings.filter((s: any) => s.status === 'SUBMITTED');
  }, [screenings]);

  const openMaintenance = useMemo(() => {
    return maintenanceRequests.filter((m: any) => m.status === 'OPEN');
  }, [maintenanceRequests]);

  const inProgressMaintenance = useMemo(() => {
    return maintenanceRequests.filter((m: any) => m.status === 'IN_PROGRESS');
  }, [maintenanceRequests]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to ensure at least 4 items are displayed
  const ensureMinItems = <T,>(items: T[], minCount: number = 4): (T | null)[] => {
    const sliced = items.slice(0, minCount);
    const placeholders = Array(Math.max(0, minCount - sliced.length)).fill(null);
    return [...sliced, ...placeholders];
  };

  // Refresh all data
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      toast.loading('Refreshing dashboard...', { id: 'refresh' });

      const [leasesRes, screeningsRes, maintenanceRes] = await Promise.all([
        getTenantLeasesRequest(),
        getTenantScreeningInvitationsRequest(),
        getAllTenantMaintenanceRequestsRequest(),
      ]);

      setLeases(leasesRes.data || []);
      setScreenings(screeningsRes.data?.data || []);
      setMaintenanceRequests(maintenanceRes.data?.maintenanceRequests || []);

      // Refresh payments after leases are updated
      const activeLeases = (leasesRes.data || []).filter((l: any) => l.status === 'ACTIVE' || l.status === 'ACCEPTED');
      if (activeLeases.length > 0) {
        const leaseDetailsPromises = activeLeases.map((lease: any) => 
          getLeaseDetailsRequest(lease.id).catch(() => null)
        );
        const leaseDetailsResults = await Promise.all(leaseDetailsPromises);
        
        const allPayments: any[] = [];
        leaseDetailsResults.forEach((result, index) => {
          if (result?.data?.lease?.payments) {
            const leasePayments = result.data.lease.payments.map((p: any) => ({
              ...p,
              lease: activeLeases[index],
            }));
            allPayments.push(...leasePayments);
          }
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sevenDaysFromNow = new Date(today);
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        const overdue = allPayments
          .filter((payment: any) => {
            if (payment.status === 'PAID') return false;
            const dueDate = new Date(payment.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate < today;
          })
          .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        const upcoming = allPayments
          .filter((payment: any) => {
            if (payment.status === 'PAID') return false;
            const dueDate = new Date(payment.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate >= today && dueDate <= sevenDaysFromNow;
          })
          .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

        setPaymentsData({ overduePayments: overdue, upcomingPayments: upcoming });
      } else {
        setPaymentsData({ overduePayments: [], upcomingPayments: [] });
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
                  <span className="font-semibold text-teal-600">Tenant Dashboard</span>
                  <span className="h-1 w-1 rounded-full bg-teal-400" />
                  <span className="text-cyan-600">Your rental hub</span>
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

      {/* Quick Stats Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {/* Active Leases */}
        <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <FileCheck className="h-4 w-4 text-emerald-600" />
              <Eye className="h-3 w-3 text-slate-400" />
            </div>
            <p className="text-[10px] text-slate-600 mb-1">Active Leases</p>
            {leasesLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <p className="text-xl font-bold text-emerald-700">{activeLeases.length}</p>
            )}
            <p className="text-[10px] text-slate-500 mt-1">Current leases</p>
          </CardContent>
        </Card>

        {/* Pending Leases */}
        <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <Eye className="h-3 w-3 text-slate-400" />
            </div>
            <p className="text-[10px] text-slate-600 mb-1">Lease Invitations</p>
            {leasesLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <p className="text-xl font-bold text-amber-700">{pendingLeases.length}</p>
            )}
            <p className="text-[10px] text-slate-500 mt-1">Awaiting action</p>
          </CardContent>
        </Card>

        {/* Pending Screenings */}
        <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <UserCheck className="h-4 w-4 text-purple-600" />
              <Eye className="h-3 w-3 text-slate-400" />
            </div>
            <p className="text-[10px] text-slate-600 mb-1">Pending Screenings</p>
            {screeningsLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <p className="text-xl font-bold text-purple-700">{pendingScreenings.length}</p>
            )}
            <p className="text-[10px] text-slate-500 mt-1">Action required</p>
          </CardContent>
        </Card>

        {/* Maintenance Requests */}
        <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Wrench className="h-4 w-4 text-orange-600" />
              <Eye className="h-3 w-3 text-slate-400" />
            </div>
            <p className="text-[10px] text-slate-600 mb-1">Maintenance</p>
            {maintenanceLoading ? (
              <Skeleton className="h-6 w-16" />
            ) : (
              <p className="text-xl font-bold text-orange-700">{openMaintenance.length + inProgressMaintenance.length}</p>
            )}
            <p className="text-[10px] text-slate-500 mt-1">Open & in progress</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Rent Payments & Lease Invitations Section - Side by Side */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {/* Rent Payment Section */}
        <div className="space-y-4">
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
              ) : paymentsData.overduePayments.length === 0 && paymentsData.upcomingPayments.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No payments to display</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Overdue Payments */}
                  {paymentsData.overduePayments.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                        <h3 className="text-xs font-semibold text-slate-700">Overdue</h3>
                        <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                          {paymentsData.overduePayments.length}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {ensureMinItems(paymentsData.overduePayments, 4).map((payment: any, index: number) => 
                          payment ? (
                            <div
                              key={payment.id}
                              className="p-2.5 rounded-lg border-l-4 border-rose-500 bg-rose-50/50 hover:bg-rose-50 transition-colors cursor-pointer"
                              onClick={() => navigate(`/tenant/lease/${payment.lease.id}/details`)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-slate-900 truncate">
                                    {payment.lease?.property?.title || 'N/A'}
                                  </p>
                                  <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                                    {payment.lease?.unit?.label || 'N/A'}
                                  </p>
                                  <p className="text-[10px] text-slate-500 mt-1">
                                    Due: {format(new Date(payment.dueDate), 'MMM d, yyyy')}
                                  </p>
                                </div>
                                <div className="text-right ml-2">
                                  <p className="text-xs font-bold text-rose-700">
                                    {formatCurrency(payment.amount)}
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
                  {paymentsData.upcomingPayments.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-3.5 w-3.5 text-amber-600" />
                        <h3 className="text-xs font-semibold text-slate-700">Upcoming</h3>
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5">
                          Next 7 days
                        </Badge>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                          {paymentsData.upcomingPayments.length}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {ensureMinItems(paymentsData.upcomingPayments, 4).map((payment: any, index: number) => 
                          payment ? (
                            <div
                              key={payment.id}
                              className="p-2.5 rounded-lg border-l-4 border-amber-500 bg-amber-50/50 hover:bg-amber-50 transition-colors cursor-pointer"
                              onClick={() => navigate(`/tenant/lease/${payment.lease.id}/details`)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-slate-900 truncate">
                                    {payment.lease?.property?.title || 'N/A'}
                                  </p>
                                  <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                                    {payment.lease?.unit?.label || 'N/A'}
                                  </p>
                                  <p className="text-[10px] text-slate-500 mt-1">
                                    Due: {format(new Date(payment.dueDate), 'MMM d, yyyy')}
                                  </p>
                                </div>
                                <div className="text-right ml-2">
                                  <p className="text-xs font-bold text-amber-700">
                                    {formatCurrency(payment.amount)}
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
                  {activeLeases.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 text-xs hover:bg-slate-50 hover:border-slate-300 transition-colors"
                      onClick={() => navigate('/tenant/lease')}
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        View All Payments
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Lease Invitations Section */}
        <div className="space-y-4">
          <div className="relative">
            <div className="flex items-center gap-3 pb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white grid place-items-center shadow-lg shadow-blue-500/20">
                <FileCheck className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">Lease Invitations</h2>
                <p className="text-xs text-slate-500 mt-0.5">Pending lease agreements</p>
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
              ) : pendingLeases.length === 0 ? (
                <div className="text-center py-6">
                  <FileCheck className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No lease invitations</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {ensureMinItems(pendingLeases, 4).map((lease: any, index: number) => 
                      lease ? (
                        <div
                          key={lease.id}
                          className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/tenant/lease/${lease.id}/details`)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-900 truncate">
                                {lease.property?.title || 'N/A'}
                              </p>
                              <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                                {lease.unit?.label || 'N/A'} - {lease.landlord?.firstName} {lease.landlord?.lastName}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-1">
                                {formatCurrency(lease.rentAmount)} • {lease.leaseType.replace('_', ' ')}
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
                        <div key={`placeholder-lease-${index}`} className="p-2.5 rounded-lg border border-transparent bg-transparent" style={{ minHeight: '64px' }} />
                      )
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 text-xs hover:bg-slate-50 hover:border-slate-300 transition-colors"
                    onClick={() => navigate('/tenant/lease')}
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
        {/* Tenant Screening Section */}
        <div className="space-y-4">
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
                              onClick={() => navigate(`/tenant/screening/${screening.id}/details`)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-slate-900 truncate">
                                    Screening Invitation
                                  </p>
                                  <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                                    {screening.landlord?.name || 'Landlord'}
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
                              onClick={() => navigate(`/tenant/screening/${screening.id}/details`)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-slate-900 truncate">
                                    Screening Application
                                  </p>
                                  <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                                    {screening.landlord?.name || 'Landlord'}
                                  </p>
                                  <p className="text-[10px] text-slate-500 mt-1">
                                    Submitted: {screening.reviewedAt ? format(new Date(screening.reviewedAt), 'MMM d, yyyy') : format(new Date(screening.updatedAt), 'MMM d, yyyy')}
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
                    onClick={() => navigate('/tenant/screening')}
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

        {/* Maintenance Section */}
        <div className="space-y-4">
          <div className="relative">
            <div className="flex items-center gap-3 pb-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 via-red-500 to-rose-500 text-white grid place-items-center shadow-lg shadow-orange-500/20">
                <Wrench className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">Maintenance</h2>
                <p className="text-xs text-slate-500 mt-0.5">Track your maintenance requests</p>
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
                  <p className="text-sm text-slate-500">No maintenance requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Open Maintenance */}
                  {openMaintenance.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
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
                              onClick={() => {
                                // Find the lease for this maintenance request
                                const relatedLease = activeLeases.find((l: any) => 
                                  l.property?.id === maintenance.propertyId && l.unit?.id === maintenance.unitId
                                );
                                if (relatedLease) {
                                  navigate(`/tenant/lease/${relatedLease.id}/details`);
                                }
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-slate-900 truncate">
                                    {maintenance.property?.title || 'Maintenance Request'}
                                  </p>
                                  <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                                    {maintenance.unit?.label || 'N/A'}
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
                              onClick={() => {
                                const relatedLease = activeLeases.find((l: any) => 
                                  l.property?.id === maintenance.propertyId && l.unit?.id === maintenance.unitId
                                );
                                if (relatedLease) {
                                  navigate(`/tenant/lease/${relatedLease.id}/details`);
                                }
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-slate-900 truncate">
                                    {maintenance.property?.title || 'Maintenance Request'}
                                  </p>
                                  <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                                    {maintenance.unit?.label || 'N/A'}
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
                  {activeLeases.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 text-xs hover:bg-slate-50 hover:border-slate-300 transition-colors"
                      onClick={() => {
                        if (activeLeases.length > 0) {
                          navigate(`/tenant/lease/${activeLeases[0].id}/details`);
                        }
                      }}
                    >
                      <span className="flex items-center justify-center gap-1.5">
                        View Maintenance Requests
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default TenantDashboard;

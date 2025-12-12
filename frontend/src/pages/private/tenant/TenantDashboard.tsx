import { useState, useEffect, useMemo } from 'react';
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
  CreditCard, 
  UserCheck, 
  Wrench, 
  CheckCircle, 
  FileCheck, 
  Loader2,
  Home,
  Building2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getTenantLeasesRequest } from '@/api/tenant/leaseApi';
import { getTenantScreeningInvitationsRequest } from '@/api/tenant/screeningApi';
import { getAllTenantMaintenanceRequestsRequest } from '@/api/tenant/maintenanceApi';
import { getLeaseDetailsRequest } from '@/api/tenant/leaseApi';
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [leasesLoading, setLeasesLoading] = useState(true);
  const [screeningsLoading, setScreeningsLoading] = useState(true);
  const [maintenanceLoading, setMaintenanceLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  const [leases, setLeases] = useState<any[]>([]);
  const [screenings, setScreenings] = useState<any[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);

  // Fetch all dashboard data
  const fetchDashboard = async ({ silent = false }: { silent?: boolean } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
        setLeasesLoading(true);
        setScreeningsLoading(true);
        setMaintenanceLoading(true);
      } else {
        setRefreshing(true);
      }

      // Fetch all data in parallel
      const [leasesRes, screeningsRes, maintenanceRes] = await Promise.all([
        getTenantLeasesRequest(),
        getTenantScreeningInvitationsRequest(),
        getAllTenantMaintenanceRequestsRequest(),
      ]);

      setLeases(leasesRes.data || []);
      setScreenings(screeningsRes.data?.data || []);
      setMaintenanceRequests(maintenanceRes.data?.maintenanceRequests || []);

      // Fetch payments from active leases
      const activeLeases = (leasesRes.data || []).filter((l: any) => l.status === 'ACTIVE' || l.status === 'ACCEPTED');
      if (activeLeases.length > 0) {
        setPaymentsLoading(true);
        try {
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

          // Filter payments: upcoming within 30 days, due today, or overdue within this month
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          const thirtyDaysFromNow = new Date(today);
          thirtyDaysFromNow.setDate(today.getDate() + 30);
          
          const filteredPayments = allPayments.filter((payment: any) => {
            if (payment.status === 'PAID') return false;
            
            const dueDate = new Date(payment.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            
            // Show if:
            // 1. Due today
            // 2. Overdue within this month (from start of month to today)
            // 3. Upcoming within 30 days (today + 1 to today + 30)
            const isDueToday = dueDate.getTime() === today.getTime();
            const isOverdueThisMonth = dueDate < today && dueDate >= startOfMonth;
            const isUpcomingWithin30Days = dueDate > today && dueDate <= thirtyDaysFromNow;
            
            return isDueToday || isOverdueThisMonth || isUpcomingWithin30Days;
          });
          
          // Sort by dueDate ascending (earliest first)
          const sortedPayments = filteredPayments
            .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .slice(0, 5); // Limit to 5 most recent

          setRecentPayments(sortedPayments);
        } catch (error) {
          console.error('Failed to fetch payments:', error);
        } finally {
          setPaymentsLoading(false);
        }
      } else {
        setRecentPayments([]);
      }

    } catch (error: any) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      if (!silent) {
        setLoading(false);
        setLeasesLoading(false);
        setScreeningsLoading(false);
        setMaintenanceLoading(false);
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

  // Get recent leases (any status, sorted by createdAt to show recently created)
  const recentLeases = useMemo(() => {
    return [...leases]
      .sort((a, b) => new Date(b.createdAt || b.updatedAt).getTime() - new Date(a.createdAt || a.updatedAt).getTime())
      .slice(0, 5);
  }, [leases]);

  // Get recent screenings (any status, sorted by updatedAt)
  const recentScreenings = useMemo(() => {
    return [...screenings]
      .sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
      .slice(0, 5);
  }, [screenings]);

  // Get recent maintenance (any status, sorted by updatedAt)
  const recentMaintenance = useMemo(() => {
    return [...maintenanceRequests]
      .sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
      .slice(0, 5);
  }, [maintenanceRequests]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0,
    }).format(amount);
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
                      Your rental hub
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
                      <CardTitle className="text-lg">Recent Payments</CardTitle>
                      <CardDescription>Your recent payment activity</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Navigate to the first payment's lease details with payments tab active
                      if (recentPayments.length > 0 && recentPayments[0].lease?.id) {
                        const leaseId = recentPayments[0].lease.id;
                        try {
                          sessionStorage.setItem(`lease-${leaseId}-activeTab`, 'payments');
                        } catch {
                          // ignore sessionStorage errors
                        }
                        navigate(`/tenant/my-lease/${leaseId}/details`);
                      } else {
                        // If no payments, navigate to first active lease or my-lease page
                        const activeLeases = leases.filter((l: any) => l.status === 'ACTIVE' || l.status === 'ACCEPTED');
                        if (activeLeases.length > 0) {
                          const leaseId = activeLeases[0].id;
                          try {
                            sessionStorage.setItem(`lease-${leaseId}-activeTab`, 'payments');
                          } catch {
                            // ignore sessionStorage errors
                          }
                          navigate(`/tenant/my-lease/${leaseId}/details`);
                        } else {
                          navigate('/tenant/my-lease');
                        }
                      }
                    }}
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
                ) : recentPayments.length === 0 ? (
                  <div className="text-center py-6">
                    <CheckCircle className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No payments to display</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentPayments.map((payment: any) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const dueDate = new Date(payment.dueDate);
                      dueDate.setHours(0, 0, 0, 0);
                      const isOverdue = dueDate < today;
                      const isDueToday = dueDate.getTime() === today.getTime();
                      
                      const borderColor = isOverdue ? 'border-rose-500' : isDueToday ? 'border-orange-500' : 'border-blue-500';
                      const bgColor = isOverdue ? 'bg-rose-50/50' : isDueToday ? 'bg-orange-50/50' : 'bg-blue-50/50';
                      const textColor = isOverdue ? 'text-rose-700' : isDueToday ? 'text-orange-700' : 'text-blue-700';
                      
                      return (
                        <div
                          key={payment.id}
                          className={`p-2.5 rounded-lg border-l-4 ${borderColor} ${bgColor} hover:opacity-80 transition-colors cursor-pointer`}
                          onClick={() => navigate(`/tenant/my-lease/${payment.lease.id}/details`)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-900 truncate">
                                {payment.lease?.property?.title || 'N/A'}
                              </p>
                              <p className="text-[10px] text-slate-600 mt-0.5 truncate">
                                {payment.lease?.unit?.label || 'N/A'}
                              </p>
                              <div className={`mt-1.5 px-2 py-1 rounded-md inline-block ${isOverdue ? 'bg-rose-100 border border-rose-300' : isDueToday ? 'bg-orange-100 border border-orange-300' : 'bg-blue-100 border border-blue-300'}`}>
                                <p className={`text-[10px] font-bold ${isOverdue ? 'text-rose-700' : isDueToday ? 'text-orange-700' : 'text-blue-700'}`}>
                                  Due: {format(new Date(payment.dueDate), 'MMM d, yyyy')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right ml-2">
                              <p className={`text-xs font-bold ${textColor}`}>
                                {formatCurrency(payment.amount)}
                              </p>
                              <Badge variant="outline" className={`text-[10px] mt-1 ${textColor}`}>
                                {isOverdue ? 'OVERDUE' : isDueToday ? 'DUE TODAY' : 'UPCOMING'}
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
                      <CardTitle className="text-lg">Recent Leases</CardTitle>
                      <CardDescription>Your recent lease activity</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/tenant/my-lease')}
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
                        ACCEPTED: 'border-emerald-500 bg-emerald-50/50',
                        COMPLETED: 'border-blue-500 bg-blue-50/50',
                        TERMINATED: 'border-red-500 bg-red-50/50',
                        CANCELLED: 'border-gray-500 bg-gray-50/50',
                      };
                      const statusTextColors: Record<string, string> = {
                        PENDING: 'text-amber-700',
                        ACTIVE: 'text-emerald-700',
                        ACCEPTED: 'text-emerald-700',
                        COMPLETED: 'text-blue-700',
                        TERMINATED: 'text-red-700',
                        CANCELLED: 'text-gray-700',
                      };
                      return (
                        <div
                          key={lease.id}
                          className={`p-2.5 rounded-lg border-l-4 ${statusColors[lease.status] || 'border-slate-500 bg-slate-50/50'} hover:opacity-80 transition-colors cursor-pointer`}
                          onClick={() => navigate(`/tenant/my-lease/${lease.id}/details`)}
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
                                Created: {format(new Date(lease.createdAt || lease.updatedAt), 'MMM d, yyyy')}
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

          {/* Tenant Screening Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
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
                      <CardTitle className="text-lg">Recent Screenings</CardTitle>
                      <CardDescription>Your recent screening activity</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/tenant/screening')}
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
                        'TENANT-REJECT': 'border-slate-500 bg-slate-50/50',
                        SUBMITTED: 'border-indigo-500 bg-indigo-50/50',
                        APPROVED: 'border-emerald-500 bg-emerald-50/50',
                        REJECTED: 'border-red-500 bg-red-50/50',
                      };
                      const statusTextColors: Record<string, string> = {
                        PENDING: 'text-amber-700',
                        'TENANT-REJECT': 'text-slate-700',
                        SUBMITTED: 'text-indigo-700',
                        APPROVED: 'text-emerald-700',
                        REJECTED: 'text-red-700',
                      };
                      return (
                        <div
                          key={screening.id}
                          className={`p-2.5 rounded-lg border-l-4 ${statusColors[screening.status] || 'border-slate-500 bg-slate-50/50'} hover:opacity-80 transition-colors cursor-pointer`}
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
                                Updated: {format(new Date(screening.updatedAt || screening.createdAt), 'MMM d, yyyy')}
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

          {/* Maintenance Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
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
                      <CardTitle className="text-lg">Recent Maintenance</CardTitle>
                      <CardDescription>Your recent maintenance requests</CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const activeLeases = leases.filter((l: any) => l.status === 'ACTIVE' || l.status === 'ACCEPTED');
                      if (activeLeases.length > 0) {
                        navigate(`/tenant/my-lease/${activeLeases[0].id}/details`);
                      }
                    }}
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
                        CLOSED: 'border-gray-500 bg-gray-50/50',
                      };
                      const statusTextColors: Record<string, string> = {
                        OPEN: 'text-amber-700',
                        IN_PROGRESS: 'text-blue-700',
                        COMPLETED: 'text-emerald-700',
                        CLOSED: 'text-gray-700',
                      };
                      const activeLeases = leases.filter((l: any) => l.status === 'ACTIVE' || l.status === 'ACCEPTED');
                      const relatedLease = activeLeases.find((l: any) => 
                        l.property?.id === maintenance.propertyId && l.unit?.id === maintenance.unitId
                      );
                      
                      return (
                        <div
                          key={maintenance.id}
                          className={`p-2.5 rounded-lg border-l-4 ${statusColors[maintenance.status] || 'border-slate-500 bg-slate-50/50'} hover:opacity-80 transition-colors cursor-pointer`}
                          onClick={() => {
                            if (relatedLease) {
                              navigate(`/tenant/my-lease/${relatedLease.id}/details`);
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
                              <Badge variant="outline" className={`text-[10px] ${statusTextColors[maintenance.status] || 'text-slate-700'}`}>
                                {maintenance.status?.replace('_', ' ') || 'RECENT'}
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

export default TenantDashboard;

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
  TrendingUp, 
  FileText, 
  Users, 
  BarChart3, 
  Shield, 
  Flag, 
  UserPlus, 
  DollarSign,
  Loader2,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { getAdminDashboardRequest, type DashboardData } from '@/api/admin/adminDashboardApi';

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
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch dashboard data
  const fetchDashboard = async ({ silent = false }: { silent?: boolean } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      const response = await getAdminDashboardRequest();
      setDashboardData(response.data);
    } catch (error: any) {
      console.error('Failed to fetch dashboard:', error);
      toast.error(error?.response?.data?.error || 'Failed to load dashboard');
    } finally {
      if (!silent) {
        setLoading(false);
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

  const metrics = dashboardData?.metrics;
  const recent = dashboardData?.recent;

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
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
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-purple-200/80 via-indigo-200/75 to-blue-200/70 opacity-95" />
          <div className="relative m-[1px] rounded-[16px] bg-white/85 backdrop-blur-lg border border-white/60 shadow-lg">
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -top-12 -left-10 h-40 w-40 rounded-full bg-gradient-to-br from-purple-300/50 to-indigo-400/40 blur-3xl"
              initial={{ opacity: 0.4, scale: 0.85 }}
              animate={{ opacity: 0.7, scale: 1.05 }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-tl from-blue-200/40 to-indigo-200/35 blur-3xl"
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
                    <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white grid place-items-center shadow-xl shadow-indigo-500/30">
                      <Shield className="h-5 w-5 relative z-10" />
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                    </div>
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, type: "spring", stiffness: 220 }}
                      className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white text-purple-600 border border-purple-100 shadow-sm grid place-items-center"
                    >
                      {getGreetingIcon()}
                    </motion.div>
                    <motion.div
                      className="absolute inset-0 rounded-2xl border-2 border-indigo-400/30"
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
                        <Sparkles className="h-4 w-4 text-indigo-500" />
                      </motion.div>
                    </div>
                    <p className="text-sm text-slate-600 leading-6 flex items-center gap-1.5">
                      <BarChart3 className="h-4 w-4 text-purple-500" />
                      Platform overview and system insights
                    </p>
                  </div>
                </div>

                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                  <motion.div
                    initial={{ opacity: 0, x: 20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/60 shadow-xl shadow-indigo-500/10 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all"
                  >
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 text-white grid place-items-center shadow-lg">
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
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
                style={{ originX: 0 }}
                className="relative h-1 w-full rounded-full overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/80 via-indigo-400/80 to-blue-400/80" />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Users Created Last 30 Days */}
          <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 hover:shadow-lg transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white grid place-items-center shadow-lg">
                  <Users className="h-6 w-6" />
                </div>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  30d
                </Badge>
              </div>
              <p className="text-xs font-semibold text-slate-600 mb-1">Users Created</p>
              <p className="text-3xl font-bold text-slate-900 mb-2">{metrics?.users.newLast30Days || 0}</p>
              <div className="flex items-center gap-2 text-xs text-purple-700">
                <TrendingUp className="h-3 w-3" />
                <span>{metrics?.users.newLast7Days || 0} in last 7 days</span>
              </div>
            </CardContent>
          </Card>

          {/* Listings Created Last 30 Days */}
          <Card className="border-2 border-cyan-100 bg-gradient-to-br from-cyan-50/50 to-blue-50/50 hover:shadow-lg transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white grid place-items-center shadow-lg">
                  <FileText className="h-6 w-6" />
                </div>
                <Badge className="bg-cyan-100 text-cyan-700 border-cyan-200">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  30d
                </Badge>
              </div>
              <p className="text-xs font-semibold text-slate-600 mb-1">Listings Created</p>
              <p className="text-3xl font-bold text-slate-900 mb-2">{metrics?.listings.newLast30Days || 0}</p>
              <div className="flex items-center gap-2 text-xs text-cyan-700">
                <TrendingUp className="h-3 w-3" />
                <span>{metrics?.listings.newLast7Days || 0} in last 7 days</span>
              </div>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card className="border-2 border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-green-50/50 hover:shadow-lg transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 text-white grid place-items-center shadow-lg">
                  <DollarSign className="h-6 w-6" />
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  30d
                </Badge>
              </div>
              <p className="text-xs font-semibold text-slate-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-slate-900 mb-2">
                ₱{metrics?.revenue.total.toLocaleString() || 0}
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-700">
                <TrendingUp className="h-3 w-3" />
                <span>₱{metrics?.revenue.last30Days.toLocaleString() || 0} last 30 days</span>
              </div>
            </CardContent>
          </Card>

          {/* Fraud Reports */}
          <Card className="border-2 border-rose-100 bg-gradient-to-br from-rose-50/50 to-red-50/50 hover:shadow-lg transition-all">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-500 text-white grid place-items-center shadow-lg">
                  <Flag className="h-6 w-6" />
                </div>
                <Badge className="bg-rose-100 text-rose-700 border-rose-200">
                  {metrics?.fraudReports.newLast7Days || 0} new
                </Badge>
              </div>
              <p className="text-xs font-semibold text-slate-600 mb-1">Fraud Reports</p>
              <p className="text-3xl font-bold text-slate-900 mb-2">{metrics?.fraudReports.total || 0}</p>
              <div className="flex items-center gap-2 text-xs text-rose-700">
                <Flag className="h-3 w-3" />
                <span>{metrics?.fraudReports.newLast30Days || 0} last 30 days</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Recent Users */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <UserPlus className="h-5 w-5 text-teal-600" />
                  <CardTitle className="text-base">Recent Users</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/admin/users')}
                  className="h-7 text-xs"
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {recent?.users && recent.users.length > 0 ? (
                  recent.users.map((user) => {
                    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'No Name';
                    const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatarUrl || undefined} />
                            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-xs font-semibold text-slate-900 truncate">{fullName}</p>
                              <Badge variant="outline" className={`text-[10px] ${roleColors[user.role] || 'bg-slate-100 text-slate-700'}`}>
                                {user.role}
                              </Badge>
                            </div>
                            <p className="text-[10px] text-slate-600 truncate">{user.email}</p>
                            <p className="text-[10px] text-slate-500 mt-1">
                              {format(new Date(user.createdAt), 'MMM d, yyyy')}
                            </p>
                          </div>
                          {user.isDisabled && (
                            <Badge variant="destructive" className="text-[10px]">Blocked</Badge>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-sm text-slate-500">
                    <UserPlus className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p>No recent users</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Listings */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-base">Recent Listings</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/admin/listing')}
                  className="h-7 text-xs"
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {recent?.listings && recent.listings.length > 0 ? (
                  recent.listings.map((listing) => {
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
                        onClick={() => navigate(`/admin/listing/${listing.id}/details`)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">
                              {listing.unit.property.title}
                            </p>
                            <p className="text-[10px] text-slate-600 mt-0.5">
                              Unit: {listing.unit.label}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1">
                              {listing.landlord.firstName} {listing.landlord.lastName}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge className={`text-[10px] ${statusColors[listing.lifecycleStatus] || 'bg-slate-100 text-slate-700'}`}>
                              {listing.lifecycleStatus}
                            </Badge>
                            {listing.isFeatured && (
                              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] border-0">
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2">
                          {format(new Date(listing.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-sm text-slate-500">
                    <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p>No recent listings</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Fraud Reports */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-rose-50 to-red-50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Flag className="h-5 w-5 text-rose-600" />
                  <CardTitle className="text-base">Recent Fraud Reports</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/admin/fraud-reports')}
                  className="h-7 text-xs"
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {recent?.fraudReports && recent.fraudReports.length > 0 ? (
                  recent.fraudReports.map((report) => {
                    return (
                      <div
                        key={report.id}
                        className="p-2.5 rounded-lg border-l-4 border-rose-500 bg-rose-50/50 hover:bg-rose-50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/admin/listing/${report.listing.id}/details`)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900 truncate">
                              {report.listing.unit.property.title}
                            </p>
                            <p className="text-[10px] text-slate-600 mt-0.5">
                              {report.reporter.firstName} {report.reporter.lastName}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-1 capitalize">
                              {report.reason?.replace('_', ' ') || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2">
                          {format(new Date(report.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-sm text-slate-500">
                    <Flag className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p>No fraud reports</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-500 via-gray-500 to-zinc-500 text-white grid place-items-center shadow-lg">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Quick Links</h2>
              <p className="text-xs text-slate-500 mt-0.5">Quick access to admin features</p>
            </div>
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
              className="border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-rose-300"
              onClick={() => navigate('/admin/fraud-reports')}
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
              className="border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
              onClick={() => navigate('/admin/reports')}
            >
              <CardContent className="p-4 text-center">
                <BarChart3 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-900">Analytics</p>
                <p className="text-[10px] text-slate-500 mt-1">View reports</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;

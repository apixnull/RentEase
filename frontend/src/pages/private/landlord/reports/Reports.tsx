import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building2,
  FileText,
  Wrench,
  Eye,
  Loader2,
  BarChart3,
  AlertCircle,
  Sparkles,
  RotateCcw,
  Home,
  Megaphone,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { getReportsDataRequest, type ReportsResponse } from '@/api/landlord/reportsApi';


const Reports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reportsData, setReportsData] = useState<ReportsResponse | null>(null);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const response = await getReportsDataRequest();
      setReportsData(response.data);
    } catch (error: any) {
      console.error('Failed to fetch reports data:', error);
      toast.error(error?.response?.data?.error || 'Failed to load reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReportsData();
    toast.success('Reports refreshed');
  };

  if (loading && !reportsData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-sm text-gray-500 mt-1">Comprehensive insights into your rental business</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="shadow-sm border border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-5 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-9 w-24 mb-2" />
                <Skeleton className="h-3 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!reportsData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  const { summary } = reportsData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-teal-200/80 via-cyan-200/70 to-emerald-200/70 opacity-95" />
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
                    <BarChart3 className="h-5 w-5 relative z-10" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-transparent" />
                  </div>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 220 }}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-white text-teal-600 border border-teal-100 shadow-sm grid place-items-center"
                  >
                    <Sparkles className="h-3 w-3" />
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
                      Reports & Analytics
                    </h1>
                    <motion.div
                      animate={{ rotate: [0, 8, -8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Sparkles className="h-4 w-4 text-emerald-500" />
                    </motion.div>
                  </div>
                  <p className="text-sm text-slate-600 leading-6 flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-cyan-500" />
                    Comprehensive insights into your rental business
                  </p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="h-11 rounded-xl border-slate-200 bg-white/80 px-5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-white disabled:opacity-70"
                >
                  {refreshing ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Refreshing
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <RotateCcw className="h-4 w-4" />
                      Refresh Data
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

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Properties */}
        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Building2 className="h-5 w-5 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{summary.totalProperties}</div>
            <p className="text-xs text-muted-foreground mt-1">Properties owned</p>
          </CardContent>
        </Card>

        {/* Total Units */}
        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <Home className="h-5 w-5 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{summary.totalUnits}</div>
            <p className="text-xs text-muted-foreground mt-1">Total rental units</p>
          </CardContent>
        </Card>

        {/* Leases Card */}
        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leases</CardTitle>
            <FileText className="h-5 w-5 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {reportsData.leases.statusCounts.active + 
               reportsData.leases.statusCounts.pending + 
               reportsData.leases.statusCounts.completed + 
               reportsData.leases.statusCounts.terminated + 
               reportsData.leases.statusCounts.cancelled}
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Active:</span>
                <span className="font-semibold text-emerald-600">{reportsData.leases.statusCounts.active}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Pending:</span>
                <span className="font-semibold text-amber-600">{reportsData.leases.statusCounts.pending}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Completed:</span>
                <span className="font-semibold text-slate-600">{reportsData.leases.statusCounts.completed}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Terminated:</span>
                <span className="font-semibold text-rose-600">{reportsData.leases.statusCounts.terminated}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Cancelled:</span>
                <span className="font-semibold text-slate-500">{reportsData.leases.statusCounts.cancelled}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Card */}
        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Wrench className="h-5 w-5 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {reportsData.maintenance.statusCounts.open + 
               reportsData.maintenance.statusCounts.in_progress + 
               reportsData.maintenance.statusCounts.resolved + 
               reportsData.maintenance.statusCounts.cancelled + 
               reportsData.maintenance.statusCounts.invalid}
            </div>
            <p className="text-xs text-muted-foreground mt-1 mb-3">All Maintenance Requests</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Open:</span>
                <span className="font-semibold text-blue-600">{reportsData.maintenance.statusCounts.open}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">In Progress:</span>
                <span className="font-semibold text-amber-600">{reportsData.maintenance.statusCounts.in_progress}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Resolved:</span>
                <span className="font-semibold text-emerald-600">{reportsData.maintenance.statusCounts.resolved}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Cancelled:</span>
                <span className="font-semibold text-slate-500">{reportsData.maintenance.statusCounts.cancelled}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Invalid:</span>
                <span className="font-semibold text-red-600">{reportsData.maintenance.statusCounts.invalid}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listing/Advertisement Card */}
        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Listings / Advertisement</CardTitle>
            <Megaphone className="h-5 w-5 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {reportsData.listings.statusCounts.visible + reportsData.listings.statusCounts.hidden}
            </div>
            <p className="text-xs text-muted-foreground mt-1 mb-3">Advertised Units (Active + Hidden)</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Active:</span>
                <span className="font-semibold text-emerald-600">{reportsData.listings.statusCounts.visible}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Hidden:</span>
                <span className="font-semibold text-amber-600">{reportsData.listings.statusCounts.hidden}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Flagged:</span>
                <span className="font-semibold text-red-600">{reportsData.listings.statusCounts.flagged}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Waiting Review:</span>
                <span className="font-semibold text-blue-600">{reportsData.listings.statusCounts.waiting_review}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tenant Screening Card */}
        <Card className="shadow-sm border border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tenant Screening</CardTitle>
            <UserCheck className="h-5 w-5 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {reportsData.summary.totalScreenings}
            </div>
            <p className="text-xs text-muted-foreground mt-1 mb-3">Total Screening Applications</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Pending:</span>
                <span className="font-semibold text-amber-600">{reportsData.screenings.statusCounts.pending}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Submitted:</span>
                <span className="font-semibold text-blue-600">{reportsData.screenings.statusCounts.submitted}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Approved:</span>
                <span className="font-semibold text-emerald-600">{reportsData.screenings.statusCounts.approved}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Rejected:</span>
                <span className="font-semibold text-red-600">{reportsData.screenings.statusCounts.rejected}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Button Section */}
      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-600 via-cyan-600 to-emerald-600 text-white grid place-items-center shadow-lg">
                <Eye className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Engagement Analytics</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Track unit views, reviews, and performance metrics in detail
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/landlord/engagement')}
              className="h-11 rounded-xl bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 px-6 text-sm font-semibold text-white shadow-md shadow-cyan-500/30 hover:brightness-110"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Engagement Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rental Earnings Report Button Section */}
      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white grid place-items-center shadow-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Rental Earnings Report</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Track rental income, payment trends, and earnings by property and unit
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/landlord/lease-analytics')}
              className="h-11 rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 px-6 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 hover:brightness-110"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Rent Earnings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Analytics Button Section */}
      <Card className="border border-slate-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-600 via-amber-600 to-yellow-600 text-white grid place-items-center shadow-lg">
                <Wrench className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Maintenance Analytics</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Track maintenance requests, status trends, and tenant information by property and unit
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/landlord/maintenance-analytics')}
              className="h-11 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 px-6 text-sm font-semibold text-white shadow-md shadow-amber-500/30 hover:brightness-110"
            >
              <Wrench className="w-4 h-4 mr-2" />
              View Maintenance Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default Reports;


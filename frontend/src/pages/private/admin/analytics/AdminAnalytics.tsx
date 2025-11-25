import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Loader2, RefreshCcw, Users, LogIn, TrendingUp, AlertTriangle, ExternalLink, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { getAdminAnalyticsRequest, type AnalyticsResponse } from '@/api/admin/analyticsApi';
import { format } from 'date-fns';

const loginsChartConfig = {
  logins: {
    label: 'Logins',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

const fraudReportsChartConfig = {
  fraudReports: {
    label: 'Fraud Reports',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

const listingsChartConfig = {
  listings: {
    label: 'Listings',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

const AdminAnalytics = () => {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<'this_month' | 'this_year'>('this_month');

  const fetchData = async ({ silent = false } = {}) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      const response = await getAdminAnalyticsRequest(period);
      setData(response.data);
    } catch (error: any) {
      if (error?.name === 'CanceledError') return;
      console.error('Error fetching analytics:', error);
      toast.error(error?.response?.data?.message || error?.response?.data?.error || 'Failed to load analytics data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchData();
    return () => controller.abort();
  }, [period]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData({ silent: true });
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-200/80 via-sky-200/75 to-cyan-200/60 opacity-95" />
        <div className="relative m-[1px] rounded-[16px] bg-white/85 backdrop-blur-lg border border-white/60 shadow-lg">
          <div className="px-4 sm:px-6 py-5 space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <motion.div whileHover={{ scale: 1.05 }} className="relative flex-shrink-0">
                  <div className="relative h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-sky-600 text-white grid place-items-center shadow-xl shadow-indigo-500/30">
                    <TrendingUp className="h-5 w-5 relative z-10" />
                  </div>
                </motion.div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 truncate">Analytics</h1>
                  <p className="text-sm text-gray-600 mt-0.5">Platform login statistics and fraud reports</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select value={period} onValueChange={(value: 'this_month' | 'this_year') => setPeriod(value)}>
                  <SelectTrigger className="w-[140px] rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="this_month" className="rounded-lg">
                      This Month
                    </SelectItem>
                    <SelectItem value="this_year" className="rounded-lg">
                      This Year
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  {refreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="h-4 w-4" />
                  )}
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users Logged In</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.usersLoggedInThisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">Unique users who logged in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logins</CardTitle>
            <LogIn className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalLogins || 0}</div>
            <p className="text-xs text-muted-foreground">Total login events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Listings Created</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalListingsCreated || 0}</div>
            <p className="text-xs text-muted-foreground">New listings created</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fraud Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalFraudReports || 0}</div>
            <p className="text-xs text-muted-foreground">Total fraud reports submitted</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Logins Area Chart - No filter, shows current period */}
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Daily Logins</CardTitle>
            <CardDescription>Showing total logins for {data?.period.label.toLowerCase()}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={loginsChartConfig} className="aspect-auto h-[250px] w-full">
            <AreaChart data={data?.dailyLogins || []}>
              <defs>
                <linearGradient id="fillLogins" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-logins)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-logins)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={period === 'this_year' ? 60 : 32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  if (period === 'this_year') {
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });
                  }
                  return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      });
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="count"
                type="natural"
                fill="url(#fillLogins)"
                stroke="var(--color-logins)"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Listings Created Chart */}
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle>Listings Created</CardTitle>
            <CardDescription>Showing new listings created for {data?.period.label.toLowerCase()}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <ChartContainer config={listingsChartConfig} className="aspect-auto h-[250px] w-full">
            <AreaChart data={data?.dailyListings || []}>
              <defs>
                <linearGradient id="fillListings" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-listings)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-listings)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={period === 'this_year' ? 60 : 32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      });
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="count"
                type="natural"
                fill="url(#fillListings)"
                stroke="var(--color-listings)"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Fraud Reports Section */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Fraud Reports Chart */}
        <Card className="pt-0">
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1">
              <CardTitle>Fraud Reports Trend</CardTitle>
              <CardDescription>Daily fraud reports submitted for {data?.period.label.toLowerCase()}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <ChartContainer config={fraudReportsChartConfig} className="aspect-auto h-[250px] w-full">
              <AreaChart data={data?.dailyFraudReports || []}>
                <defs>
                  <linearGradient id="fillFraudReports" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-fraudReports)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-fraudReports)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={period === 'this_year' ? 60 : 32}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });
                  }}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        });
                      }}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="count"
                  type="natural"
                  fill="url(#fillFraudReports)"
                  stroke="var(--color-fraudReports)"
                  stackId="a"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Fraud Reports */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Fraud Reports</CardTitle>
                <CardDescription>Latest 3 fraud reports submitted</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/admin/fraud-reports">
                  View All
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {data?.recentFraudReports && data.recentFraudReports.length > 0 ? (
              <div className="space-y-4">
                {data.recentFraudReports.map((report) => (
                  <Link
                    key={report.id}
                    to={`/admin/fraud-reports`}
                    className="block p-4 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                          <p className="text-sm font-medium truncate">{report.propertyTitle}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          Reason: <span className="font-medium">{report.reason}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Reported by: {report.reporterName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(report.createdAt), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No fraud reports {data?.period.label.toLowerCase()}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;

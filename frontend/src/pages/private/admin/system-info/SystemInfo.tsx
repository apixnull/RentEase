import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Wifi,
  WifiOff,
  RefreshCcw,
  Server,
  Globe,
  Database,
  Users,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Terminal,
  Filter,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  getSystemPerformanceRequest,
  type SystemPerformanceData,
} from "@/api/admin/systemPerformanceApi";
import {
  getApiLogsRequest,
  getApiLogsStatisticsRequest,
  type ApiLog,
  type LogStatistics,
} from "@/api/admin/apiLogsApi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format } from "date-fns";

const SystemInfo = () => {
  const [data, setData] = useState<SystemPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [logStats, setLogStats] = useState<LogStatistics | null>(null);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logFilters, setLogFilters] = useState({
    method: "",
    statusCode: "",
    path: "",
  });
  const [logsModalOpen, setLogsModalOpen] = useState(false);
  const [clientMetrics, setClientMetrics] = useState({
    pageLoadTime: 0,
    memoryUsage: null as { used: number; total: number; percentage: number } | null,
    networkStatus: navigator.onLine ? "online" : "offline" as "online" | "offline",
  });

  const fetchData = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      // Fetch server metrics
      const response = await getSystemPerformanceRequest();
      setData(response.data);

      // Get client-side metrics
      if (document.readyState === "complete") {
        const pageLoadTime = performance.now();
        setClientMetrics((prev) => ({ ...prev, pageLoadTime }));
      }

      // Get memory usage if available
      if ("memory" in performance) {
        const memory = (performance as any).memory;
        const used = memory.usedJSHeapSize / 1024 / 1024; // MB
        const total = memory.jsHeapSizeLimit / 1024 / 1024; // MB
        const percentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        setClientMetrics((prev) => ({
          ...prev,
          memoryUsage: { used, total, percentage },
        }));
      }

      setClientMetrics((prev) => ({
        ...prev,
        networkStatus: navigator.onLine ? "online" : "offline",
      }));
    } catch (error: any) {
      console.error("Failed to fetch system performance:", error);
      toast.error(error?.response?.data?.error || "Failed to load system performance data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchApiLogs = async () => {
    try {
      setLogsLoading(true);
      const [logsRes, statsRes] = await Promise.all([
        getApiLogsRequest({
          limit: 50,
          method: logFilters.method || undefined,
          statusCode: logFilters.statusCode ? parseInt(logFilters.statusCode) : undefined,
          path: logFilters.path || undefined,
        }),
        getApiLogsStatisticsRequest(),
      ]);
      setApiLogs(logsRes.data.logs);
      setLogStats(statsRes.data);
    } catch (error: any) {
      console.error("Failed to fetch API logs:", error);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData(true);
    }, 30000); // Auto-refresh every 30s for system performance
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (logsModalOpen) {
      fetchApiLogs();
    }
  }, [logFilters, logsModalOpen]);

  const handleRefresh = () => {
    fetchData(true);
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case "HEALTHY":
        return "bg-green-500";
      case "WARNING":
        return "bg-yellow-500";
      case "CRITICAL":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPerformanceColor = (status: string) => {
    switch (status) {
      case "FAST":
        return "bg-green-500";
      case "GOOD":
        return "bg-blue-500";
      case "SLOW":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Performance</h1>
          <p className="text-gray-500 mt-1">
            Simple system health and performance overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={logsModalOpen} onOpenChange={setLogsModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Terminal className="h-4 w-4" />
                API Logs
                {logStats && logStats.errorCount > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {logStats.errorCount}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    API Logs
                  </DialogTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchApiLogs()}
                    disabled={logsLoading}
                    className="gap-2"
                  >
                    <RefreshCcw className={cn("h-4 w-4", logsLoading && "animate-spin")} />
                    Refresh
                  </Button>
                </div>
              </DialogHeader>
              <div className="flex-1 overflow-hidden flex flex-col gap-4">
                {/* Statistics */}
                {logStats && (
                  <div className="flex items-center gap-6 p-3 bg-gray-50 rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Total:</span>
                      <span className="font-semibold">{logStats.total}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Last Hour:</span>
                      <span className="font-semibold text-blue-600">{logStats.lastHour}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Errors:</span>
                      <span className="font-semibold text-red-600">{logStats.errorCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Avg Response:</span>
                      <span className="font-semibold">{logStats.avgResponseTime}ms</span>
                    </div>
                  </div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filters:</span>
                  </div>
                  <select
                    value={logFilters.method}
                    onChange={(e) => setLogFilters({ ...logFilters, method: e.target.value })}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="">All Methods</option>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                  <select
                    value={logFilters.statusCode}
                    onChange={(e) => setLogFilters({ ...logFilters, statusCode: e.target.value })}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="">All Status</option>
                    <option value="200">200 OK</option>
                    <option value="201">201 Created</option>
                    <option value="400">400 Bad Request</option>
                    <option value="401">401 Unauthorized</option>
                    <option value="403">403 Forbidden</option>
                    <option value="404">404 Not Found</option>
                    <option value="500">500 Server Error</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Filter by path..."
                    value={logFilters.path}
                    onChange={(e) => setLogFilters({ ...logFilters, path: e.target.value })}
                    className="text-sm border border-gray-300 rounded px-2 py-1 flex-1 min-w-[200px]"
                  />
                  {(logFilters.method || logFilters.statusCode || logFilters.path) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLogFilters({ method: "", statusCode: "", path: "" })}
                      className="h-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Logs List */}
                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                  {logsLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading logs...</div>
                  ) : apiLogs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No logs found</div>
                  ) : (
                    apiLogs.map((log) => {
                      const statusColor =
                        log.responseStatus >= 500
                          ? "text-red-600 bg-red-50 border-red-200"
                          : log.responseStatus >= 400
                          ? "text-yellow-600 bg-yellow-50 border-yellow-200"
                          : "text-green-600 bg-green-50 border-green-200";

                      const methodColor =
                        log.method === "GET"
                          ? "bg-blue-500"
                          : log.method === "POST"
                          ? "bg-green-500"
                          : log.method === "PUT"
                          ? "bg-yellow-500"
                          : log.method === "DELETE"
                          ? "bg-red-500"
                          : "bg-gray-500";

                      return (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={cn(
                            "p-3 rounded-lg border text-sm",
                            statusColor
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <Badge
                                  className={cn("text-white text-xs", methodColor)}
                                >
                                  {log.method}
                                </Badge>
                                <span className="font-mono text-xs truncate">{log.path}</span>
                                <Badge variant="outline" className="text-xs">
                                  {log.responseStatus}
                                </Badge>
                                <span className="text-xs text-gray-500">
                                  {log.responseTime}ms
                                </span>
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {format(new Date(log.timestamp), "MMM d, yyyy HH:mm:ss")}
                                {log.userId && (
                                  <span className="ml-2">
                                    • User: {log.userRole} ({log.userId.substring(0, 8)}...)
                                  </span>
                                )}
                              </div>
                              {log.error && (
                                <div className="mt-2 text-xs text-red-700 bg-red-100 p-2 rounded">
                                  Error: {log.error}
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="gap-2"
          >
            <RefreshCcw className={cn("h-4 w-4", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="hover:shadow-lg transition-shadow border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health Score</CardTitle>
              {data.systemHealth.status === "HEALTHY" ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : data.systemHealth.status === "WARNING" ? (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold">{data.systemHealth.score}</div>
                  <Badge
                    className={cn(
                      "mt-2",
                      getHealthColor(data.systemHealth.status),
                      "text-white"
                    )}
                  >
                    {data.systemHealth.status}
                  </Badge>
                </div>
                <div className="text-6xl text-purple-500">
                  <Activity className="h-16 w-16" />
                </div>
              </div>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                <div
                  className={cn(
                    "h-3 rounded-full transition-all",
                    getHealthColor(data.systemHealth.status)
                  )}
                  style={{ width: `${data.systemHealth.score}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Query Performance</CardTitle>
              <Server className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {data.queryPerformance.responseTime} ms
                  </div>
                  <Badge
                    className={cn(
                      "mt-2",
                      getPerformanceColor(data.queryPerformance.status),
                      "text-white"
                    )}
                  >
                    {data.queryPerformance.status}
                  </Badge>
                </div>
                <div className="text-4xl text-blue-500">
                  <Database className="h-10 w-10" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Network Status</CardTitle>
              {clientMetrics.networkStatus === "online" ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold capitalize">
                    {clientMetrics.networkStatus}
                  </div>
                  <Badge
                    className={cn(
                      "mt-2",
                      clientMetrics.networkStatus === "online"
                        ? "bg-green-500"
                        : "bg-red-500",
                      "text-white"
                    )}
                  >
                    {clientMetrics.networkStatus === "online" ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                <div className="text-4xl">
                  {clientMetrics.networkStatus === "online" ? (
                    <Globe className="h-10 w-10 text-green-500" />
                  ) : (
                    <Globe className="h-10 w-10 text-red-500" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Database Health Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Object.entries(data.database.totalRecords).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatNumber(value)}
                </div>
                <div className="text-xs text-gray-500 mt-1 capitalize">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-semibold mb-4 text-gray-700">Recent Activity (Last 30 Days)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(data.database.recentActivity).map(([key, values]) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </div>
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-white/60 rounded">
                      <span className="text-xs text-gray-600">Last 24h</span>
                      <span className="text-sm font-bold text-purple-600">{values.last24h}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/60 rounded">
                      <span className="text-xs text-gray-600">Last 7d</span>
                      <span className="text-sm font-bold text-blue-600">{values.last7d}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white/60 rounded">
                      <span className="text-xs text-gray-600">Last 30d</span>
                      <span className="text-sm font-bold text-indigo-600">{values.last30d}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <div className="text-sm text-gray-500 mb-2">Active Users</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">24h:</span>
                  <span className="font-semibold">{data.userActivity.activeUsers.last24h}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">7d:</span>
                  <span className="font-semibold">{data.userActivity.activeUsers.last7d}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">30d:</span>
                  <span className="font-semibold">{data.userActivity.activeUsers.last30d}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-2">Total Logins</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">24h:</span>
                  <span className="font-semibold">{data.userActivity.totalLogins.last24h}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">7d:</span>
                  <span className="font-semibold">{data.userActivity.totalLogins.last7d}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">30d:</span>
                  <span className="font-semibold">{data.userActivity.totalLogins.last30d}</span>
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-2">Growth Rate</div>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold">
                  {data.userActivity.growthRate >= 0 ? (
                    <span className="text-green-600">
                      {formatPercentage(data.userActivity.growthRate)}
                    </span>
                  ) : (
                    <span className="text-red-600">
                      {formatPercentage(Math.abs(data.userActivity.growthRate))}
                    </span>
                  )}
                </div>
                {data.userActivity.growthRate >= 0 ? (
                  <ArrowUp className="h-5 w-5 text-green-600" />
                ) : (
                  <ArrowDown className="h-5 w-5 text-red-600" />
                )}
              </div>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.userActivity.dailyLoginTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => format(new Date(value), "MMM d")}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => format(new Date(value), "MMM d, yyyy")}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Logins"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>





    </div>
  );
};

export default SystemInfo;

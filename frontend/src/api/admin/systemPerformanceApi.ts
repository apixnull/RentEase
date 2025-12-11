import { privateApi } from "../axios";
import { apiRoutes } from "../routes";

export interface DatabaseTotalRecords {
  users: number;
  listings: number;
  leases: number;
  payments: number;
  properties: number;
  units: number;
  maintenanceRequests: number;
  chatMessages: number;
  notifications: number;
  unitViews: number;
  fraudReports: number;
}

export interface RecentActivity {
  users: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
  listings: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
  leases: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
  payments: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
}

export interface DailyTrend {
  date: string;
  count: number;
}

export interface UserActivity {
  activeUsers: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
  totalLogins: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
  growthRate: number;
  dailyLoginTrends: DailyTrend[];
}

export interface BusinessHealth {
  listings: {
    total: number;
    visible: number;
    visibilityRate: number;
  };
  leases: {
    total: number;
    active: number;
    completed: number;
    completionRate: number;
  };
  payments: {
    total: number;
    paid: number;
    pending: number;
    successRate: number;
  };
  maintenance: {
    total: number;
    resolved: number;
    open: number;
    resolutionRate: number;
    avgResolutionTimeHours: number;
  };
  fraudReports: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
  dailyListingTrends: DailyTrend[];
  dailyPaymentTrends: DailyTrend[];
}

export interface Engagement {
  unitViews: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
  chatMessages: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
  notifications: {
    total: number;
    read: number;
    readRate: number;
    last24h: number;
    last7d: number;
    last30d: number;
  };
}

export interface QueryPerformance {
  responseTime: number;
  status: "FAST" | "GOOD" | "SLOW";
}

export interface SystemHealth {
  score: number;
  status: "HEALTHY" | "WARNING" | "CRITICAL";
}

export interface SystemPerformanceData {
  timestamp: string;
  queryPerformance: QueryPerformance;
  systemHealth: SystemHealth;
  database: {
    totalRecords: DatabaseTotalRecords;
    recentActivity: RecentActivity;
  };
  userActivity: UserActivity;
  businessHealth: BusinessHealth;
  engagement: Engagement;
}

export const getSystemPerformanceRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get<SystemPerformanceData>(apiRoutes.admin("/system-performance"), {
    signal: options?.signal,
  });


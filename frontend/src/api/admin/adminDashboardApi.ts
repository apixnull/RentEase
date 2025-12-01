import { privateApi } from "../axios";
import { apiRoutes } from "../routes";

export interface DashboardMetrics {
  users: {
    total: number;
    landlords: number;
    tenants: number;
    verified: number;
    blocked: number;
    newLast30Days: number;
    newLast7Days: number;
    activeLast30Days: number;
  };
  listings: {
    total: number;
    visible: number;
    hidden: number;
    blocked: number;
    flagged: number;
    expired: number;
    waitingReview: number;
    featured: number;
    newLast30Days: number;
    newLast7Days: number;
  };
  fraudReports: {
    total: number;
    newLast30Days: number;
    newLast7Days: number;
  };
  revenue: {
    total: number;
    last30Days: number;
  };
}

export interface RecentUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  avatarUrl: string | null;
  role: string;
  isVerified: boolean;
  isDisabled: boolean;
  createdAt: string;
}

export interface RecentListing {
  id: string;
  lifecycleStatus: string;
  isFeatured: boolean;
  createdAt: string;
  unit: {
    id: string;
    label: string;
    property: {
      id: string;
      title: string;
    };
  };
  landlord: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface RecentFraudReport {
  id: string;
  reason: string;
  createdAt: string;
  listing: {
    id: string;
    unit: {
      property: {
        title: string;
      };
    };
  };
  reporter: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface DashboardData {
  metrics: DashboardMetrics;
  recent: {
    users: RecentUser[];
    listings: RecentListing[];
    fraudReports: RecentFraudReport[];
  };
}

export const getAdminDashboardRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get<DashboardData>(apiRoutes.admin("/dashboard"), {
    signal: options?.signal,
  });


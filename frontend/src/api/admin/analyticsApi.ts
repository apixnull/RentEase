import { privateApi } from "../axios";

export interface DailyDataPoint {
  date: string;
  label: string;
  count: number;
}

export interface FraudReportDailyPoint {
  date: string;
  count: number;
}

export interface RecentFraudReport {
  id: string;
  listingId: string;
  reason: string;
  createdAt: string;
  propertyTitle: string;
  reporterName: string;
}

export interface AnalyticsResponse {
  period: {
    label: string;
    start: string;
    end: string;
  };
  usersLoggedInThisMonth: number;
  totalLogins: number;
  dailyLogins: DailyDataPoint[];
  totalFraudReports: number;
  dailyFraudReports: FraudReportDailyPoint[];
  recentFraudReports: RecentFraudReport[];
  totalListingsCreated: number;
  dailyListings: DailyDataPoint[];
}

export const getAdminAnalyticsRequest = async (
  period?: 'this_month' | 'this_year',
  signal?: AbortSignal
) => {
  const params: Record<string, string> = {};
  if (period) params.period = period;

  return privateApi.get<AnalyticsResponse>("/admin/analytics", {
    params,
    signal,
  });
};


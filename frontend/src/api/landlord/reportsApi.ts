// ---------------------- Reports ----------------------
import { privateApi } from "../axios";
import { apiRoutes } from "../routes";

export interface GetReportsDataParams {
  period?: "MONTH" | "3MONTHS" | "6MONTHS" | "YEAR";
  signal?: AbortSignal;
}

export interface ReportsResponse {
  summary: {
    totalProperties: number;
    totalUnits: number;
    activeLeases: number;
    totalListings: number;
    totalViews: number;
    totalReviews: number;
    averageRating: number;
    totalIncome: number;
    totalExpense: number;
    netRevenue: number;
    totalPaidAmount: number;
    totalPendingAmount: number;
    totalMaintenanceRequests: number;
    totalScreenings: number;
  };
  leases: {
    statusCounts: {
      active: number;
      pending: number;
      completed: number;
      terminated: number;
      cancelled: number;
    };
  };
  financial: {
    totalIncome: number;
    totalExpense: number;
    netRevenue: number;
    monthlyData: Array<{
      month: string;
      income: number;
      expense: number;
    }>;
  };
  payments: {
    statusCounts: {
      paid: number;
      pending: number;
      overdue: number;
    };
    totalPaidAmount: number;
    totalPendingAmount: number;
  };
  listings: {
    statusCounts: {
      visible: number;
      hidden: number;
      waiting_review: number;
      expired: number;
      flagged: number;
      blocked: number;
    };
  };
  maintenance: {
    statusCounts: {
      open: number;
      in_progress: number;
      resolved: number;
      cancelled: number;
      invalid: number;
    };
  };
  screenings: {
    statusCounts: {
      pending: number;
      submitted: number;
      approved: number;
      rejected: number;
    };
    riskLevelCounts: {
      low: number;
      medium: number;
      high: number;
    };
  };
  engagement: {
    totalViews: number;
    totalReviews: number;
    averageRating: number;
    monthlyViewsData: Array<{
      month: string;
      views: number;
    }>;
    ratingDistribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  };
  propertyPerformance: Array<{
    propertyId: string;
    propertyTitle: string;
    income: number;
    expense: number;
    netRevenue: number;
    unitCount: number;
  }>;
  dateRange: {
    start: string;
    end: string;
  };
}

export const getReportsDataRequest = (params?: GetReportsDataParams) => {
  const queryParams = new URLSearchParams();
  
  if (params?.period) {
    queryParams.append("period", params.period);
  }

  const queryString = queryParams.toString();
  const url = queryString 
    ? `${apiRoutes.landlord("/reports")}?${queryString}`
    : apiRoutes.landlord("/reports");

  return privateApi.get<ReportsResponse>(url, {
    signal: params?.signal,
  });
};


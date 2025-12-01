import { privateApi } from '../axios';
import { apiRoutes } from '../routes';

export interface MaintenanceBreakdownItem {
  requestId: string;
  propertyId: string;
  propertyTitle: string;
  unitId: string;
  unitLabel: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  description: string;
  photoUrl: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CANCELLED' | 'INVALID';
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceAnalyticsResponse {
  summary: {
    totalRequests: number;
    statusCounts: {
      open: number;
      in_progress: number;
      resolved: number;
      cancelled: number;
      invalid: number;
    };
    totalProperties: number;
    totalUnits: number;
  };
  dailyMaintenanceRequests: Array<{
    date: string;
    count: number;
  }>;
  maintenanceBreakdown: MaintenanceBreakdownItem[];
  propertiesList: Array<{
    id: string;
    title: string;
  }>;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface GetMaintenanceAnalyticsParams {
  period?: 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR' | 'LAST_YEAR' | 'CUSTOM';
  startMonth?: string; // YYYY-MM format
  endMonth?: string; // YYYY-MM format
  signal?: AbortSignal;
}

export const getMaintenanceAnalyticsRequest = (params?: GetMaintenanceAnalyticsParams) => {
  const { period = 'THIS_MONTH', startMonth, endMonth, signal } = params || {};
  
  const queryParams = new URLSearchParams();
  queryParams.append('period', period);
  if (period === 'CUSTOM') {
    if (startMonth) queryParams.append('startMonth', startMonth);
    if (endMonth) queryParams.append('endMonth', endMonth);
  }

  const queryString = queryParams.toString();
  const url = queryString 
    ? `${apiRoutes.landlord('/maintenance-analytics')}?${queryString}`
    : apiRoutes.landlord('/maintenance-analytics');

  return privateApi.get<MaintenanceAnalyticsResponse>(url, {
    signal,
  });
};


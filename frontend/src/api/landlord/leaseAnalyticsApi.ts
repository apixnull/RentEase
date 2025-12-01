import { privateApi } from '../axios';
import { apiRoutes } from '../routes';

export interface PaymentBehavior {
  onTimeCount: number;
  lateCount: number;
  advanceCount: number;
  totalPaidCount: number;
}

export interface LandlordNotes {
  totalCount: number;
  byCategory: Record<string, number>;
}

export interface LeaseAnalyticsItem {
  leaseId: string;
  propertyId: string;
  propertyTitle: string;
  unitId: string;
  unitLabel: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  rentAmount: number;
  rentCollected: number;
  startDate: string;
  endDate: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'CANCELLED';
  paymentBehavior: PaymentBehavior;
  landlordNotes: LandlordNotes;
  maintenanceRequestsCount: number;
}

export interface UnitAnalytics {
  unitId: string;
  unitLabel: string;
  totalRentCollected: number;
  totalLeases: number;
  activeLeases: number;
  leases: LeaseAnalyticsItem[];
}

export interface PropertyAnalytics {
  propertyId: string;
  propertyTitle: string;
  totalRentCollected: number;
  totalLeases: number;
  activeLeases: number;
  totalUnits: number;
  units: UnitAnalytics[];
}

export interface PaymentBreakdownItem {
  paymentId: string;
  amount: number;
  paidAt: string;
  method: string | null;
  timingStatus: string | null;
  propertyId: string;
  propertyTitle: string;
  unitId: string;
  unitLabel: string;
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  leaseId: string;
}

export interface LeaseAnalyticsResponse {
  summary: {
    totalRentCollected: number;
    totalLeases: number;
    activeLeases: number;
    totalProperties: number;
    totalUnits: number;
    avgRevenuePerProperty: number;
    totalPayments: number;
  };
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
  paymentBreakdown: PaymentBreakdownItem[];
  propertiesList: Array<{
    id: string;
    title: string;
  }>;
  unitsList: Array<{
    id: string;
    unitId: string;
    unitLabel: string;
    propertyId: string;
    propertyTitle: string;
  }>;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface GetLeaseAnalyticsParams {
  period?: 'THIS_MONTH' | 'LAST_MONTH' | 'THIS_YEAR' | 'LAST_YEAR' | 'CUSTOM';
  startMonth?: string; // YYYY-MM format
  endMonth?: string; // YYYY-MM format
  signal?: AbortSignal;
}

export const getLeaseAnalyticsRequest = (params?: GetLeaseAnalyticsParams) => {
  const { period = 'THIS_MONTH', startMonth, endMonth, signal } = params || {};
  
  const queryParams = new URLSearchParams();
  queryParams.append('period', period);
  if (period === 'CUSTOM') {
    if (startMonth) queryParams.append('startMonth', startMonth);
    if (endMonth) queryParams.append('endMonth', endMonth);
  }

  const queryString = queryParams.toString();
  const url = queryString 
    ? `${apiRoutes.landlord('/lease-analytics')}?${queryString}`
    : apiRoutes.landlord('/lease-analytics');

  return privateApi.get<LeaseAnalyticsResponse>(url, {
    signal,
  });
};


import { privateApi } from '../axios';
import { apiRoutes } from '../routes';

export interface LeasePeriod {
  leaseId: string;
  startDate: string;
  endDate: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'TERMINATED' | 'CANCELLED' | 'PENDING';
  rentAmount: number;
  createdAt: string;
  daysOccupied: number;
  tenant: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface UnitOccupancyData {
  unitId: string;
  unitLabel: string;
  totalLeases: number;
  totalDaysOccupied: number;
  occupancyRate: number;
  isOccupied: boolean;
  leases: LeasePeriod[];
}

export interface PropertyOccupancyData {
  propertyId: string;
  propertyTitle: string;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  units: UnitOccupancyData[];
}

export interface OccupancyAnalyticsResponse {
  year: number;
  summary: {
    totalProperties: number;
    totalUnits: number;
    occupiedUnits: number;
    vacantUnits: number;
    overallOccupancyRate: number;
    daysInYear: number;
  };
  properties: PropertyOccupancyData[];
  dateRange: {
    start: string;
    end: string;
  };
}

export interface GetOccupancyAnalyticsParams {
  year?: number;
  signal?: AbortSignal;
}

export const getOccupancyAnalyticsRequest = (params?: GetOccupancyAnalyticsParams) => {
  const { year, signal } = params || {};
  
  const queryParams = new URLSearchParams();
  if (year) {
    queryParams.append('year', year.toString());
  }

  const queryString = queryParams.toString();
  const url = queryString 
    ? `${apiRoutes.landlord('/occupancy-analytics')}?${queryString}`
    : apiRoutes.landlord('/occupancy-analytics');

  return privateApi.get<OccupancyAnalyticsResponse>(url, {
    signal,
  });
};


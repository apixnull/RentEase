import { privateApi } from "../axios";
import { apiRoutes } from "../routes";

export interface ApiLog {
  id: string;
  method: string;
  path: string;
  url: string;
  query: Record<string, any>;
  ip: string;
  userAgent: string;
  timestamp: string;
  userId: string | null;
  userRole: string | null;
  requestBody: any;
  responseStatus: number;
  responseTime: number;
  responseBody: any;
  error: string | null;
}

export interface ApiLogsResponse {
  logs: ApiLog[];
  total: number;
}

export interface LogStatistics {
  total: number;
  lastHour: number;
  lastDay: number;
  methodCounts: Record<string, number>;
  statusCounts: Record<string, number>;
  topPaths: Array<{ path: string; count: number }>;
  avgResponseTime: number;
  errorRate: number;
  errorCount: number;
}

export const getApiLogsRequest = (params?: {
  limit?: number;
  method?: string;
  statusCode?: number | number[];
  path?: string;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.method) queryParams.append("method", params.method);
  if (params?.statusCode) {
    const codes = Array.isArray(params.statusCode) 
      ? params.statusCode 
      : [params.statusCode];
    codes.forEach(code => queryParams.append("statusCode", code.toString()));
  }
  if (params?.path) queryParams.append("path", params.path);

  const queryString = queryParams.toString();
  const url = apiRoutes.admin("/api-logs") + (queryString ? `?${queryString}` : "");
  
  return privateApi.get<ApiLogsResponse>(url);
};

export const getApiLogsStatisticsRequest = () =>
  privateApi.get<LogStatistics>(apiRoutes.admin("/api-logs/statistics"));


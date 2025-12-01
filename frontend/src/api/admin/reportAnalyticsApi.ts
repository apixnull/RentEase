import { privateApi } from "../axios";
import { apiRoutes } from "../routes";

// ---- Report Analytics Endpoints ----
export const getUserAnalyticsRequest = (params?: {
  period?: 'this_month' | 'this_year' | 'all_time';
  month?: number;
  year?: number;
  signal?: AbortSignal;
}) => {
  const queryParams: Record<string, string> = {};
  
  if (params?.month) queryParams.month = params.month.toString();
  if (params?.year) queryParams.year = params.year.toString();
  if (params?.period && !params.month && !params.year) queryParams.period = params.period;
  
  return privateApi.get(apiRoutes.admin("/report-analytics/users"), {
    params: queryParams,
    signal: params?.signal,
  });
};

export const getListingAnalyticsRequest = (params?: {
  period?: 'this_month' | 'this_year' | 'all_time';
  month?: number;
  year?: number;
  signal?: AbortSignal;
}) => {
  const queryParams: Record<string, string> = {};
  
  if (params?.month) queryParams.month = params.month.toString();
  if (params?.year) queryParams.year = params.year.toString();
  if (params?.period && !params.month && !params.year) queryParams.period = params.period;
  
  return privateApi.get(apiRoutes.admin("/report-analytics/listings"), {
    params: queryParams,
    signal: params?.signal,
  });
};


export const getFraudReportsAnalyticsRequest = (params?: {
  period?: 'this_month' | 'this_year' | 'all_time';
  month?: number;
  year?: number;
  signal?: AbortSignal;
}) => {
  const queryParams: Record<string, string> = {};
  
  if (params?.month) queryParams.month = params.month.toString();
  if (params?.year) queryParams.year = params.year.toString();
  if (params?.period && !params.month && !params.year) queryParams.period = params.period;
  
  return privateApi.get(apiRoutes.admin("/report-analytics/fraud-reports"), {
    params: queryParams,
    signal: params?.signal,
  });
};

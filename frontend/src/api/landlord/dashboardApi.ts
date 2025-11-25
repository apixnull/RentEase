// ---------------------- Dashboard ----------------------
import { privateApi } from "../axios";
import { apiRoutes } from "../routes";

// Get dashboard metrics
export const getDashboardMetricsRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get(apiRoutes.landlord("/dashboard/metrics"), {
    signal: options?.signal,
  });

// Get dashboard payments (overdue and upcoming)
export const getDashboardPaymentsRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get(apiRoutes.landlord("/dashboard/payments"), {
    signal: options?.signal,
  });

// Get dashboard leases (pending and completing in 30 days)
export const getDashboardLeasesRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get(apiRoutes.landlord("/dashboard/leases"), {
    signal: options?.signal,
  });

// Get dashboard screenings (pending and submitted)
export const getDashboardScreeningsRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get(apiRoutes.landlord("/dashboard/screenings"), {
    signal: options?.signal,
  });

// Get dashboard maintenance (open and in-progress)
export const getDashboardMaintenanceRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get(apiRoutes.landlord("/dashboard/maintenance"), {
    signal: options?.signal,
  });

// Get dashboard listings (pending review, expiring, blocked, flagged)
export const getDashboardListingsRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get(apiRoutes.landlord("/dashboard/listings"), {
    signal: options?.signal,
  });

// Get dashboard financial (income, expenses, net revenue, breakdown)
export const getDashboardFinancialRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get(apiRoutes.landlord("/dashboard/financial"), {
    signal: options?.signal,
  });


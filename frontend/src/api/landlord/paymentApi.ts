// ---------------------------- Payments
import { privateApi } from "../axios";
import { apiRoutes } from "../routes";

export const createPaymentRequest = (
  leaseId: string,
  data: {
    amount: number;
    dueDate: string;
    paidAt?: string | null;
    method?: string;
    type: string;
    status: 'PENDING' | 'PAID';
    timingStatus?: string | null;
    note?: string | null;
  },
  options?: { signal?: AbortSignal }
) =>
  privateApi.post(apiRoutes.landlord(`/lease/${leaseId}/payments`), data, {
    signal: options?.signal,
  });

export const markPaymentAsPaidRequest = (
  paymentId: string,
  data: {
    paidAt: string;
    method: string;
    type: string;
    timingStatus: string;
    amount?: number;
  },
  options?: { signal?: AbortSignal }
) =>
  privateApi.patch(apiRoutes.landlord(`/payments/${paymentId}/mark-paid`), data, {
    signal: options?.signal,
  });

export const getLandlordPaymentsRequest = (
  params?: { month?: number; year?: number; scope?: 'month' | 'year' | 'all' },
  options?: { signal?: AbortSignal }
) =>
  privateApi.get(apiRoutes.landlord("/payments/list"), {
    params,
    signal: options?.signal,
  });
// ---------------------------- Payments
import { privateApi } from "../axios";

export const markPaymentAsPaidRequest = (
  paymentId: string,
  data: {
    paidAt: string;
    method: string;
    type: string;
    timingStatus: string;
  },
  options?: { signal?: AbortSignal }
) =>
  privateApi.patch(`/landlord/payments/${paymentId}/mark-paid`, data, {
    signal: options?.signal,
  });

// ---------------------- Financials ----------------------
import { privateApi } from "../axios";
import { apiRoutes } from "../routes";

// 🏠 Properties with Units (for financial forms)
export const getPropertiesWithUnitsRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get(apiRoutes.landlord("/financial/properties-with-units"), {
    signal: options?.signal,
  });

// 💰💸 Transactions (Income & Expense combined)
export const getAllTransactionsRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get(apiRoutes.landlord("/financial/transactions"), {
    signal: options?.signal,
  });

export const createTransactionRequest = (
  payload: any,
  options?: { signal?: AbortSignal }
) =>
  privateApi.post(apiRoutes.landlord("/financial/transactions"), payload, {
    signal: options?.signal,
  });

// 🔄 Update Transaction
export const updateTransactionRequest = (
  transactionId: string,
  payload: any,
  options?: { signal?: AbortSignal }
) =>
  privateApi.patch(apiRoutes.landlord(`/financial/transactions/${transactionId}`), payload, {
    signal: options?.signal,
  });

// 🗑️ Delete Transaction
export const deleteTransactionRequest = (
  transactionId: string,
  options?: { signal?: AbortSignal }
) =>
  privateApi.delete(apiRoutes.landlord(`/financial/transactions/${transactionId}`), {
    signal: options?.signal,
  });


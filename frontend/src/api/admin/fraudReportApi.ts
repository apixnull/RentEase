import { privateApi } from "../axios";
import { apiRoutes } from "../routes";

export interface FraudReport {
  id: string;
  listingId: string;
  reporterId: string;
  reason: string;
  details?: string | null;
  createdAt: string;
  updatedAt: string;
  listing: {
    id: string;
    lifecycleStatus: string;
    unit: {
      label: string;
      property: {
        title: string;
      };
    };
  };
  reporter: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

export interface FraudReportsResponse {
  reports: FraudReport[];
}

export const getFraudReportsRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get<FraudReportsResponse>(apiRoutes.admin("/fraud-reports"), {
    signal: options?.signal,
  });


import { privateApi } from "../axios";

export type EarningsRange = "this_month" | "last_3_months" | "this_year" | "year";

export interface EarningsTimelinePoint {
  label: string;
  total: number;
}

export interface EarningsRecord {
  id: string;
  propertyTitle: string;
  unitLabel: string;
  amount: number;
  paymentDate: string | null;
  providerName: string | null;
}

export interface EarningsSummaryResponse {
  summary: {
    range: {
      label: string;
      start: string;
      end: string;
    };
    totalEarnings: number;
    averagePerListing: number;
    listingCount: number;
  };
  timeline: EarningsTimelinePoint[];
  records: EarningsRecord[];
}

export const getAdminEarningsRequest = async ({
  range,
  year,
  signal,
}: {
  range?: EarningsRange;
  year?: number;
  signal?: AbortSignal;
} = {}) => {
  const params: Record<string, string> = {};
  if (range) params.range = range;
  if (year) params.year = String(year);

  return privateApi.get<EarningsSummaryResponse>("/admin/earnings", {
    params,
    signal,
  });
};


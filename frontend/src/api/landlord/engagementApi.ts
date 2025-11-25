// ---------------------- Engagement ----------------------
import { privateApi } from "../axios";
import { apiRoutes } from "../routes";

export interface GetEngagementDataParams {
  propertyId?: string;
  unitId?: string;
  startDate?: string;
  endDate?: string;
  range?: "MONTH" | "YEAR" | "RANGE";
  signal?: AbortSignal;
}

export const getEngagementDataRequest = (params?: GetEngagementDataParams) => {
  const queryParams = new URLSearchParams();
  
  if (params?.propertyId) queryParams.append("propertyId", params.propertyId);
  if (params?.unitId) queryParams.append("unitId", params.unitId);
  if (params?.startDate) queryParams.append("startDate", params.startDate);
  if (params?.endDate) queryParams.append("endDate", params.endDate);
  if (params?.range) queryParams.append("range", params.range);

  return privateApi.get(`${apiRoutes.landlord("/engagement")}?${queryParams.toString()}`, {
    signal: params?.signal,
  });
};


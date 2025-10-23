// ---------------------- Tenant Screening ----------------------
import { privateApi } from "../axios";

// ✅ LANDLORD: Invite a tenant for screening
export const inviteTenantForScreeningRequest = (
  payload: any,
  options?: { signal?: AbortSignal }
) =>
  privateApi.post("/landlord/screening/invite", payload, {
    signal: options?.signal,
  });


// ✅ LANDLORD: Review tenant screening (approve / reject)
export const landlordReviewTenantScreeningRequest = (
  screeningId: string,
  payload: any,
  options?: { signal?: AbortSignal }
) =>
  privateApi.post(`/landlord/screening/${screeningId}/review`, payload, {
    signal: options?.signal,
  });

// ✅ LANDLORD: Get all screenings (categorized by status)
export const getLandlordScreeningsListRequest = (options?: {
  signal?: AbortSignal;
}) =>
  privateApi.get("/landlord/screening/list", {
    signal: options?.signal,
  });

// ✅ LANDLORD: View a specific screening detail
export const getSpecificScreeningLandlordRequest = (
  screeningId: string,
  options?: { signal?: AbortSignal }
) =>
  privateApi.get(`/landlord/screening/${screeningId}/details`, {
    signal: options?.signal,
  });

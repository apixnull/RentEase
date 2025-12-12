// ---------------------- Tenant Screening ----------------------
import { privateApi } from "../axios";
import { apiRoutes } from "../routes";

// ✅ Tenant submits their screening information (AI excluded)
export const tenantSubmitScreeningInfoRequest = (
  screeningId: string,
  payload: any,
  options?: { signal?: AbortSignal }
) =>
  privateApi.post(apiRoutes.tenant(`/screening/${screeningId}/submit`), payload, {
    signal: options?.signal,
  });

// ✅ Tenant retrieves all their screening invitations
export const getTenantScreeningInvitationsRequest = (
  options?: { signal?: AbortSignal }
) =>
  privateApi.get(apiRoutes.tenant("/screening/list"), {
    signal: options?.signal,
  });


  
// ✅ Tenant retrieves specific screening details (AI-excluded)
export const getSpecificTenantScreeningRequest = (
  screeningId: string,
  options?: { signal?: AbortSignal }
) =>
  privateApi.get(apiRoutes.tenant(`/screening/${screeningId}/details`), {
    signal: options?.signal,
  });

// ✅ Tenant rejects screening invitation
export const tenantRejectScreeningInvitationRequest = (
  screeningId: string,
  options?: { signal?: AbortSignal }
) =>
  privateApi.post(apiRoutes.tenant(`/screening/${screeningId}/reject`), {}, {
    signal: options?.signal,
  });
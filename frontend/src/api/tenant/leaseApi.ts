// ---------------------- Tenant Lease ----------------------
import { privateApi } from "../axios";
import { apiRoutes } from "../routes";

// 📋 Get all tenant leases (grouped: pending, active, etc.)
export const getTenantLeasesRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get(apiRoutes.tenant("/lease/list"), {
    signal: options?.signal,
  });

// 🔍 Get specific lease details
export const getLeaseDetailsRequest = (
  leaseId: string,
  options?: { signal?: AbortSignal }
) =>
  privateApi.get(apiRoutes.tenant(`/lease/${leaseId}/details`), {
    signal: options?.signal,
  });

// ✅ Tenant accepts or rejects a lease
export const handleTenantLeaseActionRequest = (
  leaseId: string,
  action: "accept" | "reject",
  options?: { signal?: AbortSignal }
) =>
  privateApi.patch(
    apiRoutes.tenant(`/lease/${leaseId}/action`),
    { action },
    { signal: options?.signal }
  );

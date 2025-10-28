// ---------------------- Tenant Lease ----------------------
import { privateApi } from "../axios";

// 📋 Get all tenant leases (grouped: pending, active, etc.)
export const getTenantLeasesRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get("/tenant/lease/list", {
    signal: options?.signal,
  });

// 🔍 Get specific lease details
export const getLeaseDetailsRequest = (
  leaseId: string,
  options?: { signal?: AbortSignal }
) =>
  privateApi.get(`/tenant/lease/${leaseId}/details`, {
    signal: options?.signal,
  });

// ✅ Tenant accepts or rejects a lease
export const handleTenantLeaseActionRequest = (
  leaseId: string,
  action: "accept" | "reject",
  options?: { signal?: AbortSignal }
) =>
  privateApi.patch(
    `/tenant/lease/${leaseId}/action`,
    { action },
    { signal: options?.signal }
  );

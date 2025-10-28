// ---------------------- Lease ----------------------
import { privateApi } from "../axios";

// 🏗️ Create a new lease
export const createLeaseRequest = (
  payload: any,
  options?: { signal?: AbortSignal }
) =>
  privateApi.post("/landlord/lease/create", payload, {
    signal: options?.signal,
  });

// 📋 Get all leases (any status)
export const getAllLeasesRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get("/landlord/lease/list", {
    signal: options?.signal,
  });

// 🔍 Get specific lease details
export const getLeaseByIdRequest = (
  leaseId: string,
  options?: { signal?: AbortSignal }
) =>
  privateApi.get(`/landlord/lease/${leaseId}/details`, {
    signal: options?.signal,
  });

// 🏘️ Get all properties (with units) and suggested tenants
export const getPropertiesWithUnitsAndTenantsRequest = (
  options?: { signal?: AbortSignal }
) =>
  privateApi.get("/landlord/lease/properties-with-units-and-tenants", {
    signal: options?.signal,
  });

// 👤 Find tenant for lease (by name or email)
export const findTenantForLeaseRequest = (
  query: string,
  options?: { signal?: AbortSignal }
) =>
  privateApi.get("/landlord/lease/find-tenant", {
    params: { query },
    signal: options?.signal,
  });

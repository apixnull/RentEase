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

// 🛑 Cancel pending lease
export const cancelLeaseRequest = (leaseId: string) =>
  privateApi.patch(`/landlord/lease/${leaseId}/cancel`);

// ❌ Terminate lease early
export const terminateLeaseRequest = (leaseId: string) =>
  privateApi.patch(`/landlord/lease/${leaseId}/terminate`);

// ✏️ Update pending lease
export const updateLeaseRequest = (leaseId: string, payload: any) =>
  privateApi.patch(`/landlord/lease/${leaseId}/update`, payload);

// 🏘️ Get all properties with units (for editing - includes all units regardless of lease status)
export const getPropertiesWithUnitsRequest = (
  options?: { signal?: AbortSignal }
) =>
  privateApi.get("/landlord/lease/properties-with-units", {
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

// 📝 Tenant Behavior Analysis - Landlord Notes
export const addLandlordNoteRequest = (
  leaseId: string,
  payload: { note: string; category: string }
) =>
  privateApi.post(`/landlord/lease/${leaseId}/behavior/notes`, payload);

export const updateLandlordNoteRequest = (
  leaseId: string,
  noteIndex: number,
  payload: { note: string; category: string }
) =>
  privateApi.patch(`/landlord/lease/${leaseId}/behavior/notes/${noteIndex}`, payload);

export const deleteLandlordNoteRequest = (
  leaseId: string,
  noteIndex: number
) =>
  privateApi.delete(`/landlord/lease/${leaseId}/behavior/notes/${noteIndex}`);

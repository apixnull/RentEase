// ---------------------- Tenant Maintenance Requests ----------------------
import { privateApi } from "../axios";

// 📋 Get all maintenance requests for a tenant
export const getAllTenantMaintenanceRequestsRequest = (
  options?: { signal?: AbortSignal }
) =>
  privateApi.get("/tenant/maintenance/requests", {
    signal: options?.signal,
  });

// 🔧 Create a new maintenance request
export const createMaintenanceRequestRequest = (
  data: {
    propertyId: string;
    unitId: string;
    description: string;
    photoUrl?: string | null;
  },
  options?: { signal?: AbortSignal }
) =>
  privateApi.post("/tenant/maintenance/request", data, {
    signal: options?.signal,
  });

// ❌ Cancel a maintenance request
export const cancelMaintenanceRequestRequest = (
  maintenanceId: string,
  options?: { signal?: AbortSignal }
) =>
  privateApi.patch(`/tenant/maintenance/${maintenanceId}/cancel`, {}, {
    signal: options?.signal,
  });


// ---------------------- Landlord Maintenance Requests ----------------------
import { privateApi } from "../axios";

// 📋 Get all maintenance requests for a landlord
export const getAllMaintenanceRequestsRequest = (
  options?: { signal?: AbortSignal }
) =>
  privateApi.get("/landlord/maintenance/requests", {
    signal: options?.signal,
  });

// 🔧 Update maintenance request status
export const updateMaintenanceStatusRequest = (
  maintenanceId: string,
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CANCELLED" | "INVALID",
  options?: { signal?: AbortSignal }
) =>
  privateApi.patch(
    `/landlord/maintenance/${maintenanceId}/status`,
    { status },
    {
      signal: options?.signal,
    }
  );


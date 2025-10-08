import { privateApi } from "../axios";

// Fetch all visible listings for tenants (browse units)
export const getVisibleListingsForTenantRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get("/tenant/browse-unit", { signal: options?.signal });

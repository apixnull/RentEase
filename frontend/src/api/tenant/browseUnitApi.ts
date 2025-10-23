import { privateApi } from "../axios";

export const getVisibleListingsForTenantRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get("/tenant/browse-unit", { signal: options?.signal });

export const getSpecificListingRequest = ( listingId: string, options?: { signal?: AbortSignal }) =>
  privateApi.get(`/tenant/browse-unit/${listingId}/details`, {
    signal: options?.signal,
  });

// ---------------------- Admin Listing ----------------------

import { privateApi } from "../axios";
import { apiRoutes } from "../routes";

// 🧾 Get all listings (for admin dashboard)
export const getAllListingsForAdminRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get(apiRoutes.admin("/listings"), {
    signal: options?.signal,
  });

// 🧾 Get specific listing details (for admin view)
export const getSpecificListingAdminRequest = (
  listingId: string,
  options?: { signal?: AbortSignal }
) => {
  return privateApi.get(apiRoutes.admin(`/listings/${listingId}/details`), {
    signal: options?.signal,
  });
};


// 🧾 Get unit and property info by listing id
export const getListingUnitAndPropertyRequest = (listingId: string, options?: { signal?: AbortSignal }) =>
  privateApi.get(apiRoutes.admin(`/listings/${listingId}/unit-property`), {
    signal: options?.signal,
  });

// ⚙️ Approve, Flag, or Block listing
export const updateListingStatusRequest = (
  listingId: string,
  payload: { action: "approve" | "flag" | "block"; reason?: string },
  options?: { signal?: AbortSignal }
) =>
  privateApi.patch(apiRoutes.admin(`/listings/${listingId}/status`), payload, {
    signal: options?.signal,
  });
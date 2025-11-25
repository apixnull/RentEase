// ---------------------- Listing ----------------------
import { privateApi } from "../axios";
import { apiRoutes } from "../routes";

// Get all landlord listings
export const getLandlordListingsRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get(apiRoutes.landlord("/listings"), {
    signal: options?.signal,
  });

// Review unit before listing
export const getUnitForListingReviewRequest = (
  unitId: string,
  options?: { signal?: AbortSignal }
) =>
  privateApi.get(apiRoutes.landlord(`/listing/${unitId}/review`), {
    signal: options?.signal,
  });

// Create payment session (listing created after payment via webhook)
export const createPaymentSessionRequest = (
  unitId: string,
  payload: { isFeatured: boolean },
  options?: { signal?: AbortSignal }
) =>
  privateApi.post(apiRoutes.landlord(`/listing/${unitId}/payment-session`), payload, {
    signal: options?.signal,
  });


// Get a specific listing information
export const getLandlordSpecificListingRequest = (
  listingId: string,
  options?: { signal?: AbortSignal }
) =>
  privateApi.get(apiRoutes.landlord(`/listing/${listingId}/details`), {
    signal: options?.signal,
  });


  
// ✅ Get listing by unitId for payment success page
export const getListingByUnitIdForSuccessRequest = (
  unitId: string,
  options?: { signal?: AbortSignal }
) =>
  privateApi.get(`${apiRoutes.landlord("/listing/payment-success")}?unitId=${unitId}`, {
    signal: options?.signal,
  });

// ✅ Get basic listing info when success (by listingId - kept for backward compatibility)
export const getLandlordListingInfoSuccessRequest = (
  listingId: string,
  options?: { signal?: AbortSignal }
) =>
  privateApi.get(apiRoutes.landlord(`/listing/${listingId}/success`), {
    signal: options?.signal,
  });

// 🔄 Toggle listing visibility (VISIBLE ↔ HIDDEN)
export const toggleListingVisibilityRequest = (
  listingId: string,
  options?: { signal?: AbortSignal }
) =>
  privateApi.patch(apiRoutes.landlord(`/listing/${listingId}/toggle-visibility`), {}, {
    signal: options?.signal,
  });


  
// ✅ Get eligible units for listing
export const getEligibleUnitsForListingRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get(apiRoutes.landlord("/listing/eligible-units"), {
    signal: options?.signal,
  });


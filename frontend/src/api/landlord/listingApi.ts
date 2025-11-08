// ---------------------- Listing ----------------------
import { privateApi } from "../axios";

// Get all landlord listings
export const getLandlordListingsRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get("/landlord/listings", {
    signal: options?.signal,
  });

// Review unit before listing
export const getUnitForListingReviewRequest = (
  unitId: string,
  options?: { signal?: AbortSignal }
) =>
  privateApi.get(`/landlord/listing/${unitId}/review`, {
    signal: options?.signal,
  });

// Create listing + payment session
export const createListingWithPaymentRequest = (
  unitId: string,
  payload: any, // this is the isFeatured 
  options?: { signal?: AbortSignal }
) =>
  privateApi.post(`/landlord/listing/${unitId}/create`, payload, {
    signal: options?.signal,
  });


// Get a specific listing information
export const getLandlordSpecificListingRequest = (
  listingId: string,
  options?: { signal?: AbortSignal }
) =>
  privateApi.get(`/landlord/listing/${listingId}/details`, {
    signal: options?.signal,
  });


  
// ✅ Get basic listing info when success
export const getLandlordListingInfoSuccessRequest = (
  listingId: string,
  options?: { signal?: AbortSignal }
) =>
  privateApi.get(`/landlord/listing/${listingId}/success`, {
    signal: options?.signal,
  });


  
// ✅ Get eligible units for listing
export const getEligibleUnitsForListingRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get("/landlord/listing/eligible-units", {
    signal: options?.signal,
  });

// Cancel listing + payment session
export const cancelListingPaymentRequest = (
  listingId: string,
  options?: { signal?: AbortSignal }
) =>
  privateApi.delete(`/landlord/listing/${listingId}/cancel`, {
    signal: options?.signal,
  });

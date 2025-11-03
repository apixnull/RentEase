
// ---------------------- Unit ----------------------

import { privateApi } from "../axios";

// Get specific unit details
export const getUnitDetailsRequest = (unitId: string, options?: { signal?: AbortSignal }) =>
  privateApi.get(`/landlord/unit/${unitId}`, { signal: options?.signal });

// Create a new unit under a property
export const createUnitRequest = (
  propertyId: string,
  data: any,
  options?: { signal?: AbortSignal }
) =>
  privateApi.post(`/landlord/unit/${propertyId}/create`, data, { signal: options?.signal });
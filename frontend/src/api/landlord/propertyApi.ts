import { privateApi } from "../axios";
import { apiRoutes } from "../routes";

// ---------------------- Property ----------------------

// Get all amenities
export const getAmenitiesRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get(apiRoutes.landlord("/property/amenities"), { signal: options?.signal });

// Get all cities/municipalities
export const getCitiesAndMunicipalitiesRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get(apiRoutes.landlord("/property/city-municipality"), { signal: options?.signal });

// Create new property
export const createPropertyRequest = (data: any, options?: { signal?: AbortSignal }) =>
  privateApi.post(apiRoutes.landlord("/property/create"), data, { signal: options?.signal });

// Get all properties owned by landlord
export const getLandlordPropertiesRequest = (options?: { signal?: AbortSignal }) =>
  privateApi.get(apiRoutes.landlord("/property/properties"), { signal: options?.signal });

// Get specific property details
export const getPropertyDetailsAndUnitsRequest = (propertyId: string, options?: { signal?: AbortSignal }) =>
  privateApi.get(apiRoutes.landlord(`/property/${propertyId}`), { signal: options?.signal });



